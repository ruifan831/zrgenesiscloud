// Calendar Invite landing page — no nav/footer (route data: showHeader/showFooter false)
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MetaService } from '../../shared/seo/meta.service';

@Component({
  selector: 'zrgenesiscloud-calendar-invite',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './calendar-invite.component.html',
  styleUrl: './calendar-invite.component.scss',
})
export class CalendarInviteComponent implements OnInit {
  inviteForm: FormGroup;
  inviteCode: string = '';
  countdown: number = 0;
  isCountingDown: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private metaService: MetaService,
  ) {
    this.inviteForm = this.fb.group({
      inviteCode: [{ value: '', disabled: true }, Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    this.metaService.setForLegal('邀请注册 — 全民万年黄历通', '通过邀请码注册全民万年黄历通账号，享受邀请专属福利。');

    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.inviteCode = params['code'];
        this.inviteForm.patchValue({ inviteCode: this.inviteCode });
      }
    });
  }

  sendVerificationCode(): void {
    this.errorMessage = '';
    const phoneNumber = this.inviteForm.get('phoneNumber')?.value;
    if (!phoneNumber) { this.errorMessage = '请先输入手机号'; return; }
    if (!this.authService.validatePhoneNumber(phoneNumber)) { this.errorMessage = '请输入正确的手机号格式'; return; }

    this.authService.sendVerificationCode(phoneNumber).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = '验证码已发送';
          this.startCountdown();
        } else {
          this.errorMessage = response.message || '发送验证码失败';
        }
      },
      error: () => { this.errorMessage = '发送验证码失败，请稍后重试'; }
    });
  }

  startCountdown(): void {
    this.countdown = 60;
    this.isCountingDown = true;
    const timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) { clearInterval(timer); this.isCountingDown = false; }
    }, 1000);
  }

  private redirectToDownload(): void {
    setTimeout(() => {
      window.location.href = 'https://a.app.qq.com/o/simple.jsp?pkgname=com.zrgenesiscloud.chinesealmanc';
    }, 1500);
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.inviteForm.valid) {
      const phoneNumber = this.inviteForm.get('phoneNumber')?.value;
      const verificationCode = this.inviteForm.get('verificationCode')?.value;
      this.isLoading = true;
      this.authService.register(phoneNumber, verificationCode, this.inviteCode).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (!response.success) {
            // 业务失败（验证码错误等）：直接展示后端中文 message
            this.errorMessage = response.message || '注册失败';
            return;
          }
          const bound = response.data?.bound ?? false;
          const reason = response.data?.reason ?? null;
          if (bound) {
            this.successMessage = '注册成功！请下载应用开始使用';
            this.redirectToDownload();
          } else if (reason === 'already_bound') {
            this.successMessage = '您已绑定过邀请关系，请下载应用开始使用';
            this.redirectToDownload();
          } else if (reason === 'already_active') {
            this.successMessage = '您已是活跃用户，无法绑定邀请关系，欢迎下载应用继续使用';
            this.redirectToDownload();
          } else if (reason === 'invalid_invite_code') {
            this.errorMessage = '邀请码无效，请确认邀请链接是否正确';
          } else if (reason === 'self_invite_rejected') {
            this.errorMessage = '不能使用自己的邀请码';
          } else if (reason === 'inviter_not_found') {
            this.errorMessage = '邀请人不存在，请确认邀请链接是否正确';
          } else {
            // success=true 时 message 是英文成功文案，不能当错误展示
            this.errorMessage = '绑定邀请关系失败，请稍后重试';
          }
        },
        error: () => { this.isLoading = false; this.errorMessage = '注册失败，请稍后重试'; }
      });
    } else {
      this.errorMessage = '请检查输入信息';
    }
  }
}
