import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatedButton } from '../AnimatedButton';

describe('AnimatedButton', () => {
  it('renders button with children', () => {
    render(<AnimatedButton>Click me</AnimatedButton>);
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<AnimatedButton onClick={handleClick}>Click me</AnimatedButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    render(<AnimatedButton variant="destructive">Delete</AnimatedButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
  });

  it('applies size classes correctly', () => {
    render(<AnimatedButton size="lg">Large Button</AnimatedButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-11', 'px-8');
  });

  it('is disabled when disabled prop is true', () => {
    render(<AnimatedButton disabled>Disabled</AnimatedButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('shows loading state', () => {
    render(<AnimatedButton loading>Loading</AnimatedButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<AnimatedButton className="custom-class">Button</AnimatedButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<AnimatedButton ref={ref}>Button</AnimatedButton>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});