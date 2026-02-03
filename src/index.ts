import express from 'express';
import { env } from './config/env';
import { healthController } from './controllers/healthController';

const app = express();
app.use(express.json());
app.use(healthController());

app.listen(env.port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`Powerfeed API listening on ${env.port}`);
});
