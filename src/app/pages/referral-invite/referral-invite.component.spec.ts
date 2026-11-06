import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ReferralInviteComponent } from './referral-invite.component';
import { InvitePageData, ReferralInviteService } from '../../services/referral-invite.service';
import { AppEntry } from '../../models/app.model';
import { routes } from '../../app.routes';
import { RouterTestingHarness } from '@angular/router/testing';

const page = (appId = 'calendar-id'): InvitePageData => ({
  app: { name: appId === 'calendar-id' ? '黄历通' : '班管家', appId } as AppEntry,
  appId, code: '9600123', nickname: '小林', privacyUrl: 'https://example.com/privacy', termsUrl: 'https://example.com/terms',
  canonicalUrl: `https://example.com/invite/huangli?code=9600123`, iosOpenUrl: `chinesealmanc://invite/huangli?code=9600123`, androidOpenUrl: `intent://www.zrgenesiscloud.com/invite/huangli?code=9600123#Intent;scheme=https;package=com.example.calendar;end`,
  iosDownloadUrl: 'https://apps.apple.com/app/id12345', androidDownloadUrl: 'https://example.com/app.apk',
});

describe('ReferralInviteComponent', () => {
  let fixture: ComponentFixture<ReferralInviteComponent>;
  let component: ReferralInviteComponent;
  let service: jasmine.SpyObj<ReferralInviteService>;
  let events: Subject<NavigationEnd>;
  let snapshot: { paramMap: ReturnType<typeof convertToParamMap>; queryParamMap: ReturnType<typeof convertToParamMap> };

  beforeEach(async () => {
    service = jasmine.createSpyObj('ReferralInviteService', ['load', 'sendCode', 'accept']);
    service.load.and.returnValue(of(page()));
    service.sendCode.and.returnValue(of({ success: true }));
    service.accept.and.returnValue(of({ success: true, data: { bound: true, reason: null } }));
    events = new Subject();
    snapshot = { paramMap: convertToParamMap({ slug: 'huangli' }), queryParamMap: convertToParamMap({ code: '9600123' }) };
    await TestBed.configureTestingModule({ imports: [ReferralInviteComponent], providers: [
      { provide: ReferralInviteService, useValue: service },
      { provide: ActivatedRoute, useValue: { snapshot } },
      { provide: Router, useValue: { events, navigate: jasmine.createSpy().and.resolveTo(true) } },
    ] }).compileComponents();
    fixture = TestBed.createComponent(ReferralInviteComponent);
    component = fixture.componentInstance;
    spyOn(component, 'generateQr').and.resolveTo();
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());
  function completeForm() { component.form.setValue({ phone: '13800000000', code: '123456', agreed: true }); }

  it('renders trusted brand, consent and routing downloads', () => {
    expect(fixture.nativeElement.textContent).toContain('黄历通');
    expect(fixture.nativeElement.textContent).toContain('小林');
    expect(fixture.nativeElement.querySelector('#agreed').checked).toBeFalse();
    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeTrue();
    expect(fixture.nativeElement.innerHTML).not.toContain('sj.qq.com');
  });
  for (const [platform, userAgent] of [['ios', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'], ['android', 'Mozilla/5.0 (Linux; Android 14)']]) {
    it(`lets ${platform} open the app before filling or accepting the web form`, () => {
      fixture.destroy();
      spyOnProperty(window.navigator, 'userAgent', 'get').and.returnValue(userAgent);
      fixture = TestBed.createComponent(ReferralInviteComponent);
      component = fixture.componentInstance;
      const navigation = spyOn<any>(component, 'navigateToApp');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.invite-page__open') as HTMLButtonElement;
      const webOption = fixture.nativeElement.querySelector('details');
      expect(button.textContent).toContain('打开 App 并接受邀请');
      expect(button.disabled).toBeFalse();
      expect(button.compareDocumentPosition(webOption) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(webOption.open).toBeFalse();
      expect(component.form.controls.phone.value).toBe('');
      expect(component.form.controls.agreed.value).toBeFalse();
      button.click();
      expect(navigation).toHaveBeenCalledOnceWith(platform === 'ios' ? page().iosOpenUrl : page().androidOpenUrl);
      expect(service.accept).not.toHaveBeenCalled();
      expect(service.sendCode).not.toHaveBeenCalled();
      const links = Array.from(fixture.nativeElement.querySelectorAll('.invite-page__downloads a') as NodeListOf<HTMLAnchorElement>).map(link => link.href);
      expect(links).toEqual([platform === 'ios' ? page().iosDownloadUrl! : page().androidDownloadUrl!]);
    });
  }

  it('keeps app opening available when website legal data is unavailable', () => {
    fixture.destroy();
    spyOnProperty(window.navigator, 'userAgent', 'get').and.returnValue('Mozilla/5.0 (Linux; Android 14)');
    service.load.and.returnValue(of({ ...page(), privacyUrl: null, termsUrl: null }));
    fixture = TestBed.createComponent(ReferralInviteComponent); component = fixture.componentInstance;
    const navigation = spyOn<any>(component, 'navigateToApp'); fixture.detectChanges();
    (fixture.nativeElement.querySelector('.invite-page__open') as HTMLButtonElement).click();
    expect(navigation).toHaveBeenCalledOnceWith(page().androidOpenUrl);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    component.form.setValue({ phone: '13800000000', code: '123456', agreed: true });
    component.sendCode(); component.accept();
    expect(service.sendCode).not.toHaveBeenCalled(); expect(service.accept).not.toHaveBeenCalled();
  });

  it('shows WeChat browser guidance with the independent web path', () => {
    fixture.destroy();
    spyOnProperty(window.navigator, 'userAgent', 'get').and.returnValue('Mozilla/5.0 (Linux; Android 14) MicroMessenger');
    fixture = TestBed.createComponent(ReferralInviteComponent); component = fixture.componentInstance; fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invite-page__open')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('在浏览器打开');
    expect(fixture.nativeElement.querySelector('details').open).toBeTrue();
  });

  it('requires agreement before sending SMS and accepting', () => {
    component.form.patchValue({ phone: '13800000000', code: '123456' });
    component.sendCode(); component.accept();
    expect(service.sendCode).not.toHaveBeenCalled();
    expect(service.accept).not.toHaveBeenCalled();
    expect(component.error).toBe(''); // accept clears stale send status while preserving validation.
  });
  it('prevents duplicate SMS requests and starts the cooldown', fakeAsync(() => {
    const pending = new Subject<{ success: boolean }>();
    service.sendCode.and.returnValue(pending);
    completeForm(); component.sendCode(); component.sendCode();
    expect(service.sendCode).toHaveBeenCalledTimes(1);
    pending.next({ success: true }); pending.complete();
    expect(component.countdown).toBe(60);
    component.sendCode(); expect(service.sendCode).toHaveBeenCalledTimes(1);
    tick(61000); expect(component.countdown).toBe(0);
  }));
  it('prevents duplicate submissions and presents persistent success without redirecting', () => {
    const pending = new Subject<any>();
    service.accept.and.returnValue(pending);
    completeForm(); component.accept(); component.accept();
    expect(service.accept).toHaveBeenCalledOnceWith('calendar-id', '13800000000', '123456', '9600123');
    pending.next({ success: true, data: { bound: true } }); pending.complete();
    fixture.detectChanges();
    expect(component.result?.title).toBe('邀请已接受');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(component.form.controls.phone.value).toBe('');
  });
  for (const [reason, title] of [['already_bound', '你已有邀请关系'], ['already_active', '你已是该应用的活跃用户']]) {
    it(`does not claim a new binding for ${reason}`, () => {
      service.accept.and.returnValue(of({ success: true, data: { bound: false, reason } }));
      completeForm(); component.accept();
      expect(component.result?.title).toBe(title);
    });
  }
  for (const reason of ['self_invite_rejected', 'invalid_invite_code', 'inviter_not_found']) {
    it(`shows ${reason} as an error with no success/download redirect`, () => {
      service.accept.and.returnValue(of({ success: true, data: { bound: false, reason } }));
      completeForm(); component.accept();
      expect(component.result).toBeNull();
      expect(component.error).not.toBe('');
    });
  }
  it('rejects missing codes without loading any app or exposing a form', () => {
    service.load.calls.reset();
    snapshot.queryParamMap = convertToParamMap({ app_id: 'calendar-id' });
    events.next(new NavigationEnd(2, '/invite/huangli', '/invite/huangli'));
    fixture.detectChanges();
    expect(service.load).not.toHaveBeenCalled();
    expect(component.loadError).toContain('不完整');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });
  it('cancels a previous page and pending submission when app scope changes', () => {
    const pending = new Subject<any>();
    service.accept.and.returnValue(pending);
    completeForm(); component.accept();
    expect(pending.observed).toBeTrue();
    service.load.and.returnValue(of(page('crew-id')));
    snapshot.paramMap = convertToParamMap({ slug: 'crewpilot' });
    snapshot.queryParamMap = convertToParamMap({ code: '9600123' });
    events.next(new NavigationEnd(2, '/invite/crewpilot', '/invite/crewpilot'));
    expect(pending.observed).toBeFalse();
    pending.next({ success: true, data: { bound: true } });
    expect(component.data?.appId).toBe('crew-id');
    expect(component.result).toBeNull();
    expect(component.form.controls.phone.value).toBe('');
    expect(component.submitting).toBeFalse();
  });
  it('allows retry after a transient metadata failure', () => {
    service.load.and.returnValue(throwError(() => new Error('network')));
    component.retry();
    expect(component.retryable).toBeTrue();
    service.load.and.returnValue(of(page()));
    component.retry();
    expect(component.loadError).toBe('');
    expect(component.data?.appId).toBe('calendar-id');
  });
  it('generates the desktop QR with the browser package interop', async () => {
    (component.generateQr as jasmine.Spy).and.callThrough();
    await component.generateQr(page().canonicalUrl);
    expect(component.qrImage.startsWith('data:image/png;base64,')).toBeTrue();
  });

  it('updates the OnPush view when a pending page finishes loading', () => {
    const pending = new Subject<InvitePageData>();
    service.load.and.returnValue(pending);
    component.retry(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('正在读取');
    pending.next(page('crew-id')); pending.complete(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('班管家');
    expect(fixture.nativeElement.textContent).not.toContain('正在读取');
  });

  it('has only a full-match current product invitation route', () => {
    expect(routes.some(route => route.path === 'invite/r/:userId')).toBeFalse();
    expect(routes.find(route => route.path === 'invite/:slug')?.pathMatch).toBe('full');
  });
});


describe('Product invitation URLs through the real router', () => {
  for (const slug of ['huangli', 'crewpilot', 'ticidashi']) {
    it(`keeps /invite/${slug}?code=9600001 valid after data loads`, async () => {
      const url = `/invite/${slug}?code=9600001`;
      const data = { ...page(), code: '9600001', canonicalUrl: `https://www.zrgenesiscloud.com${url}` };
      const service = jasmine.createSpyObj('ReferralInviteService', ['load']);
      service.load.and.returnValue(of(data));
      const qr = spyOn(ReferralInviteComponent.prototype, 'generateQr').and.resolveTo();
      await TestBed.configureTestingModule({
        providers: [provideRouter(routes), { provide: ReferralInviteService, useValue: service }],
      }).compileComponents();
      const harness = await RouterTestingHarness.create();
      const component = await harness.navigateByUrl(url, ReferralInviteComponent);
      await harness.fixture.whenStable();
      harness.detectChanges();

      expect(TestBed.inject(Router).url).toBe(url);
      expect(component.loadError).toBe('');
      expect(harness.routeNativeElement?.querySelector('form')).not.toBeNull();
      expect(service.load).toHaveBeenCalledWith({ slug, appId: null, code: '9600001' });
      expect(qr).toHaveBeenCalledWith(data.canonicalUrl);
      expect(document.querySelector('meta[name="apple-itunes-app"]')?.getAttribute('content'))
        .toContain(`app-argument=${data.canonicalUrl}`);
    });
  }
});
