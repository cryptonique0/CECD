import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('renders language buttons', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /español/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /français/i })).toBeInTheDocument();
  });

  it('displays correct number of language options', () => {
    render(<LanguageSwitcher />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });
});
