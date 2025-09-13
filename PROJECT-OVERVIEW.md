# The Pile - Complete Project Overview

**Gaming Backlog Tracker with Humor and Behavioral Insights**

This document provides a comprehensive overview of The Pile project architecture, setup, and configuration for future reference and development.

## 🎯 Project Mission

Transform the shame of gaming backlogs into an engaging, humorous experience that helps users understand their buying patterns and make peace with their pile through data-driven insights and satisfying amnesty mechanics.

## 🏗️ Complete Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Landing Page] --> B[Steam Login]
        B --> C[Pile Dashboard]
        C --> D[3D Visualization]
        C --> E[Statistics]
        C --> F[Cemetery]
        
        G[Auth Provider] --> H[API Client]
        H --> I[TanStack Query]
    end
    
    subgraph "Backend (FastAPI)"
        J[Auth Endpoints] --> K[Steam OpenID]
        L[Pile Endpoints] --> M[Steam Web API]
        N[Stats Engine] --> O[Shame Algorithm]
        P[Background Jobs] --> Q[Library Sync]
    end
    
    subgraph "Database Layer"
        R[PostgreSQL]
        S[Redis Cache]
        T[Alembic Migrations]
    end
    
    subgraph "External Services"
        U[Steam Web API]
        V[Steam Store API]
        W[Railway Hosting]
    end
    
    H --> J
    M --> U
    M --> V
    N --> R
    Q --> S
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style O fill:#fff3e0
    style R fill:#e8f5e8
```

## 📁 Complete File Structure

```
the-pile/
├── 📄 README.md                    # Main project documentation
├── 📄 DEPLOYMENT.md               # Railway deployment guide
├── 📄 DEVELOPMENT.md              # Development workflow guide
├── 📄 PROJECT-OVERVIEW.md         # This comprehensive overview
├── 
├── 🗂️ the-pile-api/               # FastAPI Backend
│   ├── 📁 app/
│   │   ├── 📁 api/v1/             # REST API endpoints
│   │   │   ├── auth.py           # Steam OAuth & JWT management
│   │   │   ├── pile.py           # Game pile CRUD operations  
│   │   │   ├── stats.py          # Analytics & reality checks
│   │   │   └── share.py          # Social sharing features
│   │   ├── 📁 models/            # SQLAlchemy database models
│   │   │   ├── user.py           # User profiles & settings
│   │   │   ├── game.py           # Game metadata & Steam data
│   │   │   ├── pile_entry.py     # User-game relationships
│   │   │   └── pile_snapshot.py  # Historical tracking
│   │   ├── 📁 services/          # Business logic layer
│   │   │   ├── steam_auth.py     # Steam OpenID implementation
│   │   │   ├── user_service.py   # User management
│   │   │   ├── pile_service.py   # Pile operations & Steam sync
│   │   │   ├── stats_service.py  # Shame score & analytics
│   │   │   └── share_service.py  # Statistics sharing
│   │   ├── 📁 schemas/           # Pydantic request/response models
│   │   ├── 📁 core/              # Configuration & security
│   │   └── 📁 db/                # Database connection & utilities
│   ├── 📁 alembic/               # Database migrations
│   │   ├── versions/             # Migration files
│   │   └── env.py               # Migration environment
│   ├── 📁 scripts/              # Development utilities
│   ├── 📄 requirements.txt       # Python dependencies
│   ├── 📄 railway.json          # Railway deployment config
│   ├── 📄 .env.example          # Environment template
│   └── 📄 README.md             # API documentation
│
├── 🗂️ the-pile-web/              # Next.js Frontend
│   ├── 📁 src/
│   │   ├── 📁 app/               # Next.js 14 App Router
│   │   │   ├── 📁 auth/          # Authentication pages
│   │   │   ├── 📁 pile/          # Main pile dashboard
│   │   │   ├── 📁 stats/         # Analytics dashboard
│   │   │   ├── 📁 cemetery/      # Amnesty memorial
│   │   │   ├── layout.tsx        # Root layout with providers
│   │   │   ├── globals.css       # Global styles & animations
│   │   │   └── page.tsx          # Landing page
│   │   ├── 📁 components/        # React components
│   │   │   ├── 📁 ui/            # shadcn/ui base components
│   │   │   ├── pile-visualization.tsx  # 3D Three.js renderer
│   │   │   └── [feature-components]
│   │   ├── 📁 lib/               # Utilities & configuration
│   │   │   ├── api.ts            # Axios API client
│   │   │   ├── auth-provider.tsx # Authentication context
│   │   │   ├── query-provider.tsx # TanStack Query setup
│   │   │   └── utils.ts          # Utility functions
│   │   ├── 📁 hooks/             # Custom React hooks
│   │   ├── 📁 types/             # TypeScript definitions
│   ├── 📄 package.json          # Node.js dependencies
│   ├── 📄 tailwind.config.js    # Tailwind CSS configuration
│   ├── 📄 railway.json          # Railway deployment config
│   ├── 📄 .env.local.example    # Environment template
│   └── 📄 README.md             # Frontend documentation
```

## 🎮 Core Features Implementation

### 🔐 Authentication System
**Steam OAuth Integration:**
- OpenID Connect flow with Steam Community
- JWT token management (30-minute expiry)
- Automatic user profile creation
- Session persistence across browser sessions

**Implementation Files:**
- Backend: `app/services/steam_auth.py`, `app/api/v1/auth.py`
- Frontend: `src/lib/auth-provider.tsx`, `src/app/auth/`

### 📊 3D Pile Visualization
**Three.js Implementation:**
- React Three Fiber integration
- Color-coded game status (Red=Unplayed, Yellow=Playing, etc.)
- Interactive orbit controls
- Performance optimization for large collections

**Implementation Files:**
- Component: `src/components/pile-visualization.tsx`
- Styling: `src/app/globals.css` (pile-specific animations)

### 🏆 Shame Score Algorithm
**Multi-factor Scoring System:**
```python
shame_score = (
    unplayed_games * 2 +           # Base penalty for unplayed games
    money_wasted * 0.5 +           # Financial waste factor
    min(completion_years * 10, 100) + # Time reality check
    zero_playtime_games * 3        # Never-touched bonus penalty
)
```

**Implementation Files:**
- Backend: `app/services/stats_service.py` (calculate_shame_score method)
- Frontend: `src/lib/utils.ts` (calculateShameLevel function)

### 🕊️ Amnesty System
**Guilt-free Game Abandonment:**
- Status change to `amnesty_granted`
- Reason tracking for closure
- Framer Motion float-away animation
- Cemetery memorial view

**Implementation Files:**
- Backend: `app/services/pile_service.py` (grant_amnesty method)
- Frontend: Amnesty components and cemetery view

### 📈 Behavioral Insights
**Pattern Recognition Engine:**
- Genre buying vs playing analysis
- Purchase trigger identification (sales, free games)
- Completion rate calculations
- Personalized recommendations

**Implementation Files:**
- Backend: `app/services/stats_service.py` (generate_insights method)
- Frontend: Statistics dashboard components

## 🗃️ Database Schema

### Complete Entity Relationship Model

```sql
-- Users table (Steam profile data)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    steam_id VARCHAR UNIQUE NOT NULL,
    username VARCHAR NOT NULL,
    avatar_url VARCHAR,
    shame_score FLOAT DEFAULT 0.0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Games table (Steam game metadata)
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    steam_app_id INTEGER UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    price FLOAT,
    genres JSONB,  -- Array of genre strings
    tags JSONB,    -- Array of tag strings
    description TEXT,
    image_url VARCHAR,
    header_image_url VARCHAR,
    release_date VARCHAR,
    metacritic_score INTEGER
);

-- Pile entries (Many-to-many user-game relationships)
CREATE TABLE pile_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    game_id INTEGER REFERENCES games(id) NOT NULL,
    status game_status DEFAULT 'unplayed',  -- Enum: unplayed, playing, completed, abandoned, amnesty_granted
    playtime_minutes INTEGER DEFAULT 0,
    purchase_date TIMESTAMP WITH TIME ZONE,
    purchase_price FLOAT,
    amnesty_date TIMESTAMP WITH TIME ZONE,
    amnesty_reason VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Historical pile snapshots for trend analysis
CREATE TABLE pile_snapshots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    total_games INTEGER NOT NULL,
    unplayed_games INTEGER NOT NULL,
    total_value FLOAT NOT NULL,
    unplayed_value FLOAT NOT NULL,
    shame_score FLOAT NOT NULL,
    completion_years FLOAT,
    genre_breakdown JSONB,    -- {genre: count} mapping
    buying_patterns JSONB,    -- Analysis results
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_users_steam_id ON users(steam_id);
CREATE INDEX idx_games_steam_app_id ON games(steam_app_id);
CREATE INDEX idx_pile_user_status ON pile_entries(user_id, status);
CREATE INDEX idx_pile_user_game ON pile_entries(user_id, game_id);
CREATE INDEX idx_pile_purchase_date ON pile_entries(purchase_date);
CREATE INDEX idx_pile_playtime ON pile_entries(playtime_minutes);
```

## 🚀 Environment Configuration

### Backend Environment Variables
```bash
# Database & Caching
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379

# Steam Integration
STEAM_API_KEY=ABCDEF123456789  # From steamcommunity.com/dev/apikey

# Security & Authentication
JWT_SECRET_KEY=super-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS & Environment
CORS_ORIGINS=["http://localhost:3000","https://your-frontend.com"]
ENVIRONMENT=development  # or production
```

### Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1  # or production URL
```

## 🔄 Development Workflow

### Daily Development Commands

**Start Development Environment:**
```bash
# Terminal 1 - Backend
cd the-pile-api && source venv/bin/activate && python dev.py

# Terminal 2 - Frontend  
cd the-pile-web && npm run dev

# Terminal 3 - Services (if not auto-started)
brew services start postgresql redis  # macOS
sudo systemctl start postgresql redis  # Linux
```

**Common Development Tasks:**
```bash
# Backend tasks
cd the-pile-api
source venv/bin/activate
alembic upgrade head              # Apply database migrations
black . && isort . && flake8 .  # Format and lint code
pytest --cov                     # Run tests with coverage

# Frontend tasks
cd the-pile-web
npm run type-check               # TypeScript validation
npm run lint                     # ESLint checking
npm run build                    # Production build test
```

### Git Workflow
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `fix/*`: Bug fixes

### Deployment Process
1. **Development**: Feature branches → `develop`
2. **Staging**: `develop` → `staging` (Railway staging environment)
3. **Production**: `staging` → `main` (Railway production environment)

## 🎯 Key Design Decisions

### Architecture Choices
- **Monorepo Structure**: Separate but related backend/frontend in single repository
- **API-First Design**: Backend completely independent, frontend consumes REST API
- **Dark Theme Default**: Optimized for gaming audience preferences
- **Mobile-First Responsive**: Progressive enhancement from mobile to desktop

### Technology Stack Rationale
- **FastAPI**: Modern Python framework with automatic OpenAPI docs
- **Next.js 14**: Latest React framework with App Router for optimal performance
- **PostgreSQL**: Relational database for complex queries and data integrity
- **Redis**: Caching layer for Steam API responses and session data
- **Three.js**: Industry-standard 3D graphics for pile visualization
- **TanStack Query**: Sophisticated data fetching with caching and synchronization

### Data Flow Design
```
Steam Web API → Backend Services → Database → API Endpoints → Frontend Components → 3D Visualization
     ↓              ↓                ↓           ↓              ↓                    ↓
   Raw Data → Business Logic → Persistence → REST API → React State → Visual Representation
```

## 🔧 Performance Optimizations

### Backend Performance
- **Connection Pooling**: SQLAlchemy connection pool configuration
- **Redis Caching**: Steam API responses cached for 24 hours
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Background Jobs**: Steam library imports run asynchronously
- **Rate Limiting**: Respect Steam API limits with exponential backoff

### Frontend Performance
- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Analysis**: Regular bundle size monitoring
- **3D Optimization**: Level-of-detail rendering for large game collections
- **Query Optimization**: Intelligent caching with TanStack Query

## 🐛 Common Issues & Solutions

### Development Issues
1. **CORS Errors**: Ensure CORS_ORIGINS includes frontend URL
2. **Steam API Limits**: Implement proper rate limiting and caching
3. **Database Migrations**: Always test migrations in development first
4. **3D Performance**: Fallback to 2D view on low-end devices

### Deployment Issues
1. **Environment Variables**: Double-check all required env vars are set
2. **Migration Failures**: Ensure database is accessible during deployment
3. **Build Failures**: Test production builds locally before deploying
4. **Memory Issues**: Monitor Railway resource usage and optimize accordingly

## 📚 Additional Resources

### Documentation Files
- **README.md**: Main project documentation and quick start
- **DEPLOYMENT.md**: Complete Railway deployment guide  
- **DEVELOPMENT.md**: Detailed development workflow
- **API Documentation**: Auto-generated at `/docs` endpoint

### External Documentation
- [Steam Web API Documentation](https://steamcommunity.com/dev)
- [Railway Platform Docs](https://docs.railway.app/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Three.js Documentation](https://threejs.org/docs/)

---

## 🎮 The Pile Philosophy

> *"Your pile of shame is not a bug, it's a feature."*

The Pile transforms the universal gaming experience of backlogs into a positive, humorous journey of self-discovery. By gamifying the shame and providing therapeutic closure through amnesty, we help users make peace with their buying habits while gaining insights into their gaming psychology.

**Core Principles:**
- **Humor over Judgment**: Funny observations, not harsh criticism
- **Insight over Shame**: Understanding patterns to improve habits
- **Acceptance over Perfectionism**: Amnesty system for guilt-free closure
- **Community over Isolation**: Shareable stats to connect pile sufferers

This documentation ensures the project's vision, architecture, and implementation remain clear for current and future contributors. The Pile is more than a backlog tracker—it's a therapeutic gaming experience built with modern web technologies and a deep understanding of gaming culture.

*Last updated: January 2024*