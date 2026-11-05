# 公共网站文档

本目录收纳本项目资料；跨端产品文档和公共规范通过下面的入口查阅。模块源码旁的 README 保持与实现共存。

- [工作区文档](../../docs/README.md)
- [公共规范](../../sop/README.md)
- [README.md](../README.md)
- [AGENTS.md](../AGENTS.md)
- [PRODUCT.md](../PRODUCT.md)
- [DESIGN.md：已确认视觉方向](../DESIGN.md)
- [官网设计稿与实施截图（2026-11-03）](../../docs/design/zrgenesiscloud-redesign/2026-11-03/README.md)
- [.codex/task-log.md](../.codex/task-log.md)
- [跨项目平台能力](../../docs/platform/README.md)

## arch

- [架构方案：zrgenesiscloud 应用宣传站重构](arch/zrgenesiscloud-app-showcase.md)

## prd

- [官网改版方案：产品展示、福利介绍与好友邀请（2026-11-03，视觉方向已确认）](prd/website-redesign-rewards-2026-11-03.md)
- [PRD：zrgenesiscloud 应用宣传站重构](prd/zrgenesiscloud-app-showcase.md)

## tasks

- [zrgenesiscloud 应用宣传站 — 后续 TODO 清单](tasks/app-showcase-followups.md)

## reference

- [提词器大师广告 SDK 核对（2026-09-13）](ticidashi-ad-sdk-audit.md)
- [提词器大师法律页：本地预渲染、上传 browser](ticidashi-legal-ssr.md)
- [官网 UI 评估与完善 · 2026-09-13](ui-review-2026-09-13.md)

- [黄历法律页：统一正文与预渲染部署](calendar-legal-prerender.md)

- [班管家法律页：注销规则、共用正文与旧地址更新](crewpilot-legal.md)

- [多应用好友邀请页：契约、路由与验收](multi-app-referral.md)

- [官网福利置顶与邀请页改版验收（2026-11-03）](qa/website-redesign-2026-11-03.md)

- [官网全量测试与旧路径兼容验收（2026-11-04）](qa/full-suite-2026-11-04.md)

## 产品营销与旧邀请兼容

官网接受可选product_key并保留app_id/related_app_ids。旧slug由后端解析到产品内容；无app_id旧链接仍采用原slug平台来源，客户端用可信规范slug构造打开链接，保留原码及来源App ID。法律/渠道仍消费旧DTO字段，协议内容继续Markdown预渲染。[迁移与验证](../../doonook_temp/docs/product-config-migration.md)。

2026-11-04：不再将历史slug别名列入原生唤起目标，旧网页解析和来源App ID仍保留。下载渠道继续消费同一DTO，`app_installer`由后端从已发布版本动态生成，额外营销渠道仍保存。双App的iOS邀请参数统一由产品提供。
