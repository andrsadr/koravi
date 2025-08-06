import { renderHook, act } from '@testing-library/react';
import { useFirstVisit } from '../useFirstVisit';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useFirstVisit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true for first visit when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useFirstVisit());
    
    expect(result.current.isFirstVisit).toBe(true);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('koravi-first-visit');
  });

  it('returns false for subsequent visits', () => {
    localStorageMock.getItem.mockReturnValue('false');
    
    const { result } = renderHook(() => useFirstVisit());
    
    expect(result.current.isFirstVisit).toBe(false);
  });

  it('marks first visit as complete', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useFirstVisit());
    
    expect(result.current.isFirstVisit).toBe(true);
    
    act(() => {
      result.current.markFirstVisitComplete();
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('koravi-first-visit', 'false');
    expect(result.current.isFirstVisit).toBe(false);
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    
    const { result } = renderHook(() => useFirstVisit());
    
    // Should default to true if localStorage fails
    expect(result.current.isFirstVisit).toBe(true);
  });

  it('handles setItem errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    
    const { result } = renderHook(() => useFirstVisit());
    
    expect(result.current.isFirstVisit).toBe(true);
    
    // Should not throw error when setItem fails
    act(() => {
      result.current.markFirstVisitComplete();
    });
    
    // State should still update locally even if localStorage fails
    expect(result.current.isFirstVisit).toBe(false);
  });

  it('resets first visit state', () => {
    localStorageMock.getItem.mockReturnValue('false');
    
    const { result } = renderHook(() => useFirstVisit());
    
    expect(result.current.isFirstVisit).toBe(false);
    
    act(() => {
      result.current.resetFirstVisit();
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('koravi-first-visit');
    expect(result.current.isFirstVisit).toBe(true);
  });
});