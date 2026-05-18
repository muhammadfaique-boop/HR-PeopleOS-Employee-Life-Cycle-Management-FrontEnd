import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { BenefitPlan } from '../../shared/models/peopleos.models';

@Injectable({ providedIn: 'root' })
export class BenefitsApiService {
  private readonly http = inject(HttpClient);

  getBenefits(): Observable<BenefitPlan[]> {
    return this.http.get<BenefitPlan[]>(`${API_BASE_URL}/peopleos/benefits`);
  }
}
