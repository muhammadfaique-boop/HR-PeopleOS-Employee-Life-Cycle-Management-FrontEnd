import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FileReaderService } from './core/services/file-reader.service';
import { PeopleOsFacade } from './features/peopleos/store/peopleos-facade.service';
import { PRIMENG_UI_IMPORTS } from './shared/components/ui/primeng-ui.imports';
import { collectRequiredFieldErrors } from './shared/validators/required-fields.validator';
import {
  AttendanceCorrectionFormModel,
  AttendanceData,
  BenefitPlan,
  Dashboard,
  Employee,
  ExpenseClaim,
  ExpenseFormModel,
  LeaveData,
  LeaveFormModel,
  NotificationItem,
  NotificationTone,
  PasswordFormModel,
  PermissionKey,
  PermissionScope,
  PolicyDocument,
  ResignationFormModel,
  ResignationRequest,
  Session,
  SupportedLanguage,
  ViewKey
} from './shared/models/peopleos.models';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, ...PRIMENG_UI_IMPORTS],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  private readonly peopleOs = inject(PeopleOsFacade);
  private readonly fileReader = inject(FileReaderService);
  private readonly inactivityLimitMs = 20 * 60 * 1000;
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  email = 'employee@peopleos.dev';
  password = 'Employee@123';
  error = '';
  loading = false;
  workspaceLoading = false;
  formBusy = '';
  validationErrors: Record<string, string> = {};
  session: Session | null = null;
  dashboard: Dashboard | null = null;
  attendance: AttendanceData | null = null;
  leave: LeaveData | null = null;
  benefits: BenefitPlan[] = [];
  policies: PolicyDocument[] = [];
  expenseClaims: ExpenseClaim[] = [];
  resignations: ResignationRequest[] = [];
  activeView: ViewKey = 'overview';
  message = '';
  notificationsOpen = false;
  readNotificationKeys = new Set<string>();
  profileMenuOpen = false;
  passwordPanelOpen = false;
  selectedLanguage = 'English';
  profileImageUrl = '';
  passwordForm: PasswordFormModel = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  leaveForm: LeaveFormModel = {
    employeeId: 2,
    leaveType: 'Casual Leave',
    fromDate: '',
    toDate: '',
    reason: '',
    contactDuringLeave: '',
    attachmentFileName: '',
    attachmentDataUrl: ''
  };
  correctionForm: AttendanceCorrectionFormModel = {
    employeeId: 2,
    workDate: '',
    requestedChange: '',
    reason: ''
  };
  expenseForm: ExpenseFormModel = {
    employeeId: 2,
    claimType: 'Medical Expense OPD',
    category: 'Medical OPD',
    amount: 0,
    expenseDate: '',
    description: '',
    receiptFileName: '',
    receiptDataUrl: ''
  };
  resignationForm: ResignationFormModel = {
    employeeId: 2,
    lastWorkingDate: '',
    reason: ''
  };
  private readonly viewPermissions: Record<ViewKey, PermissionKey> = {
    overview: 'attendance.read',
    people: 'employee.read',
    attendance: 'attendance.read',
    leave: 'leave.read',
    benefits: 'benefit.read',
    expense: 'expense.read',
    resignation: 'resignation.read',
    profile: 'employee.update',
    policies: 'policy.read'
  };
  readonly leaveTypeOptions = ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Work from Home', 'Unpaid'].map(value => ({ label: value, value }));
  readonly expenseClaimOptions = ['Medical Expense OPD', 'Business Expense'].map(value => ({ label: value, value }));
  readonly expenseCategoryOptions = ['Medical OPD', 'Business Expense'].map(value => ({ label: value, value }));
  readonly languageOptions: SupportedLanguage[] = ['English', 'Urdu', 'Arabic', 'French'];

  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  @HostListener('document:scroll')
  resetInactivityTimer() {
    if (!this.session) {
      return;
    }

    this.clearInactivityTimer();
    this.inactivityTimer = setTimeout(() => this.expireSession(), this.inactivityLimitMs);
  }

  ngOnDestroy() {
    this.clearInactivityTimer();
  }

  login() {
    this.validationErrors = {};
    if (!this.email.trim() || !this.password.trim()) {
      this.error = this.t('requiredLogin');
      return;
    }

    this.loading = true;
    this.error = '';

    this.peopleOs.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: session => {
        this.session = session;
        this.selectedLanguage = session.employee.preferredLanguage || 'English';
        this.profileImageUrl = session.employee.profileImageUrl || '';
        this.resetInactivityTimer();
        this.loadWorkspace();
      },
      error: () => {
        this.loading = false;
        this.error = this.t('loginFailed');
      }
    });
  }

  logout() {
    this.session = null;
    this.dashboard = null;
    this.activeView = 'overview';
    this.profileMenuOpen = false;
    this.passwordPanelOpen = false;
    this.clearInactivityTimer();
  }

  selectView(view: ViewKey) {
    if (!this.canOpenView(view)) {
      this.message = this.t('permissionDenied');
      return;
    }

    this.activeView = view;
    this.notificationsOpen = false;
    this.profileMenuOpen = false;
  }

  openQuickAction(target: string) {
    const allowedViews: ViewKey[] = ['overview', 'people', 'attendance', 'leave', 'benefits', 'expense', 'resignation', 'profile', 'policies'];
    if (allowedViews.includes(target as ViewKey) && this.canOpenView(target as ViewKey)) {
      this.selectView(target as ViewKey);
    }
  }

  quickActionLabel(target: string): string {
    const labels: Record<string, TranslationKey> = {
      leave: 'applyLeave',
      attendance: 'submitCorrection',
      expense: 'submitClaim',
      policies: 'policiesDownloads'
    };

    return labels[target] ? this.t(labels[target]) : target;
  }

  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
    this.profileMenuOpen = false;
  }

  markNotificationsRead() {
    this.notifications
      .filter(note => note.tone === 'urgent')
      .forEach(note => this.readNotificationKeys.add(note.key));
    this.notificationsOpen = false;
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
    this.notificationsOpen = false;
  }

  showPasswordPanel() {
    this.passwordPanelOpen = !this.passwordPanelOpen;
  }

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.session) {
      return;
    }

    this.fileReader.readAttachment(event).subscribe(attachment => {
      if (!attachment) {
        return;
      }

      this.profileImageUrl = attachment.dataUrl;
      this.updateProfile();
    });
  }

  attachLeaveFile(event: Event) {
    this.fileReader.readAttachment(event).subscribe(attachment => {
      if (!attachment) {
        return;
      }

      this.leaveForm.attachmentFileName = attachment.fileName;
      this.leaveForm.attachmentDataUrl = attachment.dataUrl;
    });
  }

  attachExpenseReceipt(event: Event) {
    this.fileReader.readAttachment(event).subscribe(attachment => {
      if (!attachment) {
        return;
      }

      this.expenseForm.receiptFileName = attachment.fileName;
      this.expenseForm.receiptDataUrl = attachment.dataUrl;
    });
  }

  changePassword() {
    if (!this.session) {
      return;
    }

    this.validationErrors = {};
    if (!this.requireFields([
      ['currentPassword', this.passwordForm.currentPassword],
      ['newPassword', this.passwordForm.newPassword],
      ['confirmPassword', this.passwordForm.confirmPassword]
    ])) {
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.message = this.t('passwordMismatch');
      return;
    }

    this.formBusy = 'password';
    this.peopleOs.changePassword({
      email: this.session.email,
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).pipe(finalize(() => this.formBusy = '')).subscribe({
      next: () => {
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.passwordPanelOpen = false;
        this.message = this.t('passwordChanged');
      },
      error: () => {
        this.message = this.t('passwordChangeFailed');
      }
    });
  }

  get notifications(): NotificationItem[] {
    if (!this.dashboard) {
      return [];
    }

    const approvals = this.dashboard.approvals.map(item => ({
      key: `approval-${item.id}-${item.status}`,
      title: this.t('approvalRequired'),
      body: `${this.translateText(item.subject)} - ${this.translateText(item.status)}`,
      tone: 'urgent' as NotificationTone
    }));

    const activity = this.dashboard.recentActivity.map((item, index) => ({
      key: `activity-${index}-${item}`,
      title: this.t('recentActivity'),
      body: this.translateText(item),
      tone: 'info' as NotificationTone
    }));

    return [...approvals, ...activity].slice(0, 6);
  }

  get unreadNotifications() {
    return this.notifications.filter(note => note.tone === 'urgent' && !this.readNotificationKeys.has(note.key)).length;
  }

  submitLeave() {
    if (!this.hasPermission('leave.create')) {
      this.message = this.t('permissionDenied');
      return;
    }

    this.validationErrors = {};
    if (!this.requireFields([
      ['fromDate', this.leaveForm.fromDate],
      ['toDate', this.leaveForm.toDate],
      ['leaveReason', this.leaveForm.reason],
      ['leaveContact', this.leaveForm.contactDuringLeave]
    ])) {
      return;
    }

    this.formBusy = 'leave';
    this.peopleOs.submitLeave(this.leaveForm).pipe(finalize(() => this.formBusy = '')).subscribe(item => {
      this.leave?.requests.unshift(item);
      this.message = this.t('leaveSubmitted');
      this.loadWorkspace();
    });
  }

  submitCorrection() {
    if (!this.hasPermission('attendance.correct')) {
      this.message = this.t('permissionDenied');
      return;
    }

    this.validationErrors = {};
    if (!this.requireFields([
      ['correctionDate', this.correctionForm.workDate],
      ['requestedChange', this.correctionForm.requestedChange],
      ['correctionReason', this.correctionForm.reason]
    ])) {
      return;
    }

    this.formBusy = 'correction';
    this.peopleOs.submitCorrection(this.correctionForm).pipe(finalize(() => this.formBusy = '')).subscribe(item => {
      this.attendance?.corrections.unshift(item);
      this.message = this.t('correctionSubmitted');
      this.loadWorkspace();
    });
  }

  submitExpense() {
    if (!this.hasPermission('expense.create')) {
      this.message = this.t('permissionDenied');
      return;
    }

    this.validationErrors = {};
    if (!this.requireFields([
      ['expenseDate', this.expenseForm.expenseDate],
      ['amount', this.expenseForm.amount > 0 ? String(this.expenseForm.amount) : ''],
      ['expenseDescription', this.expenseForm.description]
    ])) {
      return;
    }

    this.formBusy = 'expense';
    this.peopleOs.submitExpense(this.expenseForm).pipe(finalize(() => this.formBusy = '')).subscribe(item => {
      this.expenseClaims.unshift(item);
      this.message = this.t('expenseSubmitted');
      this.loadWorkspace();
    });
  }

  submitResignation() {
    if (!this.hasPermission('resignation.create')) {
      this.message = this.t('permissionDenied');
      return;
    }

    this.validationErrors = {};
    if (!this.requireFields([
      ['lastWorkingDate', this.resignationForm.lastWorkingDate],
      ['resignationReason', this.resignationForm.reason]
    ])) {
      return;
    }

    this.formBusy = 'resignation';
    this.peopleOs.submitResignation(this.resignationForm).pipe(finalize(() => this.formBusy = '')).subscribe(item => {
      this.resignations.unshift(item);
      this.message = this.t('resignationSubmitted');
      this.loadWorkspace();
    });
  }

  updateProfile() {
    if (!this.session) {
      return;
    }

    if (!this.hasPermission('employee.update')) {
      this.message = this.t('permissionDenied');
      return;
    }

    this.validationErrors = {};
    if (!this.requireFields([
      ['language', this.selectedLanguage]
    ])) {
      return;
    }

    this.formBusy = 'profile';
    this.peopleOs.updateProfile(this.session.employee.id, {
      preferredLanguage: this.selectedLanguage,
      profileImageUrl: this.profileImageUrl
    }).pipe(finalize(() => this.formBusy = '')).subscribe(employee => {
      this.session = { ...this.session!, employee };
      this.message = this.t('profileUpdated');
      this.profileMenuOpen = false;
    });
  }

  downloadAttendance(format: 'excel' | 'pdf') {
    if (!this.hasPermission('attendance.read')) {
      this.message = this.t('permissionDenied');
      return;
    }

    this.peopleOs.downloadAttendance(format, this.session?.employee.id ?? 2);
  }

  canOpenView(view: ViewKey): boolean {
    return this.hasPermission(this.viewPermissions[view]);
  }

  canOpenTarget(target: string): boolean {
    return Boolean(this.viewPermissions[target as ViewKey]) && this.canOpenView(target as ViewKey);
  }

  hasPermission(permission: PermissionKey, minimumScope?: PermissionScope): boolean {
    const grant = this.session?.permissions?.find(item => item.key === permission);
    if (!grant) {
      return false;
    }

    if (!minimumScope) {
      return true;
    }

    return this.scopeRank(grant.scope) >= this.scopeRank(minimumScope);
  }

  get permissionSummary(): string {
    return `${this.session?.role ?? ''} - ${this.session?.scope ?? ''}`;
  }

  private loadWorkspace() {
    this.workspaceLoading = true;
    this.peopleOs.loadWorkspace().pipe(finalize(() => {
      this.loading = false;
      this.workspaceLoading = false;
    })).subscribe(data => {
      this.dashboard = data.dashboard;
      this.attendance = data.attendance;
      this.leave = data.leave;
      this.benefits = data.benefits;
      this.policies = data.policies;
      this.expenseClaims = data.expenseClaims;
      this.resignations = data.resignations;
    });
  }

  t(key: TranslationKey): string {
    const language = this.selectedLanguage as SupportedLanguage;
    return (translations[language] as Partial<Record<TranslationKey, string>>)?.[key] ?? translations.English[key] ?? key;
  }

  translateText(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const text = String(value);
    const language = this.selectedLanguage as SupportedLanguage;
    return textTranslations[language]?.[text] ?? text;
  }

  fieldError(field: string): string {
    return this.validationErrors[field] ?? '';
  }

  isBusy(action: string): boolean {
    return this.formBusy === action;
  }

  private requireFields(fields: Array<[string, string | number | null | undefined]>): boolean {
    this.validationErrors = {
      ...this.validationErrors,
      ...collectRequiredFieldErrors(fields, this.t('requiredField'))
    };

    return Object.keys(this.validationErrors).length === 0;
  }

  private scopeRank(scope: PermissionScope): number {
    const ranks: Record<PermissionScope, number> = {
      own: 1,
      team: 2,
      department: 3,
      branch: 4,
      organization: 5
    };

    return ranks[scope] ?? 0;
  }

  private clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private expireSession() {
    this.logout();
    this.error = this.t('sessionExpired');
  }
}
type TranslationKey = keyof typeof translations.English;

const translations = {
  English: {
    appTitle: 'PeopleOS',
    appSubtitle: 'Lifecycle HR',
    heroTitle: 'Hire-to-retire operations, without the maze.',
    heroCopy: 'Lifecycle-first HR for onboarding, profile data, attendance, leave, benefits, expenses, resignation, policies, and approvals.',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    demoUsers: 'Demo users',
    dashboard: 'Dashboard',
    employeeData: 'Employee Data',
    attendance: 'Attendance',
    leaves: 'Leaves',
    benefits: 'Benefits',
    expense: 'Expense',
    resignation: 'Resignation',
    profile: 'Profile',
    policies: 'Policies',
    excluded: 'Excluded',
    excludedCopy: 'Payroll, tax, travel management, and help desk tickets.',
    welcomeBack: 'Welcome back',
    signOut: 'Sign out',
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    markRead: 'Mark read',
    approvalRequired: 'Approval required',
    recentActivity: 'Recent activity',
    hrHub: 'HR Hub',
    quickActions: 'Quick Actions',
    whoIsOut: "Who's Out",
    holidays: 'Holidays',
    announcements: 'Announcements',
    lifecycleSignals: 'Lifecycle Signals',
    noOneOut: 'No approved absences coming up.',
    audience: 'Audience',
    lifecycleTracker: 'Lifecycle Tracker',
    hireToRetire: 'Hire to retire',
    owner: 'owner',
    due: 'Due',
    lineManagerApprovalQueue: 'Line Manager Approval Queue',
    open: 'open',
    employeeDirectory: 'Employee Directory',
    profiles: 'profiles',
    manager: 'Manager',
    monthlyAttendanceLog: 'Monthly Attendance Log',
    downloadExcel: 'Download Excel',
    downloadPdf: 'Download PDF',
    date: 'Date',
    in: 'In',
    out: 'Out',
    status: 'Status',
    attendanceCorrectionSpecific: 'Attendance Correction On Specific Date',
    lineManagerReview: 'Line manager review',
    correctionDate: 'Correction date',
    requestedChange: 'Requested change',
    reason: 'Reason',
    submitCorrection: 'Submit Correction',
    applyLeave: 'Apply for Leave',
    calendarDates: 'Calendar dates',
    fromDate: 'From date',
    toDate: 'To date',
    contactDuringLeave: 'Contact during leave',
    submitLeave: 'Submit Leave',
    attachLeaveDocument: 'Attach leave document',
    selectedFile: 'Selected file',
    leaveBalance: 'Leave Balance',
    availableDays: 'Available days',
    available: 'available',
    leaveRequests: 'Leave Requests',
    statusTracking: 'Status tracking',
    benefitsTitle: 'Benefits, Mobility and Expense Categories',
    availableSections: 'Available sections',
    expenseClaim: 'Expense Claim',
    medicalOpd: 'Medical OPD',
    amount: 'Amount',
    claimDescription: 'Claim description',
    submitClaim: 'Submit Claim',
    attachReceipt: 'Attach receipt',
    claimHistory: 'Claim History',
    lineManagerRouted: 'Line manager routed',
    resignationRequest: 'Resignation Request',
    offboarding: 'Offboarding',
    submitResignation: 'Submit Resignation',
    resignationHistory: 'Resignation History',
    clearanceWorkflow: 'Clearance workflow',
    lastWorkingDay: 'Last working day',
    profileManagement: 'Profile Management',
    languageAndPicture: 'Language and picture',
    language: 'Language',
    profileImageUrl: 'Profile image URL',
    updateProfile: 'Update Profile',
    uploadImage: 'Upload Image',
    changePassword: 'Change Password',
    activateMobileApp: 'Activate Mobile App',
    setCacheAuthority: 'Set Cache Authority',
    unavailable: 'Unavailable',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    savePassword: 'Save Password',
    policiesDownloads: 'Policies and Downloads',
    knowledgeBase: 'Knowledge base',
    policy: 'Policy',
    category: 'Category',
    version: 'Version',
    published: 'Published',
    daySuffix: 'day(s)',
    requiredField: 'This field is required.',
    requiredLogin: 'Email and password are required.',
    sessionExpired: 'Session expired after 20 minutes of inactivity. Please sign in again.',
    permissionDenied: 'You do not have permission for this action.',
    loadingWorkspace: 'Loading workspace...',
    saving: 'Saving...',
    loginFailed: 'Login failed. Use one of the demo accounts below.',
    leaveSubmitted: 'Leave request submitted to line manager.',
    correctionSubmitted: 'Attendance correction submitted to line manager.',
    expenseSubmitted: 'Expense claim submitted to line manager.',
    resignationSubmitted: 'Resignation request submitted to line manager.',
    profileUpdated: 'Profile settings updated.'
    ,
    passwordChanged: 'Password changed successfully.',
    passwordMismatch: 'New password and confirmation must match.',
    passwordChangeFailed: 'Current password is not correct.'
  },
  Urdu: {
    appTitle: 'پیپل او ایس',
    appSubtitle: 'ملازمتی سفر HR',
    heroTitle: 'بھرتی سے ریٹائرمنٹ تک HR کام آسان۔',
    heroCopy: 'آن بورڈنگ، پروفائل، حاضری، چھٹی، فوائد، اخراجات، استعفیٰ، پالیسیز اور منظوریوں کے لیے HR پورٹل۔',
    email: 'ای میل',
    password: 'پاس ورڈ',
    signIn: 'لاگ ان',
    signingIn: 'لاگ ان ہو رہا ہے...',
    demoUsers: 'ڈیمو صارفین',
    dashboard: 'ڈیش بورڈ',
    employeeData: 'ملازم ڈیٹا',
    attendance: 'حاضری',
    leaves: 'چھٹیاں',
    benefits: 'فوائد',
    expense: 'اخراجات',
    resignation: 'استعفیٰ',
    profile: 'پروفائل',
    policies: 'پالیسیاں',
    excluded: 'شامل نہیں',
    excludedCopy: 'پے رول، ٹیکس، ٹریول مینجمنٹ، اور ہیلپ ڈیسک ٹکٹس۔',
    welcomeBack: 'خوش آمدید',
    signOut: 'لاگ آؤٹ',
    notifications: 'اطلاعات',
    noNotifications: 'کوئی اطلاع نہیں',
    markRead: 'پڑھ لیا',
    approvalRequired: 'منظوری درکار',
    recentActivity: 'حالیہ سرگرمی',
    lifecycleTracker: 'لائف سائیکل ٹریکر',
    hireToRetire: 'بھرتی سے ریٹائرمنٹ',
    owner: 'ذمہ دار',
    due: 'آخری تاریخ',
    lineManagerApprovalQueue: 'لائن مینیجر منظوری قطار',
    open: 'کھلی',
    employeeDirectory: 'ملازم ڈائریکٹری',
    profiles: 'پروفائلز',
    manager: 'مینیجر',
    monthlyAttendanceLog: 'ماہانہ حاضری لاگ',
    downloadExcel: 'ایکسل ڈاؤن لوڈ',
    downloadPdf: 'پی ڈی ایف ڈاؤن لوڈ',
    date: 'تاریخ',
    in: 'آمد',
    out: 'روانگی',
    status: 'حیثیت',
    attendanceCorrectionSpecific: 'مخصوص تاریخ کی حاضری درستگی',
    lineManagerReview: 'لائن مینیجر جائزہ',
    correctionDate: 'درستگی کی تاریخ',
    requestedChange: 'درخواست کردہ تبدیلی',
    reason: 'وجہ',
    submitCorrection: 'درستگی جمع کریں',
    applyLeave: 'چھٹی اپلائی کریں',
    calendarDates: 'کیلنڈر تاریخیں',
    fromDate: 'شروع تاریخ',
    toDate: 'اختتامی تاریخ',
    contactDuringLeave: 'چھٹی کے دوران رابطہ',
    submitLeave: 'چھٹی جمع کریں',
    attachLeaveDocument: 'چھٹی دستاویز منسلک کریں',
    selectedFile: 'منتخب فائل',
    leaveBalance: 'چھٹی بیلنس',
    availableDays: 'دستیاب دن',
    available: 'دستیاب',
    leaveRequests: 'چھٹی درخواستیں',
    statusTracking: 'اسٹیٹس ٹریکنگ',
    benefitsTitle: 'فوائد، موبلٹی اور اخراجات کی اقسام',
    availableSections: 'دستیاب حصے',
    expenseClaim: 'اخراجات کلیم',
    medicalOpd: 'میڈیکل او پی ڈی',
    amount: 'رقم',
    claimDescription: 'کلیم تفصیل',
    submitClaim: 'کلیم جمع کریں',
    attachReceipt: 'رسید منسلک کریں',
    claimHistory: 'کلیم ہسٹری',
    lineManagerRouted: 'لائن مینیجر کو بھیجا گیا',
    resignationRequest: 'استعفیٰ درخواست',
    offboarding: 'آف بورڈنگ',
    submitResignation: 'استعفیٰ جمع کریں',
    resignationHistory: 'استعفیٰ ہسٹری',
    clearanceWorkflow: 'کلیئرنس ورک فلو',
    lastWorkingDay: 'آخری کام کا دن',
    profileManagement: 'پروفائل مینجمنٹ',
    languageAndPicture: 'زبان اور تصویر',
    language: 'زبان',
    profileImageUrl: 'پروفائل تصویر URL',
    updateProfile: 'پروفائل اپڈیٹ',
    uploadImage: 'تصویر اپ لوڈ',
    changePassword: 'پاس ورڈ تبدیل کریں',
    activateMobileApp: 'موبائل ایپ فعال کریں',
    setCacheAuthority: 'کیش اتھارٹی سیٹ کریں',
    unavailable: 'دستیاب نہیں',
    currentPassword: 'موجودہ پاس ورڈ',
    newPassword: 'نیا پاس ورڈ',
    confirmPassword: 'پاس ورڈ تصدیق',
    savePassword: 'پاس ورڈ محفوظ',
    policiesDownloads: 'پالیسیاں اور ڈاؤن لوڈز',
    knowledgeBase: 'علمی مرکز',
    policy: 'پالیسی',
    category: 'قسم',
    version: 'ورژن',
    published: 'شائع',
    daySuffix: 'دن',
    requiredField: 'یہ فیلڈ ضروری ہے۔',
    requiredLogin: 'ای میل اور پاس ورڈ ضروری ہیں۔',
    sessionExpired: '20 منٹ غیر فعال رہنے کے بعد سیشن ختم ہو گیا۔ دوبارہ لاگ ان کریں۔',
    permissionDenied: 'آپ کو اس عمل کی اجازت نہیں ہے۔',
    loadingWorkspace: 'ورک اسپیس لوڈ ہو رہی ہے...',
    saving: 'محفوظ ہو رہا ہے...',
    loginFailed: 'لاگ ان ناکام۔ نیچے موجود ڈیمو اکاؤنٹس استعمال کریں۔',
    leaveSubmitted: 'چھٹی درخواست لائن مینیجر کو بھیج دی گئی۔',
    correctionSubmitted: 'حاضری درستگی لائن مینیجر کو بھیج دی گئی۔',
    expenseSubmitted: 'اخراجات کلیم لائن مینیجر کو بھیج دیا گیا۔',
    resignationSubmitted: 'استعفیٰ درخواست لائن مینیجر کو بھیج دی گئی۔',
    profileUpdated: 'پروفائل سیٹنگز اپڈیٹ ہو گئیں۔',
    passwordChanged: 'پاس ورڈ کامیابی سے تبدیل ہو گیا۔',
    passwordMismatch: 'نیا پاس ورڈ اور تصدیق ایک جیسے ہونے چاہئیں۔',
    passwordChangeFailed: 'موجودہ پاس ورڈ درست نہیں۔'
  },
  Arabic: {
    appTitle: 'PeopleOS',
    appSubtitle: 'دورة حياة الموارد البشرية',
    heroTitle: 'عمليات من التوظيف إلى التقاعد بلا تعقيد.',
    heroCopy: 'بوابة موارد بشرية للإلحاق، الملف الشخصي، الحضور، الإجازات، المزايا، المصروفات، الاستقالة، السياسات والموافقات.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signingIn: 'جار تسجيل الدخول...',
    demoUsers: 'مستخدمو التجربة',
    dashboard: 'لوحة التحكم',
    employeeData: 'بيانات الموظف',
    attendance: 'الحضور',
    leaves: 'الإجازات',
    benefits: 'المزايا',
    expense: 'المصروفات',
    resignation: 'الاستقالة',
    profile: 'الملف الشخصي',
    policies: 'السياسات',
    excluded: 'غير مشمول',
    excludedCopy: 'الرواتب، الضرائب، إدارة السفر، وتذاكر الدعم.',
    welcomeBack: 'مرحباً بعودتك',
    signOut: 'تسجيل الخروج',
    notifications: 'الإشعارات',
    noNotifications: 'لا توجد إشعارات',
    markRead: 'تمت القراءة',
    approvalRequired: 'موافقة مطلوبة',
    recentActivity: 'نشاط حديث',
    lifecycleTracker: 'متتبع دورة الحياة',
    hireToRetire: 'من التوظيف إلى التقاعد',
    owner: 'المسؤول',
    due: 'الموعد',
    lineManagerApprovalQueue: 'قائمة موافقات المدير المباشر',
    open: 'مفتوحة',
    employeeDirectory: 'دليل الموظفين',
    profiles: 'ملفات',
    manager: 'المدير',
    monthlyAttendanceLog: 'سجل الحضور الشهري',
    downloadExcel: 'تحميل Excel',
    downloadPdf: 'تحميل PDF',
    date: 'التاريخ',
    in: 'الدخول',
    out: 'الخروج',
    status: 'الحالة',
    attendanceCorrectionSpecific: 'تصحيح الحضور لتاريخ محدد',
    lineManagerReview: 'مراجعة المدير المباشر',
    correctionDate: 'تاريخ التصحيح',
    requestedChange: 'التغيير المطلوب',
    reason: 'السبب',
    submitCorrection: 'إرسال التصحيح',
    applyLeave: 'طلب إجازة',
    calendarDates: 'تواريخ التقويم',
    fromDate: 'من تاريخ',
    toDate: 'إلى تاريخ',
    contactDuringLeave: 'التواصل أثناء الإجازة',
    submitLeave: 'إرسال الإجازة',
    attachLeaveDocument: 'إرفاق مستند الإجازة',
    selectedFile: 'الملف المختار',
    leaveBalance: 'رصيد الإجازات',
    availableDays: 'الأيام المتاحة',
    available: 'متاح',
    leaveRequests: 'طلبات الإجازة',
    statusTracking: 'تتبع الحالة',
    benefitsTitle: 'المزايا والتنقل وفئات المصروفات',
    availableSections: 'الأقسام المتاحة',
    expenseClaim: 'مطالبة مصروفات',
    medicalOpd: 'طبي خارجي',
    amount: 'المبلغ',
    claimDescription: 'وصف المطالبة',
    submitClaim: 'إرسال المطالبة',
    attachReceipt: 'إرفاق الإيصال',
    claimHistory: 'سجل المطالبات',
    lineManagerRouted: 'موجه للمدير المباشر',
    resignationRequest: 'طلب استقالة',
    offboarding: 'إنهاء الخدمة',
    submitResignation: 'إرسال الاستقالة',
    resignationHistory: 'سجل الاستقالات',
    clearanceWorkflow: 'مسار المخالصة',
    lastWorkingDay: 'آخر يوم عمل',
    profileManagement: 'إدارة الملف الشخصي',
    languageAndPicture: 'اللغة والصورة',
    language: 'اللغة',
    profileImageUrl: 'رابط صورة الملف',
    updateProfile: 'تحديث الملف',
    uploadImage: 'رفع الصورة',
    changePassword: 'تغيير كلمة المرور',
    activateMobileApp: 'تفعيل تطبيق الجوال',
    setCacheAuthority: 'تعيين صلاحية التخزين',
    unavailable: 'غير متاح',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة مرور جديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    savePassword: 'حفظ كلمة المرور',
    policiesDownloads: 'السياسات والتنزيلات',
    knowledgeBase: 'قاعدة المعرفة',
    policy: 'السياسة',
    category: 'الفئة',
    version: 'الإصدار',
    published: 'النشر',
    daySuffix: 'يوم',
    requiredField: 'هذا الحقل مطلوب.',
    requiredLogin: 'البريد الإلكتروني وكلمة المرور مطلوبان.',
    sessionExpired: 'انتهت الجلسة بعد 20 دقيقة من عدم النشاط. يرجى تسجيل الدخول مرة أخرى.',
    permissionDenied: 'ليس لديك صلاحية لهذا الإجراء.',
    loadingWorkspace: 'جاري تحميل مساحة العمل...',
    saving: 'جار الحفظ...',
    loginFailed: 'فشل تسجيل الدخول. استخدم أحد حسابات التجربة أدناه.',
    leaveSubmitted: 'تم إرسال طلب الإجازة إلى المدير المباشر.',
    correctionSubmitted: 'تم إرسال تصحيح الحضور إلى المدير المباشر.',
    expenseSubmitted: 'تم إرسال مطالبة المصروفات إلى المدير المباشر.',
    resignationSubmitted: 'تم إرسال طلب الاستقالة إلى المدير المباشر.',
    profileUpdated: 'تم تحديث إعدادات الملف الشخصي.',
    passwordChanged: 'تم تغيير كلمة المرور بنجاح.',
    passwordMismatch: 'يجب أن تتطابق كلمة المرور الجديدة مع التأكيد.',
    passwordChangeFailed: 'كلمة المرور الحالية غير صحيحة.'
  },
  French: {
    appTitle: 'PeopleOS',
    appSubtitle: 'Cycle RH',
    heroTitle: 'Les opérations RH du recrutement au départ, sans labyrinthe.',
    heroCopy: 'Portail RH pour onboarding, profil, présence, congés, avantages, dépenses, démission, politiques et validations.',
    email: 'E-mail',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    signingIn: 'Connexion...',
    demoUsers: 'Utilisateurs démo',
    dashboard: 'Tableau de bord',
    employeeData: 'Données employé',
    attendance: 'Présence',
    leaves: 'Congés',
    benefits: 'Avantages',
    expense: 'Dépenses',
    resignation: 'Démission',
    profile: 'Profil',
    policies: 'Politiques',
    excluded: 'Exclus',
    excludedCopy: 'Paie, taxes, gestion des voyages et tickets support.',
    welcomeBack: 'Bon retour',
    signOut: 'Déconnexion',
    notifications: 'Notifications',
    noNotifications: 'Aucune notification',
    markRead: 'Marquer lu',
    approvalRequired: 'Validation requise',
    recentActivity: 'Activité récente',
    lifecycleTracker: 'Suivi du cycle',
    hireToRetire: 'Du recrutement au départ',
    owner: 'responsable',
    due: 'Échéance',
    lineManagerApprovalQueue: 'File de validation du manager',
    open: 'ouvertes',
    employeeDirectory: 'Annuaire employés',
    profiles: 'profils',
    manager: 'Manager',
    monthlyAttendanceLog: 'Journal mensuel de présence',
    downloadExcel: 'Télécharger Excel',
    downloadPdf: 'Télécharger PDF',
    date: 'Date',
    in: 'Entrée',
    out: 'Sortie',
    status: 'Statut',
    attendanceCorrectionSpecific: 'Correction de présence à une date précise',
    lineManagerReview: 'Revue du manager',
    correctionDate: 'Date de correction',
    requestedChange: 'Changement demandé',
    reason: 'Motif',
    submitCorrection: 'Envoyer la correction',
    applyLeave: 'Demander un congé',
    calendarDates: 'Dates calendrier',
    fromDate: 'Date début',
    toDate: 'Date fin',
    contactDuringLeave: 'Contact pendant congé',
    submitLeave: 'Envoyer le congé',
    attachLeaveDocument: 'Joindre document congé',
    selectedFile: 'Fichier sélectionné',
    leaveBalance: 'Solde congés',
    availableDays: 'Jours disponibles',
    available: 'disponibles',
    leaveRequests: 'Demandes de congé',
    statusTracking: 'Suivi statut',
    benefitsTitle: 'Avantages, mobilité et catégories de dépenses',
    availableSections: 'Sections disponibles',
    expenseClaim: 'Note de frais',
    medicalOpd: 'Médical OPD',
    amount: 'Montant',
    claimDescription: 'Description de la demande',
    submitClaim: 'Envoyer la demande',
    attachReceipt: 'Joindre reçu',
    claimHistory: 'Historique demandes',
    lineManagerRouted: 'Routé au manager',
    resignationRequest: 'Demande de démission',
    offboarding: 'Offboarding',
    submitResignation: 'Envoyer la démission',
    resignationHistory: 'Historique démissions',
    clearanceWorkflow: 'Circuit de clearance',
    lastWorkingDay: 'Dernier jour travaillé',
    profileManagement: 'Gestion du profil',
    languageAndPicture: 'Langue et photo',
    language: 'Langue',
    profileImageUrl: 'URL photo profil',
    updateProfile: 'Mettre à jour',
    uploadImage: 'Importer image',
    changePassword: 'Changer mot de passe',
    activateMobileApp: 'Activer app mobile',
    setCacheAuthority: 'Définir autorité cache',
    unavailable: 'Indisponible',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer mot de passe',
    savePassword: 'Enregistrer',
    policiesDownloads: 'Politiques et téléchargements',
    knowledgeBase: 'Base de connaissance',
    policy: 'Politique',
    category: 'Catégorie',
    version: 'Version',
    published: 'Publié',
    daySuffix: 'jour(s)',
    requiredField: 'Ce champ est obligatoire.',
    requiredLogin: 'E-mail et mot de passe sont obligatoires.',
    sessionExpired: 'Session expirée après 20 minutes d’inactivité. Connectez-vous à nouveau.',
    permissionDenied: 'Vous n’avez pas l’autorisation pour cette action.',
    loadingWorkspace: 'Chargement...',
    saving: 'Enregistrement...',
    loginFailed: 'Connexion échouée. Utilisez un compte démo ci-dessous.',
    leaveSubmitted: 'Demande de congé envoyée au manager.',
    correctionSubmitted: 'Correction de présence envoyée au manager.',
    expenseSubmitted: 'Note de frais envoyée au manager.',
    resignationSubmitted: 'Demande de démission envoyée au manager.',
    profileUpdated: 'Paramètres du profil mis à jour.',
    passwordChanged: 'Mot de passe modifié.',
    passwordMismatch: 'Le nouveau mot de passe et la confirmation doivent correspondre.',
    passwordChangeFailed: 'Le mot de passe actuel est incorrect.'
  }
} as const;

const textTranslations: Record<SupportedLanguage, Record<string, string>> = {
  English: {},
  Urdu: {
    'Active employees': 'فعال ملازمین',
    'On probation': 'پروبیشن پر',
    'Pending approvals': 'زیر التوا منظوری',
    'Profile completion': 'پروفائل تکمیل',
    'Pre-onboarding': 'پری آن بورڈنگ',
    'Official start': 'باقاعدہ آغاز',
    'Lifecycle records': 'لائف سائیکل ریکارڈز',
    'Post-onboarding integration': 'بعد از آن بورڈنگ انضمام',
    'Probation review': 'پروبیشن جائزہ',
    'Career growth': 'کیریئر گروتھ',
    'Done': 'مکمل',
    'In progress': 'جاری',
    'Needs attention': 'توجہ درکار',
    'Planned': 'منصوبہ بند',
    'Pending': 'زیر التوا',
    'In review': 'جائزہ میں',
    'Approved': 'منظور',
    'Approval Required': 'منظوری درکار',
    'Line Manager': 'لائن مینیجر',
    'HR': 'ایچ آر',
    'Benefit': 'فائدہ',
    'Mobility': 'موبلٹی',
    'Expense Category': 'اخراجات قسم',
    'Medical Expense OPD': 'میڈیکل او پی ڈی خرچ',
    'Business Expense': 'کاروباری خرچ',
    'Medical OPD': 'میڈیکل او پی ڈی',
    'Casual Leave': 'کیژول چھٹی',
    'Sick Leave': 'بیماری چھٹی',
    'Annual Leave': 'سالانہ چھٹی',
    'Work from Home': 'گھر سے کام',
    'Unpaid': 'بلا معاوضہ'
  },
  Arabic: {
    'Active employees': 'الموظفون النشطون',
    'On probation': 'تحت التجربة',
    'Pending approvals': 'موافقات معلقة',
    'Profile completion': 'اكتمال الملف',
    'Pre-onboarding': 'ما قبل الإلحاق',
    'Official start': 'البداية الرسمية',
    'Lifecycle records': 'سجلات دورة الحياة',
    'Post-onboarding integration': 'دمج ما بعد الإلحاق',
    'Probation review': 'مراجعة التجربة',
    'Career growth': 'النمو المهني',
    'Done': 'مكتمل',
    'In progress': 'قيد التنفيذ',
    'Needs attention': 'يحتاج انتباه',
    'Planned': 'مخطط',
    'Pending': 'معلق',
    'In review': 'قيد المراجعة',
    'Approved': 'معتمد',
    'Approval Required': 'موافقة مطلوبة',
    'Line Manager': 'المدير المباشر',
    'HR': 'الموارد البشرية',
    'Benefit': 'ميزة',
    'Mobility': 'تنقل',
    'Expense Category': 'فئة مصروف',
    'Medical Expense OPD': 'مصروف طبي خارجي',
    'Business Expense': 'مصروف عمل',
    'Medical OPD': 'طبي خارجي',
    'Casual Leave': 'إجازة عارضة',
    'Sick Leave': 'إجازة مرضية',
    'Annual Leave': 'إجازة سنوية',
    'Work from Home': 'عمل من المنزل',
    'Unpaid': 'غير مدفوعة'
  },
  French: {
    'Active employees': 'Employés actifs',
    'On probation': 'En probation',
    'Pending approvals': 'Validations en attente',
    'Profile completion': 'Profil complété',
    'Pre-onboarding': 'Pré-onboarding',
    'Official start': 'Début officiel',
    'Lifecycle records': 'Dossiers du cycle',
    'Post-onboarding integration': 'Intégration post-onboarding',
    'Probation review': 'Revue de probation',
    'Career growth': 'Évolution carrière',
    'Done': 'Terminé',
    'In progress': 'En cours',
    'Needs attention': 'Attention requise',
    'Planned': 'Planifié',
    'Pending': 'En attente',
    'In review': 'En revue',
    'Approved': 'Approuvé',
    'Approval Required': 'Validation requise',
    'Line Manager': 'Manager',
    'HR': 'RH',
    'Benefit': 'Avantage',
    'Mobility': 'Mobilité',
    'Expense Category': 'Catégorie dépense',
    'Medical Expense OPD': 'Dépense médicale OPD',
    'Business Expense': 'Dépense professionnelle',
    'Medical OPD': 'Médical OPD',
    'Casual Leave': 'Congé occasionnel',
    'Sick Leave': 'Congé maladie',
    'Annual Leave': 'Congé annuel',
    'Work from Home': 'Télétravail',
    'Unpaid': 'Non payé'
  }
};
