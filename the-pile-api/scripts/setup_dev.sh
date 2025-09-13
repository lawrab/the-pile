#!/bin/bash
# Development setup script for The Pile API

echo "🎮 Setting up The Pile API for development..."

# Check if Python 3.11+ is available
python3 --version | grep -E "3\.(11|12)" > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Python 3.11+ required"
    exit 1
fi

echo "✅ Python version check passed"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate
echo "✅ Virtual environment activated"

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    echo "📝 Please edit .env with your actual configuration values"
fi

# Check if PostgreSQL is running
if command -v psql >/dev/null 2>&1; then
    if pg_isready -q; then
        echo "✅ PostgreSQL is running"
        
        # Create database if it doesn't exist
        createdb thepile_dev 2>/dev/null || echo "Database 'thepile_dev' already exists or couldn't be created"
        
        # Run migrations
        echo "🔄 Running database migrations..."
        alembic upgrade head
        echo "✅ Database migrations completed"
    else
        echo "⚠️ PostgreSQL is not running. Please start PostgreSQL and run migrations manually:"
        echo "   alembic upgrade head"
    fi
else
    echo "⚠️ PostgreSQL not found. Please install PostgreSQL and create database 'thepile_dev'"
fi

echo ""
echo "🚀 Setup complete! To start the development server:"
echo "   source venv/bin/activate"
echo "   python dev.py"
echo ""
echo "📚 API Documentation will be available at:"
echo "   http://localhost:8000/docs"
echo ""
echo "⚠️ Don't forget to:"
echo "   1. Get a Steam API key from https://steamcommunity.com/dev/apikey"
echo "   2. Update the .env file with your Steam API key"
echo "   3. Set up Redis (or use a cloud Redis service)"