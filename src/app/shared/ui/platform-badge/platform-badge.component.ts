import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformBadgeStyle } from '../../../models/app.model';

@Component({
  selector: 'ui-platform-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './platform-badge.component.html',
  styleUrl: './platform-badge.component.scss',
})
export class PlatformBadgeComponent {
  @Input() badge!: PlatformBadgeStyle;
  @Input() label = '';
  @Input() href = '';
  @Input() subLabel?: string;
  @Input() disabled = false;

  @Output() clicked = new EventEmitter<void>();

  get badgeClass(): string {
    return `badge--${this.badge}`;
  }

  onBadgeClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    this.clicked.emit();
  }

  /** Human-readable label fallback if not supplied */
  get displayLabel(): string {
    if (this.label) return this.label;
    const defaults: Record<PlatformBadgeStyle, string> = {
      'appstore':      'App Store',
      'google-play':   'Google Play',
      'apk':           '官网 APK',
      'tencent-myapp': '应用宝',
      'wechat-mp':     '微信小程序',
      'web':           '网页版',
    };
    return defaults[this.badge] ?? this.badge;
  }
}
