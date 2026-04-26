# CleanCity 🌱 — Smart Waste Management System

A full-stack MERN platform where citizens report waste issues, Nagar Palika staff manages and assigns them, and Admins oversee the entire system.

---

## 📦 Tech Stack

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ | ------------ |
| Frontend  | React 18 + Vite, Redux Toolkit, React Router v6  |
| Backend   | Node.js + Express.js                             |
| Database  | MongoDB + Mongoose (GeoJSON geospatial)          |
| Auth      | JWT (access + refresh tokens), bcryptjs          |
| Maps      | Leaflet.js + OpenStreetMap (free, no key needed) |
| Images    | Cloudinary (free tier)                           |
| Real-time | Socket.io                                        | 1keysocket// |
| Email     | Nodemailer (Gmail SMTP)                          |
| Charts    | Recharts                                         |
| Export    | xlsx (Excel + CSV)                               |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free at cloudinary.com)

### 1. Clone & Install

```bash
# Backend
cd cleancity/backend
cp .env.example .env   # fill in your values
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend `.env`

Edit `backend/.env`:

```
MONGODB_URI=mongodb://localhost:27017/cleancity
JWT_SECRET=your_strong_secret_here
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

> **Gmail App Password**: Google Account → Security → 2-Step Verification → App passwords

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cleancity.com | Admin@123 |
| NP Staff | np@cleancity.com | Staff@123 |
| Worker | worker1@cleancity.com | Worker@123 |
| Citizen | citizen@cleancity.com | Citizen@123 |

Plus 8 categories and 20 sample reports across Mumbai.

### 4. Start Development Servers

```bash
# Terminal 1 — Backend API (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## 🔑 User Roles & Features

### 👥 Citizens

- Register/login or submit **anonymously**
- Multi-step complaint form: Photo → GPS → Category → Review
- Auto GPS detection with reverse geocoding (OpenStreetMap Nominatim)
- Image compression before upload (browser-side)
- Get unique **Tracking ID** instantly
- Track complaint status via public URL
- View complaint history (logged-in)
- Upvote nearby complaints

### 🏛️ Nagar Palika Staff

- Login dashboard with analytics overview
- **Map View** — all complaints as color-coded markers
- **List View** — filterable, sortable table
- Assign complaints to sanitation workers
- Set priority (Low / Medium / High / Urgent)
- Add internal notes
- Update status with optional after-photo

### ⚡ Admin

- System-wide analytics dashboard
- User management (CRUD for all roles)
- Category management (emoji icons + colors)
- Audit log viewer
- Export reports as Excel or CSV

### 👷 Sanitation Workers

- View assigned tasks
- Update status from assigned → in progress → completed
- Upload after-completion photos

---

## 🛠️ API Reference

| Method | Endpoint                            | Auth            | Description                   |
| ------ | ----------------------------------- | --------------- | ----------------------------- |
| POST   | `/api/auth/register`                | —               | Citizen self-registration     |
| POST   | `/api/auth/login`                   | —               | Login (all roles)             |
| POST   | `/api/auth/refresh`                 | —               | Refresh access token          |
| GET    | `/api/auth/me`                      | ✅              | Get current user              |
| POST   | `/api/reports`                      | Optional        | Submit complaint (with photo) |
| GET    | `/api/reports/track/:id`            | —               | Public complaint tracking     |
| GET    | `/api/reports/nearby`               | —               | Geospatial nearby query       |
| GET    | `/api/reports`                      | NP/Admin        | All reports (filtered)        |
| PATCH  | `/api/reports/:id/assign`           | NP/Admin        | Assign to worker              |
| PATCH  | `/api/reports/:id/status`           | NP/Admin/Worker | Update status                 |
| POST   | `/api/reports/:id/upvote`           | Citizen         | Upvote report                 |
| GET    | `/api/analytics/overview`           | NP/Admin        | Stats overview                |
| GET    | `/api/analytics/trend`              | NP/Admin        | Daily trend data              |
| GET    | `/api/analytics/heatmap`            | NP/Admin        | Map heatmap points            |
| GET    | `/api/analytics/worker-performance` | NP/Admin        | Worker metrics                |
| GET    | `/api/categories`                   | —               | All active categories         |
| GET    | `/api/users/workers`                | NP/Admin        | Worker list                   |
| GET    | `/api/notifications`                | ✅              | User notifications            |

**Swagger UI**: `http://localhost:5000/api/docs`

---

## 📁 Project Structure

```
cleancity/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, Mailer
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, RBAC, Upload, Rate-limit
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Socket.io, Mail, Cloudinary
│   │   ├── utils/           # Helpers, Seed script
│   │   └── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios + API functions
    │   ├── components/      # Shared UI components
    │   ├── context/         # Auth + Socket contexts
    │   ├── pages/
    │   │   ├── public/      # Landing, Login, Register, Submit, Track
    │   │   ├── citizen/     # My Complaints, Detail
    │   │   ├── nagarpalika/ # Dashboard, Map, Reports, Workers
    │   │   └── admin/       # Dashboard, Users, Categories, Audit, Export
    │   ├── store/           # Redux Toolkit slices
    │   └── App.jsx
    └── package.json
```

---

## 🔒 Security Features

- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- Auto token refresh via Axios interceptor
- bcrypt password hashing (12 rounds)
- Role-based access control (RBAC) middleware
- Rate limiting: 10 auth attempts/15min, 5 anonymous reports/hour
- Helmet.js security headers
- Input validation via Express-validator
- Multer file type validation (images only, 10MB max)
- Cloudinary WebP compression (auto-transforms to < 2MB)

---

## 🌐 Real-time Features (Socket.io)

| Event           | Direction  | Trigger                  |
| --------------- | ---------- | ------------------------ |
| `new_report`    | → NP/Admin | New complaint submitted  |
| `status_update` | → Reporter | Status changed           |
| `notification`  | → User     | Any notification created |

---

## 🗺️ Maps

Uses **Leaflet.js + OpenStreetMap** — completely free, no API key required.

- Color-coded circular markers by status
- Marker size scales with upvote count
- Popup shows photo, category, status, address

---

## 📬 Email Notifications

Automated HTML emails sent for:

- Welcome (on registration)
- Complaint received (with tracking ID)
- Status update (at each change)
- Worker assignment (to sanitation worker)

---

## 🐛 Troubleshooting

| Issue                    | Solution                                           |
| ------------------------ | -------------------------------------------------- |
| MongoDB connection error | Make sure MongoDB is running: `mongod`             |
| Image upload fails       | Check Cloudinary credentials in `.env`             |
| Email not sending        | Use Gmail App Password (not your account password) |
| CORS error               | Set `CLIENT_URL` in backend `.env` correctly       |
| Port conflict            | Change `PORT` in backend `.env`                    |
