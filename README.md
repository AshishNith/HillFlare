# HillFlare

Premium, college-exclusive social discovery platform.

## Apps

- **Mobile** (Expo + React Native): `apps/mobile`
- **Web** (Vite + React + Tailwind): `apps/web`
- **Admin** (Vite + React + Tailwind): `apps/admin`
- **API** (Node + Express + MongoDB + Socket.io): `apps/api`

## Features

### Mobile App
- ✅ Authentication with OTP
- ✅ User onboarding and profile setup
- ✅ Swipe to discover matches
- ✅ Anonymous crush selection
- ✅ Real-time chat
- ✅ Match management
- ✅ Profile customization

### Website
- ✅ Beautiful landing page
- ✅ Authentication with OTP
- ✅ Full app features (Discover, Matches, Crushes, Chats)
- ✅ Profile management
- ✅ Responsive design

### Admin Panel
- ✅ Dashboard with analytics
- ✅ User management
- ✅ Reports moderation
- ✅ College management
- ✅ Settings configuration

### Backend API
- ✅ Authentication with JWT
- ✅ User profiles
- ✅ Swipe mechanics with match detection
- ✅ Anonymous crushes with mutual reveal
- ✅ Real-time chat with Socket.io
- ✅ College management
- ✅ Reporting system

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or pnpm

### Install

```bash
npm install
```

### Setup Environment

Create `apps/api/.env` file:

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/hillflare
JWT_SECRET=your_jwt_secret_here_change_in_production
OTP_SECRET=your_otp_secret_here
CORS_ORIGIN=*
```

### Start MongoDB

```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

### Seed Initial Data

```bash
npm --workspace apps/api run seed
```

### Run Applications

#### API Server

```bash
npm run dev:api
# API runs on http://localhost:4000
```

#### Website

```bash
npm run dev:web
# Website runs on http://localhost:3001
```

#### Admin Panel

```bash
npm run dev:admin
# Admin runs on http://localhost:5173
```

#### Mobile App

```bash
npm run dev:mobile
# Then press 'w' for web, 'a' for Android, or 'i' for iOS
```

## Project Structure

```
hillflare/
├── apps/
│   ├── mobile/          # React Native app with Expo
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── theme/
│   │   └── App.tsx
│   ├── web/             # Main website
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── store/
│   │   └── index.html
│   ├── admin/           # Admin dashboard
│   │   ├── src/
│   │   │   └── App.tsx
│   │   └── index.html
│   └── api/             # Backend API
│       ├── src/
│       │   ├── config/
│       │   ├── middleware/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── sockets/
│       │   └── index.ts
│       └── .env
└── packages/
    ├── shared/          # Shared utilities
    └── ui/              # UI components
```

## API Endpoints

### Authentication
- `POST /auth/otp/request` - Request OTP
- `POST /auth/otp/verify` - Verify OTP and get JWT

### Users
- `GET /users/me` - Get current user
- `PUT /users/me` - Update profile
- `GET /swipes/discovery` - Get discovery profiles

### Matches & Swipes
- `POST /swipes` - Swipe on a user
- `GET /matches` - Get all matches

### Crushes
- `GET /crushes` - Get selected crushes
- `POST /crushes` - Select a crush

### Chats
- `GET /chats` - Get all conversations
- `GET /chats/:id/messages` - Get messages
- `POST /chats/:id/messages` - Send message

### Colleges
- `GET /colleges` - Get all colleges
- `POST /colleges` - Add college (admin)

### Reports
- `POST /reports` - Report a user
- `GET /reports` - Get all reports (admin)

## Tech Stack

### Frontend
- **Mobile**: React Native, Expo, Zustand, React Navigation
- **Web**: React, TypeScript, Vite, Tailwind CSS, React Router, Zustand
- **Admin**: React, TypeScript, Vite, Tailwind CSS

### Backend
- **API**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Real-time**: Socket.io
- **Auth**: JWT, OTP

## Development

### Mobile Development

```bash
# Start Expo dev server
npm run dev:mobile

# Run on Android
npm --workspace apps/mobile run android

# Run on iOS
npm --workspace apps/mobile run ios

# Run on web
npm --workspace apps/mobile run web
```

### Web Development

```bash
# Start dev server
npm run dev:web

# Build for production
npm run build:web
```

### API Development

```bash
# Start in dev mode with hot reload
npm run dev:api

# Build TypeScript
npm --workspace apps/api run build

# Run production
npm --workspace apps/api run start
```

## Deployment

### Prerequisites

- A **MongoDB Atlas** free cluster (or any hosted MongoDB)
- A **Render** account (free tier works)
- A **Vercel** account (free tier works)
- An **Expo** account + EAS CLI for the APK

---

### 1. MongoDB Atlas (Database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. Create a database user (username + password).
3. In **Network Access**, add `0.0.0.0/0` to allow connections from Render.
4. Click **Connect → Drivers** and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hillflare?retryWrites=true&w=majority
   ```

---

### 2. Backend on Render

**Option A — Blueprint (recommended):**

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New → Blueprint**.
3. Connect your GitHub repo. Render will read `render.yaml` and set up the service.
4. In the Render dashboard, set these **environment variables**:
   | Variable | Value |
   |---|---|
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` (set after Vercel deploy) |
5. The `JWT_SECRET` and `OTP_SECRET` are auto-generated by Render.

**Option B — Manual:**

1. Go to Render → **New → Web Service** → connect your GitHub repo.
2. Set:
   - **Root Directory**: _(leave blank — uses repo root)_
   - **Build Command**: `cd apps/api && npm install && npm run build`
   - **Start Command**: `cd apps/api && npm start`
   - **Environment**: `Node`
3. Add the environment variables from the table above.
4. Set **Health Check Path** to `/health`.

After deploy, note your Render URL (e.g. `https://hillflare-api.onrender.com`).

> **Note**: OTP codes are logged to the Render console (`[auth] OTP for ...`). Check **Logs** in the Render dashboard during testing.

---

### 3. Website on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo.
2. Vercel will auto-detect the config from `vercel.json`. Confirm:
   - **Framework Preset**: Vite
   - **Build Command**: `cd apps/web && npm run build`
   - **Output Directory**: `apps/web/dist`
3. Add this **environment variable**:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://hillflare-api.onrender.com` (your Render URL) |
4. Click **Deploy**.
5. After deploy, copy the Vercel URL and go back to Render to update `CORS_ORIGIN`.

---

### 4. Mobile APK via EAS Build

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Navigate to mobile app
cd apps/mobile

# Initialize EAS project (links to your Expo account)
eas init

# Update app.config.ts with your Render URL
# (edit PROD_API_URL in app.config.ts)
```

**Build the APK:**

```bash
# Build a shareable APK (preview profile)
eas build --platform android --profile preview
```

This queues a cloud build on Expo's servers. When done, you'll get a download link for the `.apk` file.

**Build a production AAB** (for Google Play):

```bash
eas build --platform android --profile production
```

> **First-time setup**: EAS will generate a keystore automatically. Keep the credentials safe.

---

### Post-Deployment Checklist

- [ ] Set `CORS_ORIGIN` on Render to your Vercel domain
- [ ] Verify `/health` returns `{"status":"ok"}` on Render URL
- [ ] Verify website loads and can request OTP
- [ ] Update `PROD_API_URL` in `apps/mobile/app.config.ts` to your Render URL
- [ ] Build and test the APK

## License

ISC
