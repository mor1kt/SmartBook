import type { CenterId } from '../types/tenant.js';

declare global {
  namespace Express {
    interface Request {
      centerId?: CenterId;
    }
  }
}

export {};

