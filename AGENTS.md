# Public Site Project Instructions

## Overview

`zrgenesiscloud` is an Angular 17 standalone public-facing App showcase/download portal.
It uses Apple-style design tokens (no ng-zorro), SF Pro font stack, and custom SCSS token
system. It is **not** the admin front end (`zrgenesis-admin`).

## Data Source

App 营销内容从后端 HTTP API 拉取，**无静态配置文件**。

- `AppCatalogService` (`src/app/core/services/app-catalog.service.ts`) — 公共入口，返回 Observable。
- `PublicAppsClient` (`src/app/core/services/http/public-apps.client.ts`) — 封装 `GET /public/apps` 和 `GET /public/apps/{slug}`，做 snake_case→camelCase 映射，内置 30s 内存缓存（`shareReplay`）。
- 后端 API 前缀：`environment.apiBaseUrl + /public/apps`（dev=`http://localhost:8000/api/v1`，prod=`https://www.zrgenesiscloud.com/api/v1`）。
- **无 fallback 配置**：`src/app/data/apps.config.ts` 已删除（Wave 3 T-22）。若 API 挂掉，首页显示骨架屏 + 错误提示，详情页跳首页。

Admin 编辑入口：`/admin/system/app-registry/:id/marketing`（`zrgenesis-admin` 项目）

## Key Routes

- `/` → `HomeComponent` (`src/app/home/`) — App 画廊
- `/apps/:slug` → `AppDetailPage` (`src/app/pages/app-detail/`) — 详情页，用 resolver 处理 loading/404
- `/privacy` → `PrivacyIndexPage`
- `/privacy/calendar`, `/privacy/teleprompter` — 各 App 隐私协议页
- `/privacy-policy` → 通用隐私声明
- `/contact` → 极简联系页
- `/invite/calendar` → 邀请注册页（showHeader=false, showFooter=false）
- 旧路由 `/products/*` → 301 重定向到 `/apps/*`（见 `docs/nginx/zrgenesiscloud-redirects.conf`）

## Source Map

```
src/
├── app/
│   ├── app.component.ts        — 仅渲染 app-shell
│   ├── app.config.ts           — provideRouter, HttpClient
│   ├── app.routes.ts           — 全路由表（含 redirectTo）
│   ├── core/services/
│   │   ├── app-catalog.service.ts          — 公共服务入口（Observable 接口）
│   │   └── http/public-apps.client.ts      — HTTP 客户端 + DTO 映射
│   ├── models/app.model.ts     — AppEntry, DownloadChannel, AppFeature, AppTileTheme
│   ├── home/home.component.*  — 首页 App 画廊（async pipe + 骨架屏）
│   ├── pages/
│   │   ├── app-detail/         — /apps/:slug 详情页 + resolver + sections
│   │   ├── calendar-invite/    — 邀请注册页
│   │   └── privacy-index/      — /privacy 汇总页
│   ├── privacy/                — calendar / vision-cue 隐私组件
│   ├── privacy-policy/         — 通用隐私组件
│   ├── shared/
│   │   ├── tokens/             — SCSS design token system
│   │   ├── seo/meta.service.ts — SEO meta 设置服务
│   │   └── ui/                 — product-tile, hero-intro, platform-badge, button-*, global-nav, site-footer, sub-nav-frosted
│   └── layouts/app-shell/      — showHeader/showFooter 路由数据控制
├── environments/
│   ├── environment.ts          — apiBaseUrl=http://localhost:8000/api/v1
│   └── environment.prod.ts     — apiBaseUrl=https://www.zrgenesiscloud.com/api/v1
└── assets/images/              — calendar.png, shanying.png, screenshots（运营后可通过 admin 上传替换）
```

## Style System

- No ng-zorro. Token system: `src/app/shared/tokens/_tokens.scss` CSS Custom Properties.
- Surface classes: `surface--dark`, `surface--light`, `surface--parchment`, `surface--pearl`.
- Font: SF Pro text/display via `@font-face`.
- No decoration gradients except `--shadow-product` for product images.
- Focus ring: `outline: 2px solid var(--color-focus-ring); outline-offset: 2px` — no box-shadow for focus.

## Dev Notes

- `npm run start` — dev server（Angular default port）
- `npm run build` — production build（validates all imports）
- `npm run test` — Karma/Jasmine

## Known Pre-existing Test Failures (P2, not blocking)

- `AuthService` spec: no `HttpClientTestingModule` provider (P2-1)
- `AppDetailPage` spec: ActivatedRoute mock incomplete (P2-2)
- `ButtonPrimaryComponent` spec: Karma SCSS loader issue (P2-3)
