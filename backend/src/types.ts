export type Role = 'admin' | 'user';

export interface MockUser {
  id: string;
  username: string;
  password: string;
  role: Role;
  rut?: string;
}


export interface JwtPayload {
  sub: string;
  role: Role;
  rut?: string;
}
