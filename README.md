# HR PeopleOS Frontend

Angular 20 frontend for the first PeopleOS lifecycle-management build.

## Scope

Included:

- Demo login
- Lifecycle dashboard
- Employee directory
- Attendance and corrections
- Leave balances and requests
- Benefits, mobility, and expense categories
- Expense claims including Medical OPD
- Resignation requests
- Profile language and photo updates
- Policies and downloads
- Approval visibility

Excluded by product decision:

- Payroll
- Tax
- Travel management
- Help desk tickets

## Run

Start the backend first on `http://localhost:5265`, then run:

```powershell
npm install
npm start -- --host localhost --port 4300
```

Open `http://localhost:4300`.

## Demo Accounts

- `admin@peopleos.dev` / `Admin@123`
- `hr@peopleos.dev` / `Hr@123`
- `employee@peopleos.dev` / `Employee@123`

## Build

```powershell
ng build
```

## QA

```powershell
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```
