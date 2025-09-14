# Known Issues & TODOs

## 🐛 Current Issues

### Medium Priority
1. **Database Migrations**
   - SQLite compatibility issues with Alembic migrations
   - `DateTime(timezone=True)` not supported in SQLite
   - Already patched but needs proper testing

### Low Priority
None currently

## ✅ Completed Fixes (v0.1.0-alpha prep)
- Removed unused Three.js dependencies (3D visualization replaced with dashboard preview)
- Fixed React Fragment warnings
- Verified no npm security vulnerabilities (0 found)
- Confirmed Next.js config is clean (no deprecated options)
- Updated `psycopg2-binary` to 2.9.10 for Python 3.13 compatibility
- Updated `sqlalchemy` to 2.0.36 for Python 3.13 compatibility
- Created SQLite-compatible migration files

## 📝 Next Steps for v0.1.0-alpha
1. Obtain Steam API key for full testing
2. Complete production environment configuration
3. Set up subdomain and configure CORS
4. Deploy to Railway
5. Create release documentation and tag