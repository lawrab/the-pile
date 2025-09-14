# The Pile v0.1.0-alpha Deployment Checklist

## Pre-Deployment Setup

### 1. Domain Configuration
- [ ] Choose subdomain (e.g., `pile.yourdomain.com` for frontend, `api-pile.yourdomain.com` for backend)
- [ ] Configure DNS records to point to Railway deployment URLs
- [ ] Enable SSL/TLS (Railway provides this automatically)

### 2. Steam API Setup
- [ ] Obtain Steam API key from https://steamcommunity.com/dev/apikey
- [ ] Configure OAuth callback URL in Steam settings
- [ ] Test Steam authentication flow locally

### 3. Environment Variables

#### Backend (.env.production)
- [ ] `DATABASE_URL` - Provided by Railway
- [ ] `REDIS_URL` - Provided by Railway
- [ ] `STEAM_API_KEY` - Your Steam API key
- [ ] `JWT_SECRET_KEY` - Generate with `openssl rand -hex 32`
- [ ] `CORS_ORIGINS` - Set to your frontend URL(s)

#### Frontend (.env.production)
- [ ] `NEXT_PUBLIC_API_URL` - Set to backend URL + `/api/v1`

### 4. Railway Configuration
- [ ] Create new Railway project
- [ ] Add PostgreSQL service
- [ ] Add Redis service
- [ ] Configure backend service:
  - Set root directory to `/the-pile-api`
  - Set start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Add all environment variables
- [ ] Configure frontend service:
  - Set root directory to `/the-pile-web`
  - Add environment variables
- [ ] Set up automatic deployments from GitHub

### 5. Database Setup
- [ ] Run migrations: `alembic upgrade head`
- [ ] Verify all tables created successfully
- [ ] Test database connections

### 6. Security Review
- [ ] Verify JWT secret is strong and unique
- [ ] Check CORS origins are correctly configured
- [ ] Ensure rate limiting is enabled
- [ ] Verify no sensitive data in logs
- [ ] Check all API endpoints require authentication (except public ones)

### 7. Testing
- [ ] Test Steam OAuth flow end-to-end
- [ ] Import a test Steam library
- [ ] Test all core features:
  - [ ] User registration/login
  - [ ] Game import and sync
  - [ ] Shame score calculation
  - [ ] Amnesty system
  - [ ] Sorting and filtering
- [ ] Check responsive design on mobile
- [ ] Test error handling and edge cases

### 8. Performance Checks
- [ ] Verify Redis caching is working
- [ ] Check API response times < 200ms
- [ ] Test with large game libraries (1000+ games)
- [ ] Monitor memory usage during imports

### 9. Monitoring Setup (Optional for Alpha)
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure uptime monitoring
- [ ] Set up basic analytics
- [ ] Create alerts for critical errors

### 10. Documentation
- [ ] Update README with production URL
- [ ] Document known limitations for alpha
- [ ] Create user guide/FAQ
- [ ] Prepare feedback collection method

## Deployment Steps

1. **Prepare the release:**
   ```bash
   # Ensure all changes are committed
   git status
   
   # Run final tests
   cd the-pile-api && pytest
   cd ../the-pile-web && npm test
   
   # Run linting and type checking
   cd the-pile-api && black . && flake8
   cd ../the-pile-web && npm run lint && npm run type-check
   ```

2. **Create release tag:**
   ```bash
   git tag -a v0.1.0-alpha -m "Release v0.1.0-alpha"
   git push origin v0.1.0-alpha
   ```

3. **Deploy to Railway:**
   - Push to main branch (auto-deploys if configured)
   - Or manually trigger deployment in Railway dashboard

4. **Post-Deployment Verification:**
   - [ ] Frontend loads without errors
   - [ ] API health check returns 200
   - [ ] Steam OAuth works
   - [ ] Database queries execute properly
   - [ ] Redis caching functions

## Rollback Plan

If issues occur:
1. Revert to previous deployment in Railway dashboard
2. Or push previous commit: `git push --force origin <previous-commit>:main`
3. Check logs for errors
4. Fix issues in development
5. Re-deploy when ready

## Alpha Release Notes

### What's Working
- Steam authentication and library import
- Shame score calculation
- Basic pile management
- Amnesty system
- User profiles

### Known Limitations
- Import process not yet backgrounded (UI may freeze for large libraries)
- No email notifications
- Limited mobile optimization
- No data export features yet

### Feedback Channels
- GitHub Issues: https://github.com/yourusername/the-pile/issues
- Email: your-email@domain.com
- Discord: (if applicable)

## Success Criteria

Alpha release is successful when:
- [ ] 10+ users successfully import their Steam libraries
- [ ] No critical bugs preventing core functionality
- [ ] Average import time < 10 minutes for 1000 games
- [ ] Positive initial feedback on concept
- [ ] Clear path identified for beta improvements