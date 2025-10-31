# 🔧 REFACTOR 단계 - 코드 개선

> TDD의 세 번째 단계: 테스트를 통과하는 상태를 유지하면서 코드 품질 향상

## 🎯 목표

**기능 변경 없이** 코드를 Clean Code 원칙에 맞게 개선합니다. 테스트가 계속 통과하는지 확인하면서 진행합니다.

## 👥 담당 에이전트

**@refactorer** - 코드 리팩토링 전문가

## 📋 진행 순서

### 1단계: 현재 코드 분석

**@refactorer가 확인하는 것**:

1. **Clean Code 원칙 위반**

   - 긴 함수 (20줄 초과)
   - 중복 코드
   - 모호한 이름
   - 매직 넘버/문자열

2. **프로젝트 규칙 위반**

   - ESLint 경고
   - TypeScript 엄격성
   - Import 순서
   - 네이밍 컨벤션

3. **개선 가능한 구조**
   - 추출 가능한 함수
   - 공통 로직
   - 타입 정의 개선

### 2단계: 리팩토링 실행

#### 2-1. 중복 제거

**Before (중복 있음)**:

```typescript
export function LoginForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrors({ ...errors, email: '이메일을 입력하세요' });
      return;
    }

    if (!password) {
      setErrors({ ...errors, password: '비밀번호를 입력하세요' });
      return;
    }

    // 제출...
  };
}
```

**After (추출)**:

```typescript
// utils/validation.ts
export function validateEmail(email: string): string | null {
  if (!email) return '이메일을 입력하세요';
  if (!emailRegex.test(email)) return '유효한 이메일을 입력하세요';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return '비밀번호를 입력하세요';
  if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다';
  return null;
}

// LoginForm.tsx
export function LoginForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    // 제출...
  };
}
```

#### 2-2. 함수 분리

**Before (긴 함수)**:

```typescript
export function LoginForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검증
    const errors: Record<string, string> = {};
    if (!email) errors.email = '이메일을 입력하세요';
    if (!password) errors.password = '비밀번호를 입력하세요';

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    // API 호출
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setErrors({ general: data.error });
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: '로그인에 실패했습니다' });
    } finally {
      setIsLoading(false);
    }
  };
}
```

**After (함수 분리)**:

```typescript
// hooks/useLogin.ts
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginApi(credentials);
      localStorage.setItem('token', response.token);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { login, isLoading, error };
}

// LoginForm.tsx
export function LoginForm() {
  const { login, isLoading, error } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLoginForm({ email, password });
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch {
      // 에러는 useLogin에서 처리
    }
  };
}
```

#### 2-3. 매직 넘버/문자열 제거

**Before**:

```typescript
if (password.length < 8) {
  return '비밀번호는 8자 이상이어야 합니다';
}

setTimeout(() => {
  setShowMessage(false);
}, 3000);
```

**After**:

```typescript
const MIN_PASSWORD_LENGTH = 8;
const SUCCESS_MESSAGE_DURATION = 3000;

if (password.length < MIN_PASSWORD_LENGTH) {
  return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`;
}

setTimeout(() => {
  setShowMessage(false);
}, SUCCESS_MESSAGE_DURATION);
```

#### 2-4. 네이밍 개선

**Before**:

```typescript
const data = await response.json();
const result = processData(data);
const temp = result.filter((x) => x.active);
```

**After**:

```typescript
const loginResponse = await response.json();
const validatedUser = validateUserData(loginResponse);
const activeUsers = validatedUser.filter((user) => user.isActive);
```

### 3단계: 테스트 통과 확인 (매 변경마다)

⚠️ **중요**: 각 리팩토링 후 반드시 테스트 실행!

```bash
# 매 변경 후 실행
pnpm test

# 모든 테스트가 여전히 통과해야 함
✓ All tests passed
```

## ✅ REFACTOR 단계 완료 체크리스트

- [ ] 모든 테스트가 여전히 통과함
- [ ] 중복 코드 제거
- [ ] 함수 길이 20줄 이하
- [ ] 명확한 함수/변수 이름
- [ ] 매직 넘버/문자열 상수화
- [ ] ESLint 경고 0개
- [ ] TypeScript 엄격성 준수
- [ ] Early return 패턴 적용

## 🚨 주의사항

### 절대 하지 말 것

❌ **기능 변경** - 동작이 바뀌면 안 됨  
❌ **테스트 실행 안 함** - 매 변경마다 확인 필수  
❌ **과도한 추상화** - 불필요한 패턴 적용  
❌ **대규모 리팩토링** - 작은 단위로 진행

### 반드시 할 것

✅ **작은 단위로** - 한 번에 하나씩  
✅ **테스트 실행** - 매 변경 후  
✅ **명확한 의도** - 왜 개선하는지  
✅ **일관성 유지** - 프로젝트 규칙 준수

## 💡 REFACTOR 단계의 핵심

> "동작하는 코드를 **읽기 좋은 코드**로 만드세요."

리팩토링의 가치:

1. **가독성** - 다른 개발자가 이해하기 쉬움
2. **유지보수성** - 수정이 용이함
3. **재사용성** - 공통 로직 추출
4. **안전성** - 테스트가 보호해줌

## 📊 리팩토링 평가

@refactorer는 리팩토링 완료 후 자기 평가를 수행합니다:

```
📊 리팩토링 결과

개선 사항:
- 함수 길이: 평균 45줄 → 18줄
- 중복 코드: 3곳 제거
- 네이밍: 5개 개선
- ESLint 경고: 2개 → 0개

품질 지표:
- 가독성: 85/100
- 유지보수성: 90/100
- 재사용성: 80/100
```

## 🎯 다음 단계

REFACTOR 단계가 완료되면:

```
@orchestrator 완료
```

→ 워크플로우 종료 및 최종 보고서 생성

---

**관련 문서**:

- [03-green-phase.md](./03-green-phase.md) - GREEN 단계 복습
- [01-workflow-overview.md](./01-workflow-overview.md) - 전체 워크플로우
