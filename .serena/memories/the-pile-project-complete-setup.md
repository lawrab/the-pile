# The Pile - Gaming Backlog Tracker Project

## Project Overview
Complete gaming backlog tracker that helps users confront their unplayed Steam games through humor and behavioral insights. Built with FastAPI backend and Next.js frontend, deployed on Railway.

## Architecture
- **Backend**: FastAPI (Python 3.11+) in `the-pile-api/`
- **Frontend**: Next.js 14 (TypeScript) in `the-pile-web/`
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache**: Redis for Steam API responses
- **Auth**: Steam OpenID Connect with JWT tokens
- **Deployment**: Railway (auto-deploy from git)
- **3D Visualization**: Three.js with React Three Fiber

## Key Features Implemented
1. **Steam OAuth Authentication** - Complete OpenID flow
2. **3D Pile Visualization** - Interactive Three.js rendering of game backlog
3. **Shame Score Algorithm** - Multi-factor scoring system
4. **Reality Check Engine** - Brutal completion statistics
5. **Amnesty System** - Guilt-free game abandonment with animations
6. **Behavioral Insights** - Pattern recognition and recommendations

## Database Schema
```sql
users (id, steam_id, username, avatar_url, shame_score, settings)
games (id, steam_app_id, name, price, genres, tags, metadata)
pile_entries (id, user_id, game_id, status, playtime_minutes, purchase_data, amnesty_data)
pile_snapshots (id, user_id, historical_metrics, created_at)
```

Game Status: unplayed (red), playing (yellow), completed (green), abandoned (gray), amnesty_granted (purple)

## Development Commands
```bash
# Backend setup
cd the-pile-api
./scripts/setup_dev.sh
source venv/bin/activate
python dev.py  # Runs on :8000

# Frontend setup  
cd the-pile-web
./scripts/setup_dev.sh
npm run dev    # Runs on :3000

# Database migrations
cd the-pile-api && alembic upgrade head
```

## Environment Variables
**Backend (.env):**
- DATABASE_URL, REDIS_URL (auto on Railway)
- STEAM_API_KEY (from steamcommunity.com/dev/apikey)
- JWT_SECRET_KEY (secure random string)
- CORS_ORIGINS (JSON array with frontend URL)

**Frontend (.env.local):**
- NEXT_PUBLIC_API_URL (backend URL + /api/v1)

## Railway Deployment
- Both repos deploy separately from same GitHub repo
- Backend: `the-pile-api/` folder with automatic migrations
- Frontend: `the-pile-web/` folder with production build
- Auto-provisioned PostgreSQL and Redis services

## Shame Score Algorithm
```python
shame_score = (
    unplayed_games * 2 +              # Base penalty
    money_wasted * 0.5 +              # Financial waste  
    min(completion_years * 10, 100) + # Time reality check
    zero_playtime_games * 3           # Never-touched bonus
)
```

Rankings: Innocent (0-50), Casual Collector (50-100), Serial Buyer (100-200), Pile Builder (200-400), The Pile Master (400+)

## Steam Integration
- **GetOwnedGames**: Fetch user library
- **GetPlayerSummaries**: User profiles
- **Store API**: Game metadata enrichment
- **Rate Limits**: 100k calls/day, respect 1 req/sec for Store API
- **Caching**: 24hr cache for game metadata, 15min for user data

## Project Files Structure
```
the-pile/
├── README.md              # Main project docs
├── DEPLOYMENT.md          # Railway deployment guide  
├── DEVELOPMENT.md         # Development workflow
├── PROJECT-OVERVIEW.md    # Comprehensive overview
├── CLAUDE.md              # AI assistant context
├── the-pile-api/          # FastAPI backend
│   ├── app/api/v1/       # REST endpoints
│   ├── app/models/       # SQLAlchemy models
│   ├── app/services/     # Business logic
│   ├── alembic/          # Database migrations
│   └── scripts/          # Dev utilities
└── the-pile-web/         # Next.js frontend
    ├── src/app/          # Next.js 14 App Router
    ├── src/components/   # React components
    ├── src/lib/          # Utilities & providers
    └── src/types/        # TypeScript definitions
```

## Design Philosophy
- Dark theme by default (gamer-optimized)
- Humorous but supportive tone
- Mobile-first responsive design
- Confession booth feeling - safe space to confront pile
- Satisfying animations, especially amnesty float-away effect

## Implementation Status
✅ Complete project structure and architecture
✅ All API endpoints defined and implemented
✅ Database models and migrations
✅ Frontend components and 3D visualization
✅ Authentication flow with Steam OAuth
✅ Deployment configurations for Railway
✅ Comprehensive documentation suite
✅ Development workflow and testing setup

## Next Development Phase
Ready for:
1. Local development and testing
2. Steam API key integration
3. Railway deployment
4. Background job implementation (Celery)
5. Advanced analytics features
6. Mobile PWA optimization

## Key Technical Decisions
- Monorepo with separate backend/frontend deployments
- API-first architecture for clean separation
- Steam OpenID for authentication (no passwords)
- PostgreSQL for complex queries and data integrity
- Three.js for engaging 3D pile visualization
- TanStack Query for sophisticated data fetching
- Railway for simple deployment and scaling

This project transforms gaming backlog shame into an engaging, therapeutic experience through humor, data insights, and satisfying closure mechanisms.