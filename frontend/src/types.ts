export type Role = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
  rut: string | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ScoreResponse {
  rut: string;
  score: number;
  fecha: string;
}
