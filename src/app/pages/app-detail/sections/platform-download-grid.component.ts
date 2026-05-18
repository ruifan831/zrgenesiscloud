import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadChannel } from '../../../models/app.model';

interface PlatformCardVm {
  channel: DownloadChannel;
  captionText: string;
  iconEmoji: string;
}

const PLATFORM_CAPTIONS: Record<string, string> = {
  'tencent-myapp': '在应用宝下载',
  'appstore':      '在 App Store 下载',
  'google-play':   '在 Google Play 下载',
  'apk':           '官网直链下载',
  'wechat-mp':     '微信扫码访问',
  'web':           '网页版访问',
};

const PLATFORM_ICONS: Record<string, string> = {
  'tencent-myapp': '🤖',
  'appstore':      '📱',
  'google-play':   '▶',
  'apk':           '📦',
  'wechat-mp':     '🟢',
  'web':           '🌐',
};

@Component({
  selector: 'app-platform-download-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './platform-download-grid.component.html',
  styleUrl: './platform-download-grid.component.scss',
})
export class PlatformDownloadGridComponent {
  @Input() channels: DownloadChannel[] = [];

  get platformCards(): PlatformCardVm[] {
    return this.channels.map((ch) => ({
      channel: ch,
      captionText: PLATFORM_CAPTIONS[ch.badge] ?? `在 ${ch.label} 下载`,
      iconEmoji: PLATFORM_ICONS[ch.badge] ?? '📲',
    }));
  }

  isAvailable(channel: DownloadChannel): boolean {
    return channel.available !== false && !!channel.url;
  }
}
