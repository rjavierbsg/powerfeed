import { Router } from 'express';
import { healthService } from '../services/healthService';

export function healthController() {
  const router = Router();

  router.get('/health', async (_req, res) => {
    const status = await healthService.getStatus();
    res.json(status);
  });

  return router;
}
