export interface AttendanceData {
  records: AttendanceRecord[];
  corrections: AttendanceCorrection[];
}

export interface AttendanceRecord {
  id: number;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  source: string;
}

export interface AttendanceCorrection {
  id: number;
  workDate: string;
  requestedChange: string;
  reason: string;
  status: string;
  approver: string;
}

export interface AttendanceCorrectionFormModel {
  employeeId: number;
  workDate: string;
  requestedChange: string;
  reason: string;
}
