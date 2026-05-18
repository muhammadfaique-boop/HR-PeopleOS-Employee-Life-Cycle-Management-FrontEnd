import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { ExpenseClaim } from '../../shared/models/peopleos.models';

@Injectable({ providedIn: 'root' })
export class ExpenseApiService {
  private readonly http = inject(HttpClient);

  getClaims(): Observable<ExpenseClaim[]> {
    return this.http.get<ExpenseClaim[]>(`${API_BASE_URL}/peopleos/expense`);
  }

  submitClaim(request: unknown): Observable<ExpenseClaim> {
    return this.http.post<ExpenseClaim>(`${API_BASE_URL}/peopleos/expense/claims`, request);
  }
}
