# KFC Auditor Mobile Web Application

A mobile-first React + Vite application for KFC Halal Quality and Compliance Auditors, built according to the Halal Food Authority (HFA) portal specifications.

---

## 📱 Features

- **Exact Screenshot Match & Enhanced Mobile UX**:
  - HFA Approved official seal logo header.
  - Sub-headings: `Log in.` and `Enter LogIn Details.`
  - Styled prefix boxes for inputs matching the design system.
  - Required fields:
    1. **Auditor Username**: Dynamic input that checks for assigned audit tasks.
    2. **Assigned Store**: Dropdown automatically populated with stores assigned to that specific auditor (e.g. entering `Taoheed` automatically surfaces `Ibadan`, `Ibadan - Bodija`, etc.).
    3. **Password**: Secure password field with mobile show/hide toggle.
  - **Remember Password**: Local state persistence.
  - **Forget Password**: Modal for account recovery and hotline support.
  - **Login Button**: Branded HFA green action button.
- **Auditor Session Flow**:
  - Validates all 3 required fields.
  - Upon successful authentication, transitions to the active Store Audit Inspection Dashboard with halal checklist items, critical control points, and exit/logout capabilities.
- **Extreme Mobile Friendliness**:
  - Optimized tap targets (≥ 44px min height).
  - Responsive layout for real smartphones and mobile viewports.
  - Interactive device preview toggle for desktop verification.
  - Quick-test auditor chips (`Taoheed`, `Amina`, `David`).

---

## 🗂️ Project Structure

```
kfc-auditor/
├── public/
│   └── hfa-logo.png             # Official Halal Food Authority emblem
├── src/
│   ├── assets/
│   │   └── hfa-logo.png
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuditorQuickSelect.jsx   # Fast 1-click test auditor chips
│   │   │   ├── ForgotPasswordModal.jsx  # Recovery modal with hotline info
│   │   │   └── LoginForm.jsx            # Core login form matching screenshot
│   │   ├── common/
│   │   │   ├── InputField.jsx           # Input with left prefix box & status
│   │   │   └── SelectField.jsx          # Styled select with chevron & states
│   │   ├── dashboard/
│   │   │   └── AuditorDashboard.jsx     # Post-login audit inspection screen
│   │   └── layout/
│   │       └── MobileContainer.jsx      # Mobile viewport & device frame preview
│   ├── context/
│   │   └── AuthContext.jsx              # Global session and auth provider
│   ├── data/
│   │   └── mockAuditors.js              # Mock auditors & assigned store audits
│   ├── services/
│   │   └── authService.js               # Dynamic store query & auth handlers
│   ├── index.css                        # Tailwind v4 configuration & styles
│   ├── App.jsx                          # Root router / view controller
│   └── main.jsx                         # Application entrypoint
├── index.html                           # Mobile meta tags (viewport, PWA ready)
├── package.json
└── vite.config.js                       # Vite with @tailwindcss/vite
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd kfc-auditor
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your mobile browser or desktop.

### 3. Production Build
```bash
npm run build
```
