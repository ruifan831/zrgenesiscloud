import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppCatalogService } from '../../core/services/app-catalog.service';
import { AppEntry } from '../../models/app.model';
import { MetaService } from '../../shared/seo/meta.service';

@Component({
  selector: 'zrgenesiscloud-privacy-index-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './privacy-index.page.html',
  styleUrl: './privacy-index.page.scss',
})
export class PrivacyIndexPage implements OnInit {
  private catalog = inject(AppCatalogService);
  private metaService = inject(MetaService);

  apps$: Observable<ReadonlyArray<AppEntry>> = of([]);

  ngOnInit(): void {
    this.metaService.setForPrivacyIndex();
    this.apps$ = this.catalog.list().pipe(
      catchError(() => of([]))
    );
  }

  /** Returns platform labels for an app, e.g. 'Android' */
  getPlatformLabels(app: AppEntry): string[] {
    const types = new Set(app.platforms.map((p) => p.type));
    const labels: string[] = [];
    if (types.has('android')) labels.push('Android');
    if (types.has('ios')) labels.push('iOS');
    if (types.has('miniprogram')) labels.push('微信小程序');
    if (types.has('web')) labels.push('Web');
    return labels;
  }
}
