# 🎮 The Pile - Gaming Backlog Tracker

[![Release](https://img.shields.io/github/v/release/lawrab/the-pile?include_prereleases)](https://github.com/lawrab/the-pile/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-purple)](https://claude.ai)

> **An experimental project built entirely with Claude Code** - Exploring AI-assisted development without writing code manually

> *"Your pile of shame is not a bug, it's a feature."* 🎮

## 🧪 Project Experiment

This is a pet project created as an experiment in AI-driven software development. **Every line of code in this repository was generated through conversation with Claude Code**, demonstrating the potential of AI-assisted programming. No code was manually written by a human developer.

### What is The Pile?

A humorous gaming backlog tracker that helps Steam users confront their "pile of shame" - those hundreds of unplayed games purchased during sales. The app transforms backlog guilt into an engaging, therapeutic experience through data visualization, behavioral insights, and satisfying amnesty mechanics.

## 🎮 Core Features

### 🔐 Steam Integration
- **Steam OAuth**: Secure login using Steam OpenID
- **Automatic Library Import**: Fetches all owned games via Steam Web API
- **Real-time Sync**: Updates playtime and game status automatically
- **Privacy Focused**: Only accesses public profile and game library data

### 📊 The Pile Visualization
- **Interactive Dashboard**: Visual preview of your backlog with engaging statistics
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

## 🚀 Performance Highlights

- **6x Faster Imports** - Reduced from ~30 minutes to ~5 minutes for 1000+ games
- **70-90% API Call Reduction** - Smart caching and parallel processing
- **< 200ms Response Times** - Optimized database queries and Redis caching

## 📊 Project Statistics

- **Lines of Code**: ~15,000
- **API Endpoints**: 20+
- **React Components**: 30+
- **Development Time**: Built entirely through AI conversation
- **Human Code Written**: 0 lines

## 🧪 The AI Development Experiment

### Goals
- Test the limits of AI-assisted development
- Build a production-ready application without manual coding
- Explore the developer experience of conversational programming
- Document the process for the community

### Results
- ✅ Fully functional web application
- ✅ Production-ready architecture
- ✅ Professional UI/UX
- ✅ Optimized performance
- ✅ Comprehensive documentation

### Learnings
This project demonstrates that complex, full-stack applications can be built entirely through AI assistance. The key is clear communication, iterative development, and understanding the AI's capabilities.

## 🐛 Known Limitations (Alpha)

- Import process runs in foreground (UI may freeze for very large libraries)
- No background job processing yet
- Limited mobile optimization
- Test coverage incomplete
- Some TypeScript type errors in tests

## 🗺️ Roadmap

### Beta (Next)
- [ ] Background job processing with Celery
- [ ] Enhanced mobile experience
- [ ] Advanced analytics dashboard
- [ ] Social features and sharing

### Future
- [ ] Achievement system
- [ ] Machine learning predictions
- [ ] Multi-platform support (GOG, Epic, etc.)
- [ ] Mobile apps

## 🤝 Contributing

This is an experimental project, but contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Share your experience with AI-assisted development
- Fork and create your own experiments

## 📝 Documentation

- [CHANGELOG.md](CHANGELOG.md) - Detailed release notes
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - Deployment guide
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development workflow
- [PROJECT-OVERVIEW.md](PROJECT-OVERVIEW.md) - Comprehensive project details
- [CLAUDE.md](CLAUDE.md) - AI context document

## 📄 License

MIT License - Feel free to use this code for your own experiments!

## 🙏 Acknowledgments

- **Claude Code** - For being an incredible coding partner
- **Anthropic** - For creating Claude
- **Steam** - For the API and platform
- **The Gaming Community** - For understanding the pile of shame struggle

## 📬 Contact

- GitHub Issues: [Report bugs or request features](https://github.com/lawrab/the-pile/issues)
- Discussions: [Share your thoughts](https://github.com/lawrab/the-pile/discussions)

---

<div align="center">

**Built with 🤖 by Claude Code**

*An experiment in AI-assisted development*

[Report Bug](https://github.com/lawrab/the-pile/issues) | [Request Feature](https://github.com/lawrab/the-pile/issues)

</div>

---

> "Your pile of shame is not a bug, it's a feature" - The Pile Philosophy