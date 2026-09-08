import type { NextFunction, Request, Response } from 'express';

/** Error con código HTTP explícito. El resto se trata como 500. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Recurso no encontrado.' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express detecta 4 args
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error('[error] no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}
