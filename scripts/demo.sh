#!/usr/bin/env bash
# สาธิตทุกกรณีทดสอบ: รันเซิร์ฟเวอร์ก่อน (bun run start:dev) แล้วรัน bash scripts/demo.sh
HOST=${HOST:-http://localhost:3000}
cases=(
  "/shipping?weight=1&zone=bangkok" "/shipping?weight=2.5&zone=north" "/shipping?weight=0.5&zone=south"
  "/shipping?weight=-1&zone=north" "/shipping?zone=north" "/shipping?weight=2&zone=mars"
  "/fine?days=2&type=general" "/fine?days=8&type=general" "/fine?days=10&type=reserve"
  "/fine?days=60&type=reference" "/fine?days=-3&type=general" "/fine?days=5&type=magazine"
  "/electricity?units=100&type=residential" "/electricity?units=200&type=residential"
  "/electricity?units=500&type=business" "/electricity?units=0&type=residential"
  "/electricity?units=abc&type=residential" "/electricity?units=100&type=factory"
)
for c in "${cases[@]}"; do
  code=$(curl -s -o /tmp/demo_body -w "%{http_code}" "$HOST$c")
  printf "GET %-42s %s  %s\n" "$c" "$code" "$(cat /tmp/demo_body)"
done
