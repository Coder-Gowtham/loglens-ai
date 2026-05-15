# LogLens AI

AI-powered log analysis platform that helps developers upload, process, analyze, and monitor application logs using OpenAI-powered insights.

---

# 🚀 Features

## Backend Features
- JWT Authentication
- Role-based protected APIs
- Log CRUD APIs
- PostgreSQL + Prisma ORM
- Redis Caching
- BullMQ Queue Processing
- AI-powered log analysis
- Rate limiting
- Zod validation
- Error handling middleware
- Re-analysis support
- Pagination & filtering

## Frontend Features
- React-based dashboard
- Log listing UI
- AI analysis rendering
- Search & filtering
- Pagination support
- Responsive UI

## Infrastructure
- Dockerized setup
- Deployment-ready architecture
- Environment-based configuration

---

# 🏗️ Tech Stack

## Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- OpenAI API
- JWT Authentication
- Zod

## Frontend
- React
- Axios
- React Router

## DevOps
- Docker
- Docker Compose
- Render / Railway / VPS Deployment

---

# 📁 Project Structure

```bash
loglens-ai/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   ├── utils/
│   │   └── app.js
│   │
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

# ⚙️ Environment Variables

## Backend `.env`

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/loglens
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

# 🔧 Installation

## 1. Clone Repository

```bash
git clone https://github.com/your-username/loglens-ai.git
cd loglens-ai
```

---

## 2. Backend Setup

```bash
cd backend
npm install
```

### Run Prisma Migration

```bash
npx prisma migrate dev
```

### Start Backend

```bash
npm run dev
```

---

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🐳 Docker Setup

## Run Entire Application

```bash
docker-compose up --build
```

---

# 🔐 Authentication APIs

## Register

```http
POST /auth/register
```

### Request Body

```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "password123"
}
```

---

## Login

```http
POST /auth/login
```

### Response

```json
{
  "token": "jwt_token"
}
```

---

# 📄 Log APIs

## Create Log

```http
POST /logs
```

## Get Logs

```http
GET /logs?page=1&limit=10
```

## Filter Logs

```http
GET /logs?status=processed
```

## Re-analyze Log

```http
POST /logs/:id/reanalyze
```

---

# 🤖 AI Processing Flow

```text
User uploads log
      ↓
Log stored in PostgreSQL
      ↓
BullMQ Queue Job Created
      ↓
Worker Processes Log
      ↓
OpenAI Generates Analysis
      ↓
Result Stored in Database
      ↓
Frontend Displays Insights
```

---

# 🧠 Example AI Output

```json
{
  "severity": "HIGH",
  "issue": "Database connection timeout",
  "summary": "Application failed to connect to database",
  "suggestion": "Increase DB timeout and verify network connectivity"
}
```

---

# 📦 Deployment

## Backend Deployment
- Deploy Express backend to Render / Railway / VPS
- Configure PostgreSQL
- Configure Redis
- Add environment variables

## Frontend Deployment
- Deploy React app to Vercel / Netlify
- Configure API base URL

---

# 🛡️ Security Features

- JWT authentication
- Password hashing
- Protected routes
- Request validation
- Rate limiting
- Secure environment variables

---

# 📈 Future Improvements

- Multi-project support
- Team collaboration
- Real-time alerts
- AI anomaly detection
- Log visualization dashboard
- Kubernetes deployment
- CI/CD pipelines
- WebSocket live streaming

---

# 🧪 Testing

## Backend Tests

```bash
npm run test
```

## Frontend Tests

```bash
npm run test
```

---

# 👨‍💻 Author

Gowtham

---

# 📜 License

MIT License

---

# ✅ Day 27 Deliverables

- Professional README
- API Documentation
- Installation Guide
- Deployment Instructions
- Architecture Overview
- Recruiter-Friendly Documentation

---

# 🎯 Resume Project Summary

Built an AI-powered log analysis platform using Node.js, Express, PostgreSQL, Prisma, Redis, BullMQ, OpenAI, and React. Implemented authentication, async queue processing, AI-driven issue detection, caching, filtering, pagination, Dockerization, and deployment-ready infrastructure.

