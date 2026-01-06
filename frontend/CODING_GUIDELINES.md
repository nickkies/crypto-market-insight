# 📝 Frontend Coding Guidelines

> 본 문서는 Crypto Market Insight 프론트엔드 개발 시
> 코드 일관성과 유지보수성을 확보하기 위한 코딩 규약입니다.

본 프로젝트는 `React` + `TypeScript` + `Vite` 기반으로 개발하며,
**Feature 기반 구조**와 **상태 관리 분리**를 핵심 원칙으로 합니다.

---

## 1. 폴더 구조

```bash
src/
├── features/                    # 기능별 모듈 (메뉴/도메인 기준)
│   ├── common/                  # 공통 기능
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/            # API 서비스 (axios 포함)
│   │   ├── stores/              # Zustand 스토어
│   │   ├── layout/
│   │   └── types/
│   └── [feature]/
│       └── [sub-feature]/
│           ├── components/
│           ├── hooks/
│           ├── services/
│           ├── stores/
│           └── index.ts
├── pages/                       # 라우트 진입점
├── constants/
├── utils/
└── routes/
```

### 구조 원칙

- Feature 단위 응집도 유지
- 페이지는 조합만 담당
- 공통 로직은 `common` feature로 이동

---

## 2. 상태 관리 규칙

### React Query (서버 상태)

- API fetching / caching 담당
- `queryKey`에 모든 의존성 포함
- `ErrorBoundary` resetKeys를 위해 queryKey 반환

```typescript
export function useFeatureData() {
  const dependency = useFeatureStore((state) => state.value);
  const queryKey = ['featureData', dependency];

  return {
    ...useQuery({
      queryKey,
      queryFn: () => featureService.getData(dependency),
      enabled: !!dependency,
    }),
    queryKey,
  };
}
```

### Zustand (클라이언트 상태)

- UI 상태 및 선택값 관리
- `stores` 폴더에서만 정의

```typescript
interface FeatureState {
  value: string;
  setValue: (value: string) => void;
}

export const useFeatureStore = create<FeatureState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

### 상태 관리 선택 기준

| 상태 유형 | 도구 | 예시 |
|----------|------|------|
| 서버 데이터 | React Query | API 응답, 캐시 |
| UI 상태 | Zustand | 필터 선택값, 모달 열림 |
| 폼 상태 | React Hook Form | 입력값, 유효성 |

---

## 3. 네이밍 컨벤션

| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 컴포넌트 | PascalCase | `FilterPanel.tsx` |
| 훅 | use + PascalCase | `useLegendData.ts` |
| 스토어 | use + Name + Store | `usePortfolioStore` |
| 서비스 | camelCase + Service | `portfolioService` |
| 상수 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| API 타입 | PascalCase + Dto | `LegendDto` |
| View 모델 | PascalCase + Vm | `LegendVm` |
| 테스트 | *.test.tsx | `Legend.test.tsx` |

---

## 4. Import 규칙

- Path Alias 적극 사용
- Feature 내부에서는 상대 경로 허용

```typescript
// 외부 feature에서 import
import { CustomSelect } from '@/features/common/components';
import { usePortfolioStore } from '@/features/portfolio/stores';

// 같은 feature 내부에서 import
import { useLegendData } from '../hooks';
```

---

## 5. Barrel Export

- 모든 폴더에 `index.ts` 생성
- 외부에서는 `index.ts`를 통해서만 import

```typescript
// features/common/components/index.ts
export { default as CustomSelect } from './CustomSelect';
export { default as Loading } from './Loading';
export { default as ErrorFallback } from './ErrorFallback';
```

---

## 6. 컴포넌트 패턴

### 기본 컴포넌트

```typescript
interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function Component({ value, onChange }: Props) {
  return <div>{value}</div>;
}
```

### forwardRef 패턴

```typescript
export interface ComponentHandle {
  method: () => void;
}

const Component = forwardRef<ComponentHandle>((_, ref) => {
  useImperativeHandle(ref, () => ({
    method: () => {},
  }));

  return <div />;
});

Component.displayName = 'Component';
export default Component;
```

### 컴포넌트 규칙

- Props는 `interface Props`로 정의
- `export default function` 사용
- `forwardRef` 사용 시 `displayName` 필수

---

## 7. 서비스 & 타입 정의

### 서비스 파일 구조

API 타입은 서비스 파일에 함께 정의

```typescript
// features/portfolio/services/portfolioService.ts

// API 응답 타입
export interface PortfolioDto {
  id: string;
  name: string;
  totalValue: number;
}

// API 호출
export const portfolioService = {
  getList: async (): Promise<PortfolioDto[]> => {
    const { data } = await axios.get('/api/portfolios');
    return data;
  },

  getById: async (id: string): Promise<PortfolioDto> => {
    const { data } = await axios.get(`/api/portfolios/${id}`);
    return data;
  },
};
```

### 서비스 규칙

- API 호출은 `services` 레이어에서만 수행
- 컴포넌트/훅에서 직접 axios 호출 금지

---

## 8. 에러 처리

### ErrorBoundary 적용

데이터를 fetch하는 페이지에는 `ErrorBoundary` 필수

```typescript
<ErrorBoundary resetKeys={[...queryKey1, ...queryKey2]}>
  <Component />
</ErrorBoundary>
```

### 에러 처리 규칙

- 여러 query 사용 시 `resetKeys` 병합
- `ErrorFallback` 컴포넌트로 일관된 에러 UI 제공
- React Query의 `onError` 콜백 활용

---

## 9. 테스트

### 단위 테스트 (Vitest)

테스트 파일은 대상 파일과 동일한 폴더에 위치

```bash
components/
├── FilterPanel.tsx
└── FilterPanel.test.tsx
```

### 단위 테스트 원칙

- UI 테스트는 렌더링 중심
- `@testing-library/react` 사용
- 사용자 인터랙션 시뮬레이션

```typescript
import { render, screen } from '@testing-library/react';
import FilterPanel from './FilterPanel';

describe('FilterPanel', () => {
  it('renders filter options', () => {
    render(<FilterPanel />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
```

### E2E 테스트 (Playwright)

E2E 테스트는 `e2e/` 폴더에 위치

```bash
e2e/
├── home.spec.ts
└── market.spec.ts
```

### E2E 테스트 실행

```bash
# E2E 테스트 실행
npm run test:e2e

# UI 모드로 실행
npm run test:e2e:ui
```

### E2E 테스트 원칙

- 사용자 시나리오 기반 테스트
- `data-testid` 속성으로 요소 선택
- 실제 API 호출 포함 (통합 테스트)

---

## 10. 코드 포맷팅

- `Prettier` + `ESLint` 설정 준수
- 자동 포맷 우선
- 저장 시 자동 포맷 설정 권장

---

## 11. 정리

- Feature 기반 폴더 구조
- React Query + Zustand 상태 관리 분리
- Barrel Export로 깔끔한 import
- ErrorBoundary 기반 에러 처리
- 자동 포맷팅과 규칙 검사 우선
