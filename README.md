# Gold Era — Gold Cloud

<p align="center">
  <a href="./README.md"><img alt="English" src="https://img.shields.io/badge/English-0F172A?style=for-the-badge" /></a>
  <a href="./README.ar.md"><img alt="العربية" src="https://img.shields.io/badge/العربية-94A3B8?style=for-the-badge&labelColor=E2E8F0&color=94A3B8" /></a>
</p>

<p align="center">
  <strong>Full-stack file management and encrypted cloud storage</strong><br/>
  Next.js · Express · Prisma · MySQL · JWT · Role-based access
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

## 1. Project overview and architecture

**Gold Cloud** is a full-stack file management platform. Authenticated users upload, browse, preview, download, and delete their own files. Administrators manage every account and every file, and see system-wide storage analytics.

The repository is a two-package workspace:

| Package | Role | Default URL |
|---|---|---|
| `client/` | Next.js App Router UI + same-origin API proxies | `http://localhost:3000` |
| `server/` | Express REST API, Prisma, disk uploads, mail | `http://localhost:8080/api/v1` |

### Architecture

```
Browser
  │  cookies (httpOnly JWT)
  ▼
Next.js  (App Router pages + /api/* route handlers)
  │  Authorization: Bearer <token>
  ▼
Express  /api/v1
  │
  ├── Auth  (register, OTP, login, profile)
  ├── Users (admin only)
  ├── Files (owner or admin)
  └── Stats (user or admin)
  │
  ▼
MySQL via Prisma     Disk  (UPLOAD_DIR)
```

Design rules:

- **Clean layers on the server** — routes → middleware (auth, validate, upload) → controllers → services → repositories → Prisma.
- **Feature folders on the client** — `features/Auth`, `UploadFiles`, `Analytics`, `Admin` each own types, Zod schemas, Axios services, React Query hooks, and UI.
- **REST envelope** — `{ success, message, data, meta? }` on every JSON response.
- **JWT never reaches `document.cookie` JavaScript** — the token is stored in an httpOnly cookie. Browser code talks to `/api/*` on Next.js; the route handler reads the cookie and forwards the Bearer token to Express.
- **RBAC is enforced twice** — `requireAdmin()` / role-based pages on Next.js, and `authenticate` + `authorize(Role.ADMIN)` on Express. A regular user who hits `/dashboard/users` gets a 404; the same user hitting `/api/users` gets 403.

### Roles

| Role | Dashboard | Files they see | Analytics |
|---|---|---|---|
| `USER` | Upload zone + My Files | Own files only | Personal upload history |
| `ADMIN` | Overview, Users, Files, Analytics | Every file, with owner | System totals, types, history |

An admin cannot change their own role or delete their own account.

---

## 2. Key features

### Authentication

| Capability | Implementation |
|---|---|
| Registration | Name, email, password (min 8, one uppercase, one special). Password hashed with bcrypt (12 rounds). |
| Email OTP | 6-digit code, 15-minute expiry, sent over SMTP. |
| Resend OTP | Replaces the previous unused code. |
| Login | Verified users only. Unverified accounts receive `403`. |
| JWT | Signed with `JWT_SECRET`, default life `7d`. Claims: `sub`, `email`, `role`. |
| Session | httpOnly `gold_era_token` cookie + readable `gold_era_role` for UI chrome. |
| Protected routes | Dashboard layout calls `requireUser()`. Admin pages call `requireAdmin()`. |
| RBAC | `USER` / `ADMIN`. Live role is loaded from the database on every authenticated request, not from a stale cookie. |

### User features

- **Drag and drop upload** — `@dnd-kit/react` drop zone, click-to-pick, multiple files, per-file progress via Axios `onUploadProgress`.
- **Validation** — client Zod + server Multer. Max **25 MB**. Blocked: `.exe`, `.bat`, `.cmd`, `.sh`, `.msi`.
- **My Files** — search (debounced), type filter, sort, pagination, skeleton while fetching.
- **File details** — original name, MIME type, size, dates, stored filename, extracted text (plain text / JSON / XML / CSV / Markdown).
- **Open / download** — streamed from `GET /files/:id/download`. Images and video preview inline.
- **Personal analytics** — totals, storage donuts, hourly / daily / monthly / yearly history charts (ApexCharts).

### Admin features

- **Overview** — total users, total files, storage used, top types, last 10 uploads.
- **User management** — search, role filter, verification filter, sort, pagination, change role, delete user (cascades files).
- **File management** — every file across accounts, owner column, search, type filter, sort, pagination, delete with confirm.
- **Admin analytics** — same chart set as the user view, sourced from `/stats/admin` and `/stats/admin/history` (UTC buckets).

### Extra capabilities in this build

| Item | Status |
|---|---|
| Dark / light theme (`next-themes`) | Implemented |
| Logical folders (Documents / Photos / Projects / Designs) | Client-side grouping by MIME / extension, not a DB folder model |
| Image / video / file preview | Implemented |
| Download | Implemented |
| shadcn / Base UI dropdowns | Implemented |
| Hard delete (disk + row) | Implemented |
| Soft delete | Not implemented |
| Refresh-token rotation | Not implemented (single JWT, 7 days) |
| Docker Compose | Implemented (`docker-compose.yml`) |

---

## 3. Technologies used

### Frontend (`client/`)

| Layer | Stack |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui (Base UI / Mira) |
| Motion | Framer Motion |
| Data | TanStack React Query, Axios |
| Forms | React Hook Form, Zod |
| Charts | ApexCharts + `react-apexcharts` |
| Upload UX | `@dnd-kit/react` |
| Theme | `next-themes` |

### Backend (`server/`)

| Layer | Stack |
|---|---|
| Runtime | Node.js, Express 5, TypeScript (`tsx`) |
| ORM | Prisma 7 + MariaDB adapter |
| Auth | JWT (`jsonwebtoken`), bcryptjs |
| Uploads | Multer (disk storage) |
| Mail | Nodemailer (SMTP) |
| Validation | Zod on every body / query / param |

### Database and tooling

- **MySQL 8** (XAMPP locally, Railway in production)
- Prisma migrate + `prisma generate` on install
- ESLint + TypeScript on the client
- Postman collection at `server/postman/Gold-Era.postman_collection.json`

---

## 4. Project structure

```text
gold-era/
├── client/                          # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/              # login, register, verifyEmail
│   │   │   ├── api/                 # httpOnly cookie proxies
│   │   │   │   ├── files/
│   │   │   │   ├── stats/
│   │   │   │   └── users/
│   │   │   └── dashboard/           # user + admin pages
│   │   ├── components/              # layout, marketing, ui
│   │   ├── features/
│   │   │   ├── Admin/
│   │   │   ├── Analytics/
│   │   │   ├── Auth/
│   │   │   └── UploadFiles/
│   │   ├── lib/                     # axios, session, authToken
│   │   └── types/
│   ├── .env.example
│   └── package.json
│
├── server/                          # Express API
│   ├── config/                      # env, Prisma client
│   ├── controllers/
│   ├── middlewares/                 # auth, validate, upload, errors
│   ├── models/                      # public DTO mappers
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── validations/                 # Zod
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── utils/
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
├── docker.env.example
├── README.md                        # English
└── README.ar.md                     # Arabic
```

---

## 5. Environment variables

Copy the example files. Never commit real `.env` files.

### Frontend — `client/.env`

```env
# Public Express API. Must include /api/v1.
# Local:
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Production example:
# NEXT_PUBLIC_API_URL=https://<railway-host>/api/v1

# Optional public site origin (sitemap / Open Graph)
# NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

`NEXT_PUBLIC_*` is inlined at **build** time. After changing it on Vercel, redeploy.

### Backend — `server/.env`

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/gold_era"
PORT=8080
NODE_ENV=development

# Auth
JWT_SECRET="STRONG_SECRET_KEY"
JWT_EXPIRES_IN="7d"
OTP_EXPIRES_MINUTES=15

# Uploads
UPLOAD_DIR="uploads"
MAX_FILE_SIZE_MB=25

# Mail (Gmail: use an App Password, not the account password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your.gmail@gmail.com"
SMTP_PASS="your-app-password"
MAIL_FROM="Gold Cloud <your.gmail@gmail.com>"
```

The evaluation brief also mentioned `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GMAIL_USER`, and `GMAIL_PASS`. This codebase uses `SMTP_USER` / `SMTP_PASS` for mail. Admin accounts are normal rows in `users` (`role = ADMIN`); they are not created from env vars.

---

## 6. Database setup and migrations

### Relationships

Three MySQL tables. `Role` is an enum on `users`, not a table. There is no folder table — Documents / Photos / Projects / Designs are grouped in the UI by MIME type.

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

| Parent | Child | Cardinality | Foreign key | On delete |
|---|---|---|---|---|
| `users` | `files` | 1 → N | `files.userId` → `users.id` | Cascade (row + disk file) |
| `users` | `verification_codes` | 1 → N | `verification_codes.userId` → `users.id` | Cascade |

Deleting a user removes every OTP row and every file row that belongs to them. A file always belongs to exactly one user. A user may have zero or more files and zero or more verification codes.

1. Create an empty MySQL database, for example `gold_era`.
2. Put the connection string in `server/.env` as `DATABASE_URL`.
3. From `server/`:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

During development you can run:

```bash
npx prisma migrate dev
npx prisma studio
```

There is no committed seed script. After migrate, register through the UI or insert users manually. Mark a user as admin with:

```sql
UPDATE users SET role = 'ADMIN', isVerified = 1 WHERE email = 'admin@example.com';
```

### Default test credentials

Use these after the accounts exist and are verified (or after you set `isVerified = 1` in SQL):

| Account | Email | Password |
|---|---|---|
| Standard user | `user@example.com` | `User123` |
| Administrator | `admin@example.com` | `Admin123` |

Change these passwords before any public deployment.

---

## 7. Installation and local run

Requires **Node.js 20+** and **MySQL 8** (XAMPP on port `3306` is fine).

```bash
git clone <repository-url>
cd gold-era
```

### Backend

```bash
cd server
cp .env.example .env          # then edit DATABASE_URL and JWT_SECRET
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

API: `http://localhost:8080`  
Health: `http://localhost:8080/health`  
Versioned base: `http://localhost:8080/api/v1`

### Frontend

```bash
cd client
cp .env.example .env          # NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
npm install
npm run dev
```

App: `http://localhost:3000`

Open two terminals. Keep MySQL running. Register → verify the OTP from email (or the server console if SMTP is empty in development) → sign in.

### Docker Compose

Requires **Docker Desktop**. From the repo root:

```bash
docker compose up --build
```

| Service | Host URL |
|---|---|
| App | `http://localhost:3000` |
| API | `http://localhost:8080/api/v1` |
| Health | `http://localhost:8080/health` |
| MySQL | `localhost:3307` (user/password/db: `gold` / `gold` / `gold_era`) |

Compose starts MySQL, runs `prisma migrate deploy`, then Express and the Next.js production image. Uploads persist in the `uploads` volume.

Optional SMTP / JWT overrides: copy `docker.env.example` to a root `.env` (never commit it). The browser talks to `http://localhost:8080/api/v1`. Next.js inside the client container uses `INTERNAL_API_URL=http://server:8080/api/v1`.

Stop and remove containers:

```bash
docker compose down
```

Add `-v` only if you also want to wipe the MySQL and uploads volumes.

---

## 8. API endpoints

Base path: **`/api/v1`**. JSON body unless noted. Authenticated routes need `Authorization: Bearer <token>`.

### Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create account, send OTP |
| `POST` | `/auth/verify-email` | No | Confirm 6-digit code |
| `POST` | `/auth/login` | No | Return JWT + public user |
| `POST` | `/auth/resend-code` | No | New OTP |
| `GET` | `/auth/profile` | Yes | Current user |

### Users — `/users` (admin only)

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | List / search / filter / paginate |
| `PATCH` | `/users/:id` | Update name, role, or `isVerified` |
| `DELETE` | `/users/:id` | Delete user and cascaded files |

Query: `page`, `limit`, `search`, `role`, `isVerified`, `sortBy`, `order`.

### Files — `/files` (verified user)

| Method | Path | Description |
|---|---|---|
| `POST` | `/files/upload` | Multipart field `file` |
| `GET` | `/files` | List. Users are scoped to self. Admins see all. |
| `GET` | `/files/:id` | Metadata + `extractedContent` |
| `GET` | `/files/:id/download` | Stream. `?download=1` forces attachment |
| `DELETE` | `/files/:id` | Remove row and disk file |

List query: `page`, `limit`, `search`, `type`, `userId` (admin), `sortBy`, `order`.

### Stats — `/stats`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/stats/user` | Verified user | Personal totals and types |
| `GET` | `/stats/user/history` | Verified user | `?period=hourly\|daily\|monthly\|yearly` |
| `GET` | `/stats/admin` | Admin | System totals, types, recent uploads |
| `GET` | `/stats/admin/history` | Admin | Same period query, all accounts |

History windows: last 7 hours, last 7 days, last 12 months, last 5 years. Buckets are UTC.

### Next.js proxies

The browser never calls Express directly. Same-origin handlers:

| Browser | Upstream |
|---|---|
| `/api/files` | `GET/POST /files` / `/files/upload` |
| `/api/files/:id` | `GET/DELETE /files/:id` |
| `/api/files/:id/download` | `GET /files/:id/download` |
| `/api/stats/user` | `/stats/user` |
| `/api/stats/user/history` | `/stats/user/history` |
| `/api/stats/admin` | `/stats/admin` (admin cookie required) |
| `/api/stats/admin/history` | `/stats/admin/history` |
| `/api/users` | `/users` |
| `/api/users/:id` | `PATCH/DELETE /users/:id` |

---

## 9. Deployment

### Backend — Railway (or Render / Fly.io)

1. Create a MySQL plugin / managed database.
2. Set `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, SMTP vars, `UPLOAD_DIR`.
3. Start command generates the client, applies migrations, then serves:

```bash
npm start
# prisma generate && prisma migrate deploy && tsx index.ts
```

4. Uploads are saved on disk **and** as `files.content` (MySQL LONGBLOB). Railway’s container disk is wiped on every restart; the next download restores the file from MySQL. Files uploaded before this change have no blob and must be uploaded again.
5. Public URL must be reachable from Vercel, for example `https://<service>.up.railway.app/api/v1`.

### Frontend — Vercel

1. Root directory: `client`.
2. Environment (Production + Preview):

```env
NEXT_PUBLIC_API_URL=https://<your-api-host>/api/v1
NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>
```

3. Redeploy after any `NEXT_PUBLIC_*` change.
4. CORS on Express is open (`origin: "*"`). Tighten it to the Vercel origin for production hardening.

Typical failure: API URL missing `/api/v1`, or the variable set in Vercel without a new deploy.

---

## 10. Assumptions and developer notes

- Built as a two-folder monorepo (`client` + `server`), not a single Next.js API.
- Evaluation window assumed **8–10 hours** of focused delivery: auth, uploads, listing, RBAC, and analytics first; polish (skeletons, shadcn menus, UTC chart buckets) second.
- Criteria covered: registration + OTP, JWT sessions, user file CRUD with search / filter / sort / pagination, extracted text for text-like MIME types, admin user + file management, admin and user dashboards, double-sided access control.
- Password rules reject weak values (`User123` alone is invalid — the test user password includes a long underscore tail so it satisfies “special character”).
- File delete is **hard** (row + disk + stored bytes). There is no recycle bin and no refresh-token family.
- Content extraction is UTF-8 text only. PDF / Office binaries do not get `extractedContent` unless a parser is added later.
- Charts fill empty UTC buckets so hourly / daily axes stay a fixed length (7 points).
- Local Next.js talking to a remote Railway API is supported; keep `NEXT_PUBLIC_API_URL` pointed at the API you actually run.

---

<p align="center">
  Gold Cloud · Gold Era
</p>
