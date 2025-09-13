#!/usr/bin/env bash

# The Pile - Comprehensive Test Runner
# Runs all test suites for The Pile project

set -e

echo "🧪 The Pile - Comprehensive Test Suite"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists python3; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "Node.js and npm are required but not installed"
        exit 1
    fi
    
    if ! command_exists git; then
        print_error "Git is required but not installed"
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
}

# Install dependencies if needed
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    if [ -d "the-pile-api" ]; then
        cd the-pile-api
        if [ ! -d "venv" ]; then
            print_warning "Python virtual environment not found, creating one..."
            python3 -m venv venv
        fi
        
        source venv/bin/activate
        if ! pip show pytest >/dev/null 2>&1; then
            print_status "Installing backend test dependencies..."
            pip install pytest pytest-cov pytest-mock pytest-asyncio
        fi
        deactivate
        cd ..
    fi
    
    # Frontend dependencies
    if [ -d "the-pile-web" ]; then
        cd the-pile-web
        if [ ! -d "node_modules" ]; then
            print_status "Installing frontend dependencies..."
            npm install
        fi
        cd ..
    fi
    
    # E2E test dependencies
    if [ -d "e2e-tests" ]; then
        cd e2e-tests
        if [ ! -d "node_modules" ]; then
            print_status "Installing E2E test dependencies..."
            npm install
            npx playwright install
        fi
        cd ..
    fi
    
    print_success "Dependencies installed"
}

# Run backend tests
run_backend_tests() {
    print_status "Running backend API tests..."
    
    if [ ! -d "the-pile-api" ]; then
        print_warning "Backend directory not found, skipping backend tests"
        return 0
    fi
    
    cd the-pile-api
    
    if [ ! -d "venv" ]; then
        print_error "Python virtual environment not found"
        cd ..
        return 1
    fi
    
    source venv/bin/activate
    
    # Set PYTHONPATH to include current directory and run tests with coverage
    export PYTHONPATH="${PYTHONPATH}:$(pwd)"
    if pytest tests/ --cov=app --cov-report=term --cov-report=html:htmlcov -v; then
        print_success "Backend tests passed"
        deactivate
        cd ..
        return 0
    else
        print_error "Backend tests failed"
        deactivate
        cd ..
        return 1
    fi
}

# Run frontend tests
run_frontend_tests() {
    print_status "Running frontend component tests..."
    
    if [ ! -d "the-pile-web" ]; then
        print_warning "Frontend directory not found, skipping frontend tests"
        return 0
    fi
    
    cd the-pile-web
    
    if [ ! -d "node_modules" ]; then
        print_error "Node modules not found, run npm install first"
        cd ..
        return 1
    fi
    
    # Run tests with coverage
    if npm run test:coverage -- --passWithNoTests; then
        print_success "Frontend tests passed"
        cd ..
        return 0
    else
        print_error "Frontend tests failed"
        cd ..
        return 1
    fi
}

# Run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests with Playwright..."
    
    if [ ! -d "e2e-tests" ]; then
        print_warning "E2E tests directory not found, skipping E2E tests"
        return 0
    fi
    
    cd e2e-tests
    
    if [ ! -d "node_modules" ]; then
        print_error "Node modules not found for E2E tests"
        cd ..
        return 1
    fi
    
    # Run E2E tests
    if npm test; then
        print_success "E2E tests passed"
        cd ..
        return 0
    else
        print_error "E2E tests failed"
        cd ..
        return 1
    fi
}

# Run E2E tests with Chromium visually
run_e2e_tests_chromium() {
    print_status "Running E2E tests with visible Chromium browser..."
    
    if [ ! -d "e2e-tests" ]; then
        print_warning "E2E tests directory not found, skipping E2E tests"
        return 0
    fi
    
    cd e2e-tests
    
    if [ ! -d "node_modules" ]; then
        print_error "Node modules not found for E2E tests"
        cd ..
        return 1
    fi
    
    # Run E2E tests with Chromium (headless)
    if npm run test:chromium; then
        print_success "E2E Chromium tests passed"
        cd ..
        return 0
    else
        print_error "E2E Chromium tests failed"
        cd ..
        return 1
    fi
}

# Run E2E tests with Chromium visually (headed)
run_e2e_tests_chromium_headed() {
    print_status "Running E2E tests with visible Chromium browser..."
    
    if [ ! -d "e2e-tests" ]; then
        print_warning "E2E tests directory not found, skipping E2E tests"
        return 0
    fi
    
    cd e2e-tests
    
    if [ ! -d "node_modules" ]; then
        print_error "Node modules not found for E2E tests"
        cd ..
        return 1
    fi
    
    # Run E2E tests with visible Chromium
    if npm run test:chromium-headed; then
        print_success "E2E Chromium headed tests passed"
        cd ..
        return 0
    else
        print_error "E2E Chromium headed tests failed"
        cd ..
        return 1
    fi
}

# Generate test reports
generate_reports() {
    print_status "Generating test reports..."
    
    # Backend coverage report
    if [ -f "the-pile-api/htmlcov/index.html" ]; then
        print_success "Backend coverage report: the-pile-api/htmlcov/index.html"
    fi
    
    # Frontend coverage report
    if [ -f "the-pile-web/coverage/lcov-report/index.html" ]; then
        print_success "Frontend coverage report: the-pile-web/coverage/lcov-report/index.html"
    fi
    
    # E2E test report
    if [ -f "e2e-tests/playwright-report/index.html" ]; then
        print_success "E2E test report: e2e-tests/playwright-report/index.html"
    fi
}

# Main execution
main() {
    local backend_result=0
    local frontend_result=0
    local e2e_result=0
    
    check_prerequisites
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-install)
                SKIP_INSTALL=1
                shift
                ;;
            --backend-only)
                BACKEND_ONLY=1
                shift
                ;;
            --frontend-only)
                FRONTEND_ONLY=1
                shift
                ;;
            --e2e-only)
                E2E_ONLY=1
                shift
                ;;
            --e2e-chromium)
                E2E_CHROMIUM=1
                shift
                ;;
            --e2e-chromium-headed)
                E2E_CHROMIUM_HEADED=1
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-install         Skip dependency installation"
                echo "  --backend-only         Run only backend tests"
                echo "  --frontend-only        Run only frontend tests"
                echo "  --e2e-only             Run only E2E tests"
                echo "  --e2e-chromium         Run E2E tests headless (default)"
                echo "  --e2e-chromium-headed  Run E2E tests with visible browser"
                echo "  --help                 Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    if [ -z "$SKIP_INSTALL" ]; then
        install_dependencies
    fi
    
    echo ""
    print_status "Starting test execution..."
    echo ""
    
    # Run tests based on options
    if [ -n "$BACKEND_ONLY" ]; then
        run_backend_tests
        backend_result=$?
    elif [ -n "$FRONTEND_ONLY" ]; then
        run_frontend_tests
        frontend_result=$?
    elif [ -n "$E2E_ONLY" ]; then
        run_e2e_tests
        e2e_result=$?
    elif [ -n "$E2E_CHROMIUM" ]; then
        run_e2e_tests_chromium
        e2e_result=$?
    elif [ -n "$E2E_CHROMIUM_HEADED" ]; then
        run_e2e_tests_chromium_headed
        e2e_result=$?
    else
        # Run all tests
        run_backend_tests
        backend_result=$?
        
        run_frontend_tests
        frontend_result=$?
        
        run_e2e_tests
        e2e_result=$?
    fi
    
    echo ""
    print_status "Test Summary"
    echo "============"
    
    if [ -z "$FRONTEND_ONLY" ] && [ -z "$E2E_ONLY" ]; then
        if [ $backend_result -eq 0 ]; then
            print_success "✅ Backend Tests: PASSED"
        else
            print_error "❌ Backend Tests: FAILED"
        fi
    fi
    
    if [ -z "$BACKEND_ONLY" ] && [ -z "$E2E_ONLY" ]; then
        if [ $frontend_result -eq 0 ]; then
            print_success "✅ Frontend Tests: PASSED"
        else
            print_error "❌ Frontend Tests: FAILED"
        fi
    fi
    
    if [ -z "$BACKEND_ONLY" ] && [ -z "$FRONTEND_ONLY" ] || [ -n "$E2E_CHROMIUM" ]; then
        if [ $e2e_result -eq 0 ]; then
            if [ -n "$E2E_CHROMIUM" ]; then
                print_success "✅ E2E Chromium Tests: PASSED"
            else
                print_success "✅ E2E Tests: PASSED"
            fi
        else
            if [ -n "$E2E_CHROMIUM" ]; then
                print_error "❌ E2E Chromium Tests: FAILED"
            else
                print_error "❌ E2E Tests: FAILED"
            fi
        fi
    fi
    
    echo ""
    generate_reports
    echo ""
    
    # Overall result
    local total_failures=$((backend_result + frontend_result + e2e_result))
    
    if [ $total_failures -eq 0 ]; then
        print_success "🎉 All tests passed! Your pile is solid."
        exit 0
    else
        print_error "💥 Some tests failed. Check the output above for details."
        exit 1
    fi
}

# Run main function with all arguments
main "$@"