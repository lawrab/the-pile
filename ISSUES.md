# Known Issues & TODOs

## 🐛 Current Issues

### High Priority
1. **Three.js Compatibility** 
   - `three-mesh-bvh` package incompatible with current Three.js version
   - Error: `'BatchedMesh' is not exported from 'three'`
   - Solution: Update `@react-three/drei` or downgrade Three.js

### Medium Priority
2. **React Fragment Warnings**
   - Multiple "Invalid prop `className` supplied to `React.Fragment`" warnings
   - Likely in UI components spreading props to Fragments
   - Check: Button, Card, or other shadcn/ui components

3. **Database Migrations**
   - SQLite compatibility issues with Alembic migrations
   - `DateTime(timezone=True)` not supported in SQLite
   - Already patched but needs proper testing

### Low Priority
4. **Next.js Config Warning**
   - `experimental.appDir` is deprecated in next.config.js
   - Can be safely removed as App Router is now stable

5. **npm Vulnerabilities**
   - 1 critical vulnerability reported
   - Run `npm audit` for details
   - Several deprecated packages (eslint, glob, rimraf)

## ✅ Completed Fixes
- Updated `psycopg2-binary` to 2.9.10 for Python 3.13 compatibility
- Updated `sqlalchemy` to 2.0.36 for Python 3.13 compatibility
- Created SQLite-compatible migration files
- Temporarily disabled 3D visualization to allow app to run

## 📝 Next Steps
1. Obtain Steam API key for full testing
2. Fix Three.js visualization component
3. Run full database migration suite
4. Address React Fragment warnings
5. Update deprecated npm packages