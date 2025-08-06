import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageTransition } from '../PageTransition';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('PageTransition', () => {
  it('renders children', () => {
    render(
      <PageTransition>
        <div>Page content</div>
      </PageTransition>
    );
    
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('applies motion props for animation', () => {
    render(
      <PageTransition>
        <div data-testid="content">Animated content</div>
      </PageTransition>
    );
    
    const wrapper = screen.getByTestId('content').parentElement;
    expect(wrapper).toBeInTheDocument();
  });

  it('handles multiple children', () => {
    render(
      <PageTransition>
        <div>First child</div>
        <div>Second child</div>
      </PageTransition>
    );
    
    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <PageTransition className="custom-transition">
        <div data-testid="content">Content</div>
      </PageTransition>
    );
    
    const wrapper = screen.getByTestId('content').parentElement;
    expect(wrapper).toHaveClass('custom-transition');
  });

  it('works with different transition types', () => {
    const { rerender } = render(
      <PageTransition variant="slide">
        <div data-testid="content">Slide content</div>
      </PageTransition>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    
    rerender(
      <PageTransition variant="fade">
        <div data-testid="content">Fade content</div>
      </PageTransition>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});