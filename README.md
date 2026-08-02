# SRKR Coding Club — Recruitment Portal

Full-stack recruitment portal with student registration, OTP verification, application submission, and admin dashboard.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Email:** Nodemailer (SMTP)
- **File storage:** Cloudinary (optional) or local uploads

## Quick Start (Local Development)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

Copy the example env files and fill in your credentials:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Required in `backend/.env`:**

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random secret for JWT tokens |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | SMTP credentials for sending emails |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin login credentials (seeded on first run) |

**Gmail SMTP example:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM="SRKR Coding Club" <your-email@gmail.com>
```

> Enable 2FA on Gmail and create an [App Password](https://myaccount.google.com/apppasswords).

**MongoDB Atlas example:**

```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/srkr_coding_club?retryWrites=true&w=majority
```

### 3. Start MongoDB

Use local MongoDB or MongoDB Atlas. For Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

### 4. Run the app

Terminal 1 — backend:

```bash
npm run dev:backend
```

Terminal 2 — frontend:

```bash
npm run dev:frontend
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Production Deployment

### Option A: Docker Compose (recommended)

1. Fill in `backend/.env` with production values
2. Set `NODE_ENV=production` and a strong `JWT_SECRET`
3. Run:

```bash
docker compose up --build -d
```

The app serves on port **5000** (frontend + API from one container).

### Option B: Manual deploy (Render, Railway, VPS)

1. Build frontend:

```bash
cd frontend
VITE_API_URL= npm run build
```

2. Set environment variables on your host (see `backend/.env.example`)

3. Start backend (serves built frontend in production):

```bash
cd backend
NODE_ENV=production npm start
```

### Option C: Separate frontend/backend

- Deploy backend with `NODE_ENV=production`
- Deploy frontend to Vercel/Netlify with `VITE_API_URL=https://your-api-domain.com`

## Admin Access


## API Health Check

```
GET /api/health
```

