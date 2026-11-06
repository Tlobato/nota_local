# NotaLocal 🌟

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15%2B%20%2F%2016-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20Postgres-00e599?logo=postgresql)](https://neon.tech/)

> **Smart Customer Feedback & Google Review Routing Platform** designed for local businesses, clinics, and service providers to protect and amplify their online reputation.

---

## 🎯 Overview

Customer reviews on Google Maps are critical for local search visibility and conversion. However, unsolicited requests often backfire when dissatisfied customers vent minor frustrations publicly.

**NotaLocal** provides a dynamic feedback triage flow:
- **Promoters (4 to 5 stars):** Seamlessly routed directly to the business's official Google Reviews page to post high-rating public reviews.
- **Detractors & Neutrals (1 to 3 stars):** Retained in a private internal feedback channel, allowing the business owner and management to address customer concerns immediately before negative reviews reach the public.

🚀 **Live Deployment:** [https://notalocal.vercel.app](https://notalocal.vercel.app)

---

## ⚡ Key Features

- **Interactive Review Flow (`/[slug]`):** Mobile-first, responsive rating flow tailored to each local business profile.
- **Admin Dashboard (`/admin`):** Real-time feedback analytics, resolution tracking, customer contact via WhatsApp in one click, and QR code plate generator.
- **Super Admin Overview (`/super-admin`):** Business management, metric overviews, and subscription status.
- **Onboarding Flow (`/onboarding`):** Guided setup for business details, Google Place ID lookup, category selection, and customization.
- **QR Code & Counter Placards:** Instant SVG/PNG QR code rendering for physical desk displays and table tents.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19, Server Components & Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & ORM:** [Neon Serverless PostgreSQL](https://neon.tech/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Clerk](https://clerk.com/) (Multi-tenant business & super-admin roles)
- **Payments:** Asaas API integration for subscriptions & recurring billing
- **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- PostgreSQL database instance (Neon recommended)
- Clerk account for authentication keys

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tlobato/nota_local.git
   cd nota_local
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```

4. **Run database migrations and seed mock data:**
   ```bash
   npx drizzle-kit push
   npm run seed # or npx tsx src/lib/db/seed.ts
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🗺️ Roadmap & Planned Tasks (20+ Hours)

We have an active backlog of features, performance improvements, and test coverage planned:

### 🧪 1. Automated Testing & Quality Assurance (~6 hours)
- [ ] Set up unit and component testing with **Vitest** and **React Testing Library**.
- [ ] Implement end-to-end (E2E) flows with **Playwright** covering the rating flow (`/[slug]`), review redirection, and the `/admin` triage board.
- [ ] Add CI/CD test automation workflows via GitHub Actions.

### 🏗️ 2. Architectural Refactoring & Modularization (~8 hours)
- [ ] Deconstruct monolithic components (`AdminDashboard.tsx` and `SuperAdminDashboard.tsx`) into decoupled sub-components (FeedbackTable, MetricsCard, FilterBar, NotificationModal).
- [ ] Extract shared business logic into dedicated React custom hooks and services.
- [ ] Implement robust error boundaries and fallback states across dynamic routes.

### 🔔 3. Webhook & Real-time Notification Engine (~5 hours)
- [ ] Asynchronous webhook handling for instant owner notifications via email (Resend) upon negative review submission.
- [ ] WhatsApp notification integration (Twilio / Z-API) when low-rating feedback arrives.
- [ ] Real-time UI updates in the admin dashboard utilizing Server-Sent Events (SSE) or WebSockets.

### 📊 4. Reporting & Export Capabilities (~3 hours)
- [ ] Generate downloadable monthly reputation reports in PDF format for business owners.
- [ ] CSV/Excel export for feedback history and resolution metrics.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
