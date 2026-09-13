import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  DestroyRef,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, map, of, catchError, switchMap } from 'rxjs';

import { AppEntry } from '../../models/app.model';
import { AppCatalogService } from '../../core/services/app-catalog.service';
import { MetaService } from '../../shared/seo/meta.service';

import { SubNavFrostedComponent } from '../../shared/ui/sub-nav-frosted/sub-nav-frosted.component';
import { AppHeroSectionComponent } from './sections/app-hero-section.component';
import { FeatureGridComponent } from './sections/feature-grid.component';
import { PlatformDownloadGridComponent } from './sections/platform-download-grid.component';
import { LegalLinksComponent } from './sections/legal-links.component';

const SUB_NAV_LINKS = [
  { label: '功能', fragment: 'features' },
  { label: '下载', fragment: 'download' },
  { label: '协议', fragment: 'privacy-terms' },
];

@Component({
  selector: 'page-app-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    SubNavFrostedComponent,
    AppHeroSectionComponent,
    FeatureGridComponent,
    PlatformDownloadGridComponent,
    LegalLinksComponent,
  ],
  templateUrl: './app-detail.page.html',
  styleUrl: './app-detail.page.scss',
})
export class AppDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(AppCatalogService);
  private readonly meta = inject(MetaService);

  /** Resolved by appDetailResolver; null means not found */
  app: AppEntry | null = null;
  otherApps: ReadonlyArray<AppEntry> = [];
  otherApps$: Observable<ReadonlyArray<AppEntry>> = of([]);

  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  get subNavLinks() {
    return SUB_NAV_LINKS.filter(link => link.fragment !== 'features' || !!this.app?.features.length);
  }

  ngOnInit(): void {
    this.route.data.pipe(
      switchMap(data => {
        const resolved = data['app'] as AppEntry | null;
        this.app = resolved;
        if (!resolved) {
          this.router.navigate(['/']);
          return of([] as AppEntry[]);
        }
        this.meta.setForApp(resolved);
        return this.catalog.list().pipe(
          map(apps => apps.filter(app => app.slug !== resolved.slug)),
          catchError(() => of([] as AppEntry[]))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(apps => { this.otherApps = apps; this.cdr.markForCheck(); });
  }

  /** For sub-nav "下载" CTA: scroll to #download if multiple platforms,
   *  otherwise open the first available platform URL directly. */
  get subNavCta(): { label: string; href: string } {
    if (!this.app) {
      return { label: '下载', href: '#download' };
    }
    const available = this.app.platforms.filter((p) => p.available !== false && p.url);
    if (available.length === 1 && available[0].url) {
      return { label: '下载', href: available[0].url };
    }
    return { label: '下载', href: '#download' };
  }
}
