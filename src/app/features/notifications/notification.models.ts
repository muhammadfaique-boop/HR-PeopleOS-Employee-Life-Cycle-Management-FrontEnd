export type NotificationTone = 'urgent' | 'info';

export interface NotificationItem {
  key: string;
  title: string;
  body: string;
  tone: NotificationTone;
}
