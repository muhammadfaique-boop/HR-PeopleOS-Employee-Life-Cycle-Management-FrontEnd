import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, Output, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { PeopleOsFacade } from '../../../peopleos/store/peopleos-facade.service';
import { AppFormField } from '../../../../shared/components/ui/app-form-field/app-form-field';
import { AppPasswordField } from '../../../../shared/components/ui/app-password-field/app-password-field.component';
import { PRIMENG_UI_IMPORTS } from '../../../../shared/components/ui/primeng-ui.imports';
import { Session } from '../../../../shared/models/peopleos.models';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, AppFormField, AppPasswordField, ...PRIMENG_UI_IMPORTS],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnDestroy {
  @Output() sessionReady = new EventEmitter<Session>();

  private readonly peopleOs = inject(PeopleOsFacade);
  private readonly fb = inject(NonNullableFormBuilder);
  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  loading = false;
  formBusy = '';
  error = '';
  message = '';
  resetPasswordPanelOpen = false;

  readonly loginForm = this.fb.group({
    email: ['employee@peopleos.dev', Validators.required],
    password: ['Employee@123', Validators.required]
  });

  readonly resetPasswordForm = this.fb.group({
    email: ['employee@peopleos.dev', Validators.required],
    newPassword: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  });

  ngOnDestroy() {
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
    }
  }

  login() {
    const credentials = this.loginForm.getRawValue();
    if (!credentials.email.trim() || !credentials.password.trim()) {
      this.error = 'Email and password are required.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.peopleOs.login({
      email: credentials.email,
      password: credentials.password
    }).subscribe({
      next: session => {
        this.loading = false;
        this.sessionReady.emit(session);
      },
      error: () => {
        this.loading = false;
        this.error = 'Login failed. Use one of the demo accounts below.';
      }
    });
  }

  toggleResetPasswordPanel() {
    this.resetPasswordPanelOpen = !this.resetPasswordPanelOpen;
    if (this.resetPasswordPanelOpen) {
      this.resetPasswordForm.patchValue({ email: this.loginForm.controls.email.value });
    }
  }

  resetPassword() {
    const resetForm = this.resetPasswordForm.getRawValue();
    if (!resetForm.email.trim() || !resetForm.newPassword.trim() || !resetForm.confirmPassword.trim()) {
      this.error = 'Email, new password, and confirmation are required.';
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      this.error = 'New password and confirmation must match.';
      return;
    }

    this.formBusy = 'resetPassword';
    this.peopleOs.resetPassword({
      email: resetForm.email,
      newPassword: resetForm.newPassword
    }).pipe(finalize(() => this.formBusy = '')).subscribe({
      next: () => {
        this.loginForm.patchValue({
          email: resetForm.email,
          password: resetForm.newPassword
        });
        this.resetPasswordForm.reset({
          email: resetForm.email,
          newPassword: '',
          confirmPassword: ''
        });
        this.resetPasswordPanelOpen = false;
        this.error = '';
        this.showMessage('Password reset successfully. Sign in with the new password.');
      },
      error: () => {
        this.error = 'Password reset failed. Check the email and try again.';
      }
    });
  }

  isBusy(action: string): boolean {
    return this.formBusy === action;
  }

  private showMessage(message: string) {
    this.message = message;
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
    }
    this.messageTimer = setTimeout(() => this.message = '', 4000);
  }
}
