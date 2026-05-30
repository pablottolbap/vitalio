import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Flag from './Flag.jsx';

describe('Flag', () => {
  it('renders a Polish flag SVG for PL', () => {
    const { container } = render(<Flag code="PL" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Polski');
  });

  it('renders a GB flag SVG for EN (maps EN → GB)', () => {
    const { container } = render(<Flag code="EN" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'English');
  });

  it('renders a GB flag SVG for GB', () => {
    const { container } = render(<Flag code="GB" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders a fallback span for unknown codes', () => {
    const { container } = render(<Flag code="ZZ" />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('applies the size prop to the SVG width', () => {
    const { container } = render(<Flag code="PL" size={40} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '40');
  });

  it('uses a custom title when provided', () => {
    const { container } = render(<Flag code="PL" title="Polska" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-label', 'Polska');
  });
});
