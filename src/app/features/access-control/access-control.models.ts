import { Employee } from '../../people/models/people.models';

export type PermissionScope = 'own' | 'team' | 'department' | 'branch' | 'organization';
export type PermissionKey =
  | 'attendance.read'
  | 'attendance.create'
  | 'attendance.correct'
  | 'attendance.approve'
  | 'leave.read'
  | 'leave.create'
  | 'leave.approve'
  | 'employee.read'
  | 'employee.create'
  | 'employee.update'
  | 'benefit.read'
  | 'benefit.manage'
  | 'expense.read'
  | 'expense.create'
  | 'expense.approve'
  | 'resignation.read'
  | 'resignation.create'
  | 'resignation.approve'
  | 'policy.read'
  | 'policy.manage'
  | 'role.manage'
  | 'permission.manage'
  | 'audit.read'
  | 'report.read';

export interface PermissionGrant {
  key: PermissionKey;
  scope: PermissionScope;
}

export interface Session {
  token: string;
  email: string;
  role: string;
  scope: PermissionScope;
  permissions: PermissionGrant[];
  employee: Employee;
}

export interface PasswordFormModel {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
