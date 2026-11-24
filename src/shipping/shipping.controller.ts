import { Controller, Get, Query } from '@nestjs/common';
import { ShippingService, ZONE_FEES, Zone } from './shipping.service.js';
import { parseChoice, parsePositiveNumber } from '../common/query-parsers.js';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  calculate(@Query('weight') weight?: string, @Query('zone') zone?: string) {
    const w = parsePositiveNumber('weight', weight);
    const z = parseChoice('zone', zone, Object.keys(ZONE_FEES) as Zone[]);
    return this.shippingService.calculate(w, z);
  }
}
