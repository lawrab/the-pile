#!/bin/bash
# Quality check script for The Pile API

set -e

echo "🔍 Running Python quality checks..."

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