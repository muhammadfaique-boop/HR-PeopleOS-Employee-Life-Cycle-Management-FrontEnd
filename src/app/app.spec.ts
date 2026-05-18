import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
});

function demoSession() {
  return {
    token: 'demo-token-3',
    email: 'employee@peopleos.dev',
    role: 'Employee',
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
