# CrewPilot 法律文档集成指南

> 创建日期：2026-06-01  
> 状态：**Angular 集成已完成（方案 A）** — 等待法务 sign-off 后上线  
> 集成日期：2026-06-01

## 已落实 URL

| 文档 | 实际 URL |
|------|---------|
| 隐私政策 | `https://crewpilot.zrgenesiscloud.com/legal/privacy` |
| 用户协议 | `https://crewpilot.zrgenesiscloud.com/legal/terms` |
| 第三方 SDK 清单 | `https://crewpilot.zrgenesiscloud.com/legal/sdk-list` |
| 个人信息收集清单 | `https://crewpilot.zrgenesiscloud.com/legal/pii-collection` |
| 未成年人保护 | `https://crewpilot.zrgenesiscloud.com/legal/minor-protection` |

路由组件：`src/app/pages/legal/legal-doc.component.ts`  
Markdown 渲染库：`marked@^18`（轻量，无 DOM 依赖）  
后端默认值：`doonook-common/src/doonook_common/core/system_config_defaults.py` 5 个 `legal_*_url` 已更新

---

## 一、待填字段汇总清单（所有文档）

在所有 5 份文档正式上线前，以下字段必须由运营/法务填写。字段以 `{{占位符}}` 形式出现在文档中，统一替换即可。

| 占位符 | 说明 | 出现文档 | 填写责任方 | 优先级 |
|--------|------|----------|-----------|--------|
| `{{COMPANY_NAME}}` | 公司全称（工商注册名） | 全部 5 份 | 运营/法务 | P0 |
| `{{COMPANY_ADDRESS}}` | 公司注册地址 | privacy, terms | 运营/法务 | P0 |
| `{{CONTACT_EMAIL}}` | 隐私/法律联系邮箱 | 全部 5 份 | 运营 | P0 |
| `{{CONTACT_PHONE}}` | 客服/投诉电话 | privacy, terms, minor-protection | 运营 | P0 |
| `{{EFFECTIVE_DATE}}` | 政策生效日期 | privacy, terms, minor-protection | 运营（上线时填） | P0 |
| `{{LAST_UPDATED_DATE}}` | 最近修订日期 | 全部 5 份 | 运营（每次修改时更新） | P0 |
| `{{ICP_FILING}}` | 网站 ICP 备案号 | privacy | 运营（备案完成后填） | P1 |
| `{{APP_FILING}}` | 移动应用 APP 备案号 | privacy | 运营（备案完成后填） | P1 |
| `{{DATA_RETENTION_LOG_DAYS}}` | 登录日志保留天数（建议 90 天） | privacy, pii-collection | 法务确认 | P1 |
| `{{MINOR_AGE_THRESHOLD}}` | 未成年保护年龄线（建议 18 岁） | privacy | 法务确认 | P1 |
| `{{OVERSEAS_SERVER_LOCATION}}` | 境外服务器所在地（如：美国弗吉尼亚） | privacy | 运营/技术确认 | P1 |
| `{{GOVERNING_LAW_JURISDICTION}}` | 适用法律管辖地 | terms | 法务确认 | P1 |
| `{{DISPUTE_COURT}}` | 争议解决法院 | terms | 法务确认 | P1 |
| `{{SERVICE_SUSPENSION_NOTICE_DAYS}}` | 停服提前通知天数（建议 30） | terms | 法务确认 | P2 |

---

## 二、法务审核重点

所有标注 `<!-- TODO 法务审核 -->` 的章节必须经法务 sign-off，主要集中在：

| 文档 | 章节 | 审核要点 |
|------|------|---------|
| privacy.md | 三、信息存储（跨境传输声明） | 跨境传输的法律依据是否充分；是否需补充 PIPL 第三章合规文件 |
| privacy.md | 四、信息共享（Cloudflare R2） | 是否需要单独签署数据处理协议（DPA）；R2 作为境外服务是否构成数据出境 |
| privacy.md | 五、个人信息出境 | 数据出境安全评估是否需要向网信办申报（依数据量级） |
| privacy.md | 六、数据可携带权 | 暂不支持导出是否合规；PIPL §45 风险（见架构文档 D-10） |
| terms.md | 六、免责声明 | 免责范围是否过宽；劳动争议免责条款当地法院是否支持 |
| terms.md | 八、适用法律与争议解决 | 管辖法院选择 |
| minor-protection.md | 五、青少年模式豁免 | 豁免理由是否充分；是否需要提交说明材料给监管机关 |

---

## 三、推荐集成方案

**推荐方案 A：Angular 路由 `/legal/:slug` + Markdown 渲染组件**

理由：5 份文档内容后续需要运营持续更新（填入备案号、调整条款）；Markdown 源文件已在 assets 中，Angular 路由统一渲染可复用同一组件和样式，URL 格式干净，符合架构文档 §4.5 要求，且与现有 `/privacy/*` 路由风格一致。相比方案 B（5 份独立 HTML）维护成本更低；相比方案 C（SSR）无需改动部署架构。

**URL 映射**：

| 文档 | 路由 | 对应 slug |
|------|------|----------|
| 隐私政策 | `/legal/privacy` | privacy |
| 用户协议 | `/legal/terms` | terms |
| 第三方 SDK 清单 | `/legal/sdk-list` | sdk-list |
| 个人信息收集清单 | `/legal/pii-collection` | pii-collection |
| 未成年人保护 | `/legal/minor-protection` | minor-protection |

---

## 四、Developer 任务清单

将 5 份 Markdown 文档接入 `zrgenesiscloud` 的步骤：

### 前置条件
- [ ] 法务 sign-off 邮件已归档（**上线硬前置**）

### Angular 路由与组件
- [x] 新增 `src/app/pages/legal/legal-doc.component.ts` 组件，接收 route param `slug`，读取对应 Markdown 并渲染
- [x] 引入 `marked@^18` Markdown 渲染库，与现有 token 样式系统兼容
- [x] 在 `src/app/app.routes.ts` 新增路由（放在 `**` 通配符路由之前，lazy load）：
  ```
  { path: 'legal/:slug', loadComponent: () => import('./pages/legal/legal-doc.component').then(m => m.LegalDocComponent), data: { showHeader: false, showFooter: false } }
  ```
- [x] Markdown 文件放在 `src/assets/legal/crewpilot/*.md`，组件通过 `HttpClient` 按 slug 读取对应文件
- [x] 页面设置 SEO meta（`MetaService`）：title = 文档标题，`robots: noindex, nofollow`
- [x] 404 处理：slug 不在白名单（5 个）时展示错误提示，HTTP 加载失败同样展示
- [x] 顶部返回按钮（`history.back()` fallback 到首页，兼容小程序 web-view）
- [x] `showHeader: false, showFooter: false` — 不渲染全站导航，适合 WebView 嵌入

### Admin 后台默认值配置
在 admin 后台编辑页（`pages/system/app-registry/[crewpilot]/legal-info`）将以下 URL 填为默认值：

| Key | 默认值 |
|-----|--------|
| `legal_privacy_policy_url` | `https://crewpilot.zrgenesiscloud.com/legal/privacy` |
| `legal_user_agreement_url` | `https://crewpilot.zrgenesiscloud.com/legal/terms` |
| `legal_pii_collection_url` | `https://crewpilot.zrgenesiscloud.com/legal/pii-collection` |
| `legal_sdk_list_url` | `https://crewpilot.zrgenesiscloud.com/legal/sdk-list` |
| `legal_minor_protection_url` | `https://crewpilot.zrgenesiscloud.com/legal/minor-protection` |

> 这些值通过 `GET /api/v1/public/legal-info?app_id=crewpilot` 下发到所有 4 端，各端 WebView / 外部浏览器直接打开。

### 微信小程序业务域名白名单（运营动作）
- [ ] 在微信公众平台后台 → 开发管理 → 业务域名，添加 `crewpilot.zrgenesiscloud.com`
- [ ] 下载域名校验文件并放到 `zrgenesiscloud/src/assets/` 下，`angular.json` 的 `assets` 数组加入该文件

### 构建与部署
- [x] `npm run build` 确认新路由编译通过（`legal-doc-component` lazy chunk 46.97 kB）
- [ ] 确认 nginx / CDN 配置支持 Angular HTML5 路由（`try_files $uri $uri/ /index.html`），否则直接访问 `/legal/privacy` 会 404

---

## 五、上线 Checklist

- [ ] 所有 `{{占位符}}` 已替换完毕（无残留）
- [ ] 法务 sign-off 邮件已归档
- [ ] 5 个 URL 均可 HTTP 200 访问
- [ ] 手机浏览器访问可正常阅读（字号、行距适配移动端）
- [ ] 微信小程序 `<web-view>` 内可正常加载（域名白名单已配置）
- [ ] iOS `SFSafariViewController` 可正常加载
- [ ] Android 外部浏览器可正常加载
- [ ] admin 后台 `legal_*_url` 5 个默认值已填写并保存
