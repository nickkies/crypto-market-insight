import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/features/common';
import { ProtectedRoute } from '@/features/auth';
import {
  HomePage,
  MarketPage,
  CoinDetailPage,
  BacktestPage,
  MyBacktestsPage,
  NotFoundPage,
  OAuthCallbackPage,
} from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'market',
        element: <MarketPage />,
      },
      {
        path: 'market/:coinId',
        element: <CoinDetailPage />,
      },
      {
        path: 'backtest',
        element: <BacktestPage />,
      },
      {
        path: 'my/backtests',
        element: (
          <ProtectedRoute>
            <MyBacktestsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'oauth/callback',
        element: <OAuthCallbackPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
