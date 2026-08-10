export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  roles: UserRole[];
}

export type UserRole =
  | 'admin'
  | 'manager'
  | 'user';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
}