# The Pile - Railway Deployment Guide

Complete guide for deploying The Pile to Railway with PostgreSQL and Redis.

## 🚀 Quick Deploy

### Prerequisites
- [Railway Account](https://railway.app/) (free tier available)
- [Steam API Key](https://steamcommunity.com/dev/apikey)
- GitHub repository with your code

### One-Click Deploy

1. **Fork the Repository** (if not already done)
2. **Deploy Backend First**:
   ```bash
   # From Railway dashboard
   New Project → Deploy from GitHub → Select the-pile-api folder
   ```
3. **Deploy Frontend**:
   ```bash
   # From Railway dashboard  
   New Project → Deploy from GitHub → Select the-pile-web folder
   ```

## 🔧 Manual Deployment Setup

### Step 1: Deploy Backend API

**Create New Railway Project:**
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your forked repository
5. Set root directory to `the-pile-api`

**Add Database Services:**
1. Click "Add Service" → "Database" → "PostgreSQL"
2. Click "Add Service" → "Database" → "Redis"
3. Railway will automatically provision these services

**Configure Environment Variables:**
```bash
# Railway will auto-populate DATABASE_URL and REDIS_URL
# You need to add these manually:

STEAM_API_KEY=your_steam_api_key_from_steam_dev_portal
JWT_SECRET_KEY=generate_a_secure_random_string_here
CORS_ORIGINS=["https://your-frontend-url.railway.app"]
ENVIRONMENT=production
```

**Generate JWT Secret:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

**Deploy Configuration:**
Railway automatically detects the `railway.json` file:
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

### Step 2: Deploy Frontend

**Create Frontend Service:**
1. Create another Railway project
2. Deploy from same GitHub repo
3. Set root directory to `the-pile-web`

**Configure Frontend Environment:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api/v1
```

**Railway Frontend Configuration:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run build && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 3: Update CORS Configuration

**After frontend deployment:**
1. Note your frontend URL (e.g., `https://the-pile-web-production.railway.app`)
2. Update backend environment variable:
   ```bash
   CORS_ORIGINS=["https://your-frontend-url.railway.app"]
   ```
3. Redeploy backend service

### Step 4: Configure Steam API Redirect

**Update Steam API Key Settings:**
1. Go to [Steam Dev Portal](https://steamcommunity.com/dev/apikey)
2. Edit your API key settings
3. Add your Railway backend URL to allowed domains:
   ```
   https://your-backend-url.railway.app
   ```

## 🔒 Security Configuration

### Environment Variables Checklist

**Backend Required:**
- ✅ `DATABASE_URL` (auto-populated by Railway)
- ✅ `REDIS_URL` (auto-populated by Railway)
- ✅ `STEAM_API_KEY` (from Steam Dev Portal)
- ✅ `JWT_SECRET_KEY` (generate secure random string)
- ✅ `CORS_ORIGINS` (JSON array with frontend URL)
- ✅ `ENVIRONMENT=production`

**Frontend Required:**
- ✅ `NEXT_PUBLIC_API_URL` (backend URL with /api/v1 suffix)

### Security Best Practices

**JWT Secret Generation:**
```bash
# Option 1: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 2: OpenSSL
openssl rand -hex 32

# Option 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Steam API Key Security:**
- Never commit API keys to git
- Use Railway's environment variable interface
- Rotate keys periodically
- Monitor API usage in Steam Dev Portal

## 📊 Monitoring & Health Checks

### Built-in Health Endpoints

**Backend Health Check:**
```bash
GET https://your-backend-url.railway.app/health
# Returns: {"status": "healthy"}
```

**Frontend Health Check:**
```bash
GET https://your-frontend-url.railway.app/api/health
# Returns: Next.js health status
```

### Railway Monitoring

**Automatic Metrics:**
- CPU usage
- Memory consumption  
- Request latency
- Error rates
- Deployment frequency

**Custom Monitoring:**
```python
# Add to your FastAPI app for custom metrics
import time
from datetime import datetime

@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

## 🔄 CI/CD Pipeline

### Automatic Deployments

Railway automatically deploys on every push to main branch.

**Deployment Triggers:**
- Push to main branch
- Manual deployment from Railway dashboard
- API endpoint trigger

**Build Process:**
1. Railway detects changes
2. Builds using Nixpacks
3. Runs database migrations (backend only)
4. Starts application
5. Health check validation
6. Traffic routing

### Custom Build Scripts

**Backend Build Hook:**
```bash
# Add to package.json or requirements.txt
# Railway will run alembic migrations automatically
```

**Frontend Build Optimization:**
```bash
# Optimize Next.js build
npm run build
# Output: .next folder with optimized assets
```

## 🐛 Troubleshooting Deployments

### Common Backend Issues

**Database Migration Failures:**
```bash
# SSH into Railway container
railway shell

# Run migrations manually
alembic upgrade head

# Check current migration
alembic current
```

**Steam API Connection Issues:**
```bash
# Test Steam API connectivity
curl "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=YOUR_KEY&steamids=76561197960434622"
```

**CORS Errors:**
```bash
# Check CORS configuration
echo $CORS_ORIGINS

# Should return: ["https://your-frontend-url.railway.app"]
```

### Common Frontend Issues

**API Connection Problems:**
```bash
# Check environment variable
echo $NEXT_PUBLIC_API_URL

# Should return: https://your-backend-url.railway.app/api/v1
```

**Build Failures:**
```bash
# Check Next.js build locally
npm run build

# Common issues:
# - TypeScript errors
# - Missing dependencies
# - Environment variable access
```

### Database Issues

**Connection Pool Exhaustion:**
```python
# Adjust database connection settings in backend
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=5,          # Reduce for Railway limits
    max_overflow=10,      # Allow burst connections
    pool_pre_ping=True,   # Validate connections
)
```

**Redis Memory Issues:**
```python
# Configure Redis with memory limits
redis_client = redis.from_url(
    os.getenv("REDIS_URL"),
    max_connections=10,   # Limit connections
    socket_keepalive=True,
    socket_keepalive_options={},
)
```

## 💰 Cost Optimization

### Railway Pricing Tiers

**Hobby Plan (Free):**
- $0/month
- 500 execution hours
- 1GB RAM, 1 vCPU
- 1GB storage
- Perfect for development and testing

**Pro Plan:**
- $20/month
- Unlimited execution hours
- Up to 32GB RAM, 32 vCPUs
- Automatic scaling
- Production-ready

### Cost Reduction Strategies

**Optimize Resource Usage:**
```python
# Backend optimization
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        workers=1,  # Single worker for small deployments
        loop="asyncio",  # Efficient event loop
    )
```

**Frontend Optimization:**
```javascript
// Next.js optimization
module.exports = {
  output: 'standalone',     // Reduce deployment size
  experimental: {
    outputFileTracing: true // Tree-shake unused code
  }
}
```

**Database Optimization:**
- Use connection pooling
- Implement proper indexing
- Regular maintenance tasks
- Monitor query performance

## 🔄 Maintenance & Updates

### Regular Maintenance Tasks

**Weekly:**
- Check application logs
- Monitor resource usage
- Review error rates
- Update dependencies (if needed)

**Monthly:**
- Review Steam API usage
- Check security updates
- Optimize database performance
- Review Railway billing

**Quarterly:**
- Rotate JWT secrets
- Update Steam API keys
- Performance audits
- Security assessments

### Update Procedures

**Backend Updates:**
1. Test changes locally
2. Push to main branch
3. Railway auto-deploys
4. Monitor health endpoints
5. Check application logs

**Frontend Updates:**
1. Test build locally (`npm run build`)
2. Push to main branch
3. Railway auto-deploys
4. Test user flows
5. Monitor performance metrics

### Rollback Procedures

**Emergency Rollback:**
1. Go to Railway dashboard
2. Select problematic deployment
3. Click "Redeploy" on previous working version
4. Monitor health endpoints
5. Investigate issues in safe environment

---

## 🆘 Support Resources

- **Railway Docs**: https://docs.railway.app/
- **Steam API Docs**: https://steamcommunity.com/dev
- **Railway Discord**: https://discord.gg/railway
- **Project Issues**: GitHub Issues tab

Remember: Always test deployments in a staging environment before pushing to production!