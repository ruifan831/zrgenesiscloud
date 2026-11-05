import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { HomeComponent } from './home.component';
import { AppCatalogService } from '../core/services/app-catalog.service';
import { AppEntry } from '../models/app.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const MOCK_APPS: AppEntry[] = [
  {
    slug: 'calendar',
    name: '全民万年黄历通',
    tagline: '一本随身的黄历',
    subtitle: '传统万年历与现代日程管理完美结合',
    description: '',
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
  },
  {
    slug: 'vision-cue',
    name: '全能提词器',
    tagline: '表达更流畅自信',
    subtitle: '专业提词器',
    description: '',
    heroImage: '',
    tileTheme: 'light',
    platforms: [],
    features: [],
  },
  {
    slug: 'shanying',
    name: '闪映',
    tagline: '轻量信息浏览体验',
    subtitle: '聚合授权图文与信息流内容',
    description: '',
    heroImage: '/assets/images/shanying.png',
    tileTheme: 'parchment',
    platforms: [],
    features: [],
  },
];

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockCatalog: jasmine.SpyObj<AppCatalogService>;

  beforeEach(async () => {
    mockCatalog = jasmine.createSpyObj('AppCatalogService', ['list', 'getBySlug', 'getFeatured']);
    mockCatalog.list.and.returnValue(of(MOCK_APPS));
    mockCatalog.getBySlug.and.returnValue(of(null));
    mockCatalog.getFeatured.and.returnValue(of(MOCK_APPS));

    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppCatalogService, useValue: mockCatalog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the rewards hero before API-provided products', () => {
    const rewards = fixture.nativeElement.querySelector('#benefits');
    const apps = fixture.nativeElement.querySelector('#apps');
    expect(rewards.querySelector('h1').textContent).toContain('福利也精彩');
    expect(rewards.compareDocumentPosition(apps) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('ui-app-showcase').length).toBe(MOCK_APPS.length);
    expect(rewards.textContent).toContain('每日参与，定期开奖');
  });

  it('keeps rewards visible while catalog loads and on retryable errors', () => {
    const pending = new Subject<ReadonlyArray<AppEntry>>();
    fixture.destroy();
    mockCatalog.list.and.returnValue(pending);
    fixture = TestBed.createComponent(HomeComponent); component = fixture.componentInstance; fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#benefits')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-label="正在加载应用"]')).toBeTruthy();
    pending.error(new Error('offline')); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('暂时无法加载应用');
    expect(fixture.nativeElement.querySelectorAll('ui-app-showcase').length).toBe(0);
    mockCatalog.list.and.returnValue(of(MOCK_APPS));
    fixture.nativeElement.querySelector('.apps-load-error button').click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('ui-app-showcase').length).toBe(MOCK_APPS.length);
  });

  it('handles an empty catalog without inventing products', () => {
    fixture.destroy(); mockCatalog.list.and.returnValue(of([]));
    fixture = TestBed.createComponent(HomeComponent); component = fixture.componentInstance; fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('应用正在准备中');
    expect(fixture.nativeElement.querySelectorAll('ui-app-showcase').length).toBe(0);
  });

  it('uses marketing detail imagery and preserves summaries if image lookup fails', () => {
    fixture.destroy();
    mockCatalog.getBySlug.and.callFake(slug => slug === 'calendar'
      ? of({ ...MOCK_APPS[0], detailImages: ['/assets/images/calendar-screen.png'] })
      : throwError(() => new Error('optional detail unavailable')));
    fixture = TestBed.createComponent(HomeComponent); component = fixture.componentInstance; fixture.detectChanges();
    const first = fixture.nativeElement.querySelector('ui-app-showcase');
    expect(first.querySelector('.showcase__image').getAttribute('src')).toBe('/assets/images/calendar-screen.png');
    expect(fixture.nativeElement.textContent).toContain('全能提词器');
    expect(fixture.nativeElement.textContent).not.toContain('暂时无法加载应用');
  });

  it('should contain apps section anchor', () => {
    const appsDiv = fixture.debugElement.query(By.css('#apps'));
    expect(appsDiv).toBeTruthy();
  });
});
