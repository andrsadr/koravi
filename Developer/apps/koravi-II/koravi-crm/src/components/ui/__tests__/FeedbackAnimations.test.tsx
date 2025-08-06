import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeedbackAnimations } from '../FeedbackAnimations';

describe('FeedbackAnimations', () => {
  it('renders success animation', () => {
    render(<FeedbackAnimations type="success" />);
    
    const animation = screen.getByTestId('feedback-animation');
    expect(animation).toBeInTheDocument();
    expect(animation).toHaveClass('text-green-500');
  });

  it('renders error animation', () => {
    render(<FeedbackAnimations type="error" />);
    
    const animation = screen.getByTestId('feedback-animation');
    expect(animation).toBeInTheDocument();
    expect(animation).toHaveClass('text-red-500');
  });

  it('renders loading animation', () => {
    render(<FeedbackAnimations type="loading" />);
    
    const animation = screen.getByTestId('feedback-animation');
    expect(animation).toBeInTheDocument();
    expect(animation).toHaveClass('animate-spin');
  });

  it('renders warning animation', () => {
    render(<FeedbackAnimations type="warning" />);
    
    const animation = screen.getByTestId('feedback-animation');
    expect(animation).toBeInTheDocument();
    expect(animation).toHaveClass('text-yellow-500');
  });

  it('applies custom size', () => {
    render(<FeedbackAnimations type="success" size="lg" />);
    
    const animation = screen.getByTestId('feedback-animation');
    expect(animation).toHaveClass('h-8', 'w-8');
  });

  it('applies custom className', () => {
    render(<FeedbackAnimations type="success" className="custom-class" />);
    
    const animation = screen.getByTestId('feedback-animation');
    expect(animation).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<FeedbackAnimations type="success" />);
    
    const animation = screen.getByTestId('feedback-animation');
    expect(animation).toHaveAttribute('aria-hidden', 'true');
  });
});