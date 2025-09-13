# The Pile API

**FastAPI Backend for The Pile Gaming Backlog Tracker**

A robust REST API that powers The Pile's gaming backlog tracking, featuring Steam integration, behavioral analytics, and humorous reality checks about your pile of shame.

## 🚀 Core Features

### 🔐 Authentication & Security
- **Steam OpenID Integration**: Secure login via Steam's OAuth system
- **JWT Token Management**: Stateless authentication with refresh capability
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Pydantic schemas for all request/response data
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries

### 🎮 Steam Integration
- **Steam Web API Client**: Fetches owned games, playtime, achievements
- **Real-time Data Sync**: Updates game library and playtime on demand
- **Rate Limit Handling**: Respects Steam API limits with exponential backoff
- **Game Metadata Enrichment**: Pulls additional data from Steam Store API
- **Error Recovery**: Graceful handling of Steam API outages

### 📊 Analytics & Insights
- **Shame Score Algorithm**: Multi-factor scoring system with customizable weights
- **Reality Check Engine**: Brutal completion time calculations
- **Behavioral Pattern Analysis**: ML-powered insights into buying vs playing habits
- **Historical Tracking**: Pile snapshots for trend analysis over time
- **Genre Preference Mapping**: Identifies disconnects between purchases and playtime

### 🎯 Pile Management
- **Dynamic Status Tracking**: Unplayed, Playing, Completed, Abandoned, Amnesty
- **Amnesty System**: Guilt-free game abandonment with reason tracking
- **Bulk Operations**: Import entire Steam libraries efficiently
- **Filtering & Search**: Advanced querying by status, genre, price, playtime
- **Data Export**: CSV/JSON exports for external analysis

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Run database migrations:
```bash
alembic upgrade head
```

4. Start the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## 📡 API Documentation

### 🔐 Authentication Endpoints

**Steam OAuth Flow:**
```http
GET /api/v1/auth/steam/login
```
- **Purpose**: Initiates Steam OpenID authentication
- **Returns**: `{"auth_url": "https://steamcommunity.com/openid/..."}`
- **Usage**: Redirect user to auth_url for Steam login

```http
GET /api/v1/auth/steam/callback?openid.mode=...&openid.identity=...
```
- **Purpose**: Handles Steam OAuth callback
- **Parameters**: Steam OpenID response parameters
- **Returns**: Redirect to frontend with JWT token
- **Headers**: Sets authentication cookie

**User Management:**
```http
GET /api/v1/auth/me
Authorization: Bearer <jwt_token>
```
- **Purpose**: Get current authenticated user details
- **Returns**: User object with profile and shame score
- **Errors**: 401 if token invalid/expired

### 🎮 Pile Management Endpoints

**Get User's Pile:**
```http
GET /api/v1/pile?status=unplayed&genre=RPG&limit=50&offset=0
Authorization: Bearer <jwt_token>
```
- **Parameters**:
  - `status`: Filter by game status (unplayed, playing, completed, abandoned, amnesty_granted)
  - `genre`: Filter by game genre
  - `limit`: Number of results (default: 100, max: 1000)
  - `offset`: Pagination offset
- **Returns**: Array of PileEntry objects with game details
- **Performance**: Includes database indexing for fast queries

**Import Steam Library:**
```http
POST /api/v1/pile/import
Authorization: Bearer <jwt_token>
Content-Type: application/json
```
- **Purpose**: Triggers background import of user's Steam library
- **Process**: Async job fetches all owned games, enriches metadata
- **Returns**: `{"message": "Steam library import started", "status": "processing"}`
- **Duration**: 30-120 seconds depending on library size
- **Rate Limits**: Once per hour per user

**Sync Playtime:**
```http
POST /api/v1/pile/sync
Authorization: Bearer <jwt_token>
```
- **Purpose**: Updates playtime data from Steam
- **Process**: Fetches current playtime for all games
- **Returns**: `{"message": "Playtime sync started", "status": "processing"}`
- **Frequency**: Can be called every 15 minutes

**Grant Amnesty:**
```http
POST /api/v1/pile/amnesty/{game_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reason": "This game is too difficult and I'll never finish it"
}
```
- **Purpose**: Officially abandon a game without shame
- **Parameters**: `game_id` (integer), `reason` (string, optional)
- **Effect**: Changes status to `amnesty_granted`, records timestamp
- **Returns**: Confirmation message with game details

### 📊 Statistics & Analytics

**Reality Check:**
```http
GET /api/v1/stats/reality-check
Authorization: Bearer <jwt_token>
```
- **Returns**:
  ```json
  {
    "total_games": 347,
    "unplayed_games": 289,
    "completion_years": 47.3,
    "money_wasted": 1247.50,
    "most_expensive_unplayed": {"Cyberpunk 2077": 59.99},
    "oldest_unplayed": {"Half-Life 2": "2004-11-16"}
  }
  ```
- **Calculations**: Based on 2 hours/week gaming assumption
- **Updates**: Real-time calculation on each request

**Shame Score:**
```http
GET /api/v1/stats/shame-score
Authorization: Bearer <jwt_token>
```
- **Algorithm**: 
  - Unplayed games: 2 points each
  - Money wasted: 0.5 points per dollar
  - Time to complete: 10 points per year
  - Never played: 3 bonus points each
- **Returns**:
  ```json
  {
    "score": 347.5,
    "breakdown": {
      "unplayed_games": 200,
      "money_wasted": 87.5,
      "time_to_complete": 50,
      "never_played": 30
    },
    "rank": "The Pile Master",
    "message": "Your backlog could be seen from space"
  }
  ```

**Behavioral Insights:**
```http
GET /api/v1/stats/insights
Authorization: Bearer <jwt_token>
```
- **Analysis**: Genre preferences, buying patterns, completion rates
- **ML Features**: Pattern recognition for purchase triggers
- **Returns**:
  ```json
  {
    "buying_patterns": [
      "You buy RPGs but rarely commit to their epic length",
      "Steam sales are your weakness"
    ],
    "genre_preferences": {"Action": 45, "RPG": 32, "Strategy": 18},
    "completion_rate": 12.5,
    "most_neglected_genre": "RPG",
    "recommendations": [
      "Try finishing one game before buying three more",
      "Consider the Pile amnesty program for games you'll never play"
    ]
  }
  ```

### 📤 Sharing & Social

**Create Shareable Stats:**
```http
POST /api/v1/share/create
Authorization: Bearer <jwt_token>
```
- **Purpose**: Generates shareable image and stats
- **Process**: Creates anonymized statistics snapshot
- **Returns**:
  ```json
  {
    "share_id": "uuid-string",
    "image_url": "https://api.thepile.com/share-images/uuid.png",
    "text_stats": {
      "username": "Player",
      "shame_score": 347.5,
      "total_games": 347,
      "unplayed_games": 289,
      "money_wasted": 1247.50,
      "completion_years": 47.3,
      "fun_fact": "Has enough unplayed games to last until 2071"
    }
  }
  ```

### 🔧 System Endpoints

**Health Check:**
```http
GET /health
```
- **Purpose**: System health monitoring
- **Returns**: `{"status": "healthy"}`
- **Checks**: Database connectivity, Redis availability

**API Root:**
```http
GET /
```
- **Returns**: Welcome message and API information

## 🏗️ Technical Architecture

### 🗃️ Database Models

**User Model:**
```python
class User(Base):
    id: Integer (PK)
    steam_id: String (Unique)
    username: String
    avatar_url: String
    shame_score: Float
    settings: JSON
    created_at: DateTime
    updated_at: DateTime
    last_sync_at: DateTime
```

**Game Model:**
```python
class Game(Base):
    id: Integer (PK)
    steam_app_id: Integer (Unique)
    name: String
    price: Float
    genres: JSON (Array)
    tags: JSON (Array)
    description: Text
    image_url: String
    metacritic_score: Integer
```

**PileEntry Model (Many-to-Many User-Game):**
```python
class PileEntry(Base):
    id: Integer (PK)
    user_id: ForeignKey(User)
    game_id: ForeignKey(Game)
    status: Enum(GameStatus)
    playtime_minutes: Integer
    purchase_date: DateTime
    purchase_price: Float
    amnesty_date: DateTime
    amnesty_reason: String
```

### 🔄 Background Jobs Architecture

**Steam Library Import Process:**
1. **Initiate**: User triggers import via API endpoint
2. **Queue**: Job added to Celery/Redis queue
3. **Fetch**: Worker calls Steam Web API for owned games
4. **Enrich**: For each game, fetch metadata from Steam Store API
5. **Dedupe**: Check existing games in database to avoid duplicates
6. **Store**: Create Game records and PileEntry relationships
7. **Update**: Set user's last_sync_at timestamp
8. **Notify**: Optional webhook/WebSocket notification to frontend

**Rate Limiting Strategy:**
- Steam Web API: 100,000 calls per day
- Steam Store API: No official limit, respect 1 req/sec
- User import limit: Once per hour
- Playtime sync: Every 15 minutes
- Exponential backoff on API errors

### 🔐 Security Implementation

**JWT Token Management:**
- **Access Tokens**: 30-minute expiry, contains user steam_id
- **Signing Algorithm**: HS256 with configurable secret
- **Token Validation**: Middleware checks every protected endpoint
- **Automatic Refresh**: Frontend handles token refresh flow

**Steam OpenID Validation:**
```python
def verify_authentication(params):
    # 1. Change mode to check_authentication
    # 2. POST back to Steam with same parameters
    # 3. Verify response contains "is_valid:true"
    # 4. Extract Steam ID from identity URL
    # 5. Create/update user record
```

**CORS Configuration:**
- Configurable origins via environment
- Credentials allowed for authentication
- Preflight handling for complex requests

### 📊 Shame Score Algorithm Details

```python
def calculate_shame_score(user_entries):
    base_scores = {
        'unplayed_penalty': len(unplayed_games) * 2,
        'money_penalty': total_unplayed_value * 0.5,
        'time_penalty': min(completion_years * 10, 100),
        'zero_playtime_bonus': zero_playtime_count * 3
    }
    
    multipliers = {
        'genre_neglect': calculate_genre_neglect_multiplier(),
        'purchase_frequency': calculate_purchase_pattern_multiplier(),
        'completion_rate': calculate_completion_multiplier()
    }
    
    return sum(base_scores.values()) * product(multipliers.values())
```

### 🎯 Performance Optimizations

**Database Indexing:**
```sql
-- User lookup
CREATE INDEX idx_users_steam_id ON users(steam_id);

-- Game lookup
CREATE INDEX idx_games_steam_app_id ON games(steam_app_id);

-- Pile filtering
CREATE INDEX idx_pile_user_status ON pile_entries(user_id, status);
CREATE INDEX idx_pile_user_game ON pile_entries(user_id, game_id);

-- Analytics queries
CREATE INDEX idx_pile_purchase_date ON pile_entries(purchase_date);
CREATE INDEX idx_pile_playtime ON pile_entries(playtime_minutes);
```

**Caching Strategy:**
- **Redis Cache**: User profile data (15 min TTL)
- **Steam API Response Cache**: Game metadata (24 hour TTL)
- **Statistics Cache**: Reality check data (5 min TTL)
- **Application Cache**: Genre lists, shame rankings (1 hour TTL)

**Query Optimization:**
- Eager loading for pile entries with games
- Pagination for large game collections
- Selective field loading for list views
- Database connection pooling

### 🚀 Deployment Configuration

**Railway Deployment:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379

# Steam Integration  
STEAM_API_KEY=ABCDEF123456789  # From steamcommunity.com/dev/apikey

# Security
JWT_SECRET_KEY=super-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000","https://your-frontend.com"]

# Environment
ENVIRONMENT=production  # or development
```

**Health Monitoring:**
- Database connectivity check
- Redis availability check  
- Steam API reachability test
- Memory and CPU usage metrics
- Error rate monitoring