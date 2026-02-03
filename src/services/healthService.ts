import { healthEngine } from '../domain/healthEngine';
import { healthRepo } from '../data/healthRepo';

export const healthService = {
  async getStatus() {
    const dbOk = await healthRepo.ping();
    const status = healthEngine.evaluate();
    return { ...status, dbOk };
  }
};
