# ChatWith PS8F (Web)

A lightweight web client for interacting with the PS8F assistant and voice-memo features.

This repository contains a Next.js + React app (app-router) with a desktop-first chat interface, a QR pairing login flow and an OAuth-based token exchange. The UI follows a clean, shadcn-inspired design using Tailwind CSS.

## Features

- Desktop chat layout with sidebar, conversation list and chat window
- QR-based device pairing / OAuth device flow for sign-in
- OAuth code exchange and token storage in cookies (server-friendly)
- Middleware that redirects unauthenticated users to `/login`
- Simple auth provider (`src/provider/AuthProvider.tsx`) that reads tokens from cookies

## Quick start

Prerequisites:

- Node.js (>= 18)
- npm

Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Auth flow notes

- The app uses a device/OAuth pairing flow. When the app receives an OAuth `code`, the client exchanges it for tokens at the API and stores the `access_token` and `refresh_token` in cookies (names are declared in `src/config/auth.ts`).
- A `middleware.ts` at the project root protects top-level routes and redirects to `/login` when the access cookie is missing.
- The `AuthProvider` reads cookies (via `js-cookie`) to expose `useAuth()` in client components.

## Files of interest

- `src/components/Login/QRPairing.tsx` — QR generator and device pairing UI.
- `src/components/Login/OauthAuth.tsx` — OAuth token exchange (sets cookies & dispatches `p8fs:login`).
- `src/provider/AuthProvider.tsx` — React context that reads cookies and exposes auth state.
- `middleware.ts` — server-side middleware that redirects unauthenticated users to `/login`.
- `src/app/page.tsx` and `src/components/Chat/*` — Chat UI and layout.

## Development notes

- Tokens are stored in cookies so middleware has server-side access. For better security, consider storing the refresh token in an httpOnly cookie set by the server after a token-exchange endpoint.
- To centralize cookie names, `src/config/auth.ts` contains `STORAGE_KEYS` used across the app. Keep middleware cookie names in sync if you change them.
- The UI components are intentionally simple and static; connect them to your real message backends and websockets as needed.

## Next steps & ideas

- Implement httpOnly refresh-token set by server and a refresh endpoint.
- Add real message storage + sync (websockets, edge functions, or the PS8F API).
- Improve UX: conversation search, chat pinning, mobile responsive drawer for the sidebar.
