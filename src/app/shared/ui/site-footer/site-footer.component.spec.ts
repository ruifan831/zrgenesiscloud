import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiteFooterComponent } from './site-footer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AppCatalogService } from '../../../core/services/app-catalog.service';
import { of } from 'rxjs';
import { AppEntry } from '../../../models/app.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const MOCK_APPS: AppEntry[] = [
  {
    slug: 'calendar',
    name: '全民万年黄历通',
    tagline: '一本随身的黄历',
    subtitle: '',
    description: '',
    heroImage: '',
    tileTheme: 'dark',
    platforms: [],
    features: [],
  },
];

describe('SiteFooterComponent', () => {
  let component: SiteFooterComponent;
  let fixture: ComponentFixture<SiteFooterComponent>;

  const mockCatalog = {
    list: jasmine.createSpy('list').and.returnValue(of(MOCK_APPS)),
    getBySlug: jasmine.createSpy('getBySlug'),
    getFeatured: jasmine.createSpy('getFeatured').and.returnValue(of(MOCK_APPS)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooterComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppCatalogService, useValue: mockCatalog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('apps$ should be defined', () => {
    expect(component.apps$).toBeDefined();
  });

  it('should display current year in copyright', () => {
    const text = fixture.nativeElement.querySelector('.site-footer__fine-print')?.textContent;
    expect(text).toContain(String(new Date().getFullYear()));
  });
});
