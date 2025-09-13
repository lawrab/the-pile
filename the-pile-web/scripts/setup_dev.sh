#!/bin/bash
# Development setup script for The Pile Web

echo "🎮 Setting up The Pile Web for development..."

# Check if Node.js is available
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required, found version $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️ Creating .env.local file..."
    cp .env.local.example .env.local
    echo "📝 Please edit .env.local with your API URL"
fi

echo ""
echo "🚀 Setup complete! To start the development server:"
echo "   npm run dev"
echo ""
echo "📚 The application will be available at:"
echo "   http://localhost:3000"
echo ""
echo "⚠️ Make sure the API server is running at:"
echo "   http://localhost:8000"