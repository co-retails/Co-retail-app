# Playwright Test Configuration

## Test Structure

- `tests/app.spec.ts` - Basic app initialization and core functionality tests
- `tests/flows.spec.ts` - User flow tests for different roles and features
- `tests/e2e.spec.ts` - End-to-end integration tests and cross-browser tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug

# Run specific test file
npx playwright test tests/app.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium
```

## Test Coverage

### Store Staff Role
- Home screen navigation
- Shipping/deliveries management
- Items management
- Scan functionality
- Sellers screen
- Returns flow
- Stock check

### Partner Role
- Partner dashboard
- Order creation
- Product management

### Common Features
- Role switching
- Navigation
- Responsive design
- Error handling
- Accessibility

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: http://localhost:3000
- Automatically starts dev server before tests
- Tests run in parallel
- Screenshots on failure
- HTML report generated

## Notes

- Tests use flexible selectors to handle dynamic content
- Timeouts are generous to account for lazy-loaded components
- Tests check for element visibility before interaction to avoid flakiness


