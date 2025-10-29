import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'zrgenesiscloud-calendar-invite',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzTypographyModule,
    NzIconModule,
    NzMessageModule
  ],
  templateUrl: './calendar-invite.component.html',
  styleUrl: './calendar-invite.component.scss'
})
export class CalendarInviteComponent implements OnInit {
  inviteForm: FormGroup;
  inviteCode: string = '';
  countdown: number = 0;
  isCountingDown: boolean = false;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
    private authService: AuthService
  ) {
    this.inviteForm = this.fb.group({
      inviteCode: [{ value: '', disabled: true }, Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
      verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    // 从query param获取邀请码
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.inviteCode = params['code'];
        this.inviteForm.patchValue({
          inviteCode: this.inviteCode
        });
      }
    });
  }

  // 发送验证码
  sendVerificationCode(): void {
    const phoneNumber = this.inviteForm.get('phoneNumber')?.value;
    
    if (!phoneNumber) {
      this.message.error('请先输入手机号');
      return;
    }

    if (!this.authService.validatePhoneNumber(phoneNumber)) {
      this.message.error('请输入正确的手机号格式');
      return;
    }

    // 调用发送验证码API
    this.authService.sendVerificationCode(phoneNumber).subscribe({
      next: (response) => {
        if (response.success) {
          this.message.success('验证码已发送');
          this.startCountdown();
        } else {
          this.message.error(response.message || '发送验证码失败');
        }
      },
      error: (error) => {
        console.error('发送验证码错误:', error);
        this.message.error('发送验证码失败，请稍后重试');
      }
    });
  }

  // 开始倒计时
  startCountdown(): void {
    this.countdown = 60;
    this.isCountingDown = true;
    
    const timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(timer);
        this.isCountingDown = false;
      }
    }, 1000);
  }

  // 提交表单
  onSubmit(): void {
    if (this.inviteForm.valid) {
      const phoneNumber = this.inviteForm.get('phoneNumber')?.value;
      const verificationCode = this.inviteForm.get('verificationCode')?.value;

      // 验证输入
      if (!this.authService.validatePhoneNumber(phoneNumber)) {
        this.message.error('请输入正确的手机号格式');
        return;
      }

      if (!this.authService.validateVerificationCode(verificationCode)) {
        this.message.error('请输入6位数字验证码');
        return;
      }

      this.isLoading = true;

      // 调用注册API
      this.authService.register(phoneNumber, verificationCode, this.inviteCode).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.message.success('注册成功！请下载应用开始使用');
            // 跳转到应用下载页面，这是一个外部链接。
            setTimeout(() => {
              window.location.href = 'https://a.app.qq.com/o/simple.jsp?pkgname=com.zrgenesiscloud.chinesealmanc';
            }, 1500);
          } else {
            this.message.error(response.message || '注册失败');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('注册错误:', error);
          this.message.error('注册失败，请稍后重试');
        }
      });
    } else {
      this.message.error('请检查输入信息');
      this.markFormGroupTouched();
    }
  }

  // 标记所有字段为已触摸（用于显示验证错误）
  private markFormGroupTouched(): void {
    Object.keys(this.inviteForm.controls).forEach(key => {
      const control = this.inviteForm.get(key);
      control?.markAsTouched();
    });
  }

  // 获取手机号错误信息
  getPhoneNumberError(): string {
    const control = this.inviteForm.get('phoneNumber');
    if (control?.hasError('required')) {
      return '请输入手机号';
    }
    if (control?.hasError('pattern')) {
      return '请输入正确的手机号格式';
    }
    return '';
  }

  // 获取验证码错误信息
  getVerificationCodeError(): string {
    const control = this.inviteForm.get('verificationCode');
    if (control?.hasError('required')) {
      return '请输入验证码';
    }
    if (control?.hasError('pattern')) {
      return '请输入6位数字验证码';
    }
    return '';
  }
}