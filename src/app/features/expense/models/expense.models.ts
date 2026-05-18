export interface ExpenseClaim {
  id: number;
  claimType: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
  receiptFileName: string;
  receiptDataUrl: string;
  status: string;
  lineManager: string;
}

export interface ExpenseFormModel {
  employeeId: number;
  claimType: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
  receiptFileName: string;
  receiptDataUrl: string;
}
