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
  expenseClaims: ExpenseClaim[] = [];
  resignations: ResignationRequest[] = [];
  activeView: ViewKey = 'overview';
  message = '';
  selectedLanguage = 'English';
  profileImageUrl = '';
  leaveForm = {
    employeeId: 2,
    leaveType: 'Casual Leave',
    fromDate: '',
    toDate: '',
    reason: '',
    contactDuringLeave: ''
  };
  correctionForm = {
    employeeId: 2,
    workDate: '',
    requestedChange: '',
    reason: ''
  };
  expenseForm = {
    employeeId: 2,
    claimType: 'Medical Expense OPD',
    category: 'Medical OPD',
    amount: 0,
    expenseDate: '',
    description: ''
  };
  resignationForm = {
    employeeId: 2,
    lastWorkingDate: '',
    reason: ''
  };

  login() {
    this.loading = true;
    this.error = '';

    this.http.post<Session>(`${this.apiUrl}/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: session => {
        this.session = session;
        this.selectedLanguage = session.employee.preferredLanguage || 'English';
        this.profileImageUrl = session.employee.profileImageUrl || '';
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

  submitLeave() {
    this.http.post<LeaveRequest>(`${this.apiUrl}/peopleos/leave/requests`, this.leaveForm).subscribe(item => {
      this.leave?.requests.unshift(item);
      this.message = 'Leave request submitted to line manager.';
      this.loadWorkspace();
    });
  }

  submitCorrection() {
    this.http.post<AttendanceCorrection>(`${this.apiUrl}/peopleos/attendance/corrections`, this.correctionForm).subscribe(item => {
      this.attendance?.corrections.unshift(item);
      this.message = 'Attendance correction submitted to line manager.';
      this.loadWorkspace();
    });
  }

  submitExpense() {
    this.http.post<ExpenseClaim>(`${this.apiUrl}/peopleos/expense/claims`, this.expenseForm).subscribe(item => {
      this.expenseClaims.unshift(item);
      this.message = 'Expense claim submitted to line manager.';
      this.loadWorkspace();
    });
  }

  submitResignation() {
    this.http.post<ResignationRequest>(`${this.apiUrl}/peopleos/resignations`, this.resignationForm).subscribe(item => {
      this.resignations.unshift(item);
      this.message = 'Resignation request submitted to line manager.';
      this.loadWorkspace();
    });
  }

  updateProfile() {
    if (!this.session) {
      return;
    }

    this.http.patch<Employee>(`${this.apiUrl}/peopleos/employees/${this.session.employee.id}/profile`, {
      preferredLanguage: this.selectedLanguage,
      profileImageUrl: this.profileImageUrl
    }).subscribe(employee => {
      this.session = { ...this.session!, employee };
      this.message = 'Profile settings updated.';
    });
  }

  downloadAttendance(format: 'excel' | 'pdf') {
    window.open(`${this.apiUrl}/peopleos/attendance/download/${format}?employeeId=2`, '_blank');
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

    this.http.get<ExpenseClaim[]>(`${this.apiUrl}/peopleos/expense`).subscribe(data => {
      this.expenseClaims = data;
    });

    this.http.get<ResignationRequest[]>(`${this.apiUrl}/peopleos/resignations`).subscribe(data => {
      this.resignations = data;
    });
  }
}

type ViewKey = 'overview' | 'people' | 'attendance' | 'leave' | 'benefits' | 'expense' | 'resignation' | 'profile' | 'policies';

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
  preferredLanguage: string;
  profileImageUrl: string;
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
  description: string;
}

interface PolicyDocument {
  id: number;
  title: string;
  category: string;
  version: string;
  publishedOn: string;
}

interface ExpenseClaim {
  id: number;
  claimType: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
  status: string;
  lineManager: string;
}

interface ResignationRequest {
  id: number;
  resignationDate: string;
  lastWorkingDate: string;
  reason: string;
  status: string;
  lineManager: string;
}
