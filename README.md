# Findora — Campus Lost & Found

**One Campus. One Community. Every Belonging Matters.**

Findora is a modern Campus Lost & Found web application built with a Next.js + TypeScript frontend and a Node.js + Express.js REST API backend. It supports optional Neon PostgreSQL persistence with automatic local in-memory demo fallback, privacy-preserving ownership verification, a student User Dashboard, and a protected Administrator Console.

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript (TSX), Tailwind CSS 4, Lucide React
- **Backend:** Node.js, Express.js 5 (JavaScript), CORS, dotenv
- **Database:** Neon PostgreSQL (`pg`) with automatic local demo mode fallback and seed data

---

## Folder Structure

```text
findora/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                  # Homepage (Hero, Live Stats, Recent Items, How It Works, FAQ)
│   │   ├── lost/page.tsx             # Lost Items catalog with search & filters
│   │   ├── found/page.tsx            # Found Items catalog with search & filters
│   │   ├── items/[id]/page.tsx       # Dynamic Item Details + Request Claim workflow
│   │   ├── report/                   # Report hub + /report/lost & /report/found forms
│   │   ├── dashboard/page.tsx        # Student User Dashboard
│   │   ├── admin/                    # Protected Admin Dashboard (Overview, Lost, Found, Claims, Recovered, Settings)
│   │   ├── login/page.tsx            # Demo workspace access
│   │   └── register/page.tsx         # Demo onboarding entry
│   ├── components/
│   │   ├── admin/                    # AdminShell, AuthContext, Overview, ItemsManager, Claims, Recovered, Settings
│   │   ├── dashboard/                # UserDashboardView
│   │   ├── home/                     # HeroSection, HomeLiveContent, ItemsShowcaseSection, HowItWorksSection, FaqSection
│   │   ├── items/                    # ItemCard, CatalogItemCard, ItemsCatalogView, ItemDetailView, ItemDetailActions, StatusBadge
│   │   ├── layout/                   # Logo, Navbar, Footer
│   │   └── report/                   # ReportItemForm, ImageUploadField
│   ├── config/env.ts                 # NEXT_PUBLIC_API_URL config
│   ├── data/homepage.ts              # Static How It Works & FAQ content
│   ├── hooks/useReportForm.ts        # Controlled report form state & validation hook
│   ├── services/                     # api.ts, itemsService.ts, reportService.ts, claimsService.ts, dashboardService.ts, adminItemsService.ts
│   ├── types/                        # api.ts, item.ts, report.ts
│   ├── utils/reportValidation.ts     # Pure form & image validation helpers
│   └── public/images/                # Campus and item photography
├── backend/
│   ├── src/
│   │   ├── config/                   # env.js, db.js (Neon PostgreSQL + demo fallback)
│   │   ├── controllers/              # health, lostItems, foundItems, claims, dashboard
│   │   ├── db/                       # schema.sql, seedData.js, seed.js
│   │   ├── middleware/               # errorHandler.js, requireAdmin.js
│   │   ├── models/                   # demoStore, lostItems, foundItems, claims, dashboard
│   │   ├── routes/                   # index, health, lostItems, foundItems, claims, dashboard
│   │   ├── services/                 # lostItems, foundItems, claims, dashboard
│   │   ├── utils/                    # apiResponse.js, AppError.js, validators.js
│   │   ├── app.js
│   │   └── server.js
│   └── tests/api.test.js             # Automated REST API & E2E workflow test suite
└── README.md
```

---

## Setup & Installation

### 1. Prerequisites
- Node.js 20+ and npm

### 2. Environment Variables
Copy the environment templates if `.env` / `.env.local` do not already exist:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

**`backend/.env` (Local Demo Mode — Default):**
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
DATA_MODE=demo
ADMIN_API_KEY=findora-admin-demo-key
```

**Optional Neon PostgreSQL Mode:**
```env
DATA_MODE=postgres
DATABASE_URL=postgresql://user:password@your-neon-host/findora?sslmode=require
```
Apply schema and seed data to Neon PostgreSQL:
```bash
cd backend
npm run db:seed
```

**`frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Startup Commands

Run backend and frontend in separate terminals:

```bash
# Terminal 1 — Backend API (http://localhost:5000)
cd backend
npm run dev
```

```bash
# Terminal 2 — Frontend App (http://localhost:3000)
cd frontend
npm run dev
```

### Run Automated Tests & Checks
```bash
# Backend REST API & E2E Workflow Tests
cd backend && npm test

# Frontend TypeScript & ESLint
cd frontend && npx tsc --noEmit && npm run lint
```

---

## REST API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Server health and active mode (`demo` or `postgres`) |
| `GET` | `/lost-items` | Public | List lost items (`?search=&category=&location=&dateFrom=&dateTo=&status=&sort=`) |
| `GET` | `/lost-items/:id` | Public | Get single lost item (private details stripped) |
| `POST` | `/lost-items` | Public | Report a lost item (duplicate-protected) |
| `PUT` | `/lost-items/:id` | Admin (`x-admin-key`) | Update lost item fields or status |
| `DELETE` | `/lost-items/:id` | Admin (`x-admin-key`) | Delete a lost item report |
| `GET` | `/found-items` | Public | List found items with search, category, location, date, and sort filters |
| `GET` | `/found-items/:id` | Public | Get single found item (private verification clues stripped) |
| `POST` | `/found-items` | Public | Report a found item (duplicate-protected) |
| `PUT` | `/found-items/:id` | Admin (`x-admin-key`) | Update found item fields or status |
| `DELETE` | `/found-items/:id` | Admin (`x-admin-key`) | Delete a found item report |
| `GET` | `/claims` | Public | Public claim status summaries (`?itemId=&status=&claimantUserId=`) |
| `GET` | `/claims/:id` | Public | Single public claim status summary |
| `POST` | `/claims` | Public | Submit ownership claim (`claim_requested`, never auto-approved) |
| `GET` | `/claims/admin/review` | Admin (`x-admin-key`) | Full claims with private verification answers and confidential item clues |
| `PATCH` | `/claims/:id/status` | Admin (`x-admin-key`) | Transition claim (`under_verification`, `approved`, `rejected`, `recovered` with `handoverConfirmed: true`) |
| `GET` | `/dashboard/stats` | Public | Live campus statistics and zone/category breakdowns |

---

## Demo-Admin Access

1. Navigate to `http://localhost:3000/admin`.
2. Enter the demo administrator key configured in `backend/.env`:
   - Default local demo key: `findora-admin-demo-key`
3. All privileged endpoints verify the `x-admin-key` header on the Express backend (`401`/`403` if missing or invalid).

---

## End-to-End Demo Walkthrough

1. **Report a Lost Item:** Go to `/report/lost`, fill in item details (e.g., *Tan Bifold Leather Wallet*), optionally upload a JPG/PNG/WEBP photo (≤ 5MB), and submit.
2. **Report the Found Item:** Go to `/report/found`, log the matching found wallet with a confidential verification clue in the private section, and submit.
3. **Browse & Filter Found Items:** Visit `/found`, search by item name or filter by category/location/date, and open the item detail page.
4. **Request Claim:** Click **Request Claim**, provide claimant name, approximate date lost, location lost, and the private ownership verification answer, then submit. Notice status changes to **Claim Requested**.
5. **Admin Review & Approval:** Open `/admin`, unlock with `findora-admin-demo-key`, open **Claim Requests**, compare the confidential item clue with the claimant's private verification answer, and click **Approve Claim**.
6. **Confirm Physical Handover:** Check the physical handover confirmation box and click **Confirm Handover & Mark Recovered**.
7. **Verify Live Updates:** Check `/admin` Overview, `/admin/recovered`, `/dashboard`, and the homepage statistics to confirm recovery counts updated live.
