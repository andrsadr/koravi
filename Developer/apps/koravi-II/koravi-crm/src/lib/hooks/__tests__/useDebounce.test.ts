import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    expect(result.current).toBe('initial');
    
    // Change the value
    rerender({ value: 'updated', delay: 500 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('cancels previous timeout when value changes quickly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    // Change value multiple times quickly
    rerender({ value: 'first', delay: 500 });
    rerender({ value: 'second', delay: 500 });
    rerender({ value: 'final', delay: 500 });
    
    // Value should still be initial
    expect(result.current).toBe('initial');
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Should only update to the final value
    expect(result.current).toBe('final');
  });

  it('handles different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );
    
    rerender({ value: 'updated', delay: 1000 });
    
    // Should not update after 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');
    
    // Should update after 1000ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('works with different data types', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    );
    
    expect(result.current).toBe(0);
    
    rerender({ value: 42, delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe(42);
  });

  it('works with objects', () => {
    const initialObj = { name: 'John', age: 30 };
    const updatedObj = { name: 'Jane', age: 25 };
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 200 } }
    );
    
    expect(result.current).toBe(initialObj);
    
    rerender({ value: updatedObj, delay: 200 });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    expect(result.current).toBe(updatedObj);
  });
});