import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the Koravi CRM landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Koravi CRM' })).toBeVisible();
    
    // Check that the description is present
    await expect(page.getByText('A modern, minimal CRM designed specifically for solo beauty professionals')).toBeVisible();
    
    // Check that the welcome section is visible
    await expect(page.getByRole('heading', { name: 'Welcome to Koravi' })).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Next.js/);
  });
});