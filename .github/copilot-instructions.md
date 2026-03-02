# HillFlare — Copilot Instructions

## Project Overview
HillFlare is a college-exclusive social discovery / dating platform. Monorepo with four apps:

- **apps/api** — Express + MongoDB + Socket.IO backend (TypeScript, CommonJS)
- **apps/web** — React + Vite + Tailwind website (TypeScript, ESM)
- **apps/mobile** — Expo 54 + React Native mobile app (TypeScript)
- **apps/admin** — Admin dashboard (Vite + React + Tailwind)

## Stack & Conventions
- State management: Zustand (web & mobile)
- Auth: JWT (email as `sub`), OTP-based login
- Styling: Tailwind CSS (web/admin), inline styles with theme tokens (mobile)
- Custom colors: hf-bg, hf-border, hf-muted, hf-accent (#F07A83), hf-charcoal
- API routes have no `/api` prefix — use bare paths (e.g. `/users/me`, `/swipes`)
- Database: MongoDB via Mongoose; seed script at `apps/api/src/seed.ts`
- Real-time: Socket.IO for chat and online status

## Environment Variables
- **API** (`apps/api/.env`): `PORT`, `MONGO_URI`, `JWT_SECRET`, `OTP_SECRET`, `CORS_ORIGIN`
- **Web**: Vite env vars prefixed `VITE_` (e.g. `VITE_API_URL`)
- **Mobile**: Set via `app.config.ts` → `extra.apiUrl`, read via `expo-constants`

## Deployment
- **Backend**: Render (see `render.yaml` in repo root)
- **Website**: Vercel (see `vercel.json` in repo root)
- **Mobile APK**: EAS Build (see `apps/mobile/eas.json`)

## Development Commands
```bash
npm run dev:api     # API server with hot reload
npm run dev:web     # Web dev server on :3001
npm run dev:mobile  # Expo dev server
npm run build:web   # Production web build
```

## Key Rules
- Keep communication concise and focused.
- Follow development best practices.
- Use relative imports within each app.
- API body limit is 50MB (for base64 image uploads).
- Mobile uses react-native-reanimated 4 and gesture-handler 2.

