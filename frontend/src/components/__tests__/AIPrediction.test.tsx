import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIPrediction from '../AIPrediction';

describe('AIPrediction', () => {
  it('renders the component title', () => {
    render(<AIPrediction />);
    expect(screen.getByText('AI Incident Prediction')).toBeInTheDocument();
  });

  it('displays run analysis button', () => {
    render(<AIPrediction />);
    const button = screen.getByRole('button', { name: /run analysis/i });
    expect(button).toBeInTheDocument();
  });
});
