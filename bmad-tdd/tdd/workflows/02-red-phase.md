# 🔴 RED 단계 - 실패하는 테스트 작성

> TDD의 첫 번째 단계: 아직 구현되지 않은 기능에 대한 테스트를 먼저 작성

## 🎯 목표

구현 코드가 없는 상태에서 **어떻게 작동해야 하는지**를 테스트로 정의합니다.

## 👥 담당 에이전트

1. **@test-designer** - 테스트 케이스 설계
2. **@test-developer** - 실제 테스트 코드 작성

## 📋 진행 순서

### 1단계: 테스트 설계 (@test-designer)

**입력**:

- `tdd/artifacts/features/{taskId}.md` - 기능 명세서

**작업**:

- AAA 패턴의 테스트 케이스 작성
- 테스트 우선순위 설정 (Critical, Important, Nice to have)
- 테스트 데이터 준비 방법 정의
- 엣지 케이스 식별

**출력**:

- `tdd/artifacts/test-specs/{taskId}.md` - 테스트 설계 문서

**예시**:

```markdown
## Critical Test Cases

### 시나리오 1: 로그인 성공

- **Arrange**: 유효한 이메일과 비밀번호가 준비됨
- **Act**: 사용자가 로그인 버튼을 클릭
- **Assert**:
  - 성공 메시지가 표시됨
  - 메인 페이지로 리다이렉트됨
  - localStorage에 토큰이 저장됨
```

### 2단계: 테스트 코드 작성 (@test-developer)

**입력**:

- `tdd/artifacts/test-specs/{taskId}.md` - 테스트 설계 문서

**작업**:

- React Testing Library로 테스트 구현
- 모든 테스트 케이스를 실행 가능한 코드로 변환
- MSW로 API 모킹 (필요 시)

**출력**:

- `src/__tests__/**/*.spec.ts(x)` - 테스트 파일
- `tdd/artifacts/test-code/{taskId}.json` - 테스트 메타데이터

**예시**:

```typescript
describe('로그인 폼', () => {
  test('유효한 데이터로 로그인하면 성공 메시지가 나타난다', async () => {
    // Arrange
    render(<LoginForm />);
    const user = userEvent.setup();

    // Act
    await user.type(screen.getByLabelText(/이메일/i), 'user@example.com');
    await user.type(screen.getByLabelText(/비밀번호/i), 'password123');
    await user.click(screen.getByRole('button', { name: /로그인/i }));

    // Assert
    const successMessage = await screen.findByText(/로그인 성공/i);
    expect(successMessage).toBeInTheDocument();
  });
});
```

### 3단계: 테스트 실패 확인

**필수**:

```bash
pnpm test src/__tests__/auth/login.spec.tsx
```

**예상 결과**:

```
FAIL  src/__tests__/auth/login.spec.tsx
  로그인 폼
    ✗ 유효한 데이터로 로그인하면 성공 메시지가 나타난다 (24ms)

  ● 로그인 폼 › 유효한 데이터로 로그인하면 성공 메시지가 나타난다

    TestingLibraryElementError: Unable to find an element with the text: /로그인 성공/i

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
```

⚠️ **중요**: 모든 테스트가 실패해야 합니다. 통과하면 잘못된 것입니다!

## ✅ RED 단계 완료 체크리스트

- [ ] 테스트 설계 문서 작성 완료
- [ ] 모든 테스트 케이스가 테스트 코드로 구현됨
- [ ] 테스트 실행 시 **모두 실패**함 (RED 확인)
- [ ] 테스트 이름이 명확함 (동작과 예상 결과 포함)
- [ ] AAA 패턴 준수 (Arrange-Act-Assert)
- [ ] getByRole 우선 사용 (접근성)
- [ ] userEvent 사용 (fireEvent 금지)

## 🚨 주의사항

### 하지 말아야 할 것

❌ **구현 코드를 먼저 작성** - TDD 위반!  
❌ **테스트가 통과하는 상태** - RED 단계에서는 실패해야 함  
❌ **모호한 테스트 이름** - "로그인 테스트" (X) → "유효한 데이터로 로그인하면 성공 메시지가 나타난다" (O)  
❌ **구현 세부사항 테스트** - state, 내부 함수 등

### 해야 할 것

✅ **사용자 관점에서 테스트** - 사용자가 보고 클릭하는 것  
✅ **명확한 예상 결과** - 정확히 무엇이 나타나야 하는지  
✅ **독립적인 테스트** - 각 테스트는 다른 테스트에 의존하지 않음  
✅ **엣지 케이스 포함** - 빈 입력, 에러 상황 등

## 💡 TDD의 핵심

> "실패하는 테스트는 **요구사항의 명세서**입니다."

테스트가 실패하는 것은 좋은 것입니다. 이제 우리는:

1. 무엇을 만들어야 하는지 알고 있음
2. 언제 완료되는지 알 수 있음 (테스트가 통과할 때)
3. 회귀 방지 (나중에 코드가 깨지면 테스트가 알려줌)

## 🎯 다음 단계

RED 단계가 완료되면:

```
@orchestrator 다음 단계
```

→ GREEN 단계로 이동 (테스트를 통과시키는 코드 작성)

---

**관련 문서**:

- [01-workflow-overview.md](./01-workflow-overview.md) - 전체 워크플로우
- [03-green-phase.md](./03-green-phase.md) - GREEN 단계로 이동
