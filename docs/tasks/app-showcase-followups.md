# zrgenesiscloud 应用宣传站 — 后续 TODO 清单

**关联文档**
- PRD：`zrgenesiscloud/docs/prd/zrgenesiscloud-app-showcase.md`
- 架构：`zrgenesiscloud/docs/arch/zrgenesiscloud-app-showcase.md`
- 原型：`docs/design/zrgenesiscloud-app-showcase/`
- 任务日志：`zrgenesiscloud/.codex/task-log.md`

**当前状态**：T-1 ~ T-13 已交付，3 项 P0 + P1-1 + P2-4 + P2-5 + P1-6 已修复，构建通过，处于**可上线状态**。下面是 reviewer 复审标注但尚未处理的项。

> 创建于 2026-05-18。每条都标了优先级、文件、建议改法。修复后请把对应项删掉或迁到「已完成」段。

---

## P1 — 影响体验/可维护性，建议在第二轮 sprint 内处理

### TODO P1-2：feature-card eyebrow 显示原始 icon key
- **现象**：`/apps/:slug` 详情页 features 区，eyebrow 直接渲染 `feature.icon` 字段值，结果用户看到 "calendar"、"compass"、"file-text" 这种英文 key 名。
- **文件**：`zrgenesiscloud/src/app/pages/app-detail/sections/feature-card.component.html:21`
- **依赖决策**：业务方需先确定方向：
  - 方案 A：把 `feature.icon` 字段改成中文文案（如 "日历功能"），eyebrow 直接显示该文案。
  - 方案 B：补 SVG 资产到 `src/assets/icons/<slug>/`，eyebrow 改为图标。
- **改法**：方案 A 一行模板改即可；方案 B 需要 designer 出图 + 改组件渲染。

### TODO P1-3：ProductTile eyebrow / headline 内容结构不符 PRD §7
- **现象**：首页 product tile 当前 eyebrow 显示 `app.tagline`、h2 显示 `app.name`；PRD 描述应为 eyebrow=应用名小号 + headline=tagline 大号。
- **文件**：`zrgenesiscloud/src/app/shared/ui/product-tile/product-tile.component.html:12`
- **依赖决策**：PM/designer 二选一：
  - 方案 A：按 PRD 字面对调，eyebrow=name、h2=tagline。
  - 方案 B：新增 `app.category` 字段（如「日历与黄历」），eyebrow=category、h2=name、副标题=tagline——更贴近设计原型 `home.html` 的语义。
- **改法**：方案 B 需要先扩 `app.model.ts` 数据模型 + `apps.config.ts` 填值。

### TODO P1-4：feature-card 占位区用了装饰渐变
- **现象**：feature 占位框 `background: linear-gradient(135deg, ...)`，违反「不用装饰渐变」原则；同时硬编码了 hex。
- **文件**：`zrgenesiscloud/src/app/pages/app-detail/sections/feature-card.component.scss:25,29`
- **改法**：占位区改为 `background: var(--surface-parchment)` / `var(--surface-tile-dark-1)` 纯色实心；和 P1-2 一起做更顺手（补真图后占位框直接消失）。

### TODO P1-5：多处 SCSS 硬编码 hex
- **现象**：组件 SCSS 中存在 `#ffffff`、`#1d1d1f`、`#333333`、`#0a7c07`、`#5ade59`、按钮 hover 衍生色 `#1a78d4` / `#1a8af5` / `#005ab5` / `#0070d1` 等。架构 §6 要求颜色全部走 token。
- **涉及文件**：
  - `src/app/shared/ui/platform-badge/platform-badge.component.scss:41,42,45,64,127,132`
  - `src/app/shared/ui/hero-intro/hero-intro.component.scss:31,80,91`
  - `src/app/shared/ui/global-nav/global-nav.component.scss:49,90,132,160,232,265`
  - `src/app/shared/ui/button-primary/button-primary.component.scss:10,24,29,33,58,62`
- **改法**：分两步——
  1. 已有 token 的（白、近黑、文字弱化色）直接 `var(--...)` 替换；
  2. hover 衍生色没有 token：要么在 `_tokens.scss` 加 `--color-accent-hover` / `--color-accent-hover-dark`，要么用 CSS `color-mix(in srgb, var(--color-accent), black 10%)` 派生。
- **建议**：作为独立"颜色 token 一次清理" sprint，1~2 小时一次性扫完。

### TODO P1-6：~~calendar-invite input focus 用 box-shadow~~ ✅ 已修
- 已改为 `outline + outline-offset`，遵守"唯一阴影只用于产品图"原则。

---

## P2 — 可选优化 / 长期债

### ~~TODO P2-1：AuthService spec 测试失败~~ ✅ 已消除
- 2026-09-24 通用好友邀请替换旧 AuthService，删除不可达旧组件/服务和失效测试，新增 scoped HTTP/表单回归。

### TODO P2-2：AppDetailPage spec 5 个测试失败
- **原因**：`ActivatedRoute` mock 不完整，缺 `provideRouter` 或 `RouterTestingHarness`，导致 SubNavFrostedComponent 的 RouterLink 依赖链断。
- **文件**：`zrgenesiscloud/src/app/pages/app-detail/app-detail.page.spec.ts`
- **改法**：用 `RouterTestingHarness` 替代当前直接 mock，或给 `ActivatedRoute` 一个 `{ snapshot: { paramMap: convertToParamMap({slug:'calendar'}) } }` stub。

### ~~TODO P2-3：AppCatalogService 同步 vs Observable~~ ✅ 已完成
- Wave 3 T-20/T-21 已全面切换：`list()` / `getBySlug()` / `getFeatured()` 均返回 `Observable<...>`，所有消费方（HomeComponent / AppDetailPage / PrivacyIndexPage / GlobalNav / SiteFooter）已改用 `async` pipe，详情页用 resolver 处理 loading/404。
- `apps.config.ts` 已彻底删除（T-22），HTTP API 为唯一数据源。

### TODO P2-4：~~HomeComponent featuredAppSlug 硬编码~~ ✅ 已修
- 已改为动态读取 `this.apps[0]`。

### TODO P2-5：~~`src/app/shared/templates/` 死代码~~ ✅ 已删
- 该目录完全无引用，已 `rm -rf`。

### TODO P2-6：根目录历史静态 HTML 用途未确认
- **文件**：
  - `src/assets/legal/calendar/privacy.md`
  - `src/assets/legal/calendar/terms.md`
  - `zrgenesiscloud/huangli-ad.html`
  - `zrgenesiscloud/privacy.html`
- **疑问**：是否仍被 App WebView / 外部分享链接引用？若否可直接删；若是要在 Nginx 显式保留路由。
- **改法**：业务方排查后决定，并在 task-log 记录决策。

---

## 业务方/外部依赖

### TODO BIZ-1：vision-cue 三个下载渠道全部 `available: false` → 迁移至 admin 运营任务
- **原文件**：`apps.config.ts` 已删除（Wave 3 T-22）。
- **新操作入口**：admin 后台 `/admin/system/app-registry/vision-cue/marketing` → 「下载渠道」Tab。
- **解除条件**：商店上架后，在 admin 下载渠道 Tab 填入正式 store URL，并把对应渠道 `available` 改 `true`。

### TODO BIZ-2：vision-cue 主图缺失 → 迁移至 admin 运营任务
- **原状**：`ProductImageComponent` 缺 `hero_image_url` 时回退为 parchment 空块占位（行为正常）。
- **新操作入口**：admin 后台 `/admin/system/app-registry/vision-cue/marketing` → 「基础信息」Tab → Hero 图上传。
- **解除条件**：业务方准备 1 张 vision-cue hero 图（建议 1200×675，jpg/webp），在 admin 「视觉资产」Tab 上传，无需改代码。

### TODO BIZ-3：`updatedAt`（隐私协议更新时间）未填 → 迁移至 admin 运营任务
- **影响**：隐私汇总页（`/privacy`）"最后更新"列显示占位"见协议文件"（`privacy_updated_at` 为 null）。
- **新操作入口**：admin 后台 `/admin/system/app-registry/:app_id/marketing` → 「法律与 SEO」Tab → `privacy_updated_at` 日期选择。
- **解除条件**：业务方在 admin 法律 Tab 填写每款 App 的隐私协议最近更新日期（YYYY-MM-DD），公网自动读取。

### TODO BIZ-4：ICP 备案号占位
- **文件**：`zrgenesiscloud/src/environments/environment.ts` 与 `environment.prod.ts` 的 `icp` 字段
- **现状**：空字符串，footer 模板做了条件渲染，不会出现 "ICP 备案：" 后接空白。
- **解除条件**：拿到备案号填入两个 environment 文件。

### TODO BIZ-5：shanying 隐私协议页内容
- **现状**：seed 数据中 `shanying.privacy_url = '/privacy-policy'`（通用隐私声明 fallback，P0-2 修复决策）。
- **方案 A（推荐）**：如果业务方有外部 PDF 或独立域名隐私页，在 admin「法律与 SEO」Tab 填入 `privacy_url` 外链即可，无需改代码。
- **方案 B（独立组件）**：若需 `/privacy/shanying` 路由：
  1. 补内容写入新组件 `src/app/pages/legal/shanying-privacy/`；
  2. 在 `app.routes.ts` 加 `/privacy/shanying` 路由；
  3. 在 admin 法律 Tab 把 `privacy_url` 更新为 `/privacy/shanying`。

### TODO BIZ-6：Nginx 301 重定向部署
- **文件**：`docs/nginx/zrgenesiscloud-redirects.conf`
- **现状**：5 条 `return 301` 片段已生成，需在反代/CDN 层 include 到 zrgenesiscloud.com 的 server block。
- **后续**：
  1. 部署运维 include 该配置。
  2. 上线后用 `curl -I /products/calendar` 等命令验证返回 301 + 正确 Location。
  3. CDN 缓存 purge `/products/*` 旧缓存。

---

## app 营销 CMS 上线后的运营 TODO

以下条目需要**业务方/运营**在 admin 后台完成，无需开发介入：

1. **首次内容审核**：登录 admin `/admin/system/app-registry`，逐一进入三款 App 的「营销内容」子页，检查 seed 数据文案是否准确。
2. **替换图片资产**：
   - calendar：当前 logo / hero 均为 `/assets/images/calendar.png`（方形 512×512），建议替换为专业 hero 图（16:9 或 4:3，2MB 以内 PNG/JPG/WebP）。
   - vision-cue：logo 与 hero 均缺失，需在「基础信息」Tab 上传。
   - shanying：当前使用 `/assets/images/shanying.png`（方形 256×256），建议同上替换。
3. **vision-cue 下载渠道上架**：商店上架后在「下载渠道」Tab 填入 URL 并开启 `available`。
4. **SEO 元信息校对**：各 App「法律与 SEO」Tab 确认 seo_title / seo_description 符合品牌规范。
5. **隐私协议更新时间**：各 App「法律与 SEO」Tab 填入 `privacy_updated_at`，让 `/privacy` 页显示正确日期。
6. **截图上传**（选做）：详情页「截图」Tab 上传 App 实际截图（≤8 张，建议手机截图比例 9:19.5），公网详情页自动展示。
7. **可见性确认**：seed 默认 `is_visible=true`，上线前可先在「可见性」Tab 暂时关闭不成熟的 App，内容就绪再开启。

---

## 已完成（本轮 Reviewer 反馈处理）

- ✅ P0-1 vision-cue 主图缺失 → `ProductImageComponent` 加缺图回退占位
- ✅ P0-2 shanying 隐私链断链 → `apps.config.ts` 改为 `/privacy-policy` fallback
- ✅ P0-3 PlatformBadge 类名前缀不匹配 → SCSS `&--<badge>` 统一改为 `&.badge--<badge>`
- ✅ P1-1 HomeComponent / AppDetailPage 接入 MetaService
- ✅ P1-6 calendar-invite input focus 用 `outline` 替代 box-shadow
- ✅ P2-4 HomeComponent featuredAppSlug 改为动态 `apps[0]`
- ✅ P2-5 删除 `src/app/shared/templates/` 死代码
- ✅ P2-3 AppCatalogService 切 Observable + HTTP（Wave 3 T-20/T-21，`apps.config.ts` 已删除）
- ✅ BIZ-1/BIZ-2/BIZ-3 下载渠道、主图、隐私更新时间 → 迁移至 admin CMS 后台运营任务
