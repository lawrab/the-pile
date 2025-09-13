# E2E Tests for The Pile

End-to-end tests using Playwright to ensure critical user flows work correctly across different browsers and devices.

## 🎯 Test Coverage

### Authentication Flow (`auth-flow.spec.ts`)
- Landing page display
- Steam OAuth initiation  
- Authentication error handling
- Protected route access control

### Pile Visualization (`pile-visualization.spec.ts`)
- 3D pile visualization loading and interaction
- Statistics display and calculations
- Loading states and error handling
- WebGL canvas functionality

### Game Management (`game-management.spec.ts`)
- Game detail modal interactions
- Status changes (amnesty, playing, completed)
- Search and filtering functionality
- Keyboard navigation and shortcuts

### Steam Integration (`steam-integration.spec.ts`)
- Steam library import process
- Playtime synchronization
- Rate limiting handling
- Profile information display

### Complete User Journey (`user-journey.spec.ts`)
- End-to-end critical path testing
- Mobile responsiveness
- Accessibility compliance
- Network error resilience

## 🚀 Getting Started

### Installation

```bash
cd e2e-tests
npm install
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run specific test file
npx playwright test auth-flow.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
```

### View Test Reports

```bash
# Generate and open HTML report
npm run report

# View test results
npx playwright show-report
```

## 🔧 Configuration

### Test Environment Setup

The tests automatically:
1. Start the frontend dev server (`http://localhost:3000`)
2. Start the backend API server (`http://localhost:8000`)  
3. Wait for both services to be ready
4. Set up test database with sample data
5. Clean up after test completion

### Browser Coverage

Tests run across multiple browsers:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome Mobile, Safari Mobile

### Test Data

- Uses isolated test database
- Mock Steam API responses
- Sample user and game data fixtures
- Automatic cleanup between test runs

## 📝 Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authentication, routes, etc.
  })

  test('should do something specific', async ({ page }) => {
    // Test implementation
  })
})
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Mock external APIs** to avoid dependencies
3. **Test user interactions**, not implementation details
4. **Include error scenarios** and edge cases
5. **Make tests independent** - each test should work in isolation

### Data Test IDs

Use these standardized test IDs in components:

```typescript
// Navigation
data-testid="nav-pile"
data-testid="nav-stats" 
data-testid="nav-cemetery"

// Game Management
data-testid="game-card"
data-testid="game-detail-modal"
data-testid="grant-amnesty-button"
data-testid="start-playing-button"
data-testid="mark-completed-button"

// Steam Integration
data-testid="import-steam-games"
data-testid="sync-playtime"
data-testid="last-import"

// Statistics
data-testid="shame-score"
data-testid="total-games"
data-testid="unplayed-count"
data-testid="stats-card"

// UI States
data-testid="loading"
data-testid="error-state"
data-testid="success-toast"
data-testid="error-toast"
```

## 🐛 Debugging Tests

### Common Issues

1. **Timeouts**: Increase timeout for slow operations
   ```typescript
   await page.waitForSelector('selector', { timeout: 10000 })
   ```

2. **Race Conditions**: Wait for network requests to complete
   ```typescript
   await page.waitForResponse('**/api/v1/pile/')
   ```

3. **Authentication**: Ensure auth token is set in beforeEach
   ```typescript
   await page.addInitScript(() => {
     window.localStorage.setItem('auth-token', 'mock-token')
   })
   ```

### Debugging Tools

- Use `--debug` flag to step through tests
- Add `await page.pause()` to stop execution
- Use `page.screenshot()` to capture visual state
- Check browser console: `page.on('console', console.log)`

## 🎭 Mock Strategies

### API Mocking

```typescript
// Success response
await page.route('**/api/v1/pile/', route => {
  route.fulfill({ 
    status: 200, 
    body: JSON.stringify(mockPileData) 
  })
})

// Error response
await page.route('**/api/v1/pile/amnesty/*', route => {
  route.fulfill({ 
    status: 400, 
    body: JSON.stringify({ detail: 'Game not found' }) 
  })
})

// Network failure
await page.route('**/api/v1/**', route => {
  route.abort('failed')
})
```

### Authentication Mocking

```typescript
await page.addInitScript(() => {
  window.localStorage.setItem('auth-token', 'mock-token-for-testing')
  window.localStorage.setItem('user-profile', JSON.stringify({
    steam_id: '76561197960435530',
    username: 'TestUser',
    avatar_url: 'https://example.com/avatar.jpg'
  }))
})
```

## 📊 Performance Testing

Tests include basic performance checks:
- Page load times
- 3D rendering frame rates  
- API response times
- Memory usage patterns

## 🔄 CI Integration (Future)

When ready for CI/CD:
1. Add GitHub Actions workflow
2. Run tests on PR creation
3. Generate test reports as artifacts
4. Set up failure notifications
5. Include visual regression testing

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)