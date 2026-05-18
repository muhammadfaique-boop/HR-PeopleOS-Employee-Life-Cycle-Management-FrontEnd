import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/pages/notifications-page/notifications-page.component')
        .then(component => component.NotificationsPageComponent)
  }
];
