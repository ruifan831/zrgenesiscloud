import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EMPTY, Subject, catchError, filter, finalize, merge, startWith, switchMap, takeUntil } from 'rxjs';
import { RewardCalloutComponent } from '../../shared/ui/reward-callout/reward-callout.component';
import { environment } from '../../../environments/environment';
import { MetaService } from '../../shared/seo/meta.service';
import { InvitePageData, InvitePageError, ReferralInviteService, inviteErrorMessage, parseInviteLocation } from '../../services/referral-invite.service';

@Component({
  selector: 'zrgenesiscloud-referral-invite',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RewardCalloutComponent],
  templateUrl: './referral-invite.component.html',
  styleUrl: './referral-invite.component.scss',
})
export class ReferralInviteComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ReferralInviteService);
  private readonly seo = inject(MetaService);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();
  private readonly routeChanged = new Subject<void>();
  private timer?: ReturnType<typeof setInterval>;
  private generation = 0;
  private cooldownUntil = 0;
  readonly form = inject(FormBuilder).nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^1[3-9]\d{9}$/)]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    agreed: [false, Validators.requiredTrue],
  });
  readonly userAgent = this.document.defaultView?.navigator.userAgent ?? '';
  readonly isWechat = /MicroMessenger/i.test(this.userAgent);
  readonly platform: 'ios' | 'android' | 'desktop' = /iPhone|iPad|iPod/i.test(this.userAgent) ||
    (/Macintosh/.test(this.userAgent) && (this.document.defaultView?.navigator.maxTouchPoints ?? 0) > 1)
    ? 'ios' : /Android/i.test(this.userAgent) ? 'android' : 'desktop';
  readonly supportEmail = environment.contactEmail;
  readonly currentYear = new Date().getFullYear();
  data: InvitePageData | null = null;
  loading = true;
  loadError = '';
  retryable = false;
  sending = false;
  submitting = false;
  countdown = 0;
  error = '';
  notice = '';
  result: { title: string; message: string } | null = null;
  qrImage = '';
  logoFailed = false;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.generation++;
      this.stopCountdown();
      this.routeChanged.next();
      this.routeChanged.complete();
      this.meta.removeTag('name="apple-itunes-app"');
    });
    this.form.controls.phone.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.form.controls.code.reset();
      this.notice = '';
    });
    merge(this.router.events.pipe(filter(event => event instanceof NavigationEnd)), this.reload).pipe(
      startWith(null),
      switchMap(() => {
        this.reset();
        try {
          const location = parseInviteLocation(this.route.snapshot.paramMap, this.route.snapshot.queryParamMap);
          return this.service.load(location).pipe(catchError(error => {
            this.loadError = inviteErrorMessage(error, '邀请资料加载失败，请重试。');
            this.retryable = !(error instanceof InvitePageError) || error.retryable;
            this.loading = false;
            this.cdr.markForCheck();
            return EMPTY;
          }));
        } catch (error) {
          this.loadError = inviteErrorMessage(error, '邀请链接无效。');
          this.loading = false;
          return EMPTY;
        }
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => {
      const firstPageData = !this.data;
      this.data = data;
      this.loading = false;
      this.cdr.markForCheck();
      if (!firstPageData) return;
      this.seo.setPageMeta({ title: `朋友邀请你使用${data.app.name}`, description: '打开应用注册或登录，邀请码会自动带入。也可以在网页验证手机号并接受邀请。' });
      if (data.iosDownloadUrl) {
        this.meta.updateTag({ name: 'apple-itunes-app', content: `app-id=${data.iosDownloadUrl.split('/id')[1]}, app-argument=${data.canonicalUrl}` });
      }
      if (this.platform === 'desktop') void this.generateQr(data.canonicalUrl);
    });
  }

  retry(): void { this.reload.next(); }

  sendCode(): void {
    if (!this.data?.privacyUrl || !this.data?.termsUrl || this.loading || this.sending || this.submitting || this.countdown > 0 || this.result) return;
    this.error = '';
    this.notice = '';
    if (this.form.controls.phone.invalid) { this.form.controls.phone.markAsTouched(); return; }
    if (!this.form.controls.agreed.value) { this.error = '请先阅读并同意用户协议和隐私政策。'; return; }
    this.sending = true;
    this.service.sendCode(this.data.appId, this.form.controls.phone.value).pipe(
      takeUntil(this.routeChanged), takeUntilDestroyed(this.destroyRef), finalize(() => { this.sending = false; this.cdr.markForCheck(); }),
    ).subscribe({
      next: response => {
        if (!response.success) { this.error = response.message || '验证码发送失败，请重试。'; return; }
        this.notice = '验证码已发送，请查看手机短信。';
        this.startCountdown(60);
      },
      error: error => {
        this.error = inviteErrorMessage(error, '验证码发送失败，请稍后重试。');
        if (error.status === 429) {
          const retryAfter = Number(error.headers?.get('Retry-After'));
          this.startCountdown(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 3600) : 60);
        }
      },
    });
  }

  accept(): void {
    if (!this.data?.privacyUrl || !this.data?.termsUrl || this.loading || this.sending || this.submitting || this.result) return;
    this.error = '';
    this.notice = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const { phone, code } = this.form.getRawValue();
    this.service.accept(this.data.appId, phone, code, this.data.code).pipe(
      takeUntil(this.routeChanged), takeUntilDestroyed(this.destroyRef), finalize(() => { this.submitting = false; this.cdr.markForCheck(); }),
    ).subscribe({
      next: response => {
        if (!response.success || !response.data) { this.error = response.message || '接受邀请失败，请重试。'; return; }
        const { bound, reason } = response.data;
        if (bound) {
          this.result = { title: '邀请已接受', message: `打开或下载${this.data!.app.name}，使用刚才验证的手机号登录即可。` };
        } else if (reason === 'already_bound') {
          this.result = { title: '你已有邀请关系', message: '原有邀请关系保持不变。你可以继续打开或下载应用。' };
        } else if (reason === 'already_active') {
          this.result = { title: '你已是该应用的活跃用户', message: '当前无法补绑邀请关系，你仍可继续使用应用。' };
        } else {
          const messages: Record<string, string> = {
            self_invite_rejected: '不能接受自己的邀请，请确认分享人和手机号。',
            invalid_invite_code: '邀请码无效，请重新打开朋友分享的完整链接。',
            inviter_not_found: '邀请人不存在，请联系分享人重新发送链接。',
            app_id_missing: '邀请应用信息缺失，请重新打开完整链接。',
          };
          this.error = messages[reason ?? ''] ?? '暂时无法接受邀请，请稍后重试。';
        }
        if (this.result) { this.form.reset(); this.stopCountdown(); }
      },
      error: error => this.error = inviteErrorMessage(error, '接受邀请失败，请稍后重试。'),
    });
  }

  get openUrl(): string | null {
    if (this.isWechat) return null;
    return this.platform === 'ios' ? this.data?.iosOpenUrl ?? null : this.platform === 'android' ? this.data?.androidOpenUrl ?? null : null;
  }

  openApp(): void {
    if (!this.openUrl) return;
    this.notice = '如果没有打开应用，可使用下方下载入口。';
    // Explicit user click only. Values are built from validated routing fields, never arbitrary query parameters.
    this.navigateToApp(this.openUrl);
  }

  private navigateToApp(url: string): void { this.document.defaultView?.location.assign(url); }

  async generateQr(url: string): Promise<void> {
    const generation = this.generation;
    try {
      const { default: qr } = await import('qrcode');
      const image = await qr.toDataURL(url, { width: 180, margin: 2, errorCorrectionLevel: 'M' });
      if (generation === this.generation) { this.qrImage = image; this.cdr.markForCheck(); }
    } catch { /* The page remains usable with the explicit download links. */ }
  }

  private reset(): void {
    this.routeChanged.next();
    this.generation++;
    this.stopCountdown();
    this.form.reset();
    this.data = null;
    this.loading = true;
    this.loadError = this.error = this.notice = this.qrImage = '';
    this.sending = this.submitting = this.retryable = this.logoFailed = false;
    this.result = null;
    this.meta.removeTag('name="apple-itunes-app"');
    this.cdr.markForCheck();
    this.seo.setPageMeta({ title: '好友邀请', description: '接受朋友的应用邀请。' });
  }

  private startCountdown(seconds: number): void {
    this.stopCountdown();
    this.cooldownUntil = Date.now() + seconds * 1000;
    this.countdown = Math.ceil(seconds);
    this.timer = setInterval(() => {
      this.countdown = Math.max(0, Math.ceil((this.cooldownUntil - Date.now()) / 1000));
      if (!this.countdown) this.stopCountdown();
      this.cdr.markForCheck();
    }, 1000);
  }

  private stopCountdown(): void { clearInterval(this.timer); this.timer = undefined; this.countdown = 0; }
}
