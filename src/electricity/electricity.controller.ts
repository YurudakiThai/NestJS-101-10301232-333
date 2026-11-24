import { Controller, Get, Query } from '@nestjs/common';
import { ElectricityService, SERVICE_CHARGES, CustomerType } from './electricity.service.js';
import { parseChoice, parseNonNegativeInt } from '../common/query-parsers.js';

@Controller('electricity')
export class ElectricityController {
  constructor(private readonly electricityService: ElectricityService) {}

  @Get()
  calculate(@Query('units') units?: string, @Query('type') type?: string) {
    const u = parseNonNegativeInt('units', units);
    const t = parseChoice('type', type, Object.keys(SERVICE_CHARGES) as CustomerType[]);
    return this.electricityService.calculate(u, t);
  }
}
