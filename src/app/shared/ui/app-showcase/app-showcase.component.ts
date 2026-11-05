import { ChangeDetectionStrategy, Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { AppEntry } from '../../../models/app.model';
import { AppCatalogService } from '../../../core/services/app-catalog.service';

@Component({
  selector: 'ui-app-showcase',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-showcase.component.html',
  styleUrl: './app-showcase.component.scss',
})
export class AppShowcaseComponent implements OnChanges {
  @Input({ required: true }) app!: AppEntry;
  @Input() cool = false;
  private readonly catalog = inject(AppCatalogService);
  image$: Observable<string> = of('');
  failedImage = '';
  logoFailed = false;
  portrait = false;

  ngOnChanges(): void {
    this.failedImage = '';
    this.logoFailed = false;
    this.portrait = false;
    // Summary remains visible while optional, cached marketing imagery arrives.
    // No product-specific local image/name or app-id fallback.
    this.image$ = this.catalog.getBySlug(this.app.slug).pipe(
      map(detail => detail?.detailImages?.[0] || detail?.heroImage || this.app.heroImage),
      catchError(() => of(this.app.heroImage)),
      startWith(this.app.heroImage),
    );
  }

  imageLoaded(event: Event): void {
    const image = event.target as HTMLImageElement;
    this.portrait = image.naturalHeight > image.naturalWidth * 1.3;
  }
}
