export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  manager: string;
  lifecycleStatus: string;
  joiningDate: string;
  profileCompletion: number;
  workLocation: string;
  preferredLanguage: string;
  profileImageUrl: string;
}

export interface LifecycleStage {
  id: number;
  employeeId: number;
  stage: string;
  owner: string;
  status: string;
  dueDate: string;
  summary: string;
}
