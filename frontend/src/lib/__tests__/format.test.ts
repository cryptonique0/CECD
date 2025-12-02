import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../format';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(100, 'USD')).toContain('100');
  });

  it('formats decimals correctly', () => {
    expect(formatCurrency(99.99, 'USD')).toContain('99.99');
  });

  it('uses default currency when not specified', () => {
    const result = formatCurrency(50);
    expect(result).toBeTruthy();
  });
});
