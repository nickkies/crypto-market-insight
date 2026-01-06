import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/styles';
import { router } from './index';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithRouter = (initialRoute: string = '/') => {
  const testRouter = createMemoryRouter(router.routes, {
    initialEntries: [initialRoute],
  });
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={testRouter} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('Router', () => {
  describe('Route Mapping', () => {
    it('renders HomePage at /', () => {
      renderWithRouter('/');
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('renders MarketPage at /market', () => {
      renderWithRouter('/market');
      expect(screen.getByTestId('market-page')).toBeInTheDocument();
    });

    it('renders BacktestPage at /backtest', () => {
      renderWithRouter('/backtest');
      expect(screen.getByTestId('backtest-page')).toBeInTheDocument();
    });

    it('renders NotFoundPage for unknown routes', () => {
      renderWithRouter('/unknown-route');
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates between pages using links', async () => {
      const user = userEvent.setup();
      renderWithRouter('/');

      expect(screen.getByTestId('home-page')).toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'Market' }));
      expect(screen.getByTestId('market-page')).toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'Backtest' }));
      expect(screen.getByTestId('backtest-page')).toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'Home' }));
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });
});
