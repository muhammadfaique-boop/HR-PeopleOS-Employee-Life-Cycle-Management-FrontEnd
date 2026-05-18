import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: '<p class="empty-state">{{ message }}</p>'
})
export class AppEmptyState {
  @Input() message = 'No records found.';
}
