import type { MockUser } from '../types';

/**
 * Credenciales mock. No hay base de datos: la autenticación se resuelve
 * comparando contra esta lista en memoria.
 */
export const MOCK_USERS: readonly MockUser[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: '2', username: 'user', password: 'user123', role: 'user', rut: '12.345.678-9' },
  { id: '3', username: 'ana', password: 'ana123', role: 'user', rut: '9.876.543-3' },
];

export function findUserByCredentials(username: string, password: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.username === username && u.password === password);
}
