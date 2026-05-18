export interface LeaveData {
  balances: LeaveBalance[];
  requests: LeaveRequest[];
}

export interface LeaveBalance {
  id: number;
  leaveType: string;
  annualEntitlement: number;
  availableBalance: number;
}

export interface LeaveRequest {
  id: number;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  contactDuringLeave: string;
  attachmentFileName: string;
  attachmentDataUrl: string;
  status: string;
}

export interface LeaveFormModel {
  employeeId: number;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  contactDuringLeave: string;
  attachmentFileName: string;
  attachmentDataUrl: string;
}
