import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
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

  it('should render hero intro section', () => {
    const hero = fixture.debugElement.query(By.css('ui-hero-intro'));
    expect(hero).toBeTruthy();
  });

  it('apps$ should be an Observable', () => {
    expect(component.apps$).toBeDefined();
  });

  it('should alternate tile layout (image-right / image-left)', () => {
    expect(component.getTileLayout(0)).toBe('image-right');
    expect(component.getTileLayout(1)).toBe('image-left');
    expect(component.getTileLayout(2)).toBe('image-right');
  });

  it('should contain apps section anchor', () => {
    const appsDiv = fixture.debugElement.query(By.css('#apps'));
    expect(appsDiv).toBeTruthy();
  });
});
