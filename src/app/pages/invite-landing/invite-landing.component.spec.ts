import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { InviteLandingComponent } from './invite-landing.component';
import { InviteCardService, InviteCardResult } from '../../services/invite-card.service';

class FakeInviteCardService {
  result: InviteCardResult = {
    data: { nickname: '张三', appName: '班管家', inviteMessage: '快来玩' },
    notFound: false,
    error: false,
  };
  getInviteCard() {
    return of(this.result);
  }
}

describe('InviteLandingComponent', () => {
  let component: InviteLandingComponent;
  let fixture: ComponentFixture<InviteLandingComponent>;
  let fakeService: FakeInviteCardService;

  beforeEach(async () => {
    fakeService = new FakeInviteCardService();
    await TestBed.configureTestingModule({
      imports: [InviteLandingComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: InviteCardService, useValue: fakeService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ userId: '42' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InviteLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('parses userId from route', () => {
    expect(component.userId).toBe('42');
  });

  it('renders nickname after invite-card load', () => {
    const headline = fixture.nativeElement.querySelector('.il-card__headline');
    expect(headline?.textContent).toContain('张三');
  });

  it('shows not-found state when service returns notFound', () => {
    fakeService.result = { data: null, notFound: true, error: false };
    fixture = TestBed.createComponent(InviteLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.il-state__title');
    expect(title?.textContent).toContain('邀请链接无效');
  });

  it('shows error state when service returns error', () => {
    fakeService.result = { data: null, notFound: false, error: true };
    fixture = TestBed.createComponent(InviteLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.il-state__title');
    expect(title?.textContent).toContain('网络开小差');
  });

  describe('browser sniffing', () => {
    let originalUA: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalUA = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
    });

    afterEach(() => {
      if (originalUA) {
        Object.defineProperty(window.navigator, 'userAgent', originalUA);
      }
    });

    function setUA(ua: string) {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: ua,
        configurable: true,
      });
    }

    it('isIOS true for iPhone UA', () => {
      setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)');
      expect(component.isIOS()).toBeTrue();
    });

    it('isAndroid true for Android UA', () => {
      setUA('Mozilla/5.0 (Linux; Android 14; Pixel 8)');
      expect(component.isAndroid()).toBeTrue();
    });

    it('isInWeChat true for MicroMessenger UA', () => {
      setUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) MicroMessenger/8.0');
      expect(component.isInWeChat()).toBeTrue();
    });
  });

  describe('openInApp', () => {
    it('no-ops in WeChat', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) MicroMessenger/8.0',
        configurable: true,
      });
      component.openInApp();
      expect(component.isAttemptingAppOpen).toBeFalse();
    });
  });
});
