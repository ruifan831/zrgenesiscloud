import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ParamMap } from '@angular/router';
import { Observable, catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { PublicAppsClient } from '../core/services/http/public-apps.client';
import { AppEntry } from '../models/app.model';

interface Envelope<T> { success: boolean; message?: string; data?: T | null; }
export interface InviteRouting {
  base_url: string;
  referral_path: string;
  ios_scheme?: string;
  ios_app_store_id?: string;
  android_package?: string;
  android_download_url?: string;
}
interface AppMeta { app_id: string; features: { invitation_enabled: boolean }; invite_routing?: InviteRouting | null; }
interface LegalInfo { privacy_policy_url: string; user_agreement_url: string; }
interface InviteCard { nickname: string; app_name: string; invite_message: string; }
export interface ReferralResult { bound: boolean; reason: string | null; }
export interface SmsResult { success: boolean; message?: string; }
export interface InviteLocation { slug: string; appId: string | null; code: string; }
export interface InvitePageData {
  app: AppEntry;
  appId: string;
  code: string;
  nickname: string;
  privacyUrl: string | null;
  termsUrl: string | null;
  legalLoading?: boolean;
  canonicalUrl: string;
  iosOpenUrl: string | null;
  androidOpenUrl: string | null;
  iosDownloadUrl: string | null;
  androidDownloadUrl: string | null;
}
export class InvitePageError extends Error {
  constructor(message: string, readonly retryable = false) { super(message); }
}

export function parseInviteLocation(params: ParamMap, query: ParamMap): InviteLocation {
  const slug = params.get('slug') ?? '';
  const ids = query.getAll('app_id');
  const codes = query.getAll('code');
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug) || codes.length !== 1 || !/^[1-9]\d{0,19}$/.test(codes[0]) ||
      ids.length !== 0) {
    throw new InvitePageError('邀请链接不完整或无效，请重新打开朋友分享的完整链接。');
  }
  return { slug, appId: ids[0] ?? null, code: codes[0] };
}

/** Only web links from trusted API configuration; never permit credentials or executable schemes. */
export function safeHttpsUrl(value: string | null | undefined, origin?: string): string | null {
  if (!value || value !== value.trim() || /[\u0000-\u0020\\]/.test(value)) return null;
  try {
    const url = origin && value.startsWith('/') && !value.startsWith('//') ? new URL(value, origin) : new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function inviteActions(routing: InviteRouting | null | undefined, location: InviteLocation, appId: string, siteOrigin: string) {
  const localUrl = new URL(`/invite/${location.slug}`, siteOrigin);

  localUrl.searchParams.set('code', location.code);
  let canonicalUrl = localUrl.href;
  let linkedUrl: URL | null = null;
  const base = safeHttpsUrl(routing?.base_url);
  // Open only the configured current product path.
  if (base && routing?.referral_path.startsWith('/') && !routing.referral_path.startsWith('//')) {
    try {
      const path = routing.referral_path.replaceAll('{inviteCode}', encodeURIComponent(location.code));
      const url = new URL(path, base);
      const ids = url.searchParams.getAll('app_id');
      const validIdentity = url.origin === new URL(base).origin && !url.hash &&
        !/[{}]/.test(url.href) && ids.length === 0;
      const canonicalPath = [location.slug].some(slug => /^[a-z0-9][a-z0-9-]{0,63}$/.test(slug) && [`/invite/${slug}`, `/invite/${slug}/`].includes(url.pathname)) &&
        url.searchParams.getAll('code').length === 1 && url.searchParams.get('code') === location.code;
      if (validIdentity && canonicalPath) {
        if (canonicalPath && url.pathname.replace(/\/$/, "") === `/invite/${location.slug}`) canonicalUrl = url.href;
        linkedUrl = url;
      }
    } catch { /* Misconfigured routing does not become an open redirect. */ }
  }
  const scheme = routing?.ios_scheme ?? '';
  const packageName = routing?.android_package ?? '';
  const storeId = routing?.ios_app_store_id ?? '';
  const iosOpenUrl = linkedUrl && /^[a-z][a-z0-9+.-]*$/.test(scheme) && !['http', 'https', 'javascript', 'data', 'file', 'intent'].includes(scheme)
    ? `${scheme}://${linkedUrl.pathname.slice(1)}${linkedUrl.search}` : null;
  const androidOpenUrl = linkedUrl && /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName)
    ? `intent://${linkedUrl.host}${linkedUrl.pathname}${linkedUrl.search}#Intent;scheme=https;package=${packageName};end` : null;
  return {
    canonicalUrl, iosOpenUrl, androidOpenUrl,
    iosDownloadUrl: /^\d+$/.test(storeId) ? `https://apps.apple.com/app/id${storeId}` : null,
    androidDownloadUrl: safeHttpsUrl(routing?.android_download_url),
  };
}

export function inviteErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof InvitePageError) return error.message;
  if (error instanceof HttpErrorResponse) {
    const errors: Record<string, string> = { APP_ID_REQUIRED: '邀请应用信息缺失，请重新打开完整链接。', APP_SCOPE_MISMATCH: '邀请链接中的应用信息不一致，请重新打开完整链接。', APP_NOT_AVAILABLE: '该应用暂不可用。', INVITATION_DISABLED: '该应用暂未开放好友邀请。' };
    const errorCode = error.error?.detail;
    if (typeof errorCode === 'string' && errors[errorCode]) return errors[errorCode];
    if (error.status === 429) return '操作过于频繁，请稍后再试。';
    if (error.status === 0) return '网络连接失败，请检查网络后重试。';
    if (error.status === 404) return '邀请链接无效，应用或邀请人不存在。';
    if (error.status === 403) return '该应用暂未开放好友邀请。';
    const detail = error.error?.detail ?? error.error?.message;
    if (typeof detail === 'string' && /[\u3400-\u9fff]/.test(detail)) return detail;
  }
  return fallback;
}

function unwrap<T>(envelope: Envelope<T>): T {
  if (!envelope.success || !envelope.data) throw new InvitePageError('邀请资料暂时无法加载，请重试。', true);
  return envelope.data;
}

@Injectable({ providedIn: 'root' })
export class ReferralInviteService {
  private readonly http = inject(HttpClient);
  private readonly apps = inject(PublicAppsClient);
  private readonly document = inject(DOCUMENT);
  private readonly base = environment.apiBaseUrl;

  load(location: InviteLocation): Observable<InvitePageData> {
    return this.apps.getBySlug(location.slug).pipe(switchMap(app => {
      if (!app) throw new InvitePageError('该应用的邀请页面暂不可用。');
      if (!app.appId || !/^[a-zA-Z0-9_-]{1,64}$/.test(app.appId)) throw new InvitePageError('该应用的邀请资料尚未配置完整。');
      if (location.appId || location.slug !== app.slug) throw new InvitePageError('邀请链接已失效，请让朋友重新分享。');
      const appId = app.appId;
      const options = this.scope(appId);
      return combineLatest({
        meta: this.http.get<Envelope<AppMeta>>(`${this.base}/app/meta`, options).pipe(map(unwrap)),
        legal: this.http.get<Envelope<LegalInfo>>(`${this.base}/public/legal-info`, options).pipe(
          map(unwrap),
          map(info => ({ info, loading: false })),
          catchError(() => of({ info: null, loading: false })),
          startWith({ info: null, loading: true }),
        ),
        card: this.http.get<Envelope<InviteCard>>(`${this.base}/rewards/public/users/${encodeURIComponent(location.code)}/invite-card`, options).pipe(map(unwrap)),
      }).pipe(map(({ meta, legal, card }) => {
        if (meta.app_id !== appId) throw new InvitePageError('邀请应用配置不一致，请稍后重试。');
        if (!meta.features?.invitation_enabled) throw new InvitePageError('该应用暂未开放好友邀请。');
        const origin = this.document.location.origin;
        const privacyUrl = safeHttpsUrl(legal.info?.privacy_policy_url, origin);
        const termsUrl = safeHttpsUrl(legal.info?.user_agreement_url, origin);
        const installer = app.platforms.find(channel => channel.source === 'app_installer' && channel.available !== false);
        const apk = app.platforms.find(channel => channel.type === 'apk' && channel.available !== false);
        const routing = meta.invite_routing ? {
          ...meta.invite_routing,
          android_download_url: installer?.url || meta.invite_routing.android_download_url || apk?.url,
        } : meta.invite_routing;
        return { app, appId, code: location.code, nickname: card.nickname, privacyUrl, termsUrl, legalLoading: legal.loading,
          ...inviteActions(routing, app.productKey ? { ...location, slug: app.slug } : location, appId, origin) };
      }));
    }));
  }

  sendCode(appId: string, phone: string): Observable<SmsResult> {
    // This existing endpoint deliberately uses the backend's login purpose for both new and existing accounts.
    return this.http.post<SmsResult>(`${this.base}/auth/send-verification-code`, { phone }, this.scope(appId));
  }

  accept(appId: string, phone: string, verificationCode: string, inviteCode: string): Observable<Envelope<ReferralResult>> {
    return this.http.post<Envelope<ReferralResult>>(`${this.base}/rewards/referral/register`,
      { phone, verification_code: verificationCode, invite_code: inviteCode }, this.scope(appId));
  }

  private scope(appId: string) {
    return { params: { app_id: appId }, headers: new HttpHeaders({ 'X-App-Id': appId }) };
  }
}
