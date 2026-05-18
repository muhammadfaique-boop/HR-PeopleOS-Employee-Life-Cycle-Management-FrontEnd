export interface ResignationRequest {
  id: number;
  resignationDate: string;
  lastWorkingDate: string;
  reason: string;
  status: string;
  lineManager: string;
}

export interface ResignationFormModel {
  employeeId: number;
  lastWorkingDate: string;
  reason: string;
}
