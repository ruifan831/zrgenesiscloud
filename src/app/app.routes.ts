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
    path: 'privacy/calendar',
    loadComponent: () =>
      import(
        './privacy/calendar-privacy/calendar-privacy.component'
      ).then((m) => m.CalendarPrivacyComponent),
  },
  {
    path: 'privacy/teleprompter',
    loadComponent: () =>
      import(
        './privacy/vision-cue-privacy/vision-cue-privacy.component'
      ).then((m) => m.VisionCuePrivacyComponent),
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

  // ── 邀请落地页（隐藏 nav/footer）─────────────────────────────────────────
  {
    path: 'invite/calendar',
    loadComponent: () =>
      import('./pages/calendar-invite/calendar-invite.component').then(
        (m) => m.CalendarInviteComponent
      ),
    data: { showHeader: false, showFooter: false },
  },

  // ── 法律文档 /legal/:slug ────────────────────────────────────────────────
  {
    path: 'legal/:slug',
    loadComponent: () =>
      import('./pages/legal/legal-doc.component').then((m) => m.LegalDocComponent),
    data: { showHeader: false, showFooter: false },
  },

  // ── 兜底：未知路径跳首页 ──────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];
