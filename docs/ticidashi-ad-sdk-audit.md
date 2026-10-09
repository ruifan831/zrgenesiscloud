# 提词器大师广告 SDK 核对（2026-09-13）

## 结论

两端均开启 GroMore 聚合模式；“开启聚合”不等于“已安装每家广告源”。本次仅核查本地代码、依赖与二进制，不涉及广告后台配置、真实广告填充或奖励结算验证，也未修改原生客户端依赖。

| 广告源 | iOS SDK / 适配器 | Android 当前状态 |
| --- | --- | --- |
| 穿山甲 / GroMore | Ads-CN-Beta BUAdSDK + CSJMediation 7.7.0.0 | mediation-sdk 7.6.1.1 |
| 优量汇 | GDTMobSDK 4.15.80 / GMGdtAdapter-Beta 4.15.80.1 | 缺少厂商 SDK 和适配器 |
| 百度 | BaiduMobAdSDK 10.050 / GMBaiduAdapter-Beta 10.050.0 | 缺少厂商 SDK 和适配器 |
| 快手 | KSAdSDK 5.3.20.1 / GMKsAdapter-Beta 5.3.20.1.1 | 缺少厂商 SDK 和适配器 |
| Sigmob | WindSDK 4.20.10 / GMSigmobAdapter-Beta 4.20.10.1 | 缺少厂商 SDK 和适配器 |

## 证据

- iOS：`../visioncue-ios/VisionCue/Platform/VisionAds.swift` 设置 `config.useMediation = true`；`../visioncue-ios/Podfile.lock` 锁定以上 SDK 与适配器，由 ZRKit/Ads 引入。
- Android：`../visioncue-android/app/build.gradle.kts` 引入聚合主 SDK；本地 Maven `com.zrgenesiscloud:ads:1.0.0` 的 sources.jar 中 `PangleSdkBootstrap.kt` 设置 `useMediation(true)`。
- Android `releaseRuntimeClasspath` 依赖报告：`../visioncue-android/build/qa/ads-audit-dependencies.log`，没有四家下游 SDK 或适配器。主 SDK AAR 的 classes.jar 也无 com.kwad.sdk、com.qq.e、com.baidu.mobads、com.sigmob.sdk 包；存在 com.bytedance.android.dy，因此隐私清单补充 Android 抖音 SDK。
- 参考班管家当前页面 `../scheduling-web/src/app/features/legal/privacy-policy.page.ts` 的逐 SDK 披露方式。旧 assets/legal/crewpilot 文档与现有广告接入不一致，不作为本次依据。

## 后续 Android 接入缺口

需补齐与主 SDK 匹配的四家 SDK 及适配器，核对厂商 Manifest/混淆规则、初始化隐私开关；完成 Debug/Release 构建、lint、启动及真实广告源验证后，将隐私披露对应范围扩大至 Android。可参考班管家的依赖组合，但不得复制班管家的 App ID 或广告位。

iOS 依赖齐全也仍须在本产品的 GroMore 后台配置对应广告源账号、应用与广告位，并逐源验证。当前未读取或修改该后台。

## 网站披露与部署

`src/assets/legal/ticidashi/privacy.md` 升至 1.1，分别披露主 SDK、四家下游、Android 抖音 SDK、支付宝以及系统服务。四家下游范围只写当前已接入的 iOS，避免误称 Android 已启用。

执行 `npm run test:legal`、`npm run build`。上传 `dist/zrgenesiscloud-browser.zip` 内的 browser 文件夹覆盖服务器原 browser 文件夹即可。隐私地址仍为 https://www.zrgenesiscloud.com/legal/ticidashi/privacy/ 。未执行生产部署。

官方核对入口：[GroMore iOS 初始化文档](https://www.csjplatform.com/supportcenter/28697)、[GroMore 合规指南](https://www.csjplatform.com/supportcenter/5879)。各平台政策链接见隐私正文。

## 后续更新：共享版本升级

2026-09-13 按用户指定在 AuthSDK 的 catalog/libs.versions.toml 中统一升级主 SDK 至 com.pangle_beta.cn:mediation-sdk:7.7.1.6；GDT / 百度 / KS / Sigmob adapter 分别为 4.680.1550.1 / 9.4503.1 / 5.3.20.1.1 / 4.25.14.1。发布本地 catalog:1.1.0 与 ads:1.1.0，提词器大师通过共享别名选择四家广告源及已有 ADN AAR。上文 Android 缺口为升级前记录，现已补齐依赖；隐私范围同步扩大至 Android。真实填充及奖励验证仍未完成。
