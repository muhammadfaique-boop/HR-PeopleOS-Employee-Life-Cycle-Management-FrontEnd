import { ApprovalTask } from '../approvals/approval.models';
import { Employee, LifecycleStage } from '../people/people.models';

export type ViewKey = 'overview' | 'people' | 'attendance' | 'leave' | 'benefits' | 'expense' | 'resignation' | 'profile' | 'policies';

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
