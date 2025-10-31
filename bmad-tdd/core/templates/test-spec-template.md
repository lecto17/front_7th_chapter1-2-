# 테스트 설계 명세서: {기능명}

## 📋 기본 정보

- **Task ID**: {task-id}
- **작성일**: {날짜}
- **작성자**: Test Designer Agent
- **기능 명세서**: `specs/features/{task-id}.md`

---

## 🎯 테스트 전략

### 테스트 범위

- **단위 테스트**: {범위 설명}
- **통합 테스트**: {범위 설명}
- **E2E 테스트**: {필요 여부 및 범위}

### 테스트 우선순위

1. 🔴 **Critical**: {핵심 테스트}
2. 🟡 **Important**: {중요 테스트}
3. 🟢 **Nice to have**: {추가 테스트}

---

## 📝 테스트 케이스

### 테스트 케이스 1: {테스트 케이스 이름}

**우선순위**: {Critical/Important/Nice to have}

**Arrange** (준비)

- {초기 상태 설명}
- {필요한 데이터 설명}

**Act** (실행)

- {사용자 동작 또는 함수 호출}

**Assert** (검증)

- {예상 결과 1}
- {예상 결과 2}

**테스트 파일**: `src/__tests__/{경로}/{파일명}.spec.ts`

---

### 테스트 케이스 2: {테스트 케이스 이름}

**우선순위**: {Critical/Important/Nice to have}

**Arrange** (준비)

- {초기 상태}

**Act** (실행)

- {동작}

**Assert** (검증)

- {예상 결과}

**테스트 파일**: `src/__tests__/{경로}/{파일명}.spec.ts`

---

## 🧪 테스트 데이터 정의

### Mock 데이터

```typescript
// 테스트에 사용할 Mock 데이터
const mockData = {
  // ...
};
```

### Fixture 데이터

```typescript
// 재사용 가능한 테스트 데이터
const fixture = {
  // ...
};
```

---

## 🎭 Mock/Stub 전략

### API Mocking (MSW)

```typescript
// 필요한 API 핸들러
http.get('/api/endpoint', () => {
  return HttpResponse.json({ ... });
});
```

### 컴포넌트/함수 Mocking

```typescript
// vi.mock() 사용
vi.mock('./module', () => ({
  function: vi.fn(),
}));
```

---

## 📁 테스트 파일 구조

```
src/__tests__/
  └── {기능 카테고리}/
      ├── {파일명}.spec.ts        # 단위 테스트
      └── {파일명}.spec.tsx       # 컴포넌트 테스트
```

### 예상 테스트 파일 목록

1. `src/__tests__/{경로}/{파일명}.spec.ts` - {설명}
2. `src/__tests__/{경로}/{파일명}.spec.tsx` - {설명}

---

## 🎯 React Testing Library 쿼리 전략

### 사용할 쿼리 (우선순위 순)

1. **getByRole**: `screen.getByRole('button', { name: /버튼명/i })`
2. **getByLabelText**: `screen.getByLabelText(/레이블/i)`
3. **getByText**: `screen.getByText(/텍스트/i)`
4. **getByTestId**: 최후의 수단으로만 사용

### 비동기 처리

- **findBy**: 비동기로 나타날 요소
- **waitFor**: 복잡한 조건 대기

---

## ⚠️ 엣지 케이스 테스트

### 1. {엣지 케이스 1}

- **시나리오**: {설명}
- **검증 항목**: {확인할 내용}

### 2. {엣지 케이스 2}

- **시나리오**: {설명}
- **검증 항목**: {확인할 내용}

---

## 🚨 에러 처리 테스트

### 1. {에러 상황 1}

- **발생 조건**: {설명}
- **예상 동작**: {설명}
- **검증 방법**: {설명}

---

## 📋 테스트 체크리스트

### 테스트 작성 전

- [ ] 기능 명세서 검토 완료
- [ ] 테스트 케이스가 인수 조건을 모두 커버하는가?
- [ ] Mock 전략이 명확한가?
- [ ] 테스트 데이터가 준비되었는가?

### 테스트 작성 중

- [ ] AAA 패턴을 따르는가?
- [ ] 접근성 쿼리를 우선 사용하는가?
- [ ] userEvent를 사용하는가?
- [ ] 비동기 처리가 적절한가?

### 테스트 작성 후

- [ ] 모든 테스트가 실패하는가? (RED 단계)
- [ ] 테스트 이름이 명확한가?
- [ ] 중복 코드가 없는가?
- [ ] 테스트가 독립적으로 실행 가능한가?

---

## 📚 참고 문서

- TDD 워크플로우 가이드: `docs/tdd-workflow-guide.md`
- 프로젝트 구조: `.cursor/index.mdc`
- React 베스트 프랙티스: `.cursor/rules/react.mdc`
