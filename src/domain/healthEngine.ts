import { timeProvider } from '../integrations/timeProvider';

export type HealthStatus = {
  status: 'ok';
  time: string;
};

export const healthEngine = {
  evaluate(): HealthStatus {
    return { status: 'ok', time: timeProvider.nowIso() };
  }
};
