# Student Bot

Telegram bot backenddan guruhlar, o'quvchilar va dars vaqtlarini olib, dars boshlanishidan 10 daqiqa oldin o'quvchilarning shaxsiy Telegram chatiga xabar yuboradi.

## Muhim xavfsizlik

Bot token hech qachon gitga commit qilinmaydi. Token faqat `.env` yoki hosting platformasining environment variables bo'limida saqlanadi. Siz yuborgan token chatda ochiq ko'rindi, shuning uchun production uchun BotFather orqali tokenni yangilash tavsiya qilinadi.

## Ishga tushirish

1. Node.js 20+ o'rnating.
2. `.env.example` faylidan `.env` yarating va qiymatlarni to'ldiring.
3. Botni ishga tushiring:

```bash
npm start
```

Testlar:

```bash
npm test
npm run secret:scan
```

## Backend API kontrakti

Bot `GET {BACKEND_BASE_URL}/groups` endpointini chaqiradi. `BACKEND_API_KEY` berilgan bo'lsa, `Authorization: Bearer ...` headeri yuboriladi.

Qo'llab-quvvatlanadigan minimal JSON:

```json
[
  {
    "id": "group-1",
    "name": "Matematika A1",
    "startTime": "11:25",
    "students": [
      {
        "id": "student-1",
        "firstName": "Biloliddin",
        "lastName": "Zufarov",
        "telegramUserId": 123456789,
        "telegramUsername": "biloliddin"
      }
    ]
  }
]
```

`startTime` `HH:mm` ko'rinishida bo'lishi mumkin yoki ISO date-time bo'lishi mumkin. Agar backend faqat `telegramUsername` yuborsa, o'quvchi avval botga `/start` bosgan bo'lishi kerak; Telegram botlar username orqali birinchi bo'lib shaxsiy chat ocha olmaydi.

## Telegram ro'yxatdan o'tish

O'quvchi botga `/start` yuborsa, bot uning `chat_id`, `telegram user id` va `username` ma'lumotlarini lokal JSON state fayliga saqlaydi. Keyin backenddan kelgan `telegramUserId` yoki `telegramUsername` orqali chat topiladi.

## Deploy

Render/Railway/Fly kabi platformalarda quyidagi env varlar kerak:

- `BOT_TOKEN`
- `BACKEND_BASE_URL`
- `BACKEND_API_KEY` kerak bo'lsa
- `TIMEZONE=Asia/Tashkent`
- `REMINDER_MINUTES=10`
- `POLL_INTERVAL_SECONDS=30`
- `MONGODB_URI=mongodb://localhost:27017/student-bot` MongoDB ishlatilsa
- `MONGODB_DATABASE` kerak bo'lsa alohida database nomi
- `DATA_FILE=/data/bot-state.json` persistent disk ishlatilsa

`MONGODB_URI` berilsa bot ro'yxatdan o'tgan foydalanuvchilar va yuborilgan eslatmalarni MongoDBga yozadi. `MONGODB_URI` bo'lmasa eski lokal JSON fayl storage ishlatiladi.

