# Team Task Manager

A full-stack **Team Task Manager** built with a modern, production-grade stack — featuring JWT auth, role-based access, Kanban boards, real-time dashboard analytics, and a dark glassmorphism UI.

---

## 🔗 Live Demo

🔗** Live URL**: [positive-expression-production-282b.up.railway.app](positive-expression-production-282b.up.railway.app)


---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── project.controller.ts
│   │   │   └── task.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── project.routes.ts
│   │   │   └── task.routes.ts
│   │   ├── schemas/
│   │   │   ├── auth.schema.ts
│   │   │   ├── project.schema.ts
│   │   │   └── task.schema.ts
│   │   ├── utils/
│   │   │   └── jwt.ts
│   │   └── index.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   ├── auth.ts
    │   │   ├── projects.ts
    │   │   └── tasks.ts
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── LoginForm.tsx
    │   │   │   └── SignupForm.tsx
    │   │   ├── dashboard/
    │   │   │   ├── StatsCard.tsx
    │   │   │   └── StatusChart.tsx
    │   │   ├── kanban/
    │   │   │   ├── KanbanBoard.tsx
    │   │   │   ├── KanbanColumn.tsx
    │   │   │   └── TaskCard.tsx
    │   │   ├── projects/
    │   │   │   ├── ProjectCard.tsx
    │   │   │   └── ProjectForm.tsx
    │   │   ├── tasks/
    │   │   │   ├── TaskDetailPanel.tsx
    │   │   │   ├── TaskFilters.tsx
    │   │   │   └── TaskForm.tsx
    │   │   └── ui/
    │   │       ├── Button.tsx
    │   │       ├── Input.tsx
    │   │       ├── Modal.tsx
    │   │       ├── Skeleton.tsx
    │   │       └── EmptyState.tsx
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   ├── useProjects.ts
    │   │   └── useTasks.ts
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   ├── Login.tsx
    │   │   ├── Projects.tsx
    │   │   ├── Signup.tsx
    │   │   └── Tasks.tsx
    │   ├── store/
    │   │   └── authStore.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── .env
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🧪 Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin123!` |
| Member | `member@example.com` | `Member123!` |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Frontend | React 18, TypeScript, Vite |
| UI | TailwindCSS, Framer Motion, Lucide React, Recharts |
| Data | Axios, React Query, Zustand |
| Forms | React Hook Form, Zod |

---

## ✨ Features

- JWT signup, login, and current-user session flow
- Server-side role checks for project admins, project members, and task assignees
- Project create, read, update, delete
- Project member add and remove
- Task create, read, update, delete
- Task filters by status, priority, and assignee
- Dashboard stats and status chart from real API data
- Overdue detection for tasks where `dueDate < now` and status is not `DONE`
- Kanban task board and task detail side panel
- Empty states, skeleton loading states, and responsive layout
- Dark-first glassmorphism UI with Framer Motion animations

---

## 🚀 Run Locally

### 1. Install Dependencies

```bash
cd backend
npm install
npm run prisma:generate
```

```bash
cd ../frontend
npm install
```

### 2. Apply Database Schema & Seed Data

```bash
cd ../backend
npx prisma migrate dev --name init
npm run seed
```

### 3. Start Backend

```bash
cd backend
npm run dev
```

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

> **Windows permission issues?** Use the production-style local run:

```bash
cd backend
npm run build
node dist/index.js
```

```bash
cd frontend
npm run build
npx serve dist -l 5173
```

### Local URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:4000` |
| Health Check | `http://localhost:4000/health` |

---

## 🌍 Environment Variables

**`backend/.env`**

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="change-this-secret"
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:4000
```

---

## 📡 API Response Format

**Success:**

```json
{ "success": true, "data": {} }
```

**Error:**

```json
{ "success": false, "message": "Readable error", "errors": [] }
```

**Protected routes require:**

```http
Authorization: Bearer <token>
```

---

## ☁️ Railway Deployment

**Backend environment variables:**

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV=production`
- `FRONTEND_URL`

**Backend start script:**

```bash
prisma migrate deploy && node dist/index.js
```

**Frontend:**

- Set `VITE_API_URL` to the deployed backend URL.
- Build with `npm run build`.
- Serve the generated `dist` directory with Railway static hosting or `serve`.
````
