# Betodemy Auth App

A full-stack mobile-first authentication system for a Japanese learning platform, built with NestJS and React.

![Login Page](docs/login.png)

## Tech Stack

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Router** - Routing

## Features

- 🔐 User registration and login
- 🎫 JWT-based authentication
- 👤 User profile management
- 📷 Avatar upload
- 🌙 Dark/Light mode toggle
- 📱 Mobile-first responsive design
- ✨ Modern UI with smooth animations

## Project Structure

```
├── backend/                 # NestJS API
│   ├── prisma/             # Database schema
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── user/           # User module
│   │   └── prisma/         # Prisma service
│   └── uploads/            # Avatar uploads
│
├── frontend/               # React app
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── context/        # React contexts
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── types/          # TypeScript types
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

Make sure PostgreSQL is running, then:

```bash
# Create a database
psql -U postgres
CREATE DATABASE betodemy_login_dev;
\q
```

### 3. Environment Configuration

**Backend** - Create `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5433/betodemy_login_dev?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
```

**Frontend** - Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Run Database Migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Applications

**Terminal 1 - Backend:**

```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### 6. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/users/me` | Get current user | Yes |
| POST | `/users/avatar` | Upload avatar | Yes |

### Register Request

```json
POST /auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login Request

```json
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "avatarUrl": null,
    "joinedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Database Schema

```prisma
model User {
  id           String   @id @default(uuid())
  fullName     String
  email        String   @unique
  passwordHash String
  avatarUrl    String?
  joinedAt     DateTime @default(now())
}
```

## Development

### Prisma Studio

View and edit database records:

```bash
cd backend
npx prisma studio
```

### Build for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## License

MIT

In VS Code/Cursor:
Press Ctrl+Shift+P
Type "TypeScript: Restart TS Server"
Press Enter
