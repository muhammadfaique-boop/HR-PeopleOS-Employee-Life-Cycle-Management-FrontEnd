export type ViewKey = 'overview' | 'people' | 'attendance' | 'leave' | 'benefits' | 'expense' | 'resignation' | 'profile' | 'policies';
export type NotificationTone = 'urgent' | 'info';
export type SupportedLanguage = 'English' | 'Urdu' | 'Arabic' | 'French';

export interface Session {
  token: string;
  email: string;
  role: string;
  employee: Employee;
}

export interface Dashboard {
  metrics: Metric[];
  activeEmployee: Employee;
  employees: Employee[];
  lifecycle: LifecycleStage[];
  approvals: ApprovalTask[];
  whoIsOut: WhoIsOut[];
  holidays: Holiday[];
  announcements: Announcement[];
  quickActions: QuickAction[];
  lifecycleSignals: LifecycleSignal[];
  recentActivity: string[];
}

export interface Metric {
  label: string;
  value: string;
  accent: string;
}

export interface WhoIsOut {
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  department: string;
}

export interface Holiday {
  name: string;
  date: string;
  type: string;
}

export interface Announcement {
  title: string;
  body: string;
  publishedOn: string;
  audience: string;
}

export interface QuickAction {
  label: string;
  target: string;
}

export interface LifecycleSignal {
  label: string;
  value: string;
  status: string;
}

export interface Employee {
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

export interface LifecycleStage {
  id: number;
  employeeId: number;
  stage: string;
  owner: string;
  status: string;
  dueDate: string;
  summary: string;
}

export interface ApprovalTask {
  id: number;
  type: string;
  subject: string;
  requester: string;
  approverRole: string;
  status: string;
  dueDate: string;
}

export interface AttendanceData {
  records: AttendanceRecord[];
  corrections: AttendanceCorrection[];
}

export interface AttendanceRecord {
  id: number;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  source: string;
}

export interface AttendanceCorrection {
  id: number;
  workDate: string;
  requestedChange: string;
  reason: string;
  status: string;
  approver: string;
}

export interface LeaveData {
  balances: LeaveBalance[];
  requests: LeaveRequest[];
}

export interface LeaveBalance {
  id: number;
  leaveType: string;
  annualEntitlement: number;
  availableBalance: number;
}

export interface LeaveRequest {
  id: number;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  contactDuringLeave: string;
  attachmentFileName: string;
  attachmentDataUrl: string;
  status: string;
}

export interface BenefitPlan {
  id: number;
  name: string;
  category: string;
  coverage: string;
  status: string;
  description: string;
}

export interface PolicyDocument {
  id: number;
  title: string;
  category: string;
  version: string;
  publishedOn: string;
}

export interface ExpenseClaim {
  id: number;
  claimType: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
  receiptFileName: string;
  receiptDataUrl: string;
  status: string;
  lineManager: string;
}

export interface ResignationRequest {
  id: number;
  resignationDate: string;
  lastWorkingDate: string;
  reason: string;
  status: string;
  lineManager: string;
}

export interface NotificationItem {
  key: string;
  title: string;
  body: string;
  tone: NotificationTone;
}

export interface PasswordFormModel {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LeaveFormModel {
  employeeId: number;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  contactDuringLeave: string;
  attachmentFileName: string;
  attachmentDataUrl: string;
}

export interface AttendanceCorrectionFormModel {
  employeeId: number;
  workDate: string;
  requestedChange: string;
  reason: string;
}

export interface ExpenseFormModel {
  employeeId: number;
  claimType: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
  receiptFileName: string;
  receiptDataUrl: string;
}

export interface ResignationFormModel {
  employeeId: number;
  lastWorkingDate: string;
  reason: string;
}
