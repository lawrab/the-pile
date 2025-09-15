# The Pile - Refactoring Todo List

## Security Critical (Priority 1)
1. Fix JWT token storage - migrate from localStorage to httpOnly cookies
2. Fix deprecated datetime.utcnow() usage
3. Restrict CORS configuration - remove wildcards
4. Implement rate limiting on auth endpoints
5. Remove unused password hashing functions

## Performance Optimizations (Priority 2)
6. Fix N+1 database queries with eager loading
7. Implement Redis caching layer
8. Add database connection pooling
9. Optimize frontend bundle with code splitting

## Architecture Improvements (Priority 3)
10. Implement repository pattern for data access
11. Create domain models separate from ORM
12. Setup Celery background workers
13. Add OpenTelemetry for observability
14. Implement comprehensive error boundaries

## Code Quality (Priority 4)
15. Add Pydantic schemas for all endpoints
16. Migrate to SQLAlchemy 2.0 query style
17. Implement Zod for runtime type validation
18. Setup integration tests
19. Add shared TypeScript types package
20. Configure husky pre-commit hooks

## BFF Implementation (Priority 5)
21. Implement BFF pattern with Next.js API routes
22. Create view-specific API aggregation endpoints

## Notes
- Database migrations will be handled at the end with user assistance
- All changes on new branch to preserve deployed version
- OpenTelemetry chosen over vendor-specific solutions
- BFF pattern chosen over GraphQL for simplicity