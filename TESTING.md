# Testing Strategy

This project implements a comprehensive testing strategy covering unit, integration, and end-to-end (E2E) tests.

## 1. Unit & Component Tests

We use **Jest** and **React Testing Library** for unit and component integration tests.

- **Framework**: Jest
- **Environment**: jsdom
- **Location**: `tests/unit/`, `app/**/*.test.tsx`, `lib/**/*.test.ts`

### Running Unit Tests

```bash
npm test
```

To watch for changes:

```bash
npm run test:watch
```

### Key Test Files

- `lib/encryption.test.ts`: Verifies AES-256-CBC encryption/decryption logic.
- `app/login/page.test.tsx`: Tests the Login page UI, interaction with OAuth buttons, and the dynamic Bitget form.

## 2. End-to-End (E2E) Tests

We use **Playwright** for E2E testing to simulate real user interactions across different browsers.

- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Location**: `tests/e2e/`

### Running E2E Tests

First, install browsers:

```bash
npx playwright install --with-deps
```

Run tests:

```bash
npm run test:e2e
```

### Key Scenarios

- **Login Page**: Verifies that all exchange login options are visible and that the Bitget form expands correctly.

## 3. Continuous Integration (CI)

We use **GitHub Actions** to automatically run tests on every push and pull request to `main`.

- **Workflow File**: `.github/workflows/ci.yml`
- **Steps**:
  1. Install dependencies
  2. Install Playwright browsers
  3. Run Unit Tests (`npm test`)
  4. Run E2E Tests (`npm run test:e2e`)
  5. Upload Test Reports as artifacts
