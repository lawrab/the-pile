# The Pile - Development Workflow Guide

Complete development workflow documentation for contributors and maintainers.

## 🛠️ Development Environment Setup

### Prerequisites Installation

**System Requirements:**
```bash
# macOS
brew install python@3.11 node@18 postgresql@14 redis

# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3-pip nodejs npm postgresql redis-server

# Windows (using WSL2 recommended)
# Follow Ubuntu instructions in WSL2
```

**Development Tools:**
```bash
# Global tools
npm install -g typescript @next/codemod
pip install --user black isort flake8 pytest

# VS Code Extensions (recommended)
code --install-extension ms-python.python
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
```

### Project Setup

**Clone and Initialize:**
```bash
# Clone repository
git clone <your-repo-url>
cd the-pile

# Setup both services
./setup-dev.sh  # Runs both backend and frontend setup scripts
```

**Manual Setup (alternative):**
```bash
# Backend setup
cd the-pile-api
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration

# Frontend setup
cd ../the-pile-web
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

### Configuration Files

**Backend (.env):**
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/thepile_dev
REDIS_URL=redis://localhost:6379
STEAM_API_KEY=your_steam_api_key_here
JWT_SECRET_KEY=dev-secret-change-in-production
CORS_ORIGINS=["http://localhost:3000"]
ENVIRONMENT=development
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 🏃‍♂️ Daily Development Workflow

### Starting Development

**Terminal 1 - Backend:**
```bash
cd the-pile-api
source venv/bin/activate
python dev.py
# API available at http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd the-pile-web
npm run dev
# Frontend available at http://localhost:3000
```

**Terminal 3 - Services:**
```bash
# PostgreSQL (if not auto-started)
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# Redis (if not auto-started)  
brew services start redis       # macOS
sudo systemctl start redis      # Linux
```

### Development Commands

**Backend Commands:**
```bash
# Development server with auto-reload
python dev.py

# Database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head
alembic downgrade -1

# Code formatting and linting
black .
isort .
flake8 .

# Testing
pytest
pytest --cov
pytest tests/test_specific.py -v
```

**Frontend Commands:**
```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run lint:fix

# Building and testing
npm run build
npm start  # Test production build
```

## 🧪 Testing Strategy

### Backend Testing

**Test Structure:**
```
the-pile-api/tests/
├── conftest.py              # Pytest configuration
├── test_auth.py            # Authentication tests
├── test_pile_management.py # Pile operations tests
├── test_stats.py           # Statistics calculation tests
├── test_steam_integration.py # Steam API tests
└── fixtures/
    ├── sample_games.json   # Test data
    └── mock_responses.json # API mock data
```

**Test Examples:**
```python
# test_shame_score.py
import pytest
from app.services.stats_service import StatsService

@pytest.fixture
def stats_service():
    return StatsService()

@pytest.fixture
def sample_pile_entries():
    return [
        # Mock pile entries with various statuses
    ]

async def test_shame_score_calculation(stats_service, sample_pile_entries):
    score = await stats_service.calculate_shame_score(user_id=1, db=mock_db)
    
    assert score.score > 0
    assert "unplayed_games" in score.breakdown
    assert score.rank in ["Innocent", "Casual Collector", "Serial Buyer", "Pile Builder", "The Pile Master"]

async def test_steam_api_integration(mock_steam_api):
    # Test Steam API integration with mocked responses
    pass
```

**Running Tests:**
```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/test_stats.py -v

# Test matching pattern
pytest -k "test_shame_score" -v

# Skip slow tests (Steam API calls)
pytest -m "not slow"
```

### Frontend Testing

**Test Structure:**
```
the-pile-web/tests/
├── __mocks__/              # Mock implementations
├── components/             # Component tests
├── pages/                  # Page tests
├── hooks/                  # Hook tests
├── utils/                  # Utility tests
└── setup.ts               # Test configuration
```

**Test Examples:**
```typescript
// components/PileVisualization.test.tsx
import { render, screen } from '@testing-library/react'
import { PileVisualization } from '@/components/pile-visualization'

const mockGames = [
  { id: 1, name: "Test Game", status: "unplayed" }
]

test('renders pile visualization', () => {
  render(<PileVisualization games={mockGames} />)
  expect(screen.getByRole('canvas')).toBeInTheDocument()
})

// hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks'
import { useAuth } from '@/lib/auth-provider'

test('handles login flow', async () => {
  const { result } = renderHook(() => useAuth())
  
  await act(async () => {
    await result.current.login()
  })
  
  expect(result.current.user).toBeDefined()
})
```

**Running Frontend Tests:**
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (if configured)
npm run test:e2e
```

## 🔄 Git Workflow

### Branch Strategy

**Main Branches:**
- `main`: Production-ready code
- `develop`: Integration branch for features
- `staging`: Pre-production testing

**Feature Branches:**
- `feature/steam-auth-improvements`
- `feature/pile-visualization-performance`
- `fix/amnesty-animation-bug`

### Commit Convention

**Format:**
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/improvements
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(pile): add 3D visualization with Three.js

- Implement interactive 3D pile rendering
- Add color-coded status system
- Include touch controls for mobile

fix(auth): resolve Steam OAuth callback issue

- Handle edge case in Steam OpenID verification
- Add proper error handling for invalid tokens
- Update redirect logic for production URLs

docs(api): update endpoint documentation

- Add detailed parameter descriptions
- Include response examples
- Document error codes and handling
```

### Pull Request Process

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] All tests pass
- [ ] New tests added (if applicable)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

**Review Process:**
1. Create feature branch from `develop`
2. Make changes with tests
3. Run full test suite
4. Create PR to `develop`
5. Code review and approval
6. Merge to `develop`
7. Deploy to staging for testing
8. Merge to `main` for production

## 🏗️ Architecture Decisions

### Database Schema Evolution

**Migration Strategy:**
```python
# Example migration for new feature
"""Add amnesty tracking to pile entries

Revision ID: 003
Revises: 002
Create Date: 2024-01-15 10:30:00.000000
"""

def upgrade() -> None:
    op.add_column('pile_entries', sa.Column('amnesty_date', sa.DateTime(timezone=True)))
    op.add_column('pile_entries', sa.Column('amnesty_reason', sa.String()))
    
def downgrade() -> None:
    op.drop_column('pile_entries', 'amnesty_reason')
    op.drop_column('pile_entries', 'amnesty_date')
```

**Schema Changes Checklist:**
- [ ] Migration created and tested
- [ ] Model classes updated
- [ ] API endpoints modified (if needed)
- [ ] Frontend types updated
- [ ] Tests updated
- [ ] Documentation updated

### API Versioning Strategy

**Current Approach:**
- URL versioning: `/api/v1/`
- Backward compatibility for minor changes
- New version for breaking changes

**Adding New Endpoints:**
```python
# New endpoint in existing version
@router.get("/pile/export")
async def export_pile_data(...):
    pass

# Breaking change - new version
@router.get("/v2/pile")  # New version
async def get_pile_v2(...):
    pass
```

### Frontend Architecture Decisions

**State Management:**
- React Context for global state (auth, user preferences)
- TanStack Query for server state
- Local useState for component state
- localStorage for persistence

**Component Organization:**
```
components/
├── ui/           # Base components (shadcn/ui)
├── layout/       # Layout components
├── features/     # Feature-specific components
│   ├── pile/     # Pile-related components
│   ├── auth/     # Authentication components
│   └── stats/    # Statistics components
└── common/       # Shared utility components
```

## 🐛 Debugging Guide

### Common Development Issues

**Backend Debugging:**

```python
# Add debugging to API endpoints
import logging
logger = logging.getLogger(__name__)

@router.get("/pile")
async def get_pile(...):
    logger.info(f"Getting pile for user {current_user['id']}")
    # Add breakpoints in your IDE
    import pdb; pdb.set_trace()  # Python debugger
    ...
```

**Frontend Debugging:**
```typescript
// Add console logging for development
console.log('User state:', user)
console.log('API response:', response.data)

// React Developer Tools breakpoints
debugger  // Browser will pause here

// Network debugging
// Use browser dev tools Network tab
// Check request/response headers
// Verify CORS configuration
```

**Database Debugging:**
```sql
-- Check database state
SELECT * FROM users WHERE steam_id = 'your_steam_id';
SELECT COUNT(*) FROM pile_entries WHERE user_id = 1;

-- Performance analysis
EXPLAIN ANALYZE SELECT * FROM pile_entries 
WHERE user_id = 1 AND status = 'unplayed';
```

### Performance Debugging

**Backend Performance:**
```python
# Add timing middleware
import time
from starlette.middleware.base import BaseHTTPMiddleware

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
```

**Frontend Performance:**
```typescript
// React Profiler
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component:', id, 'Phase:', phase, 'Duration:', actualDuration)
}

<Profiler id="PileVisualization" onRender={onRenderCallback}>
  <PileVisualization />
</Profiler>

// Performance API
const start = performance.now()
// ... some operation
const end = performance.now()
console.log(`Operation took ${end - start}ms`)
```

## 📊 Monitoring & Analytics

### Development Monitoring

**Local Health Checks:**
```bash
# Backend health
curl http://localhost:8000/health

# Frontend build health
npm run build && echo "Build successful"

# Database connectivity
psql -h localhost -U postgres -d thepile_dev -c "SELECT 1;"
```

**Performance Monitoring:**
```python
# Backend metrics collection
from prometheus_client import Counter, Histogram
import time

REQUEST_COUNT = Counter('http_requests_total', 'HTTP requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')

@app.middleware("http")
async def monitor_requests(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    
    REQUEST_COUNT.labels(
        method=request.method, 
        endpoint=request.url.path
    ).inc()
    
    REQUEST_LATENCY.observe(time.time() - start_time)
    return response
```

### Error Tracking

**Backend Error Handling:**
```python
import logging
import traceback

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

**Frontend Error Boundaries:**
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>
    }
    return this.props.children
  }
}
```

---

## 🎯 Development Best Practices

### Code Quality
- Follow PEP 8 for Python, ESLint config for TypeScript
- Write self-documenting code with clear variable names
- Add docstrings/JSDoc for public functions
- Keep functions small and focused
- Use type hints/TypeScript strictly

### Security
- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries
- Implement proper error handling
- Regular dependency updates

### Performance
- Profile before optimizing
- Use appropriate caching strategies
- Optimize database queries
- Minimize bundle sizes
- Implement proper loading states

### Documentation
- Update README files when adding features
- Document API changes
- Include usage examples
- Keep architecture decisions recorded
- Write clear commit messages

Remember: Consistency is more important than perfection. Focus on maintainable, testable code that follows established patterns in the codebase.