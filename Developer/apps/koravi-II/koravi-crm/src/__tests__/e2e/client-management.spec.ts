import { test, expect } from '@playwright/test';
import { TestHelpers, DatabaseTestHelpers } from './utils/test-helpers';
import { testClients, newClientData, updatedClientData } from './fixtures/test-data';

test.describe('Client Management - Critical User Journeys', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    // Clean up any existing test data
    await DatabaseTestHelpers.cleanupTestData();
  });

  test.afterEach(async () => {
    // Clean up test data after each test
    await DatabaseTestHelpers.cleanupTestData();
  });

  test.describe('Client List and Search', () => {
    test('should display client list and perform search operations', async ({ page }) => {
      // Setup: Create test clients
      await DatabaseTestHelpers.createMultipleTestClients(testClients);

      // Navigate to clients page
      await helpers.navigateToClients();

      // Verify all clients are displayed
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientInList('Emma', 'Williams');

      // Test search functionality
      await helpers.performClientListSearch('Sarah');
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientNotInList('Michael', 'Chen');
      await helpers.expectClientNotInList('Emma', 'Williams');

      // Test search by email
      await helpers.performClientListSearch('michael.chen@email.com');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientNotInList('Sarah', 'Johnson');

      // Test search by phone
      await helpers.performClientListSearch('555-0789');
      await helpers.expectClientInList('Emma', 'Williams');

      // Clear search and verify all clients return
      await helpers.performClientListSearch('');
      await helpers.expectClientInList('Sarah', 'Johnson');
      await helpers.expectClientInList('Michael', 'Chen');
      await helpers.expectClientInList('Emma', 'Williams');
    });

    test('should handle empty search results gracefully', async ({ page }) => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);
      await helpers.navigateToClients();

      // Search for non-existent client
      await helpers.performClientListSearch('NonExistentClient');
      
      // Verify no results message or empty state
      await expect(page.getByText('No clients found')).toBeVisible();
    });

    test('should display proper loading states during search', async ({ page }) => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);
      await helpers.navigateToClients();

      // Perform search and check for loading indicators
      await helpers.performClientListSearch('Sarah');
      
      // The search should complete and show results
      await helpers.expectClientInList('Sarah', 'Johnson');
    });
  });

  test.describe('Client Creation', () => {
    test('should create a new client with complete form data', async ({ page }) => {
      await helpers.navigateToNewClient();

      // Fill out the complete form
      await helpers.fillClientForm(newClientData);
      await helpers.submitForm();

      // Verify redirect to client profile
      await expect(page).toHaveURL(/\/clients\/[a-f0-9-]+$/);

      // Verify client data is displayed correctly
      await helpers.expectClientProfileData(newClientData);

      // Navigate back to client list and verify client appears
      await helpers.navigateToClients();
      await helpers.expectClientInList(newClientData.first_name, newClientData.last_name);
    });

    test('should create client with minimal required data', async ({ page }) => {
      await helpers.navigateToNewClient();

      // Fill only required fields
      const minimalData = {
        first_name: 'Minimal',
        last_name: 'Client',
        email: 'minimal@test.com',
      };

      await helpers.fillClientForm(minimalData);
      await helpers.submitForm();

      // Verify successful creation
      await expect(page).toHaveURL(/\/clients\/[a-f0-9-]+$/);
      await helpers.expectClientProfileData(minimalData);
    });

    test('should validate required fields and show errors', async ({ page }) => {
      await helpers.navigateToNewClient();

      // Try to submit empty form
      await helpers.submitForm();

      // Verify validation errors
      await helpers.expectFormError('First name is required');
      await helpers.expectFormError('Last name is required');
    });

    test('should validate email format', async ({ page }) => {
      await helpers.navigateToNewClient();

      await helpers.fillClientForm({
        first_name: 'Test',
        last_name: 'User',
        email: 'invalid-email',
      });

      await helpers.submitForm();
      await helpers.expectFormError('Please enter a valid email address');
    });

    test('should handle form submission errors gracefully', async ({ page }) => {
      await helpers.navigateToNewClient();

      // Fill form with data that might cause server error
      await helpers.fillClientForm({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
      });

      // Mock network failure or server error
      await page.route('**/rest/v1/clients', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await helpers.submitForm();
      await helpers.expectErrorToast('Failed to create client');
    });
  });

  test.describe('Client Profile and Editing', () => {
    test('should display client profile with all data', async ({ page }) => {
      // Create a test client
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);

      await helpers.navigateToClientProfile(client.id);

      // Verify all client data is displayed
      await helpers.expectClientProfileData(testClients[0]);
      
      // Verify labels are displayed
      await expect(page.getByText('VIP')).toBeVisible();
      await expect(page.getByText('Regular')).toBeVisible();

      // Verify alerts are displayed
      await expect(page.getByText('Allergic to certain products')).toBeVisible();
    });

    test('should enable inline editing and save changes', async ({ page }) => {
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);
      await helpers.navigateToClientProfile(client.id);

      // Enable edit mode
      await helpers.enableEditMode();

      // Make changes
      await helpers.fillClientForm(updatedClientData);
      await helpers.saveChanges();

      // Verify changes are saved and displayed
      await helpers.expectClientProfileData(updatedClientData);
      await helpers.expectSuccessToast('Client updated successfully');
    });

    test('should cancel editing without saving changes', async ({ page }) => {
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);
      await helpers.navigateToClientProfile(client.id);

      // Enable edit mode and make changes
      await helpers.enableEditMode();
      await helpers.fillClientForm(updatedClientData);
      await helpers.cancelEdit();

      // Verify original data is still displayed
      await helpers.expectClientProfileData(testClients[0]);
    });

    test('should handle edit form validation errors', async ({ page }) => {
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);
      await helpers.navigateToClientProfile(client.id);

      await helpers.enableEditMode();

      // Clear required field
      await page.getByLabel('First Name').fill('');
      await helpers.saveChanges();

      // Verify validation error
      await helpers.expectFormError('First name is required');
    });
  });

  test.describe('Client Deletion', () => {
    test('should delete client with confirmation', async ({ page }) => {
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);
      await helpers.navigateToClientProfile(client.id);

      // Delete client
      await helpers.deleteClient();

      // Verify redirect to client list
      await helpers.expectCurrentUrl('/clients');
      await helpers.expectSuccessToast('Client deleted successfully');

      // Verify client is no longer in the list
      await helpers.expectClientNotInList(testClients[0].first_name, testClients[0].last_name);
    });

    test('should cancel deletion when user cancels confirmation', async ({ page }) => {
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);
      await helpers.navigateToClientProfile(client.id);

      // Cancel deletion
      await helpers.cancelDelete();

      // Verify still on client profile page
      await helpers.expectCurrentUrl(`/clients/${client.id}`);
      await helpers.expectClientProfileData(testClients[0]);
    });

    test('should handle deletion errors gracefully', async ({ page }) => {
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);
      await helpers.navigateToClientProfile(client.id);

      // Mock deletion failure
      await page.route(`**/rest/v1/clients?id=eq.${client.id}`, route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      await helpers.deleteClient();
      await helpers.expectErrorToast('Failed to delete client');
    });
  });

  test.describe('Navigation and Global Search', () => {
    test('should navigate between sections using sidebar', async ({ page }) => {
      await page.goto('/');

      // Test sidebar navigation
      await page.getByRole('link', { name: 'Clients' }).click();
      await helpers.expectCurrentUrl('/clients');

      await page.getByRole('link', { name: 'Dashboard' }).click();
      await helpers.expectCurrentUrl('/');
    });

    test('should perform global search from top bar', async ({ page }) => {
      // Create test clients
      await DatabaseTestHelpers.createMultipleTestClients(testClients);
      
      await page.goto('/');

      // Perform global search
      await helpers.performGlobalSearch('Sarah');

      // Verify search results dropdown appears
      await expect(page.getByText('Sarah Johnson')).toBeVisible();
      
      // Click on search result
      await page.getByText('Sarah Johnson').click();
      
      // Verify navigation to client profile
      await expect(page).toHaveURL(/\/clients\/[a-f0-9-]+$/);
    });

    test('should collapse and expand sidebar', async ({ page }) => {
      await page.goto('/');

      // Find and click sidebar toggle
      const sidebarToggle = page.getByRole('button', { name: 'Toggle sidebar' });
      await sidebarToggle.click();

      // Verify sidebar is collapsed (check for collapsed state)
      await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute('data-collapsed', 'true');

      // Expand sidebar
      await sidebarToggle.click();
      await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute('data-collapsed', 'false');
    });
  });

  test.describe('Responsive Design and Mobile', () => {
    test('should work properly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await DatabaseTestHelpers.createTestClient(testClients[0]);
      await helpers.navigateToClients();

      // Verify mobile layout
      await helpers.expectClientInList('Sarah', 'Johnson');
      
      // Test mobile navigation
      const mobileMenuButton = page.getByRole('button', { name: 'Menu' });
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await helpers.expectCurrentUrl('/');
      }
    });

    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const client = await DatabaseTestHelpers.createTestClient(testClients[0]);
      await helpers.navigateToClients();

      // Test touch interaction with client card
      await page.getByText('Sarah Johnson').tap();
      await helpers.expectCurrentUrl(`/clients/${client.id}`);
    });
  });
});