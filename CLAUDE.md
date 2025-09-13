# CLAUDE.md - The Pile Project Context

This file contains essential context about The Pile project for AI assistants to understand the codebase, architecture, and development patterns.

## 🎮 Project Overview

**The Pile** is a humorous gaming backlog tracker that helps users confront their unplayed Steam games through visualization and behavioral insights.

**Core Concept**: Transform gaming backlog shame into an engaging, therapeutic experience with data-driven insights and satisfying amnesty mechanics.

**Target Audience**: Steam gamers with large backlogs who want to understand their buying patterns and make peace with unplayed games.

## 🏗️ Architecture Summary

**Monorepo Structure:**
```
the-pile/
├── the-pile-api/     # FastAPI backend (Python 3.11+)
├── the-pile-web/     # Next.js 14 frontend (TypeScript)
├── README.md         # Main project docs
├── DEPLOYMENT.md     # Railway deployment guide
├── DEVELOPMENT.md    # Development workflow
└── PROJECT-OVERVIEW.md # Comprehensive overview
```

**Technology Stack:**
- **Backend**: FastAPI, PostgreSQL, Redis, SQLAlchemy, Alembic
- **Frontend**: Next.js 14, TypeScript, TanStack Query, Tailwind CSS, Three.js
- **Auth**: Steam OpenID Connect, JWT tokens
- **Deployment**: Railway (auto-deploy from git)
- **External APIs**: Steam Web API, Steam Store API

## 🎯 Core Features Implementation Status

### ✅ Completed Features
1. **Steam OAuth Authentication** - Full OpenID implementation with JWT
2. **Database Models** - Complete schema with migrations
3. **API Endpoints** - All REST endpoints defined and documented
4. **3D Pile Visualization** - Three.js implementation with React Three Fiber
5. **Shame Score Algorithm** - Multi-factor scoring system
6. **Reality Check Engine** - Brutal completion statistics
7. **Amnesty System** - Guilt-free game abandonment with animations
8. **Behavioral Insights** - Pattern recognition and recommendations
9. **Project Structure** - Complete file organization and documentation

### 🚧 Implementation Status
- **Basic structure**: ✅ Complete
- **Core logic**: ✅ Complete  
- **Frontend components**: ✅ Complete base implementation
- **API endpoints**: ✅ Complete
- **Database migrations**: ✅ Complete
- **Deployment configs**: ✅ Complete
- **Documentation**: ✅ Comprehensive

### 🔄 Not Yet Implemented (Future Work)
- Background job processing (Celery workers)
- Image generation for shareable stats
- Advanced analytics dashboard
- Achievement system
- Social features beyond basic sharing
- Mobile app (PWA optimization exists)

## 🗃️ Database Schema

**Key Tables:**
```sql
users (id, steam_id, username, avatar_url, shame_score, settings, timestamps)
games (id, steam_app_id, name, price, genres, tags, description, metadata)
pile_entries (id, user_id, game_id, status, playtime_minutes, purchase_data, amnesty_data)
pile_snapshots (id, user_id, historical_metrics, created_at)
```

**Game Status Enum:**
- `unplayed` - Never touched (red shame)
- `playing` - Currently being played (yellow)
- `completed` - Finished successfully (green)
- `abandoned` - Started but gave up (gray)
- `amnesty_granted` - Officially forgiven (purple)

## 🎨 Design Philosophy & Patterns

### Design Principles
- **Dark theme by default** (gamers prefer it)
- **Humorous but not insulting** tone
- **Confession booth feeling** - safe space to confront the pile
- **Mobile-first responsive design**
- **Satisfying animations** especially for amnesty

### Code Patterns

**Backend Patterns:**
```python
# Service layer pattern
class PileService:
    async def get_user_pile(self, user_id: int, filters: PileFilters, db: Session)
    async def grant_amnesty(self, user_id: int, game_id: int, reason: str, db: Session)

# Dependency injection
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security))

# Pydantic schemas for validation
class PileEntryResponse(BaseModel):
    # Response models with validation
```

**Frontend Patterns:**
```typescript
// Custom hooks for data management
export const usePile = (filters?: PileFilters) => {
  return useQuery({
    queryKey: ['pile', filters],
    queryFn: () => pileApi.getPile(filters)
  })
}

// Context providers for global state
<AuthProvider>
  <QueryProvider>
    {children}
  </QueryProvider>
</AuthProvider>

// Component composition
interface ButtonProps {
  variant: 'default' | 'outline' | 'ghost' | 'amnesty' | 'shame'
}
```

## 🔧 Development Commands

**Start Development:**
```bash
# Backend (Terminal 1)
cd the-pile-api && source venv/bin/activate && python dev.py

# Frontend (Terminal 2)  
cd the-pile-web && npm run dev
```

**Common Tasks:**
```bash
# Database migrations
cd the-pile-api && alembic upgrade head

# Code quality
cd the-pile-api && black . && isort . && flake8 .
cd the-pile-web && npm run lint && npm run type-check

# Testing
cd the-pile-api && pytest --cov
cd the-pile-web && npm test
```

## 🚀 Deployment Context

**Railway Configuration:**
- **Backend**: Auto-deploys from `the-pile-api/` folder
- **Frontend**: Auto-deploys from `the-pile-web/` folder  
- **Database**: PostgreSQL service auto-provisioned
- **Cache**: Redis service auto-provisioned

**Environment Variables:**
```bash
# Backend
DATABASE_URL, REDIS_URL (auto-populated)
STEAM_API_KEY (from Steam Dev Portal)
JWT_SECRET_KEY (generated secure string)
CORS_ORIGINS (JSON array with frontend URL)

# Frontend  
NEXT_PUBLIC_API_URL (backend URL + /api/v1)
```

## 🎮 Steam Integration Details

**Steam Web API Usage:**
- **GetOwnedGames**: Fetch user's game library
- **GetPlayerSummaries**: Get user profile info
- **Store API**: Enrich game metadata (genres, prices, descriptions)

**Rate Limiting:**
- Steam Web API: 100,000 calls per day
- Store API: ~1 request per second (unofficial)
- User import limit: Once per hour
- Playtime sync: Every 15 minutes

**Authentication Flow:**
1. User clicks "Login with Steam"
2. Redirect to Steam OpenID endpoint
3. Steam redirects back with OpenID response
4. Backend verifies with Steam and creates JWT
5. Frontend receives JWT and stores in localStorage

## 🎯 Shame Score Algorithm

**Calculation:**
```python
shame_score = (
    unplayed_games * 2 +              # Base penalty
    money_wasted * 0.5 +              # Financial waste
    min(completion_years * 10, 100) + # Time reality check
    zero_playtime_games * 3           # Never-touched bonus
)
```

**Ranking System:**
- **0-50**: "Innocent" (reasonable relationship)
- **50-100**: "Casual Collector" (likes buying 'just in case')  
- **100-200**: "Serial Buyer" (sales are weakness)
- **200-400**: "Pile Builder" (structural integrity achieved)
- **400+**: "The Pile Master" (visible from space)

## 🕊️ Amnesty System

**Purpose**: Guilt-free abandonment of games you'll never play

**Implementation:**
- Changes status to `amnesty_granted`
- Records amnesty date and optional reason
- Triggers satisfying float-away animation
- Moves game to "Cemetery" memorial view
- Updates shame score calculation

**UX Flow:**
1. User selects game from pile
2. Clicks "Grant Amnesty" button
3. Optional reason input dialog
4. Framer Motion animation plays
5. Game floats away and disappears
6. Statistics update in real-time

## 🧠 Behavioral Insights Engine

**Pattern Recognition:**
- **Genre Analysis**: What you buy vs. what you play
- **Purchase Triggers**: Steam sales, free games, bundles
- **Completion Patterns**: Time between purchase and first play
- **Abandonment Analysis**: Games started but never finished

**Insight Examples:**
- "You buy RPGs but rarely commit to their epic length"
- "Steam sales are your weakness - 73% of purchases during sales"
- "You have enough unplayed games to last until 2047"

## 🎨 Component Architecture

**Frontend Structure:**
```typescript
// Page Components
app/page.tsx              # Landing page with demo
app/pile/page.tsx         # Main dashboard
app/stats/page.tsx        # Analytics view
app/cemetery/page.tsx     # Amnesty memorial

// Feature Components  
components/pile-visualization.tsx  # 3D Three.js scene
components/stats-cards.tsx        # Dashboard metrics
components/amnesty-modal.tsx      # Amnesty granting UI

// Utility Components
components/ui/button.tsx          # shadcn/ui base components
lib/auth-provider.tsx            # Global auth state
lib/query-provider.tsx           # TanStack Query setup
```

**3D Visualization:**
- Uses React Three Fiber for React integration
- Color-coded cubes represent games by status
- Interactive orbital controls for navigation
- Performance optimization for large collections
- Graceful fallback for low-end devices

## 🔍 Debugging Context

**Common Issues:**
1. **CORS Errors**: Check CORS_ORIGINS includes frontend URL
2. **Steam API Limits**: Implement exponential backoff
3. **JWT Token Expiry**: Frontend handles refresh automatically
4. **3D Performance**: Monitor frame rates, implement LOD
5. **Database Connections**: Use connection pooling

**Debugging Tools:**
```python
# Backend debugging
import logging
logger = logging.getLogger(__name__)
logger.info("Debug message here")

# Add breakpoints
import pdb; pdb.set_trace()
```

```typescript
// Frontend debugging
console.log('Debug state:', { user, pile, loading })
debugger // Browser breakpoint

// React DevTools
// Network tab for API calls
// Performance tab for 3D optimization
```

## 🧪 Testing Strategy

**Backend Testing:**
- Unit tests for business logic (stats calculations, amnesty)
- Integration tests for Steam API
- Database migration testing
- Authentication flow testing

**Frontend Testing:**
- Component testing with Testing Library
- Hook testing for custom hooks
- E2E testing for critical user flows
- 3D scene testing with Three.js test utils

## 📦 Dependencies to Remember

**Backend Critical Dependencies:**
```python
fastapi>=0.104.1          # Web framework
sqlalchemy>=2.0.23        # ORM
alembic>=1.12.1          # Migrations
psycopg2-binary>=2.9.9   # PostgreSQL driver
redis>=5.0.1             # Caching
python-jose>=3.3.0       # JWT handling
httpx>=0.25.2            # HTTP client for Steam API
```

**Frontend Critical Dependencies:**
```json
{
  "next": "14.0.3",                    // React framework
  "@tanstack/react-query": "^5.8.4",  // Data fetching
  "three": "^0.158.0",                 // 3D graphics
  "@react-three/fiber": "^8.15.11",   // React Three.js
  "framer-motion": "^10.16.5",         // Animations
  "tailwindcss": "^3.3.0",            // Styling
  "axios": "^1.6.2"                   // HTTP client
}
```

## 🎭 Personality & Tone

**Voice & Tone:**
- Humorous but supportive
- Gaming culture aware
- Self-deprecating about backlog shame
- Encouraging about making progress
- Never judgmental or harsh

**Example Messages:**
- "Your pile of shame is not a bug, it's a feature"
- "Even Steam is worried about you"
- "Your backlog has achieved structural integrity"
- "Time to grant some amnesty and free yourself"

## 🔮 Future Development Context

**Next Priority Features:**
1. Background job system for Steam imports
2. Advanced analytics dashboard
3. Achievement/milestone system  
4. Enhanced sharing with image generation
5. Progressive Web App optimization

**Technical Debt to Address:**
1. Implement proper background job queue
2. Add comprehensive error tracking
3. Optimize 3D performance for mobile
4. Add comprehensive test coverage
5. Implement proper monitoring/alerting

## 🎯 Success Metrics

**User Engagement:**
- Steam library import completion rate
- Time spent on pile visualization
- Amnesty grants per user session
- Return user rate

**Technical Metrics:**
- API response times < 200ms
- 3D visualization FPS > 30fps
- Steam API success rate > 99%
- Zero database migration failures

---

## 💡 AI Assistant Guidelines

When working on this project:

1. **Maintain the humorous tone** - Gaming backlogs should be fun to explore, not shameful
2. **Follow existing patterns** - Use established service/component/hook patterns  
3. **Consider mobile users** - Optimize for touch and performance
4. **Respect Steam API limits** - Always implement proper rate limiting
5. **Test database changes** - Always provide migration rollback scripts
6. **Document new features** - Update relevant README files
7. **Consider the pile philosophy** - Features should help users make peace with their backlog

**Code Style:**
- Backend: Follow PEP 8, use black/isort formatting
- Frontend: Follow ESLint config, use TypeScript strictly
- Always include docstrings/JSDoc for public functions
- Write self-documenting code with clear variable names

**Git Workflow:**
- Feature branches from `develop`
- Clear commit messages following conventional commits
- Always test locally before pushing
- Update documentation with feature changes

This context should provide everything needed to understand and contribute to The Pile project effectively!