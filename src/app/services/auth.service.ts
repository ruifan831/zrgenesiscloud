import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SendVerificationCodeRequest {
  phone: string;
}

export interface SendVerificationCodeResponse {
  message: string
  phone: string
  success: boolean
}

export interface RegisterRequest {
  invite_code: string;
  phone: string;
  verification_code: string;
}
export interface APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
export interface RegisterResponse  {
  success: boolean;
  message: string;
  data?: {
    userId?: string;
    token?: string;
    user?: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = environment.apiUrl || 'http://localhost:3000'; // 根据你的环境配置调整

  constructor(private http: HttpClient) {}

  /**
   * 发送验证码
   * @param phoneNumber 手机号
   * @returns Observable<SendVerificationCodeResponse>
   */
  sendVerificationCode(phoneNumber: string): Observable<SendVerificationCodeResponse> {
    const url = `${this.baseUrl}/api/v1/auth/send-verification-code`;
    const body: SendVerificationCodeRequest = {
      phone: phoneNumber
    };

    return this.http.post<SendVerificationCodeResponse>(url, body);
  }

  /**
   * 注册用户
   * @param phoneNumber 手机号
   * @param verificationCode 验证码
   * @param inviteCode 邀请码
   * @returns Observable<RegisterResponse>
   */
  register(phoneNumber: string, verificationCode: string, inviteCode: string): Observable<APIResponse<boolean>> {
    const url = `${this.baseUrl}/api/v1/rewards/referral/register`;
    const body: RegisterRequest = {
      phone: phoneNumber,
      verification_code: verificationCode,
      invite_code: inviteCode
    };

    return this.http.post<APIResponse<boolean>>(url, body);
  }

  /**
   * 验证手机号格式
   * @param phoneNumber 手机号
   * @returns boolean
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * 验证验证码格式
   * @param verificationCode 验证码
   * @returns boolean
   */
  validateVerificationCode(verificationCode: string): boolean {
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(verificationCode);
  }
}