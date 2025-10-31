# ✅ GREEN 단계 - 테스트를 통과시키는 코드 작성

> TDD의 두 번째 단계: 실패하는 테스트를 통과시키는 **최소한의 코드** 작성

## 🎯 목표

작성된 테스트를 통과시키는 것에만 집중합니다. 과도한 설계나 불필요한 기능은 추가하지 않습니다.

## 👥 담당 에이전트

**@code-developer** - 구현 코드 작성 전문가

## 📋 진행 순서

### 1단계: 실패 원인 파악

**테스트 실행**:

```bash
pnpm test src/__tests__/auth/login.spec.tsx
```

**실패 분석**:

- 무엇이 없어서 실패하는가? (컴포넌트, 함수, 타입)
- 어떤 동작이 구현되어야 하는가?
- 어떤 결과를 기대하는가?

### 2단계: 최소한의 코드 작성

**원칙: YAGNI (You Aren't Gonna Need It)**

❌ **과도한 구현**:

```typescript
// 나쁜 예: 테스트에 없는 기능까지 구현
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // 테스트에 없음!
  const [loginAttempts, setLoginAttempts] = useState(0); // 테스트에 없음!

  // ... 복잡한 로직들
}
```

✅ **최소한의 구현**:

```typescript
// 좋은 예: 테스트가 요구하는 것만
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 테스트가 요구하는 최소 동작만
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">이메일</label>
      <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="password">비밀번호</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">로그인</button>
    </form>
  );
}
```

### 3단계: 단계별 구현 전략

#### 3-1. 가장 간단한 테스트부터

```typescript
// 1순위: 렌더링 테스트
test('로그인 폼이 렌더링된다', () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
});

// ✅ 최소 구현
export function LoginForm() {
  return (
    <form>
      <label htmlFor="email">이메일</label>
      <input id="email" />
    </form>
  );
}
```

#### 3-2. 상호작용 추가

```typescript
// 2순위: 입력 테스트
test('이메일을 입력할 수 있다', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText(/이메일/i), 'test@example.com');

  expect(screen.getByLabelText(/이메일/i)).toHaveValue('test@example.com');
});

// ✅ 상태 추가
export function LoginForm() {
  const [email, setEmail] = useState('');

  return (
    <form>
      <label htmlFor="email">이메일</label>
      <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
    </form>
  );
}
```

#### 3-3. 로직 구현

```typescript
// 3순위: 유효성 검증
test('빈 이메일로 제출하면 에러가 표시된다', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.click(screen.getByRole('button', { name: /로그인/i }));

  expect(screen.getByText(/이메일을 입력하세요/i)).toBeInTheDocument();
});

// ✅ 유효성 검증 추가
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('이메일을 입력하세요');
      return;
    }

    // 제출 로직...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      {error && <div>{error}</div>}
      <button type="submit">로그인</button>
    </form>
  );
}
```

### 4단계: 테스트 통과 확인

```bash
# 작성한 테스트 실행
pnpm test src/__tests__/auth/login.spec.tsx

# 전체 테스트 실행 (회귀 테스트)
pnpm test
```

**예상 결과**:

```
PASS  src/__tests__/auth/login.spec.tsx
  로그인 폼
    ✓ 로그인 폼이 렌더링된다 (12ms)
    ✓ 유효한 데이터로 로그인하면 성공 메시지가 나타난다 (145ms)
    ✓ 잘못된 이메일 형식은 에러 메시지가 표시된다 (89ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Duration:    2.34s
```

✅ **모든 테스트가 통과해야 합니다!**

## ✅ GREEN 단계 완료 체크리스트

- [ ] 모든 테스트가 통과함
- [ ] 기존 테스트도 여전히 통과함 (회귀 방지)
- [ ] 테스트가 요구하지 않는 기능은 추가하지 않음
- [ ] TypeScript strict mode 준수
- [ ] 접근성 속성 추가 (aria-label, role 등)
- [ ] 에러 처리 구현
- [ ] console.log 제거

## 🚨 주의사항

### 절대 하지 말 것

❌ **테스트 코드 수정** - 테스트가 실패하면 구현을 고쳐야 함  
❌ **과도한 설계** - 아직 필요없는 추상화, 패턴  
❌ **불필요한 기능** - 테스트에 없는 기능 추가  
❌ **any 타입 사용** - 명시적 타입 정의

### 반드시 할 것

✅ **최소한의 구현** - 테스트가 요구하는 것만  
✅ **타입 안전성** - TypeScript strict mode  
✅ **접근성** - 시맨틱 HTML, ARIA  
✅ **에러 처리** - try-catch, 에러 상태

## 💡 GREEN 단계의 핵심

> "일단 통과시키고, 나중에 개선하세요."

완벽한 코드를 지금 작성할 필요 없습니다:

1. 테스트가 통과하면 → 동작하는 코드
2. 리팩토링 단계에서 → 품질 개선
3. 테스트가 보호해줌 → 안전하게 개선 가능

## 🎯 다음 단계

GREEN 단계가 완료되면:

```
@orchestrator 다음 단계
```

→ REFACTOR 단계로 이동 (코드 개선)

---

**관련 문서**:

- [02-red-phase.md](./02-red-phase.md) - RED 단계 복습
- [04-refactor-phase.md](./04-refactor-phase.md) - REFACTOR 단계로 이동
