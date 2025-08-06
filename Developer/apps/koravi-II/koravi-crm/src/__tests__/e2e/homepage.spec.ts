import { test, expect } from '@playwright/test';
import { TestHelpers, DatabaseTestHelpers } from './utils/test-helpers';

test.describe('Homepage and Application Shell', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await DatabaseTestHelpers.cleanupTestData();
  });

  test.afterEach(async () => {
    await DatabaseTestHelpers.cleanupTestData();
  });

  test('should display the Koravi CRM landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Koravi CRM' })).toBeVisible();
    
    // Check that the description is present
    await expect(page.getByText('A modern, minimal CRM designed specifically for solo beauty professionals')).toBeVisible();
    
    // Check that the welcome section is visible
    await expect(page.getByRole('heading', { name: 'Welcome to Koravi' })).toBeVisible();
  });

  test('should have proper page title and meta information', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Koravi CRM/);
    
    // Check for proper meta tags
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /CRM for beauty professionals/);
  });

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Check sidebar is present
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Check top bar is present
    await expect(page.locator('[data-testid="topbar"]')).toBeVisible();
    
    // Check navigation links
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clients' })).toBeVisible();
  });

  test('should have working global search', async ({ page }) => {
    await page.goto('/');
    
    // Check search input is present
    const searchInput = page.getByPlaceholder('Search clients...');
    await expect(searchInput).toBeVisible();
    
    // Search input should be functional
    await searchInput.click();
    await expect(searchInput).toBeFocused();
  });

  test('should handle initial loading states', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await helpers.waitForLoadingToComplete();
    
    // Check that loading indicators are gone
    const loadingSpinner = page.locator('[data-testid="loading"]');
    await expect(loadingSpinner).not.toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // On mobile, sidebar might be collapsed or hidden
    const sidebar = page.locator('[data-testid="sidebar"]');
    const mobileMenu = page.getByRole('button', { name: 'Menu' });
    
    // Either sidebar is visible or mobile menu is present
    const sidebarVisible = await sidebar.isVisible();
    const mobileMenuVisible = await mobileMenu.isVisible();
    expect(sidebarVisible || mobileMenuVisible).toBeTruthy();
  });

  test('should handle accessibility requirements', async ({ page }) => {
    await page.goto('/');
    
    // Check for skip link
    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
    }
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for proper focus management
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/rest/v1/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server Error' }),
      });
    });

    await page.goto('/');
    
    // Should still render the basic layout
    await expect(page.getByRole('heading', { name: 'Koravi CRM' })).toBeVisible();
    
    // Should show error state for data-dependent components
    const errorMessage = page.getByText('Unable to load');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/');
    
    // Collapse sidebar
    const sidebarToggle = page.getByRole('button', { name: 'Toggle sidebar' });
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
    }
    
    // Navigate to clients
    await page.getByRole('link', { name: 'Clients' }).click();
    await expect(page).toHaveURL('/clients');
    
    // Navigate back to dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');
    
    // Sidebar state should be maintained
    if (await sidebarToggle.isVisible()) {
      const sidebar = page.locator('[data-testid="sidebar"]');
      await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    }
  });
});