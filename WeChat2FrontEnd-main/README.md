WeChat2 Frontend Foundation

Purpose
- This repository is the standalone frontend for the messaging system.
- Backend stays API-only and lives in a separate repository.

Tech Stack
- React 19 + TypeScript
- Vite
- React Router
- TanStack Query

Current Architecture
- src/app: app-level wiring (router and query client)
- src/features/auth: authentication state and login page
- src/features/chat: rooms page, room page, typed chat API client
- src/shared: generic HTTP client

Backend API Contract (current)
- GET /api/v1/chat/health/
- GET/POST /api/v1/chat/rooms/
- GET /api/v1/chat/rooms/:roomId/
- GET/POST /api/v1/chat/rooms/:roomId/messages/

Authentication Model (for now)
- Uses HTTP Basic auth credentials entered on login page.
- Credentials are stored in localStorage and attached as Authorization header.
- This is a temporary integration strategy until backend provides JWT or session flow for SPA.

Setup
1. Copy environment file:
   cp .env.example .env
2. Install dependencies:
   npm install
3. Start development server:
   npm run dev
4. Build production bundle:
   npm run build

Notes for Backend Integration Later
- Add a user directory endpoint so room creation can select participants by username.
- Replace Basic auth with JWT/OAuth and refresh logic.
- Add websocket endpoint to replace polling in room message stream.
