import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRutAccess } from '../middleware/authorize';
import { ApiError } from '../middleware/errorHandler';
import { formatRut, isValidRutFormat } from '../utils/rut';
import { computeScore } from '../utils/score';

export const scoreRouter = Router();

/**
 * GET /score/:rut
 * Devuelve el score financiero determinista de un RUT.
 * Protegido por autenticación (JWT) + autorización por rol/propiedad del RUT.
 */
scoreRouter.get('/score/:rut', authenticate, authorizeRutAccess, (req, res) => {
  const rut = req.params.rut ?? '';

  if (!isValidRutFormat(rut)) {
    throw new ApiError(400, 'Formato de RUT inválido. Ejemplo válido: 12.345.678-9');
  }

  res.json({
    rut: formatRut(rut),
    score: computeScore(rut),
    fecha: new Date().toISOString(),
  });
});
