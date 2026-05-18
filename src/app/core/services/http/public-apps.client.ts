import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  AppEntry,
  DownloadChannel,
  AppFeature,
} from '../../../models/app.model';

// ---------------------------------------------------------------------------
// Raw DTO types matching backend PublicAppSummary / PublicAppDetail schemas
// (snake_case, from doonook-common/src/doonook_common/schemas/app_marketing.py)
// ---------------------------------------------------------------------------

interface PublicChannelDto {
  type: string;
  label: string;
  badge: string;
  url: string | null;
  primary: boolean;
  available: boolean;
  sort_order: number;
}

interface PublicFeatureDto {
  title: string;
  description: string;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
}

interface PublicImageDto {
  url: string;
  alt: string | null;
  sort_order: number;
}

interface PublicSeoInfoDto {
  title: string | null;
  description: string | null;
}

export interface PublicAppSummaryDto {
  slug: string;
  name: string;
  tagline: string;
  subtitle: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  tile_theme: string;
  sort_order: number;
  primary_channel: PublicChannelDto | null;
}

export interface PublicAppDetailDto extends PublicAppSummaryDto {
  description: string | null;
  hero_aspect: number | null;
  published_at: string | null;
  privacy_url: string | null;
  terms_url: string | null;
  privacy_updated_at: string | null;
  seo: PublicSeoInfoDto;
  channels: PublicChannelDto[];
  features: PublicFeatureDto[];
  detail_images: PublicImageDto[];
}

export interface PublicAppsListResponseDto {
  items: PublicAppSummaryDto[];
}

// ---------------------------------------------------------------------------
// Mapping helpers: snake_case DTO → AppEntry (camelCase)
// ---------------------------------------------------------------------------

function mapChannel(c: PublicChannelDto): DownloadChannel {
  return {
    type: c.type as DownloadChannel['type'],
    label: c.label,
    badge: c.badge as DownloadChannel['badge'],
    url: c.url ?? '',
    primary: c.primary,
    available: c.available,
  };
}

function mapFeature(f: PublicFeatureDto): AppFeature {
  return {
    title: f.title,
    description: f.description,
    icon: f.icon ?? '',
  };
}

function mapSummaryToEntry(raw: PublicAppSummaryDto): AppEntry {
  return {
    slug: raw.slug,
    name: raw.name,
    tagline: raw.tagline,
    subtitle: raw.subtitle ?? '',
    description: '',
    heroImage: raw.hero_image_url ?? '',
    heroAspect: undefined,
    detailImages: [],
    tileTheme: raw.tile_theme as AppEntry['tileTheme'],
    platforms: raw.primary_channel ? [mapChannel(raw.primary_channel)] : [],
    features: [],
    privacyUrl: undefined,
    termsUrl: undefined,
    publishedAt: undefined,
    isVisible: true,
    seo: {},
  };
}

function mapDetailToEntry(raw: PublicAppDetailDto): AppEntry {
  return {
    slug: raw.slug,
    name: raw.name,
    tagline: raw.tagline,
    subtitle: raw.subtitle ?? '',
    description: raw.description ?? '',
    heroImage: raw.hero_image_url ?? '',
    heroAspect: raw.hero_aspect ?? undefined,
    detailImages: raw.detail_images.map((img) => img.url),
    tileTheme: raw.tile_theme as AppEntry['tileTheme'],
    platforms: raw.channels.map(mapChannel),
    features: raw.features.map(mapFeature),
    privacyUrl: raw.privacy_url ?? undefined,
    termsUrl: raw.terms_url ?? undefined,
    publishedAt: raw.published_at ?? undefined,
    isVisible: true,
    seo: {
      title: raw.seo?.title ?? undefined,
      description: raw.seo?.description ?? undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// PublicAppsClient — thin HTTP wrapper around GET /public/apps[/{slug}]
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class PublicAppsClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /** Shared observable for list(); 30s window dedup */
  private listCache$: Observable<ReadonlyArray<AppEntry>> | null = null;
  private listCacheTimer: ReturnType<typeof setTimeout> | null = null;

  /** Per-slug detail cache */
  private detailCache = new Map<string, Observable<AppEntry | null>>();

  /**
   * GET /public/apps
   * Returns all visible apps ordered by sort_order.
   * Result is shared/cached for 30s within the same app instance.
   */
  list(): Observable<ReadonlyArray<AppEntry>> {
    if (!this.listCache$) {
      this.listCache$ = this.http
        .get<PublicAppsListResponseDto>(`${this.base}/public/apps`)
        .pipe(
          map((res) => res.items.map(mapSummaryToEntry)),
          shareReplay({ bufferSize: 1, refCount: false })
        );
      this.listCacheTimer = setTimeout(() => {
        this.listCache$ = null;
        this.listCacheTimer = null;
      }, 30_000);
    }
    return this.listCache$;
  }

  /**
   * GET /public/apps/{slug}
   * Returns full app detail, or null if slug not found (404).
   * Network errors / 5xx are propagated as Observable errors.
   */
  getBySlug(slug: string): Observable<AppEntry | null> {
    if (!this.detailCache.has(slug)) {
      const obs$ = this.http
        .get<PublicAppDetailDto>(`${this.base}/public/apps/${slug}`)
        .pipe(
          map(mapDetailToEntry),
          catchError((err) => {
            if (err.status === 404) {
              return of(null);
            }
            throw err;
          }),
          shareReplay({ bufferSize: 1, refCount: false })
        );
      this.detailCache.set(slug, obs$);
      setTimeout(() => this.detailCache.delete(slug), 30_000);
    }
    return this.detailCache.get(slug)!;
  }
}
