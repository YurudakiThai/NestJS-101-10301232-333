import { Injectable } from '@nestjs/common';
import { roundBaht } from '../common/query-parsers.js';

export const ZONE_FEES = { bangkok: 0, north: 10, south: 25 } as const;
export type Zone = keyof typeof ZONE_FEES;

@Injectable()
export class ShippingService {
  calculate(weight: number, zone: Zone) {
    const extraKg = Math.max(0, Math.ceil(weight - 1)); // ส่วนที่เกิน 1 กก. ปัดขึ้น
    const baseFee = roundBaht(50 + extraKg * 18);
    const zoneFee = ZONE_FEES[zone];
    return { weight, zone, baseFee, zoneFee, total: roundBaht(baseFee + zoneFee) };
  }
}
