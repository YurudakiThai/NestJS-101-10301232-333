import { BadRequestException } from '@nestjs/common';

// ค่าจากส่วนสอบถามเป็นข้อความเสมอ: ตรวจว่ามีค่า แปลงเป็นตัวเลขได้ และอยู่ในขอบเขต
function toNumber(name: string, raw?: string): number {
  if (raw === undefined || raw.trim() === '') {
    throw new BadRequestException(`${name} ต้องระบุค่า`);
  }
  const num = Number(raw);
  if (!Number.isFinite(num)) {
    throw new BadRequestException(`${name} ต้องเป็นตัวเลข`);
  }
  return num;
}

export function parsePositiveNumber(name: string, raw?: string): number {
  const num = toNumber(name, raw);
  if (num <= 0) throw new BadRequestException(`${name} ต้องเป็นตัวเลขมากกว่า 0`);
  return num;
}

export function parseNonNegativeInt(name: string, raw?: string): number {
  const num = toNumber(name, raw);
  if (!Number.isInteger(num) || num < 0) {
    throw new BadRequestException(`${name} ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป`);
  }
  return num;
}

export function parseChoice<T extends string>(name: string, raw: string | undefined, choices: readonly T[]): T {
  if (raw === undefined || !choices.includes(raw as T)) {
    throw new BadRequestException(`${name} ต้องเป็นหนึ่งใน ${choices.join(', ')}`);
  }
  return raw as T;
}

// ปัดเป็นจำนวนเต็มบาท เศษตั้งแต่ครึ่งขึ้นไปปัดขึ้น
export const roundBaht = (n: number) => Math.round(n);
