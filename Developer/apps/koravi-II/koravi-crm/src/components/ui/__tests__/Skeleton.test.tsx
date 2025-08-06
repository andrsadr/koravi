import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders with default classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted');
  });

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('applies custom height and width', () => {
    render(<Skeleton className="h-4 w-full" data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-4', 'w-full');
  });

  it('renders as different HTML elements', () => {
    const { rerender } = render(<Skeleton as="span" data-testid="skeleton" />);
    
    let skeleton = screen.getByTestId('skeleton');
    expect(skeleton.tagName).toBe('SPAN');
    
    rerender(<Skeleton as="div" data-testid="skeleton" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton.tagName).toBe('DIV');
  });

  it('forwards additional props', () => {
    render(<Skeleton data-testid="skeleton" aria-label="Loading content" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });

  it('can be used for text placeholders', () => {
    render(
      <div>
        <Skeleton className="h-4 w-3/4 mb-2" data-testid="title-skeleton" />
        <Skeleton className="h-3 w-1/2" data-testid="subtitle-skeleton" />
      </div>
    );
    
    expect(screen.getByTestId('title-skeleton')).toHaveClass('h-4', 'w-3/4', 'mb-2');
    expect(screen.getByTestId('subtitle-skeleton')).toHaveClass('h-3', 'w-1/2');
  });

  it('can be used for avatar placeholders', () => {
    render(<Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />);
    
    const skeleton = screen.getByTestId('avatar-skeleton');
    expect(skeleton).toHaveClass('h-12', 'w-12', 'rounded-full');
  });
});