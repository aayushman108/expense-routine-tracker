# SyncSplit | Smart Expense Tracker & Bill Splitter

SyncSplit is a comprehensive, full-stack expense management application designed for both individual and group finances. It features secure authentication via JWT and Google OAuth, allowing for a seamless and intuitive experience whether you're tracking personal spending or splitting bills with friends.

**Live Demo:** [https://syncsplit.netlify.app](https://syncsplit.netlify.app)

---

## 🚀 Features

- **Personal Expense Tracking:** Log and categorize your daily expenses to keep a pulse on your spending habits.
- **Group Bill Splitting:** Create groups for shared living, trips, or projects. Split bills by fixed amounts, percentages, or equal amounts.
- **Debt Settlement:** Automatically calculate who owes whom and simplify the process of settling up in minimum number of transactions.
- **Monthly Reports:** Gain insights into your financial health with monthly summaries and charts.
- **Progressive Web App (PWA):** Install SyncSplit on your mobile or desktop for a native-like experience, even offline.
- **Real-time Notifications:** Stay updated on group activities and settlement reminders with Firebase Cloud Messaging (FCM).
- **Dark Mode Support:** A sleek, premium UI with automatic and manual theme switching.
- **Secure Authentication:** Robust user authentication using JWT and Google OAuth (social login) for a seamless experience.

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling:** [Sass (SCSS)](https://sass-lang.com/) & Vanilla CSS
- **Animations:** [GSAP](https://greensock.com/gsap/)
- **Charts:** [Recharts](https://recharts.org/)
- **API Client:** [Axios](https://axios-http.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Google OAuth) & JWT
- **Push Notifications:** [Firebase](https://firebase.google.com/)

### Backend

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM/Query Builder:** [Knex.js](https://knexjs.org/)
- **Storage:** [Cloudinary](https://cloudinary.com/) (for receipt/profile images)
- **Email Service:** [Resend](https://resend.com/)
- **Authentication:** JWT (JSON Web Tokens), Bcrypt, & Google OAuth integration
- **Push Notifications:** [Firebase Admin SDK](https://firebase.google.com/docs/admin) (FCM)
- **PDF Generation:** [PDFKit](https://pdfkit.org/)
- **Excel Export:** [ExcelJS](https://github.com/exceljs/exceljs)

---

## 📂 Project Structure

```bash
.
├── backend/            # Express.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── database/    # Migrations and Seeds
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
├── frontend/           # Next.js Application
│   ├── src/
│   │   ├── app/        # Routes and Pages
│   │   ├── components/ # UI Components
│   │   ├── store/      # Redux State
│   │   └── styles/     # SCSS Themes and Utilities
└── shared/             # Shared Types and Utilities (Monorepo)
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL
- NPM or Yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/aayushman108/expense-routine-tracker.git
   cd expense-routine-tracker
   ```

2. **Install dependencies for all workspaces:**

   ```bash
   npm run install:all
   ```

3. **Environment Variables:**
   Create `.env` files in both `frontend/` and `backend/` directories based on the required services (Firebase, Cloudinary, Database URL, etc.).

4. **Database Setup:**
   ```bash
   cd backend
   npm run migrate:latest
   ```

### Running Locally

From the root directory, you can run both frontend and backend concurrently:

```bash
npm run dev
```

- Frontend will be available at: `http://localhost:3000`
- Backend will be available at: `http://localhost:8000` (default)

---

## 🚢 Deployment

The frontend is configured for deployment on **Netlify**.
The `netlify.toml` file handles the build process for the Next.js application.

```toml
[build]
  command = "npm run build:frontend"
  publish = "frontend/.next"
```

---

## 👤 Author

**Aayushman Sharma**

- GitHub: [@aayushman108](https://github.com/aayushman108)
