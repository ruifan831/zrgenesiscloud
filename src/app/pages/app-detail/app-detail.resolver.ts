import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppEntry } from '../../models/app.model';
import { AppCatalogService } from '../../core/services/app-catalog.service';

export const appDetailResolver: ResolveFn<AppEntry | null> = (route) => {
  const svc = inject(AppCatalogService);
  const router = inject(Router);
  const slug = route.paramMap.get('slug') ?? '';

  return svc.getBySlug(slug).pipe(
    catchError((err) => {
      if (err?.status === 404) {
        return of(null);
      }
      // Network / 5xx: navigate home with error query param
      router.navigate(['/'], { queryParams: { error: 'fetch_failed' } });
      return EMPTY;
    })
  );
};
