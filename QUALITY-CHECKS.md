# Quality Checks Setup

This document outlines the quality assurance tools and processes implemented to catch issues before production deployment.

## Tools Implemented

### 1. **mypy** - Static Type Checking
- **Purpose**: Catches import errors, type mismatches, and undefined variables
- **Configuration**: `the-pile-api/mypy.ini`
- **Run**: `cd the-pile-api && mypy .`
- **What it would have caught**: The `ModuleNotFoundError: No module named 'app.schemas.stats_schemas'` error

### 2. **flake8 + flake8-import-order** - Linting & Import Validation  
- **Purpose**: Code style, unused imports, import order validation
- **Configuration**: `the-pile-api/.flake8`
- **Run**: `cd the-pile-api && flake8 .`

### 3. **bandit** - Security Analysis
- **Purpose**: Identifies common security issues
- **Run**: `cd the-pile-api && bandit -r .`

### 4. **black** - Code Formatting (existing)
- **Purpose**: Consistent code formatting
- **Run**: `cd the-pile-api && black .`

### 5. **isort** - Import Sorting (existing)
- **Purpose**: Consistent import organization  
- **Run**: `cd the-pile-api && isort .`

## Usage Workflows

### Local Development

#### Quick Quality Check
```bash
cd the-pile-api
./scripts/quality-check.sh
```

#### Setup Virtual Environment & Install Dependencies
```bash
cd the-pile-api

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install development dependencies
pip install -r requirements-dev.txt
```

#### Individual Tools
```bash
# Type checking (catches import errors)
mypy .

# Linting (style + imports)
flake8 .

# Security scanning
bandit -r .

# Format code
black .
isort .
```

### Pre-commit Hooks (Recommended)

Install pre-commit hooks to run checks automatically:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run on all files (optional)
pre-commit run --all-files
```

Now quality checks run automatically on every commit!

### CI/CD Pipeline

GitHub Actions automatically run quality checks on:
- All pushes to `main` and `develop` branches
- All pull requests to `main` and `develop` branches

**Pipeline includes**:
- Code formatting verification (black, isort)
- Linting (flake8)
- Type checking (mypy) ← **Would have prevented the production error**
- Security analysis (bandit)
- Test coverage reporting

### Railway Deployment Protection

To prevent deployment of code that fails quality checks:

1. **Enable branch protection** on `main` branch in GitHub
2. **Require status checks** before merging:
   - `python-quality` job must pass
   - `frontend-quality` job must pass

## Error Prevention Examples

### Import Errors (Like the Recent Production Issue)
```python
# This would be caught by mypy:
from app.schemas.stats_schemas import RealityCheck  # ❌ Module not found

# Correct:
from app.schemas.stats import RealityCheck  # ✅ Valid import
```

### Type Safety
```python
# This would be caught by mypy:
def calculate_score(user_id: str) -> int:  # ❌ Expected int, got str
    return user_id * 2

# Correct:
def calculate_score(user_id: int) -> int:  # ✅ Type safe
    return user_id * 2
```

### Security Issues
```python
# This would be caught by bandit:
password = "hardcoded_password"  # ❌ Security risk

# Better:
password = os.getenv("PASSWORD")  # ✅ Environment variable
```

## Integration with Existing Workflow

### Development Workflow
1. Write code
2. Run `./scripts/quality-check.sh` (or rely on pre-commit hooks)
3. Fix any issues
4. Commit and push
5. CI/CD automatically validates
6. Deploy only if all checks pass

### New Dependencies
When adding dependencies, update:
- `pyproject.toml` for runtime dependencies
- `mypy.ini` if the library needs type stubs

## Configuration Files

- **mypy**: `the-pile-api/mypy.ini`
- **flake8**: `the-pile-api/.flake8`  
- **pre-commit**: `.pre-commit-config.yaml`
- **GitHub Actions**: `.github/workflows/quality-checks.yml`
- **Quality script**: `the-pile-api/scripts/quality-check.sh`

## Troubleshooting

### mypy Errors
- Missing type stubs: Add to `mypy.ini` `ignore_missing_imports = True`
- False positives: Use `# type: ignore` comments sparingly

### flake8 Errors
- Line too long: Handled by black automatically
- Import order: Run `isort .` to fix

### Pre-commit Issues
- Bypass for emergency: `git commit --no-verify`
- Update hooks: `pre-commit autoupdate`

## Benefits

✅ **Prevents production errors** like import failures
✅ **Consistent code quality** across the team  
✅ **Security vulnerability detection**
✅ **Automated enforcement** via CI/CD
✅ **Fast feedback loop** with pre-commit hooks
✅ **Type safety** catches errors at development time