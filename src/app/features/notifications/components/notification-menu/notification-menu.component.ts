import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApprovalDecision, NotificationItem } from '../../../../shared/models/peopleos.models';

export interface NotificationDecisionEvent {
  note: NotificationItem;
  decision: ApprovalDecision;
}

export interface NotificationMenuLabels {
  title: string;
  markRead: string;
  viewAll: string;
  empty: string;
  clear: string;
  approve: string;
  reject: string;
}

@Component({
  selector: 'app-notification-menu',
  imports: [CommonModule],
  templateUrl: './notification-menu.component.html',
  styleUrl: './notification-menu.component.scss'
})
export class NotificationMenuComponent {
  @Input() notifications: NotificationItem[] = [];
  @Input() approvalBusyId: number | null = null;
  @Input() labels: NotificationMenuLabels = {
    title: 'Notifications',
    markRead: 'Mark read',
    viewAll: 'View all',
    empty: 'No notifications',
    clear: 'Clear notification',
    approve: 'Approve',
    reject: 'Reject'
  };

  @Output() markRead = new EventEmitter<void>();
  @Output() viewAll = new EventEmitter<void>();
  @Output() clearNotification = new EventEmitter<NotificationItem>();
  @Output() decideApproval = new EventEmitter<NotificationDecisionEvent>();

  isApprovalBusy(note: NotificationItem): boolean {
    return this.approvalBusyId === note.approvalId;
  }
}
