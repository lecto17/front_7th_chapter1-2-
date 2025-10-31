# 작업 범위 분석: 반복 일정 종료 조건 설정

## 📋 기본 정보

- **Task ID**: task-20251031-215000
- **기능명**: 반복 일정 종료 조건 설정
- **분석일**: 2025-10-31
- **분석자**: Feature Designer Agent

---

## 🎯 요구사항 분석

### 사용자 요구사항

> 반복 종료 조건을 지정할 수 있다. 옵션: 특정 날짜까지. 예제 특성상, 2025-12-31까지 최대 일자를 만들어 주세요.

### 핵심 기능

1. **반복 일정 UI 활성화**: 현재 주석처리된 반복 일정 입력 UI를 활성화
2. **종료 날짜 입력**: 사용자가 반복 종료 날짜를 입력할 수 있도록 함
3. **최대 날짜 제한**: 2025-12-31을 최대 종료 날짜로 설정
4. **반복 일정 생성**: 종료 날짜까지만 반복 일정 생성

---

## 🔍 기존 코드 분석

### 1. 타입 정의 (src/types.ts)

**현재 상태**: ✅ 이미 준비됨

```typescript
export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string; // 이미 정의되어 있음
}
```

**필요한 작업**: 없음

### 2. 폼 상태 관리 (src/hooks/useEventForm.ts)

**현재 상태**: ✅ 이미 준비됨

- `repeatType`, `repeatInterval`, `repeatEndDate` 상태 모두 구현됨
- `setRepeatType`, `setRepeatInterval`, `setRepeatEndDate` 함수 모두 있음
- `resetForm`, `editEvent` 함수에서 반복 관련 상태 처리 완료

**필요한 작업**: 없음

### 3. UI 컴포넌트 (src/App.tsx)

**현재 상태**: ⚠️ 주석 처리됨 (441-478줄)

```typescript
{
  /* ! 반복은 8주차 과제에 포함됩니다. 구현하고 싶어도 참아주세요~ */
}
{
  /* {isRepeating && (
  <Stack spacing={2}>
    <FormControl fullWidth>
      <FormLabel>반복 유형</FormLabel>
      <Select ... />
    </FormControl>
    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <FormLabel>반복 간격</FormLabel>
        <TextField ... />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel>반복 종료일</FormLabel>
        <TextField ... />
      </FormControl>
    </Stack>
  </Stack>
)} */
}
```

**필요한 작업**:

- 주석 제거하여 UI 활성화
- 반복 종료일 입력 필드에 최대 날짜 제한 추가 (`max="2025-12-31"`)
- 날짜 검증 추가 (선택적)

### 4. 반복 일정 생성 로직 (src/utils/repeatEventUtils.ts)

**현재 상태**: ✅ 이미 구현됨

```typescript
export function generateRepeatEvents(
  baseEvent: EventForm,
  maxCount: number = MAX_REPEAT_COUNT
): EventForm[] {
  // ...
  const endDate = repeat.endDate ? new Date(repeat.endDate) : null;

  // 종료일 검증 로직 이미 구현됨
  if (endDate && nextDate > endDate) {
    break;
  }
  // ...
}
```

**필요한 작업**: 없음 (이미 endDate를 고려하여 구현됨)

### 5. 일정 저장 로직 (src/hooks/useEventOperations.ts)

**필요 확인**: 반복 일정 생성 로직이 saveEvent에서 호출되는지 확인 필요

---

## 📦 영향 범위

### 수정이 필요한 파일

1. **src/App.tsx**
   - 주석 처리된 반복 일정 UI (441-478줄) 활성화
   - 반복 종료일 입력 필드에 최대 날짜 제한 추가
   - 주석 처리된 import 제거 (`RepeatType`)

### 수정이 불필요한 파일

1. **src/types.ts** - 이미 `endDate` 필드 있음
2. **src/hooks/useEventForm.ts** - 모든 상태와 함수 준비됨
3. **src/utils/repeatEventUtils.ts** - 종료일 처리 로직 구현됨

### 확인이 필요한 파일

1. **src/hooks/useEventOperations.ts**
   - `generateRepeatEvents` 함수 호출 여부 확인
   - 반복 일정 생성 로직이 적용되는지 확인

---

## 🧪 테스트 영향 범위

### 신규 테스트 필요 영역

1. **반복 종료일 입력 UI 테스트**

   - 종료일 입력 필드 렌더링
   - 최대 날짜 제한 (2025-12-31)
   - 유효하지 않은 날짜 입력 시 처리

2. **반복 일정 생성 통합 테스트**
   - 종료일이 있는 반복 일정 생성
   - 종료일까지만 일정 생성 확인

### 기존 테스트 수정 필요 여부

- 기존 `repeatEventUtils` 테스트: 종료일 관련 테스트 이미 있는지 확인 필요
- 기존 통합 테스트: 반복 일정 UI가 활성화되므로 영향 있을 수 있음

---

## ⚠️ 제약사항 및 고려사항

### 제약사항

1. **최대 날짜**: 2025-12-31까지만 허용
2. **기존 로직 활용**: 이미 구현된 `generateRepeatEvents` 로직 재사용
3. **UI 활성화**: 주석 처리된 UI를 그대로 활성화 (큰 변경 없이)

### 기술적 고려사항

1. **날짜 검증**

   - 반복 종료일이 일정 시작일보다 이전인 경우
   - 반복 종료일이 2025-12-31보다 이후인 경우
   - 빈 종료일 (무제한 반복)

2. **반복 일정 생성 시점**

   - 일정 저장 시점에 반복 일정 생성
   - `useEventOperations`의 `saveEvent` 함수에서 처리

3. **사용자 경험**
   - 종료일 없이도 반복 일정 생성 가능 (선택적)
   - 기본값 설정 여부

---

## 🔄 기존 기능과의 연관성

### 의존하는 기능

1. **반복 일정 생성 (task-20251031-000000)** - ✅ 완료됨

   - `RepeatInfo` 타입 정의
   - `generateRepeatEvents` 함수
   - 반복 유형 및 간격 처리

2. **반복 일정 표시 (task-20251031-173200)** - ✅ 완료됨
   - 반복 아이콘 표시
   - 반복 정보 텍스트 표시

### 영향받는 기능

1. **일정 생성/수정 UI**

   - 반복 일정 옵션이 활성화됨
   - 폼 검증 로직 추가 필요

2. **일정 목록 표시**
   - 반복 종료일 정보 표시 (이미 구현됨 - App.tsx 566줄)

---

## ✅ 작업 우선순위

### 높음 (필수)

1. UI 활성화 (`src/App.tsx` 주석 제거)
2. 최대 날짜 제한 추가 (`max="2025-12-31"`)
3. `useEventOperations`에서 반복 일정 생성 로직 확인 및 적용
4. 날짜 검증 로직 추가

### 중간 (권장)

1. 사용자 친화적인 에러 메시지
2. 날짜 입력 가이드 (placeholder, label)

### 낮음 (선택)

1. 반복 종료일 기본값 설정
2. 반복 패턴 미리보기

---

## 📝 추가 조사 필요 사항

### 확인 필요

1. **useEventOperations.ts**

   - `saveEvent` 함수에서 `generateRepeatEvents` 호출 여부
   - 반복 일정 배열을 어떻게 저장하는지

2. **기존 테스트**
   - `repeatEventUtils` 테스트에 종료일 관련 테스트 포함 여부
   - 통합 테스트에 반복 UI 관련 테스트 포함 여부

---

## 💡 구현 방향 제안

### 최소 변경 접근 (권장)

1. `src/App.tsx`에서 주석만 제거
2. 종료일 필드에 `max` 속성 추가
3. `useEventOperations`에서 반복 일정 생성 로직 적용

### 테스트 우선 접근

1. 종료일 검증 함수 테스트 작성
2. 반복 일정 생성 통합 테스트 작성
3. UI 활성화 및 검증 로직 구현

---

## 🎯 예상 산출물

1. **수정 파일**: `src/App.tsx`
2. **신규 유틸 함수** (필요 시): `src/utils/repeatEndDateValidation.ts`
3. **테스트 파일**:
   - `src/__tests__/unit/easy.repeatEndDateValidation.spec.ts` (선택적)
   - `src/__tests__/integration/repeatScheduleWithEndDate.spec.tsx`

---

## ✔️ 분석 완료 체크리스트

- [x] 기존 타입 정의 확인
- [x] 기존 상태 관리 확인
- [x] UI 컴포넌트 현황 파악
- [x] 반복 일정 생성 로직 분석
- [x] 수정 필요 파일 식별
- [x] 테스트 영향 범위 파악
- [x] 제약사항 및 고려사항 정리
- [x] 구현 방향 제안
- [ ] `useEventOperations.ts` 상세 확인 (다음 단계)
