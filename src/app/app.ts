import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5265/api';

  email = 'employee@peopleos.dev';
  password = 'Employee@123';
  error = '';
  loading = false;
  session: Session | null = null;
  dashboard: Dashboard | null = null;
  attendance: AttendanceData | null = null;
  leave: LeaveData | null = null;
  benefits: BenefitPlan[] = [];
  policies: PolicyDocument[] = [];
  activeView: ViewKey = 'overview';

  login() {
    this.loading = true;
    this.error = '';

    this.http.post<Session>(`${this.apiUrl}/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: session => {
        this.session = session;
        this.loadWorkspace();
      },
      error: () => {
        this.loading = false;
        this.error = 'Login failed. Use one of the demo accounts below.';
      }
    });
  }

  logout() {
    this.session = null;
    this.dashboard = null;
    this.activeView = 'overview';
  }

  selectView(view: ViewKey) {
    this.activeView = view;
  }

  private loadWorkspace() {
    this.http.get<Dashboard>(`${this.apiUrl}/peopleos/dashboard`).subscribe(data => {
      this.dashboard = data;
      this.loading = false;
    });

    this.http.get<AttendanceData>(`${this.apiUrl}/peopleos/attendance`).subscribe(data => {
      this.attendance = data;
    });

    this.http.get<LeaveData>(`${this.apiUrl}/peopleos/leave`).subscribe(data => {
      this.leave = data;
    });

    this.http.get<BenefitPlan[]>(`${this.apiUrl}/peopleos/benefits`).subscribe(data => {
      this.benefits = data;
    });

    this.http.get<PolicyDocument[]>(`${this.apiUrl}/peopleos/policies`).subscribe(data => {
      this.policies = data;
    });
  }
}

type ViewKey = 'overview' | 'people' | 'attendance' | 'leave' | 'benefits' | 'policies';

interface Session {
  token: string;
  email: string;
  role: string;
  employee: Employee;
}

interface Dashboard {
  metrics: Metric[];
  activeEmployee: Employee;
  employees: Employee[];
  lifecycle: LifecycleStage[];
  approvals: ApprovalTask[];
  recentActivity: string[];
}

interface Metric {
  label: string;
  value: string;
  accent: string;
}

interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  manager: string;
  lifecycleStatus: string;
  joiningDate: string;
  profileCompletion: number;
  workLocation: string;
}

interface LifecycleStage {
  id: number;
  employeeId: number;
  stage: string;
  owner: string;
  status: string;
  dueDate: string;
  summary: string;
}

interface ApprovalTask {
  id: number;
  type: string;
  subject: string;
  requester: string;
  approverRole: string;
  status: string;
  dueDate: string;
}

interface AttendanceData {
  records: AttendanceRecord[];
  corrections: AttendanceCorrection[];
}

interface AttendanceRecord {
  id: number;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  source: string;
}

interface AttendanceCorrection {
  id: number;
  workDate: string;
  requestedChange: string;
  reason: string;
  status: string;
  approver: string;
}

interface LeaveData {
  balances: LeaveBalance[];
  requests: LeaveRequest[];
}

interface LeaveBalance {
  id: number;
  leaveType: string;
  annualEntitlement: number;
  availableBalance: number;
}

interface LeaveRequest {
  id: number;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  contactDuringLeave: string;
  status: string;
}

interface BenefitPlan {
  id: number;
  name: string;
  category: string;
  coverage: string;
  status: string;
}

interface PolicyDocument {
  id: number;
  title: string;
  category: string;
  version: string;
  publishedOn: string;
}
