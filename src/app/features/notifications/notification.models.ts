export type NotificationTone = 'urgent' | 'info';

export interface NotificationItem {
  key: string;
  title: string;
  body: string;
  tone: NotificationTone;
  approvalId?: number;
  canDecideApproval?: boolean;
  isRead?: boolean;
  employeeNotificationId?: number;
}

export interface EmployeeNotification {
  id: number;
  employeeId: number;
  title: string;
  body: string;
  tone: NotificationTone;
  isRead: boolean;
  createdAt: string;
}
