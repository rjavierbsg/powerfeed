import { describe, expect, it } from 'vitest';
import { healthEngine } from '../src/domain/healthEngine';

describe('healthEngine', () => {
  it('returns ok status with time', () => {
    const result = healthEngine.evaluate();
    expect(result.status).toBe('ok');
    expect(typeof result.time).toBe('string');
  });
});
