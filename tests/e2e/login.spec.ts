import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should display login options', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page).toHaveTitle(/CryptoConnect/);
    await expect(page.getByText('Log in with Gemini')).toBeVisible();
    await expect(page.getByText('Log in with Binance')).toBeVisible();
    await expect(page.getByText('Log in with Coinbase')).toBeVisible();
  });

  test('should expand Bitget form', async ({ page }) => {
    await page.goto('/login');
    
    const bitgetBtn = page.getByText('Log in with Bitget');
    await bitgetBtn.click();
    
    await expect(page.getByPlaceholder('Enter your API Key')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your API Secret')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your Passphrase')).toBeVisible();
  });

  // Note: We cannot test actual OAuth flow without mocking the external service or using mock credentials
  // But we can verify the redirect logic if we mock the API response or check navigation
});
