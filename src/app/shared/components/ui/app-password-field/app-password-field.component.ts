import { CommonModule } from '@angular/common';
import { Component, Input, SkipSelf } from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { AppFormField } from '../app-form-field/app-form-field';
import { PRIMENG_UI_IMPORTS } from '../primeng-ui.imports';

@Component({
  selector: 'app-password-field',
  imports: [CommonModule, ReactiveFormsModule, AppFormField, ...PRIMENG_UI_IMPORTS],
  template: `
    <app-form-field [label]="label" [error]="error">
      <div class="password-field">
        <input
          pInputText
          required
          [formControlName]="controlName"
          [placeholder]="placeholder"
          [type]="visible ? 'text' : 'password'"
        />
        <button
          type="button"
          class="password-toggle"
          [attr.aria-label]="visible ? hideLabel : showLabel"
          (click)="visible = !visible"
        >
          <i [class]="visible ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
        </button>
      </div>
    </app-form-field>
  `,
  styles: [`
    .password-field {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-field input {
      width: 100%;
      padding-right: 46px;
    }

    .password-toggle {
      position: absolute;
      right: 8px;
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #00645f;
      padding: 0;
      cursor: pointer;
    }

    .password-toggle i {
      font-size: 16px;
    }
  `],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: (container: ControlContainer) => container,
      deps: [[new SkipSelf(), ControlContainer]]
    }
  ]
})
export class AppPasswordField {
  @Input({ required: true }) controlName = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() showLabel = 'Show password';
  @Input() hideLabel = 'Hide password';

  visible = false;
}
