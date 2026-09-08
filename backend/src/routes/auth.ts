import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';
import { findUserByCredentials } from '../data/users';
import { ApiError } from '../middleware/errorHandler';
import type { JwtPayload } from '../types';

export const authRouter = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'El campo "username" es requerido.'),
  password: z.string().min(1, 'El campo "password" es requerido.'),
});

/**
 * POST /login
 * Autenticación mock. Devuelve un JWT firmado con { sub, role, rut? }.
 */
authRouter.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Payload inválido.');
  }

  const { username, password } = parsed.data;
  const user = findUserByCredentials(username, password);
  if (!user) {
    throw new ApiError(401, 'Credenciales inválidas.');
  }

  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
    ...(user.role === 'user' && user.rut ? { rut: user.rut } : {}),
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      rut: payload.rut ?? null,
    },
  });
});
