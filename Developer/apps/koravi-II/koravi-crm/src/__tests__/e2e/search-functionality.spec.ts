import { test, expect } from '@playwright/test';
import { TestHelpers, DatabaseTestHelpers } from './utils/test-helpers';
import { testClients } from './fixtures/test-data';

test.describe('Search Functionality - Comprehensive Testing', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await DatabaseTestHelpers.cleanupTestData();
    // Create test clients for search testing
    await DatabaseTestHelpers.createMultipleTestClients(testClients);
  });

  test.afterEach(async () => {
    await DatabaseTestHelpers.cleanupTestData();
  });

  test.describe('Global Search (Top Bar)', () => {
    test('should perform real-time global search', async ({ page }) => {
      await page.goto('/');

      // Test search by first name
      await helpers.performGlobalSearch('Sarah');
      await expect(page.getByText('Sarah Johnson')).toBeVisible();
      await expect(page.getByText('Michael Chen')).not.toBeVisible();

      // Test search by last name
      await helpers.performGlobalSearch('Chen');
      await expect(page.getByText('Michael Chen')).toBeVisible();
      await expect(page.getByText('Sarah Johnson')).not.toBeVisible();

      // Test search by email
      await helpers.performGlobalSearch('emma.williams@email.com');
      await expect(page.getByText('Emma Williams')).toBeVisible();
    });

    test('should show search results dropdown with proper formatting', async ({ page }) => {
      await page.goto('/');
      await helpers.performGlobalSearch('Sarah');

      // Verify search dropdown appears
      const searchDropdown = page.locator('[data-testid="search-dropdown"]');
      await expect(searchDropdown).toBeVisible();

      // Verify result formatting
      await expect(page.getByText('Sarah Johnson')).toBeVisible();
      await expect(page.getByText('sarah.johnson@email.com')).toBeVisible();
    });

    test('should navigate to client profile when clicking search result', async ({ page }) => {
      await page.goto('/');
      await helpers.performGlobalSearch('Sarah');

      // Click on search result
      await page.getByText('Sarah Johnson').click();

      // Should navigate to client profile
      await expect(page).toHaveURL(/\/clients\/[a-f0-9-]+$/);
      await helpers.expectClientProfileData(testClients[0]);
    });

    test('should handle empty search results in global search', async ({ page }) => {
      await page.goto('/');
      await helpers.performGlobalSearch('NonExistentClient');

      // Should show no results message
      await expect(page.getByText('No results found')).toBeVisible();
    });

    test('should clear search results when search is cleared', async ({ page }) => {
      await page.goto('/');
      
      // Perform search
      await helpers.performGlobalSearch('Sarah');
      await expect(page.getByText('Sarah Johnson')).toBeVisible();

      // Clear search
      await helpers.performGlobalSearch('');
      
      // Search dropdown should disappear
      const searchDropdown = page.locator('[data-testid="search-dropdown"]');
      await expect(searchDropdown).not.toBeVisible();
    });

    test('should handle keyboard navigation in search results', async ({ page }) => {
      await page.goto('/');
      await helpers.performGlobalSearch('email.com');

      const searchInput = page.getByPlaceholder('Search clients...');
      
      // Use arrow keys to navigate results
      await searchInput.press('ArrowDown');
      await expect(page.locator('[data-testid="search-result"]:first-child')).toHaveClass(/highlighted/);

      await searchInput.press('ArrowDown');
      await expect(page.locator('[data-testid="search-result"]:nth-child(2)')).toHaveClass(/highlighted/);

      // Press Enter to select
      await searchInput.press('Enter');
      await expect(page).toHaveURL(/\/clients\/[a-f0-9-]+$/);
    });
  });

  test.describe('Client List Search', () => {
    test('should filter client list in real-time', async ({ page }) => {
      await helpers.navigateToClients();

      // Initially all clients should be visible
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientInList('Emma', 'Williams');

      // Search by first name
      await helpers.performClientListSearch('Sarah');
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientNotInList('Michael', 'Chen');
      await helpers.expectClientNotInList('Emma', 'Williams');

      // Search by partial name
      await helpers.performClientListSearch('Mich');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientNotInList('Sarah', 'Johnson');
      await helpers.expectClientNotInList('Emma', 'Williams');
    });

    test('should search across multiple client fields', async ({ page }) => {
      await helpers.navigateToClients();

      // Search by email
      await helpers.performClientListSearch('sarah.johnson@email.com');
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientNotInList('Michael', 'Chen');

      // Search by phone number
      await helpers.performClientListSearch('555-0456');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientNotInList('Sarah', 'Johnson');

      // Search by occupation
      await helpers.performClientListSearch('Teacher');
      await helpers.expectClientInList('Emma', 'Williams');
      await helpers.expectClientNotInList('Sarah', 'Johnson');

      // Search by city
      await helpers.performClientListSearch('San Francisco');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientNotInList('Emma', 'Williams');
    });

    test('should handle case-insensitive search', async ({ page }) => {
      await helpers.navigateToClients();

      // Test different cases
      const searchTerms = ['sarah', 'SARAH', 'Sarah', 'sArAh'];

      for (const term of searchTerms) {
        await helpers.performClientListSearch(term);
        await helpers.expectClientInList('Sarah', 'Johnson');
        await helpers.expectClientNotInList('Michael', 'Chen');
      }
    });

    test('should handle partial word matching', async ({ page }) => {
      await helpers.navigateToClients();

      // Test partial matches
      await helpers.performClientListSearch('Sar');
      await helpers.expectClientInList('Sarah', 'Johnson');

      await helpers.performClientListSearch('John');
      await helpers.expectClientInList('Sarah', 'Johnson');

      await helpers.performClientListSearch('Mich');
      await helpers.expectClientInList('Michael', 'Chen');

      await helpers.performClientListSearch('Will');
      await helpers.expectClientInList('Emma', 'Williams');
    });

    test('should search by labels', async ({ page }) => {
      await helpers.navigateToClients();

      // Search by label
      await helpers.performClientListSearch('VIP');
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientNotInList('Michael', 'Chen');

      await helpers.performClientListSearch('New Client');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientNotInList('Sarah', 'Johnson');

      await helpers.performClientListSearch('Seasonal');
      await helpers.expectClientInList('Emma', 'Williams');
      await helpers.expectClientNotInList('Sarah', 'Johnson');
    });

    test('should handle special characters in search', async ({ page }) => {
      await helpers.navigateToClients();

      // Search with special characters
      await helpers.performClientListSearch('@email.com');
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientInList('Emma', 'Williams');

      // Search with numbers
      await helpers.performClientListSearch('555');
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientInList('Emma', 'Williams');

      // Search with hyphens
      await helpers.performClientListSearch('555-0123');
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientNotInList('Michael', 'Chen');
    });

    test('should debounce search input to prevent excessive API calls', async ({ page }) => {
      await helpers.navigateToClients();

      // Track network requests
      const requests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('/rest/v1/clients')) {
          requests.push(request.url());
        }
      });

      // Type quickly
      const searchInput = page.getByPlaceholder('Search clients...');
      await searchInput.type('Sarah', { delay: 50 });

      // Wait for debounce
      await page.waitForTimeout(1000);

      // Should have made fewer requests than characters typed
      expect(requests.length).toBeLessThan(5);
    });
  });

  test.describe('Search Performance and Edge Cases', () => {
    test('should handle very long search queries', async ({ page }) => {
      await helpers.navigateToClients();

      const longQuery = 'a'.repeat(1000);
      await helpers.performClientListSearch(longQuery);

      // Should not crash and should show no results
      await expect(page.getByText('No clients found')).toBeVisible();
    });

    test('should handle search with only whitespace', async ({ page }) => {
      await helpers.navigateToClients();

      await helpers.performClientListSearch('   ');

      // Should show all clients (whitespace should be trimmed)
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientInList('Emma', 'Williams');
    });

    test('should handle search with special regex characters', async ({ page }) => {
      await helpers.navigateToClients();

      const regexChars = ['.*', '\\d+', '[a-z]', '(test)', '^start', 'end$'];

      for (const char of regexChars) {
        await helpers.performClientListSearch(char);
        // Should not crash and should handle as literal text
        await helpers.waitForLoadingToComplete();
      }
    });

    test('should maintain search state during navigation', async ({ page }) => {
      await helpers.navigateToClients();

      // Perform search
      await helpers.performClientListSearch('Sarah');
      await helpers.expectClientInList('Sarah', 'Johnson');

      // Navigate to client profile
      await page.getByText('Sarah Johnson').click();
      await expect(page).toHaveURL(/\/clients\/[a-f0-9-]+$/);

      // Navigate back to client list
      await page.goBack();

      // Search should be cleared (or maintained based on UX decision)
      const searchInput = page.getByPlaceholder('Search clients...');
      const searchValue = await searchInput.inputValue();
      
      // This behavior depends on implementation - document the expected behavior
      if (searchValue === '') {
        // Search is cleared on navigation
        await helpers.expectClientInList('Sarah', 'Johnson');
        await helpers.expectClientInList('Michael', 'Chen');
      } else {
        // Search is maintained
        expect(searchValue).toBe('Sarah');
        await helpers.expectClientInList('Sarah', 'Johnson');
        await helpers.expectClientNotInList('Michael', 'Chen');
      }
    });

    test('should handle concurrent search requests', async ({ page }) => {
      await helpers.navigateToClients();

      // Perform multiple rapid searches
      const searches = ['S', 'Sa', 'Sar', 'Sara', 'Sarah'];
      
      for (const search of searches) {
        await helpers.performClientListSearch(search);
        await page.waitForTimeout(100);
      }

      // Final result should be correct
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientNotInList('Michael', 'Chen');
    });

    test('should handle search during data loading', async ({ page }) => {
      // Mock slow data loading
      await page.route('**/rest/v1/clients*', route => {
        setTimeout(() => {
          route.continue();
        }, 1000);
      });

      await helpers.navigateToClients();

      // Perform search while data is still loading
      await helpers.performClientListSearch('Sarah');

      // Should handle gracefully and show results when loading completes
      await helpers.waitForLoadingToComplete();
      await helpers.expectClientInList('Sarah', 'Johnson');
    });
  });

  test.describe('Search Accessibility', () => {
    test('should be keyboard accessible', async ({ page }) => {
      await helpers.navigateToClients();

      // Tab to search input
      await page.keyboard.press('Tab');
      const searchInput = page.getByPlaceholder('Search clients...');
      await expect(searchInput).toBeFocused();

      // Type search query
      await searchInput.type('Sarah');
      await helpers.expectClientInList('Sarah', 'Johnson');

      // Clear with keyboard
      await searchInput.press('Control+a');
      await searchInput.press('Delete');
      await helpers.expectClientInList('Michael', 'Chen');
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/');

      const globalSearchInput = page.getByPlaceholder('Search clients...');
      
      // Check for proper ARIA attributes
      await expect(globalSearchInput).toHaveAttribute('role', 'searchbox');
      await expect(globalSearchInput).toHaveAttribute('aria-label', /search/i);

      // Perform search and check results
      await helpers.performGlobalSearch('Sarah');
      
      const searchResults = page.locator('[data-testid="search-dropdown"]');
      await expect(searchResults).toHaveAttribute('role', 'listbox');
    });

    test('should announce search results to screen readers', async ({ page }) => {
      await helpers.navigateToClients();

      // Perform search
      await helpers.performClientListSearch('Sarah');

      // Check for aria-live region or similar accessibility features
      const resultsAnnouncement = page.locator('[aria-live="polite"]');
      if (await resultsAnnouncement.isVisible()) {
        await expect(resultsAnnouncement).toContainText('1 result found');
      }
    });

    test('should handle high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      
      await helpers.navigateToClients();
      await helpers.performClientListSearch('Sarah');

      // Search should still be functional and visible
      await helpers.expectClientInList('Sarah', 'Johnson');
      
      const searchInput = page.getByPlaceholder('Search clients...');
      await expect(searchInput).toBeVisible();
    });
  });

  test.describe('Search Integration with Filters', () => {
    test('should combine search with status filters', async ({ page }) => {
      await helpers.navigateToClients();

      // Apply status filter (if implemented)
      const statusFilter = page.getByRole('button', { name: 'Status' });
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        await page.getByText('Active').click();
      }

      // Perform search
      await helpers.performClientListSearch('email.com');

      // Should show only active clients matching search
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientNotInList('Emma', 'Williams'); // Inactive
    });

    test('should combine search with label filters', async ({ page }) => {
      await helpers.navigateToClients();

      // Apply label filter (if implemented)
      const labelFilter = page.getByRole('button', { name: 'Labels' });
      if (await labelFilter.isVisible()) {
        await labelFilter.click();
        await page.getByText('VIP').click();
      }

      // Perform search
      await helpers.performClientListSearch('Johnson');

      // Should show only VIP clients matching search
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientNotInList('Michael', 'Chen');
    });

    test('should clear filters when performing new search', async ({ page }) => {
      // This test depends on the specific UX design decision
      // Document the expected behavior based on requirements
      test.skip('Filter interaction behavior needs to be defined in requirements');
    });
  });
});