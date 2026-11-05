import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AppCatalogService } from './app-catalog.service';
import { PublicAppsListResponseDto } from './http/public-apps.client';

const MOCK_ITEMS: PublicAppsListResponseDto = {
  items: [
    {
      slug: 'calendar',
      name: '全民万年黄历通',
      tagline: '一本随身的黄历',
      subtitle: '传统万年历与现代日程管理完美结合',
      logo_url: null,
      hero_image_url: '/assets/images/calendar.png',
      tile_theme: 'dark',
      sort_order: 0,
      primary_channel: {
        type: 'android',
        label: '应用宝',
        badge: 'tencent-myapp',
        url: 'https://sj.qq.com/appdetail/com.zrgenesiscloud.chinesealmanc',
        primary: true,
        available: true,
        sort_order: 0,
      },
    },
    {
      slug: 'vision-cue',
      name: '全能提词器',
      tagline: '表达更流畅自信',
      subtitle: null,
      logo_url: null,
      hero_image_url: null,
      tile_theme: 'light',
      sort_order: 1,
      primary_channel: null,
    },
  ],
};

describe('AppCatalogService', () => {
  let service: AppCatalogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AppCatalogService,
      ],
    });
    service = TestBed.inject(AppCatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list() should return mapped apps from HTTP response', fakeAsync(() => {
    let result: ReadonlyArray<import('../../models/app.model').AppEntry> | undefined;
    service.list().subscribe((apps) => {
      result = apps;
    });

    const req = httpMock.expectOne((r) => r.url.includes('/public/apps') && !r.url.includes('/public/apps/'));
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_ITEMS);
    tick();

    expect(result).toBeDefined();
    expect(result!.length).toBe(2);
    expect(result![0].slug).toBe('calendar');
    expect(result![0].name).toBe('全民万年黄历通');
    expect(result![0].heroImage).toBe('/assets/images/calendar.png');
    expect(result![0].tileTheme).toBe('dark');
    tick(30_000);
  }));

  it('list() within 30s window should not issue a second HTTP request', fakeAsync(() => {
    service.list().subscribe();
    httpMock.expectOne((r) => r.url.includes('/public/apps') && !r.url.includes('/public/apps/')).flush(MOCK_ITEMS);
    tick();

    // Second subscription — should NOT issue another HTTP request
    service.list().subscribe();
    httpMock.expectNone((r) => r.url.includes('/public/apps') && !r.url.includes('/public/apps/'));
    tick(30_000);
  }));

  it('getBySlug() should return app detail from HTTP', fakeAsync(() => {
    let result: import('../../models/app.model').AppEntry | null | undefined;
    service.getBySlug('calendar').subscribe((app) => {
      result = app;
    });

    const req = httpMock.expectOne((r) => r.url.includes('/public/apps/calendar'));
    expect(req.request.method).toBe('GET');
    req.flush({
      app_id: 'calendar-app',
      slug: 'calendar',
      name: '全民万年黄历通',
      tagline: '一本随身的黄历',
      subtitle: null,
      logo_url: null,
      hero_image_url: '/assets/images/calendar.png',
      hero_aspect: 1.0,
      tile_theme: 'dark',
      sort_order: 0,
      primary_channel: null,
      description: '全面的安卓日历应用',
      published_at: '2024-01-01',
      privacy_url: '/legal/calendar/privacy/',
      terms_url: null,
      privacy_updated_at: null,
      seo: { title: '全民万年黄历通 — ZRGenesis', description: '日历应用' },
      channels: [],
      features: [],
      detail_images: [],
    });
    tick();

    expect(result).toBeDefined();
    expect(result!.slug).toBe('calendar');
    expect(result!.description).toBe('全面的安卓日历应用');
    expect(result!.heroAspect).toBe(1.0);
    tick(30_000);
  }));

  it('getBySlug() should return null on 404', fakeAsync(() => {
    let result: import('../../models/app.model').AppEntry | null | undefined;
    service.getBySlug('not-found').subscribe((app) => {
      result = app;
    });

    const req = httpMock.expectOne((r) => r.url.includes('/public/apps/not-found'));
    req.flush({ detail: 'App not found' }, { status: 404, statusText: 'Not Found' });
    tick();

    expect(result).toBeNull();
    tick(30_000);
  }));

  it('getFeatured() should return same Observable as list()', fakeAsync(() => {
    let result: ReadonlyArray<import('../../models/app.model').AppEntry> | undefined;
    service.getFeatured().subscribe((apps) => {
      result = apps;
    });

    httpMock.expectOne((r) => r.url.includes('/public/apps') && !r.url.includes('/public/apps/')).flush(MOCK_ITEMS);
    tick();

    expect(result).toBeDefined();
    expect(result!.length).toBe(2);
    tick(30_000);
  }));

  it('refreshes the server product list after the cache expires', fakeAsync(() => {
    service.list().subscribe();
    httpMock.expectOne(r => r.url.endsWith('/public/apps')).flush(MOCK_ITEMS);
    tick(29_999);
    service.list().subscribe();
    httpMock.expectNone(r => r.url.endsWith('/public/apps'));
    tick(1);
    let names: string[] = [];
    service.list().subscribe(apps => names = apps.map(app => app.name));
    httpMock.expectOne(r => r.url.endsWith('/public/apps')).flush({items: [{...MOCK_ITEMS.items[0], name: '服务器更新的产品名'}]});
    expect(names).toEqual(['服务器更新的产品名']);
    tick(30_000);
  }));

  it('recovers after a server error without substituting a static product list', fakeAsync(() => {
    let status = 0;
    service.list().subscribe({error: error => status = error.status});
    httpMock.expectOne(r => r.url.endsWith('/public/apps')).flush({}, {status: 503, statusText: 'Unavailable'});
    expect(status).toBe(503);
    let count = -1;
    service.list().subscribe(apps => count = apps.length);
    httpMock.expectOne(r => r.url.endsWith('/public/apps')).flush(MOCK_ITEMS);
    expect(count).toBe(2);
    tick(30_000);
  }));
});
