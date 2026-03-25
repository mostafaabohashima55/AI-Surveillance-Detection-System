# 🛡️ SENTINEL AI — Surveillance System Dashboard

An AI-powered surveillance system frontend for detecting weapons and harassment incidents in real time.

---

## 📁 File Structure

```
surveillance/
├── index.html              ← Main dashboard (entry point)
├── css/
│   └── style.css           ← Complete design system & all styles
├── js/
│   └── app.js              ← App logic, mock data, navigation, charts
└── pages/
    ├── login.html          ← Login page
    └── register.html       ← Register / create admin account
```

---

## 🚀 Running Locally

1. **Open directly** — just open `index.html` in any modern browser
2. **Or use a local server** (recommended for best experience):

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code
Install "Live Server" extension → Right-click index.html → Open with Live Server
```

Then visit: `http://localhost:8080`

---

## 🎯 Pages & Features

| Page | Description |
|------|-------------|
| **Dashboard** | Stats cards, live charts, recent alerts, camera status, live previews |
| **Alerts** | Full alerts table with filters (date, camera, type), view details, mark status |
| **Cameras** | Camera list with CRUD, test connection, live grid preview |
| **Detection History** | Full history with search/filter, hourly chart |
| **Admin Management** | List/add/delete admins with roles |
| **Settings** | Theme, language (English/Arabic RTL), detection thresholds, notifications |
| **Login** | Validated login form with demo credentials |
| **Register** | Multi-step admin registration with password strength |

---

## 🎨 Design System

- **Fonts:** Rajdhani (headings) + DM Sans (body)
- **Colors:** Cyan `#00d4ff` primary, Red `#ff3b5c` danger, Purple `#a855f7`
- **Dark Mode:** Full dark mode via `data-theme="dark"` on `<html>`
- **Arabic RTL:** Full RTL layout via `dir="rtl"` toggle in Settings

---

## 🔧 Key Interactions

- **Sidebar:** Collapsible sidebar (desktop) / slide-in drawer (mobile)
- **Dark mode:** Toggle button in topbar
- **Language:** Switch English ↔ Arabic in Settings page
- **Alerts:** View detail modal, mark false alert, mark resolved
- **Cameras:** Add/edit/delete with form validation, mock connection test
- **Live alerts:** Simulated alert every 18 seconds

---

## 📦 Dependencies (CDN)

- Bootstrap 5.3.3
- Chart.js 4.4.4
- Font Awesome 6.5.1
- Google Fonts (Rajdhani, DM Sans)
