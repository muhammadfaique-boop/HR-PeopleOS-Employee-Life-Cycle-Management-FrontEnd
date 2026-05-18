import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('renders the login screen with demo credentials', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Hire-to-retire operations');
    expect(text).toContain('employee@peopleos.dev / Employee@123');
  });

  it('logs in and loads the PeopleOS workspace data', () => {
    component.login();

    const login = http.expectOne('http://localhost:5265/api/auth/login');
    expect(login.request.method).toBe('POST');
    login.flush(demoSession());

    http.expectOne('http://localhost:5265/api/peopleos/dashboard').flush(demoDashboard());
    http.expectOne('http://localhost:5265/api/peopleos/attendance').flush(demoAttendance());
    http.expectOne('http://localhost:5265/api/peopleos/leave').flush(demoLeave());
    http.expectOne('http://localhost:5265/api/peopleos/benefits').flush([
      { id: 1, name: 'Health Insurance', category: 'Medical', coverage: 'Family', status: 'Active' }
    ]);
    http.expectOne('http://localhost:5265/api/peopleos/policies').flush([
      { id: 1, title: 'Leave Policy', category: 'Leave', version: 'v1', publishedOn: '2026-03-15' }
    ]);
    http.expectOne('http://localhost:5265/api/peopleos/expense').flush([]);
    http.expectOne('http://localhost:5265/api/peopleos/resignations').flush([]);

    fixture.detectChanges();

    expect(component.session?.role).toBe('Employee');
    expect(component.loading).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Lifecycle Tracker');
    expect(fixture.nativeElement.textContent).toContain('Probation review');
  });

  it('shows an error when login fails', () => {
    component.login();

    const login = http.expectOne('http://localhost:5265/api/auth/login');
    login.flush({ message: 'Invalid demo credentials.' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.loading).toBeFalse();
    expect(component.error).toContain('Login failed');
  });

  it('switches module views and logs out cleanly', () => {
    component.session = demoSession();
    component.dashboard = demoDashboard();
    component.selectView('attendance');

    expect(component.activeView).toBe('attendance');

    component.logout();

    expect(component.session).toBeNull();
    expect(component.dashboard).toBeNull();
    expect(component.activeView).toBe('overview');
  });

  it('translates portal labels from the selected profile language', () => {
    component.selectedLanguage = 'Urdu';

    expect(component.t('dashboard')).toBe('ڈیش بورڈ');
    expect(component.translateText('Pending')).toBe('زیر التوا');
  });

  it('builds bell notifications from approvals and recent activity', () => {
    component.dashboard = demoDashboard();

    expect(component.unreadNotifications).toBe(1);
    expect(component.notifications.length).toBe(2);
    expect(component.notifications[0].title).toBe('Approval required');
  });

  it('marks approval notifications as read', () => {
    component.dashboard = demoDashboard();
    component.notificationsOpen = true;

    component.markNotificationsRead();

    expect(component.unreadNotifications).toBe(0);
    expect(component.notificationsOpen).toBeFalse();
  });

  it('blocks leave submission when required fields are missing', () => {
    component.session = demoSession();

    component.submitLeave();

    expect(component.fieldError('fromDate')).toBe('This field is required.');
    expect(component.fieldError('leaveReason')).toBe('This field is required.');
  });

  it('resets attendance correction form after successful submission', () => {
    component.session = demoSession();
    component.attendance = demoAttendance();
    component.correctionForm.setValue({
      employeeId: 2,
      workDate: '2026-05-19',
      requestedChange: 'sss',
      reason: 'issue'
    });

    component.submitCorrection();

    const request = http.expectOne('http://localhost:5265/api/peopleos/attendance/corrections');
    expect(request.request.body.requestedChange).toBe('sss');
    request.flush({
      id: 99,
      workDate: '2026-05-19',
      requestedChange: 'sss',
      reason: 'issue',
      status: 'Pending line manager',
      approver: 'Ayesha Khan'
    });

    expect(component.correctionForm.getRawValue()).toEqual({
      employeeId: 2,
      workDate: null,
      requestedChange: null,
      reason: null
    });
    expect(component.attendance?.corrections[0].requestedChange).toBe('sss');

    flushWorkspaceRequests(http);
  });

  it('auto logs out after 20 minutes of inactivity', fakeAsync(() => {
    component.session = demoSession();
    component.dashboard = demoDashboard();

    component.resetInactivityTimer();
    tick(20 * 60 * 1000);

    expect(component.session).toBeNull();
    expect(component.error).toContain('Session expired');
  }));
});

function demoSession() {
  return {
    token: 'demo-token-3',
    email: 'employee@peopleos.dev',
    role: 'Employee',
    scope: 'own',
    permissions: [
      { key: 'attendance.read', scope: 'own' },
      { key: 'attendance.correct', scope: 'own' },
      { key: 'leave.read', scope: 'own' },
      { key: 'leave.create', scope: 'own' },
      { key: 'employee.read', scope: 'own' },
      { key: 'employee.update', scope: 'own' },
      { key: 'benefit.read', scope: 'own' },
      { key: 'expense.read', scope: 'own' },
      { key: 'expense.create', scope: 'own' },
      { key: 'resignation.read', scope: 'own' },
      { key: 'resignation.create', scope: 'own' },
      { key: 'policy.read', scope: 'own' }
    ],
    employee: {
      id: 2,
      employeeCode: 'EMP-1042',
      fullName: 'Muhammad Faique',
      email: 'muhammad.faique@peopleos.dev',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      manager: 'Ayesha Khan',
      lifecycleStatus: 'Active',
      joiningDate: '2026-01-16',
      profileCompletion: 88,
      workLocation: 'Lahore',
      preferredLanguage: 'English',
      profileImageUrl: ''
    }
  };
}

function demoDashboard() {
  const employee = demoSession().employee;

  return {
    metrics: [{ label: 'Active employees', value: '2', accent: 'teal' }],
    activeEmployee: employee,
    employees: [employee],
    lifecycle: [
      {
        id: 4,
        employeeId: 3,
        stage: 'Probation review',
        owner: 'Manager',
        status: 'Needs attention',
        dueDate: '2026-06-28',
        summary: 'Manager feedback and confirmation decision pending.'
      }
    ],
    approvals: [
      {
        id: 1,
        type: 'Leave',
        subject: 'Casual Leave - Muhammad Faique',
        requester: 'Muhammad Faique',
        approverRole: 'Line Manager',
        status: 'Pending',
        dueDate: '2026-05-19'
      }
    ],
    whoIsOut: [
      {
        employeeName: 'Muhammad Faique',
        leaveType: 'Casual Leave',
        fromDate: '2026-05-22',
        toDate: '2026-05-22',
        department: 'Engineering'
      }
    ],
    holidays: [
      { name: 'Eid Holiday', date: '2026-05-27', type: 'Public Holiday' }
    ],
    announcements: [
      {
        title: 'Policy refresh',
        body: 'Attendance and leave policy updates are available in Policies.',
        publishedOn: '2026-05-18',
        audience: 'All employees'
      }
    ],
    quickActions: [
      { label: 'Apply Leave', target: 'leave' },
      { label: 'Correct Attendance', target: 'attendance' }
    ],
    lifecycleSignals: [
      { label: 'Open onboarding tasks', value: '2', status: 'In progress' }
    ],
    recentActivity: ['Leave request moved to manager approval']
  };
}

function demoAttendance() {
  return {
    records: [
      {
        id: 1,
        workDate: '2026-05-18',
        checkIn: '09:27:00',
        checkOut: '18:12:00',
        status: 'Present',
        source: 'Biometric'
      }
    ],
    corrections: []
  };
}

function demoLeave() {
  return {
    balances: [
      { id: 1, leaveType: 'Annual Leave', annualEntitlement: 18, availableBalance: 14 }
    ],
    requests: []
  };
}

function flushWorkspaceRequests(http: HttpTestingController) {
  http.expectOne('http://localhost:5265/api/peopleos/dashboard').flush(demoDashboard());
  http.expectOne('http://localhost:5265/api/peopleos/attendance').flush(demoAttendance());
  http.expectOne('http://localhost:5265/api/peopleos/leave').flush(demoLeave());
  http.expectOne('http://localhost:5265/api/peopleos/benefits').flush([]);
  http.expectOne('http://localhost:5265/api/peopleos/policies').flush([]);
  http.expectOne('http://localhost:5265/api/peopleos/expense').flush([]);
  http.expectOne('http://localhost:5265/api/peopleos/resignations').flush([]);
}
