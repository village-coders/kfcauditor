# KFC Auditor Mobile Web Application

A mobile-first React + Vite application for KFC Halal Quality and Compliance Auditors, connected to the shared `hfaKfc-Backend` API.

---

## Features

- **Date-Validated Store Login**:
  - Entering an auditor username queries `GET /api/assignments/auditor/:username` and automatically populates stores allocated for **today's date**.
  - Authenticates via `POST /api/auth/login` against the backend database.
  - Supports **Remember Password** and **Forget Password** recovery modal.
- **Store-Scoped Audit Workflow**:
  - **KFC Audit Protocol**: Requires accepting the official protocol before creating a new audit.
  - **Product List**: Search and select from the HFA-approved product catalog (`/api/products`).
  - **Check List**: 4-step inspection with a sticky **Scoring Matrix**, one-tap mobile scoring, auto-saved drafts, and live recommendation evaluation (`Recommend For Pass`, `Other Fail`, `L3 Fail`).
  - **Outcome Sheet**: Touch/mouse signature pads (`NCR` and `RSR`), file attachments, and submission to Admin for final approval.
  - **Site Audit History**: View **Passed Audits**, **Pending Audits**, **Other Failed**, and **L3 List** scoped to the logged-in store.
- **Mobile-First Design**:
  - Optimized tap targets, responsive mobile cards, static desktop sidebar, and toast notifications.

---

## Getting Started

### 1. Install Dependencies
```bash
cd kfc-auditor
npm install
```

### 2. Configure Environment Variables
Create a `.env` file (never commit `.env` to Git):
```env
VITE_API_BASE_URL=http://localhost:5050/api
```

### 3. Start Dev Server
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your mobile browser or desktop.

### 4. Production Build
```bash
npm run build
```
