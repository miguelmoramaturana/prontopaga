import type { NextFunction, Request, Response } from 'express';
import { sameRut } from '../utils/rut';
import { ApiError } from './errorHandler';

/**
 * Autorización para GET /score/:rut
 *  - admin: puede consultar cualquier RUT.
 *  - user:  sólo puede consultar el RUT que viaja en su token.
 *
 * Requiere que `authenticate` se haya ejecutado antes.
 */
export function authorizeRutAccess(req: Request, _res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user) throw new ApiError(401, 'No autenticado.');

  if (user.role === 'admin') {
    next();
    return;
  }

  if (user.role === 'user') {
    if (!user.rut) {
      throw new ApiError(403, 'El token de usuario no tiene un RUT asociado.');
    }
    if (!sameRut(user.rut, req.params.rut ?? '')) {
      throw new ApiError(403, 'Un usuario sólo puede consultar su propio RUT.');
    }
    next();
    return;
  }

  throw new ApiError(403, 'Rol no autorizado.');
}
