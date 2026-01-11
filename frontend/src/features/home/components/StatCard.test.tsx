import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { StatCard } from './StatCard';
import { lightTheme } from '@/styles';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
};

describe('StatCard', () => {
  it('renders icon, label, and value', () => {
    renderWithTheme(
      <StatCard icon="💰" label="Total Market Cap" value="$2.5T" />,
    );

    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('Total Market Cap')).toBeInTheDocument();
    expect(screen.getByText('$2.5T')).toBeInTheDocument();
  });

  it('displays positive change with green color', () => {
    renderWithTheme(
      <StatCard icon="📊" label="24h Volume" value="$100B" change={5.25} />,
    );

    const changeElement = screen.getByTestId('stat-change');
    expect(changeElement).toHaveTextContent('+5.25%');
  });

  it('displays negative change without plus sign', () => {
    renderWithTheme(
      <StatCard icon="📉" label="Market Cap" value="$2T" change={-3.5} />,
    );

    const changeElement = screen.getByTestId('stat-change');
    expect(changeElement).toHaveTextContent('-3.50%');
  });

  it('does not display change when not provided', () => {
    renderWithTheme(<StatCard icon="🪙" label="Active Coins" value="15,000" />);

    expect(screen.queryByTestId('stat-change')).not.toBeInTheDocument();
  });

  it('handles null change value', () => {
    renderWithTheme(
      <StatCard icon="💰" label="Label" value="Value" change={null} />,
    );

    expect(screen.queryByTestId('stat-change')).not.toBeInTheDocument();
  });
});
