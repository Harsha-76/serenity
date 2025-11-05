# Serenity Admin Dashboard

Admin dashboard for managing Serenity Mental Health Wellness App.

## Features

- 🔐 Admin-only authentication
- 👥 User management
- 📊 Analytics and statistics
- 💬 Community moderation
- 📝 Content management
- 🆘 Emergency support monitoring

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with Firebase config:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAILS=admin@example.com
```

3. Run development server:
```bash
npm run dev
```

Admin dashboard will run on: http://localhost:3000

## Admin Access

Only users with emails listed in `VITE_ADMIN_EMAILS` can access the admin dashboard.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Firebase (Auth & Firestore)
- Recharts (Analytics)
- Lucide Icons
