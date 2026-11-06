# Product & Engineering Roadmap

This roadmap outlines planned features, technical improvements, and architectural milestones for **NotaLocal**.

---

## 🎯 Current Milestone: Production Hardening & Developer Experience

### 🧪 1. Comprehensive Automated Testing Suite (~6-8 hours)
- [ ] Configure **Vitest** for fast unit testing of core utility functions (rating thresholds, slug validation, phone formatters).
- [ ] Implement **React Testing Library** suites for critical UI components (`ReviewFlow`, `Logo`, `FeedbackTable`).
- [ ] Configure **Playwright** for End-to-End (E2E) verification:
  - Rating flows (1-3 stars retention vs 4-5 stars Google redirect).
  - Admin login & session protection via Clerk.
  - Feedback status transition (`pending` -> `contacted` -> `resolved`).
- [ ] Setup GitHub Actions workflow for pull request linting and test runs.

---

### 🏗️ 2. Component Refactoring & Code Quality (~6-8 hours)
- [ ] Deconstruct monolithic dashboard components (`AdminDashboard.tsx` and `SuperAdminDashboard.tsx`) into modular domain components:
  - `MetricsOverview.tsx` (Summary cards: total reviews, redirection rate, NPS score).
  - `FeedbackList.tsx` (Filterable and sortable feedback stream).
  - `CustomerContactModal.tsx` (WhatsApp/email direct contact actions).
  - `QrCodeGeneratorModal.tsx` (Printable placard configuration).
- [ ] Implement typed Custom Hooks:
  - `useFeedbacks(businessId)`
  - `useBusinessMetrics(businessId)`
- [ ] Replace imperative polling with Server-Sent Events (SSE) or optimistic cache updates.

---

### 🌐 3. Full Internationalization (i18n) & Localization (~4-5 hours)
- [ ] Adopt `next-intl` or lightweight JSON locale dictionaries.
- [ ] Provide multi-language support out of the box (`en` as default, `pt-BR` and `es` for regional businesses).
- [ ] Dynamic locale switcher in the admin settings panel.

---

### 🔔 4. Asynchronous Notifications & Webhooks (~4-6 hours)
- [ ] Asynchronous email dispatch via Resend when negative feedback (1-3 stars) is captured.
- [ ] Webhook triggers to forward low-score alerts directly to business management via WhatsApp / SMS (Twilio or WhatsApp Business API).
- [ ] Idempotent webhook receiver for subscription lifecycle events (Asaas / Stripe).

---

### 📊 5. Export & Analytics Engine (~3-4 hours)
- [ ] Export feedback history to CSV and Excel formats.
- [ ] Generate downloadable monthly executive PDF reports highlighting rating improvements and negative reviews mitigated.
