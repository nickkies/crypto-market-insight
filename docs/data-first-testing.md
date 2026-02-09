# Data-First Testing Manifesto

> 도메인 규칙이 테스트를 지배하고, 테스트가 코드를 지배한다.

---

## 개요

이 문서는 본 프로젝트가 채택한 테스트 아키텍처 철학을 정의합니다.\
테스트는 구현을 검증하는 도구가 아니라, **시스템 규칙을 고정하는 명세(specification)** 역할을 합니다.

### 용어 정의

본 프로젝트에서 사용하는 테스트 관련 용어는 세 가지 계층으로 구분됩니다.

| 계층                 | 용어                          | 의미                                       |
| -------------------- | ----------------------------- | ------------------------------------------ |
| 철학 (Philosophy)    | **Data-First Testing**        | 데이터가 명세 역할을 한다는 설계 원칙      |
| 방법론 (Methodology) | **Fixture-First Development** | fixture → test → code 순서로 개발하는 흐름 |
| 기법 (Technique)     | **DDT (Data-Driven Testing)** | 파라미터화된 테스트 실행 방식              |

```text
철학 (Data-First)  →  방법론 (Fixture-First)  →  기법 (DDT)
  왜?                   어떤 순서로?               어떻게 실행?
```

---

## 핵심 철학: Data-First Testing

### 테스트 데이터 = 명세(Specification)

테스트 데이터는 샘플 데이터가 아니라 **시스템 규칙의 공식 정의서**입니다.

- 테스트 데이터는 검증 보조물이 아님
- 테스트 데이터는 도메인 규칙 그 자체
- 테스트 데이터는 시스템 계약(Contract)

### 규칙 중심 구조

```text
규칙(데이터) → 테스트 → 코드
```

기존 구조:

```text
코드 → 테스트 → 데이터
```

코드가 규칙을 정의하는 것이 아니라,\
**규칙이 코드를 정의**합니다.

---

## 개발 방법론: Fixture-First Development

### 개발 흐름

1. 도메인 규칙 정의
2. 규칙을 데이터(fixture)로 구조화
   - happy (정상)
   - edge (경계)
   - error (오류)
3. 테스트로 불변조건(invariant) 고정
4. 구현은 규칙을 만족하도록 진화

### Fixture 디렉토리 구조

```bash
fixtures/
├── market/
│   ├── happy/          # 정상 응답
│   ├── edge/           # 경계 케이스 (빈 값, null 필드)
│   └── error/          # 오류 응답 (5xx, 429)
└── strategy/
    ├── happy/          # 정상 매매 시나리오
    ├── edge/           # 경계 조건 (RSI 경계값, 단일 캔들)
    └── error/          # 오류 케이스 (빈 캔들 데이터)
```

### 테스트 스캐폴딩(Scaffolding) 구조

Fixture를 먼저 만들고 구현 코드가 아직 없는 상태에서도 테스트 구조를 준비할 수 있도록,\
본 프로젝트는 테스트 스캐폴딩 구조를 사용합니다.

#### Step 1. 규칙 정의 (Fixture)

- happy / edge / error 케이스 데이터 정의
- 기대 불변조건(invariant) 명시

#### Step 2. 계약 정의 (Interface)

> 아직 구현은 없고, 인터페이스만 존재

BE 예시:

- `TimeSeriesAssembler`
- `BacktestEngine`

FE 예시:

- `normalizeSeries(input)`
- `buildViewModel(response)`

#### Step 3. 테스트 골격 생성

- Fixture Loader
- Parameterized Test Runner
- Invariant Assertions

#### Step 4. 최소 구현

- happy 케이스 1개 통과하는 수준의 stub 구현
- 이후 edge/error 확장

---

## 테스트 기법: Data-Driven Testing (DDT)

DDT는 동일한 테스트 로직을 **여러 데이터 셋으로 반복 실행**하는 기법입니다.\
본 프로젝트에서는 fixture 파일을 데이터 소스로 사용합니다.

### BE 적용: JUnit 5 + FixtureLoader

```java
// FixtureLoader로 JSON fixture 로드
public static String bitcoinJson() {
    return FixtureLoader.loadRawFromClasspath(
        FIXTURES_BASE + "/happy/bitcoin.json"
    );
}

// @ParameterizedTest로 데이터 기반 테스트 실행
@ParameterizedTest
@MethodSource("rsiSignalCases")
void shouldGenerateCorrectSignal(RsiSignalTestCase testCase) {
    Signal result = calculator.calculate(testCase.input());
    assertThat(result).isEqualTo(testCase.expected());
}
```

### FE 적용: Vitest + fixtureLoader

```typescript
// fixtureLoader로 JSON fixture 로드
export const marketFixtures = {
  bitcoin: () => bitcoinJson as CoinMarketDataDto,
  coins: () => coinsJson as CoinListResponseDto,
  emptyCoins: () => emptyCoinsJson as CoinListResponseDto,
};

// test.each()로 데이터 기반 테스트 실행
test.each([
  { name: 'happy', fixture: marketFixtures.coins() },
  { name: 'empty', fixture: marketFixtures.emptyCoins() },
])('$name 케이스를 처리한다', ({ fixture }) => {
  const result = normalize(fixture);
  expect(result).toSatisfyInvariant();
});
```

---

## 설계 구조

### 도메인 모델

| 모델    | 역할      |
| ------- | --------- |
| Entity  | 상태 모델 |
| DTO     | 계약 모델 |
| Fixture | 규칙 모델 |

### 테스트 계층

| 계층        | 역할             |
| ----------- | ---------------- |
| Unit        | 규칙 검증        |
| Integration | 계약 검증        |
| E2E         | 사용자 흐름 검증 |

---

## BE/FE 병렬 개발 구조

Fixture 기반 구조를 통해 BE/FE가 동일한 데이터 계약 위에서 병렬 개발할 수 있습니다.

- BE: 규칙 정의 + 응답 구조 생성
- FE: 동일 fixture 기반 ViewModel/상태/UI 개발

> 문서 기반 협업 ❌\
> **데이터 기반 계약 협업 ✅**

---

## DDD와의 관계

이 구조는 DDD(Domain-Driven Design) 위에 얹히는 검증 구조입니다.

- **DDD**: 도메인 모델을 정의한다 (Entity, Aggregate, Context, Language)
- **Data-First Testing**: 그 모델의 규칙을 **실행 가능한 명세로 고정**한다

```text
DDD 모델링 → 규칙 명세화(fixture) → 규칙 강제(test) → 구현(code)
```

DDD가 "세계를 어떻게 정의하느냐"의 철학이라면,\
Data-First Testing은 "그 세계가 깨지지 않게 어떻게 강제하느냐"의 구조입니다.

---

## 적용 원칙

- 테스트는 구현을 고정하지 않는다
- 테스트는 규칙을 고정한다
- 테스트는 설계 기준이다
- 테스트는 명세 문서다

---

## 목적

- 리팩토링 내성 확보
- 규칙 안정성 확보
- 회귀(regression) 안전성 확보
- 병렬 개발 구조 구축
- 커뮤니케이션 비용 감소

---

## 한 줄 선언문

> **We treat test data as specification, not implementation detail.**\
> **Fixtures define the rules, code adapts to them.**
