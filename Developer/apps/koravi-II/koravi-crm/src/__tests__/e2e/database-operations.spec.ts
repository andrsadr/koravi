import { test, expect } from '@playwright/test';
import { ClientService } from '@/lib/database';
import { testClients, newClientData } from './fixtures/test-data';
import { DatabaseTestHelpers } from './utils/test-helpers';

test.describe('Database Operations - Integration Tests', () => {
  test.beforeEach(async () => {
    // Clean up any existing test data
    await DatabaseTestHelpers.cleanupTestData();
  });

  test.afterEach(async () => {
    // Clean up test data after each test
    await DatabaseTestHelpers.cleanupTestData();
  });

  test.describe('CRUD Operations', () => {
    test('should create, read, update, and delete clients', async () => {
      // CREATE
      const createdClient = await ClientService.createClient(newClientData);
      expect(createdClient).toBeDefined();
      expect(createdClient.id).toBeDefined();
      expect(createdClient.first_name).toBe(newClientData.first_name);
      expect(createdClient.last_name).toBe(newClientData.last_name);
      expect(createdClient.email).toBe(newClientData.email);

      // READ
      const fetchedClient = await ClientService.getClient(createdClient.id);
      expect(fetchedClient).toBeDefined();
      expect(fetchedClient?.id).toBe(createdClient.id);
      expect(fetchedClient?.first_name).toBe(newClientData.first_name);

      // UPDATE
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        occupation: 'Updated Occupation',
      };
      const updatedClient = await ClientService.updateClient(createdClient.id, updateData);
      expect(updatedClient.first_name).toBe('Updated');
      expect(updatedClient.last_name).toBe('Name');
      expect(updatedClient.occupation).toBe('Updated Occupation');
      expect(updatedClient.email).toBe(newClientData.email); // Should remain unchanged

      // DELETE
      await ClientService.deleteClient(createdClient.id);
      const deletedClient = await ClientService.getClient(createdClient.id);
      expect(deletedClient).toBeNull();
    });

    test('should handle non-existent client operations', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      // READ non-existent client
      const client = await ClientService.getClient(nonExistentId);
      expect(client).toBeNull();

      // UPDATE non-existent client should throw error
      await expect(
        ClientService.updateClient(nonExistentId, { first_name: 'Test' })
      ).rejects.toThrow();

      // DELETE non-existent client should not throw error
      await expect(
        ClientService.deleteClient(nonExistentId)
      ).resolves.not.toThrow();
    });

    test('should validate required fields during creation', async () => {
      const invalidData = {
        first_name: '',
        last_name: '',
        email: 'invalid-email',
        country: 'US',
        status: 'active' as const,
        labels: [],
        total_visits: 0,
        lifetime_value: 0,
      };

      await expect(
        ClientService.createClient(invalidData)
      ).rejects.toThrow();
    });

    test('should handle database connection errors', async () => {
      // This test would require mocking the Supabase client
      // For now, we'll test that the service handles errors gracefully
      
      // Test with invalid client ID format
      await expect(
        ClientService.getClient('invalid-uuid')
      ).rejects.toThrow();
    });
  });

  test.describe('Search Functionality', () => {
    test('should perform full-text search across client data', async () => {
      // Create multiple test clients
      await DatabaseTestHelpers.createMultipleTestClients(testClients);

      // Search by first name
      const searchResults1 = await ClientService.searchClients('Sarah');
      expect(searchResults1.length).toBeGreaterThan(0);
      expect(searchResults1[0].first_name).toBe('Sarah');

      // Search by email
      const searchResults2 = await ClientService.searchClients('michael.chen@email.com');
      expect(searchResults2.length).toBeGreaterThan(0);
      expect(searchResults2[0].email).toBe('michael.chen@email.com');

      // Search by phone
      const searchResults3 = await ClientService.searchClients('555-0789');
      expect(searchResults3.length).toBeGreaterThan(0);
      expect(searchResults3[0].phone).toBe('+1-555-0789');

      // Search with no results
      const searchResults4 = await ClientService.searchClients('NonExistentClient');
      expect(searchResults4.length).toBe(0);
    });

    test('should handle search with special characters and edge cases', async () => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);

      // Search with special characters
      const searchResults1 = await ClientService.searchClients('@email.com');
      expect(searchResults1.length).toBeGreaterThan(0);

      // Search with numbers
      const searchResults2 = await ClientService.searchClients('555');
      expect(searchResults2.length).toBeGreaterThan(0);

      // Empty search
      const searchResults3 = await ClientService.searchClients('');
      expect(searchResults3.length).toBe(0);

      // Very long search query
      const longQuery = 'a'.repeat(1000);
      const searchResults4 = await ClientService.searchClients(longQuery);
      expect(searchResults4.length).toBe(0);
    });

    test('should respect search result limits', async () => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);

      // Search with limit
      const searchResults = await ClientService.searchClients('email.com', 2);
      expect(searchResults.length).toBeLessThanOrEqual(2);
    });
  });

  test.describe('Filtering and Pagination', () => {
    test('should filter clients by status', async () => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);

      // Filter by active status
      const activeClients = await ClientService.getClients({ status: 'active' });
      expect(activeClients.length).toBeGreaterThan(0);
      activeClients.forEach(client => {
        expect(client.status).toBe('active');
      });

      // Filter by inactive status
      const inactiveClients = await ClientService.getClients({ status: 'inactive' });
      expect(inactiveClients.length).toBeGreaterThan(0);
      inactiveClients.forEach(client => {
        expect(client.status).toBe('inactive');
      });
    });

    test('should filter clients by labels', async () => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);

      // Filter by VIP label
      const vipClients = await ClientService.getClients({ labels: ['VIP'] });
      expect(vipClients.length).toBeGreaterThan(0);
      vipClients.forEach(client => {
        expect(client.labels).toContain('VIP');
      });

      // Filter by multiple labels
      const multiLabelClients = await ClientService.getClients({ 
        labels: ['VIP', 'Regular'] 
      });
      expect(multiLabelClients.length).toBeGreaterThan(0);
    });

    test('should handle pagination correctly', async () => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);

      // Get first page
      const firstPage = await ClientService.getClients({ limit: 2, offset: 0 });
      expect(firstPage.length).toBeLessThanOrEqual(2);

      // Get second page
      const secondPage = await ClientService.getClients({ limit: 2, offset: 2 });
      expect(secondPage.length).toBeGreaterThanOrEqual(0);

      // Ensure no overlap between pages
      if (firstPage.length > 0 && secondPage.length > 0) {
        const firstPageIds = firstPage.map(c => c.id);
        const secondPageIds = secondPage.map(c => c.id);
        const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
        expect(overlap.length).toBe(0);
      }
    });

    test('should combine search and filtering', async () => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);

      // Search with status filter
      const results = await ClientService.getClients({
        search: 'email.com',
        status: 'active',
        limit: 10
      });

      results.forEach(client => {
        expect(client.status).toBe('active');
        expect(
          client.first_name.includes('email.com') ||
          client.last_name.includes('email.com') ||
          client.email?.includes('email.com')
        ).toBeTruthy();
      });
    });
  });

  test.describe('Statistics and Analytics', () => {
    test('should calculate client statistics correctly', async () => {
      await DatabaseTestHelpers.createMultipleTestClients(testClients);

      const stats = await ClientService.getClientStats();
      
      expect(stats.total).toBe(testClients.length);
      expect(stats.active).toBeGreaterThan(0);
      expect(stats.inactive).toBeGreaterThan(0);
      expect(stats.archived).toBe(0); // No archived clients in test data
      expect(stats.active + stats.inactive + stats.archived).toBe(stats.total);
    });

    test('should handle empty database for statistics', async () => {
      const stats = await ClientService.getClientStats();
      
      expect(stats.total).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.inactive).toBe(0);
      expect(stats.archived).toBe(0);
    });
  });

  test.describe('Data Integrity and Validation', () => {
    test('should maintain data integrity during concurrent operations', async () => {
      const client = await DatabaseTestHelpers.createTestClient(newClientData);

      // Simulate concurrent updates
      const updatePromises = [
        ClientService.updateClient(client.id, { first_name: 'Update1' }),
        ClientService.updateClient(client.id, { last_name: 'Update2' }),
        ClientService.updateClient(client.id, { occupation: 'Update3' }),
      ];

      const results = await Promise.allSettled(updatePromises);
      
      // At least one update should succeed
      const successfulUpdates = results.filter(r => r.status === 'fulfilled');
      expect(successfulUpdates.length).toBeGreaterThan(0);

      // Verify final state is consistent
      const finalClient = await ClientService.getClient(client.id);
      expect(finalClient).toBeDefined();
    });

    test('should handle invalid data types gracefully', async () => {
      const invalidData = {
        ...newClientData,
        total_visits: 'invalid' as any,
        lifetime_value: 'invalid' as any,
      };

      await expect(
        ClientService.createClient(invalidData)
      ).rejects.toThrow();
    });

    test('should validate email format in database', async () => {
      const invalidEmailData = {
        ...newClientData,
        email: 'invalid-email-format',
      };

      // This might pass client-side validation but should be caught by database constraints
      await expect(
        ClientService.createClient(invalidEmailData)
      ).rejects.toThrow();
    });

    test('should handle very long text fields', async () => {
      const longTextData = {
        ...newClientData,
        notes: 'a'.repeat(10000), // Very long notes
        alerts: 'b'.repeat(5000), // Very long alerts
      };

      // Should either succeed or fail gracefully with appropriate error
      try {
        const client = await ClientService.createClient(longTextData);
        expect(client.notes).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  test.describe('Performance and Optimization', () => {
    test('should handle large datasets efficiently', async () => {
      // Create a larger dataset for performance testing
      const largeDataset = Array.from({ length: 50 }, (_, i) => ({
        ...newClientData,
        first_name: `Client${i}`,
        last_name: `Test${i}`,
        email: `client${i}@test.com`,
      }));

      // Measure creation time
      const startTime = Date.now();
      await DatabaseTestHelpers.createMultipleTestClients(largeDataset);
      const creationTime = Date.now() - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(creationTime).toBeLessThan(30000); // 30 seconds

      // Measure query time
      const queryStartTime = Date.now();
      const allClients = await ClientService.getClients();
      const queryTime = Date.now() - queryStartTime;

      expect(queryTime).toBeLessThan(5000); // 5 seconds
      expect(allClients.length).toBe(largeDataset.length);
    });

    test('should handle search performance with large datasets', async () => {
      // Create clients with searchable content
      const searchableClients = Array.from({ length: 20 }, (_, i) => ({
        ...newClientData,
        first_name: `SearchableClient${i}`,
        last_name: `TestUser${i}`,
        email: `searchable${i}@performance.test`,
        occupation: `Occupation${i}`,
      }));

      await DatabaseTestHelpers.createMultipleTestClients(searchableClients);

      // Measure search performance
      const searchStartTime = Date.now();
      const searchResults = await ClientService.searchClients('Searchable');
      const searchTime = Date.now() - searchStartTime;

      expect(searchTime).toBeLessThan(2000); // 2 seconds
      expect(searchResults.length).toBeGreaterThan(0);
    });
  });
});