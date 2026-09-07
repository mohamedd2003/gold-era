# Gold Era — Gold Cloud

<p align="center" dir="rtl">
  <a href="./README.md"><img alt="English" src="https://img.shields.io/badge/English-94A3B8?style=for-the-badge&labelColor=E2E8F0&color=94A3B8" /></a>
  <a href="./README.ar.md"><img alt="العربية" src="https://img.shields.io/badge/العربية-0F172A?style=for-the-badge" /></a>
</p>

<p align="center" dir="rtl">
  <strong>منصة متكاملة لإدارة الملفات والتخزين السحابي</strong><br/>
  Next.js · Express · Prisma · MySQL · JWT · صلاحيات حسب الدور
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=flat-square" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-lightgrey?style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/License-Private-informational?style=flat-square" />
</p>

---

<div dir="rtl">

## 1. نظرة عامة والهندسة

**Gold Cloud** منصة كاملة لإدارة الملفات. المستخدم المصدّق يرفع ويتصفح ويعاين ويحمّل ويحذف ملفاته. الأدمن يدير كل الحسابات وكل الملفات، ويرى إحصائيات التخزين على مستوى النظام.

المستودع مكوّن من حزمتين:

| الحزمة | الدور | العنوان الافتراضي |
|---|---|---|
| `client/` | واجهة Next.js + بروكسي `/api/*` | `http://localhost:3000` |
| `server/` | Express + Prisma + الرفع على القرص + البريد | `http://localhost:8080/api/v1` |

### الهندسة

```
المتصفح
  │  كوكي httpOnly فيها JWT
  ▼
Next.js  (الصفحات + Route Handlers)
  │  Authorization: Bearer
  ▼
Express  /api/v1
  ├── Auth · Users · Files · Stats
  ▼
MySQL عبر Prisma     مجلد الرفع على القرص
```

قواعد التصميم:

- السيرفر بطبقات نظيفة: routes → middleware → controllers → services → repositories → Prisma.
- الكلاينت بمجلدات فيتشر: أنواع، Zod، Axios، React Query، واجهة.
- شكل الرد الثابت: `{ success, message, data, meta? }`.
- التوكن لا يُقرأ من JavaScript. المتصفح ينادي `/api/*` على Next، والـ handler يقرأ الكوكي ويمرّر Bearer إلى Express.
- صلاحيات الأدمن تتطبق مرتين: صفحات Next بـ `requireAdmin()`، ومسارات Express بـ `authorize(Role.ADMIN)`. المستخدم العادي على `/dashboard/users` يأخذ 404، وعلى `/api/users` يأخذ 403.

### الأدوار

| الدور | الداشبورد | الملفات | التحليلات |
|---|---|---|---|
| `USER` | منطقة الرفع + ملفاتي | ملفاته فقط | تاريخ رفعه |
| `ADMIN` | نظرة عامة، مستخدمون، ملفات، تحليلات | كل الملفات مع المالك | إحصائيات النظام |

الأدمن لا يغيّر رول نفسه ولا يحذف حسابه.

---

## 2. أهم المزايا

### المصادقة

تسجيل بحساب جديد، تشفير كلمة المرور بـ bcrypt، رمز OTP من 6 أرقام صالح 15 دقيقة، إعادة إرسال الرمز، تسجيل دخول للمستخدم المفعّل فقط، JWT في كوكي httpOnly، حماية صفحات الداشبورد، وRBAC بين `USER` و`ADMIN`. الرول الفعلي يُقرأ من قاعدة البيانات في كل طلب مصادق، مش من كوكي قديمة.

### مزايا المستخدم

- رفع بسحب وإفلات مع شريط تقدم، وملفات متعددة، والتحقق بـ Zod وMulter (حد 25 ميجا، وامتدادات تنفيذ ممنوعة).
- ملفاتي: بحث مؤجّل، فلتر نوع، ترتيب، صفحات، هيكل تحميل أثناء الجلب.
- تفاصيل الملف والنص المستخرج من الملفات النصية.
- فتح / تحميل / معاينة الصور والفيديو.
- تحليلات شخصية: أعداد، تخزين، تاريخ Hourly / Daily / Monthly / Yearly.

### مزايا الأدمن

- نظرة عامة: عدد المستخدمين والملفات، المساحة، أشهر الأنواع، آخر 10 رفعات.
- إدارة المستخدمين: بحث، فلتر، ترتيب، صفحات، تغيير الرول، حذف (يحذف الملفات معه).
- إدارة الملفات: كل الملفات مع عمود المالك، بحث وفلتر وحذف.
- تحليلات النظام من `/stats/admin` و`/stats/admin/history`.

### إضافات في هذا البناء

الوضع الداكن مفعّل. المجلدات منطقية حسب النوع وليست جداول في قاعدة البيانات. المعاينة والتحميل والحذف النهائي موجودون. **الحذف الناعم وتدوير Refresh Token غير مضافين.** Docker Compose موجود في جذر المستودع.

---

## 3. التقنيات

- **الواجهة:** Next.js 16، React 19، TypeScript، Tailwind 4، shadcn/ui، Framer Motion، TanStack Query، Axios، Zod، ApexCharts، dnd-kit.
- **الخادم:** Express 5، TypeScript، Prisma 7، JWT، bcrypt، Multer، Nodemailer، Zod.
- **قاعدة البيانات:** MySQL 8.

---

## 4. هيكل المشروع

```text
gold-era/
├── client/                          # تطبيق Next.js
├── server/                          # واجهة Express
├── docker-compose.yml
├── docker.env.example
├── README.md                        # English
└── README.ar.md                     # العربية
```

الواجهة في `client/src/app` و`client/src/features`. السيرفر بطبقات `routes` / `controllers` / `services` / `repositories` / `prisma`.

---

## 5. متغيرات البيئة

انسخ ملفات المثال ولا ترفع `.env` الحقيقي.

**الواجهة — `client/.env`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

المتغيرات `NEXT_PUBLIC_*` تُثبَّت وقت البناء. بعد تعديلها على Vercel لازم إعادة نشر.

**الخادم — `server/.env`**

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/gold_era"
PORT=8080
JWT_SECRET="STRONG_SECRET_KEY"
JWT_EXPIRES_IN="7d"
OTP_EXPIRES_MINUTES=15
UPLOAD_DIR="uploads"
MAX_FILE_SIZE_MB=25
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your.gmail@gmail.com"
SMTP_PASS="your-app-password"
MAIL_FROM="Gold Cloud <your.gmail@gmail.com>"
```

البريد هنا باسم `SMTP_USER` / `SMTP_PASS` وليس `GMAIL_USER`. حساب الأدمن صف عادي في جدول `users`.

---

## 6. قاعدة البيانات والهجرات

### العلاقات

ثلاث جداول في MySQL. `Role` enum على `users` وليس جدولاً. لا يوجد جدول مجلدات؛ Documents / Photos / Projects / Designs تجميع في الواجهة حسب نوع الملف.

<div dir="ltr">

```mermaid
erDiagram
    users ||--o{ files : owns
    users ||--o{ verification_codes : has

    users {
        int id PK
        varchar name
        varchar email UK
        varchar password
        enum role "USER | ADMIN"
        boolean isVerified
        datetime createdAt
        datetime updatedAt
    }

    files {
        int id PK
        varchar originalName
        varchar filename
        varchar path
        int size
        varchar mimetype
        text extractedContent
        int userId FK
        datetime createdAt
        datetime updatedAt
    }

    verification_codes {
        int id PK
        varchar code
        int userId FK
        datetime expiresAt
        datetime createdAt
    }
```

</div>

| الأب | الابن | العلاقة | المفتاح الأجنبي | عند الحذف |
|---|---|---|---|---|
| `users` | `files` | 1 → N | `files.userId` → `users.id` | Cascade (الصف + الملف على القرص) |
| `users` | `verification_codes` | 1 → N | `verification_codes.userId` → `users.id` | Cascade |

حذف المستخدم يمسح كل رموز OTP وكل ملفاته. كل ملف يتبع مستخدم واحد. المستخدم ممكن يكون من غير ملفات أو رموز.

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
```

للتطوير: `npx prisma migrate dev`. لا يوجد سكربت seed في المستودع. بعد إنشاء الحساب يمكن تحويله لأدمن:

```sql
UPDATE users SET role = 'ADMIN', isVerified = 1 WHERE email = 'admin@example.com';
```

### حسابات التجربة

| الحساب | البريد | كلمة المرور |
|---|---|---|
| مستخدم | `user@example.com` | `User123` |
| أدمن | `admin@example.com` | `Admin123` |



---

## 7. التثبيت والتشغيل المحلي

مطلوب Node.js 20+ وMySQL 8.

```bash
# الخادم
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev

# الواجهة (ترمينال ثاني)
cd client
cp .env.example .env
npm install
npm run dev
```

- الواجهة: `http://localhost:3000`
- الـ API: `http://localhost:8080/api/v1`
- الصحة: `http://localhost:8080/health`

### Docker Compose

من جذر المستودع، مع Docker Desktop:

```bash
docker compose up --build
```

| الخدمة | العنوان |
|---|---|
| الواجهة | `http://localhost:3000` |
| الـ API | `http://localhost:8080/api/v1` |
| الصحة | `http://localhost:8080/health` |
| MySQL | `localhost:3307` (`gold` / `gold` / `gold_era`) |

الإيقاف: `docker compose down`. أضف `-v` فقط إذا أردت مسح بيانات MySQL والملفات المرفوعة.

---

## 8. مرجع الـ API

الأساس: **`/api/v1`**. المسارات المحمية تحتاج `Authorization: Bearer <token>`.

| المجموعة | أمثلة |
|---|---|
| `/auth/*` | `POST /register` · `POST /verify-email` · `POST /login` · `POST /resend-code` · `GET /profile` |
| `/users/*` | `GET /` · `PATCH /:id` · `DELETE /:id` — أدمن فقط |
| `/files/*` | `POST /upload` · `GET /` · `GET /:id` · `GET /:id/download` · `DELETE /:id` |
| `/stats/*` | `GET /user` · `GET /user/history` · `GET /admin` · `GET /admin/history` |

المتصفح ينادي `/api/...` على Next.js، والبروكسي يمرّر الطلب إلى Express بعد قراءة الكوكي.

نوافذ التاريخ: آخر 7 ساعات، 7 أيام، 12 شهرًا، 5 سنوات. التجميع UTC.

---

## 9. النشر

**الخادم (Railway / Render / Fly.io):** اربط MySQL، ضع `DATABASE_URL` و`JWT_SECRET` ومتغيرات SMTP، ثم `npm start` (`prisma generate && prisma migrate deploy && tsx index.ts`). الملفات تتخزن على القرص وفي عمود `files.content`. ديسك Railway بيتمسح مع كل restart؛ التحميل التالي بيرجع الملف من MySQL. الملفات المرفوعة قبل التحديث لازم تترفع من جديد.

**الواجهة (Vercel):** جذر المشروع `client`، والمتغير `NEXT_PUBLIC_API_URL=https://<host>/api/v1` ثم إعادة نشر. أشهر خطأ: نسيان `/api/v1` أو تعديل المتغير من غير redeploy.

---

## 10. ملاحظات للمقيّم والمطوّر

- المشروع مجلدان (`client` + `server`) وليس API داخل Next فقط.
- نطاق التسليم المتوقع **8–10 ساعات**: مصادقة، رفع، قائمة، صلاحيات، تحليلات، ثم تحسينات الواجهة.
- الحذف نهائي (صف + ملف على القرص). لا توجد سلة محذوفات ولا Refresh Token.
- استخراج النص للأنواع النصية فقط، وليس PDF الثنائي.
- الشارتس تملأ الخانات الفارغة بتوقيت UTC حتى يبقى محور Hourly / Daily بطول ثابت (7 قيم).
- كلمة المرور الضعيفة مرفوضة؛ كلمة مستخدم التجربة فيها شرطات سفلية حتى تحقق شرط الرمز الخاص.

</div>

---

<p align="center">
  Gold Cloud · Gold Era
</p>
