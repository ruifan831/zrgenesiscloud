# 架构方案：zrgenesiscloud 应用宣传站重构

- 文档状态：v1.0（draft，可执行）
- 日期：2026-05-17
- 作者：architect
- 上游 PRD：`zrgenesiscloud/docs/prd/zrgenesiscloud-app-showcase.md`
- 下游：developer 按 T-1 → T-N 顺序实现；designer 按本方案中"设计 token / 组件 API"的契约出原型

---

## 0. 技术决策摘要（TL;DR）

| 决策项 | 选择 | 关键理由 |
|---|---|---|
| 项目脚手架 | 在现有 `zrgenesiscloud` 仓库内**渐进重构**，不另起新工程 | 保留旧 `/privacy/calendar`、`/privacy/teleprompter` 原 URL 内容、保留 Angular 17 + standalone + `apiBaseUrl` 体系；新旧组件可并存到切换完成 |
| UI 库 | **彻底弃用 ng-zorro 组件**，保留 `@angular/cdk`（仅用 layout / a11y / overlay 等无样式 primitives） | Apple 极简设计语言与 antd 视觉冲突；ng-zorro 全套样式与 token 体系无法 override 到 Apple 风；C 端站无表单/表格密集场景，CDK + 原生 HTML 足够 |
| 样式方案 | **纯 SCSS + 设计 token（CSS Custom Properties）**，不引入 Tailwind | designer 用 Tailwind 出原型只是为了快速试色，落地不需要运行时；Tailwind 会引入 PostCSS 工具链与 utility-class 噪音，与现有 SCSS 体系混搭成本高；纯 SCSS + token 即可还原 100% 视觉 |
| 数据来源 | 写死 TS 配置 `src/app/data/apps.config.ts`，由 `AppCatalogService` 暴露 | PRD 14.3 明确 MVP 不接 admin API；接口形态对齐 admin `app_registry.platform` 枚举，Later 可替换为 HTTP 调用而不改消费方 |
| 路由 | 新增 `/apps/:slug` 动态路由 + `/products/*` `redirectTo` + `/privacy/*` 保留 | PRD 第 4 节信息架构；客户端 `redirectTo` 满足 AC-7，配合 Nginx 301 兜底 SEO |
| 隐私页内容 | 沿用现有 `calendar-privacy.component` / `vision-cue-privacy.component`（只换 header/footer 壳） | 内容稳定、保留 URL，避免迁移 markdown 引入额外构建链 |
| 测试 | Karma/Jasmine（已有），新增 spec 聚焦路由跳转 + 重定向 + 详情页字段渲染；不引入 Playwright | MVP 体量小，引入 e2e 收益小于维护成本；旧 URL 兼容用 Router 测试即可覆盖 |

---

## 1. 影响范围

```
zrgenesiscloud/
├── package.json                   改：移除 ng-zorro-antd / @ant-design/icons-angular，保留 @angular/cdk
├── angular.json                   改：移除 theme.less 与 ant-design icons assets
├── src/styles.scss                改：作为 token + reset + 全站基础排版入口
├── src/theme.less                 删
├── src/styles/shared.scss         删（与 ng-zorro 强耦合，用新 token 体系替代）
├── src/app/app.config.ts          改：移除 provideNzI18n / registerLocaleData(zh)（保留 Angular 自身 LOCALE_ID 'zh-Hans'）
├── src/app/app.routes.ts          改：见 §3
├── src/app/app.component.html     改：使用新 layout shell
├── src/app/
│   ├── data/                      新：apps.config.ts（单源数据）
│   ├── models/                    新：app.model.ts、platform.model.ts、feature.model.ts
│   ├── core/services/             新：AppCatalogService
│   ├── layouts/                   新：site-shell（全局 nav + footer 容器）
│   ├── pages/
│   │   ├── home/                  改：从公司 hero 改为 App 画廊
│   │   ├── app-detail/            新：/apps/:slug
│   │   ├── privacy-index/         新：/privacy 汇总页
│   │   ├── privacy/calendar/      迁：从 src/app/privacy/calendar-privacy/
│   │   ├── privacy/teleprompter/  迁：从 src/app/privacy/vision-cue-privacy/
│   │   ├── privacy-policy/        改：套新 shell
│   │   └── contact/               改：精简成单屏，或合并入 footer（见 §3.3）
│   ├── shared/
│   │   ├── ui/                    新：button / pill / platform-badge / product-tile / sub-nav / search-input / product-image / nav-bar / footer
│   │   ├── tokens/                新：_tokens.scss / _typography.scss / _surfaces.scss / _spacing.scss
│   │   └── seo/                   新：MetaService（设置 title/description/og）
│   └── products/                  删（迁移完成后整个目录移除）
└── src/assets/images/             保留现有 calendar.png/shanying.png 等；新增缺失资产由业务方提供
```

调用链：

```
HomePage ──► AppCatalogService.list()  ──► APPS (apps.config.ts)
   │                                          ▲
   ▼                                          │
ProductTileComponent (×N) ───── @Input app ───┘

AppDetailPage ──► AppCatalogService.getBySlug(slug) ──► APPS
       │
       ├──► SubNavComponent
       ├──► HeroSection
       ├──► PlatformDownloadGrid (PlatformBadge ×N)
       ├──► FeatureGrid (FeatureCard ×N)
       └──► LegalLinks
```

---

## 2. 数据模型

### 2.1 TypeScript 接口（`src/app/models/app.model.ts`）

```ts
// 与后端 doonook-common 的 app_registry.platform 枚举对齐
export type AppPlatformType = 'android' | 'ios' | 'miniprogram' | 'web';

// 平台徽章视觉变体；platform-badge 组件根据它决定样式与图标
export type PlatformBadgeStyle =
  | 'appstore'      // App Store 黑底白字
  | 'google-play'   // Google Play 黑底白字
  | 'apk'           // 官网 APK 直链（中性灰）
  | 'tencent-myapp' // 应用宝
  | 'wechat-mp'     // 微信小程序
  | 'web';          // 通用 Web 入口

export interface DownloadChannel {
  type: AppPlatformType;
  label: string;            // 显示文案，如 "App Store"、"应用宝"
  url: string;              // 跳转地址
  badge: PlatformBadgeStyle;
  /** 是否在首页 tile 的"立即下载" CTA 中作为默认外链（一个 App 至多一个 primary） */
  primary?: boolean;
}

export interface AppFeature {
  title: string;            // 6–12 字
  description: string;      // 20–60 字
  icon: string;             // 图标 key（见 §6 图标方案）
}

export type AppTileTheme = 'light' | 'parchment' | 'dark';

export interface AppEntry {
  slug: string;             // URL 标识：calendar | vision-cue | shanying
  name: string;             // 全民万年黄历通
  tagline: string;          // ≤10 字
  subtitle: string;         // 20–40 字
  description: string;      // 80–200 字
  heroImage: string;        // /assets/images/calendar.png
  detailImages?: string[];
  platforms: DownloadChannel[];
  features: AppFeature[];
  privacyUrl?: string;      // /privacy/calendar
  termsUrl?: string;
  publishedAt?: string;     // YYYY-MM-DD
  updatedAt?: string;
  tileTheme: AppTileTheme;
  /** 详情页 meta */
  seo?: { title?: string; description?: string; ogImage?: string };
}
```

### 2.2 单源数据文件（`src/app/data/apps.config.ts`）

```ts
import { AppEntry } from '../models/app.model';

export const APPS: ReadonlyArray<AppEntry> = [
  {
    slug: 'calendar',
    name: '全民万年黄历通',
    tagline: '一本随身的黄历',
    subtitle: '...',
    description: '...',
    heroImage: '/assets/images/calendar.png',
    detailImages: [
      '/assets/images/calendar-screenshot-1.jpg',
      // ...
    ],
    tileTheme: 'parchment',
    platforms: [
      { type: 'android', label: '应用宝', badge: 'tencent-myapp',
        url: 'https://sj.qq.com/appdetail/com.zrgenesiscloud.chinesealmanc',
        primary: true },
    ],
    features: [/* 由 developer 从旧 calendar.component 迁移 */],
    privacyUrl: '/privacy/calendar',
    publishedAt: '2024-01-01',
  },
  // vision-cue / shanying ...
];

export const APP_SLUGS = APPS.map(a => a.slug);
```

### 2.3 `AppCatalogService`（`src/app/core/services/app-catalog.service.ts`）

接口（不实现）：

```ts
@Injectable({ providedIn: 'root' })
export class AppCatalogService {
  list(): ReadonlyArray<AppEntry>;
  getBySlug(slug: string): AppEntry | undefined;
  /** Later: 替换为 HTTP 调用 app_registry；MVP 直接返回静态数据 */
}
```

Later 升级路径：保持方法签名不变，将内部实现切换为 `HttpClient.get('/api/v1/admin/apps')` 即可，消费方零改动。

---

## 3. 路由与 URL 兼容

### 3.1 新路由表（`src/app/app.routes.ts`）

```ts
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    data: { seo: { title: 'ZRGenesis · 我们做 App' } } },

  // 新详情页（动态路由 + 静态 slug 校验由组件内 resolver/guard 处理）
  { path: 'apps/:slug', loadComponent: () =>
      import('./pages/app-detail/app-detail.page').then(m => m.AppDetailPage) },

  // 旧 → 新 重定向（满足 AC-7；pathMatch:'full' 防止前缀吞噬）
  { path: 'products/calendar',    redirectTo: 'apps/calendar',    pathMatch: 'full' },
  { path: 'products/vision-cue',  redirectTo: 'apps/vision-cue',  pathMatch: 'full' },
  { path: 'products/shanying',    redirectTo: 'apps/shanying',    pathMatch: 'full' },
  { path: 'products',             redirectTo: '',                 pathMatch: 'full' },
  { path: 'about',                redirectTo: '',                 pathMatch: 'full' },

  // 隐私 / 协议
  { path: 'privacy', loadComponent: () =>
      import('./pages/privacy-index/privacy-index.page').then(m => m.PrivacyIndexPage) },
  { path: 'privacy/calendar', loadComponent: () =>
      import('./pages/privacy/calendar/calendar-privacy.page').then(m => m.CalendarPrivacyPage) },
  { path: 'privacy/teleprompter', loadComponent: () =>
      import('./pages/privacy/teleprompter/teleprompter-privacy.page').then(m => m.TeleprompterPrivacyPage) },
  { path: 'privacy-policy', loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy.page').then(m => m.PrivacyPolicyPage) },

  // Contact（如 PM 决定保留独立路由；否则合并入 footer 后删）
  { path: 'contact', loadComponent: () =>
      import('./pages/contact/contact.page').then(m => m.ContactPage) },

  // 邀请落地页（保留）
  { path: 'invite/calendar', loadComponent: () =>
      import('./pages/calendar-invite/calendar-invite.page').then(m => m.CalendarInvitePage),
    data: { showHeader: false, showFooter: false } },

  { path: '**', redirectTo: '' },
];
```

### 3.2 客户端重定向 vs 服务端 301

- 客户端 `redirectTo`：访问 `/products/calendar` 时由 Angular Router 替换为 `/apps/calendar`，浏览器地址栏正确、用户体验无中断（满足 AC-7 "客户端等效重定向"）
- 但客户端重定向对**已被搜索引擎索引的旧 URL**返回的是 200 而非 301，长期对 SEO 不友好
- 推荐：**两层兜底**
  - 应用层：Router `redirectTo` 兜底（无论部署环境如何都生效）
  - 部署层（Nginx）：增加 `location = /products/calendar { return 301 /apps/calendar; }` 等 5 条 301 规则。该改动写入 `docs/decisions.md` 与运维清单，由 deploy 阶段执行；架构层只声明需求，不写 nginx 配置（Nginx 当前由 zrgenesiscloud 站点的反代提供，参考 reference_doonook_server_layout）

> 重定向规则清单（交付给运维 / 写入仓库根 `nginx/` 目录的 conf snippet）：
>
> | 旧路径 | 新路径 | 状态码 |
> |---|---|---|
> | /products/calendar | /apps/calendar | 301 |
> | /products/vision-cue | /apps/vision-cue | 301 |
> | /products/shanying | /apps/shanying | 301 |
> | /products | / | 301 |
> | /about | / | 301 |

### 3.3 Contact 路由保留与否（PRD Q4）

architect 决定：**保留 `/contact` 作为极简单屏**（邮件 + 二维码），同时在 footer 提供同样的联系入口。理由：现有 `contact-qrcode.png` 已存在，删路由会丢已传播链接；保留成本极低。

---

## 4. 页面组件拆分

### 4.1 全站 Shell

| 组件 | 路径 | 职责 |
|---|---|---|
| `AppShellComponent` | `src/app/layouts/app-shell/` | 包裹 `<router-outlet>`；根据 `route.data.showHeader/showFooter` 决定 nav/footer 渲染 |
| `GlobalNavComponent` | `src/app/shared/ui/global-nav/` | 顶部 nav：Logo、App 列表入口（横排 pill 或下拉）、移动端汉堡。支持透明 / 不透明两种态（详情页是磨砂玻璃） |
| `SiteFooterComponent` | `src/app/shared/ui/site-footer/` | 公司名、版权、ICP、隐私链接、联系入口、各 App 快速链接 |
| `SubNavFrostedComponent` | `src/app/shared/ui/sub-nav-frosted/` | 详情页二级 nav（Apple "iPhone 15" 子导航风格）：App 名 + 下载锚点 |

### 4.2 首页 `HomePage`

```
HomePage
├── HeroIntroComponent           // 首屏：Logo + 极简 slogan（无大企业 hero，符合 AC-2）
└── ProductTileComponent ×N      // 每款 App 一个全屏 tile，theme=light/parchment/dark 交替（AC-12）
    ├── eyebrow / tagline / subtitle
    ├── ButtonPrimaryComponent  ("了解更多" → /apps/:slug)
    ├── ButtonSecondaryPillComponent  ("立即下载" → platforms[primary].url)
    └── ProductImageShadowComponent  (产品图，含唯一阴影规则)
```

### 4.3 详情页 `AppDetailPage`

```
AppDetailPage  (resolve(slug)→AppEntry，找不到则 router.navigate('/'))
├── SubNavFrostedComponent
├── AppHeroSection                // 名称 + tagline + 平台徽章排 + 主图
├── PlatformDownloadGridComponent // 按 type 分组展示 DownloadChannel
│   └── PlatformBadgeComponent ×N
├── FeatureGridComponent
│   └── FeatureCardComponent ×N
├── ScreenshotGalleryComponent?   // detailImages 存在时渲染
├── LegalLinksComponent           // privacyUrl + termsUrl
└── RelatedAppsStripComponent     // "查看其他 App"
```

### 4.4 隐私汇总页 `PrivacyIndexPage`

- `AppCatalogService.list()` → 按 App 渲染分组卡片
- 每组列出 `privacyUrl` / `termsUrl` 链接
- 顶部独立链接：`/privacy-policy`（公司层面）

### 4.5 单 App 隐私页（迁移）

- 沿用现有 HTML 内容（`calendar-privacy.component.html` / `vision-cue-privacy.component.html`）
- 仅替换外层壳：使用新的 `SiteShell` + `SiteFooter`
- 移除 ng-zorro 依赖（如有），全部用原生 HTML + 新 token 排版

---

## 5. UI 库与样式策略

### 5.1 弃用 ng-zorro 的具体动作

| 当前用到 ng-zorro 的位置 | 替换方案 |
|---|---|
| `HeaderComponent` 的 NzLayoutModule / NzMenuModule / NzDrawerModule | 自写 `GlobalNavComponent`，移动端抽屉用 `@angular/cdk/overlay` 或原生 `<dialog>` + CSS transition |
| `provideNzI18n(zh_CN)` | 移除；Angular 自带 `LOCALE_ID = 'zh-Hans'`，i18n key 由自定义 `I18nService` 在 Later 阶段处理 |
| `src/theme.less` + ant-design icons | 全删；图标方案见 §6 |
| `@ant-design/icons-angular` 的 inline-svg assets | 从 `angular.json.assets` 移除 |
| `karma test styles` 里 `@angular/material/prebuilt-themes/...` | 移除（这是历史遗留无效引用） |

### 5.2 Tailwind？不引入

- designer 用 Tailwind 出原型只为视觉调试，原型交付时把 utility class 翻译成 SCSS 即可
- 引入 Tailwind 需配 `tailwind.config.js` + PostCSS + content 扫描，与 Angular 17 的 standalone + SCSS 体系混用增加构建时间与心智负担
- 现有团队熟悉 SCSS，Apple 设计语言的"组件少 + 排版强 + token 重"特征天然适合 SCSS + CSS Custom Properties

### 5.3 全局样式入口

- `src/styles.scss`：
  ```scss
  @use 'app/shared/tokens/tokens';        // 颜色 / 字号 / 间距 / 阴影 / radius 变量
  @use 'app/shared/tokens/reset';         // 极简 reset（移除浏览器默认 margin、box-sizing）
  @use 'app/shared/tokens/typography';    // SF Pro 字体栈 + h1~h6 + body
  @use 'app/shared/tokens/surfaces';      // .surface-light / .surface-parchment / .surface-dark 三套 tile 表面
  @use 'app/shared/tokens/utilities';     // .container / .stack / .row 等极少量布局工具
  ```

---

## 6. 设计 Token 落地

### 6.1 Token 文件结构

```
src/app/shared/tokens/
├── _tokens.scss        // :root { --color-*, --space-*, --radius-*, --shadow-*, --duration-* }
├── _reset.scss
├── _typography.scss    // SF Pro Display / SF Pro Text 字体栈 fallback
├── _surfaces.scss      // .surface-light / .surface-parchment / .surface-dark
├── _utilities.scss
└── tokens.ts           // 同名 TS 常量（仅给 TS 业务逻辑用，如 ChartColor）
```

### 6.2 Token 命名约定（CSS Custom Properties）

| 类别 | 命名 | 示例值 |
|---|---|---|
| Brand accent | `--color-accent` | `#0066cc`（唯一动作色） |
| Surfaces | `--surface-light`, `--surface-parchment`, `--surface-dark` | `#fff`、`#f5efe6`、`#1d1d1f` |
| Text | `--text-on-light`, `--text-on-light-muted`, `--text-on-dark`, `--text-on-dark-muted` | `#1d1d1f` / `#86868b` / `#f5f5f7` / `#a1a1a6` |
| Type scale | `--font-display-1` (5rem) `--font-display-2` (3.5rem) `--font-headline` (2rem) `--font-body` (1.0625rem) `--font-caption` (0.8125rem) | — |
| Spacing | `--space-1` 4px → `--space-12` 96px（4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 …） | — |
| Radius | `--radius-pill` 999px, `--radius-tile` 18px, `--radius-card` 12px | — |
| Shadow | `--shadow-product` (唯一允许的阴影；产品图悬浮投影) | `0 30px 60px -20px rgba(0,0,0,.25)` |
| Motion | `--duration-fast` 150ms, `--duration-base` 240ms, `--easing-standard` cubic-bezier(.4,0,.2,1) | — |

> 设计语言要求"唯一阴影只用于产品图" —— token 体系仅暴露 `--shadow-product`，**不提供** card-shadow / hover-shadow，从机制上禁止开发者乱加阴影。

### 6.3 表面色（surface）作为 context

```scss
.surface-light  { background: var(--surface-light);     color: var(--text-on-light); }
.surface-parchment { background: var(--surface-parchment); color: var(--text-on-light); }
.surface-dark   { background: var(--surface-dark);      color: var(--text-on-dark); }
```

按钮、徽章等组件内部用 `currentColor` + `:where(.surface-dark) &` 选择器自适应明暗，避免每个组件手写两套配色。

---

## 7. 共享 UI 组件清单

所有组件都是 **standalone + OnPush**。命名前缀 `ui-`。

| 组件 | 选择器 | Inputs | Outputs | 样式入口 |
|---|---|---|---|---|
| `ButtonPrimaryComponent` | `<ui-button-primary>` | `label`, `href?`, `routerLink?`, `size: 'md'\|'lg'`, `disabled?` | `clicked` | shape: pill；底色 `--color-accent`；hover 减 8% 亮度；明暗表面自适应 |
| `ButtonSecondaryPillComponent` | `<ui-button-secondary>` | 同上 | 同上 | 透明底 + 1px outline + accent text；dark surface 下 outline=text-on-dark |
| `PlatformBadgeComponent` | `<ui-platform-badge>` | `badge: PlatformBadgeStyle`, `label`, `href`, `subLabel?` | `clicked` | 按 badge 类型渲染：appstore/google-play 用官方资产 svg；apk/wechat-mp/tencent-myapp/web 用本站统一极简变体 |
| `ProductTileComponent` | `<ui-product-tile>` | `app: AppEntry`, `align: 'left'\|'right'`, `theme: AppTileTheme` | `primaryCta`, `secondaryCta` | 全屏高度；min-height: 100vh / 移动端 auto；hosts `.surface-*` class |
| `ProductImageShadowComponent` | `<ui-product-image>` | `src`, `alt`, `aspect?: number` | — | 包装 `<img>`，应用唯一 `--shadow-product` |
| `GlobalNavComponent` | `<ui-global-nav>` | `transparentOnTop?: boolean`, `mode: 'default'\|'frosted'` | — | `position: fixed`；frosted=backdrop-filter blur(20px)；移动端汉堡 |
| `SubNavFrostedComponent` | `<ui-sub-nav>` | `appName`, `links: { label; fragment }[]`, `cta?: { label; href }` | — | sticky; backdrop-filter blur |
| `SiteFooterComponent` | `<ui-site-footer>` | — | — | 读取 `AppCatalogService.list()` 渲染快速链接；ICP / 公司名 / 联系邮箱写在 footer 模板 |
| `SearchInputComponent`（可选 Later） | `<ui-search-input>` | `placeholder`, `value` | `valueChange` | 极简圆角；MVP 阶段可不上 |
| `FeatureCardComponent` | `<ui-feature-card>` | `feature: AppFeature` | — | 仅排版（icon + title + desc），无 hover 阴影 |
| `PlatformDownloadGridComponent` | `<ui-platform-grid>` | `channels: DownloadChannel[]` | — | 按 `type` 分组（android / ios / miniprogram / web），同组并列 badge |

### 7.1 图标方案（替代 nz-icon）

- **不引入 icon library**。Feature icon 用业务方提供的 SVG 资产（每款 App 自带）放 `src/assets/icons/<slug>/<icon-name>.svg`，通过 `<img>` 引用
- nav 与 ui 内部用到的少量通用 icon（hamburger / arrow-right / close / external-link）以**内联 SVG**写在对应组件模板里，约 5–8 个，控制在组件文件内
- 平台徽章的 App Store / Google Play 用 Apple/Google 官方下载徽章 PNG（业务方需提供合规版本）

---

## 8. 旧 URL 兼容（详细）

> 2026-11-04 当前实现：站内产品入口只使用后端返回的 `/apps/<product.slug>`，不再生成旧 `/products/...`；关于入口为首页 `#about`。三条逐产品 redirect 已合并成一个 `products/:slug → apps/:slug`，后端负责判断有效产品与旧 slug 别名，新增产品无需改路由。`/products`、`/about` 仅保留历史访问入口；未知 slug 按详情页404策略回首页。Nginx参考片段位于工作区 `docs/nginx/zrgenesiscloud-redirects.conf`，保留查询参数，未在本轮部署生产。没有访问日志，不能认定外部旧URL流量为零。


| 旧 URL | 处理 | 责任层 |
|---|---|---|
| `/products/:slug` | 通用 redirectTo `/apps/:slug`；示例 calendar / vision-cue / shanying，不维护产品名单 | Router + Nginx 301 |
| `/products` | redirectTo `/` | Router + Nginx 301 |
| `/about` | redirectTo `/` | Router + Nginx 301 |
| `/privacy/calendar` | 保留（内容迁移到新组件，URL 不变） | 组件层 |
| `/privacy/teleprompter` | 保留 | 组件层 |
| `/privacy-policy` | 保留 | 组件层 |
| `/invite/calendar` | 保留 | 组件层 |
| 任意未知路径 `**` | redirectTo `/` | Router |

**Angular `redirectTo` 限制说明**：Router 的 redirect 只在客户端 JS 加载后生效；首次请求被 Nginx 转给 `index.html` 时浏览器 URL 仍是旧路径，搜索引擎抓取看到的是 200。为了让搜索引擎正确处理迁移，必须配 Nginx 层 301。这条作为**部署侧依赖**写入任务 T-9。

---

## 9. 资产管理

| 资产 | 状态 | 备注 |
|---|---|---|
| `assets/images/calendar.png` | 复用 | 首页 tile + 详情页 hero |
| `assets/images/calendar-screenshot-{1..4}.jpg` | 复用 | 详情页 detailImages |
| `assets/images/shanying.png` | 复用 | 同上 |
| `assets/images/shanying-screenshot-{1..4}.jpg` | 复用 | 同上 |
| `assets/images/vision-cue.png` | **缺失** | 需业务方提供 |
| `assets/images/vision-cue-screenshot-*.jpg` | **缺失** | 需业务方提供 |
| `assets/images/contact-qrcode.png` | 复用 | Contact 页 |
| `assets/images/pattern.png` | 删 | 旧 hero 装饰底纹，不再使用 |
| App Store / Google Play 官方徽章 PNG | **缺失** | 业务方下载合规版本 |
| ZRGenesis logo（亮/暗双版本） | **可能缺失** | nav 在不同表面上需要白色/黑色两版 |
| 各 App feature icon SVG | **缺失** | 与 designer 协作，从原型切图 |

**命名规范**：`<slug>-<purpose>-<seq?>.<ext>`。例：`calendar-hero.png`、`calendar-screenshot-1.jpg`、`vision-cue-feature-record.svg`。架构层只声明命名规则，实际命名变更交给 developer 在迁移时按此规则统一。

---

## 10. SEO / Meta

`MetaService`（`src/app/shared/seo/meta.service.ts`）：

```ts
@Injectable({ providedIn: 'root' })
export class MetaService {
  setPageMeta(input: { title: string; description?: string; ogImage?: string }): void;
}
```

- 每个 page 组件在 `ngOnInit` 中调用 `MetaService.setPageMeta(...)`
- `AppDetailPage` 用 `app.seo ?? { title: app.name, description: app.subtitle }`
- 不引入 SSR（成本过高，PRD 14.1 仅要求基础 SEO meta），Later 可上 Angular Universal

---

## 11. 测试策略

| 测试类型 | 工具 | 范围 |
|---|---|---|
| 单元 | Karma + Jasmine（已有） | `AppCatalogService.getBySlug` 命中/未命中；`MetaService` 调用 |
| 组件 | Karma + Jasmine | `ProductTileComponent` 输入 → 渲染 tagline / CTA；`PlatformBadgeComponent` 按 badge 类型渲染不同 DOM；`AppDetailPage` 找不到 slug 时跳首页 |
| 路由 | Angular `RouterTestingHarness` | `/products/calendar` → 解析到 `/apps/calendar`；`/privacy/calendar` 不被重定向；`**` → `/` |
| 旧 URL 兼容 | 同上 | 单独的 spec `app.routes.redirects.spec.ts`，覆盖 §8 表格里所有重定向项 |
| e2e | **不引入 Playwright** | MVP 阶段无足够交互逻辑；旧 URL + 路由跳转用 RouterTestingHarness 即可覆盖；上线后视 ROI 决定是否补 e2e |
| 可访问性 | 手测 + axe DevTools | 上线前一次人工 pass，要求详情页通过 axe 0 critical issue |
| 响应式 | 手测 | DevTools 模拟 iPhone SE (375) / iPad (768) / desktop (1440)，覆盖 AC-10 |

每个新 spec 与组件同目录、同名 `.spec.ts`，遵循 Angular CLI 默认约定。

---

## 12. 构建 / 部署影响

- `angular.json`：移除 `theme.less` 与 ant-design icons assets 配置（见 §1 表）
- 包体积：弃用 ng-zorro 后预计减小 ~600KB gzip，bundle budget 可保持 2MB 不变
- Nginx：新增 5 条 301（§3.2）。架构层产出 `docs/nginx/zrgenesiscloud-redirects.conf` 片段作为参考（具体由 deploy 阶段合入到现有反代配置）
- CDN 缓存：上线后需 purge 旧 `/products/*` 缓存，避免短期内仍命中旧 200 响应
- `AGENTS.md` 更新：
  - `zrgenesiscloud/AGENTS.md`（若存在；不存在则不创建，遵守"不主动创建文档"规则）—— 写明"宣传站不再使用 ng-zorro，新增 UI 走 `src/app/shared/ui/`，新增 App 走 `src/app/data/apps.config.ts`"
  - 工作区根 `CLAUDE.md` / `AGENTS.md` 已声明 zrgenesiscloud 是公开站，无需更新
- `.codex/task-log.md` 路由：本次所有改动均在 `zrgenesiscloud`，写入 `zrgenesiscloud/.codex/task-log.md`

---

## 13. 风险与开放问题

| 风险 | 影响 | 缓解 |
|---|---|---|
| 移除 ng-zorro 后 `header.component` / `app.config.ts` 多处编译错误 | 编译不过 | T-2 一次性清理；先建立新 shell 再删旧 header |
| Nginx 301 未及时部署，SEO 短期内仍指向旧 URL | 搜索流量短期波动 | T-9 与上线同步执行；上线 checklist 验证 5 条 301 |
| `vision-cue` 下载链接缺失（PRD Q1 未答） | AC-4 在 vision-cue 详情页可能空展示 | 配置层允许 `platforms: []`，详情页渲染"暂未提供下载渠道，敬请期待"占位，不阻塞上线 |
| ICP 备案号未提供（PRD Q2） | AC-11 不达成 | footer 组件 ICP 文案读取 environment 配置，业务方提供后改 environment 即可，不阻塞上线代码合入 |
| Tailwind 原型 → SCSS 翻译耗时 | 视觉 fidelity 风险 | designer 交付时附 token 对照表；T-3 由 architect/developer 一次性把原型 tokens 写入 `_tokens.scss` |
| 已有 `karma test styles` 引用 `@angular/material/prebuilt-themes`（angular.json 第 111 行） | 测试启动失败（如果该包未安装） | T-1 清理 angular.json，统一测试样式入口 |

### 开放问题（不阻塞架构定稿，由 PM / 业务方在 developer 实施前回答）

- Q1 vision-cue 下载链接 → 缺省走"暂未提供"占位
- Q2 ICP 备案号 → 通过 environment 注入
- Q3 闪映独立隐私 → 缺省指向 `/privacy-policy`
- Q4 Contact 路由 → architect 决定保留（§3.3）
- Q5 首页 slogan → developer 用占位 "我们做 App。" 上线后替换
- Q6 about / products 汇总页 → architect 决定 301 → `/`

---

## 14. 任务清单（Task List）

> 顺序：T-1 → T-13。T-1~T-3 是基础（脚手架、依赖清理、token），后续任务并行性较好；developer 默认串行执行避免冲突。

---

### T-1：清理 ng-zorro 与样式入口（S，~1h）

- 目标：让仓库脱离 ng-zorro 体系，为新 token 体系腾位置
- 涉及文件：
  - `zrgenesiscloud/package.json`（删 `ng-zorro-antd`、`@ctrl/tinycolor`，保留 `@angular/cdk`）
  - `zrgenesiscloud/angular.json`（删 `src/theme.less`、ant-design icons assets glob、test 阶段的 `@angular/material/prebuilt-themes`）
  - `zrgenesiscloud/src/theme.less`（删）
  - `zrgenesiscloud/src/styles/shared.scss`（删）
  - `zrgenesiscloud/src/app/app.config.ts`（移除 `provideNzI18n`、`registerLocaleData`、多余 `provideAnimationsAsync` 重复项）
- 依赖：无
- Done when：
  - `npm install` 成功，`npm run build` 报错只剩"找不到 ng-zorro 模块"——证明依赖被引用的地方需要后续任务收拾
  - lockfile 更新；`@ant-design/icons-angular` 不在 node_modules 顶层
- 测试要求：暂跳过；T-2 修完才能跑

---

### T-2：建立设计 Token 与全局样式（M，~2h）

- 目标：把 Apple 设计语言落成可复用 SCSS token 与 surface helper
- 涉及文件（新建）：
  - `src/app/shared/tokens/_tokens.scss`
  - `src/app/shared/tokens/_reset.scss`
  - `src/app/shared/tokens/_typography.scss`
  - `src/app/shared/tokens/_surfaces.scss`
  - `src/app/shared/tokens/_utilities.scss`
  - `src/app/shared/tokens/tokens.ts`（TS 端常量镜像）
  - `src/styles.scss`（重写为 `@use` 入口）
- 依赖：T-1
- Done when：
  - `:root` 暴露 §6.2 表格中全部变量
  - `.surface-light / .surface-parchment / .surface-dark` 三种 class 在任意元素上能切换背景 + 文字色
  - `npm run build` 编译通过（即使页面还没改完，至少 styles.scss 不报错）
- 测试要求：无（纯样式）

---

### T-3：定义数据模型与 AppCatalogService（S，~1h）

- 目标：固化 App 数据形状与单源
- 涉及文件（新建）：
  - `src/app/models/app.model.ts`（`AppEntry`/`DownloadChannel`/`AppFeature`/`PlatformBadgeStyle`/`AppPlatformType`/`AppTileTheme`）
  - `src/app/data/apps.config.ts`（三款 App 数据，从旧 `products/*` 与 `product-downloads.ts` 迁移）
  - `src/app/core/services/app-catalog.service.ts`
  - `src/app/core/services/app-catalog.service.spec.ts`
- 依赖：无（可与 T-2 并行）
- Done when：
  - `AppCatalogService.list()` 返回 3 项；`getBySlug('calendar')` 命中、`getBySlug('xxx')` 返回 `undefined`
  - 单测通过
- 测试要求：spec 覆盖 list / getBySlug 命中与未命中

---

### T-4：基础 UI 组件 - 按钮 & 徽章 & 图片包装（M，~2h）

- 目标：提供详情页 / 首页都要用的 atom 组件
- 涉及文件（新建）：
  - `src/app/shared/ui/button-primary/button-primary.component.{ts,html,scss,spec.ts}`
  - `src/app/shared/ui/button-secondary/button-secondary.component.{ts,html,scss,spec.ts}`
  - `src/app/shared/ui/platform-badge/platform-badge.component.{ts,html,scss,spec.ts}`
  - `src/app/shared/ui/product-image/product-image.component.{ts,html,scss}`
- 依赖：T-2
- Done when：
  - 各组件按 §7 表格的 Inputs/Outputs 实现，standalone + OnPush
  - 在 `.surface-dark` 容器内放置时，按钮颜色自动切换为暗色背景版本（手测）
  - `platform-badge` 至少能区分渲染 `appstore` / `google-play` / `apk` / `tencent-myapp` / `wechat-mp` / `web` 六种样式
- 测试要求：button-primary / platform-badge 各一个 spec：输入 → DOM class / text 断言

---

### T-5：导航 & 页脚（M，~2h）

- 目标：替代旧 HeaderComponent / FooterComponent，建立 site shell
- 涉及文件（新建）：
  - `src/app/shared/ui/global-nav/global-nav.component.{ts,html,scss,spec.ts}`
  - `src/app/shared/ui/site-footer/site-footer.component.{ts,html,scss,spec.ts}`
  - `src/app/shared/ui/sub-nav-frosted/sub-nav-frosted.component.{ts,html,scss}`
  - `src/app/layouts/app-shell/app-shell.component.{ts,html,scss}`
  - `src/app/app.component.html`（改为只渲染 `<app-shell>`）
- 涉及文件（删）：
  - `src/app/shared/header/`
  - `src/app/shared/footer/`
- 依赖：T-2, T-3, T-4
- Done when：
  - global-nav 在 desktop 横排展示三款 App 入口；移动端汉堡 + 抽屉（用 `<dialog>` 或 cdk overlay）
  - site-footer 展示版权 / ICP 占位（值从 `environment` 读）/ 联系邮箱 / 隐私汇总链接 / 三款 App 快速链接
  - app-shell 根据 `route.data.showHeader === false` 隐藏 nav（兼容 `/invite/calendar`）
- 测试要求：global-nav spec 验证 App 入口数量 = AppCatalogService.list().length

---

### T-6：首页改造（App 画廊）（M，~2.5h）

- 目标：替换旧 `HomeComponent` 为画廊式 tile 列表
- 涉及文件（新建）：
  - `src/app/pages/home/home.page.{ts,html,scss,spec.ts}`
  - `src/app/shared/ui/product-tile/product-tile.component.{ts,html,scss,spec.ts}`
  - `src/app/shared/ui/hero-intro/hero-intro.component.{ts,html,scss}`（首屏 Logo + slogan）
- 涉及文件（删）：
  - `src/app/home/`
- 依赖：T-3, T-4, T-5
- Done when：
  - `/` 渲染 HeroIntro + 3 个 ProductTile，theme 按 `apps.config.ts` 中 `tileTheme` 设置（parchment / dark / light 等）
  - 相邻 tile 视觉明显不同色（AC-12）
  - 每个 tile 含 "了解更多"（routerLink）与 "立即下载"（外链）按钮
  - 移动端 375px 下 tile 不出现水平滚动条（AC-10）
- 测试要求：home.page.spec.ts 渲染 N 个 tile（N = APPS.length）、点击 primary CTA 触发对应 routerLink

---

### T-7：应用详情页（M，~3h）

- 目标：实现 `/apps/:slug` 统一详情页，三款 App 复用同一组件
- 涉及文件（新建）：
  - `src/app/pages/app-detail/app-detail.page.{ts,html,scss,spec.ts}`
  - `src/app/pages/app-detail/sections/app-hero-section.component.{ts,html,scss}`
  - `src/app/pages/app-detail/sections/platform-download-grid.component.{ts,html,scss}`
  - `src/app/pages/app-detail/sections/feature-grid.component.{ts,html,scss}`
  - `src/app/pages/app-detail/sections/feature-card.component.{ts,html,scss}`
  - `src/app/pages/app-detail/sections/legal-links.component.{ts,html,scss}`
  - `src/app/pages/app-detail/sections/screenshot-gallery.component.{ts,html,scss}`（可选展示）
- 依赖：T-3, T-4, T-5
- Done when：
  - 路由 `/apps/calendar` 渲染完整页面：hero、平台徽章、feature grid、隐私链接
  - slug 不存在时 `router.navigate(['/'])`（AC-7 反向：不 404）
  - 同平台多渠道并列（AC-5：shanying 同时显示应用宝 + 官网 APK）
  - vision-cue 下载入口为空时显示占位文案"暂未提供下载渠道"
- 测试要求：app-detail.page.spec.ts 用 ActivatedRoute mock 三种 slug + 一个非法 slug

---

### T-8：隐私页迁移与隐私汇总页（S，~1.5h）

- 目标：保留 URL、套新 shell、新增 `/privacy` 汇总入口
- 涉及文件：
  - 迁移：`src/app/privacy/calendar-privacy/` → `src/app/pages/privacy/calendar/calendar-privacy.page.{ts,html,scss}`
  - 迁移：`src/app/privacy/vision-cue-privacy/` → `src/app/pages/privacy/teleprompter/teleprompter-privacy.page.{ts,html,scss}`
  - 迁移：`src/app/privacy-policy/` → `src/app/pages/privacy-policy/privacy-policy.page.{ts,html,scss}`
  - 新建：`src/app/pages/privacy-index/privacy-index.page.{ts,html,scss,spec.ts}`
- 依赖：T-5
- Done when：
  - 旧 URL `/privacy/calendar`、`/privacy/teleprompter`、`/privacy-policy` 仍可访问，内容不变，但 header/footer 是新版
  - `/privacy` 列出三款 App + 通用 `/privacy-policy` 链接
- 测试要求：privacy-index.page.spec.ts 渲染 App 数量；路由 spec 验证三个旧 URL 不被重定向

---

### T-9：路由与旧 URL 兼容（S，~1h）

- 目标：落地 §3 路由表、§8 重定向，提供 Nginx 配置片段
- 涉及文件：
  - `src/app/app.routes.ts`（重写为 §3.1）
  - `src/app/app.routes.redirects.spec.ts`（新建：覆盖 5 条 redirect）
  - `docs/nginx/zrgenesiscloud-redirects.conf`（新建：5 条 `return 301` 片段，交付运维）
- 依赖：T-6, T-7, T-8
- Done when：
  - 单测：5 条 redirect 全部通过 RouterTestingHarness 验证（旧路径 → 最终落地组件）
  - `/products/calendar` 跳转后地址栏显示 `/apps/calendar`
  - `**` 兜底跳首页
- 测试要求：见上

---

### T-10：Contact 页 & Invite 页适配（S，~0.5h）

- 目标：精简 contact 页、确认 invite 页继续工作
- 涉及文件：
  - 迁移：`src/app/contact/` → `src/app/pages/contact/contact.page.{ts,html,scss}`（移除 ng-zorro 引用、移除大幅 hero、仅保留邮箱 + 二维码 + footer 引用）
  - 迁移：`src/app/pages/calendar-invite/` 保留路径、移除 ng-zorro 依赖（如有）
- 依赖：T-5
- Done when：
  - `/contact` 与 `/invite/calendar` 编译通过且渲染正常
- 测试要求：保留原有 spec，确保通过

---

### T-11：SEO Meta 服务接入（S，~0.5h）

- 目标：为每个页面设置独立 title / description
- 涉及文件：
  - `src/app/shared/seo/meta.service.ts`（新建）
  - `src/app/shared/seo/meta.service.spec.ts`
  - 在 `HomePage` / `AppDetailPage` / `PrivacyIndexPage` / 各隐私页的 `ngOnInit` 中调用
- 依赖：T-6, T-7, T-8
- Done when：
  - 浏览器 tab 在不同页面显示不同 title
  - `<meta name="description">` 在不同页面更新
- 测试要求：meta.service.spec 验证调用后 document.title 改变

---

### T-12：删除旧目录与文档同步（S，~0.5h）

- 目标：清理迁移后的死代码，保持仓库整洁
- 涉及文件（删）：
  - `src/app/products/`（全删，含 product-downloads.ts，已迁移到 apps.config.ts）
  - `src/app/about/`
  - `src/app/home/`（已被 pages/home 取代）
  - `src/app/privacy/`（旧路径，已迁移）
  - `src/app/privacy-policy/`（旧路径，已迁移）
  - `src/app/contact/`（已迁移）
- 涉及文件（改）：
  - `zrgenesiscloud/.codex/task-log.md`（追加本次重构条目，摘要决策）
  - `zrgenesiscloud/AGENTS.md`（若存在则更新；不存在不创建）
- 依赖：T-6 ~ T-11 全部完成
- Done when：
  - `npm run build` 无 unused import / 无遗留旧组件引用
  - bundle 体积减小（与重构前基准对比记录在 task-log）
- 测试要求：`npm run test --watch=false` 全部通过

---

### T-13：上线前 QA 与可访问性 pass（M，~2h）

- 目标：人工验证 PRD 第 12 节 12 条 AC 全通过
- 涉及文件：无（手测 + 截图归档到 `zrgenesiscloud/.codex/`）
- 依赖：T-1 ~ T-12 全部完成
- Done when：
  - AC-1 ~ AC-12 逐条手测通过，截图存档
  - axe DevTools 在 `/`、`/apps/calendar`、`/privacy/calendar` 三个页面 0 critical issue
  - DevTools 模拟 iPhone SE 375px：所有页面无水平溢出
  - 三款 App 下载按钮点击均跳转到正确外链（新窗口）
- 测试要求：手测 checklist 在 task-log 中以表格形式记录

---

## 15. 任务依赖图（速查）

```
T-1 ─┬─► T-2 ─┬─► T-4 ─┬─► T-5 ─┬─► T-6 ──┐
     │        │        │        ├─► T-7 ──┼─► T-9 ─► T-12 ─► T-13
     │        │        │        ├─► T-8 ──┤
     │        │        │        └─► T-10 ─┘
     └──► T-3 ┴────────┘                  │
                                          └─► T-11 ─┘
```

总计 13 个任务，预计工作量 ~18 小时人工开发。

---

## 16. 总结

### 关键架构决策

1. **不另起新仓**：在 `zrgenesiscloud` 内渐进重构，保留 Angular 17 standalone 体系与旧隐私 URL
2. **弃 ng-zorro、不引 Tailwind**：纯 SCSS + CSS Custom Properties 落地 Apple 设计语言，仅保留 `@angular/cdk` 做无样式 primitives
3. **单源 TS 配置 + Service 抽象**：`apps.config.ts` + `AppCatalogService`，接口形态对齐后端 `app_registry.platform` 枚举，Later 切 HTTP 零改动
4. **明确"唯一阴影 token"**：`--shadow-product` 是体系内唯一阴影，禁止其他场景借用
5. **路由双层重定向**：Angular Router `redirectTo` 保证用户体验，Nginx 301 保证 SEO，作为部署侧依赖独立交付
6. **三套 surface class**：light / parchment / dark，组件内用 `currentColor` + `:where(.surface-dark) &` 自适应，消除组件双套配色重复

### 任务清单

共 13 个任务（T-1 ~ T-13），全部可独立交付，按依赖图串行/并行执行。

### 交接

架构方案已写入 `zrgenesiscloud/docs/arch/zrgenesiscloud-app-showcase.md`，developer 可按 T-1 → T-13 顺序实现。Designer 平行产出 HTML+Tailwind 原型时，请遵循 §6 token 命名与 §7 组件 API 契约；交付时附 token 对照表，开发只需将 Tailwind utility 翻译为 `_tokens.scss` 变量值。
