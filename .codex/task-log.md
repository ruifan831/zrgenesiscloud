# Public Site Task Log

Use this log for public Angular site work under `zrgenesiscloud`.

If a public-site feature also changes the FastAPI server, record the server-side
portion in `../doonook_temp/.codex/task-log.md`.

Historical public-site entries before this split remain in
`../.codex/task-log.md`.

## 2026-05-17 - 添加闪映与安卓下载入口

- Added the new public product route `products/shanying` with app icon, screenshots,
  feature copy, earnings explanation, and Android marketplace download links.
- Added shared download-channel and earnings-step data under
  `src/app/products/product-downloads.ts` so new app store links can be appended in
  one place.
- Updated the product list, home product cards, calendar detail page, footer,
  about copy, and contact FAQ to include 闪映, Android-focused download guidance,
  and invite/earnings explanations for 全民万年黄历通 and 闪映.
- Added 应用宝 links for 全民万年黄历通 and 闪映, plus the existing official website
  APK direct link for 闪映. The 黄历 UI notes that an official APK entry can be
  added once a real URL is configured.
- Downloaded current Tencent 应用宝 app icon/screenshots for 闪映 and screenshots
  for 全民万年黄历通 into `src/assets/images`.
- Verification: `npm run build` succeeds after refreshing a corrupted local
  `node_modules` install with `npm ci`. Build still prints the existing Node 25
  odd-version warning and Angular LESS inline JavaScript deprecation warning.
