# Chic Fashion Store

> 🌐 **Live Demo Website:** [https://chic-fashion-store-pbkk.vercel.app](https://chic-fashion-store-pbkk.vercel.app)

A full-stack, production-ready luxury e-commerce web platform built with **Next.js 14 (App Router)**, **React**, **Tailwind CSS**, **Node.js/Express**, and **MySQL** with **Prisma ORM**.

---

##  Key Features

- ** Enterprise Authentication**:
  - Dual-layer login: One-click **Google OAuth** + **Email & Password** Credentials.
  - Passwords hashed using **bcrypt** (12 salt rounds).
  - Sessions managed via **NextAuth.js**.
- ** Real-Time OTP Email Verification**:
  - Cryptographically secure 6-digit numeric OTP generation (`crypto.randomInt`).
  - **Zero Plaintext Storage**: Token stored solely as a **SHA-256 hash** in MySQL with a 10-minute expiration.
  - **Timing-Safe Comparison**: `crypto.timingSafeEqual` prevents side-channel timing attacks.
  - **Algorithmic Typo & Fake Domain Interception**: Levenshtein distance check catches typos (e.g. `@gamil.com` ➡️ `@gmail.com`) and queries live DNS MX records to reject non-existent domains.
  - **High-Speed Dispatch**: Pooled SMTP connections deliver codes in **~3 seconds**.
- ** Luxury E-Commerce Experience**:
  - Responsive curated collections, category filtering (`dresses`, `outerwear`, `accessories`, `shoes`), and search.
  - Dynamic product detail views (`/product/[id]`) with image galleries, variant selection, and stock status.
  - Persistent shopping bag and wishlist powered by **React Context API** and LocalStorage.
  - Localized **INR (`₹`)** currency formatting.
- ** Checkout & Orders**:
  - Order review, address collection, and checkout flow.
  - Relational schema tracking Orders and OrderItems in MySQL.

---

##  Technology Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide React
- **Backend / APIs**: Next.js Route Handlers + Express.js microservice
- **Database & ORM**: MySQL, Prisma ORM
- **Authentication**: NextAuth.js (v4/v5), bcrypt
- **Email Delivery**: Nodemailer (Persistent connection pool via Port 465 SSL)

---

##  Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL Server running locally or in the cloud

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chic-fashion-store.git
cd chic-fashion-store
```

### 2. Configure Environment Variables

Create `.env` inside `frontend/`:
```bash
cp frontend/.env.example frontend/.env
```
Update `DATABASE_URL`, `NEXTAUTH_SECRET`, Google OAuth keys, and SMTP credentials.

Create `.env` inside `backend/`:
```bash
cp backend/.env.example backend/.env
```

### 3. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 4. Database Setup (Prisma)

```bash
cd ../frontend
npx prisma generate
npx prisma db push
```

### 5. Run the Application

In terminal 1 (Frontend):
```bash
cd frontend
npm run dev
```

In terminal 2 (Backend):
```bash
cd backend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

This project is licensed under the MIT License.
