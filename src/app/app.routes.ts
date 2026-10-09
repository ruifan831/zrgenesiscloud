import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { appDetailResolver } from './pages/app-detail/app-detail.resolver';

/** The old receiving page has no app-scope contract. Explicit scope must stay here and fail closed. */
export function legacyReferralRedirectUrl(route: Pick<ActivatedRouteSnapshot, 'paramMap' | 'queryParamMap'>): string | null {
  if (route.queryParamMap.has('app_id')) return null;
  const userId = encodeURIComponent(route.paramMap.get('userId') ?? '');
  const url = new URL(`https://crewpilot.zrgenesiscloud.com/share/${userId}`);
  return url.href;
}

export const routes: Routes = [
  // ── 首页（App 画廊）────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
    data: { seo: { title: 'ZRGenesis · 我们做 App' } },
  },

  // ── App 详情页（动态路由）─────────────────────────────────────────────────
  {
    path: 'apps/:slug',
    loadComponent: () =>
      import('./pages/app-detail/app-detail.page').then((m) => m.AppDetailPage),
    resolve: { app: appDetailResolver },
  },

  // ── 旧 products/* → 新 apps/* 重定向（AC-7；pathMatch:'full' 防前缀吞噬）──
  { path: 'products/calendar',   redirectTo: 'apps/calendar',   pathMatch: 'full' },
  { path: 'products/vision-cue', redirectTo: 'apps/vision-cue', pathMatch: 'full' },
  { path: 'products/shanying',   redirectTo: 'apps/shanying',   pathMatch: 'full' },
  { path: 'products',            redirectTo: '',                pathMatch: 'full' },

  // ── /about → 首页（arch §8）──────────────────────────────────────────────
  { path: 'about', redirectTo: '', pathMatch: 'full' },

  // ── 隐私 / 协议（旧 URL 保留，不重定向）──────────────────────────────────
  {
    path: 'privacy',
    loadComponent: () =>
      import('./pages/privacy-index/privacy-index.page').then(
        (m) => m.PrivacyIndexPage
      ),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
      ),
  },

  // ── Contact（保留独立路由，arch §3.3）────────────────────────────────────
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact/contact.component').then((m) => m.ContactComponent),
  },

  // 旧邀请链接精确匹配优先，不被通用应用 slug 路由吞掉。
  {
    path: 'invite/r/:userId',
    pathMatch: 'full',
    canActivate: [(route: ActivatedRouteSnapshot) => {
      const target = legacyReferralRedirectUrl(route);
      if (!target) return true; // The generic page rejects this legacy URL because it has no product slug.
      window.location.replace(target);
      return false;
    }],
    loadComponent: () => import('./pages/referral-invite/referral-invite.component').then(m => m.ReferralInviteComponent),
    data: { showHeader: false, showFooter: false },
  },
  {
    path: 'invite/:slug',
    pathMatch: 'full',
    loadComponent: () => import('./pages/referral-invite/referral-invite.component').then(m => m.ReferralInviteComponent),
    data: { showHeader: false, showFooter: false },
  },

  // ── 法律文档 /legal/:slug ────────────────────────────────────────────────
  {
    path: 'legal/:product/:slug',
    loadComponent: () => import('./pages/legal/legal-doc.component').then((m) => m.LegalDocComponent),
    data: { showHeader: false, showFooter: false },
  },
  {
    path: 'legal/:slug',
    loadComponent: () =>
      import('./pages/legal/legal-doc.component').then((m) => m.LegalDocComponent),
    data: { showHeader: false, showFooter: false },
  },

  // ── 兜底：未知路径跳首页 ──────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];
