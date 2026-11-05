import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { of, throwError } from 'rxjs';
import { PublicAppsClient } from './core/services/http/public-apps.client';
import { AppEntry } from './models/app.model';

const app = (slug: string): AppEntry => ({slug, name: `产品 ${slug}`, tagline: '', subtitle: '', description: '', heroImage: '', tileTheme: 'light', platforms: [], features: []});

describe('app.routes — redirects (§8 URL compat)', () => {
  let router: Router;
  let harness: RouterTestingHarness;
  let client: jasmine.SpyObj<PublicAppsClient>;

  beforeEach(async () => {
    client = jasmine.createSpyObj('PublicAppsClient', ['list', 'getBySlug']);
    client.list.and.returnValue(of([]));
    client.getBySlug.and.callFake(slug => of(app(slug)));
    TestBed.configureTestingModule({
      // Real router, resolver and pages; only the HTTP boundary is replaced.
      providers: [provideRouter(routes), {provide: PublicAppsClient, useValue: client}],
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  it('/products/calendar → /apps/calendar', async () => {
    await harness.navigateByUrl('/products/calendar');
    expect(router.url).toBe('/apps/calendar');
  });

  it('/products/vision-cue → /apps/vision-cue', async () => {
    await harness.navigateByUrl('/products/vision-cue');
    expect(router.url).toBe('/apps/vision-cue');
  });

  it('/products/shanying → /apps/shanying', async () => {
    await harness.navigateByUrl('/products/shanying');
    expect(router.url).toBe('/apps/shanying');
  });

  it('supports a newly registered server product without adding a route', async () => {
    await harness.navigateByUrl('/products/new-server-product');
    expect(router.url).toBe('/apps/new-server-product');
    expect(client.getBySlug).toHaveBeenCalledOnceWith('new-server-product');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('产品 new-server-product');
    expect(routes.filter(route => route.path?.startsWith('products/')).map(route => route.path)).toEqual(['products/:slug']);
  });

  it('lets the backend resolve an old slug to the current product', async () => {
    client.getBySlug.and.returnValue(of(app('current-product')));
    await harness.navigateByUrl('/products/old-product');
    expect(client.getBySlug).toHaveBeenCalledOnceWith('old-product');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('产品 current-product');
    expect(document.title).toContain('产品 current-product');
  });

  it('returns home when the backend does not recognize the old slug', async () => {
    client.getBySlug.and.returnValue(of(null));
    await harness.navigateByUrl('/products/missing-product');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/');
  });

  it('handles server failure on an old URL without rendering a broken detail page', async () => {
    client.getBySlug.and.returnValue(throwError(() => ({status: 503})));
    await harness.navigateByUrl('/products/unavailable-product');
    await harness.fixture.whenStable();
    expect(router.url).toBe('/?error=fetch_failed');
    expect(harness.routeNativeElement?.tagName).not.toBe('PAGE-APP-DETAIL');
  });

  it('/products → /', async () => {
    await harness.navigateByUrl('/products');
    expect(router.url).toBe('/');
  });

  it('/about → /', async () => {
    await harness.navigateByUrl('/about');
    expect(router.url).toBe('/');
  });

  it('** (unknown path) → /', async () => {
    await harness.navigateByUrl('/nonsense-path');
    expect(router.url).toBe('/');
  });

  // These should NOT be redirected
  it('uses the shared product legal route without retired aliases', () => {
    expect(routes.some(route => route.path === 'legal/:product/:slug')).toBeTrue();
    for (const path of ['privacy/calendar', 'privacy/teleprompter', 'calendar/privacy', 'calendar/user-agreement']) {
      expect(routes.some(route => route.path === path)).toBeFalse();
    }
  });

  it('/privacy-policy should not redirect', async () => {
    await harness.navigateByUrl('/privacy-policy');
    expect(router.url).toBe('/privacy-policy');
  });
});
