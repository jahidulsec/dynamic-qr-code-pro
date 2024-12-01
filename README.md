# QR App

## Technologies

Frontend: ReactJs, NextJs, TypeScript
Backend: Prisma ORM, MySql

## Run this project

Create `.env` file with following variables

```
DATABASE_URL="YOUR_DB_URL"
SESSION_SECRET=GENERATE_CODE_AND_ADD
```

To generate `SESSION_SECRET` key,

```bash
openssl rand -base64 32
```

```bash
npm install
npx prisma generate
```

To run on dev server,

```bash
npm run dev
```
