import { describe, it, expect } from 'vitest';
import { calculateMA, calculateBollingerBands } from './chartCalculations';

describe('calculateMA', () => {
  it('기간보다 짧은 데이터는 null을 반환한다', () => {
    const data = [100, 110, 120];
    const result = calculateMA(data, 5);

    expect(result).toEqual([null, null, null]);
  });

  it('기간과 동일한 데이터부터 이동평균을 계산한다', () => {
    const data = [100, 110, 120, 130, 140];
    const result = calculateMA(data, 3);

    // i=0,1: null (기간 미달)
    // i=2: (100+110+120)/3 = 110
    // i=3: (110+120+130)/3 = 120
    // i=4: (120+130+140)/3 = 130
    expect(result).toEqual([null, null, 110, 120, 130]);
  });

  it('period=1이면 원본 데이터와 동일하다', () => {
    const data = [100, 200, 300];
    const result = calculateMA(data, 1);

    expect(result).toEqual([100, 200, 300]);
  });

  it('빈 배열은 빈 배열을 반환한다', () => {
    const result = calculateMA([], 5);
    expect(result).toEqual([]);
  });

  it('20일 이동평균을 정확히 계산한다', () => {
    // 1~20까지의 숫자로 테스트
    const data = Array.from({ length: 25 }, (_, i) => i + 1);
    const result = calculateMA(data, 20);

    // i=0~18: null
    // i=19: (1+2+...+20)/20 = 210/20 = 10.5
    // i=20: (2+3+...+21)/20 = 230/20 = 11.5
    expect(result.slice(0, 19)).toEqual(Array(19).fill(null));
    expect(result[19]).toBe(10.5);
    expect(result[20]).toBe(11.5);
  });
});

describe('calculateBollingerBands', () => {
  it('기간보다 짧은 데이터는 모두 null을 반환한다', () => {
    const data = [100, 110, 120];
    const result = calculateBollingerBands(data, 5);

    expect(result.upper).toEqual([null, null, null]);
    expect(result.middle).toEqual([null, null, null]);
    expect(result.lower).toEqual([null, null, null]);
  });

  it('middle은 이동평균과 동일하다', () => {
    const data = [100, 110, 120, 130, 140];
    const result = calculateBollingerBands(data, 3);
    const ma = calculateMA(data, 3);

    expect(result.middle).toEqual(ma);
  });

  it('upper는 middle보다 크고 lower는 middle보다 작다', () => {
    const data = [100, 110, 90, 120, 80, 130, 70, 140, 60, 150];
    const result = calculateBollingerBands(data, 5);

    for (let i = 0; i < data.length; i++) {
      if (result.middle[i] !== null) {
        expect(result.upper[i]).toBeGreaterThan(result.middle[i]!);
        expect(result.lower[i]).toBeLessThan(result.middle[i]!);
      }
    }
  });

  it('변동성이 없으면 upper와 lower가 middle과 같다', () => {
    // 모든 값이 동일하면 표준편차가 0
    const data = [100, 100, 100, 100, 100];
    const result = calculateBollingerBands(data, 3);

    // i=2,3,4에서 middle=100, stdDev=0이므로 upper=lower=100
    expect(result.middle[2]).toBe(100);
    expect(result.upper[2]).toBe(100);
    expect(result.lower[2]).toBe(100);
  });

  it('multiplier에 따라 밴드 폭이 달라진다', () => {
    const data = [100, 110, 90, 120, 80];
    const result1 = calculateBollingerBands(data, 3, 1);
    const result2 = calculateBollingerBands(data, 3, 2);

    // multiplier가 클수록 밴드 폭이 넓어짐
    const width1 = result1.upper[4]! - result1.lower[4]!;
    const width2 = result2.upper[4]! - result2.lower[4]!;

    expect(width2).toBeCloseTo(width1 * 2);
  });

  it('빈 배열은 빈 객체 배열을 반환한다', () => {
    const result = calculateBollingerBands([]);
    expect(result.upper).toEqual([]);
    expect(result.middle).toEqual([]);
    expect(result.lower).toEqual([]);
  });
});
