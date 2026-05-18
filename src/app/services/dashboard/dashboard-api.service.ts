import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { Dashboard } from '../../../shared/models/peopleos.models';
import { mapDashboardResponse } from '../../peopleos/mappers/peopleos.mapper';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${API_BASE_URL}/peopleos/dashboard`).pipe(map(mapDashboardResponse));
  }
}
