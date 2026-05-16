# Interview System

AI-powered technical interview platform with real-time communication between interviewers and candidates.

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB (Mongoose)
- WebSockets (`ws`)
- JWT authentication

**Frontend**
- React 18
- Tailwind CSS
- lucide-react

## Project Structure

```
interview-system/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── websockets/
└── frontend/
    └── src/
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000` — proxies API calls to port 5000.

## Environment Variables

Create a `.env` file in `backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```