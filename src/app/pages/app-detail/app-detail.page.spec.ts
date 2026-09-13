import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppDetailPage } from './app-detail.page';
import { AppCatalogService } from '../../core/services/app-catalog.service';
import { AppEntry } from '../../models/app.model';
import { appDetailResolver } from './app-detail.resolver';

const makeApp = (slug: string): AppEntry => ({ slug, name: slug, tagline: '应用介绍', subtitle: '', description: '', heroImage: '', tileTheme: 'light', features: [], platforms: [] });

describe('AppDetailPage navigation regression', () => {
  const first = makeApp('first');
  const second = { ...makeApp('second'), privacyUrl: 'https://example.com/privacy', termsUrl: 'https://example.com/terms' };
  beforeEach(() => TestBed.configureTestingModule({ providers: [
    provideRouter([{ path: 'apps/:slug', component: AppDetailPage, resolve: { app: appDetailResolver } }]),
    { provide: AppCatalogService, useValue: {
      list: () => of([first, second]),
      getBySlug: (slug: string) => of(slug === 'first' ? first : second),
    } },
  ] }));

  it('updates the reused detail component when navigating to another app', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/apps/first', AppDetailPage);
    expect(page.app?.name).toBe('first');
    const reused = await harness.navigateByUrl('/apps/second', AppDetailPage);
    expect(reused).toBe(page);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('second');
    expect(reused.otherApps.map(app => app.slug)).toEqual(['first']);
  });

  it('keeps download anchors on the current route and omits missing features', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/apps/first', AppDetailPage);
    const cta = harness.routeNativeElement!.querySelector<HTMLAnchorElement>('.sub-nav__cta')!;
    expect(cta.getAttribute('href')).toBe('/apps/first#download');
    expect(cta.target).toBe('');
    expect(harness.routeNativeElement!.querySelector('a[href$="#features"]')).toBeNull();
  });

  it('preserves external legal URLs without routing them under /apps', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/apps/second', AppDetailPage);
    const urls = Array.from(harness.routeNativeElement!.querySelectorAll('.legal-links a')).map(a => a.getAttribute('href'));
    expect(urls).toEqual(['https://example.com/privacy', 'https://example.com/terms']);
  });
});
