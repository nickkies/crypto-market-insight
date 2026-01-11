/**
 * 이동평균(Moving Average) 계산
 * @param data 가격 데이터 배열
 * @param period 이동평균 기간
 * @returns 이동평균 값 배열 (기간 미달 구간은 null)
 */
export function calculateMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

/**
 * 볼린저 밴드(Bollinger Bands) 계산
 * @param data 가격 데이터 배열
 * @param period 기간 (기본값: 20)
 * @param multiplier 표준편차 배수 (기본값: 2)
 * @returns upper, middle, lower 밴드 배열
 */
export function calculateBollingerBands(
  data: number[],
  period: number = 20,
  multiplier: number = 2,
): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
} {
  const middle = calculateMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = middle[i]!;
      const variance =
        slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      upper.push(mean + multiplier * stdDev);
      lower.push(mean - multiplier * stdDev);
    }
  }

  return { upper, middle, lower };
}
