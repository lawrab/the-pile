# The Pile - Gaming Backlog Tracker

> *"Your pile of shame is not a bug, it's a feature."* 🎮

A humorous gaming backlog tracker that helps users confront their unplayed Steam games through visualization and behavioral insights. Built with **FastAPI** and **Next.js**, deployed on **Railway**.

## 🎮 Core Features

### 🔐 Steam Integration
- **Steam OAuth**: Secure login using Steam OpenID
- **Automatic Library Import**: Fetches all owned games via Steam Web API
- **Real-time Sync**: Updates playtime and game status automatically
- **Privacy Focused**: Only accesses public profile and game library data

### 📊 The Pile Visualization
- **3D Interactive Pile**: See your backlog as a towering mountain of shame using Three.js
- **Color-coded Status**: 
  - 🔴 Red = Unplayed (pure shame)
  - 🟡 Yellow = Currently playing
  - 🟢 Green = Completed
  - ⚫ Gray = Abandoned
  - 🟣 Purple = Amnesty granted

### 🎯 Reality Check Dashboard
- **Brutal Statistics**: "You'll finish your backlog in 47 years at current pace"
- **Money Wasted**: Total spent on unplayed games
- **Completion Metrics**: Years to finish, most expensive unplayed, oldest neglected
- **Live Updates**: Refreshes as you play or grant amnesty

### 🏆 Shame Score System
- **Gamified Metrics**: Points for unplayed games, money wasted, completion time
- **Humorous Rankings**: From "Innocent" to "The Pile Master"
- **Score Breakdown**: Detailed point allocation across categories
- **Historical Tracking**: Watch your shame evolve over time

### 🕊️ Amnesty Mode
- **Guilt-free Abandonment**: Officially give up on games you'll never play
- **Satisfying Animations**: Watch games float away with Framer Motion
- **Amnesty Reasons**: Document why you're letting go
- **Cemetery View**: Memorial for all amnesty-granted games

### 🧠 Behavioral Insights
- **Pattern Recognition**: "You buy RPGs but only play shooters"
- **Genre Analysis**: Compare what you buy vs. what you actually play
- **Buying Triggers**: Identify your weakness (Steam sales, free games, etc.)
- **Personalized Recommendations**: Actionable advice to break the cycle

### 📤 Social Sharing
- **Shareable Statistics**: Generate images of your pile metrics
- **Anonymous Sharing**: Share the shame without revealing your identity
- **Fun Facts Generation**: Humorous observations about your habits

## 🏗️ Architecture

This project consists of two separate applications:

### Backend (`the-pile-api/`)
- **FastAPI** with Python 3.11+
- **PostgreSQL** with SQLAlchemy ORM
- **Redis** for caching
- **Steam Web API** integration
- **JWT** authentication
- **Alembic** for database migrations

### Frontend (`the-pile-web/`)  
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **TanStack Query** for data fetching
- **Tailwind CSS** + **shadcn/ui** for styling
- **Three.js** for 3D pile visualization
- **Framer Motion** for animations

## 🚀 Quick Start Guide

### 📋 Prerequisites

**Required Software:**
- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 14+** (local or cloud)
- **Redis 6+** (local or cloud)
- **Git** for version control

**Required Accounts:**
- **Steam Account** (for testing)
- **Steam API Key** from [Steam Dev Portal](https://steamcommunity.com/dev/apikey)
- **Railway Account** (for deployment) - optional

**Development Tools (Recommended):**
- **VS Code** with Python and TypeScript extensions
- **Postman** or similar for API testing
- **pgAdmin** or similar for database management

### 🔧 Step-by-Step Setup

#### 1. Clone and Setup Backend

```bash
# Clone the repository
git clone <your-repo-url>
cd the-pile

# Setup API backend
cd the-pile-api
./scripts/setup_dev.sh

# Configure environment
cp .env.example .env
# Edit .env with your actual values:
# - DATABASE_URL (PostgreSQL connection string)
# - REDIS_URL (Redis connection string)
# - STEAM_API_KEY (from Steam Dev Portal)
# - JWT_SECRET_KEY (generate a secure key)

# Start development server
source venv/bin/activate
python dev.py
```

**Backend URLs:**
- API Server: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

#### 2. Setup Frontend

```bash
# In a new terminal window
cd the-pile-web
./scripts/setup_dev.sh

# Configure environment
cp .env.local.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

**Frontend URLs:**
- Web App: `http://localhost:3000`
- Next.js build info: `http://localhost:3000/_next/static/`

#### 3. Verify Setup

1. **Backend Health**: Visit `http://localhost:8000/health`
2. **Database**: Check migrations ran successfully
3. **Frontend**: Visit `http://localhost:3000` - should show landing page
4. **Steam Auth**: Try logging in with Steam (requires Steam API key)

## 🗄️ Database Schema

### Key Models:
- **User**: Steam ID, username, shame score, settings
- **Game**: Steam app ID, name, price, genres, metadata  
- **PileEntry**: User's relationship with game (status, playtime, purchase date)
- **PileSnapshot**: Historical pile tracking and analytics

### Game Statuses:
- `unplayed` - Never touched (red shame)
- `playing` - Currently being played  
- `completed` - Finished successfully
- `abandoned` - Started but gave up
- `amnesty_granted` - Officially forgiven

## 🌐 API Endpoints

### Authentication
- `GET /api/v1/auth/steam/login` - Initiate Steam OAuth
- `GET /api/v1/auth/steam/callback` - Steam callback handler
- `GET /api/v1/auth/me` - Get current user

### Pile Management
- `GET /api/v1/pile` - Get user's pile with filtering
- `POST /api/v1/pile/import` - Import Steam library  
- `POST /api/v1/pile/sync` - Sync playtime data
- `POST /api/v1/pile/amnesty/{game_id}` - Grant amnesty

### Statistics  
- `GET /api/v1/stats/reality-check` - Brutal completion statistics
- `GET /api/v1/stats/shame-score` - Gamified shame metrics
- `GET /api/v1/stats/insights` - Behavioral pattern analysis

### Sharing
- `POST /api/v1/share/create` - Create shareable stats image
- `GET /api/v1/share/{id}` - Get shared statistics

## 🚢 Railway Deployment  

Both applications are configured for Railway deployment with automatic builds and migrations.

### Backend Environment Variables:
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...  
STEAM_API_KEY=your_steam_api_key
JWT_SECRET_KEY=your_jwt_secret
CORS_ORIGINS=["https://your-frontend-url.com"]
```

### Frontend Environment Variables:
```bash
NEXT_PUBLIC_API_URL=https://your-api-url.com/api/v1
```

## 📊 Key Features Explained

### Shame Score Algorithm
Points are awarded for:
- Unplayed games (2 points each)
- Money wasted (0.5 points per dollar)
- Completion time (10 points per year)  
- Never-played games (3 bonus points)

### Reality Check Metrics
- **Completion Years**: Based on 2 hours/week gaming
- **Money Wasted**: Sum of unplayed game prices
- **Oldest Unplayed**: Your most neglected purchase
- **Most Expensive Unplayed**: Your costliest shame

### Behavioral Insights
- Genre buying vs playing patterns
- Completion rate analysis  
- Neglected category identification
- Personalized recommendations

## 🎨 Design Philosophy

- **Dark theme by default** (gamers prefer it)
- **Humorous but not insulting** tone
- **Confession booth feeling** - safe space to confront the pile
- **Satisfying animations** for amnesty (games float away)
- **Mobile-responsive** design throughout

## 🧪 Development Workflow

### Daily Development Commands

```bash
# Start both services (run in separate terminals)
cd the-pile-api && source venv/bin/activate && python dev.py
cd the-pile-web && npm run dev

# Watch for changes
cd the-pile-api && python dev.py  # Auto-reloads on file changes
cd the-pile-web && npm run dev     # Hot reloads on file changes
```

### Database Management

```bash
# Create new migration
cd the-pile-api
alembic revision --autogenerate -m "Add new feature"

# Apply migrations
alembic upgrade head

# Check migration status  
alembic current

# Rollback migration
alembic downgrade -1
```

### Code Quality & Testing

```bash
# Backend code quality
cd the-pile-api
black . && isort . && flake8    # Format and lint
pytest                          # Run tests
pytest --cov                    # Run with coverage

# Frontend code quality  
cd the-pile-web
npm run lint                    # ESLint check
npm run type-check              # TypeScript check
npm test                        # Run tests
npm run build                   # Production build test
```

### 🐛 Troubleshooting

#### Backend Issues

**Database Connection Errors:**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify database exists
psql -h localhost -U postgres -l | grep thepile

# Reset database (destructive!)
dropdb thepile_dev && createdb thepile_dev
alembic upgrade head
```

**Redis Connection Errors:**
```bash
# Check Redis is running
redis-cli ping  # Should return "PONG"

# Start Redis locally
redis-server
```

**Steam API Issues:**
- Verify Steam API key is valid at [Steam Dev Portal](https://steamcommunity.com/dev/apikey)
- Check rate limiting (Steam API has limits)
- Ensure CORS origins include your frontend URL

#### Frontend Issues

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next node_modules
npm install
npm run build
```

**API Connection Issues:**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser network tab for CORS errors
- Ensure backend is running on correct port

**Authentication Issues:**
- Check Steam login flow in browser network tab
- Verify JWT token in localStorage
- Check Steam API key configuration in backend

#### Common Development Pitfalls

1. **Environment Variables**: Always restart servers after changing .env files
2. **Database Schema**: Run migrations after model changes
3. **CORS Issues**: Update CORS_ORIGINS in backend .env for frontend URL
4. **Steam API Limits**: Implement caching to avoid rate limits
5. **Port Conflicts**: Backend (8000), Frontend (3000), PostgreSQL (5432), Redis (6379)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Steam Web API** for game data
- **Railway** for deployment platform  
- Gaming community for inspiration about backlogs
- Everyone who has ever bought a game on sale and never played it

---

*"Your pile of shame is not a bug, it's a feature."* 🎮