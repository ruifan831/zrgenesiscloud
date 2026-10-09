# 提词器大师法律页：统一 Markdown 与预渲染

更新：2026-09-23。遵循[应用法律页 SOP](../../sop/app-legal-pages.md)。本文件取代旧别名/独立 HTML/请求时 Node SSR 的部署说明。

## 正文与地址

唯一来源：`src/assets/legal/ticidashi/privacy.md`、`terms.md`。产品名称登记在 `src/assets/legal/products.json`，与Angular通用路由、预渲染器共用。

- 隐私政策：`https://www.zrgenesiscloud.com/legal/ticidashi/privacy/`
- 用户协议：`https://www.zrgenesiscloud.com/legal/ticidashi/terms/`

按用户要求不保留旧路径兼容，不再生成旧文件名、calendar/privacy、calendar/user-agreement、privacy/calendar或privacy/teleprompter别名。黄历两端与官网入口已使用新地址；后台生产营销/法律配置未修改，发布前需核对。

## 构建与部署

执行 `npm run test:legal`、`npm run build`。后者先Angular构建再生成四份（目前两款产品）完整HTML；缺失正文则失败。输出为`dist/zrgenesiscloud/browser/legal/<product>/<document>/index.html`，无需生产Node。

上传整个browser到`/www/wwwroot/zrgenesiscloud.com/browser`，保留其他产品、证书验证和业务文件。按`docs/nginx/ticidashi-legal.conf`或`zrgenesiscloud-browser-bt.conf`合并现有Nginx配置，删除旧黄历根HTML alias与旧提词器隐私重定向，执行nginx -t后再重载。旧部署目录中的别名产物需从本次发布清单移除，单纯覆盖上传不会自动删除旧文件。

先检查规范URL返回完整正文、没有script/app-root、未知法律文档404，再发布新客户端。不承诺商店复检通过。

## 验证边界

正文迁移保留原条款、快手MAC披露、天气/头像及SDK链接；构建与专项测试见最新项目日志。未部署生产，未修改生产数据库法律URL。
