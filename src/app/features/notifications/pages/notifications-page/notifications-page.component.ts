import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { DashboardApiService } from '../../../../services/dashboard/dashboard-api.service';
import { NotificationsApiService } from '../../../../services/notifications/notifications-api.service';
import { PRIMENG_UI_IMPORTS } from '../../../../shared/components/ui/primeng-ui.imports';
import {
  Dashboard,
  EmployeeNotification,
  NotificationItem,
  NotificationTone
} from '../../../../shared/models/peopleos.models';

interface NotificationCenterRow extends NotificationItem {
  source: string;
  createdAt?: string;
}

@Component({
  selector: 'app-notifications-page',
  imports: [CommonModule, ...PRIMENG_UI_IMPORTS],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss'
})
export class NotificationsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly notificationsApi = inject(NotificationsApiService);
  private readonly dismissedKeys = new Set<string>();

  employeeId = 2;
  loading = false;
  message = '';
  notifications: NotificationCenterRow[] = [];
  private employeeNotifications: EmployeeNotification[] = [];
  private dashboard: Dashboard | null = null;

  ngOnInit() {
    const requestedEmployeeId = Number(this.route.snapshot.queryParamMap.get('employeeId') ?? 2);
    this.employeeId = Number.isNaN(requestedEmployeeId) ? 2 : requestedEmployeeId;
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    forkJoin({
      dashboard: this.dashboardApi.getDashboard(),
      employeeNotifications: this.notificationsApi.getNotifications(this.employeeId)
    }).pipe(finalize(() => this.loading = false)).subscribe({
      next: response => {
        this.dashboard = response.dashboard;
        this.employeeNotifications = response.employeeNotifications;
        this.composeNotifications();
      },
      error: () => {
        this.message = 'Notifications could not be loaded.';
      }
    });
  }

  markAllRead() {
    this.notificationsApi.markAllRead(this.employeeId).subscribe({
      next: () => {
        this.employeeNotifications = this.employeeNotifications.map(note => ({ ...note, isRead: true }));
        this.notifications = this.notifications.map(note => ({ ...note, isRead: true }));
      },
      error: () => {
        this.message = 'Notifications could not be marked as read.';
      }
    });
  }

  clearNotification(note: NotificationCenterRow) {
    if (!note.employeeNotificationId) {
      this.removeNotification(note.key);
      return;
    }

    this.notificationsApi.clearNotification(this.employeeId, note.employeeNotificationId).subscribe({
      next: () => {
        this.employeeNotifications = this.employeeNotifications.filter(item => item.id !== note.employeeNotificationId);
        this.removeNotification(note.key);
      },
      error: () => {
        this.message = 'Notification could not be cleared.';
      }
    });
  }

  goBack() {
    this.router.navigateByUrl('/');
  }

  trackByKey(_: number, note: NotificationCenterRow): string {
    return note.key;
  }

  private removeNotification(key: string) {
    this.dismissedKeys.add(key);
    this.notifications = this.notifications.filter(note => note.key !== key);
  }

  private composeNotifications() {
    const employeeRows: NotificationCenterRow[] = this.employeeNotifications.map(item => ({
      key: `employee-notification-${item.id}-${item.isRead}`,
      title: item.title,
      body: item.body,
      tone: item.tone,
      isRead: item.isRead,
      employeeNotificationId: item.id,
      createdAt: item.createdAt,
      source: 'Employee notification'
    }));

    const approvalRows: NotificationCenterRow[] = (this.dashboard?.approvals ?? []).map(item => ({
      key: `approval-${item.id}-${item.status}`,
      title: 'Approval required',
      body: `${item.subject} - ${item.status}`,
      tone: 'urgent' as NotificationTone,
      approvalId: item.id,
      isRead: false,
      source: 'Approval queue'
    }));

    const activityRows: NotificationCenterRow[] = (this.dashboard?.recentActivity ?? []).map((item, index) => ({
      key: `activity-${index}-${item}`,
      title: 'Recent activity',
      body: item,
      tone: 'info' as NotificationTone,
      isRead: true,
      source: 'Activity'
    }));

    this.notifications = [...employeeRows, ...approvalRows, ...activityRows]
      .filter(note => !this.dismissedKeys.has(note.key));
  }
}
