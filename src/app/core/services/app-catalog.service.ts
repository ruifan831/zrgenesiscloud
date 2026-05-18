import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AppEntry } from '../../models/app.model';
import { PublicAppsClient } from './http/public-apps.client';

@Injectable({ providedIn: 'root' })
export class AppCatalogService {
  private readonly client = inject(PublicAppsClient);

  /** Returns all visible apps as Observable. Result cached 30s in-memory. */
  list(): Observable<ReadonlyArray<AppEntry>> {
    return this.client.list();
  }

  /**
   * Returns app by slug as Observable.
   * Emits null if not found (HTTP 404).
   * Throws Observable error for network / 5xx failures.
   */
  getBySlug(slug: string): Observable<AppEntry | null> {
    return this.client.getBySlug(slug);
  }

  /** Returns all visible apps (same as list()); alias kept for compatibility. */
  getFeatured(): Observable<ReadonlyArray<AppEntry>> {
    return this.client.list();
  }
}
