import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatedInput } from '../AnimatedInput';

describe('AnimatedInput', () => {
  it('renders input with placeholder', () => {
    render(<AnimatedInput placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<AnimatedInput onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies focus styles on focus', () => {
    render(<AnimatedInput />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    expect(input).toHaveClass('focus:ring-2', 'focus:ring-ring');
  });

  it('shows error state when error prop is provided', () => {
    render(<AnimatedInput error="This field is required" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-destructive');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<AnimatedInput disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<AnimatedInput className="custom-input" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<AnimatedInput ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('handles different input types', () => {
    render(<AnimatedInput type="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });
});