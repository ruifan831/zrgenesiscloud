import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { Component } from '@angular/core';

// Minimal stub component so lazy-load paths don't need real modules
@Component({ standalone: true, template: '' })
class StubComponent {}

describe('app.routes — redirects (§8 URL compat)', () => {
  let router: Router;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
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
  it('/privacy/calendar should not redirect', async () => {
    await harness.navigateByUrl('/privacy/calendar');
    expect(router.url).toBe('/privacy/calendar');
  });

  it('/privacy/teleprompter should not redirect', async () => {
    await harness.navigateByUrl('/privacy/teleprompter');
    expect(router.url).toBe('/privacy/teleprompter');
  });

  it('/privacy-policy should not redirect', async () => {
    await harness.navigateByUrl('/privacy-policy');
    expect(router.url).toBe('/privacy-policy');
  });
});
