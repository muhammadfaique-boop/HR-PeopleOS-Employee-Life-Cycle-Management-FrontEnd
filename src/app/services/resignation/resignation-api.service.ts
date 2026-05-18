import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { ResignationRequest } from '../../shared/models/peopleos.models';

@Injectable({ providedIn: 'root' })
export class ResignationApiService {
  private readonly http = inject(HttpClient);

  getResignations(): Observable<ResignationRequest[]> {
    return this.http.get<ResignationRequest[]>(`${API_BASE_URL}/peopleos/resignations`);
  }

  submitResignation(request: unknown): Observable<ResignationRequest> {
    return this.http.post<ResignationRequest>(`${API_BASE_URL}/peopleos/resignations`, request);
  }
}
