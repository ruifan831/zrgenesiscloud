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

Admin 编辑入口：`/admin/system/products/:productKey/marketing`（旧App入口按归属跳转产品）（`zrgenesis-admin` 项目）

## Key Routes

- `/` → `HomeComponent` (`src/app/home/`) — App 画廊
- `/apps/:slug` → `AppDetailPage` (`src/app/pages/app-detail/`) — 详情页，用 resolver 处理 loading/404
- `/privacy` → `PrivacyIndexPage`
- `/legal/<product>/privacy/`, `/legal/<product>/terms/` — 注册产品法律页
- `/privacy-policy` → 通用隐私声明
- `/contact` → 极简联系页
- `/invite/:slug?code=<数字邀请码>` → 通用好友邀请页（showHeader=false, showFooter=false）
- 旧前缀 `/products/:slug` → `/apps/:slug`，仅兼容历史URL；产品列表/slug/别名均取后端，不增加逐产品路由。`/products`、`/about` 只保留到首页的兼容跳转。Angular处理站内导航，Nginx片段负责HTTP301（见 `../docs/nginx/zrgenesiscloud-redirects.conf`，是否部署须另核对）。

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
│   │   ├── referral-invite/    — 通用好友邀请页
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

## Test Status

2026-11-04 官网全量 ChromeHeadless 146 项、法律构建脚本 5 项及生产构建通过。此前14项目录定时器、路由依赖、OnPush输入与脚手架断言失败已修复，无跳过用例；旧 AppDetailPage 测试债也已由当前路由测试覆盖。详见 `docs/qa/full-suite-2026-11-04.md`。本地全绿不代表已部署生产。

## 应用法律页

遵循工作区 [应用法律页 SOP](../sop/app-legal-pages.md)。所有新App使用`src/assets/legal/<product>/{privacy,terms}.md`，在`products.json`登记后复用Angular通用路由与预渲染。URL统一`/legal/<product>/{privacy,terms}/`；npm run build生成完整HTML，只上传browser，无生产Node。黄历/提词器已采用且旧链接兼容已移除。

## 文档导航

项目资料见 [文档索引](docs/README.md)；公共规范见 [SOP](../sop/README.md)。

## 新对话启动入口

开始本项目任务前，必须读取工作区根 [AGENTS.md](../AGENTS.md)，执行其中“每次新对话的启动流程”，并读取 [SOP 索引](../sop/README.md) 后选择相关规范。项目文档入口为 [docs/README.md](docs/README.md)，最近开发记录为 `.codex/task-log.md`；如有 `.codex/context.md`，先读当前交接摘要。

若项目被单独克隆或位于独立 worktree，导致上述相对路径不存在，先定位包含 `sop/README.md` 的 zr 工作区；当前本机位置为 `/Users/ruifanxu/Workspace/active/zr`。无法访问时明确说明缺失，不假装已加载规范。不要把本项目作为 Git 根时自动加载父工作区指令视为前提。

## 好友邀请

遵循[产品邀请契约](../docs/platform/product-invitation-codes.md)。当前产品 slug + 数字 mask/userId 码确定邀请，URL 不传 App ID；API 使用产品详情返回的发行 App ID。旧 App scoped 链接、旧邀请 slug、/share 与 /invite/r 重定向不再承接。营销展示页别名独立保留。routing 负责当前原生路径及下载，禁止硬编码产品默认 ID 或商店地址。
