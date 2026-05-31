# 班管家（CrewPilot）第三方 SDK 信息共享清单

> 版本：1.0（草案）  
> 审计日期：2026-05-31  
> 审计结论：截至本版本，班管家**未集成任何第三方数据采集 SDK**（见下方说明）  
<!-- TODO 法务审核 -->

---

## 待填字段清单

| 占位符 | 说明 | 填写责任方 |
|--------|------|-----------|
| `{{LAST_UPDATED_DATE}}` | 本清单最近更新日期 | 运营（每次集成新 SDK 时更新） |
| `{{COMPANY_NAME}}` | 公司全称 | 运营/法务 |
| `{{CONTACT_EMAIL}}` | 联系邮箱 | 运营 |

---

## 一、声明

班管家（CrewPilot）本版本**未集成任何第三方数据采集、广告投放、行为分析或用户画像 SDK**。

本清单依据《移动互联网应用程序个人信息保护管理暂行规定》（工信部令第 49 号）及 GB/T 41391-2022 标准要求制定，列出应用中涉及个人信息处理的所有第三方软件开发工具包（SDK）。

**审计依据**：已对以下位置进行代码审计，未发现第三方数据 SDK 集成：

- Android：`app/build.gradle.kts` 依赖声明、`MyApplication.kt` 初始化代码
- iOS：`Package.swift` / `Podfile` 依赖声明、`AppDelegate.swift` 初始化代码
- 微信小程序：`app.json` 插件声明、`package.json` 依赖

---

## 二、当前 SDK 集成列表

### 2.1 推送通知（系统级，非数据采集 SDK）

| 名称 | 提供方 | 用途 | 共享的个人信息 | 信息用途 | 官方隐私政策 |
|------|--------|------|----------------|----------|--------------|
| Firebase Cloud Messaging (FCM) | Google LLC | Android 推送通知 | 设备 FCM token（设备唯一标识符，不含其他个人信息） | 仅用于向该设备推送通知，Google 不将 token 用于广告 | https://firebase.google.com/support/privacy |
| Apple Push Notification service (APNs) | Apple Inc. | iOS 推送通知 | 设备 APNs token（设备唯一标识符） | 仅用于向该设备推送通知 | https://www.apple.com/legal/privacy/ |
| 微信推送 | 深圳市腾讯计算机系统有限公司 | 微信小程序消息推送 | 微信 OpenID（不含个人身份信息） | 仅用于向用户发送小程序消息 | https://weixin.qq.com/cgi-bin/readtemplate?t=weixin_agreement&s=privacy |

> 说明：上述三个推送服务为**操作系统/平台级基础服务**，不属于"第三方数据采集 SDK"范畴。token 仅用于消息路由，我们不将其与个人身份信息关联后提供给上述平台。

### 2.2 图片存储（基础设施，非 SDK）

| 名称 | 提供方 | 用途 | 共享数据 | 官方隐私政策 |
|------|--------|------|----------|--------------|
| Cloudflare R2 | Cloudflare, Inc. | 用户头像存储 | 用户上传的头像图片（无个人身份信息关联） | https://www.cloudflare.com/privacypolicy/ |

---

## 三、未集成的典型 SDK 说明

以下是移动应用常见的数据采集类 SDK，班管家**均未集成**：

| SDK 类型 | 例子 | 未集成原因 |
|----------|------|-----------|
| 行为分析 | 友盟、神策、Firebase Analytics | 产品不需要第三方埋点 |
| 崩溃监控 | Sentry、Firebase Crashlytics | 暂未接入 |
| 广告投放 | 穿山甲、优量汇、AdMob | 产品无广告 |
| IM 通讯 | 环信、容联 | 产品无站内 IM |

---

## 四、未来更新承诺

如我们在未来版本中集成任何涉及个人信息处理的第三方 SDK，将在集成前：

1. 更新本清单
2. 通知用户并（如需）重新获取同意
3. 审查 SDK 提供方的隐私政策合规性

---

## 五、联系我们

如对本清单有任何疑问，请联系：

- **公司名称**：{{COMPANY_NAME}}
- **联系邮箱**：{{CONTACT_EMAIL}}

*最后更新：{{LAST_UPDATED_DATE}}*
