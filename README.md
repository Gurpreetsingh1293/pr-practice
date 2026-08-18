# GraminLink — Rural Micro-Entrepreneur & SHG B2B Matchmaking Engine

<div align="center">
  <img src="https://img.shields.io/badge/Stack-MERN%20%2B%20Next.js-22c55e?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Partner-Y4D%20Foundation-f59e0b?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</div>

---

## 🌿 Overview

GraminLink bridges the gap between **rural Self-Help Groups (SHGs) / micro-producers** and **urban B2B bulk buyers** through:

- 📍 **Real-time geo-spatial matching** — MongoDB `$nearSphere` / `$geoNear` aggregation
- 📦 **Inventory aggregation** — batch cataloging with MOQ, stock, and lead times
- 🔄 **Milestone-based escrow** — 7-stage order state machine with role-based guards
- 📊 **Impact analytics** — revenue per cluster, livelihoods supported, category breakdown

---

## 📁 Directory Structure

```
SHG-hub/
├── server/                         # Express REST API
│   ├── src/
│   │   ├── index.js                # Entry point (CORS, Helmet, Rate limit)
│   │   ├── config/db.js            # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js             # Roles: shg_leader | b2b_buyer | ngo_admin
│   │   │   ├── SHGProfile.js       # 2dsphere geospatial index
│   │   │   ├── ProductBatch.js     # MOQ, stock, category, certifications
│   │   │   └── B2BOrder.js         # Milestone state machine + escrow
│   │   ├── controllers/
│   │   │   ├── authController.js   # JWT httpOnly cookie auth
│   │   │   ├── shgController.js    # GET /shg/nearby (geo-search)
│   │   │   ├── productController.js
│   │   │   ├── orderController.js  # PATCH /orders/:id/milestone
│   │   │   └── adminController.js  # Analytics aggregation pipeline
│   │   ├── services/
│   │   │   ├── geoService.js       # $geoNear aggregation helper
│   │   │   └── milestoneService.js # State machine + canTransition()
│   │   ├── middlewares/
│   │   │   ├── auth.js             # protect + authorize(roles)
│   │   │   ├── errorHandler.js     # Global error normalizer
│   │   │   └── validate.js         # express-validator wrapper
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── shgRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── adminRoutes.js
│   │   └── utils/seed.js           # Database seeder
│   ├── package.json
│   ├── render.yaml                 # Render deployment config
│   └── .env.example
│
└── client/                         # Next.js App Router
    ├── src/
    │   ├── app/
    │   │   ├── layout.js           # Root layout (AuthProvider, fonts)
    │   │   ├── page.js             # Landing page
    │   │   ├── (auth)/
    │   │   │   ├── login/page.js
    │   │   │   └── register/page.js
    │   │   └── (dashboard)/
    │   │       ├── layout.js       # Sidebar + auth guard
    │   │       ├── shg/page.js     # SHG leader dashboard
    │   │       ├── buyer/
    │   │       │   ├── page.js     # Buyer dashboard
    │   │       │   └── map/page.js # B2B Matchmaking Map/List
    │   │       ├── orders/
    │   │       │   ├── page.js     # Orders list
    │   │       │   └── [id]/page.js# Order detail + Milestone Tracker
    │   │       └── admin/page.js   # NGO Admin analytics
    │   ├── components/
    │   │   ├── MilestoneTracker.jsx
    │   │   ├── SHGClusterCard.jsx
    │   │   ├── ProductBatchTable.jsx
    │   │   ├── RFQModal.jsx
    │   │   ├── AnalyticsCharts.jsx
    │   │   └── GeoSearchPanel.jsx
    │   ├── context/AuthContext.js
    │   ├── hooks/
    │   │   ├── useOrders.js
    │   │   └── useNearby.js
    │   └── lib/api.js              # Axios instance + interceptors
    ├── tailwind.config.js
    ├── next.config.js
    ├── vercel.json
    └── .env.example
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas cluster (or local MongoDB with `mongod --replSet rs0`)

### 1. Clone & Install

```bash
# Server
cd server
npm install
cp .env.example .env
# → Fill in MONGO_URI and JWT_SECRET in .env

# Client
cd ../client
npm install
cp .env.example .env.local
# → Set NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Seed Database

```bash
cd server
npm run seed
```

Seed creates: 5 users · 2 SHG profiles · 3 product batches · 2 orders

### 3. Run Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- API: http://localhost:5000/api/v1/health
- App: http://localhost:3000

---

## 🧪 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **NGO Admin** | admin@y4dfoundation.org | Admin@1234 |
| **SHG Leader 1** | meena@shg-lalpur.org | Shg@Leader1 |
| **SHG Leader 2** | sunita@shg-motipur.org | Shg@Leader2 |
| **B2B Buyer 1** | rajesh@urbanmart.in | Buyer@1234 |
| **B2B Buyer 2** | anita@greencart.com | Buyer@5678 |

---

## 🌐 API Reference

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/logout` | Private |
| GET | `/api/v1/auth/me` | Private |

### SHG
| Method | Route | Access |
|--------|-------|--------|
| **GET** | `/api/v1/shg/nearby?lng=&lat=&radius=&category=` | b2b_buyer, ngo_admin |
| POST | `/api/v1/shg/profile` | shg_leader |
| GET | `/api/v1/shg/profile/:id` | Private |
| PUT | `/api/v1/shg/profile/:id` | shg_leader, ngo_admin |

### Orders & Milestones
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/v1/orders` | b2b_buyer |
| GET | `/api/v1/orders` | Private (role-scoped) |
| GET | `/api/v1/orders/:id` | Private |
| **PATCH** | `/api/v1/orders/:id/milestone` | Role-dependent per stage |

### Admin
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/v1/admin/analytics` | ngo_admin |
| PATCH | `/api/v1/admin/shg/:id/verify` | ngo_admin |
| PATCH | `/api/v1/admin/orders/:id/escrow` | ngo_admin |

---

## 🔄 Milestone State Machine

```
PLACED → RAW_MATERIAL → IN_PRODUCTION → PACKED → DISPATCHED → DELIVERED → FUNDS_RELEASED
  ↓           ↓              ↓
CANCELLED  CANCELLED     CANCELLED (ngo_admin only)
```

| Stage | Who can advance |
|-------|----------------|
| PLACED → RAW_MATERIAL | shg_leader, ngo_admin |
| RAW_MATERIAL → IN_PRODUCTION | shg_leader |
| IN_PRODUCTION → PACKED | shg_leader |
| PACKED → DISPATCHED | shg_leader, ngo_admin |
| DISPATCHED → DELIVERED | b2b_buyer, ngo_admin |
| DELIVERED → FUNDS_RELEASED | **ngo_admin only** |

Illegal transitions return **HTTP 400** with a descriptive error.

---

## ☁️ Deployment

### Backend → Render

1. Push `server/` to GitHub
2. Create Render **Web Service** → connect repo
3. Set **Root Directory**: `server`
4. **Build Command**: `npm install`
5. **Start Command**: `node src/index.js`
6. Add environment variables (from `.env.example`)
7. Note your Render URL (e.g. `https://graminlink-api.onrender.com`)

### Frontend → Vercel

1. Push `client/` to GitHub
2. Import project in Vercel
3. Set **Root Directory**: `client`
4. Add env var: `NEXT_PUBLIC_API_URL=https://graminlink-api.onrender.com`
5. Deploy — Vercel auto-reads `vercel.json` for API rewrites

### ⚠️ CORS Sync
In `server/.env` (Render dashboard), set:
```
CLIENT_URL=https://your-project.vercel.app
```

---

## 🔒 Security Features

- ✅ JWT stored in **httpOnly cookies** (no XSS exposure)
- ✅ **CORS allowlist** (only whitelisted origins)
- ✅ **Rate limiting** (100 req / 15 min / IP)
- ✅ **Helmet** HTTP security headers
- ✅ **MongoDB injection sanitization** (express-mongo-sanitize)
- ✅ **RBAC** on every route (`protect` + `authorize`)
- ✅ **Schema validation** (express-validator + Mongoose strict schemas)

---

## 📄 License

MIT © 2024 Y4D Foundation — GraminLink
