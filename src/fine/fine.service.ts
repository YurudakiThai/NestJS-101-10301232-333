import { Injectable } from '@nestjs/common';
import { roundBaht } from '../common/query-parsers.js';

export const FINE_RATES = { general: 5, reserve: 20, reference: 50 } as const;
export type BookType = keyof typeof FINE_RATES;
export const GRACE_DAYS = 3;
export const MAX_FINE = 500;

@Injectable()
export class FineService {
  calculate(days: number, type: BookType) {
    const chargeableDays = Math.max(0, days - GRACE_DAYS);
    const rate = FINE_RATES[type];
    const total = roundBaht(Math.min(chargeableDays * rate, MAX_FINE));
    return { days, type, chargeableDays, rate, total };
  }
}
