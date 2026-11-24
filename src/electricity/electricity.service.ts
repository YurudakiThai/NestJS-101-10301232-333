import { Injectable } from '@nestjs/common';
import { roundBaht } from '../common/query-parsers.js';

export const SERVICE_CHARGES = { residential: 40, business: 90 } as const;
export type CustomerType = keyof typeof SERVICE_CHARGES;
const TIER1_UNITS = 150, TIER1_RATE = 3, TIER2_RATE = 4;

@Injectable()
export class ElectricityService {
  calculate(units: number, type: CustomerType) {
    const tier1 = Math.min(units, TIER1_UNITS);
    const tier2 = Math.max(0, units - TIER1_UNITS);
    const energyCharge = roundBaht(tier1 * TIER1_RATE + tier2 * TIER2_RATE);
    const serviceCharge = SERVICE_CHARGES[type];
    return { units, type, energyCharge, serviceCharge, total: roundBaht(energyCharge + serviceCharge) };
  }
}
