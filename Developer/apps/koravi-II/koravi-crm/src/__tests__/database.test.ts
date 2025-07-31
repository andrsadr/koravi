import { ClientService, DatabaseError } from '../lib/database';
import { checkConnection } from '../lib/supabase';

// Mock Supabase for testing
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        })),
        limit: jest.fn(() => ({
          single: jest.fn()
        })),
        order: jest.fn(() => ({
          textSearch: jest.fn(),
          eq: jest.fn(),
          overlaps: jest.fn(),
          limit: jest.fn(),
          range: jest.fn()
        })),
        textSearch: jest.fn(),
        overlaps: jest.fn()
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  },
  checkConnection: jest.fn(),
  withRetry: jest.fn((fn) => fn()),
}));

describe('Database Integration', () => {
  describe('ClientService', () => {
    it('should have all required methods', () => {
      expect(typeof ClientService.getClients).toBe('function');
      expect(typeof ClientService.getClient).toBe('function');
      expect(typeof ClientService.createClient).toBe('function');
      expect(typeof ClientService.updateClient).toBe('function');
      expect(typeof ClientService.deleteClient).toBe('function');
      expect(typeof ClientService.searchClients).toBe('function');
      expect(typeof ClientService.getClientStats).toBe('function');
    });

    it('should handle database errors properly', () => {
      const error = new DatabaseError('Test error', 'TEST_CODE', { detail: 'test' });
      expect(error.name).toBe('DatabaseError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ detail: 'test' });
    });
  });

  describe('Connection utilities', () => {
    it('should export checkConnection function', () => {
      expect(typeof checkConnection).toBe('function');
    });
  });
});