import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/features/common';
import {
  HomePage,
  MarketPage,
  CoinDetailPage,
  BacktestPage,
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
