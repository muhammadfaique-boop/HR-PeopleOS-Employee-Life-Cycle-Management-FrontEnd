import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { Employee } from '../../shared/models/peopleos.models';
import { ProfileUpdateRequestDto } from '../../features/people/profile-update-model/profile-update-request.dto';

@Injectable({ providedIn: 'root' })
export class PeopleApiService {
  private readonly http = inject(HttpClient);

  updateProfile(employeeId: number, request: ProfileUpdateRequestDto): Observable<Employee> {
    return this.http.patch<Employee>(`${API_BASE_URL}/peopleos/employees/${employeeId}/profile`, request);
  }
}
