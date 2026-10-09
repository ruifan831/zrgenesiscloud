import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { PublicAppsClient } from '../core/services/http/public-apps.client';
import { AppEntry } from '../models/app.model';
import { ReferralInviteService, InvitePageData, inviteActions, parseInviteLocation, safeHttpsUrl } from './referral-invite.service';

const app = (id: string, slug: string) => ({ appId: id, slug, name: slug, platforms: [] } as unknown as AppEntry);
const routing = { base_url: 'https://www.zrgenesiscloud.com', referral_path: '/invite/huangli?app_id=calendar-id&code={inviteCode}', ios_scheme: 'chinesealmanc', ios_app_store_id: '12345', android_package: 'com.example.calendar', android_download_url: 'https://download.example/calendar.apk' };

describe('ReferralInviteService', () => {
  let service: ReferralInviteService;
  let http: HttpTestingController;
  let catalog: jasmine.SpyObj<PublicAppsClient>;
  beforeEach(() => {
    catalog = jasmine.createSpyObj('PublicAppsClient', ['getBySlug']);
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [{ provide: PublicAppsClient, useValue: catalog }] });
    service = TestBed.inject(ReferralInviteService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  function flushPage(appId: string, enabled = true) {
    for (const request of http.match(req => req.params.get('app_id') === appId)) {
      expect(request.request.headers.get('X-App-Id')).toBe(appId);
      const url = request.request.url;
      request.flush({ success: true, data: url.endsWith('/meta') ? { app_id: appId, features: { invitation_enabled: enabled }, invite_routing: routing } :
        url.endsWith('/legal-info') ? { privacy_policy_url: `https://example.com/${appId}/privacy`, user_agreement_url: `https://example.com/${appId}/terms` } : { nickname: '朋友', app_name: 'test', invite_message: 'test' } });
    }
  }

  for (const [slug, id] of [['huangli', 'calendar-id'], ['crewpilot', 'crew-id'], ['ticidashi', 'cue-id']]) {
    it(`loads ${slug} with one app scope across metadata, legal and invite-card`, () => {
      catalog.getBySlug.and.returnValue(of(app(id, slug)));
      let result: InvitePageData | undefined;
      service.load({ slug, appId: id, code: '9600123' }).subscribe(value => result = value);
      expect(catalog.getBySlug).toHaveBeenCalledOnceWith(slug);
      flushPage(id);
      expect(result?.appId).toBe(id);
      expect(result?.termsUrl).toContain(id);
      expect(result?.canonicalUrl).toContain(`/invite/${slug}?`);
      expect(result?.canonicalUrl).toContain(`app_id=${id}`);
    });
  }

  it('rejects mismatched marketing identity before reading scoped APIs', () => {
    catalog.getBySlug.and.returnValue(of(app('other-id', 'huangli')));
    let message = '';
    service.load({ slug: 'huangli', appId: 'calendar-id', code: '9600123' }).subscribe({ error: error => message = error.message });
    expect(message).toContain('不一致');
    http.expectNone(() => true);
  });

  it('uses the trusted marketing ID for a legacy link without app_id', () => {
    catalog.getBySlug.and.returnValue(of(app('calendar-id', 'huangli')));
    let result: InvitePageData | undefined;
    service.load({ slug: 'huangli', appId: null, code: '9600123' }).subscribe(value => result = value);
    flushPage('calendar-id');
    expect(result?.appId).toBe('calendar-id');
  });

  it('blocks a disabled invitation feature', () => {
    catalog.getBySlug.and.returnValue(of(app('calendar-id', 'huangli')));
    let message = '';
    service.load({ slug: 'huangli', appId: 'calendar-id', code: '9600123' }).subscribe({ error: error => message = error.message });
    flushPage('calendar-id', false);
    expect(message).toContain('暂未开放');
  });

  it('makes app actions available before legal loading finishes and keeps them if legal fails', () => {
    catalog.getBySlug.and.returnValue(of(app('calendar-id', 'huangli')));
    const results: InvitePageData[] = [];
    service.load({ slug: 'huangli', appId: 'calendar-id', code: '9600123' }).subscribe(value => results.push(value));
    http.expectOne(req => req.url.endsWith('/meta')).flush({ success: true, data: { app_id: 'calendar-id', features: { invitation_enabled: true }, invite_routing: routing } });
    http.expectOne(req => req.url.endsWith('/invite-card')).flush({ success: true, data: { nickname: '朋友' } });
    expect(results[0].legalLoading).toBeTrue();
    expect(results[0].androidOpenUrl).toContain('app_id=calendar-id&code=9600123');
    expect(results[0].privacyUrl).toBeNull();
    http.expectOne(req => req.url.endsWith('/legal-info')).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(results[1].legalLoading).toBeFalse();
    expect(results[1].androidOpenUrl).toBe(results[0].androidOpenUrl);
  });

  it('sends the existing login-purpose SMS payload with explicit scope', () => {
    service.sendCode('crew-id', '13800000000').subscribe();
    const request = http.expectOne(req => req.url.endsWith('/auth/send-verification-code'));
    expect(request.request.body).toEqual({ phone: '13800000000' });
    expect(request.request.params.get('app_id')).toBe('crew-id');
    expect(request.request.headers.get('X-App-Id')).toBe('crew-id');
    request.flush({ success: true });
  });

  it('submits the unchanged register body under the URL App ID', () => {
    service.accept('cue-id', '13800000000', '123456', '9600123').subscribe();
    const request = http.expectOne(req => req.url.endsWith('/rewards/referral/register'));
    expect(request.request.body).toEqual({ phone: '13800000000', verification_code: '123456', invite_code: '9600123' });
    expect(request.request.params.get('app_id')).toBe('cue-id');
    expect(request.request.headers.get('X-App-Id')).toBe('cue-id');
    request.flush({ success: true, data: { bound: true } });
  });
});

describe('Invite URL validation and routing', () => {
  const location = { slug: 'huangli', appId: 'calendar-id', code: '9600123' };
  it('rejects missing, empty, duplicate and malformed identity/code parameters', () => {
    for (const query of [{}, { code: '' }, { code: ['9600123', '9600456'] }, { code: '9600123', app_id: '' }, { code: '9600123', app_id: ['one', 'two'] }, { code: '../bad' }]) {
      expect(() => parseInviteLocation(convertToParamMap({ slug: 'huangli' }), convertToParamMap(query))).toThrow();
    }
  });
  it('builds package-scoped Android intent and the agreed iOS custom scheme', () => {
    const result = inviteActions(routing, location, 'calendar-id', 'https://www.zrgenesiscloud.com');
    expect(result.iosOpenUrl).toBe('chinesealmanc://invite/huangli?app_id=calendar-id&code=9600123');
    expect(result.androidOpenUrl).toBe('intent://www.zrgenesiscloud.com/invite/huangli?app_id=calendar-id&code=9600123#Intent;scheme=https;package=com.example.calendar;end');
    expect(result.androidDownloadUrl).toBe('https://download.example/calendar.apk');
  });
  it('preserves the configured trailing slash for AASA and exact native paths', () => {
    const result = inviteActions({ ...routing, referral_path: '/invite/huangli/?app_id=calendar-id&code={inviteCode}' }, location, 'calendar-id', 'https://www.zrgenesiscloud.com');
    expect(result.canonicalUrl).toBe('https://www.zrgenesiscloud.com/invite/huangli/?app_id=calendar-id&code=9600123');
    expect(result.iosOpenUrl).toBe('chinesealmanc://invite/huangli/?app_id=calendar-id&code=9600123');
    expect(result.androidOpenUrl).toContain('/invite/huangli/?app_id=calendar-id&code=9600123#Intent;');
  });

  for (const placeholder of ['{inviteCode}', '{userId}']) {
    it(`opens an existing /share/${placeholder} template without changing the product-page QR`, () => {
      const result = inviteActions({ ...routing, base_url: 'https://crewpilot.zrgenesiscloud.com', referral_path: `/share/${placeholder}`, ios_scheme: 'crewpilot', android_package: 'com.zrgenesiscloud.banguanjia' }, { slug: 'crewpilot', appId: 'crew-id', code: '9600123' }, 'crew-id', 'https://www.zrgenesiscloud.com');
      expect(result.canonicalUrl).toBe('https://www.zrgenesiscloud.com/invite/crewpilot?app_id=crew-id&code=9600123');
      expect(result.iosOpenUrl).toBe('crewpilot://share/9600123?app_id=crew-id');
      expect(result.androidOpenUrl).toBe('intent://crewpilot.zrgenesiscloud.com/share/9600123?app_id=crew-id#Intent;scheme=https;package=com.zrgenesiscloud.banguanjia;end');
    });
  }

  it('does not treat organization or conflicting legacy routes as friend-invite targets', () => {
    for (const referral_path of ['/invite/{token}', '/share/{inviteCode}?app_id=other-id', '/share/{inviteCode}?app_id=calendar-id&app_id=calendar-id', '/share/{inviteCode}?code=123', '/other/{inviteCode}']) {
      const result = inviteActions({ ...routing, referral_path }, location, 'calendar-id', 'https://www.zrgenesiscloud.com');
      expect(result.iosOpenUrl).toBeNull(); expect(result.androidOpenUrl).toBeNull();
    }
  });

  it('never turns missing routing into a different product or a guessed store', () => {
    const result = inviteActions(null, location, 'calendar-id', 'https://www.zrgenesiscloud.com');
    expect(result.iosOpenUrl).toBeNull();
    expect(result.androidOpenUrl).toBeNull();
    expect(result.iosDownloadUrl).toBeNull();
    expect(result.androidDownloadUrl).toBeNull();
  });
  it('rejects unsafe or conflicting open and download targets', () => {
    for (const referral_path of ['//evil.example/invite/huangli?code={inviteCode}', '/invite/crewpilot?code={inviteCode}', '/invite/huangli?app_id=other-id&code={inviteCode}']) {
      const result = inviteActions({ ...routing, referral_path, android_download_url: 'javascript:alert(1)', ios_scheme: 'javascript' }, location, 'calendar-id', 'https://www.zrgenesiscloud.com');
      expect(result.iosOpenUrl).toBeNull();
      expect(result.androidOpenUrl).toBeNull();
      expect(result.androidDownloadUrl).toBeNull();
    }
    for (const url of ['data:text/html,x', '//evil.example', 'https://user:pass@example.com', ' https://example.com', 'https://example.com\\evil']) expect(safeHttpsUrl(url)).toBeNull();
  });
});
