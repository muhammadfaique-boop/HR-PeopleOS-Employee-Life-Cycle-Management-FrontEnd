export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface ChangePasswordRequestDto {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface ProfileUpdateRequestDto {
  preferredLanguage: string;
  profileImageUrl: string;
}

export interface FileAttachmentDto {
  fileName: string;
  dataUrl: string;
}
