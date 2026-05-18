import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppEntry, AppTileTheme, DownloadChannel } from '../../../models/app.model';
import { ButtonPrimaryComponent } from '../button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '../button-secondary/button-secondary.component';
import { PlatformBadgeComponent } from '../platform-badge/platform-badge.component';
import { ProductImageComponent } from '../product-image/product-image.component';

@Component({
  selector: 'ui-product-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    ButtonPrimaryComponent,
    ButtonSecondaryComponent,
    PlatformBadgeComponent,
    ProductImageComponent,
  ],
  templateUrl: './product-tile.component.html',
  styleUrl: './product-tile.component.scss',
})
export class ProductTileComponent {
  @Input() app!: AppEntry;
  /** Override tile theme; defaults to app.tileTheme */
  @Input() surface?: AppTileTheme;
  /** Image layout variant */
  @Input() layout: 'image-right' | 'image-left' | 'image-bottom' = 'image-right';

  @Output() primaryCta = new EventEmitter<void>();
  @Output() secondaryCta = new EventEmitter<void>();

  /** Resolved theme: explicit surface input wins, else falls back to app.tileTheme */
  get resolvedTheme(): AppTileTheme {
    return this.surface ?? this.app?.tileTheme ?? 'light';
  }

  /** Primary download channel (primary: true, or first available) */
  get primaryChannel(): DownloadChannel | undefined {
    return this.app?.platforms?.find((p) => p.primary && p.available && p.url)
      ?? this.app?.platforms?.find((p) => p.available && p.url);
  }

  /** Whether the primary download channel has a working URL */
  get hasDownload(): boolean {
    return !!(this.primaryChannel?.url);
  }

  get tileClass(): string {
    const map: Record<AppTileTheme, string> = {
      light: 'surface-light',
      parchment: 'surface-parchment',
      dark: 'surface-tile-dark',
    };
    return map[this.resolvedTheme] ?? 'surface-light';
  }

  get isDark(): boolean {
    return this.resolvedTheme === 'dark';
  }

  get detailRoute(): string {
    return `/apps/${this.app?.slug}`;
  }

  onPrimaryCtaClick(): void {
    this.primaryCta.emit();
  }

  onSecondaryCtaClick(): void {
    this.secondaryCta.emit();
  }
}
