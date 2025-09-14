# Test Plan for The Pile - Personality & Engagement Features

## Overview
This document outlines the test strategy for the new personality-driven features and engagement systems added to The Pile application.

## Test Suites

### 1. PersonalityService Tests
**File:** `src/lib/personality-service.test.ts`

#### Unit Tests:
- **getGreeting()**
  - Test time-based greeting variations
  - Test special case messages (>100 unplayed, >50 never touched, >$1000 value)
  - Test empty pile handling
  - Test randomization of messages
  - Mock Date for consistent time-based testing

- **getRecommendations()**
  - Test quick wins identification (short/indie games)
  - Test redemption arc games (started but abandoned)
  - Test mercy kill suggestions (3+ years old)
  - Test weekend project recommendations (recent purchases)
  - Test empty pile handling
  - Test recommendation confidence scoring

- **getActionPlan()**
  - Test daily quick win generation
  - Test weekend warrior plan (only on Fri/Sat)
  - Test purge suggestions when pile > 20
  - Test "break the seal" for untouched games
  - Test streak challenge generation
  - Test appropriate difficulty assignment

- **getMotivationalMessage()**
  - Test message variety for each action type
  - Test randomization
  - Ensure no offensive or inappropriate content

- **getPileAnalysis()**
  - Test genre analysis with various distributions
  - Test sale pattern detection
  - Test completion time calculations
  - Test edge cases (empty pile, single game)

### 2. PersonalityDashboard Component Tests
**File:** `src/components/personality-dashboard.test.tsx`

#### Component Tests:
- **Rendering Tests**
  - Renders greeting message correctly
  - Displays shame score prominently
  - Shows insights with rotation
  - Renders action plans with correct icons
  - Displays recommendations with images

- **Interaction Tests**
  - Greeting updates every 30 seconds
  - Insights rotate every 5 seconds
  - Action plan items are clickable
  - Recommendation items show hover states
  - Quick stats display correct calculations

- **Data Handling**
  - Handles empty pile gracefully
  - Updates when pile data changes
  - Correctly categorizes games
  - Displays appropriate difficulty badges

- **Accessibility Tests**
  - All interactive elements have proper ARIA labels
  - Color contrast meets WCAG standards
  - Keyboard navigation works correctly
  - Screen reader announces changes

### 3. Integration Tests
**File:** `src/app/pile/page.test.tsx`

#### Page Integration:
- **Dashboard Integration**
  - PersonalityDashboard loads with pile data
  - Shame score fetches correctly
  - Loading states show witty messages
  - Error states handled gracefully

- **User Flow Tests**
  - New user sees appropriate empty state
  - Returning user sees personalized greeting
  - Game actions update dashboard immediately
  - Navigation between sections works

### 4. E2E Tests
**File:** `cypress/e2e/personality-features.cy.ts`

#### User Journey Tests:
- **First Time User**
  ```typescript
  it('shows engaging onboarding for new users', () => {
    cy.login()
    cy.visit('/pile')
    cy.contains('Your pile is empty')
    cy.contains('Import your Steam library')
  })
  ```

- **Returning User with Pile**
  ```typescript
  it('shows personality dashboard with recommendations', () => {
    cy.loginWithPile()
    cy.visit('/pile')
    cy.contains(/Welcome back|Oh, it's you again/)
    cy.contains('Your Redemption Arc')
    cy.contains('What to Play Next')
  })
  ```

- **Action Plan Interaction**
  ```typescript
  it('allows user to interact with action plans', () => {
    cy.loginWithPile()
    cy.visit('/pile')
    cy.contains("Today's Quick Win").click()
    // Should navigate or show game details
  })
  ```

### 5. Performance Tests

#### Metrics to Monitor:
- Dashboard render time < 100ms
- Greeting rotation doesn't cause re-renders
- Insight cycling is smooth (60fps)
- No memory leaks from intervals
- Bundle size impact < 50KB

### 6. Visual Regression Tests
**Tool:** Percy or Chromatic

#### Snapshots:
- Dashboard with various pile sizes
- Different greeting variations
- Action plan states (easy/medium/hard)
- Recommendation categories
- Loading states
- Empty states

## Mock Data Requirements

### Test Fixtures:
```typescript
// fixtures/pile.ts
export const mockEmptyPile = []

export const mockSmallPile = [
  // 5-10 games with varied statuses
]

export const mockLargePile = [
  // 100+ games for stress testing
]

export const mockShamePile = [
  // High shame score scenario
  // Many unplayed, old games
]

export const mockRedemptionPile = [
  // Mix of completed and playing
  // Good completion rate
]
```

## Testing Utilities

### Custom Test Helpers:
```typescript
// test-utils/personality.ts
export function mockTimeOfDay(hour: number) {
  jest.spyOn(Date.prototype, 'getHours').mockReturnValue(hour)
}

export function createMockPile(config: PileConfig): PileEntry[] {
  // Generate pile based on config
}

export function renderWithPile(component: ReactElement, pile: PileEntry[]) {
  // Render with mock data providers
}
```

## Coverage Requirements

- **Unit Tests:** 90% coverage for PersonalityService
- **Component Tests:** 85% coverage for UI components
- **Integration Tests:** Critical user paths covered
- **E2E Tests:** Happy path + key edge cases

## Testing Schedule

### Phase 1: Unit Tests (Week 1)
- PersonalityService complete
- Mock data fixtures ready

### Phase 2: Component Tests (Week 2)
- PersonalityDashboard tests
- Visual regression setup

### Phase 3: Integration & E2E (Week 3)
- User flow testing
- Performance benchmarks

## CI/CD Integration

### GitHub Actions Workflow:
```yaml
name: Test Personality Features
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:components
      - run: npm run test:e2e
```

## Monitoring & Analytics

### Metrics to Track:
- Engagement with recommendations (click rate)
- Action plan completion rate
- Time spent on dashboard
- Greeting message effectiveness (A/B test)
- User retention after feature launch

## Rollback Plan

If issues are detected:
1. Feature flag to disable personality features
2. Revert to previous dashboard
3. Maintain data compatibility
4. Clear communication to users

---

## Notes

- Tests should be written alongside feature development
- Use MSW for API mocking in all test levels
- Ensure tests run in < 5 minutes total
- Document any flaky tests for investigation