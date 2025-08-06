import React from 'react';
import { render } from '@testing-library/react';
import { Button } from '../button';

describe('Button Snapshots', () => {
  it('renders default button correctly', () => {
    const { container } = render(<Button>Default Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders primary variant correctly', () => {
    const { container } = render(<Button variant="default">Primary Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders destructive variant correctly', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders outline variant correctly', () => {
    const { container } = render(<Button variant="outline">Outline Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders secondary variant correctly', () => {
    const { container } = render(<Button variant="secondary">Secondary Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders ghost variant correctly', () => {
    const { container } = render(<Button variant="ghost">Ghost Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders link variant correctly', () => {
    const { container } = render(<Button variant="link">Link Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders small size correctly', () => {
    const { container } = render(<Button size="sm">Small Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders large size correctly', () => {
    const { container } = render(<Button size="lg">Large Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders icon size correctly', () => {
    const { container } = render(<Button size="icon">🔍</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders disabled state correctly', () => {
    const { container } = render(<Button disabled>Disabled Button</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });
});