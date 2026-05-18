import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppEntry, DownloadChannel } from '../../../models/app.model';
import { PlatformBadgeComponent } from '../../../shared/ui/platform-badge/platform-badge.component';
import { ButtonPrimaryComponent } from '../../../shared/ui/button-primary/button-primary.component';
import { ProductImageComponent } from '../../../shared/ui/product-image/product-image.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    PlatformBadgeComponent,
    ButtonPrimaryComponent,
    ProductImageComponent,
  ],
  templateUrl: './app-hero-section.component.html',
  styleUrl: './app-hero-section.component.scss',
})
export class AppHeroSectionComponent {
  @Input() app!: AppEntry;

  get availablePlatforms(): DownloadChannel[] {
    return this.app.platforms.filter((p) => p.available !== false);
  }

  get primaryPlatform(): DownloadChannel | undefined {
    return (
      this.app.platforms.find((p) => p.primary && p.available !== false) ??
      this.availablePlatforms[0]
    );
  }
}
