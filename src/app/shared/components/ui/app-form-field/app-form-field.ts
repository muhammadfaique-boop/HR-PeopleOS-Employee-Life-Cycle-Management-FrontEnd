import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  imports: [CommonModule],
  template: `
    <label class="app-form-field">
      <span *ngIf="label">{{ label }}</span>
      <ng-content></ng-content>
      <small class="field-error" *ngIf="error">{{ error }}</small>
    </label>
  `,
  styles: [`
    .app-form-field {
      display: grid;
      gap: 0.35rem;
    }

    span {
      color: #4b5563;
      font-size: 0.82rem;
      font-weight: 700;
    }

    .field-error {
      color: #dc2626;
      font-size: 0.78rem;
    }
  `]
})
export class AppFormField {
  @Input() label = '';
  @Input() error = '';
}
