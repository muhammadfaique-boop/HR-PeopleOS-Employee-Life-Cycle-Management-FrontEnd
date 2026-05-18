export interface ChangePasswordRequestDto {
  email: string;
  currentPassword: string;
  newPassword: string;
}
