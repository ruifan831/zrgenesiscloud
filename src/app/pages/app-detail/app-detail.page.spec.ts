import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AppDetailPage } from './app-detail.page';
import { AppCatalogService } from '../../core/services/app-catalog.service';
import { AppEntry } from '../../models/app.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const mockCalendarApp: AppEntry = {
  slug: 'calendar',
  name: '全民万年黄历通',
  tagline: '一本随身的黄历',
  subtitle: '传统万年历与现代日程管理完美结合',
  description: '测试描述',
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
  features: [
    { title: '万年历功能', description: '查看公历、农历日期等', icon: 'calendar' },
  ],
  privacyUrl: '/privacy/calendar',
};

const mockVisionCueApp: AppEntry = {
  slug: 'vision-cue',
  name: '全能提词器',
  tagline: '表达更流畅自信',
  subtitle: '专业提词器',
  description: '测试描述',
  heroImage: '',
  tileTheme: 'light',
  platforms: [
    {
      type: 'ios',
      label: 'App Store',
      badge: 'appstore',
      url: '',
      available: false,
    },
  ],
  features: [],
  privacyUrl: '/privacy/teleprompter',
};

const mockShanyingApp: AppEntry = {
  slug: 'shanying',
  name: '闪映',
  tagline: '轻量信息浏览体验',
  subtitle: '聚合授权图文与信息流内容',
  description: '测试描述',
  heroImage: '/assets/images/shanying.png',
  tileTheme: 'parchment',
  platforms: [
    {
      type: 'android',
      label: '应用宝',
      badge: 'tencent-myapp',
      url: 'https://sj.qq.com/appdetail/sy.com.app',
      primary: true,
      available: true,
    },
    {
      type: 'apk',
      label: '官网 APK',
      badge: 'apk',
      url: 'https://www.zrgenesiscloud.com/static/apps/hrf0ycqjgu/android/app-2.0.8-208.apk',
      available: true,
    },
  ],
  features: [],
};

describe('AppDetailPage', () => {
  let fixture: ComponentFixture<AppDetailPage>;
  let component: AppDetailPage;
  let mockCatalog: jasmine.SpyObj<AppCatalogService>;
  let mockRouter: jasmine.SpyObj<Router>;

  function createComponent(resolvedApp: AppEntry | null): void {
    TestBed.configureTestingModule({
      imports: [AppDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (k: string) => (k === 'slug' ? resolvedApp?.slug ?? 'unknown' : null) },
              data: { app: resolvedApp },
            },
          },
        },
        { provide: AppCatalogService, useValue: mockCatalog },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    mockCatalog = jasmine.createSpyObj('AppCatalogService', ['getBySlug', 'list', 'getFeatured']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCatalog.list.and.returnValue(of([mockCalendarApp, mockVisionCueApp, mockShanyingApp]));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should render calendar app data when resolver provides calendar app', () => {
    createComponent(mockCalendarApp);
    expect(component.app).toBe(mockCalendarApp);
  });

  it('should render vision-cue app when resolver provides vision-cue', () => {
    createComponent(mockVisionCueApp);
    expect(component.app).toBe(mockVisionCueApp);
  });

  it('should render shanying app with two platforms', () => {
    createComponent(mockShanyingApp);
    expect(component.app).toBe(mockShanyingApp);
    expect(component.app!.platforms.length).toBe(2);
  });

  it('should navigate to home when resolver returns null (not found)', () => {
    createComponent(null);
    expect(component.app).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  describe('subNavCta', () => {
    it('should return primary platform href when only one available platform', () => {
      createComponent(mockCalendarApp);
      expect(component.subNavCta.href).toBe(
        'https://sj.qq.com/appdetail/com.zrgenesiscloud.chinesealmanc'
      );
    });

    it('should return #download href when multiple available platforms', () => {
      createComponent(mockShanyingApp);
      expect(component.subNavCta.href).toBe('#download');
    });

    it('should return #download href when no available platforms (vision-cue)', () => {
      createComponent(mockVisionCueApp);
      expect(component.subNavCta.href).toBe('#download');
    });
  });
});
