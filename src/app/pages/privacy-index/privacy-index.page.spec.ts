import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { PrivacyIndexPage } from './privacy-index.page';
import { AppCatalogService } from '../../core/services/app-catalog.service';
import { MetaService } from '../../shared/seo/meta.service';
import { AppEntry } from '../../models/app.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const MOCK_APPS: AppEntry[] = [
  {
    slug: 'calendar',
    name: '全民万年黄历通',
    tagline: '一本随身的黄历',
    subtitle: '传统万年历与现代日程管理完美结合',
    description: '',
    heroImage: '',
    tileTheme: 'dark',
    platforms: [{ type: 'android', label: '应用宝', badge: 'tencent-myapp', url: '', available: true }],
    features: [],
    privacyUrl: '/privacy/calendar',
  },
  {
    slug: 'vision-cue',
    name: '全能提词器',
    tagline: '表达更流畅自信',
    subtitle: '专业提词器',
    description: '',
    heroImage: '',
    tileTheme: 'light',
    platforms: [{ type: 'ios', label: 'App Store', badge: 'appstore', url: '', available: false }],
    features: [],
  },
  {
    slug: 'shanying',
    name: '闪映',
    tagline: '轻量信息浏览体验',
    subtitle: '聚合授权图文',
    description: '',
    heroImage: '',
    tileTheme: 'parchment',
    platforms: [{ type: 'android', label: '应用宝', badge: 'tencent-myapp', url: '', available: true }],
    features: [],
  },
];

describe('PrivacyIndexPage', () => {
  let component: PrivacyIndexPage;
  let fixture: ComponentFixture<PrivacyIndexPage>;

  const mockMeta = {
    setForPrivacyIndex: jasmine.createSpy('setForPrivacyIndex'),
  };

  const mockCatalog = {
    list: jasmine.createSpy('list').and.returnValue(of(MOCK_APPS)),
    getBySlug: jasmine.createSpy('getBySlug'),
    getFeatured: jasmine.createSpy('getFeatured').and.returnValue(of(MOCK_APPS)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyIndexPage, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppCatalogService, useValue: mockCatalog },
        { provide: MetaService, useValue: mockMeta },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyIndexPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('apps$ should be defined', () => {
    expect(component.apps$).toBeDefined();
  });

  it('should call metaService.setForPrivacyIndex on init', () => {
    expect(mockMeta.setForPrivacyIndex).toHaveBeenCalled();
  });

  it('getPlatformLabels should return Android for calendar', () => {
    const calendarApp = MOCK_APPS.find((a) => a.slug === 'calendar')!;
    const labels = component.getPlatformLabels(calendarApp);
    expect(labels).toContain('Android');
  });

  it('getPlatformLabels should return iOS for vision-cue', () => {
    const visionCue = MOCK_APPS.find((a) => a.slug === 'vision-cue')!;
    const labels = component.getPlatformLabels(visionCue);
    expect(labels).toContain('iOS');
  });
});
