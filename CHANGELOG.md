# Changelog

All notable changes to The Pile project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-alpha] - 2025-09-14

### 🎉 Initial Alpha Release

The Pile is now ready for alpha testing! This release includes all core features needed to track and manage your gaming backlog with humor and insights.

### ✨ Features

#### Core Functionality
- **Steam Authentication**: Secure OAuth login with Steam OpenID Connect
- **Library Import**: Import your entire Steam library with optimized API calls
- **Shame Score Algorithm**: Multi-factor scoring system that calculates your backlog shame
- **Reality Check Engine**: Brutal honesty about completion timelines
- **Amnesty System**: Grant guilt-free abandonment to games you'll never play
- **Interactive Dashboard**: Visual preview of your pile with statistics

#### User Experience
- **Professional Landing Page**: Compelling marketing page with feature showcase
- **User Management**: Profile dropdown with logout functionality
- **Game Sorting**: Sort by playtime, rating, or release date
- **Real-time Progress**: Live updates during Steam library import
- **Responsive Design**: Mobile-friendly interface (with room for improvement)
- **Dark Theme**: Default dark mode optimized for gamers

#### Performance Optimizations
- **Smart Caching**: 7-day cache for game data, reducing API calls by 70-90%
- **Parallel Processing**: 10 concurrent API requests with semaphore control
- **Batch Database Operations**: 50-game chunks for efficient writes
- **Rate Limiting**: Token bucket algorithm preventing API throttling
- **Import Speed**: Reduced from ~30 minutes to ~5 minutes for 1000+ games

#### Developer Features
- **Monorepo Structure**: Clean separation of frontend and backend
- **Railway Ready**: Pre-configured for easy deployment
- **Environment Templates**: Production configuration examples included
- **Comprehensive Documentation**: Setup, development, and deployment guides
- **Database Migrations**: Alembic migrations with PostgreSQL support

### 🔧 Technical Stack

- **Backend**: FastAPI (Python 3.11+) with async support
- **Frontend**: Next.js 14 with TypeScript and App Router
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache**: Redis for API response caching
- **Auth**: JWT tokens with Steam OpenID
- **Styling**: Tailwind CSS with custom components

### 📝 Changed

- Replaced 3D Three.js visualization with interactive dashboard preview
- Removed unused Three.js dependencies
- Updated documentation for production deployment
- Cleaned up known issues and warnings

### 🐛 Fixed

- Button page jumping issues
- Header username overflow
- Session expiration handling
- React Fragment warnings
- SQLite migration compatibility

### 🚧 Known Limitations (Alpha)

- Import process runs in foreground (UI may freeze for very large libraries)
- No background job processing yet (Celery integration pending)
- No email notifications
- Limited mobile optimization
- No data export features
- No social features beyond basic sharing

### 📦 Dependencies

- All packages updated to latest stable versions
- Zero security vulnerabilities
- Removed deprecated configuration options

### 🎯 What's Next (Beta Roadmap)

- Background job processing with Celery
- Advanced analytics dashboard
- Achievement/milestone system
- Image generation for shareable stats
- Progressive Web App optimization
- Enhanced mobile experience
- Data export functionality

### 🙏 Acknowledgments

Thanks to all early testers and contributors who helped shape this alpha release!

### 📊 Statistics

- **Lines of Code**: ~15,000
- **API Endpoints**: 20+
- **React Components**: 30+
- **Database Tables**: 5
- **Test Coverage**: Growing
- **Performance Gain**: 6x faster imports

---

For installation and setup instructions, see [README.md](README.md)
For deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md)
For known issues, see [ISSUES.md](ISSUES.md)