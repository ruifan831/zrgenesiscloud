// /invite/r/:userId — ShiftMate 邀请落地页（移动端优先）
// 无 nav/footer（route.data.showHeader/showFooter = false）
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { InviteCardService, InviteCardInfo } from '../../services/invite-card.service';
import { MetaService } from '../../shared/seo/meta.service';
import { Meta } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

const DEFAULT_INVITE_MESSAGE = '加入班管家，轻松管理班次，轻松赚金币！';
const DEFAULT_APP_NAME = '班管家';

@Component({
  selector: 'zrgenesiscloud-invite-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './invite-landing.component.html',
  styleUrl: './invite-landing.component.scss',
})
export class InviteLandingComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly inviteCardService = inject(InviteCardService);
  private readonly metaService = inject(MetaService);
  private readonly angularMeta = inject(Meta);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  userId = '';
  card: InviteCardInfo | null = null;
  isLoading = true;
  isNotFound = false;
  isError = false;
  /** T-L4: 点 "在 App 中打开" 后，custom scheme 尝试期间显示提示 banner */
  isAttemptingAppOpen = false;

  readonly appStoreUrl = environment.shiftmate.appStoreUrl;
  readonly testFlightUrl = environment.shiftmate.testFlightUrl;
  readonly googlePlayUrl = environment.shiftmate.googlePlayUrl;

  private sub?: Subscription;
  private fallbackTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.userId = params.get('userId') ?? '';
          this.isLoading = true;
          this.isNotFound = false;
          this.isError = false;
          this.card = null;
          this.cdr.markForCheck();
          return this.inviteCardService.getInviteCard(this.userId);
        })
      )
      .subscribe((result) => {
        this.isLoading = false;
        this.isNotFound = result.notFound;
        this.isError = result.error;
        this.card = result.data;
        this.setMeta(result.data);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
  }

  private setMeta(card: InviteCardInfo | null): void {
    const nickname = card?.nickname ?? '朋友';
    const appName = card?.appName ?? DEFAULT_APP_NAME;
    const message = card?.inviteMessage ?? DEFAULT_INVITE_MESSAGE;

    const title = `${nickname} 邀请你加入${appName}`;
    const description = message;

    this.metaService.setPageMeta({ title, description });

    // Apple Smart Banner — appStoreId 在 'TBD' 时 iOS Safari 不会渲染 banner，安全
    this.angularMeta.updateTag({
      name: 'apple-itunes-app',
      content: `app-id=${environment.shiftmate.appStoreId}, app-argument=invite/r/${this.userId}`,
    });

    // Open Graph
    this.angularMeta.updateTag({ property: 'og:type', content: 'website' });
    this.angularMeta.updateTag({
      property: 'og:url',
      content: `https://www.zrgenesiscloud.com/invite/r/${this.userId}`,
    });
    this.angularMeta.updateTag({ property: 'og:title', content: title });
    this.angularMeta.updateTag({ property: 'og:description', content: description });

    // Twitter card
    this.angularMeta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.angularMeta.updateTag({ name: 'twitter:title', content: title });
    this.angularMeta.updateTag({ name: 'twitter:description', content: description });
  }

  /**
   * T-L4 "在 App 中打开"按钮回调：
   * - iOS Safari 通常 AASA Universal Link 直接命中 App，无需此 fallback
   * - 没装 App / 非 Safari → custom scheme 不弹任何东西，超时后跳商店
   * - 微信内置浏览器禁掉（custom scheme 被拦），UI 走"右上角浏览器中打开"提示
   */
  openInApp(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.isInWeChat()) return;

    const scheme = environment.shiftmate.iosCustomScheme;
    const ref = encodeURIComponent(this.userId);
    const url = `${scheme}://share/${ref}`;

    this.isAttemptingAppOpen = true;
    this.cdr.markForCheck();

    // 触发 custom scheme（iOS 端如果装了 App 会跳走，没装则停在本页）
    window.location.href = url;

    // 超时回退到商店
    this.fallbackTimer = setTimeout(() => {
      this.isAttemptingAppOpen = false;
      this.cdr.markForCheck();
      if (this.isIOS()) {
        window.location.href = environment.shiftmate.appStoreUrl;
      } else if (this.isAndroid()) {
        window.location.href = environment.shiftmate.googlePlayUrl;
      }
    }, environment.shiftmate.autoOpenFallbackMs);
  }

  // ---------------------------------------------------------------------------
  // Browser sniffing helpers — SSR-safe（platformId guard 在 caller 已做）
  // ---------------------------------------------------------------------------

  isIOS(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
  }

  isAndroid(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return /Android/i.test(navigator.userAgent || '');
  }

  isInWeChat(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return /MicroMessenger/i.test(navigator.userAgent || '');
  }

  get displayNickname(): string {
    return this.card?.nickname ?? '';
  }

  get displayAppName(): string {
    return this.card?.appName ?? DEFAULT_APP_NAME;
  }

  get displayMessage(): string {
    return this.card?.inviteMessage ?? DEFAULT_INVITE_MESSAGE;
  }
}
