# VedaAI – AI Assessment Creator

Full-stack application for teachers to create assignments and generate structured question papers using AI, with real-time job updates via WebSockets.

## Architecture

```
┌─────────────┐     REST API      ┌──────────────────┐
│  Next.js    │◄─────────────────►│  Express (TS)    │
│  Frontend   │                   │  API Server      │
│  Zustand    │     WebSocket     └────────┬─────────┘
└─────────────┘◄──────────────────────────┤
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
              ┌──────────┐         ┌──────────┐         ┌──────────────┐
              │ MongoDB  │         │  Redis   │         │   BullMQ     │
              │ Assign-  │         │  Cache   │         │   Worker     │
              │ ments    │         │          │         │ + OpenRouter │
              └──────────┘         └──────────┘         └──────────────┘
```

### Flow

1. Teacher fills the **Create Assignment** form (file upload optional, due date, question types, marks).
2. Frontend POSTs to `/api/assignments` → document saved in MongoDB.
3. A **BullMQ** job is enqueued for AI generation.
4. Worker builds a structured prompt, calls **OpenRouter** (`openrouter/free` + fallbacks), parses JSON (never raw LLM text on UI).
5. Result stored in MongoDB; Redis caches completed papers (1 hour).
6. **Socket.IO** emits `assignment:update` to the client room `assignment:{id}`.
7. **Output page** renders sections, difficulty badges, student info lines, and answer key.
8. **PDF download** via `/api/assignments/:id/pdf` (server-side PDFKit).

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 15, TypeScript, Tailwind, Zustand, Socket.IO Client |
| Backend  | Node.js, Express 5, TypeScript      |
| Database | MongoDB (Mongoose)                  |
| Cache    | Redis (ioredis)                     |
| Queue    | BullMQ                              |
| Realtime | Socket.IO                           |
| AI       | OpenRouter (free models only)       |

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis running locally (`redis-server` or Docker)
- OpenRouter API key from [OpenRouter Keys](https://openrouter.ai/keys) (free tier available)

## Setup

### 1. Redis

```bash
# Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally and start the service
```

### 2. Backend

```bash
cd Backend
cp .env.example .env
# Edit .env with MONGODB_URI, OPENROUTER_API_KEY, etc.

npm install
npm run dev
```

Server runs at **http://localhost:8000**

### 3. Frontend

```bash
cd Frontend
cp .env.local.example .env.local

npm install
npm run dev
```

App runs at **http://localhost:3000**

## Environment Variables

### Backend (`Backend/.env`)

| Variable       | Description                    |
|----------------|--------------------------------|
| MONGODB_URI    | MongoDB connection string      |
| PORT           | API port (default 8000)        |
| REDIS_HOST     | Redis host                     |
| REDIS_PORT     | Redis port                     |
| OPENROUTER_API_KEY | OpenRouter API key (free tier) |
| OPENROUTER_MODEL   | Optional — override free model |
| CORS_ORIGIN    | Frontend URL(s), comma-separated |

### Frontend (`Frontend/.env.local`)

| Variable              | Description        |
|-----------------------|--------------------|
| NEXT_PUBLIC_API_URL   | Backend REST URL   |
| NEXT_PUBLIC_WS_URL    | Socket.IO URL      |

## API Endpoints

| Method | Path                           | Description              |
|--------|--------------------------------|--------------------------|
| GET    | `/api/assignments`             | List assignments         |
| GET    | `/api/assignments/:id`         | Get assignment + paper   |
| POST   | `/api/assignments`             | Create & queue generation|
| DELETE | `/api/assignments/:id`         | Delete assignment        |
| POST   | `/api/assignments/:id/regenerate`| Regenerate paper       |
| GET    | `/api/assignments/:id/pdf`     | Download PDF             |
| POST   | `/api/assignments/upload`      | Upload reference file    |

### WebSocket Events

- Client → `assignment:join` (assignmentId)
- Server → `assignment:update` `{ status, progress, generatedPaper, error }`

## Features Implemented

- Assignment list (empty state + grid with search/filter UI)
- Multi-field create form with validation (no empty/negative values)
- Zustand state for form
- Dynamic question type rows (desktop table + mobile cards)
- AI generation with structured JSON parsing
- Real-time progress via WebSocket
- Structured output page (exam paper layout)
- Difficulty badges (Easy / Moderate / Challenging)
- Regenerate action
- PDF export (formatted, not raw HTML print)
- Redis caching for generated papers

## Deployment

**Backend:** Deploy to Railway, Render, or Fly.io with MongoDB Atlas + Redis Cloud.

**Frontend:** Deploy to Vercel; set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to your backend URL.

Ensure `CORS_ORIGIN` includes your frontend domain.

## Project Structure

```
Veda-ai-assignment/
├── Backend/
│   └── src/
│       ├── config/       # DB, Redis, OpenRouter
│       ├── controllers/
│       ├── models/
│       ├── queue/
│       ├── routes/
│       ├── services/     # AI, prompt, PDF
│       ├── sockets/
│       └── workers/
└── Frontend/
    └── src/
        ├── app/          # Pages (assignments, create, output)
        ├── components/
        ├── hooks/        # WebSocket
        ├── lib/          # API client
        └── store/        # Zustand
```

## License

MIT – built for VedaAI engineering assignment.
