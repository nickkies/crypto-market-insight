---
name: Task
about: Sub-task of a feature
title: '📋 [06-1] API Hooks + 코인 목록 컴포넌트 + 무한스크롤'
labels: ['task', 'frontend']
assignees: []
---

## 🛠 Task

Market API hooks와 코인 목록 컴포넌트, 무한 스크롤을 구현합니다.

## ✅ Done Criteria

### API Service & Hooks

- [ ] marketService 객체 생성 (getCoins, getCoinDetail, getOhlcv)
- [ ] useCoinsInfinite hook 구현 (useInfiniteQuery)
- [ ] useCoinDetail hook 구현
- [ ] useOhlcv hook 구현
- [ ] queryKey 일관성 유지

### 무한 스크롤

- [ ] useIntersectionObserver hook 구현
- [ ] 스크롤 끝 감지 시 다음 페이지 로드
- [ ] hasNextPage / isFetchingNextPage 처리

### 코인 목록 컴포넌트

- [ ] CoinList 컴포넌트 생성
- [ ] CoinCard 컴포넌트 생성 (반응형 카드)
- [ ] 가격/변동률 포맷팅 유틸 함수
- [ ] 즐겨찾기 토글 버튼 (useFavoritesStore 연동)
- [ ] 클릭 시 상세 페이지 이동

## 📝 Notes

- useFavoritesStore, useMarketStore는 이미 구현됨
- useInfiniteQuery의 getNextPageParam으로 페이지네이션
- 카드형 레이아웃 (모바일/데스크톱 통일)
