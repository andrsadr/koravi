import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';

describe('useToast', () => {
  it('initializes with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toasts).toEqual([]);
  });

  it('adds a toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Success',
        description: 'Operation completed',
        variant: 'default',
      });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Success',
      description: 'Operation completed',
      variant: 'default',
    });
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it('adds multiple toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
    });
    
    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].title).toBe('First toast');
    expect(result.current.toasts[1].title).toBe('Second toast');
  });

  it('dismisses a toast by id', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    
    act(() => {
      result.current.toast({ title: 'Toast to dismiss' });
      toastId = result.current.toasts[0].id;
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.dismiss(toastId);
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('dismisses all toasts when no id provided', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
      result.current.toast({ title: 'Third toast' });
    });
    
    expect(result.current.toasts).toHaveLength(3);
    
    act(() => {
      result.current.dismiss();
    });
    
    expect(result.current.toasts).toHaveLength(0);
  });

  it('generates unique ids for toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
    });
    
    const [first, second] = result.current.toasts;
    expect(first.id).not.toBe(second.id);
  });

  it('handles different toast variants', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Success', variant: 'default' });
      result.current.toast({ title: 'Error', variant: 'destructive' });
    });
    
    expect(result.current.toasts[0].variant).toBe('default');
    expect(result.current.toasts[1].variant).toBe('destructive');
  });

  it('handles toast with action', () => {
    const { result } = renderHook(() => useToast());
    
    const action = {
      altText: 'Undo',
      onClick: jest.fn(),
    };
    
    act(() => {
      result.current.toast({
        title: 'Item deleted',
        action,
      });
    });
    
    expect(result.current.toasts[0].action).toBe(action);
  });

  it('auto-dismisses toasts after duration', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Auto dismiss',
        duration: 3000,
      });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(result.current.toasts).toHaveLength(0);
    
    jest.useRealTimers();
  });
});