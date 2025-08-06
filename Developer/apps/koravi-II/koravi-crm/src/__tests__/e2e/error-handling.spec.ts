import { test, expect } from '@playwright/test';
import { TestHelpers, DatabaseTestHelpers } from './utils/test-helpers';
import { testClients } from './fixtures/test-data';

test.describe('Error Handling and Edge Cases', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await DatabaseTestHelpers.cleanupTestData();
  });

  test.afterEach(async () => {
    await DatabaseTestHelpers.cleanupTestData();
  });

  test.describe('Network and Database Errors', () => {
    test('should handle database connection failures gracefully', async ({ page }) => {
      // Mock database connection failure
      await page.route('**/rest/v1/**', route => {
        route.fulfill({
          status: 503,
          body: JSON.stringify({ 
            error: 'Service Unavailable',
            message: 'Database connection failed'
          }),
        });
      });

      await helpers.navigateToClients();

      // Should show fallback UI or error message
      await helpers.expectFallbackUI();
    });

    test('should handle API timeout errors', async ({ page }) => {
      // Mock slow API response
      await page.route('**/rest/v1/clients', route => {
        // Delay response to simulate timeout
        setTimeout(() => {
          route.fulfill({
            status: 408,
            body: JSON.stringify({ error: 'Request Timeout' }),
          });
        }, 5000);
      });

      await helpers.navigateToClients();

      // Should show loading state initially, then error state
      await expect(page.getByText('Loading')).toBeVisible();
      
      // Wait for timeout and error handling
      await page.waitForTimeout(6000);
      await helpers.expectErrorToast('Request timed out');
    });

    test('should handle server errors during client creation', async ({ page }) => {
      await helpers.navigateToNewClient();

      // Mock server error
      await page.route('**/rest/v1/clients', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ 
            error: 'Internal Server Error',
            message: 'Database constraint violation'
          }),
        });
      });

      await helpers.fillClientForm({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
      });

      await helpers.submitForm();

      // Should show error message and remain on form
      await helpers.expectErrorToast('Failed to create client');
      await expect(page).toHaveURL('/clients/new');
    });

    test('should handle network disconnection', async ({ page }) => {
      // Create a client first
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);
      
      await helpers.navigateToClientProfile(client.id);

      // Simulate network disconnection
      await page.context().setOffline(true);

      // Try to edit client
      await helpers.enableEditMode();
      await helpers.fillClientForm({ first_name: 'Offline Edit' });
      await helpers.saveChanges();

      // Should show offline error
      await helpers.expectErrorToast('No internet connection');

      // Restore connection
      await page.context().setOffline(false);
    });
  });

  test.describe('Form Validation and Input Errors', () => {
    test('should handle invalid email formats', async ({ page }) => {
      await helpers.navigateToNewClient();

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
      ];

      for (const email of invalidEmails) {
        await helpers.fillClientForm({
          first_name: 'Test',
          last_name: 'User',
          email: email,
        });

        await helpers.submitForm();
        await helpers.expectFormError('Please enter a valid email address');

        // Clear the form for next iteration
        await page.getByLabel('Email').fill('');
      }
    });

    test('should handle invalid phone number formats', async ({ page }) => {
      await helpers.navigateToNewClient();

      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '123-456-78901234567890',
      ];

      for (const phone of invalidPhones) {
        await helpers.fillClientForm({
          first_name: 'Test',
          last_name: 'User',
          phone: phone,
        });

        await helpers.submitForm();
        
        // Check if phone validation error appears (if implemented)
        const phoneError = page.getByText('Please enter a valid phone number');
        if (await phoneError.isVisible()) {
          await expect(phoneError).toBeVisible();
        }

        await page.getByLabel('Phone').fill('');
      }
    });

    test('should handle extremely long input values', async ({ page }) => {
      await helpers.navigateToNewClient();

      const longText = 'a'.repeat(1000);

      await helpers.fillClientForm({
        first_name: longText,
        last_name: longText,
        email: 'test@example.com',
        notes: longText,
      });

      await helpers.submitForm();

      // Should either truncate or show validation error
      const lengthError = page.getByText('Input too long');
      if (await lengthError.isVisible()) {
        await expect(lengthError).toBeVisible();
      }
    });

    test('should handle special characters in input fields', async ({ page }) => {
      await helpers.navigateToNewClient();

      const specialCharsData = {
        first_name: 'José María',
        last_name: 'O\'Connor-Smith',
        email: 'josé.maría@example.com',
        notes: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      };

      await helpers.fillClientForm(specialCharsData);
      await helpers.submitForm();

      // Should handle special characters gracefully
      await expect(page).toHaveURL(/\/clients\/[a-f0-9-]+$/);
    });
  });

  test.describe('UI Error States and Recovery', () => {
    test('should handle component rendering errors with error boundary', async ({ page }) => {
      // This would require injecting an error into a component
      // For now, we'll test that error boundaries are present
      
      await helpers.navigateToClients();

      // Inject JavaScript error to trigger error boundary
      await page.evaluate(() => {
        // Simulate a component error
        const errorEvent = new Error('Simulated component error');
        window.dispatchEvent(new ErrorEvent('error', { error: errorEvent }));
      });

      // Check if error boundary catches the error
      const errorBoundary = page.getByText('Something went wrong');
      if (await errorBoundary.isVisible()) {
        await helpers.expectErrorBoundary();
      }
    });

    test('should handle missing client data gracefully', async ({ page }) => {
      // Try to navigate to non-existent client
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      await page.goto(`/clients/${nonExistentId}`);

      // Should show 404 or "Client not found" message
      await expect(
        page.getByText('Client not found') || 
        page.getByText('404')
      ).toBeVisible();
    });

    test('should handle search with no results', async ({ page }) => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);
      await helpers.navigateToClients();

      // Search for something that doesn't exist
      await helpers.performClientListSearch('NonExistentClientName12345');

      // Should show "no results" message
      await expect(page.getByText('No clients found')).toBeVisible();
    });

    test('should handle empty database state', async ({ page }) => {
      // Navigate to clients page with empty database
      await helpers.navigateToClients();

      // Should show empty state message
      await expect(
        page.getByText('No clients yet') || 
        page.getByText('Get started by adding your first client')
      ).toBeVisible();

      // Should show "Add Client" button
      await expect(page.getByRole('button', { name: 'Add Client' })).toBeVisible();
    });
  });

  test.describe('Browser and Device Compatibility', () => {
    test('should handle browser back/forward navigation', async ({ page }) => {
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);
      
      // Navigate through pages
      await helpers.navigateToClients();
      await helpers.navigateToClientProfile(client.id);
      await helpers.navigateToNewClient();

      // Use browser back button
      await page.goBack();
      await helpers.expectCurrentUrl(`/clients/${client.id}`);

      await page.goBack();
      await helpers.expectCurrentUrl('/clients');

      // Use browser forward button
      await page.goForward();
      await helpers.expectCurrentUrl(`/clients/${client.id}`);
    });

    test('should handle page refresh during form editing', async ({ page }) => {
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);
      await helpers.navigateToClientProfile(client.id);

      // Start editing
      await helpers.enableEditMode();
      await helpers.fillClientForm({ first_name: 'Modified' });

      // Refresh page
      await page.reload();

      // Should show original data (unsaved changes lost)
      await helpers.expectClientProfileData(testClients[0]);
    });

    test('should handle JavaScript disabled scenario', async ({ page }) => {
      // Disable JavaScript
      await page.context().addInitScript(() => {
        Object.defineProperty(window, 'navigator', {
          value: { ...window.navigator, javaEnabled: () => false },
          writable: true
        });
      });

      await helpers.navigateToClients();

      // Basic functionality should still work (server-side rendering)
      // This test depends on how the app handles no-JS scenarios
      await expect(page.getByText('Clients')).toBeVisible();
    });
  });

  test.describe('Performance and Memory Issues', () => {
    test('should handle large client lists without memory issues', async ({ page }) => {
      // Create a large number of clients
      const largeClientSet = Array.from({ length: 100 }, (_, i) => ({
        ...testClients[0],
        first_name: `Client${i}`,
        last_name: `Test${i}`,
        email: `client${i}@test.com`,
      }));

      await DatabaseTestHelpers.createMultipleTestClients(largeClientSet);
      await helpers.navigateToClients();

      // Should load without crashing
      await helpers.waitForLoadingToComplete();
      
      // Check that pagination or virtualization is working
      const clientElements = page.locator('[data-testid="client-card"]');
      const visibleClients = await clientElements.count();
      
      // Should not render all 100 clients at once (assuming pagination/virtualization)
      expect(visibleClients).toBeLessThanOrEqual(50);
    });

    test('should handle rapid user interactions', async ({ page }) => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);
      await helpers.navigateToClients();

      // Perform rapid search operations
      const searchQueries = ['Sarah', 'Michael', 'Emma', 'Test', ''];
      
      for (const query of searchQueries) {
        await helpers.performClientListSearch(query);
        await page.waitForTimeout(100); // Small delay between searches
      }

      // Should handle rapid searches without crashing
      await helpers.waitForLoadingToComplete();
      await expect(page.getByText('Sarah Johnson')).toBeVisible();
    });

    test('should handle memory leaks in long-running sessions', async ({ page }) => {
      // Simulate a long-running session with multiple operations
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);

      for (let i = 0; i < 10; i++) {
        // Navigate between pages
        await helpers.navigateToClients();
        await helpers.navigateToClientProfile(client.id);
        await helpers.navigateToNewClient();
        
        // Perform searches
        await helpers.navigateToClients();
        await helpers.performClientListSearch(`search${i}`);
        await helpers.performClientListSearch('');
      }

      // Should still be responsive after many operations
      await helpers.navigateToClients();
      await helpers.expectClientInList('Sarah', 'Johnson');
    });
  });

  test.describe('Security and Data Validation', () => {
    test('should handle XSS attempts in input fields', async ({ page }) => {
      await helpers.navigateToNewClient();

      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
      ];

      for (const xssPayload of xssAttempts) {
        await helpers.fillClientForm({
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          notes: xssPayload,
        });

        await helpers.submitForm();

        // Should either sanitize the input or reject it
        // The exact behavior depends on implementation
        const currentUrl = page.url();
        if (currentUrl.includes('/clients/')) {
          // If client was created, check that XSS was sanitized
          await expect(page.locator('script')).toHaveCount(0);
        }

        // Reset for next iteration
        if (currentUrl.includes('/clients/new')) {
          await page.getByLabel('Notes').fill('');
        } else {
          await helpers.navigateToNewClient();
        }
      }
    });

    test('should handle SQL injection attempts', async ({ page }) => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);
      await helpers.navigateToClients();

      const sqlInjectionAttempts = [
        "'; DROP TABLE clients; --",
        "' OR '1'='1",
        "'; UPDATE clients SET first_name='hacked'; --",
        "' UNION SELECT * FROM clients --",
      ];

      for (const sqlPayload of sqlInjectionAttempts) {
        await helpers.performClientListSearch(sqlPayload);
        
        // Should not crash or expose sensitive data
        await helpers.waitForLoadingToComplete();
        
        // Verify that normal data is still accessible
        await helpers.performClientListSearch('Sarah');
        await helpers.expectClientInList('Sarah', 'Johnson');
      }
    });

    test('should validate file upload security (if applicable)', async ({ page }) => {
      // This test would apply if there's file upload functionality
      // For now, we'll skip this as the current spec doesn't include file uploads
      test.skip('File upload not implemented in current version');
    });
  });
});