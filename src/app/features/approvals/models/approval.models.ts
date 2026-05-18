export interface ApprovalTask {
  id: number;
  type: string;
  subject: string;
  requester: string;
  approverRole: string;
  status: string;
  dueDate: string;
}
