# TDD 작업 워크플로우 가이드

> **목적:** TDD 방식으로 기능을 개발할 때 매 작업마다 참고할 실용적인 체크리스트  
> **대상:** React + TypeScript + React Testing Library 환경

---

## 🔄 TDD 사이클 (필수)

```
1. ❌ RED   → 실패하는 테스트를 먼저 작성
2. ✅ GREEN → 테스트를 통과시키는 최소한의 코드 작성
3. 🔧 REFACTOR → 코드 개선 (테스트는 여전히 통과)
```

**핵심 규칙:**

- 한 번에 하나의 작은 테스트만 작성
- 테스트가 통과하기 전에는 구현 코드를 추가하지 않음
- 리팩토링은 테스트가 통과한 후에만 수행
- 구조 변경(리팩토링)과 기능 변경은 별도 커밋으로 분리

---

## ✅ 테스트 작성 전 체크리스트

### 1단계: 기능 명세 확인

- [ ] 사용자가 수행할 동작을 명확히 이해했는가?
- [ ] 기대되는 결과(화면 변화, 데이터 변경 등)를 알고 있는가?
- [ ] 엣지 케이스나 에러 상황을 고려했는가?

### 2단계: 테스트 케이스 설계

- [ ] 테스트 이름이 "무엇을 테스트하는지" 명확히 설명하는가?
- [ ] AAA 패턴을 따르는가?
  - Arrange: 초기 상태 설정
  - Act: 사용자 동작 수행
  - Assert: 결과 검증

### 3단계: 테스트 작성 시작

- [ ] 테스트 파일명: `{기능명}.test.ts` 또는 `{기능명}.spec.ts`
- [ ] describe 블록으로 관련 테스트를 그룹화했는가?
- [ ] 각 테스트는 독립적으로 실행 가능한가?

---

## 🎯 쿼리 선택 가이드 (빠른 참조)

**우선순위 순서대로 사용하세요:**

### 1순위: 접근성 기반 쿼리 (사용자 관점) ⭐

```typescript
// 1. getByRole - 가장 우선!
screen.getByRole('button', { name: /제출/i });
screen.getByRole('textbox', { name: /이메일/i });
screen.getByRole('heading', { name: /제목/i, level: 1 });

// 2. getByLabelText - 폼 요소에 적합
screen.getByLabelText(/비밀번호/i);

// 3. getByPlaceholderText
screen.getByPlaceholderText(/이름을 입력하세요/i);

// 4. getByText - 텍스트 콘텐츠로 찾기
screen.getByText(/환영합니다/i);
```

### 2순위: 시맨틱 쿼리

```typescript
// 5. getByAltText - 이미지
screen.getByAltText(/프로필 사진/i);

// 6. getByTitle
screen.getByTitle(/닫기/i);
```

### 3순위: 최후의 수단

```typescript
// 7. getByTestId - 다른 방법이 없을 때만!
screen.getByTestId('custom-element');
```

### 쿼리 타입별 사용 시기

```typescript
// getBy* - 요소가 바로 존재해야 할 때 (없으면 에러)
const button = screen.getByRole('button', { name: /제출/i });

// queryBy* - 요소가 없음을 확인할 때 (없으면 null 반환)
expect(screen.queryByText(/에러/i)).not.toBeInTheDocument();

// findBy* - 비동기로 나타날 요소를 기다릴 때 (Promise 반환)
const message = await screen.findByText(/저장 완료/i);
```

---

## 👤 사용자 상호작용 테스트

**항상 userEvent를 사용하세요 (fireEvent 금지):**

```typescript
import userEvent from '@testing-library/user-event';

test('사용자 입력 테스트', async () => {
  const user = userEvent.setup(); // ⭐ 테스트 시작 시 설정

  // 클릭
  await user.click(screen.getByRole('button', { name: /제출/i }));

  // 타이핑
  await user.type(screen.getByLabelText(/이메일/i), 'user@example.com');

  // 선택
  await user.selectOptions(screen.getByLabelText(/국가/i), 'korea');

  // 체크박스
  await user.click(screen.getByRole('checkbox', { name: /동의/i }));
});
```

---

## 🔍 검증(Assertion) 베스트 프랙티스

**jest-dom 매처를 사용하세요 (가독성 ↑, 에러 메시지 ↑):**

```typescript
// ✅ 좋은 예
expect(button).toBeDisabled();
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toHaveTextContent('저장 완료');
expect(input).toHaveValue('test@example.com');
expect(checkbox).toBeChecked();

// ❌ 나쁜 예
expect(button.disabled).toBe(true); // 에러 메시지가 불친절
expect(element).toBeTruthy(); // 너무 추상적
```

---

## ⏱️ 비동기 처리 패턴

### 패턴 1: findBy 사용 (권장)

```typescript
// ✅ 간단하고 명확
test('비동기 데이터 로딩', async () => {
  render(<UserProfile userId="123" />);

  // 로딩 후 나타날 요소를 기다림
  const userName = await screen.findByText(/홍길동/i);
  expect(userName).toBeInTheDocument();
});
```

### 패턴 2: waitFor 사용 (복잡한 조건)

```typescript
// ✅ 구체적인 기대식을 콜백에 넣기
await waitFor(() => {
  expect(mockFetch).toHaveBeenCalledWith('/api/users/123');
});

// ❌ 빈 콜백 금지
await waitFor(() => {}); // 안티패턴!
```

### 패턴 3: 요소 사라짐 확인

```typescript
// ✅ waitForElementToBeRemoved 사용
await waitForElementToBeRemoved(() => screen.queryByText(/로딩중/i));
```

---

## ⚠️ 자주 하는 실수들 (금지 사항)

### ❌ 1. cleanup 수동 호출

```typescript
// ❌ 불필요 (자동으로 됨)
afterEach(() => {
  cleanup();
});
```

### ❌ 2. act() 불필요하게 감싸기

```typescript
// ❌ RTL이 이미 처리함
await act(async () => {
  await user.click(button);
});

// ✅ 그냥 사용
await user.click(button);
```

### ❌ 3. render 결과 디스트럭처링

```typescript
// ❌ 에러 메시지가 불친절해짐
const { getByRole } = render(<Component />);
const button = getByRole('button');

// ✅ screen 사용
render(<Component />);
const button = screen.getByRole('button');
```

### ❌ 4. querySelector 사용

```typescript
// ❌ 사용자 관점이 아님
const element = container.querySelector('.button-class');

// ✅ 접근성 쿼리 사용
const element = screen.getByRole('button', { name: /제출/i });
```

### ❌ 5. queryBy로 존재 확인

```typescript
// ❌ queryBy는 부재 확인용
const button = screen.queryByRole('button');
expect(button).toBeInTheDocument();

// ✅ getBy 사용
const button = screen.getByRole('button');
expect(button).toBeInTheDocument();
```

### ❌ 6. testId 남용

```typescript
// ❌ 접근성 무시
<button data-testid="submit-btn">제출</button>
screen.getByTestId('submit-btn')

// ✅ 암묵적 role 활용
<button>제출</button>
screen.getByRole('button', { name: /제출/i })
```

---

## 📝 테스트 작성 템플릿

### 기본 템플릿

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  test('사용자가 [동작]하면 [결과]가 나타난다', async () => {
    // Arrange (준비)
    const user = userEvent.setup();
    render(<ComponentName />);

    // Act (실행)
    await user.click(screen.getByRole('button', { name: /클릭/i }));

    // Assert (검증)
    expect(screen.getByText(/성공/i)).toBeInTheDocument();
  });
});
```

### 비동기 데이터 템플릿

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName - 데이터 로딩', () => {
  test('데이터를 성공적으로 불러온다', async () => {
    // Arrange
    render(<ComponentName />);

    // Assert - 비동기 요소 대기
    const data = await screen.findByText(/데이터 내용/i);
    expect(data).toBeInTheDocument();
  });

  test('로딩 중에는 스피너가 보인다', async () => {
    // Arrange
    render(<ComponentName />);

    // Assert - 로딩 표시 확인
    expect(screen.getByText(/로딩중/i)).toBeInTheDocument();

    // Assert - 로딩 완료 후 사라짐
    await waitForElementToBeRemoved(() => screen.queryByText(/로딩중/i));
  });
});
```

### 폼 제출 템플릿

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormComponent } from './FormComponent';

describe('FormComponent', () => {
  test('유효한 데이터로 폼을 제출하면 성공 메시지가 나타난다', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<FormComponent onSubmit={handleSubmit} />);

    // Act - 입력
    await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123');

    // Act - 제출
    await user.click(screen.getByRole('button', { name: /제출/i }));

    // Assert
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    const successMessage = await screen.findByText(/제출 완료/i);
    expect(successMessage).toBeInTheDocument();
  });

  test('필수 입력을 누락하면 에러 메시지가 나타난다', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FormComponent />);

    // Act - 빈 폼 제출
    await user.click(screen.getByRole('button', { name: /제출/i }));

    // Assert
    expect(screen.getByText(/이메일을 입력하세요/i)).toBeInTheDocument();
  });
});
```

---

## 🎓 TypeScript 관련 팁

### 1. 테스트 유틸 함수에 타입 추가

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

interface CustomRenderOptions extends RenderOptions {
  initialState?: AppState;
}

export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  const { initialState, ...renderOptions } = options || {};

  return {
    user: userEvent.setup(),
    ...render(<Providers initialState={initialState}>{ui}</Providers>, renderOptions),
  };
}
```

### 2. Mock 함수 타입 지정

```typescript
// ✅ 타입 안전한 mock
const mockFetchUser = jest
  .fn<Promise<User>, [string]>()
  .mockResolvedValue({ id: '1', name: '홍길동' });

// 사용
mockFetchUser('123'); // 타입 체크 O
```

### 3. 커스텀 매처 타입 확장

```typescript
// setupTests.ts
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
    }
  }
}
```

---

## 💡 TDD 작업 시 체크리스트 요약

### 새 기능 개발 시:

1. [ ] 기능 명세를 읽고 이해했는가?
2. [ ] 가장 단순한 케이스의 실패 테스트를 작성했는가?
3. [ ] 테스트가 실제로 실패하는지 확인했는가? (RED)
4. [ ] 테스트를 통과시키는 최소 코드를 작성했는가? (GREEN)
5. [ ] 모든 테스트가 통과하는가?
6. [ ] 리팩토링이 필요한가? (필요 시 수행)
7. [ ] 린트 경고가 없는가?
8. [ ] 커밋 메시지가 명확한가?

### 테스트 작성 시:

1. [ ] `screen.*` 으로 쿼리하는가?
2. [ ] 쿼리 우선순위를 지켰는가? (getByRole 우선)
3. [ ] `userEvent.setup()` 을 사용하는가?
4. [ ] 비동기는 `findBy*` 또는 `waitFor`를 사용하는가?
5. [ ] jest-dom 매처를 사용하는가?
6. [ ] testId를 최소화했는가?
7. [ ] 테스트 이름이 명확한가?

---

## 📚 더 자세한 내용은...

- **프로젝트 전체 가이드라인**: `/testing-guidelines.md`
- **Kent C. Dodds 블로그**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **RTL 공식 문서**: https://testing-library.com/docs/queries/about/

---

**작성 일자:** 2025-10-29  
**버전:** 1.0.0
