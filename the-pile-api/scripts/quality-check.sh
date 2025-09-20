#!/usr/bin/env bash
# Quality check script for The Pile API

set -e

echo "🔍 Running Python quality checks..."

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📦 Installing/updating development dependencies..."
pip install -r requirements-dev.txt

echo "📝 Running black (code formatting)..."
black --check --diff .

echo "📦 Running isort (import sorting)..."
isort --check-only --diff .

echo "🔍 Running flake8 (linting)..."
flake8 .

echo "🎯 Running mypy (type checking)..."
mypy .

echo "🔒 Running bandit (security analysis)..."
bandit -r . -f json -o bandit-report.json

echo "🧪 Running tests with coverage..."
pytest --cov=app --cov-report=term-missing --cov-report=html

echo "✅ All quality checks passed!"