import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { EmployeeNotification } from '../../shared/models/peopleos.models';

@Injectable({ providedIn: 'root' })
export class NotificationsApiService {
  private readonly http = inject(HttpClient);

  getNotifications(employeeId: number): Observable<EmployeeNotification[]> {
    return this.http.get<EmployeeNotification[]>(`${API_BASE_URL}/peopleos/notifications`, {
      params: { employeeId }
    });
  }

  markAllRead(employeeId: number): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/peopleos/notifications/read`, null, {
      params: { employeeId }
    });
  }
}
