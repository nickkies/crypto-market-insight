import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '@/styles/theme';
import TechnicalIndicatorsCard from './TechnicalIndicatorsCard';
import type { IndicatorResponseDto } from '../../services';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={darkTheme}>{ui}</ThemeProvider>);
};

const mockIndicatorData: IndicatorResponseDto = {
  coinId: 'bitcoin',
  rsi: { value: 45.5, status: 'NEUTRAL' },
  macd: { macd: 150.5, signal: 120.3, histogram: 30.2, status: 'BULLISH' },
  ma: { ma20: 95000.5, ma50: 92000.75 },
  bollingerBands: { upper: 100000, middle: 95000, lower: 90000 },
};

describe('TechnicalIndicatorsCard', () => {
  describe('로딩 상태', () => {
    it('로딩 중일 때 스켈레톤을 표시한다', () => {
      renderWithProviders(
        <TechnicalIndicatorsCard data={undefined} isLoading={true} />,
      );

      expect(screen.getByText('Technical Indicators')).toBeInTheDocument();
      expect(
        screen.getByTestId('technical-indicators-card'),
      ).toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('에러 발생 시 스켈레톤을 표시한다', () => {
      renderWithProviders(
        <TechnicalIndicatorsCard
          data={undefined}
          isLoading={false}
          isError={true}
        />,
      );

      expect(screen.getByText('Technical Indicators')).toBeInTheDocument();
      expect(
        screen.getByTestId('technical-indicators-card'),
      ).toBeInTheDocument();
    });
  });

  describe('데이터 표시', () => {
    it('RSI 값과 상태를 표시한다', () => {
      renderWithProviders(
        <TechnicalIndicatorsCard data={mockIndicatorData} isLoading={false} />,
      );

      expect(screen.getByText('RSI (14)')).toBeInTheDocument();
      expect(screen.getByText('45.50')).toBeInTheDocument();
      expect(screen.getByText('Neutral')).toBeInTheDocument();
    });

    it('RSI가 과매수 상태일 때 Overbought를 표시한다', () => {
      const overboughtData = {
        ...mockIndicatorData,
        rsi: { value: 75, status: 'OVERBOUGHT' as const },
      };
      renderWithProviders(
        <TechnicalIndicatorsCard data={overboughtData} isLoading={false} />,
      );

      expect(screen.getByText('75.00')).toBeInTheDocument();
      expect(screen.getByText('Overbought')).toBeInTheDocument();
    });

    it('RSI가 과매도 상태일 때 Oversold를 표시한다', () => {
      const oversoldData = {
        ...mockIndicatorData,
        rsi: { value: 25, status: 'OVERSOLD' as const },
      };
      renderWithProviders(
        <TechnicalIndicatorsCard data={oversoldData} isLoading={false} />,
      );

      expect(screen.getByText('25.00')).toBeInTheDocument();
      expect(screen.getByText('Oversold')).toBeInTheDocument();
    });

    it('MACD 값들을 표시한다', () => {
      renderWithProviders(
        <TechnicalIndicatorsCard data={mockIndicatorData} isLoading={false} />,
      );

      expect(screen.getAllByText('MACD').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('150.50')).toBeInTheDocument();
      expect(screen.getByText('Signal')).toBeInTheDocument();
      expect(screen.getByText('120.30')).toBeInTheDocument();
      expect(screen.getByText('Histogram')).toBeInTheDocument();
      expect(screen.getByText('30.20')).toBeInTheDocument();
      expect(screen.getByText('Bullish')).toBeInTheDocument();
    });

    it('MACD가 Bearish일 때 Bearish를 표시한다', () => {
      const bearishData = {
        ...mockIndicatorData,
        macd: {
          macd: -50,
          signal: -30,
          histogram: -20,
          status: 'BEARISH' as const,
        },
      };
      renderWithProviders(
        <TechnicalIndicatorsCard data={bearishData} isLoading={false} />,
      );

      expect(screen.getByText('Bearish')).toBeInTheDocument();
    });

    it('이동평균 값을 표시한다', () => {
      renderWithProviders(
        <TechnicalIndicatorsCard data={mockIndicatorData} isLoading={false} />,
      );

      expect(screen.getByText('Moving Averages')).toBeInTheDocument();
      expect(screen.getByText('MA(20)')).toBeInTheDocument();
      expect(screen.getByText('MA(50)')).toBeInTheDocument();
    });

    it('볼린저밴드 값을 표시한다', () => {
      renderWithProviders(
        <TechnicalIndicatorsCard data={mockIndicatorData} isLoading={false} />,
      );

      expect(screen.getByText('Bollinger Bands')).toBeInTheDocument();
      expect(screen.getByText('Upper')).toBeInTheDocument();
      expect(screen.getByText('Middle')).toBeInTheDocument();
      expect(screen.getByText('Lower')).toBeInTheDocument();
    });
  });

  describe('데이터 없음', () => {
    it('RSI 데이터가 없으면 "-"를 표시한다', () => {
      const noRsiData = {
        ...mockIndicatorData,
        rsi: { value: null, status: null },
      };
      renderWithProviders(
        <TechnicalIndicatorsCard data={noRsiData} isLoading={false} />,
      );

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('MACD 데이터가 없으면 "-"를 표시한다', () => {
      const noMacdData = {
        ...mockIndicatorData,
        macd: { macd: null, signal: null, histogram: null, status: null },
      };
      renderWithProviders(
        <TechnicalIndicatorsCard data={noMacdData} isLoading={false} />,
      );

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('MA 데이터가 없으면 "-"를 표시한다', () => {
      const noMaData = {
        ...mockIndicatorData,
        ma: { ma20: null, ma50: null },
      };
      renderWithProviders(
        <TechnicalIndicatorsCard data={noMaData} isLoading={false} />,
      );

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('볼린저밴드 데이터가 없으면 "-"를 표시한다', () => {
      const noBbData = {
        ...mockIndicatorData,
        bollingerBands: { upper: null, middle: null, lower: null },
      };
      renderWithProviders(
        <TechnicalIndicatorsCard data={noBbData} isLoading={false} />,
      );

      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });
  });
});
