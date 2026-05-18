export interface Employee {
  id: number;
  employeeCode: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  phone?: string;
  contactNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
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
