# 🌱 CleanCity — Smart Waste Management System

<div align="center">

![CleanCity](https://img.shields.io/badge/CleanCity-v1.0.0-4CAF50?style=for-the-badge&logo=leaf&logoColor=white)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A full-stack civic waste management platform that connects citizens, Nagarpalika staff, and administrators to resolve waste complaints efficiently.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Docs](#-api-documentation) · [Roles](#-user-roles)

</div>

---

## 📋 Overview

CleanCity is a **MERN stack** application that digitizes the entire waste complaint workflow — from a citizen snapping a photo of garbage, to a Nagarpalika staff member assigning a worker, to final verification and closure. The platform provides real-time updates via **Socket.io**, image storage via **Cloudinary**, geospatial mapping via **Leaflet**, and rich analytics via **Recharts**.

---

## ✨ Features

### 🧑‍💼 Citizen Portal
- Submit waste complaints with **photo upload**, GPS location, category, and description
- **Anonymous reporting** option with optional contact info
- Track complaint status using a unique **Tracking ID**
- View full complaint history and timeline
- **Upvote** existing complaints to signal priority
- Receive real-time status notifications

### 🏛️ Nagarpalika (Municipal Staff) Portal
- Full complaints dashboard with filters (status, priority, category)
- **Interactive Leaflet map** showing complaint pins across the city
- Assign complaints to workers with one click
- View before/after photos uploaded by workers
- **Verify & mark reports complete** after reviewing worker evidence
- Add **internal notes** visible to workers
- Manage workers — create, activate/deactivate accounts
- Export reports as **PDF / Excel**

### 🔧 Worker View
- View assigned complaints and navigation details
- **Upload proof-of-work photos** (before/after cleanup)
- Receive internal notes from Nagarpalika staff
- Mark tasks as in-progress

### 🛡️ Super Admin Panel
- Full **user management** (all roles: citizens, nagarpalika, workers)
- Manage **complaint categories**
- View **system-wide analytics** with bar charts and trend graphs
- Activity **audit logs**
- Export system data

---

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **Socket.io** | Real-time notifications |
| **JWT (Access + Refresh)** | Authentication |
| **Cloudinary** | Image uploads & storage |
| **Multer** | Multipart form handling |
| **Nodemailer** | Email (password reset, etc.) |
| **Helmet + express-rate-limit** | Security & rate limiting |
| **Swagger UI** | Auto-generated API docs |
| **bcryptjs** | Password hashing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19 + Vite** | UI framework & build tool |
| **Redux Toolkit** | Global state management |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client |
| **React Leaflet** | Interactive maps |
| **Recharts** | Analytics charts & graphs |
| **React Hook Form + Yup** | Form handling & validation |
| **Socket.io Client** | Real-time event handling |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |
| **jsPDF + XLSX** | PDF & Excel export |
| **date-fns** | Date formatting |

---

## 👥 User Roles

| Role | Access Level | Key Abilities |
|---|---|---|
| `citizen` | Public + Authenticated | Submit, track & upvote complaints |
| `nagarpalika` | Staff | Manage reports, assign workers, verify completion |
| `worker` | Field Staff | View assigned tasks, upload proof photos |
| `admin` | Super Admin | Full platform control, analytics, user management |

---

## 📁 Project Structure

```
cleancity/
├── package.json              # Root scripts (dev, install:all, seed)
├── backend/
│   ├── src/
│   │   ├── server.js         # Express + Socket.io entry point
│   │   ├── config/           # DB connection config
│   │   ├── controllers/      # Route handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── reports.controller.js
│   │   │   ├── users.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   ├── categories.controller.js
│   │   │   └── notifications.controller.js
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Report.js
│   │   │   ├── Category.js
│   │   │   ├── Notification.js
│   │   │   └── ActivityLog.js
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/       # Auth, error handler, rate limiter
│   │   ├── services/         # Socket.io service
│   │   └── utils/            # Seed scripts, helpers
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx           # Router & protected routes
    │   ├── pages/
    │   │   ├── public/       # Landing, Login, Register, Submit, Track
    │   │   ├── citizen/      # My Complaints, Complaint Detail
    │   │   ├── nagarpalika/  # Dashboard, Map, Reports, Workers
    │   │   └── admin/        # Dashboard, Users, Categories, Audit, Export
    │   ├── components/       # Reusable UI components
    │   ├── store/            # Redux slices & store
    │   ├── api/              # Axios instance & API calls
    │   ├── context/          # React context providers
    │   ├── hooks/            # Custom React hooks
    │   └── utils/            # Utility functions
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Cloudinary** account (free at [cloudinary.com](https://cloudinary.com))
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/cleancity.git
cd cleancity
```

### 2. Install All Dependencies

```bash
npm run install:all
```

This installs dependencies for the root, backend, and frontend in one command.

### 3. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cleancity
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_key_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail with App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### 4. Seed the Database (Optional)

Populate the database with default categories, roles, and a super admin account:

```bash
npm run seed
```

### 5. Start Development Servers

```bash
npm run dev
```

This concurrently starts:
- 🔵 **Backend API** → `http://localhost:5000`
- 🟣 **Frontend (Vite)** → `http://localhost:5173`

---

## 🌐 API Documentation

Interactive Swagger UI is available at:

```
http://localhost:5000/api/docs
```

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new citizen | ❌ |
| `POST` | `/api/auth/login` | Login & get tokens | ❌ |
| `POST` | `/api/auth/refresh` | Refresh access token | ❌ |
| `GET` | `/api/reports` | List all reports | ✅ |
| `POST` | `/api/reports` | Submit a complaint | ✅ |
| `GET` | `/api/reports/:id` | Get report details | ✅ |
| `PATCH` | `/api/reports/:id/status` | Update report status | ✅ Staff+ |
| `POST` | `/api/reports/:id/assign` | Assign to worker | ✅ Staff+ |
| `POST` | `/api/reports/:id/upload-proof` | Upload proof photo | ✅ Worker |
| `POST` | `/api/reports/:id/notes` | Add internal note | ✅ Staff+ |
| `GET` | `/api/analytics/summary` | System analytics | ✅ Admin |
| `GET` | `/api/users` | List all users | ✅ Admin |
| `GET` | `/api/health` | API health check | ❌ |

---

## 🗃️ Data Models

### User
- `name`, `email`, `phone`, `passwordHash`
- `role`: `citizen | nagarpalika | admin | worker`
- `city`, `nagarPalikaId` (worker → staff link)
- `isVerified`, `isActive`, `avatar`

### Report (Complaint)
- `trackingId` — unique public identifier
- `photo`, `beforePhoto`, `afterPhoto` — Cloudinary URLs
- `location` — GeoJSON Point (coordinates + address)
- `category`, `description`, `priority`
- `status`: `pending → assigned → in_progress → in_review → completed | rejected`
- `assignedTo` (worker), `assignedBy` (staff)
- `upvotes`, `internalNotes`, `statusHistory` timeline

---

## 🔒 Security

- **JWT Access Tokens** (15 min) + **Refresh Tokens** (7 days)
- Passwords hashed with **bcrypt** (12 rounds)
- **Helmet.js** for HTTP security headers
- **Rate limiting** on all API routes
- Role-based middleware on every protected route
- Sensitive fields (`passwordHash`, `refreshToken`) stripped from API responses

---

## 📊 Analytics

The Admin dashboard provides:
- Total reports by status (bar chart)
- Weekly activity trends
- Reports by category breakdown
- Resolution rate metrics
- User growth over time

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for cleaner cities · **CleanCity v1.0.0**

</div>
