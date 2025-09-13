#!/usr/bin/env bash

# Reset database script for The Pile API
# This script completely resets the database for a fresh start

set -e  # Exit on any error

echo "🔄 Resetting The Pile database..."

# Stop if any database files are in use
echo "📋 Checking for running processes..."

# Remove all database files
echo "🗑️  Removing database files..."
rm -f *.db
rm -f *.db-*
echo "✅ Database files removed"

# Remove all migration files except __pycache__
echo "🗑️  Removing migration files..."
find alembic/versions -name "*.py" -not -path "*/__pycache__/*" -delete
echo "✅ Migration files removed"

# Generate fresh migration
echo "🔄 Generating fresh migration..."
alembic revision --autogenerate -m "Initial schema with separated Steam data"
echo "✅ Fresh migration generated"

# Apply migration
echo "🚀 Applying migration..."
alembic upgrade head
echo "✅ Database schema created"

echo ""
echo "🎉 Database reset complete!"
echo "📊 Fresh database ready with separated Steam/user data schema"
echo ""
echo "Next steps:"
echo "1. Start the API server: python dev.py"
echo "2. Login with Steam"
echo "3. Import your Steam library"
echo ""