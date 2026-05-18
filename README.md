# zrgenesiscloud

ZRGenesis 公开 App 宣传与下载门户（Angular 17, standalone, Apple-style design tokens）。

## 关键路由

| 路径 | 说明 |
|---|---|
| `/` | 首页 App 画廊（ProductTile × 3） |
| `/apps/:slug` | App 详情页（calendar / vision-cue / shanying） |
| `/privacy` | 隐私协议汇总页 |
| `/privacy/calendar` | 全民万年黄历通隐私协议（原 URL 保留） |
| `/privacy/teleprompter` | 全能提词器隐私协议（原 URL 保留，注意 teleprompter 非 vision-cue） |
| `/privacy-policy` | ZRGenesis 公司层面隐私政策 |
| `/contact` | 联系页面 |
| `/invite/calendar` | 邀请落地页（隐藏 nav/footer） |

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
