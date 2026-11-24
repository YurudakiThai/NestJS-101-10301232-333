import { Controller, Get, Query } from '@nestjs/common';
import { FineService, FINE_RATES, BookType } from './fine.service.js';
import { parseChoice, parseNonNegativeInt } from '../common/query-parsers.js';

@Controller('fine')
export class FineController {
  constructor(private readonly fineService: FineService) {}

  @Get()
  calculate(@Query('days') days?: string, @Query('type') type?: string) {
    const d = parseNonNegativeInt('days', days);
    const t = parseChoice('type', type, Object.keys(FINE_RATES) as BookType[]);
    return this.fineService.calculate(d, t);
  }
}
