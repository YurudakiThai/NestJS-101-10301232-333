import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

// กรณีทดสอบตามใบงานที่ 1 ตอนที่ 6 ทุกข้อ
const ok = [
  ['/shipping?weight=1&zone=bangkok', 50],
  ['/shipping?weight=2.5&zone=north', 96],
  ['/shipping?weight=0.5&zone=south', 75],
  ['/fine?days=2&type=general', 0],
  ['/fine?days=8&type=general', 25],
  ['/fine?days=10&type=reserve', 140],
  ['/fine?days=60&type=reference', 500],
  ['/electricity?units=100&type=residential', 340],
  ['/electricity?units=200&type=residential', 690],
  ['/electricity?units=500&type=business', 1940],
  ['/electricity?units=0&type=residential', 40],
] as const;
const bad = [
  '/shipping?weight=-1&zone=north', '/shipping?zone=north', '/shipping?weight=2&zone=mars',
  '/fine?days=-3&type=general', '/fine?days=5&type=magazine',
  '/electricity?units=abc&type=residential', '/electricity?units=100&type=factory',
];

describe('ใบงานที่ 1 งานที่ 1', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    await app.init();
  });
  afterAll(() => app.close());

  it.each(ok)('%s → total %i', async (url, total) => {
    const res = await request(app.getHttpServer()).get(url).expect(200);
    expect(res.body.total).toBe(total);
  });

  it.each(bad)('%s → 400', async (url) => {
    const res = await request(app.getHttpServer()).get(url).expect(400);
    expect(res.body.statusCode).toBe(400);
    expect(typeof res.body.message).toBe('string');
  });

  it('ตัวอย่างผลลัพธ์เต็มตรงตามใบงาน', async () => {
    const s = await request(app.getHttpServer()).get('/shipping?weight=2.5&zone=north');
    expect(s.body).toEqual({ weight: 2.5, zone: 'north', baseFee: 86, zoneFee: 10, total: 96 });
    const f = await request(app.getHttpServer()).get('/fine?days=8&type=general');
    expect(f.body).toEqual({ days: 8, type: 'general', chargeableDays: 5, rate: 5, total: 25 });
    const e = await request(app.getHttpServer()).get('/electricity?units=200&type=residential');
    expect(e.body).toEqual({ units: 200, type: 'residential', energyCharge: 650, serviceCharge: 40, total: 690 });
  });
});
