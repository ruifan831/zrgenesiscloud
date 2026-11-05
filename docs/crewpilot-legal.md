# 班管家法律页与注销说明

更新：2026-10-24。遵循[应用法律页 SOP](../../sop/app-legal-pages.md)。本轮已完成本地修改，尚未部署或重新提交商店审核。

## 正文与当前地址

唯一编辑来源为 `src/assets/legal/crewpilot/privacy.md`、`terms.md`，以 scheduling-web 现行正文替换此前未启用的占位草稿，保留原第三方 SDK、安装列表及其他披露。隐私政策新增 **5.1 账号注销流程与规则**，用户协议第 7 节链接至该段。

| 用途 | 隐私政策 | 用户协议 |
|---|---|---|
| 官网规范地址 | https://www.zrgenesiscloud.com/legal/crewpilot/privacy/ | https://www.zrgenesiscloud.com/legal/crewpilot/terms/ |
| 四端既有地址 | https://crewpilot.zrgenesiscloud.com/legal/privacy | https://crewpilot.zrgenesiscloud.com/legal/terms |

2026-10-24 只读查询 Android release App ID `mbueqwtxdv` 及 iOS/Web/小程序 release App ID `sl85pwpqci` 的 `/api/v1/public/legal-info`，返回上表既有地址和 `support@zrgenesiscloud.com`。线上旧隐私页缺少具体注销步骤，因此**只发布官网规范地址不能修复当前送审地址**。本轮保留旧地址，不改生产法律配置或客户端链接；四端经后台读取、打开同一正文。

## 注销事实依据

- Android：`shiftmate-android/.../features/profile/{ProfileScreen,DeregisterAccountScreen}.kt`，入口“我的 → 注销账号”，获取验证码后“确认注销账号 → 最后一次确认 → 仍要注销”。
- iOS：`ShiftMate/ShiftMate/Features/Profile/ProfileView.swift`、`Features/Settings/DeregisterAccountView.swift`，相同入口，验证码与二次确认。
- 小程序：`schedule-helper/pages/profile`、`pages/deregister`，相同入口、验证码、确认弹窗。
- 服务端：`doonook_temp/doonook-auth/src/doonook_auth/services/auth_service.py` 优先向手机号、否则邮箱发注销码；无联系方式不能自助注销。`user_deregistration_service.py` 检查未完成提现、现金余额及多人组织所有权，成功后删除账号，单人组织关闭。
- Web 当前没有自助注销按钮。正文明确可使用 App 或联系既有支持邮箱，不虚构网页注销网址。仅更新共用法律说明，不新增任何客户端注销功能，不对真实账号执行操作。
- 人工渠道的 **15 个工作日是回复处理情况期限**，沿用原隐私政策的回复承诺，不宣称发邮件后自动注销。腾讯审核反馈中的投诉邮箱和 QQ 不属于本产品客服。

## 生成与验证

```bash
# 在 zrgenesiscloud
npm run test:legal
node scripts/export-crewpilot-legal.mjs
node scripts/export-crewpilot-legal.mjs --check
npm run build

# 在 scheduling-web（正文模板随源码保留，可独立构建）
npm run sync:legal    # 更新正文时运行；需要同级 zrgenesiscloud 及其 marked 依赖
npm run build
```

`export-crewpilot-legal.mjs` 从唯一 Markdown 生成 Web 的 `privacy-policy.generated.html` 与 `terms-of-service.generated.html`；不要手改生成文件。Web 旧路由的页内链接继续指向旧路由，避免依赖规范地址先上线。SDK 清单/个人信息清单仍链接现有 crewpilot 站点。

官网构建输出 `dist/zrgenesiscloud/browser/legal/crewpilot/{privacy,terms}/index.html`，为完整静态 HTML，无 script/app-root。注册表新增 `crewpilot`，官网 Angular 阅读器复用现有组件。Web 构建继续预渲染原 8 条路由。

## 更新包与发布顺序

本次更新包 `dist/banguanjia-legal-20261024.zip` 分两个目标目录，不能把目录当成同一域名下的路径：

1. `crewpilot-site/`：由同一 Markdown 生成的 `/legal/privacy/index.html`、`/legal/terms/index.html`，放到 **crewpilot 域名**对应静态根目录。自带 CSS，无 JS 或其他 bundle 依赖，可单独更新审核地址。生成命令：`node scripts/export-crewpilot-legal.mjs --output-directory dist/banguanjia-legal-20261024/crewpilot-site`。
2. `public-site/`：规范地址的两份 HTML 和对应两份 Markdown，放到 **www 域名**对应静态根目录。按现有 `docs/nginx/ticidashi-legal.conf` 合并规则；未知文档应 404，不回落 SPA 空壳。

发布前确认实际 Nginx 对旧地址优先读取这些静态文件（允许目录尾斜杠跳转），并按站点缓存策略刷新这两个页面。完整 SPA 内导航同步需另行发布两个站点的完整 `browser` 产物；完整构建包含工作树原有其他修改，发布时应一并审阅，不能把本更新包视作全站发布。

重新送审前，必须访问后台实际下发的旧地址，确认最近更新为 2026-10-24，正文可搜索“5.1 账号注销流程与规则”“仍要注销”和支持邮箱，手机阅读和条款跳转正常；再核对送审 APK 内入口并重新提交。当前构建/预览不能证明生产已更新、真实注销已验收或商店审核通过。
