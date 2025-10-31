# 작업 범위 분석: 반복 일정 기능

## 📋 기본 정보

- **Task ID**: task-20251031-000000
- **작성일**: 2025-10-31
- **분석자**: Feature Designer Agent

---

## 🔍 현재 프로젝트 상태 분석

### 이미 구현된 부분 ✅

1. **타입 정의** (`src/types.ts`)

   - `RepeatType`: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
   - `RepeatInfo`: { type, interval, endDate }
   - `EventForm`, `Event` 인터페이스에 repeat 필드 포함

2. **상태 관리** (`src/hooks/useEventForm.ts`)

   - `isRepeating`, `repeatType`, `repeatInterval`, `repeatEndDate` 상태 존재
   - `setRepeatType`, `setRepeatInterval`, `setRepeatEndDate` 함수 존재
   - 폼 리셋 및 수정 시 반복 정보 처리 로직 포함

3. **UI 준비** (`src/App.tsx` 441-478줄)

   - 반복 유형 선택 UI가 주석 처리된 채로 존재
   - Material-UI Select, TextField 컴포넌트 사용
   - 반복 간격, 반복 종료일 입력 필드 포함

4. **서버 API** (`server.js`)
   - `/api/events-list` POST 엔드포인트 존재 (여러 이벤트 일괄 생성 지원)
   - 반복 이벤트에 대한 repeatId 자동 생성 로직 포함

### 미구현 부분 ❌

1. **반복 일정 생성 로직**

   - 기준일로부터 반복 일정 날짜들을 계산하는 유틸 함수 없음
   - 매일/매주/매월/매년에 따른 날짜 생성 로직 없음
   - 특수 케이스 처리 로직 없음 (31일 매월, 2월 29일 매년)

2. **API 호출 통합**

   - `useEventOperations`의 `saveEvent`는 단일 이벤트만 생성
   - 반복 일정 시 여러 이벤트를 생성하는 로직 없음

3. **반복일정 겹침 체크 제외**
   - 현재 `findOverlappingEvents`가 모든 이벤트에 적용됨
   - 반복일정 생성 시 겹침 체크를 건너뛰는 로직 필요

---

## 📦 수정이 필요한 파일

### 1. `src/App.tsx` (수정)

- **수정 내용**:
  - 441-478줄 주석 해제 및 활성화
  - `setRepeatType`, `setRepeatInterval`, `setRepeatEndDate` 주석 해제
  - `addOrUpdateEvent` 함수 수정 (반복일정 겹침 체크 제외)

### 2. `src/utils/repeatEventUtils.ts` (신규 생성)

- **생성 이유**: 반복 일정 생성 로직 분리
- **주요 함수**:
  - `generateRepeatEvents(baseEvent: EventForm): Event[]` - 반복 이벤트 배열 생성
  - `getNextOccurrenceDate(baseDate: Date, repeatType: RepeatType, interval: number): Date | null` - 다음 발생 날짜 계산
  - `isValidRepeatDate(date: Date, baseDate: Date, repeatType: RepeatType): boolean` - 특수 케이스 검증

### 3. `src/hooks/useEventOperations.ts` (수정)

- **수정 내용**:
  - `saveEvent` 함수 수정
  - 반복 일정인 경우 `/api/events-list` 엔드포인트 사용
  - 단일 일정인 경우 기존 로직 유지

### 4. `src/__tests__/unit/easy.repeatEventUtils.spec.ts` (신규 생성)

- **생성 이유**: 반복 일정 생성 로직 단위 테스트

### 5. `src/__tests__/hooks/medium.useEventOperations.spec.ts` (수정)

- **수정 내용**: 반복 일정 저장 로직 테스트 추가

---

## 🔗 의존성 분석

### 영향받는 컴포넌트/훅

- `App.tsx` - UI 변경
- `useEventForm` - 이미 준비됨, 추가 수정 불필요
- `useEventOperations` - saveEvent 로직 수정 필요

### 영향받지 않는 부분

- `useCalendarView` - 변경 불필요
- `useNotifications` - 변경 불필요
- `useSearch` - 변경 불필요
- `eventOverlap.ts` - 변경 불필요 (호출부에서 제어)
- `dateUtils.ts` - 변경 불필요 (기존 유틸 재사용)

### 기존 테스트에 미치는 영향

- 기존 테스트는 대부분 영향 없음
- `useEventOperations` 테스트만 업데이트 필요

---

## ⚠️ 주의사항

### 1. 반복일정 겹침 체크 제외

- 요구사항에 명시: "반복일정은 일정 겹침을 고려하지 않는다"
- `addOrUpdateEvent` 함수에서 `isRepeating`이 true인 경우 겹침 체크 건너뛰기

### 2. 특수 케이스 처리

- **31일 매월 반복**: 31일이 없는 달(2, 4, 6, 9, 11월)에는 일정 생성 안 함
- **2월 29일 매년 반복**: 윤년이 아닌 해에는 일정 생성 안 함
- **일반적인 존재하지 않는 날짜**: 해당 날짜가 유효하지 않으면 건너뜀

### 3. API 호환성

- 서버의 `/api/events-list` 엔드포인트는 이미 구현되어 있음
- 요청 형식: `{ events: Event[] }`
- 응답: 생성된 이벤트 배열

### 4. 성능 고려

- 반복 종료일이 너무 먼 경우 많은 이벤트 생성 가능
- 적절한 제한 필요 (예: 최대 2년, 최대 100개 이벤트 등)

---

## 📋 작업 체크리스트

- [ ] 반복 일정 생성 유틸 함수 구현
- [ ] 특수 케이스 처리 로직 구현 (31일 매월, 2월 29일 매년)
- [ ] App.tsx UI 주석 해제 및 활성화
- [ ] useEventOperations saveEvent 로직 수정
- [ ] 반복일정 겹침 체크 제외 로직 추가
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] 성능 제한 추가 (선택적)

---

## 🎯 구현 우선순위

1. **높음**: 반복 일정 생성 유틸 함수 (`repeatEventUtils.ts`)
2. **높음**: 특수 케이스 처리 로직
3. **중간**: API 호출 로직 수정 (`useEventOperations.ts`)
4. **중간**: UI 활성화 (`App.tsx`)
5. **낮음**: 성능 최적화 및 제한

---

## 💡 기술적 고려사항

### 날짜 계산

- JavaScript Date 객체 사용
- 타임존 고려 불필요 (날짜만 사용)
- `date-fns` 같은 라이브러리 불필요 (간단한 로직)

### 에러 처리

- 유효하지 않은 반복 종료일 검증
- 반복 간격이 0 이하인 경우 처리
- 생성할 이벤트가 너무 많은 경우 경고

### 사용자 경험

- 반복 일정 생성 중 로딩 표시
- 생성된 이벤트 개수 표시 ("10개의 반복 일정이 생성되었습니다")
- 특수 케이스로 인해 건너뛴 날짜가 있으면 알림
