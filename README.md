# Recruitment Portal

Full-stack recruitment portal with student registration, OTP verification, application submission, resume parsing, interactive applicant evaluation, and admin management dashboard.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Email:** Nodemailer (SMTP)
- **File storage:** GridFS / Local upload streaming

## Quick Start (Local Development)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

Copy the example env files and fill in your credentials:

```bash
cp backend/.env.example backend/.env
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
SMTP_FROM="Recruitment Portal" <your-email@gmail.com>
```

**MongoDB Atlas example:**

```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/recruitment_portal?retryWrites=true&w=majority
```

### 3. Run the app

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

## Demo Admin Access

To test the admin dashboard without manual setup, use the pre-configured Demo Admin credentials:

- **Admin Email:** `admin@recruitmentportal.com`
- **Admin Password:** `adminpassword123`

*(You can also use the single-click "Auto-fill Admin" button directly on the Login page)*

## Production Deployment (Render & Vercel)

### Option A: Render Web Service (Full-stack)

Deploy as a single Express Web Service on Render:
1. Connect repository to Render.
2. Build Command: `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
3. Start Command: `npm start`
4. Set Environment Variables: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

### Option B: Vercel (Frontend) + Render/Serverless (Backend)

1. Deploy `frontend/` to Vercel (Root Directory: `frontend`).
2. Set `VITE_API_URL` to point to your deployed backend URL.

## API Health Check

```http
GET /api/health
```
