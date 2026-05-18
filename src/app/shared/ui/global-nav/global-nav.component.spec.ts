import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalNavComponent } from './global-nav.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AppCatalogService } from '../../../core/services/app-catalog.service';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('GlobalNavComponent', () => {
  let component: GlobalNavComponent;
  let fixture: ComponentFixture<GlobalNavComponent>;

  const mockCatalog = {
    list: jasmine.createSpy('list').and.returnValue(of([])),
    getBySlug: jasmine.createSpy('getBySlug'),
    getFeatured: jasmine.createSpy('getFeatured').and.returnValue(of([])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalNavComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppCatalogService, useValue: mockCatalog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('apps$ should be defined', () => {
    expect(component.apps$).toBeDefined();
  });

  it('should toggle mobile menu on hamburger click', () => {
    expect(component.mobileMenuOpen()).toBeFalse();
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeTrue();
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen()).toBeFalse();
  });

  it('should close mobile menu on closeMobileMenu()', () => {
    component.mobileMenuOpen.set(true);
    component.closeMobileMenu();
    expect(component.mobileMenuOpen()).toBeFalse();
  });
});
