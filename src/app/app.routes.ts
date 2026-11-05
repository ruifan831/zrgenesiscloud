import { Routes } from '@angular/router';
import { appDetailResolver } from './pages/app-detail/app-detail.resolver';

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

  // Historical URL prefix only. The API resolves the product slug/alias;
  // adding a product never requires adding a route here.
  { path: 'products/:slug',      redirectTo: 'apps/:slug',      pathMatch: 'full' },
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
