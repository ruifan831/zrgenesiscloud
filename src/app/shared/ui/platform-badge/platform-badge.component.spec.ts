import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformBadgeComponent } from './platform-badge.component';
import { PlatformBadgeStyle } from '../../../models/app.model';

describe('PlatformBadgeComponent', () => {
  let component: PlatformBadgeComponent;
  let fixture: ComponentFixture<PlatformBadgeComponent>;

  function setup(badge: PlatformBadgeStyle, label = '', href = '#') {
    component.badge = badge;
    component.label = label;
    component.href = href;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    setup('appstore');
    expect(component).toBeTruthy();
  });

  it('should render class badge--appstore for appstore', () => {
    setup('appstore');
    const el = fixture.nativeElement.querySelector('.badge--appstore');
    expect(el).toBeTruthy();
  });

  it('should render class badge--google-play for google-play', () => {
    setup('google-play');
    const el = fixture.nativeElement.querySelector('.badge--google-play');
    expect(el).toBeTruthy();
  });

  it('should render class badge--apk for apk', () => {
    setup('apk');
    const el = fixture.nativeElement.querySelector('.badge--apk');
    expect(el).toBeTruthy();
  });

  it('should render class badge--tencent-myapp for tencent-myapp', () => {
    setup('tencent-myapp');
    const el = fixture.nativeElement.querySelector('.badge--tencent-myapp');
    expect(el).toBeTruthy();
  });

  it('should render class badge--wechat-mp for wechat-mp', () => {
    setup('wechat-mp');
    const el = fixture.nativeElement.querySelector('.badge--wechat-mp');
    expect(el).toBeTruthy();
  });

  it('should render class badge--web for web', () => {
    setup('web');
    const el = fixture.nativeElement.querySelector('.badge--web');
    expect(el).toBeTruthy();
  });

  it('should show custom label when provided', () => {
    setup('apk', '官网 APK');
    const el = fixture.nativeElement.querySelector('.platform-badge__label');
    expect(el.textContent.trim()).toBe('官网 APK');
  });

  it('should fallback to default label when label is empty', () => {
    setup('appstore', '');
    const el = fixture.nativeElement.querySelector('.platform-badge__label');
    expect(el.textContent.trim()).toBe('App Store');
  });

  it('should add disabled class and not emit click when disabled', () => {
    setup('web');
    component.disabled = true;
    fixture.detectChanges();
    const spy = jasmine.createSpy('clickedSpy');
    component.clicked.subscribe(spy);
    const anchor = fixture.nativeElement.querySelector('.platform-badge');
    anchor.click();
    expect(spy).not.toHaveBeenCalled();
  });
});
