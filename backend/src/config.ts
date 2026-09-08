import type { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? 'super-secreto-solo-para-desarrollo',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as SignOptions['expiresIn'],
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};

if (config.jwtSecret === 'super-secreto-solo-para-desarrollo') {
  console.warn('[config] Usando JWT_SECRET por defecto. Define uno propio en .env para producción.');
}
