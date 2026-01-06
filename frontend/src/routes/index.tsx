import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/features/common';
import {
  HomePage,
  MarketPage,
  CoinDetailPage,
  BacktestPage,
  NotFoundPage,
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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
