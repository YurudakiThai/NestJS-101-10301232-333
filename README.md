# งานที่ 1 (CLO1) · API คำนวณค่าบริการด้วย NestJS

รายวิชา 10301232 การพัฒนาระบบฝั่งเซิร์ฟเวอร์ · ใบงานที่ 1 ตอนที่ 6

ทำครบทั้ง 3 โจทย์: ค่าจัดส่งพัสดุ (`/shipping`), ค่าปรับหนังสือ (`/fine`), ค่าไฟฟ้าขั้นบันได (`/electricity`)
ผ่านกรณีทดสอบตามใบงานครบ 18 กรณี และมีชุดทดสอบอัตโนมัติยืนยัน

## วิธีรัน

```bash
bun install          # ติดตั้งไลบรารี (ใช้ npm install แทนได้)
bun run start:dev    # เปิดเซิร์ฟเวอร์ที่ http://localhost:3000
bun run test:e2e     # รันกรณีทดสอบทั้งหมด (20 tests)
bash scripts/demo.sh # ยิงคำขอทุกกรณีแล้วแสดงรหัสสถานะ + ผลลัพธ์ (ต้องเปิดเซิร์ฟเวอร์ก่อน)
```

หรือเปิด `requests.http` ใน VS Code (ส่วนขยาย REST Client) แล้วกด Send Request ทีละคำขอ

## โครงสร้าง

```
src/
├── common/query-parsers.ts      ตรวจและแปลงค่าจากส่วนสอบถาม (ใช้ร่วมทุกโจทย์)
├── shipping/   controller + service + module   โจทย์ 1
├── fine/       controller + service + module   โจทย์ 2
├── electricity/controller + service + module   โจทย์ 3
└── app.module.ts                รวมทั้ง 3 โมดูล
test/assignment.e2e-spec.ts      กรณีทดสอบตามใบงานทุกข้อ
```

แบ่งหน้าที่ตามที่เรียนในตอนที่ 5:

- **Controller** รับค่าจาก query → ตรวจความถูกต้อง → ส่งต่อ ไม่มีการคำนวณ
- **Service** เก็บกฎทางธุรกิจ (อัตรา ค่าผ่อนผัน เพดาน ขั้นบันได) และคำนวณ
- **query-parsers** ใช้ร่วมกัน: ไม่ส่งค่า / ค่าว่าง / ไม่ใช่ตัวเลข / นอกขอบเขต / ตัวเลือกที่ไม่มีอยู่ → `400` เสมอ
  คำตอบผิดพลาดมี `statusCode` และ `message` ตามที่ใบงานกำหนด
- จำนวนเงินปัดเป็นบาทเต็มด้วย `Math.round` (เศษตั้งแต่ครึ่งขึ้นไปปัดขึ้น)

## กฎการคำนวณ

| โจทย์ | สูตร |
|---|---|
| ค่าจัดส่ง | 50 บาท สำหรับ 1 กก.แรก + 18 บาท × ⌈น้ำหนัก − 1⌉ + ค่าเขต (bangkok 0, north 10, south 25) |
| ค่าปรับ | max(0, วัน − 3) × อัตรา (general 5, reserve 20, reference 50) ไม่เกิน 500 บาท |
| ค่าไฟ | 150 หน่วยแรก × 3 + ส่วนเกิน × 4 + ค่าบริการ (residential 40, business 90) |

ตัวอย่างการคิด: `weight=2.5` → เกิน 1.5 กก. ปัดขึ้นเป็น 2 กก. → 50 + 2×18 = 86 + เขต north 10 = **96**

## ผลการทำงานจริง (จาก scripts/demo.sh)

```
GET /shipping?weight=1&zone=bangkok            200  {"weight":1,"zone":"bangkok","baseFee":50,"zoneFee":0,"total":50}
GET /shipping?weight=2.5&zone=north            200  {"weight":2.5,"zone":"north","baseFee":86,"zoneFee":10,"total":96}
GET /shipping?weight=0.5&zone=south            200  {"weight":0.5,"zone":"south","baseFee":50,"zoneFee":25,"total":75}
GET /shipping?weight=-1&zone=north             400  {"message":"weight ต้องเป็นตัวเลขมากกว่า 0","error":"Bad Request","statusCode":400}
GET /shipping?zone=north                       400  {"message":"weight ต้องระบุค่า","error":"Bad Request","statusCode":400}
GET /shipping?weight=2&zone=mars               400  {"message":"zone ต้องเป็นหนึ่งใน bangkok, north, south","error":"Bad Request","statusCode":400}
GET /fine?days=2&type=general                  200  {"days":2,"type":"general","chargeableDays":0,"rate":5,"total":0}
GET /fine?days=8&type=general                  200  {"days":8,"type":"general","chargeableDays":5,"rate":5,"total":25}
GET /fine?days=10&type=reserve                 200  {"days":10,"type":"reserve","chargeableDays":7,"rate":20,"total":140}
GET /fine?days=60&type=reference               200  {"days":60,"type":"reference","chargeableDays":57,"rate":50,"total":500}
GET /fine?days=-3&type=general                 400  {"message":"days ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป","error":"Bad Request","statusCode":400}
GET /fine?days=5&type=magazine                 400  {"message":"type ต้องเป็นหนึ่งใน general, reserve, reference","error":"Bad Request","statusCode":400}
GET /electricity?units=100&type=residential    200  {"units":100,"type":"residential","energyCharge":300,"serviceCharge":40,"total":340}
GET /electricity?units=200&type=residential    200  {"units":200,"type":"residential","energyCharge":650,"serviceCharge":40,"total":690}
GET /electricity?units=500&type=business       200  {"units":500,"type":"business","energyCharge":1850,"serviceCharge":90,"total":1940}
GET /electricity?units=0&type=residential      200  {"units":0,"type":"residential","energyCharge":0,"serviceCharge":40,"total":40}
GET /electricity?units=abc&type=residential    400  {"message":"units ต้องเป็นตัวเลข","error":"Bad Request","statusCode":400}
GET /electricity?units=100&type=factory        400  {"message":"type ต้องเป็นหนึ่งใน residential, business","error":"Bad Request","statusCode":400}
```

## ลำดับนำเสนอ (ประมาณ 5 นาที)

1. **โจทย์และข้อกำหนด** (30 วินาที) ทั้ง 3 API รับค่าจาก query คืน JSON และปฏิเสธข้อมูลผิดด้วย 400
2. **โครงสร้าง** (1 นาที) เปิด `src/` ชี้ให้เห็น Controller → Service แยกหน้าที่ และ `query-parsers.ts` ที่ใช้ร่วมกัน
3. **โค้ดหนึ่งโจทย์** (1 นาที) เปิด `fine.service.ts` อธิบายค่าผ่อนผัน 3 วันและเพดาน 500 บาท
4. **สาธิตสด** (1.5 นาที) `bun run start:dev` แล้ว `bash scripts/demo.sh` หรือกดใน `requests.http`
   ชี้กรณี `days=60` (ชนเพดาน) และ `zone=mars` (400 พร้อมบอกค่าที่ใช้ได้)
5. **พิสูจน์ด้วยการทดสอบ** (30 วินาที) `bun run test:e2e` ได้ 20 passed
6. **เชื่อมกับบทเรียน** (30 วินาที) ค่าจาก query เป็นข้อความเสมอ ต้องตรวจที่เซิร์ฟเวอร์ ไม่เชื่อค่าจากผู้ใช้ (ตอนที่ 1)

### คำถามที่อาจถูกถาม

- **ทำไม weight=-1 ได้ 400 ไม่ใช่ 422?** ใบงานกำหนดให้ข้อมูลไม่ถูกต้องใช้ 400 เท่านั้น
- **ทำไมไม่ใช้ `Number.isNaN`?** ใช้ `Number.isFinite` เพื่อกัน `Infinity` ด้วย
- **ทำไม days=2.5 ได้ 400?** โจทย์กำหนดเป็นจำนวนเต็ม
