# PRD：zrgenesiscloud 应用宣传站重构

**文档状态**：草稿 v1.0
**日期**：2026-05-17
**作者**：PM
**下游接手**：architect（技术方案）、designer（视觉/交互原型）

---

## 1. 背景与目标

### 1.1 背景

`zrgenesiscloud` 当前是一个企业介绍站，以"ZRGenesis 公司"为主角，包含 Home / About / Products / Contact / Privacy 五个板块。访问者需要先认识公司才能找到产品。这个路径对终端用户（找 App 下载）来说是多余的摩擦。

### 1.2 重新定位（一句话）

把 zrgenesiscloud.com 变成**以 App 为主角的宣传与下载门户**：访客打开首页就看到应用，点击就能了解详情、跳转下载；公司信息退居次要位置（页脚 + 联系入口）。

### 1.3 目标

- **主目标**：提升从首页访问到应用详情页再到下载/外链点击的转化漏斗效率
- **次目标**：统一三款现有 App 的展示规格，建立可扩展的"新增一款 App = 新增一个 tile + 一个详情页"的框架
- **约束**：现有已传播的 URL（`/products/calendar`、`/products/vision-cue`、`/products/shanying`、`/privacy/calendar`、`/privacy/teleprompter`）必须继续可访问，不能 404

---

## 2. 非目标（Out of Scope）

以下内容**不在本次重构范围内**，明确写出以防范围蔓延：

- 详细的公司介绍页（公司历史、团队、文化等）
- 招聘/加入我们页面
- 投资人关系页面
- 博客 / 新闻 / 更新日志页面
- 用户账号体系、登录/注册流程（宣传站不提供登录）
- 后台 CMS / admin 联动（MVP 阶段 App 数据写死在前端配置里，不对接 admin API）
- 多语言切换的完整实现（接口预留，MVP 只上简体中文）
- App 内评分/评论展示的动态数据拉取（MVP 写静态数据或不展示）
- SEO 高级优化（结构化数据 Schema.org 等）——基础 meta tag 在 MVP 内，进阶 SEO 放 Later

---

## 3. 目标用户与使用场景

### 3.1 主要用户：终端消费者

- **画像**：手机用户，通过搜索引擎、应用商店外链、好友分享链接到达本站
- **核心场景**：
  - 场景 A：通过搜索"黄历 App 下载"等关键词找到本站，想快速确认这是哪款 App、去哪里下载
  - 场景 B：好友分享了闪映/全民万年黄历的邀请链接，用户从邀请落地页跳转到详情页了解功能后下载
  - 场景 C：已是某款 App 用户，想找隐私协议或用户协议

### 3.2 次要用户：潜在合作方

- **画像**：广告商、渠道合作方、内容方
- **核心场景**：浏览完应用后，通过页脚 Contact 入口发邮件联系
- **说明**：这类用户占比小，不需要专属页面，页脚联系方式即可满足

---

## 4. 信息架构

### 4.1 页面/路由清单

| 路径 | 页面名称 | 说明 |
|------|----------|------|
| `/` | 首页（App 画廊） | 全屏滚动式，每款 App 一个 tile |
| `/apps/:slug` | 应用详情页 | 功能亮点、平台徽章、下载入口 |
| `/products/calendar` | （兼容重定向） | 301 → `/apps/calendar` |
| `/products/vision-cue` | （兼容重定向） | 301 → `/apps/vision-cue` |
| `/products/shanying` | （兼容重定向） | 301 → `/apps/shanying` |
| `/privacy` | 隐私/协议汇总页 | 按 App 分组列出所有协议入口 |
| `/privacy/calendar` | 全民万年黄历通隐私协议 | 保持现有 URL，内容迁移到新框架 |
| `/privacy/teleprompter` | 全能提词器隐私协议 | 保持现有 URL |
| `/privacy/shanying` | 闪映隐私协议 | 新增（如有内容） |
| `/contact` | 联系我们 | 极简，邮件/社交入口，无独立 hero；或合并入页脚 |

> **说明**：`/about`、`/products`（汇总页）在重构后可重定向到首页或废弃，具体由 architect 确认是否保留 alias。

### 4.2 全站持久化组件

**顶部 Nav**：
- Logo（点击回首页）
- App 列表入口（下拉菜单或横排 pill，列出所有 App 名称，直接跳转对应详情页）
- 可选：语言切换（MVP 阶段可隐藏，预留 DOM 位置）
- 移动端折叠为汉堡菜单

**底部 Footer**：
- 公司名称（ZRGenesis）+ 版权年份
- 备案号（ICP 编号）
- 协议入口：隐私政策汇总页链接
- Contact 联系邮件或链接
- 各 App 快速链接（可选，与 nav 一致）

---

## 5. 核心实体定义

### 5.1 App 实体

每款 App 在配置层需包含以下字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `slug` | string | 是 | URL 标识符，如 `calendar`、`vision-cue`、`shanying` |
| `name` | string | 是 | 应用显示名称，如"全民万年黄历通" |
| `tagline` | string | 是 | 一句话标题，10 字以内，首页 tile 主文案 |
| `subtitle` | string | 是 | 副标题，20–40 字，补充说明 |
| `description` | string | 是 | 长描述，详情页使用，80–200 字 |
| `heroImage` | string | 是 | 首页 tile 主视觉图路径 |
| `detailImages` | string[] | 否 | 详情页截图/功能展示图列表 |
| `platforms` | Platform[] | 是 | 支持的平台列表（见 5.2） |
| `features` | Feature[] | 是 | 功能亮点列表（见 5.3） |
| `privacyUrl` | string | 否 | 站内隐私政策路由（如 `/privacy/calendar`） |
| `termsUrl` | string | 否 | 用户协议路由或外链 |
| `publishedAt` | string | 否 | 首次上线日期，格式 YYYY-MM-DD |
| `updatedAt` | string | 否 | 最近更新日期 |
| `tileTheme` | `'light'｜'dark'` | 是 | 首页 tile 明暗主题，相邻 tile 应交替 |

### 5.2 Platform（下载渠道）实体

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | `'android'｜'ios'｜'miniprogram'｜'web'` | 平台类型，对应 admin app_registry 的 platform 字段 |
| `label` | string | 显示文案，如"应用宝"、"App Store"、"微信小程序" |
| `url` | string | 跳转链接（下载链接、应用商店链接、小程序跳转链接等） |
| `badge` | `'appstore'｜'google-play'｜'apk'｜'wechat'｜'web'` | 徽章图标类型，用于渲染平台标准徽章 |

> 一个 App 可有多个 platform 条目（例如同时有"应用宝"和"官网 APK"两条 android 渠道）。

### 5.3 Feature（功能亮点）实体

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 功能名称，6–12 字 |
| `description` | string | 一句话描述，20–60 字 |
| `icon` | string | 图标标识（具体图标库由 designer/architect 决定） |

---

## 6. 现有 App 清单与迁移策略

### 6.1 三款现有 App 继续保留

| App | 当前路由 | 新路由 | 平台 | 备注 |
|-----|----------|--------|------|------|
| 全民万年黄历通 | `/products/calendar` | `/apps/calendar` | Android（应用宝） | 功能数据从现有组件迁移 |
| 全能提词器（Vision Cue） | `/products/vision-cue` | `/apps/vision-cue` | iOS（App Store，链接待确认） | vision-cue 无 iOS 下载链接，需业务方补充 |
| 闪映 | `/products/shanying` | `/apps/shanying` | Android（应用宝 + 官网 APK） | 功能数据从现有组件迁移 |

### 6.2 URL 兼容策略

- 旧路由 `/products/calendar`、`/products/vision-cue`、`/products/shanying` 均设置客户端重定向（Angular `redirectTo` 或服务器 301）到对应新路由
- 旧隐私路由 `/privacy/calendar`、`/privacy/teleprompter` 保持不变，内容迁移到新框架下的相同路径
- `/privacy-policy`（通用隐私协议页）保持可访问

### 6.3 数据存储方式（MVP）

MVP 阶段 App 配置写死在前端 TypeScript 配置文件（类似现有 `product-downloads.ts` 的模式，但扩展为完整 App 实体）。不对接 admin API，不需要动态加载。未来可升级为 API 驱动。

---

## 7. 首页叙事节奏

首页采用**画廊式全屏滚动**布局，每款 App 占据一个视口高度（或接近一屏）的 tile。

每个 tile 包含：
- 应用名称（小号 eyebrow 文字）
- 一句话标题（`tagline`，大号 headline）
- 副标题（`subtitle`，中号）
- 两个 pill CTA：「了解更多」（跳转详情页）+ 「立即下载」（跳转首个平台下载链接，或展示平台选择器）
- 主视觉图（产品图/截图，右侧或背景）
- 明暗 tile 交替排布（第一款 App 深色，第二款浅色，以此类推），参考 Apple 首页产品陈列节奏

首屏（在任何 tile 之前）：仅展示 Logo + 极简 slogan（"我们做 App"类的一句话），立即滚入第一个 App tile，**不要企业 hero 大图**。

> 具体视觉指标（间距、字号、配色、动效）交给 designer 决策；PM 这里只描述叙事节奏和每个 tile 的内容组成。

---

## 8. 应用详情页结构

每个 `/apps/:slug` 详情页按以下顺序组织信息：

1. **App Hero 区**：应用名、tagline、平台徽章排列（Android / iOS / 小程序 / Web）、主视觉大图或截图轮播
2. **下载/访问入口区**：按平台类型展示标准徽章按钮（App Store 徽章、Google Play 徽章、应用宝按钮、微信小程序跳转、官网 APK 直链等）；同平台多渠道并列展示
3. **功能亮点区**：Feature 卡片网格，每个 feature 含图标、标题、描述
4. **协议入口区**：隐私政策链接 + 用户协议链接（如有）；设计上不抢眼，但必须存在
5. **（可选）截图画廊**：`detailImages` 列表
6. **返回首页/查看其他 App** 的导航提示

---

## 9. 隐私/协议汇总页

路由：`/privacy`

- 列出所有 App 名称，每个 App 下方展示其隐私政策和用户协议的入口链接
- 同时保留 `/privacy-policy` 通用页（公司层面隐私声明）
- 各 App 专属隐私页（`/privacy/calendar` 等）内容迁移到新框架，URL 不变

---

## 10. 国际化与设备适配

- **语言**：MVP 简体中文唯一语言；代码层面为多语言预留接口（i18n key 结构），实际翻译文件 Later 补充
- **设备**：移动端（375px 起）必须完全可用，包括首页 tile、详情页、下载按钮；响应式断点由 architect/designer 决定
- **浏览器兼容**：与现有 Angular 版本（17）一致，不额外扩展兼容范围

---

## 11. 用户故事

**US-1**：作为终端用户，我想在首页快速看到所有 App，以便决定是否继续了解某款。

**US-2**：作为终端用户，我想点击某个 App tile 后进入详情页，看到该 App 的功能介绍、截图和下载入口，以便决定下载。

**US-3**：作为终端用户，我想在详情页看到该 App 支持哪些平台（Android / iOS / 小程序 / Web），并点击对应平台的按钮跳转到下载/访问入口，以便在我的设备上获取 App。

**US-4**：作为终端用户，我想在任何页面的页脚或详情页内找到隐私政策链接，以便查看数据处理规则。

**US-5**：作为通过旧链接进入的用户，我想访问 `/products/calendar` 等旧 URL 时被自动跳转到新详情页，而不是看到 404，以便不中断我的使用体验。

**US-6**：作为潜在合作方，我想通过页脚找到联系方式，以便发起合作沟通。

**US-7**：作为移动端用户，我想在手机上流畅浏览首页 App tile 和详情页，包括下载按钮可正常点击跳转，以便在手机上直接操作下载。

---

## 12. 验收标准

### AC-1（对应 US-1）：首页展示所有 App

- Given 访客打开首页 `/`
- When 页面加载完成
- Then 页面中可见全民万年黄历通、全能提词器、闪映三款 App 的 tile，每个 tile 至少展示 App 名称、tagline、一张视觉图和两个 CTA 按钮

### AC-2（对应 US-1）：首页无独立企业 hero

- Given 访客打开首页 `/`
- When 页面加载完成
- Then 页面首屏不出现以公司为主角的大幅 hero（无"ZRGenesis · 移动应用工作室"大标题区块）；公司名称仅在 Logo 或页脚出现

### AC-3（对应 US-2）：CTA 跳转到详情页

- Given 首页某款 App tile
- When 用户点击「了解更多」按钮
- Then 页面跳转到对应应用详情页 `/apps/:slug`，详情页标题与 App 名称匹配

### AC-4（对应 US-3）：详情页展示平台徽章与下载入口

- Given 用户在 `/apps/calendar` 详情页
- When 页面加载完成
- Then 页面展示"Android"平台的下载徽章，点击后在新标签页跳转到应用宝对应链接（`https://sj.qq.com/appdetail/com.zrgenesiscloud.chinesealmanc`）

### AC-5（对应 US-3）：同平台多渠道并列

- Given 用户在 `/apps/shanying` 详情页
- When 页面加载完成
- Then 页面并列展示"应用宝"和"官网 APK"两个 Android 下载入口，两个入口均可点击且跳转地址不同

### AC-6（对应 US-4）：隐私协议入口可达

- Given 用户在任意应用详情页
- When 用户在页面内寻找隐私政策
- Then 页面内存在隐私政策链接，点击可跳转到对应 App 的隐私页或全站隐私汇总页

### AC-7（对应 US-5）：旧 URL 兼容重定向

- Given 用户访问 `/products/calendar`
- When 页面响应
- Then 用户被重定向到 `/apps/calendar`，最终落地页可正常显示全民万年黄历通详情，HTTP 状态码为 301 或客户端等效重定向，页面无 404

### AC-8（对应 US-5）：隐私旧 URL 不变

- Given 用户访问 `/privacy/calendar`
- When 页面响应
- Then 页面正常展示全民万年黄历通隐私政策内容，不跳转、不 404

### AC-9（对应 US-6）：联系入口可达

- Given 用户在任意页面
- When 用户查看页脚
- Then 页脚包含可用的联系方式（邮件地址或联系页链接），点击可进入 Contact 页或打开邮件客户端

### AC-10（对应 US-7）：移动端可用性

- Given 用户使用 375px 宽度的移动设备浏览器
- When 用户访问首页或任意应用详情页
- Then 所有文字内容可读（不被截断），所有下载/CTA 按钮在移动端可正常点击，无水平溢出滚动条

### AC-11：备案号展示

- Given 用户在任意页面
- When 用户查看页脚
- Then 页脚展示 ICP 备案号（内容由业务方提供），点击跳转至工信部备案查询链接

### AC-12：首页 tile 明暗交替

- Given 首页有多个 App tile
- When 页面加载完成
- Then 相邻的两个 App tile 主题色不同（一深一浅交替），视觉上有明显区分

---

## 13. 范围切分

### MVP（上线必须完成）

- [ ] 首页：三款 App tile（画廊式，明暗交替）
- [ ] 应用详情页：全民万年黄历通、全能提词器、闪映，各含功能亮点、平台徽章、下载入口
- [ ] 隐私页：`/privacy/calendar`、`/privacy/teleprompter` 内容迁移到新框架（URL 不变）
- [ ] 隐私汇总页：`/privacy`
- [ ] 旧 URL 重定向：`/products/calendar`、`/products/vision-cue`、`/products/shanying`
- [ ] 全站 Nav（极简，含 App 入口列表）+ Footer（含版权、备案号、联系入口）
- [ ] 移动端响应式适配
- [ ] 基础 SEO meta tag（每页独立 title / description）

### Later（MVP 之后）

- [ ] 多语言支持（英文为主要候选）
- [ ] Admin API 联动（App 数据从 app_registry 动态拉取，无需修改前端配置即可上新 App）
- [ ] 应用截图画廊/轮播
- [ ] 博客 / 更新日志
- [ ] 用户评分/评论数据展示
- [ ] 进阶 SEO（Schema.org 结构化数据、Open Graph 图）
- [ ] 新 App 上线（在框架搭好后，新增只需新增配置 + 详情页组件）
- [ ] 动效/滚动动画增强
- [ ] 闪映隐私协议页（`/privacy/shanying`，如内容就绪）

---

## 14. 关键约束与依赖

### 14.1 SEO 与 URL 兼容

- 旧路由（`/products/*`）必须重定向，不能直接删除，原因：已在应用商店、社交媒体、好友分享中传播
- `/privacy/teleprompter` 路径中用的是产品内部 ID `teleprompter` 而非页面 slug `vision-cue`，保持现状不改，避免已索引链接失效

### 14.2 备案合规

- 中国大陆访问需展示 ICP 备案号，具体编号由业务方提供给 architect/developer
- 页脚备案号链接需指向工信部备案查询（`https://beian.miit.gov.cn`）

### 14.3 与 admin app_registry 的关系

- admin 端已有 `platform` 字段（android / ios / miniprogram / web），数据结构与本 PRD 的 Platform 实体对齐
- MVP 阶段不对接 admin API，App 配置写死在前端；Later 阶段可升级为调用 admin API 动态加载
- 因此 MVP 期间 App 数据更新（如新增下载链接）需要开发者手动修改配置文件并重新部署

### 14.4 全能提词器下载链接缺失

- 当前代码中 `vision-cue` 没有下载渠道数据（`ANDROID_DOWNLOAD_CHANNELS` 里无 `vision-cue` 条目）
- 需业务方确认：该 App 是否有 iOS App Store 链接、Android 链接或其他平台入口，在开发前提供给 developer

### 14.5 前端框架与视觉风格

- `zrgenesiscloud` 是 C 端公网站，**不强制使用 ng-zorro 组件库**（ng-zorro 是 admin 端选型）
- 视觉风格参考 Apple 产品页的画廊式叙事（大图、简洁排版、明暗交替 tile）；具体组件库选型由 architect 决定，视觉细节由 designer 决定
- 需保持与现有 Angular 17 standalone component 架构一致

### 14.6 开放问题

| # | 问题 | 影响范围 | 需要谁回答 |
|---|------|----------|------------|
| Q1 | 全能提词器是否有 iOS App Store 或其他平台下载链接？ | AC-4、详情页下载入口 | 业务方 |
| Q2 | ICP 备案号是多少？ | AC-11、页脚 | 业务方 |
| Q3 | 闪映（shanying）是否有独立的隐私政策内容？ | `/privacy/shanying` 页面 | 业务方/法务 |
| Q4 | Contact 页是保留为独立路由还是完全合并入页脚？ | 信息架构 | 业务方 |
| Q5 | 首页 slogan（首屏第一句话）的文案是什么？ | 首页首屏 | 业务方/市场 |
| Q6 | `about` 和旧 `products` 汇总页是否完全废弃，还是保留 301？ | URL 清单 | 业务方 |

---

## 15. 成功指标

**核心漏斗**（首选 GA4 或等效埋点追踪）：

1. 首页访问量（UV）
2. 首页 → 详情页点击率（「了解更多」CTA 点击 / 首页 UV）
3. 详情页 → 下载/外链点击率（下载按钮点击 / 详情页 UV）

**最低验证标准（MVP 上线后 4 周）**：
- 三款 App 各有可追踪的下载按钮点击事件
- 旧 URL 重定向后无 404 错误日志

---

## 16. 下一步

**architect** 接手后请：
1. 基于本 PRD 的信息架构和实体定义，设计前端 App 配置数据结构（TypeScript interface），替代现有分散的 `product-downloads.ts` + 各组件内的 `product` 对象
2. 确认路由方案（新 `/apps/:slug` 动态路由 vs 独立页面，旧路由重定向实现方式）
3. 确认是否引入新的 UI 组件库或直接用 Angular CDK + 自定义样式
4. 给出 `/privacy` 汇总页与各 App 隐私页的内容加载方案（静态 HTML vs Markdown vs 组件）

**designer** 接手后请：
1. 基于第 7 节（首页叙事节奏）和第 8 节（详情页结构）出高保真原型
2. 设计平台徽章组件（App Store / Google Play / 应用宝 / 微信小程序 / 官网 APK 五种样式）
3. 设计移动端 375px 下的 tile 和详情页布局
4. 明确 tile 明暗主题的色值与字色方案

**业务方** 在开发前需提供：
- 第 14.6 节中所有开放问题（Q1–Q6）的答案
- 各 App 高质量主视觉图（若现有 `assets/images/` 中的图需替换）
