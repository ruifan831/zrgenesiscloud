import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { ProductTileComponent } from './product-tile.component';
import { AppEntry } from '../../../models/app.model';

const mockApp: AppEntry = {
  slug: 'calendar',
  name: '全民万年黄历通',
  tagline: '一本随身的黄历',
  subtitle: '传统万年历与现代日程管理完美结合',
  description: '...',
  heroImage: '/assets/images/calendar.png',
  tileTheme: 'dark',
  platforms: [
    {
      type: 'android',
      label: '应用宝',
      badge: 'tencent-myapp',
      url: 'https://sj.qq.com/appdetail/com.zrgenesiscloud.chinesealmanc',
      primary: true,
      available: true,
    },
  ],
  features: [],
};

const mockAppNoDownload: AppEntry = {
  slug: 'vision-cue',
  name: '全能提词器',
  tagline: '表达更流畅自信',
  subtitle: '专业提词器',
  description: '...',
  heroImage: '/assets/images/teleprompter-app.jpg',
  tileTheme: 'light',
  platforms: [
    {
      type: 'ios',
      label: 'App Store',
      badge: 'appstore',
      url: '',
      primary: false,
      available: false,
    },
  ],
  features: [],
};

/** Helper to create a component with given app/surface inputs */
async function createFixture(
  app: AppEntry,
  surface?: 'light' | 'parchment' | 'dark'
): Promise<ComponentFixture<ProductTileComponent>> {
  await TestBed.configureTestingModule({
    imports: [ProductTileComponent, RouterTestingModule],
  }).compileComponents();
  const fixture = TestBed.createComponent(ProductTileComponent);
  fixture.componentInstance.app = app;
  if (surface) {
    fixture.componentInstance.surface = surface;
  }
  fixture.detectChanges();
  return fixture;
}

describe('ProductTileComponent', () => {
  let component: ProductTileComponent;
  let fixture: ComponentFixture<ProductTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTileComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTileComponent);
    component = fixture.componentInstance;
    component.app = mockApp;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render App name', () => {
    const h2 = fixture.debugElement.query(By.css('.product-tile__name'));
    expect(h2.nativeElement.textContent).toContain('全民万年黄历通');
  });

  it('should render App tagline as eyebrow', () => {
    const eyebrow = fixture.debugElement.query(By.css('.product-tile__eyebrow'));
    expect(eyebrow.nativeElement.textContent).toContain('一本随身的黄历');
  });

  it('should render App subtitle', () => {
    const subtitle = fixture.debugElement.query(By.css('.product-tile__subtitle'));
    expect(subtitle.nativeElement.textContent).toContain('传统万年历与现代日程管理完美结合');
  });

  it('should apply dark surface class for dark theme', () => {
    // mockApp.tileTheme = 'dark'
    expect(component.tileClass).toBe('surface-tile-dark');
    const section = fixture.debugElement.query(By.css('.product-tile'));
    expect(section.nativeElement.classList).toContain('surface-tile-dark');
  });

  it('should resolve light theme correctly via getter', () => {
    const lightApp = { ...mockApp, tileTheme: 'light' as const };
    component.app = lightApp;
    expect(component.tileClass).toBe('surface-light');
  });

  it('should resolve parchment theme correctly via getter', () => {
    const parchmentApp = { ...mockApp, tileTheme: 'parchment' as const };
    component.app = parchmentApp;
    expect(component.tileClass).toBe('surface-parchment');
  });

  it('should use explicit surface input when provided (getter logic)', () => {
    component.surface = 'parchment';
    expect(component.tileClass).toBe('surface-parchment');
    expect(component.resolvedTheme).toBe('parchment');
  });

  it('should render "了解更多" button with correct routerLink', () => {
    const primaryBtn = fixture.debugElement.query(By.css('ui-button-primary'));
    expect(primaryBtn).toBeTruthy();
    expect(primaryBtn.componentInstance.routerLink).toBe('/apps/calendar');
  });

  it('should render platform badges', () => {
    const badges = fixture.debugElement.queryAll(By.css('ui-platform-badge'));
    expect(badges.length).toBe(1);
    expect(badges[0].componentInstance.badge).toBe('tencent-myapp');
  });

  it('should have hasDownload=true when primary channel is available', () => {
    expect(component.hasDownload).toBe(true);
    expect(component.primaryChannel?.url).toBe(
      'https://sj.qq.com/appdetail/com.zrgenesiscloud.chinesealmanc'
    );
  });

  it('should have hasDownload=false when no available channels', () => {
    component.app = mockAppNoDownload;
    expect(component.hasDownload).toBe(false);
  });

  it('should emit primaryCta event on click', () => {
    spyOn(component.primaryCta, 'emit');
    component.onPrimaryCtaClick();
    expect(component.primaryCta.emit).toHaveBeenCalled();
  });

  it('should emit secondaryCta event on click', () => {
    spyOn(component.secondaryCta, 'emit');
    component.onSecondaryCtaClick();
    expect(component.secondaryCta.emit).toHaveBeenCalled();
  });
});
