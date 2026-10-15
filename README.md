# 📱 Mobile Phone Stock Management System (MobiStock)

A full-stack inventory management system designed for mobile phone retail shops. Built with clean, educational, and modular code to illustrate relational database modeling with PostgreSQL and Prisma ORM, atomic inventory transitions, secure JWT authentication, and modern React dashboard design.

---

## 🌟 Features

- **Device Catalog Management**: Track phones by brand, model, storage/RAM variant, color, category (Smartphone / Feature Phone), cost price, and selling price.
- **Stock Movement Workbench (IN / OUT)**:
  - **Stock IN**: Restock inventory from wholesale shipments.
  - **Stock OUT**: Deduct sold units or dispatches with negative-stock prevention (rejects transactions if requested quantity exceeds available stock).
  - **Prisma Transactions (`$transaction`)**: Ensures inventory count and audit logs are updated atomically.
- **Low-Stock Alerting**: Configurable per-model reorder thresholds (`reorder_level`) with visual alert badges and dashboard warnings.
- **Supplier Directory**: Manage vendor contact information and track phone models sourced from each vendor.
- **Visual Analytics Dashboard**: Real-time KPI cards (Total Stock Valuation, Retail Units, Low-Stock Count) and Recharts brand volume distribution.
- **JWT Authentication & bcrypt Hashing**: Secure stateless authentication with token verification middleware.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide Icons.
- **Backend**: Node.js v24, Express, Prisma ORM v6, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`.
- **Database**: PostgreSQL 18.

---

## 📂 Project Structure

```text
mobile-stock-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema (User, Supplier, Mobile, StockTransaction)
│   │   └── seed.js            # Seed script (Admin, 4 suppliers, 14 phone models)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── mobiles.controller.js
│   │   │   ├── stock.controller.js
│   │   │   ├── suppliers.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT Bearer token verification
│   │   ├── routes/            # Express route definitions
│   │   ├── prisma.js          # Shared Prisma client instance
│   │   └── server.js          # Express app entry point
│   ├── .env                   # Environment config
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       # Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── components/        # Navbar, Sidebar, StatCard, LowStockBadge, ProtectedRoute
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MobilesList.jsx
│   │   │   ├── StockMovement.jsx
│   │   │   ├── TransactionHistory.jsx
│   │   │   └── Suppliers.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL server running locally or via remote connection

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env to set your PostgreSQL connection string:
# DATABASE_URL="postgresql://postgres@localhost:5432/phonestore?schema=public"
# PORT=5050
# JWT_SECRET="your_jwt_secret"

# Sync schema and generate Prisma Client
npx prisma db push

# Seed sample data (Admin account, 4 suppliers, 14 phones, sample transactions)
npm run prisma:seed

# Start backend server
npm run dev
# Server will run at: http://localhost:5050
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite dev server
npm run dev
# Frontend will run at: http://localhost:5173
```

---

## 🔑 Default Admin Credentials (from Seed)

- **Email**: `admin@phonestore.com`
- **Password**: `password123`
*(A convenient one-click "Fill Demo Admin Credentials" button is also provided on the Login page).*

---

## 📡 API Endpoints Summary

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Sign in, returns JWT
- `GET /api/auth/me` — Current user profile *(Protected)*

### Mobiles
- `GET /api/mobiles` — List phones (`?search=`, `?category=`, `?lowStock=true`) *(Protected)*
- `GET /api/mobiles/:id` — Get single phone details *(Protected)*
- `POST /api/mobiles` — Create mobile phone *(Protected)*
- `PUT /api/mobiles/:id` — Update mobile phone details *(Protected)*
- `DELETE /api/mobiles/:id` — Delete mobile phone *(Protected)*

### Stock Movement
- `POST /api/stock/in` — Add stock (`mobile_id`, `quantity`, `note`) *(Protected)*
- `POST /api/stock/out` — Deduct stock (validates quantity >= requested) *(Protected)*
- `GET /api/stock/transactions` — Transaction history (`?mobile_id=`, `?type=`) *(Protected)*

### Suppliers
- `GET /api/suppliers` — List all suppliers *(Protected)*
- `GET /api/suppliers/:id` — Get supplier details *(Protected)*
- `POST /api/suppliers` — Add supplier *(Protected)*
- `PUT /api/suppliers/:id` — Update supplier *(Protected)*
- `DELETE /api/suppliers/:id` — Delete supplier *(Protected)*

### Dashboard
- `GET /api/dashboard/summary` — KPIs, top 5 brands by quantity, recent movements *(Protected)*

---

## 💡 Key Architectural Decisions Explained

### 1. Atomic Stock Transactions (`prisma.$transaction`)
In inventory management, incrementing/decrementing stock and logging an audit transaction cannot be two separate uncoordinated queries. If the server crashed or another request interfered midway, stock numbers would fall out of sync with audit records.
By using `prisma.$transaction(async (tx) => { ... })`, both the quantity decrement and the `stock_transactions` entry either **both commit** or **both roll back**. Furthermore, verifying `mobile.quantity >= requestedQuantity` inside the transaction guarantees stock never drops below zero even under concurrent requests.

### 2. Decimal Data Type for Prices
Floating point numbers in computers suffer from rounding artifacts (e.g. `0.1 + 0.2 === 0.30000000000000004`). In `schema.prisma`, we use `@db.Decimal(10, 2)` for `cost_price` and `selling_price` to store monetary amounts with fixed, exact 2-decimal precision.

### 3. JWT Stateless Authentication
JSON Web Tokens (JWT) allow stateless authorization. When a user logs in, the backend signs a token containing the user's ID, email, and role using `JWT_SECRET`. On subsequent requests, the `auth.js` middleware simply verifies the digital signature without having to make a round-trip database lookup on every static API call, keeping the backend fast and scalable.

### 4. Dynamic Live Projection on Frontend
The Stock Movement Workbench calculates what the inventory count **will be** in real time before the user hits submit. If a cashier attempts to dispatch 5 units when only 2 are in stock, the submit button is disabled with an inline explanation before an invalid network call is even dispatched.
