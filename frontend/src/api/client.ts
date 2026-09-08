import type { LoginResponse, ScoreResponse } from '../types';
import { ApiError } from './errors';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function parseError(res: Response): Promise<never> {
  let message = `Error ${res.status}`;
  try {
    const body = await res.json();
    if (body?.error) message = body.error;
  } catch {
    /* respuesta sin cuerpo JSON */
  }
  throw new ApiError(res.status, message);
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return parseError(res);
  return res.json();
}

export async function getScore(rut: string, token: string): Promise<ScoreResponse> {
  const res = await fetch(`${BASE_URL}/score/${encodeURIComponent(rut)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return parseError(res);
  return res.json();
}
