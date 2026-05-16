# Interview System

<!-- ADD SCREENSHOT HERE -->
<!-- ![Demo](path/to/screenshot.png) -->

An AI-powered technical interview platform where admins schedule interviews and an AI avatar conducts live sessions with candidates — asking contextual questions, listening to answers, and scoring responses in real time.

---

## How It Works

1. **Admin** logs in and creates an interview session — sets candidate name, topic, date/time, and a one-time password.
2. **Candidate** joins using their interview ID and the password.
3. The **AI interviewer** (GPT-3.5-turbo) generates context-aware questions based on the topic, maintaining a natural conversation flow across the entire session.
4. Each answer is **evaluated in real time** — scored 0–100 with written feedback, stored per question.
5. The AI interviewer speaks through an **AI avatar** (HeyGen) with **text-to-speech** (ElevenLabs).
6. All session data — questions asked, candidate responses, scores, feedback — is saved to MongoDB for the admin to review post-session.

---

## Features

- AI-generated interview questions dynamically adapted to topic and conversation history
- Per-answer scoring (0–100) and constructive feedback via OpenAI JSON mode
- AI video avatar interviewer via HeyGen
- Text-to-speech audio via ElevenLabs
- Real-time communication over WebSockets
- JWT-based authentication with two roles: `admin` and `candidate`
- Admin dashboard to create sessions, view all interviews, and inspect full session transcripts
- Interview status tracking: `scheduled` → `in-progress` → `completed`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Real-time | WebSockets (`ws`) |
| Database | MongoDB (Mongoose) |
| Frontend | React 18, Tailwind CSS, lucide-react |
| AI / LLM | OpenAI GPT-3.5-turbo |
| AI Avatar | HeyGen |
| Text-to-Speech | ElevenLabs |
| Auth | JWT (`jsonwebtoken`) |

---

## Project Structure

```
interview-system/
├── backend/
│   └── src/
│       ├── controllers/
│       │   ├── adminController.js      # List interviews, get by ID, create admin user
│       │   ├── authController.js       # Login for admin and candidate roles
│       │   └── interviewController.js  # Candidate session access and validation
│       ├── models/
│       │   ├── Interview.js            # Session schema: topic, questions, answers, scores
│       │   └── AdminUser.js            # Admin credentials schema
│       ├── routes/
│       │   ├── admin.js                # /api/admin/*
│       │   ├── auth.js                 # /api/auth/*
│       │   └── interview.js            # /api/interview/*
│       ├── services/
│       │   ├── openaiService.js        # Question generation + answer evaluation
│       │   ├── heygenService.js        # AI avatar video generation
│       │   ├── elevenlabsService.js    # Text-to-speech audio generation
│       │   ├── mongoService.js         # DB read/write helpers
│       │   └── teamsService.js         # Microsoft Teams integration
│       ├── websockets/
│       │   └── interviewSocket.js      # Real-time interview session handler
│       └── app.js                      # Express + WebSocket server entry point
└── frontend/
    └── src/
        ├── components/
        │   ├── Admin/
        │   │   ├── AdminDashboard.js       # Main admin view
        │   │   ├── InterviewList.js        # Table of all sessions
        │   │   └── InterviewDetailsModal.js # Full session transcript + scores
        │   ├── Auth/                       # Login pages for admin and candidate
        │   ├── AvatarDisplay.js            # Renders HeyGen avatar video
        │   ├── InterviewRoom.js            # Main candidate interview UI
        │   ├── QuestionDisplay.js          # Shows current AI question
        │   └── ResponseInput.js            # Candidate answer input
        ├── services/                       # API and WebSocket client helpers
        └── utils/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- API keys for: OpenAI, HeyGen, ElevenLabs

### Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

OPENAI_API_KEY=your_openai_api_key
HEYGEN_API_KEY=your_heygen_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

PORT=5000
```

```bash
npm run dev       # development (nodemon)
npm start         # production
```

Server runs on `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000`. All `/api/*` requests proxy to port 5000.

---

## API Reference

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | All | Login — returns JWT |
| GET | `/api/interview/:id` | Candidate | Get own session details |
| GET | `/api/admin/interviews` | Admin | List all interview sessions |
| GET | `/api/admin/interviews/:id` | Admin | Get single session details |
| POST | `/api/admin/users` | Admin | Create admin user |
| `WS` | `ws://localhost:5000` | All | Live interview socket |