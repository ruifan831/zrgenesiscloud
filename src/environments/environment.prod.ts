export const environment = {
  production: true,
  apiUrl: 'https://www.zrgenesiscloud.com',
  apiBaseUrl: 'https://www.zrgenesiscloud.com/api/v1',
  // Site metadata — update before launch
  icp: '',                            // ICP 备案号，待业务方提供
  companyName: 'ZRGenesis',
  contactEmail: 'support@zrgenesiscloud.com',
  shiftmateAppId: 'sl85pwpqci',       // ShiftMate release app_id

  // W-4 T-L4 / T-L5: ShiftMate 落地页下载链接（TBD = 等运营提供后填）
  shiftmate: {
    appStoreId: 'TBD',
    appStoreUrl: 'https://apps.apple.com/app/idTBD',
    testFlightUrl: 'https://testflight.apple.com/join/TBD',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.zrgenesiscloud.banguanjia',
    iosCustomScheme: 'shiftmate',
    autoOpenFallbackMs: 2500,
  },
};
