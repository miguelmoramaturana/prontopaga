import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { JwtPayload, Role } from '../types';
import { ApiError } from './errorHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Valida el header `Authorization: Bearer <token>`: comprueba la firma y la
 * expiración del JWT y adjunta el payload a `req.user`.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Falta el token. Envía el header "Authorization: Bearer <token>".');
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    req.user = {
      sub: String(decoded.sub),
      role: decoded.role as Role,
      rut: typeof decoded.rut === 'string' ? decoded.rut : undefined,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'El token ha expirado. Inicia sesión nuevamente.');
    }
    throw new ApiError(401, 'Token inválido.');
  }
}
