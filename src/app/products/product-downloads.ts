export interface DownloadChannel {
  label: string;
  shortLabel: string;
  icon: string;
  url: string;
}

export interface EarningStep {
  title: string;
  description: string;
  icon: string;
}

export const ANDROID_DOWNLOAD_CHANNELS: Record<string, DownloadChannel[]> = {
  calendar: [
    {
      label: '应用宝',
      shortLabel: '宝',
      icon: 'android',
      url: 'https://sj.qq.com/appdetail/com.zrgenesiscloud.chinesealmanc'
    }
  ],
  shanying: [
    {
      label: '官网 APK',
      shortLabel: '官',
      icon: 'cloud-download',
      url: 'https://www.zrgenesiscloud.com/static/apps/hrf0ycqjgu/android/app-2.0.8-208.apk'
    },
    {
      label: '应用宝',
      shortLabel: '宝',
      icon: 'android',
      url: 'https://sj.qq.com/appdetail/sy.com.app'
    }
  ]
};

export const APP_EARNING_STEPS: EarningStep[] = [
  {
    title: '邀请好友',
    description: '分享邀请链接或邀请码，好友注册后会绑定邀请关系。',
    icon: 'user-add'
  },
  {
    title: '有效使用',
    description: '好友完成有效浏览、签到或激励广告任务后，系统按应用内规则记录收益。',
    icon: 'play-circle'
  },
  {
    title: '收益到账',
    description: '累计收益达到门槛后，可在应用内按平台规则申请兑换或提现。',
    icon: 'wallet'
  }
];

export const CALENDAR_DOWNLOAD_NOTE = '官网 APK 直链配置后，会在这里追加“官网”入口。';

export const SHANYING_DOWNLOAD_NOTE = '已提供应用宝与官网 APK，后续可继续补充更多安卓应用市场。';
