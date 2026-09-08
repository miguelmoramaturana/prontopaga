import cors from 'cors';
import express from 'express';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { scoreRouter } from './routes/score';

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use(authRouter);
  app.use(scoreRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
