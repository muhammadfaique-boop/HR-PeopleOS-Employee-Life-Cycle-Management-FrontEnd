import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { Session } from '../../shared/models/peopleos.models';
import { ChangePasswordRequestDto } from '../../features/auth/change-password-model/change-password-request.dto';
import { LoginRequestDto } from '../../features/auth/login-model/login-request.dto';
import { ResetPasswordRequestDto } from '../../features/auth/reset-password-model/reset-password-request.dto';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(request: LoginRequestDto): Observable<Session> {
    return this.http.post<Session>(`${API_BASE_URL}/auth/login`, request);
  }

  changePassword(request: ChangePasswordRequestDto): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/auth/change-password`, request);
  }

  resetPassword(request: ResetPasswordRequestDto): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/auth/reset-password`, request);
  }
}
