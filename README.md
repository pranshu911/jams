# JAMS – Job Application Management System 🚀

**Your job search, organized.**

JAMS is a modern, full-stack web application for tracking, managing, and analyzing your job applications, built with React, TypeScript, Supabase, and shadcn/ui. It features real-time CRUD, analytics, a beautiful dark UI, and a productivity-focused workflow.

---

## ✨ Features

### Authentication & Security

- Secure sign-in/sign-up with Supabase Auth (email/password)

### Application Tracking

- Add, edit, archive, and delete job applications
- Bulk actions: archive, unarchive, mark as rejected, delete

### Powerful Search & Filtering

- Instant search by title, company, or location

### Analytics Dashboard

- Live charts and insights on your job search progress

### Calendar Integration

- View deadlines and interview dates in a calendar

### Dark Mode Design

- Custom dark theme with Tailwind CSS & CSS variables

### Responsive & Accessible

- Works beautifully on desktop and mobile, with accessible UI components

---

## 🏗️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS, Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **State/Data:** React Query, Supabase Realtime
- **Other:** Lucide Icons, date-fns, Recharts, ESLint, Prettier

---

## 🚦 Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/jams.git
   cd jams
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables**\
   Create a `.env.local` file:
   ```bash
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Visit `http://localhost:8080` to get started!

---

## 🛠️ Project Structure

```plaintext
jams/
├─ public/                # Static assets (icons, robots.txt, etc.)
├─ src/
│  ├─ components/        # Reusable UI and layout components
│  ├─ contexts/          # React context providers (Supabase, etc.)
│  ├─ hooks/             # Custom React hooks
│  ├─ lib/               # Supabase client, utilities
│  ├─ pages/             # Route-based pages (Dashboard, Applications, etc.)
│  ├─ index.css          # Tailwind & custom CSS (dark theme)
│  └─ main.tsx           # App entry point
├─ index.html             # HTML template
├─ package.json           # Scripts & dependencies
└─ tailwind.config.ts     # Tailwind configuration
```

---

## 🔐 Authentication

- Uses Supabase Auth for secure email/password login
- Session persisted and auto-refreshed
- AuthGuard protects routes

---

## 📊 Core Pages & Features

- **Landing Page:** Welcome, sign in/up
- **Dashboard:** Overview, analytics, quick stats
- **Applications:** Add, edit, archive, delete, search, bulk actions
- **Archived Applications:** View, unarchive, delete
- **Calendar:** Visualize dates
- **Analytics:** Charts & insights
- **Settings:** Manage account & preferences

---

## ⚙️ Configuration

- **Env vars** (in `.env.local`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Port:** Default `8080` (see `vite.config.ts`)

---

## 🧪 Testing Supabase Connection

A `/supabase-test` page is available—uncomment its route in `App.tsx` to verify connectivity & permissions.

---

## 🖌️ Customization

- **Theme:** Adjust colors/radii in `src/index.css` & `tailwind.config.ts`
- **UI Components:** Built with shadcn/ui & Radix for accessibility

---

## 🧑‍💻 Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Lint code with ESLint    |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Fork the repo and submit a PR.

---

## 🙏 Acknowledgements

Thanks to Supabase, shadcn/ui, Radix UI, Vite, and Tailwind CSS.

> Made with ❤️ for job seekers everywhere.

