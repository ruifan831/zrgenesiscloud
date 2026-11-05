# 多应用好友邀请页

当前契约（2026-11-04 最新修订）：数字邀请码 = 产品 mask + userId，链接仅含产品 slug 与 code；0095 将现有关系的 app_id 映射为持久 product_key，最早关系生效且历史/奖励保留。不兼容旧链接，不使用 p1 前缀或来源 mask。以[产品邀请契约](../../docs/platform/product-invitation-codes.md)为准。以下各阶段记录仅供历史追溯，不作为当前配置/发布步骤。

## 2026-11-03 产品线共享更新

当前 `/invite/:slug?app_id=...&code=...` 允许同一产品的 iOS/Android 共用路径。营销详情的 `related_app_ids` 由后端注册表确定；页面校验 URL App ID 在该列表内，之后仍以 URL App ID 请求 metadata、法律页、邀请卡、短信和绑定。不同产品不能只换 query 混用品牌；旧后端无新字段时保留精确 App ID 校验。

关系冲突采用最早记录，旧关系与奖励流水保留；页面 `already_bound` 仍说明原关系不变。后端部署、0084 及验证边界见[后端文档](../../doonook_temp/docs/multi-app-referral.md#当前规则产品线共享2026-11-03)。本次未发布网站、修改生产配置或验证真机唤起。以下旧版逐 App ID 归属说明由本节取代。

更新：2026-09-24。按用户纠正保留手机直接唤起 App 的主要流程，网页手机号绑定是独立可选路径。代码已完成，尚未部署或修改生产路由配置。

## 页面与数据

`/invite/:slug?app_id=<id>&code=<inviteCode>` 由 `ReferralInviteComponent` 统一承接。`ReferralInviteService` 先用现有营销详情接口验证 slug 与 App ID，然后并发读取应用 metadata、协议和邀请卡。协议异步到达或失败只影响网页表单，不阻挡已验证应用的直接唤起入口。客户端不解码邀请码，不按手机系统更换 App ID。

- `GET /public/apps/{slug}` 返回裸详情，新增 `app_id` 映射为 `AppEntry.appId`，品牌只使用详情的名称和 Logo。
- `GET /app/meta?app_id=...` 使用 `{success,data}`，检查 `data.app_id` 与 `features.invitation_enabled`。`invite_routing` 决定打开和下载入口。
- `GET /public/legal-info?app_id=...` 使用 `{success,data}`，两份协议地址均须有效才显示网页表单，App 内注册/登录不要求先在网页同意协议。
- `GET /rewards/public/users/{code}/invite-card?app_id=...` 使用 `{success,data}`，只显示服务端脱敏昵称。
- `POST /auth/send-verification-code` body 为 `{phone}`，保持现有后端 login 用途；`POST /rewards/referral/register` body 为 `{phone,verification_code,invite_code}`。
- 上述 scoped 请求的 `app_id` query 与 `X-App-Id` 一致，注册不会获得 token。

缺少 App ID 的历史链接仅可从该 slug 的营销详情取得可信身份并转为规范 URL。详情不存在或身份冲突时禁止提交；不含 calendar → huangli 等硬编码映射。旧 `/invite/r/:userId` 精确守卫继续跳转 CrewPilot，并排在通用路由之前。该旧路径没有产品 slug；一旦显式携带 app_id（含空值/重复），官网直接显示无效链接，不跳到不会校验 scope 的旧接收页。无 app_id 的原链接保持旧跳转，不透传 token/code 等任意参数；scheduling-web 现有 /share 不需要修改。

## 打开和下载

新的 routing 模板须匹配当前 `/invite/<slug>`（也支持末尾 `/`）、邀请码与 App ID，才生成显式唤起入口。canonical HTTPS、scheme 和 Android intent 保留配置路径的尾斜杠，匹配 AASA / Manifest；本轮宿主仅接收 `www.zrgenesiscloud.com` 的 HTTPS 默认端口或 443，发布配置必须使用这一域名：

- iOS：`<ios_scheme>://invite/<slug>?app_id=...&code=...`，仅使用已配置 scheme；配置商店数字 ID 时同时注入 Smart App Banner。Banner 的 app-argument 是 canonical HTTPS 链接。
- Android：`intent://<host>/invite/<slug>?app_id=...&code=...#Intent;scheme=https;package=<android_package>;end`，按包名明确目标；无固定超时跳转。
- 下载：iOS 使用 `ios_app_store_id`，Android 仅使用 `android_download_url`，后者只接受无认证信息的 HTTPS 地址。未配置不猜测商店，不读营销下载渠道作替代。
- 微信提示在浏览器打开，网页验证仍可用。桌面本地生成邀请二维码，`qrcode` 懒加载，无第三方二维码请求。

兼容现有好友 routing `/share/{inviteCode}` 或 `/share/{userId}`：两个占位符都传递链接的 opaque 邀请码，不在前端解码；只允许 numeric `/share/<code>` 路径及唯一一致的 app_id，不允许组织 `/invite/{token}`、任意路径或冲突 code query。iOS 使用 `<ios_scheme>://share/<code>?app_id=...`，Android 使用配置 base host 的 HTTPS share 路径构造定向 intent。原生对支持的 legacy host/scheme 检查 scope，沿用注册/登录绑定；无需为了本页面强制修改班管家旧 routing。此时 canonical/二维码仍指向当前官网 `/invite/:slug?app_id&code`，不会退回旧页面。

Universal Link / App Link 是否自动进入已安装应用，仍依赖关联文件、已安装版本、浏览器行为和宿主身份。网页按钮不会把同页重载冒充唤起。开发验证未点击真实商店、scheme 或生产邀请绑定。

## 表单与状态

手机首个操作是“打开 App 并接受邀请”，表单为空或网页协议未勾选时仍可使用。点击将当前 App ID 和邀请码带入 App，注册/登录由原生既有流程继续处理；网页不先绑定、不发码、不自动计时跳转。尚未安装时提供配置下载地址，提示下载后重新打开这条链接，或选网页验证，不承诺跨安装保留邀请码。

“也可以在网页接受邀请”是独立折叠选项（桌面或当前无法唤起时展开）。这条路径的手机号、六位验证码和协议勾选均有效才可提交；发码也要求先同意协议。发送中、冷却中、提交中禁止重复。429 优先使用数字 Retry-After，否则等待 60 秒。路由变更取消旧请求、清除手机号/验证码/结果及计时器。临时加载错误可重试。

成功、已有邀请关系、已经活跃分别显示结果；自邀、无效码、邀请人不存在显示可理解的错误，不宣称新绑定。结果页保留打开/下载入口，不自动离开。手机号和验证码不持久化，也不放入 URL；结果后清空表单。

## 验证与上线

- 39 项定向 Karma 测试：3 个 App ID 样例、身份/参数/安全 URL 校验、请求 payload 与 headers、旧路由优先级、协议控制、防重复、冷却、错误结果、路由取消、OnPush 异步更新、二维码浏览器模块及营销字段映射；另含 iOS/Android 空表单与未勾协议可直接唤起、对应平台下载入口、微信提示、协议失败不阻断 App、legacy routing payload 和组织路径拒绝。
- production build（包括法律页预渲染）通过。qrcode/dijkstrajs 为 CommonJS，产生可见构建提示；二维码在异步 chunk，不加入初始包。
- Chrome 本地隔离模拟 API：桌面、375px 窄屏、黄历/第三应用展示、身份冲突、未勾选禁用按钮及模拟绑定成功保留结果验证通过。另验证模拟 Android/iOS 的 App 优先入口在 375px 首屏可见，网页方式独立展开。未发真实短信，未注册生产账号，未点击真实 scheme/intent。

上线前先部署带 `PublicAppDetail.app_id` 和 routing 下载字段的后端，再发布本网站，然后为需要接入通用页面的应用核对营销 slug、App ID、协议、分享模板和关联文件。已有 /share 模板可以继续使用，不要求切换后才允许 App 打开。尚未具备 app_id 的旧后端会被页面明确阻止。

本轮代码核查中，黄历营销 slug 为 `huangli`，正式两端 App ID `zndhxnav19` 可共用。班管家 Android release 为 `mbueqwtxdv`，iOS 为 `sl85pwpqci`，当前 `crewpilot` 营销对应 iOS；Android 若接入本通用网页，需提供与其 App ID 对应的营销条目；既有 scheduling-web /share 无需迁移。不能直接复用 iOS 身份或按 UA 偷换身份。全链路生产、微信与已安装/未安装真机验收由发布阶段完成。

跨项目方案见 [实施文档](../../docs/platform/arch/multi-app-referral-landing.md)。


## 2026-11-03 原生接收补齐

提词器两端已接入 SDK 的产品邀请接收。网页仍原样保留 URL 的来源 App ID/邀请码；平台选择只改变 scheme 或 intent package。新增测试覆盖正式双端 ID 的 canonical 与 scoped `/share` 交接，既有网页可选绑定接口不变。原生使用 `bind-product` 做来源解码与同产品校验，详见[产品验收](../../docs/products/visioncue/qa/invite-flow-20261103.md)。本轮未改生产 routing、静态关联文件或部署；并行官网视觉改动保持原样。

## 2026-11-03 产品公开路径与旧链接

公开响应 slug 取 product_registry，name 为产品展示名；营销不再维护独立主要 slug。可选 url_aliases 列出同产品历史路径。邀请页规范 URL/二维码使用产品 slug，但唤起允许后端登记的同产品旧 referral_path；继续校验唯一且一致的 App ID 与邀请码，不放行其他产品路径。旧别名响应保留来源 App ID，不改 mask。产品法规通过原 privacy_url/terms_url 响应字段投影，数据库已删除营销副本。安装包自动渠道与手动下载渠道均通过原 channels 列表展示；邀请页优先使用自动发布 APK 地址，其次兼容 routing 下载目标或可用 APK 渠道。
