import { createApp } from './app';
import { config } from './config';

createApp().listen(config.port, () => {
  console.log(`API de Riesgo Financiero escuchando en http://localhost:${config.port}`);
});
