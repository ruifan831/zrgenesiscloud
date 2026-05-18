import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, map, of, EMPTY, catchError } from 'rxjs';

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

  readonly subNavLinks = SUB_NAV_LINKS;

  ngOnInit(): void {
    // Resolver puts the result in route.snapshot.data['app']
    const resolved = this.route.snapshot.data['app'] as AppEntry | null | undefined;

    if (resolved === null || resolved === undefined) {
      // Resolver returned null (404) or EMPTY (network error already redirected)
      // If null (not found), redirect to home
      this.app = null;
      this.router.navigate(['/']);
      return;
    }

    this.app = resolved;
    this.meta.setForApp(resolved);

    // Derive otherApps from list() observable
    this.otherApps$ = this.catalog.list().pipe(
      map((apps) => apps.filter((a) => a.slug !== resolved.slug)),
      catchError(() => of([]))
    );

    // Subscribe once to populate synchronous otherApps for template
    this.otherApps$.subscribe((apps) => {
      this.otherApps = apps;
    });
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
