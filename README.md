<div align="center">

# Face Recognition Web

**Admin dashboard for a real-time face-recognition attendance system**

[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=flat&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pinia](https://img.shields.io/badge/State-Pinia-FFD859?style=flat&logo=vuedotjs)](https://pinia.vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)

</div>

---

## Overview

`face-recognition-web` is the management dashboard for the attendance system. Admins and supervisors sign in with a JWT-protected login, manage employees and cameras, and review attendance history — all backed by [`face-recognition-api`](https://github.com/Putthakun/face-recognition-api).

```
Browser (Vue 3 SPA) ──JWT──▶ face-recognition-api ──▶ SQL Server / Redis
```

---

## Features

- **JWT authentication** — login view, token stored client-side, route guards redirect unauthenticated users to login
- **Employee management** — create, edit, and delete employees, including photo upload for face enrollment with inline error handling if no face is detected
- **Camera management** — full CRUD for registered cameras (create, edit location, delete)
- **Attendance history** — paginated, sortable view of recognition transactions
- **Role-aware navigation** — navbar and routes reflect the authenticated user's role (Admin / Supervisor / Employee)
- **Toast notifications** — lightweight composable for success/error/warning feedback
- **Dockerized** — multi-stage build serving a static production bundle via nginx with SPA fallback routing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) + TypeScript |
| Build tool | Vite |
| State management | Pinia |
| Routing | vue-router (with auth guards) |
| HTTP client | Axios |
| Container | Docker (multi-stage `node:22-alpine` → `nginx:alpine`) |

---

## Project Structure

```
src/
├── views/
│   ├── LoginView.vue            # JWT login form
│   ├── EmployeeView.vue         # Employee CRUD + photo upload
│   ├── CameraManageView.vue     # Camera CRUD
│   ├── CameraView.vue           # Live camera stream view
│   └── TransactionView.vue      # Attendance history (paginated)
├── stores/
│   ├── authStore.ts             # JWT/session state
│   └── recognitionStore.ts      # Recognition/transaction state
├── components/
│   └── AppNavbar.vue            # Role-aware navigation
├── composables/
│   └── useToast.ts              # Toast notification helper
├── services/
│   └── streamApi.ts             # Camera stream API client
└── router/
    └── index.ts                 # Routes + auth guards
```

---

## Routes

| Path | View | Auth |
|---|---|---|
| `/login` | `LoginView` | Public |
| `/camera` | `CameraView` | Required |
| `/employee` | `EmployeeView` | Required |
| `/cameras` | `CameraManageView` | Required |
| `/transactions` | `TransactionView` | Required |

The router redirects unauthenticated users to `/login` (preserving the intended destination) and redirects authenticated users away from `/login`.

---

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- A running [`face-recognition-api`](https://github.com/Putthakun/face-recognition-api) instance

### Configuration

Set the API base URL via an environment variable (e.g. `VITE_API_BASE_URL`) consumed by the Axios client, and ensure the API's `AllowedOrigins` CORS config includes this app's origin.

### Run locally

```bash
npm install
npm run dev
```

### Build for production

```bash
npm run build
```

### Lint & format

```bash
npm run lint
npm run format
```

### Run with Docker

```bash
docker build -t face-recognition-web .
docker run -p 8080:80 face-recognition-web
```

---

## Related Services

This app is part of a larger system. See [`real-time-face-recognition-attendance-system`](https://github.com/Putthakun/real-time-face-recognition-attendance-system) for the full architecture overview.

| Repo | Role |
|---|---|
| [`face-recognition-api`](https://github.com/Putthakun/face-recognition-api) | System of record — employees, cameras, transactions, auth |
| [`face-recognition-edge`](https://github.com/Putthakun/face-recognition-edge) | Captures video, detects faces (YOLOv8), publishes crops to RabbitMQ |
| [`face-recognition-server`](https://github.com/Putthakun/face-recognition-server) | Matches faces (InsightFace), records transactions |
| [`face-recognition-infra`](https://github.com/Putthakun/face-recognition-infrastructure) | Shared SQL Server, Redis, RabbitMQ via Docker Compose |
