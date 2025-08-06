import { Page, expect } from '@playwright/test';
import { ClientService } from '@/lib/database';
import { ClientFormData } from '@/lib/types';

export class TestHelpers {
  constructor(private page: Page) {}

  // Navigation helpers
  async navigateToClients() {
    await this.page.goto('/clients');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToClientProfile(clientId: string) {
    await this.page.goto(`/clients/${clientId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToNewClient() {
    await this.page.goto('/clients/new');
    await this.page.waitForLoadState('networkidle');
  }

  // Search helpers
  async performGlobalSearch(query: string) {
    const searchInput = this.page.getByPlaceholder('Search clients...');
    await searchInput.fill(query);
    await this.page.waitForTimeout(500); // Wait for debounce
  }

  async performClientListSearch(query: string) {
    const searchInput = this.page.getByPlaceholder('Search clients...');
    await searchInput.fill(query);
    await this.page.waitForTimeout(500); // Wait for debounce
  }

  // Form helpers
  async fillClientForm(data: Partial<ClientFormData>) {
    if (data.first_name) {
      await this.page.getByLabel('First Name').fill(data.first_name);
    }
    if (data.last_name) {
      await this.page.getByLabel('Last Name').fill(data.last_name);
    }
    if (data.email) {
      await this.page.getByLabel('Email').fill(data.email);
    }
    if (data.phone) {
      await this.page.getByLabel('Phone').fill(data.phone);
    }
    if (data.occupation) {
      await this.page.getByLabel('Occupation').fill(data.occupation);
    }
    if (data.notes) {
      await this.page.getByLabel('Notes').fill(data.notes);
    }
    if (data.address_line1) {
      await this.page.getByLabel('Address Line 1').fill(data.address_line1);
    }
    if (data.city) {
      await this.page.getByLabel('City').fill(data.city);
    }
    if (data.state) {
      await this.page.getByLabel('State').fill(data.state);
    }
    if (data.postal_code) {
      await this.page.getByLabel('Postal Code').fill(data.postal_code);
    }
  }

  async submitForm() {
    await this.page.getByRole('button', { name: 'Save Client' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  // Validation helpers
  async expectClientInList(firstName: string, lastName: string) {
    const clientName = `${firstName} ${lastName}`;
    await expect(this.page.getByText(clientName)).toBeVisible();
  }

  async expectClientNotInList(firstName: string, lastName: string) {
    const clientName = `${firstName} ${lastName}`;
    await expect(this.page.getByText(clientName)).not.toBeVisible();
  }

  async expectFormError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async expectSuccessToast(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async expectErrorToast(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  // Client profile helpers
  async expectClientProfileData(data: Partial<ClientFormData>) {
    if (data.first_name && data.last_name) {
      await expect(this.page.getByText(`${data.first_name} ${data.last_name}`)).toBeVisible();
    }
    if (data.email) {
      await expect(this.page.getByText(data.email)).toBeVisible();
    }
    if (data.phone) {
      await expect(this.page.getByText(data.phone)).toBeVisible();
    }
    if (data.occupation) {
      await expect(this.page.getByText(data.occupation)).toBeVisible();
    }
  }

  async enableEditMode() {
    await this.page.getByRole('button', { name: 'Edit' }).click();
  }

  async saveChanges() {
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async cancelEdit() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  // Delete helpers
  async deleteClient() {
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Confirm Delete' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async cancelDelete() {
    await this.page.getByRole('button', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  // Navigation validation
  async expectCurrentUrl(url: string) {
    await expect(this.page).toHaveURL(url);
  }

  // Loading state helpers
  async waitForLoadingToComplete() {
    await this.page.waitForLoadState('networkidle');
    // Wait for any skeleton loaders to disappear
    await this.page.waitForFunction(() => {
      const skeletons = document.querySelectorAll('[data-testid="skeleton"]');
      return skeletons.length === 0;
    }, { timeout: 5000 }).catch(() => {
      // Ignore timeout - skeletons might not be present
    });
  }

  // Error boundary helpers
  async expectErrorBoundary() {
    await expect(this.page.getByText('Something went wrong')).toBeVisible();
  }

  async expectFallbackUI() {
    await expect(this.page.getByText('Unable to load')).toBeVisible();
  }
}

// Database test helpers
export class DatabaseTestHelpers {
  static async cleanupTestData() {
    try {
      // Clean up any test clients
      const clients = await ClientService.getClients();
      const testClients = clients.filter(client => 
        client.first_name.includes('Test') || 
        client.email?.includes('test') ||
        client.labels.includes('Test Client')
      );
      
      for (const client of testClients) {
        await ClientService.deleteClient(client.id);
      }
    } catch (error) {
      console.warn('Failed to cleanup test data:', error);
    }
  }

  static async createTestClient(data: ClientFormData) {
    return await ClientService.createClient(data);
  }

  static async createMultipleTestClients(clients: ClientFormData[]) {
    const createdClients = [];
    for (const clientData of clients) {
      const client = await ClientService.createClient(clientData);
      createdClients.push(client);
    }
    return createdClients;
  }
}