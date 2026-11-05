# 黄历法律页：统一 Markdown 与预渲染

更新：2026-09-23。遵循[应用法律页 SOP](../../sop/app-legal-pages.md)。本文件取代旧别名/独立 HTML/请求时 Node SSR 的部署说明。

## 正文与地址

唯一来源：`src/assets/legal/calendar/privacy.md`、`terms.md`。产品名称登记在 `src/assets/legal/products.json`，与Angular通用路由、预渲染器共用。

- 隐私政策：`https://www.zrgenesiscloud.com/legal/calendar/privacy/`
- 用户协议：`https://www.zrgenesiscloud.com/legal/calendar/terms/`

按用户要求不保留旧路径兼容，不再生成旧文件名、calendar/privacy、calendar/user-agreement、privacy/calendar或privacy/teleprompter别名。黄历两端与官网入口已使用新地址；后台生产营销/法律配置未修改，发布前需核对。

## 构建与部署

执行 `npm run test:legal`、`npm run build`。后者先Angular构建再生成四份（目前两款产品）完整HTML；缺失正文则失败。输出为`dist/zrgenesiscloud/browser/legal/<product>/<document>/index.html`，无需生产Node。

上传整个browser到`/www/wwwroot/zrgenesiscloud.com/browser`，保留其他产品、证书验证和业务文件。按`docs/nginx/ticidashi-legal.conf`或`zrgenesiscloud-browser-bt.conf`合并现有Nginx配置，删除旧黄历根HTML alias与旧提词器隐私重定向，执行nginx -t后再重载。旧部署目录中的别名产物需从本次发布清单移除，单纯覆盖上传不会自动删除旧文件。

先检查规范URL返回完整正文、没有script/app-root、未知法律文档404，再发布新客户端。不承诺商店复检通过。

## 验证边界

正文迁移保留原条款、快手MAC披露、天气/头像及SDK链接；构建与专项测试见最新项目日志。未部署生产，未修改生产数据库法律URL。

## 2026-09-26 快手传感器复检：线上正文未同步

通过 Chrome 读取规范隐私地址，线上快手表格仍为“快手联盟（Android）/ 北京快手科技有限公司”，收集范围没有传感器列表，仅优量汇有传感器专段。本地 Markdown 和构建 HTML 已有“快手联盟广告 SDK 的传感器列表处理说明”、北京快手广告有限公司、读取类型/接口/目的/同意后时机。线上缺口与报告对应，但送检包 MD5 未知，不能据此确定检测时全部原因。公开 legal-info 接口本次访问受阻，未重新核实后台配置。

现有构建与源文件逐字一致，HTML 与当前渲染函数输出一致，法律页两项测试通过。针对已部署规范路由的网站，最小更新包为 `dist/calendar-privacy-20260926.zip`，只含：

- `legal/calendar/privacy/index.html`：直接打开协议时返回的完整正文。
- `assets/legal/calendar/privacy.md`：Angular 内部导航读取的同一正文。

发布到 `/www/wwwroot/zrgenesiscloud.com/browser/` 的对应相对路径，发布前备份这两个旧文件，保留其他文件。不要只上传 Markdown 或使用单独 `ng build` 的产物。增量包不包含其他产品或业务页面变更；全站发布仍遵循上方完整 browser 流程。

发布后从 App 隐私入口确认实际地址及正文，搜索快手传感器专项说明；若仍旧，核查路径缓存和 Nginx 实际根目录。按检测报告要求重新上传 APK 触发新任务。此轮未发布生产，不代表真实 SDK 采集复检通过；此前安装列表限制不等于关闭传感器查询。


同日后续：应用户要求，更新包现已重新生成，包含快手、优量汇、穿山甲、百度移动广告四家各自的传感器披露；政策日期为2026-09-26。它替代同日先前版本，目录结构和发布步骤不变。对应Android新包MD5为 `ec97baae89d18c12ad68abf7e9a1a13f`，同意版本4。网站两项测试、完整构建及源/产物一致性验证通过，仍未发布生产。


## 2026-10-16 Android 移除天气定位

新版 Android 默认上海或上次保存城市，用户手动切换；不申请位置权限、不读取设备定位或调用Geocoder。canonical隐私正文已增加此平台版本说明，iOS与较早Android的原有定位说明继续保留。政策日期更新为2026-10-16；不复制到Android历史privacy-policy.html。

法律页2项测试与完整production构建通过。发布新版APK前需同步部署新的静态HTML及Markdown；本轮未部署或修改后台法律地址。当前验证与产物见本项目最新task-log。
