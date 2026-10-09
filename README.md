# zrgenesiscloud

ZRGenesis 公开 App 宣传与下载门户（Angular 17, standalone, Apple-style design tokens）。

## 关键路由

| 路径 | 说明 |
|---|---|
| `/` | 首页 App 画廊（ProductTile × 3） |
| `/apps/:slug` | App 详情页（calendar / vision-cue / shanying） |
| `/privacy` | 隐私协议汇总页 |
| `/legal/calendar/privacy/`、`/legal/calendar/terms/` | 黄历隐私政策与用户协议 |
| `/legal/ticidashi/privacy/`、`/legal/ticidashi/terms/` | 提词器大师隐私政策与用户协议 |
| `/privacy-policy` | ZRGenesis 公司层面隐私政策 |
| `/contact` | 联系页面 |
| `/invite/:slug?app_id=...&code=...` | 通用好友邀请页（隐藏 nav/footer） |

旧路由 `/products/*`、`/about` 通过 Angular Router redirectTo 跳转至新 URL；服务端 Nginx 301 配置见 `docs/nginx/zrgenesiscloud-redirects.conf`。

## App 数据

数据源：后端 HTTP API `/api/v1/public/apps`（通过 `AppCatalogService` → `PublicAppsClient` 读取）。

**不再有静态配置文件**（`apps.config.ts` 已删除，Wave 3 T-22）。

新增 / 修改 App 信息的操作入口：
- admin 后台 `/admin/system/app-registry/:id/marketing`（营销内容编辑，6 Tab）
- admin 后台 `/admin/system/app-registry`（基础信息：名称、平台、状态）

## 开发

```bash
npm run start    # ng serve，访问 http://localhost:4200/
npm run build    # 生产构建，产物在 dist/zrgenesiscloud/
npm run test     # Karma/Jasmine 单元测试
```

## 样式

纯 SCSS + CSS Custom Properties（design tokens），不使用 ng-zorro 或 Tailwind。Token 定义在 `src/app/shared/tokens/`。

## 提词器大师法律页部署

本地运行 `npm run build`，将生成的整个 `dist/zrgenesiscloud/browser/` 上传到 `/www/wwwroot/zrgenesiscloud.com/browser/`。两份法律页已预渲染，不需部署 Node 服务或 package.json。配置和验证见 [部署说明](docs/ticidashi-legal-ssr.md)。单独 `ng build` 不执行法律页生成步骤。

## 文档导航

项目资料见 [文档索引](docs/README.md)；公共规范见 [SOP](../sop/README.md)。

黄历隐私政策与用户协议现同样随 `npm run build` 预渲染，正文维护在 `src/assets/legal/calendar`。旧根 HTML 已迁移，部署需替换旧 Nginx alias，详见 [说明](docs/calendar-legal-prerender.md)。

## 统一法律页（2026-09-23，当前约定）

所有新App在`src/assets/legal/products.json`登记，正文为`<product>/privacy.md`及`terms.md`，URL统一`/legal/<product>/{privacy,terms}/`。黄历与提词器无旧路径别名。先部署新页面，再发布使用新URL的客户端。详见[公共规范](../sop/app-legal-pages.md)。

多应用邀请接入与验证见 [好友邀请页](docs/multi-app-referral.md)。
