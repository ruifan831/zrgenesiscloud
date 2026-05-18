// App data model — aligned with doonook-common app_registry.platform enum

/** 平台类型：与后端 app_registry.platform 枚举一致 */
export type AppPlatformType = 'android' | 'ios' | 'miniprogram' | 'web';

/** 下载渠道类型（比 AppPlatformType 多 apk） */
export type DownloadChannelType = AppPlatformType | 'apk';

/** 平台徽章视觉变体；platform-badge 组件根据它决定样式与图标 */
export type PlatformBadgeStyle =
  | 'appstore'       // App Store 黑底白字
  | 'google-play'    // Google Play 黑底白字
  | 'apk'            // 官网 APK 直链（中性灰）
  | 'tencent-myapp'  // 应用宝
  | 'wechat-mp'      // 微信小程序
  | 'web';           // 通用 Web 入口

export interface DownloadChannel {
  type: DownloadChannelType;
  label: string;           // 显示文案，如 "App Store"、"应用宝"
  url: string;             // 跳转地址（disabled 时仍需存字段，UI 层 disabled 处理）
  badge: PlatformBadgeStyle;
  /** 是否在首页 tile 的"立即下载" CTA 中作为默认外链（一个 App 至多一个 primary） */
  primary?: boolean;
  /** false 时 UI 渲染 disabled 状态，不跳转 */
  available?: boolean;
}

export interface AppFeature {
  title: string;       // 6–12 字
  description: string; // 20–60 字
  icon: string;        // 图标 key / SVG 资产路径
}

export type AppTileTheme = 'light' | 'parchment' | 'dark';

export interface AppEntry {
  slug: string;          // URL 标识：calendar | vision-cue | shanying
  name: string;          // 全民万年黄历通
  tagline: string;       // ≤10 字
  subtitle: string;      // 20–40 字
  description: string;   // 80–200 字
  heroImage: string;     // /assets/images/calendar.png 或后端 hero_image_url
  /** Width/height ratio for heroImage. 1 = square logo (default), 0.56 = portrait phone screenshot. */
  heroAspect?: number;
  detailImages?: string[];
  platforms: DownloadChannel[];
  features: AppFeature[];
  privacyUrl?: string;   // /privacy/calendar
  termsUrl?: string;
  publishedAt?: string;  // YYYY-MM-DD
  updatedAt?: string;
  tileTheme: AppTileTheme;
  /** 公网 API 返回时始终为 true（已经过 is_visible 过滤） */
  isVisible?: boolean;
  /** 详情页 meta */
  seo?: { title?: string; description?: string; ogImage?: string };
}
