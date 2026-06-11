import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ---------------------------------------------------------------------------
// DTO matching backend GET /api/v1/rewards/public/users/{user_id}/invite-card
// Backend wraps response in APIResponse envelope: { success, message, data }
// ---------------------------------------------------------------------------

export interface InviteCardDto {
  nickname: string;
  app_name: string;
  invite_message: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface InviteCardInfo {
  nickname: string;
  appName: string;
  inviteMessage: string;
}

export interface InviteCardResult {
  data: InviteCardInfo | null;
  notFound: boolean;
  error: boolean;
}

function mapDto(dto: InviteCardDto): InviteCardInfo {
  return {
    nickname: dto.nickname,
    appName: dto.app_name,
    inviteMessage: dto.invite_message,
  };
}

@Injectable({ providedIn: 'root' })
export class InviteCardService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /**
   * GET /api/v1/rewards/public/users/{userId}/invite-card?app_id={shiftmateAppId}
   * app_id 来自 environment（debug=h1vfxv95s8，release=sl85pwpqci）。
   * No JWT required. Returns a result object with error states for graceful fallback.
   */
  getInviteCard(userId: string): Observable<InviteCardResult> {
    const url = `${this.base}/rewards/public/users/${userId}/invite-card?app_id=${environment.shiftmateAppId}`;
    return this.http.get<ApiEnvelope<InviteCardDto>>(url).pipe(
      map((envelope) => {
        if (!envelope.success || !envelope.data) {
          return { data: null, notFound: false, error: true };
        }
        return { data: mapDto(envelope.data), notFound: false, error: false };
      }),
      catchError((err) => {
        if (err.status === 404) {
          return of({ data: null, notFound: true, error: false });
        }
        return of({ data: null, notFound: false, error: true });
      })
    );
  }
}
