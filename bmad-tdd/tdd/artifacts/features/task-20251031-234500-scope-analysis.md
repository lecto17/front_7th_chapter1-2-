# 작업 범위 분석: 반복 일정 수정

## 📋 기본 정보

- **Task ID**: task-20251031-234500
- **작성일**: 2025-10-31
- **작성자**: Feature Designer Agent

---

## 🎯 분석 목적

반복 일정 수정 기능을 구현하기 위해 기존 코드베이스를 분석하고, 영향을 받는 부분과 수정이 필요한 부분을 파악합니다.

---

## 🔍 현재 상태 분석

### 1. 기존 일정 수정 로직

**위치**: `src/hooks/useEventOperations.ts`

현재 일정 수정은 `updateEvent` 함수를 통해 이루어집니다:

```typescript
const updateEvent = async (eventData: Event) => {
  const response = await fetch(`/api/events/${eventData.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error('Failed to save event');
  }

  await handleSuccess('일정이 수정되었습니다.');
};
```

**문제점**:

- 반복 일정인지 여부를 확인하지 않음
- 사용자에게 "해당 일정만 수정" vs "전체 수정" 선택권을 주지 않음
- 모든 수정이 동일하게 처리됨

### 2. 반복 일정 데이터 구조

**위치**: `src/types.ts`

```typescript
export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

export interface Event extends EventForm {
  id: string;
}
```

**현재 상태**:

- `repeat.type`이 'none'이 아니면 반복 일정
- 반복 일정 여부는 `event.repeat.type !== 'none'`으로 확인 가능

### 3. UI에서 수정 호출 흐름

**위치**: `src/App.tsx`, `src/hooks/useEventForm.ts`

1. 사용자가 Edit 버튼 클릭 → `editEvent(event)` 호출
2. `editEvent`가 폼 상태를 채움
3. 사용자가 폼 수정 후 저장 버튼 클릭 → `addOrUpdateEvent()` 호출
4. `saveEvent(eventData)` 호출 → `updateEvent` 실행

### 4. 기존 다이얼로그 패턴

**위치**: `src/App.tsx` (lines 609-649)

```typescript
const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);

<Dialog open={isOverlapDialogOpen} onClose={() => setIsOverlapDialogOpen(false)}>
  <DialogTitle>일정 겹침 경고</DialogTitle>
  <DialogContent>...</DialogContent>
  <DialogActions>
    <Button onClick={() => setIsOverlapDialogOpen(false)}>취소</Button>
    <Button onClick={...}>계속 진행</Button>
  </DialogActions>
</Dialog>
```

**활용 가능성**: 동일한 패턴으로 반복 일정 수정 확인 다이얼로그 구현 가능

---

## 📦 수정이 필요한 파일 목록

### 1. `src/hooks/useEventOperations.ts` ⭐ (핵심)

**수정 내용**:

- `updateEvent` 함수를 `updateSingleEvent`와 `updateAllRepeatEvents`로 분리
- 또는 `updateEvent`에 `updateMode` 파라미터 추가

**예상 변경**:

```typescript
// 옵션 1: 함수 분리
const updateSingleEvent = async (eventData: Event) => {
  // 반복 정보를 'none'으로 변경
  const singleEventData = {
    ...eventData,
    repeat: { type: 'none', interval: 1, endDate: undefined },
  };
  // PUT 요청
};

const updateAllRepeatEvents = async (eventData: Event) => {
  // 기존 로직 유지
  // PUT 요청으로 반복 정보 포함
};

// 옵션 2: 모드 파라미터 추가
const updateEvent = async (eventData: Event, updateMode: 'single' | 'all') => {
  if (updateMode === 'single') {
    // 단일 수정 로직
  } else {
    // 전체 수정 로직
  }
};
```

### 2. `src/App.tsx` ⭐ (핵심)

**수정 내용**:

- 반복 일정 수정 확인 다이얼로그 상태 추가
- `addOrUpdateEvent` 함수 수정: 반복 일정 수정 시 다이얼로그 표시
- 다이얼로그 컴포넌트 추가

**예상 추가 상태**:

```typescript
const [isRepeatEditDialogOpen, setIsRepeatEditDialogOpen] = useState(false);
const [pendingEventData, setPendingEventData] = useState<Event | null>(null);
```

**예상 로직 변경**:

```typescript
const addOrUpdateEvent = async () => {
  // ... 기존 검증 로직 ...

  // 수정 중이고, 원본이 반복 일정인 경우
  if (editingEvent && editingEvent.repeat.type !== 'none') {
    setPendingEventData(eventData);
    setIsRepeatEditDialogOpen(true);
    return; // 다이얼로그에서 선택할 때까지 대기
  }

  // 일반 로직
  await saveEvent(eventData);
  resetForm();
};
```

### 3. `src/hooks/useEventForm.ts` (선택적)

**수정 여부**: 변경 불필요 (현재 구조로 충분)

**이유**:

- 이미 `editingEvent`를 통해 원본 일정 정보 보관
- 폼 상태는 수정된 데이터를 담고 있음
- 다이얼로그에서 선택에 따라 처리만 하면 됨

### 4. `src/types.ts` (선택적)

**수정 여부**: 변경 불필요

**이유**:

- 기존 `Event`, `RepeatInfo` 타입으로 충분
- 추가 타입 정의 불필요

---

## 🔗 의존성 분석

### 영향을 받는 기능

1. **일정 수정 기능** (직접 영향)

   - 반복 일정 수정 시 동작 변경
   - 단일 일정 수정은 기존과 동일

2. **반복 일정 표시** (간접 영향)

   - 단일 수정 선택 시 `repeat.type`이 'none'으로 변경됨
   - `RepeatEventIcon` 컴포넌트가 자동으로 아이콘을 숨김 (이미 구현됨)

3. **일정 목록 표시** (간접 영향)
   - 수정 후 목록이 새로고침됨
   - 기존 `fetchEvents` 로직 활용

### 영향을 받지 않는 기능

1. **일정 생성** - 변경 없음
2. **일정 삭제** - 변경 없음
3. **일정 검색/필터** - 변경 없음
4. **알림 기능** - 변경 없음
5. **캘린더 뷰** - 변경 없음

---

## ⚠️ 주의사항

### 1. 단일 수정 시 동작

**요구사항**:

- '예' 선택 시: 해당 일정만 수정 → 단일 일정으로 변경
- 반복 정보(`repeat.type`)를 'none'으로 변경
- 반복일정 아이콘 자동으로 사라짐

**구현 방법**:

```typescript
// 단일 수정 시
const singleEventData = {
  ...eventData,
  repeat: {
    type: 'none' as RepeatType,
    interval: 1,
    endDate: undefined,
  },
};
```

### 2. 전체 수정 시 동작

**요구사항**:

- '아니오' 선택 시: 반복 일정 유지
- 기존 반복 정보 그대로 유지
- 반복일정 아이콘 유지

**구현 방법**:

```typescript
// 전체 수정 시
// eventData를 그대로 사용 (반복 정보 포함)
```

### 3. 사용자 경험 고려사항

- 다이얼로그는 반복 일정 수정 시에만 표시
- 단일 일정 수정 시에는 다이얼로그 표시하지 않음
- 다이얼로그 문구는 명확하고 이해하기 쉬워야 함
- 취소 버튼도 제공하여 사용자가 선택을 번복할 수 있어야 함

### 4. 백엔드 API 고려사항

**현재 API**:

- `PUT /api/events/:id` - 일정 수정

**가정**:

- 백엔드는 요청 body의 `repeat` 필드를 그대로 업데이트
- 'none'으로 변경하면 단일 일정으로 변경됨
- 반복 정보를 유지하면 반복 일정으로 유지됨

**확인 필요**:

- 실제 API 동작 확인 (MSW 핸들러 참조)
- 필요 시 서버 로직도 수정 필요

---

## 📊 복잡도 평가

- **기술적 복잡도**: 중간 (Medium)
  - 새로운 로직 추가이지만 기존 패턴 활용 가능
  - 다이얼로그는 기존 겹침 경고 패턴 재사용
- **영향 범위**: 제한적

  - 주요 수정: 2개 파일 (`useEventOperations.ts`, `App.tsx`)
  - 다른 기능에 부작용 없음

- **테스트 범위**: 중간
  - 단위 테스트: `useEventOperations` 수정 함수
  - 통합 테스트: 반복 일정 수정 시나리오
  - UI 테스트: 다이얼로그 표시 및 선택

---

## ✅ 작업 진행 순서 제안

1. **Phase 1**: 기능 명세서 작성 (현재 단계)
2. **Phase 2**: 테스트 명세서 작성
3. **Phase 3**: 테스트 코드 작성 (RED)
   - 단일 수정 시나리오
   - 전체 수정 시나리오
   - 다이얼로그 표시 테스트
4. **Phase 4**: 구현 (GREEN)
   - `useEventOperations` 수정
   - `App.tsx` 다이얼로그 추가
5. **Phase 5**: 리팩토링 (REFACTOR)
   - 중복 코드 제거
   - 코드 품질 개선

---

## 📝 결론

반복 일정 수정 기능은 기존 코드베이스에 잘 통합될 수 있으며, 주요 수정은 2개 파일에 집중됩니다. 기존 다이얼로그 패턴을 재사용할 수 있어 일관된 UX를 제공할 수 있습니다.

---

**작성 완료**: 2025-10-31
**다음 단계**: 기능 명세서 작성
