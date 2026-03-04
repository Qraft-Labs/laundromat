export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DESKTOP_AGENT = 'DESKTOP_AGENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: number;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateDTO {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role?: UserRole;
}

export interface UserUpdateDTO {
  email?: string;
  full_name?: string;
  phone?: string;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}
