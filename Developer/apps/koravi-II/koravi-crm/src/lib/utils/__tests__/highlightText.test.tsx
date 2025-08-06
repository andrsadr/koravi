import React from 'react';
import { render, screen } from '@testing-library/react';
import { highlightText } from '../highlightText';

describe('highlightText', () => {
  it('returns original text when no search term provided', () => {
    const result = highlightText('Hello world', '');
    render(<div>{result}</div>);
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('highlights single match', () => {
    const result = highlightText('Hello world', 'world');
    render(<div>{result}</div>);
    
    expect(screen.getByText('Hello ')).toBeInTheDocument();
    expect(screen.getByText('world')).toBeInTheDocument();
    
    const highlighted = screen.getByText('world');
    expect(highlighted).toHaveClass('bg-yellow-200', 'font-semibold');
  });

  it('highlights multiple matches', () => {
    const result = highlightText('Hello world, wonderful world', 'world');
    render(<div>{result}</div>);
    
    const worldElements = screen.getAllByText('world');
    expect(worldElements).toHaveLength(2);
    
    worldElements.forEach(element => {
      expect(element).toHaveClass('bg-yellow-200', 'font-semibold');
    });
  });

  it('is case insensitive', () => {
    const result = highlightText('Hello World', 'world');
    render(<div>{result}</div>);
    
    const highlighted = screen.getByText('World');
    expect(highlighted).toHaveClass('bg-yellow-200', 'font-semibold');
  });

  it('handles partial matches', () => {
    const result = highlightText('JavaScript is awesome', 'Script');
    render(<div>{result}</div>);
    
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('Script')).toBeInTheDocument();
    expect(screen.getByText(' is awesome')).toBeInTheDocument();
    
    const highlighted = screen.getByText('Script');
    expect(highlighted).toHaveClass('bg-yellow-200', 'font-semibold');
  });

  it('handles special regex characters', () => {
    const result = highlightText('Price: $10.99', '$10');
    render(<div>{result}</div>);
    
    expect(screen.getByText('Price: ')).toBeInTheDocument();
    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('.99')).toBeInTheDocument();
    
    const highlighted = screen.getByText('$10');
    expect(highlighted).toHaveClass('bg-yellow-200', 'font-semibold');
  });

  it('handles empty text', () => {
    const result = highlightText('', 'search');
    render(<div>{result}</div>);
    
    expect(screen.queryByText('search')).not.toBeInTheDocument();
  });

  it('handles whitespace in search term', () => {
    const result = highlightText('Hello beautiful world', 'beautiful world');
    render(<div>{result}</div>);
    
    expect(screen.getByText('Hello ')).toBeInTheDocument();
    expect(screen.getByText('beautiful world')).toBeInTheDocument();
    
    const highlighted = screen.getByText('beautiful world');
    expect(highlighted).toHaveClass('bg-yellow-200', 'font-semibold');
  });

  it('handles overlapping matches correctly', () => {
    const result = highlightText('aaaa', 'aa');
    render(<div>{result}</div>);
    
    // Should highlight the first occurrence
    const highlighted = screen.getAllByText(/aa/);
    expect(highlighted.length).toBeGreaterThan(0);
  });

  it('preserves text structure with complex content', () => {
    const result = highlightText('Contact: john.doe@example.com', 'john');
    render(<div>{result}</div>);
    
    expect(screen.getByText('Contact: ')).toBeInTheDocument();
    expect(screen.getByText('john')).toBeInTheDocument();
    expect(screen.getByText('.doe@example.com')).toBeInTheDocument();
    
    const highlighted = screen.getByText('john');
    expect(highlighted).toHaveClass('bg-yellow-200', 'font-semibold');
  });
});