import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { MetaService } from './meta.service';
import { AppEntry } from '../../models/app.model';

describe('MetaService', () => {
  let service: MetaService;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MetaService, Title, Meta],
    });
    service = TestBed.inject(MetaService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setPageMeta should set document title', () => {
    service.setPageMeta({ title: '测试页面' });
    expect(titleService.getTitle()).toBe('测试页面 — ZRGenesis');
  });

  it('setPageMeta should not duplicate siteName if already present', () => {
    service.setPageMeta({ title: '隐私政策 — ZRGenesis' });
    expect(titleService.getTitle()).toBe('隐私政策 — ZRGenesis');
  });

  it('setPageMeta should update description meta tag', () => {
    service.setPageMeta({ title: '测试', description: '这是描述' });
    const tag = metaService.getTag('name="description"');
    expect(tag?.content).toBe('这是描述');
  });

  it('setForHome should set home title', () => {
    service.setForHome();
    expect(titleService.getTitle()).toContain('ZRGenesis');
  });

  it('setForApp should use app name', () => {
    const app: AppEntry = {
      slug: 'calendar',
      name: '全民万年黄历通',
      tagline: '一本随身的黄历',
      subtitle: '传统日历与黄历',
      description: '功能全面的黄历应用',
      heroImage: '/assets/calendar.png',
      platforms: [],
      features: [],
      tileTheme: 'dark',
    };
    service.setForApp(app);
    expect(titleService.getTitle()).toContain('全民万年黄历通');
  });

  it('setForPrivacyIndex should set privacy title', () => {
    service.setForPrivacyIndex();
    expect(titleService.getTitle()).toContain('隐私与协议');
  });

  it('setForLegal should set custom title', () => {
    service.setForLegal('全民万年黄历通隐私政策');
    expect(titleService.getTitle()).toContain('全民万年黄历通隐私政策');
  });

  it('setForContact should set contact title', () => {
    service.setForContact();
    expect(titleService.getTitle()).toContain('联系我们');
  });
});
