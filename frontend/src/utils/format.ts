/**
 * 가격을 포맷팅합니다.
 * - 1 이상: 소수점 2자리
 * - 0.01 이상: 소수점 4자리
 * - 0.01 미만: 소수점 6자리
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '-';
  if (price >= 1) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (price >= 0.01) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  }
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  });
}

/**
 * 퍼센트를 포맷팅합니다 (소수점 2자리).
 */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '-';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * 시가총액을 포맷팅합니다.
 * - 1조 이상: X.XX조
 * - 1억 이상: X.XX억
 * - 1만 이상: X.XX만
 */
export function formatMarketCap(value: number | null | undefined): string {
  if (value == null) return '-';
  const trillion = 1_000_000_000_000;
  const billion = 100_000_000;
  const tenThousand = 10_000;

  if (value >= trillion) {
    return `${(value / trillion).toFixed(2)}조`;
  }
  if (value >= billion) {
    return `${(value / billion).toFixed(2)}억`;
  }
  if (value >= tenThousand) {
    return `${(value / tenThousand).toFixed(2)}만`;
  }
  return value.toLocaleString('en-US');
}

/**
 * 거래량/큰 숫자를 축약 포맷팅합니다 (B/M/K).
 */
export function formatVolume(value: number | null | undefined): string {
  if (value == null) return '-';
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}
