# FinanceBro Backend

A production-ready Node.js + Express backend for the FinanceBro MVP - a gamified financial education platform that helps users learn fundamental analysis through lessons, examples, and practice simulations.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Lessons Management**: Complete lesson system with progress tracking
- **Progress Tracking**: User progress, XP, coins, and streak management
- **Practice Sessions**: Gamified practice scenarios with feedback
- **AI Integration Ready**: Placeholder endpoints for Python FastAPI + Gemini integration
- **Production Ready**: Security, rate limiting, error handling, and monitoring

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Custom validation middleware
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Supabase configuration
│   │   └── environment.js       # Environment variables
│   ├── controllers/
│   │   ├── userController.js    # User authentication & profile
│   │   ├── lessonController.js  # Lesson management
│   │   ├── progressController.js # Progress tracking
│   │   ├── practiceController.js # Practice sessions
│   │   └── aiController.js      # AI integration placeholders
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   ├── validation.js       # Input validation
│   │   ├── errorHandler.js     # Error handling
│   │   ├── cors.js            # CORS configuration
│   │   └── security.js        # Security middleware
│   ├── routes/
│   │   ├── userRoutes.js       # User endpoints
│   │   ├── lessonRoutes.js     # Lesson endpoints
│   │   ├── progressRoutes.js   # Progress endpoints
│   │   ├── practiceRoutes.js   # Practice endpoints
│   │   └── aiRoutes.js         # AI endpoints
│   ├── utils/
│   │   ├── password.js         # Password utilities
│   │   └── response.js         # Response formatting
│   └── server.js              # Main server file
├── database/
│   ├── schema.sql             # Database schema
│   └── seed.sql              # Sample data
├── package.json
├── env.example               # Environment variables template
└── README.md
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install

# Copy environment variables
cp env.example .env
```

### 3. Environment Setup

Edit `.env` file with your configuration:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:8080
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy and paste the contents of database/schema.sql
```

3. (Optional) Seed with sample data:

```sql
-- Copy and paste the contents of database/seed.sql
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3001`

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (auth required)
- `PUT /api/users/profile` - Update user profile (auth required)
- `PUT /api/users/stats` - Update user stats (auth required)

#### Lessons
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:id` - Get specific lesson
- `GET /api/lessons/categories` - Get lesson categories
- `POST /api/lessons/unlock` - Unlock next lesson (auth required)

#### Progress
- `GET /api/progress` - Get user progress (auth required)
- `GET /api/progress/stats` - Get progress statistics (auth required)
- `PUT /api/progress` - Update lesson progress (auth required)
- `DELETE /api/progress` - Reset progress (auth required)

#### Practice
- `GET /api/practice` - Get practice sessions (auth required)
- `GET /api/practice/stats` - Get practice statistics (auth required)
- `POST /api/practice` - Create practice session (auth required)
- `PUT /api/practice/:id` - Update practice session (auth required)
- `DELETE /api/practice/:id` - Delete practice session (auth required)

#### AI Integration (Placeholders)
- `GET /api/ai/test` - Test AI service integration
- `GET /api/ai/health` - Get AI service health
- `POST /api/ai/feedback` - Generate feedback (auth required)
- `POST /api/ai/scenarios` - Generate scenarios (auth required)
- `GET /api/ai/analysis` - Analyze learning patterns (auth required)

### Example Requests

#### Register User
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

#### Get Lessons
```bash
curl -X GET http://localhost:3001/api/lessons \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🔧 Development

### Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests (not implemented yet)
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_KEY` | Supabase anon key | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | No | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 7d |
| `PORT` | Server port | No | 3001 |
| `NODE_ENV` | Environment | No | development |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:8080 |

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **JWT**: Secure authentication
- **bcrypt**: Password hashing
- **Input Validation**: Request validation
- **Error Handling**: Secure error responses

## 🤖 AI Integration

The backend includes placeholder endpoints for future AI integration with a Python FastAPI + Gemini microservice:

- `/api/ai/test` - Test connectivity
- `/api/ai/feedback` - Generate personalized feedback
- `/api/ai/scenarios` - Generate practice scenarios
- `/api/ai/analysis` - Analyze learning patterns

These endpoints return mock data and are ready for integration with the Python service.

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production `FRONTEND_URL`
4. Set up proper Supabase RLS policies
5. Configure reverse proxy (nginx)
6. Set up SSL certificates
7. Configure monitoring and logging

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Database Schema

### Tables

- **users**: User accounts and stats
- **lessons**: Lesson content and metadata
- **progress**: User lesson progress
- **practice**: Practice session tracking
- **achievements**: User achievements/badges

### Key Features

- UUID primary keys
- Row Level Security (RLS)
- Automatic timestamps
- Foreign key constraints
- Indexes for performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the health check at `/health`

---

**FinanceBro Backend** - Built with ❤️ for financial education
