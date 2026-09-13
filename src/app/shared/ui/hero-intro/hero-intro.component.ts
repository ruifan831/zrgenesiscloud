import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppEntry } from '../../../models/app.model';
import { ProductImageComponent } from '../product-image/product-image.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ui-hero-intro',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ProductImageComponent],
  templateUrl: './hero-intro.component.html',
  styleUrl: './hero-intro.component.scss',
})
export class HeroIntroComponent {
  @Input() apps: ReadonlyArray<AppEntry> = [];
  /** Primary CTA label, defaults to "浏览全部应用" */
  @Input() primaryLabel = '浏览全部应用';
  /** ID of the apps section to scroll to */
  @Input() appsAnchor = 'apps';
  /** Secondary CTA: featured app slug for "了解某明星 App" */
  @Input() featuredAppSlug = 'calendar';
  /** Secondary CTA label */
  @Input() featuredAppLabel = '全民万年黄历通';
}
