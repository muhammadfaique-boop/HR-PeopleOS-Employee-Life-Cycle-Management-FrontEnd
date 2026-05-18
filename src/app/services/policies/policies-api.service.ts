import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { PolicyDocument } from '../../shared/models/peopleos.models';

@Injectable({ providedIn: 'root' })
export class PoliciesApiService {
  private readonly http = inject(HttpClient);

  getPolicies(): Observable<PolicyDocument[]> {
    return this.http.get<PolicyDocument[]>(`${API_BASE_URL}/peopleos/policies`);
  }
}
