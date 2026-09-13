import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PublicAppsClient } from './public-apps.client';
import { AppEntry } from '../../../models/app.model';

const summary = { slug: 'app', name: 'App', tagline: '', subtitle: null, logo_url: 'https://example.com/logo.png', hero_image_url: null, tile_theme: 'light', sort_order: 0, primary_channel: null };
describe('PublicAppsClient presentation mapping', () => {
  let client: PublicAppsClient;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    client = TestBed.inject(PublicAppsClient); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('uses the provided logo when marketing hero imagery is absent', fakeAsync(() => {
    let apps: ReadonlyArray<AppEntry> = [];
    client.list().subscribe(value => apps = value);
    http.expectOne(req => req.url.endsWith('/public/apps')).flush({ items: [summary] });
    expect(apps[0].heroImage).toBe(summary.logo_url);
    expect(apps[0].logoImage).toBe(summary.logo_url);
    tick(30001);
  }));
  it('trims copied download URLs and maps APK channels, feature images and legal dates', fakeAsync(() => {
    let result: AppEntry | null = null;
    client.getBySlug('app').subscribe(value => result = value);
    http.expectOne(req => req.url.endsWith('/public/apps/app')).flush({ ...summary,
      channels: [{ type: 'apk', badge: 'web', label: '新渠道', url: '\thttps://example.com/app.apk ', available: true }],
      features: [{ title: 'feature', description: '', icon: null, image_url: 'https://example.com/feature.png' }],
      detail_images: [], privacy_updated_at: '2026-09-13',
    });
    const app = result as unknown as AppEntry;
    expect(app.platforms[0].url).toBe('https://example.com/app.apk');
    expect(app.platforms[0].badge).toBe('apk');
    expect(app.platforms[0].label).toBe('官网下载 APK');
    expect(app.features[0].imageUrl).toBe('https://example.com/feature.png');
    expect(app.updatedAt).toBe('2026-09-13');
    tick(30001);
  }));
});
