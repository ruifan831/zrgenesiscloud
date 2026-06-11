export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  apiBaseUrl: 'http://localhost:8000/api/v1',
  // Site metadata — update before launch
  icp: '',                            // ICP 备案号，待业务方提供
  companyName: 'ZRGenesis',
  contactEmail: 'support@zrgenesiscloud.com',
  shiftmateAppId: 'h1vfxv95s8',       // ShiftMate debug app_id

  // W-4 T-L4 / T-L5: ShiftMate 落地页下载链接（TBD = 等运营提供后填）
  // appStoreId 用于 Apple Smart Banner 的 app-id 字段
  shiftmate: {
    appStoreId: 'TBD',                // App Store Connect 应用 ID（数字）
    appStoreUrl: 'https://apps.apple.com/app/idTBD',
    testFlightUrl: 'https://testflight.apple.com/join/TBD',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.zrgenesiscloud.banguanjia',
    iosCustomScheme: 'shiftmate',     // iOS 自定义 URL scheme — Info.plist 注册后启用
    // Universal Link auto-open 超时：iOS 端打不开 App 多久后回退到 App Store
    autoOpenFallbackMs: 2500,
  },
};
