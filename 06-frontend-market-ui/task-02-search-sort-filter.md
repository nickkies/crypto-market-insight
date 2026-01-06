---
name: Task
about: Sub-task of a feature
title: '📋 [06-2] 검색/필터 기능'
labels: ['task', 'frontend']
assignees: []
---

## 🛠 Task

코인 목록의 검색과 즐겨찾기 필터 기능을 구현합니다.

## ✅ Done Criteria

### 검색 기능

- [ ] SearchInput 컴포넌트 생성
- [ ] useDebounce hook 구현 (300ms)
- [ ] 클리어 버튼 동작
- [ ] 서버 keyword 파라미터 연동 (useMarketStore.searchQuery)

### 즐겨찾기 필터

- [ ] FilterTabs 컴포넌트 (전체/즐겨찾기)
- [ ] 탭 전환 및 필터 로직
- [ ] 활성 탭 스타일링
- [ ] 즐겨찾기 없을 때 빈 상태 안내

## 📝 Notes

- 검색은 서버 keyword 파라미터 사용 (디바운스 적용)
- 정렬 기능은 제외 (기본 시가총액순 고정)
- useMarketStore.searchQuery와 연동
