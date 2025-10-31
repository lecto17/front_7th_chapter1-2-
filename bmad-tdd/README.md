# BMAD-TDD Framework

**Breakthrough Method for Agile AI-Driven Development의 TDD 특화 워크플로우**

> 이 시스템은 [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)의 철학을 기반으로,  
> TDD (Test-Driven Development) 사이클에 특화된 AI 에이전트 협업 프레임워크입니다.

## 🎯 BMAD의 C.O.R.E. 철학

- **C**ollaboration (협업): 인간-AI 파트너십을 통한 최적의 결과 도출
- **O**ptimized (최적화): 각 단계마다 최적화된 프로세스 적용
- **R**eflection (성찰): 자기 평가 시스템을 통한 품질 검증
- **E**ngine (엔진): 전문화된 에이전트들의 체계적 협업

**핵심 철학**: RED → GREEN → REFACTOR 사이클을 체계적으로 진행하며, 각 단계에서 사람이 검토하고 승인합니다.

---

## 📋 개요

TDD 방식으로 기능을 개발할 때 사용하는 6개의 전문 에이전트로 구성된 워크플로우 자동화 시스템입니다.

## 🎯 에이전트 소개

### 1. **@orchestrator** - 워크플로우 관리자

- 작업 시작, 상태 추적, 다음 단계 안내
- 고유 task-id 생성 및 진행 상황 관리

### 2. **@feature-designer** - 기능 설계 전문가

- 사용자 요구사항을 상세한 기능 명세서로 작성
- 인수 조건, 엣지 케이스, 기술 요구사항 정의

### 3. **@test-designer** - 테스트 설계 전문가

- 기능 명세서를 테스트 케이스로 변환
- AAA 패턴(Arrange-Act-Assert) 적용

### 4. **@test-developer** - 테스트 코드 작성자

- 실패하는 테스트 코드 작성 (🔴 RED 단계)
- React Testing Library 기반 테스트 구현

### 5. **@code-developer** - 구현 코드 작성자

- 테스트를 통과시키는 최소한의 코드 작성 (✅ GREEN 단계)
- Clean Code 원칙 준수

### 6. **@refactorer** - 리팩토링 전문가

- 테스트 통과 상태 유지하며 코드 개선 (🔧 REFACTOR 단계)
- 중복 제거, 네이밍 개선, 구조 최적화

---

## ✨ 주요 특징

### 1️⃣ 불명확한 정보 처리

모든 에이전트는 **추측하지 않고 명확히 질문**합니다.

```
⚠️ 다음 사항이 명확하지 않습니다:

1. 로그인 실패 시 에러 메시지
   - 옵션 A: "이메일을 확인하세요"
   - 옵션 B: "이메일 또는 비밀번호를 확인하세요"
   - 어떤 메시지를 표시해야 하나요?
```

**이유**: 잘못된 가정으로 인한 재작업 방지

### 2️⃣ 테스트 코드 보호

`@code-developer`는 **절대로 테스트 코드를 수정하지 않습니다**.

- ✅ 테스트 실패 → 구현 코드 수정
- ❌ 테스트 실패 → 테스트 코드 수정 (절대 금지)

**예외**: 테스트 자체가 명확히 잘못된 경우에만 `@test-developer`에게 보고

### 3️⃣ 체크박스 기반 진행 관리

워크플로우 진행 상황을 시각적으로 확인:

```
📊 진행 상황
✅ 1. 기능 설계 (feature-design) - 완료
✅ 2. 테스트 설계 (test-design) - 완료
🔄 3. 테스트 코드 작성 (test-development) - 진행중
⬜ 4. 구현 코드 작성 (implementation)
⬜ 5. 리팩토링 (refactoring)

⏳ 진행률: 40% (2/5 단계 완료)
```

### 4️⃣ 자기 평가 시스템

각 에이전트는 작업 완료 후 **100점 만점으로 자기 평가**:

```
📊 자기 평가 결과

종합 점수: 88/100 (B+)

1. 완성도: 28/30 ⭐⭐⭐⭐⭐
2. 품질: 26/30 ⭐⭐⭐⭐
3. 테스트 통과: 20/20 ⭐⭐⭐⭐⭐
4. 일관성: 14/20 ⭐⭐⭐

🎯 개선 권장사항
1. Import 순서 수정 (우선순위: 낮음)
2. 긴 함수 2개 분리 (우선순위: 중간)
```

**평가 항목**:

- 완성도, 품질, 명확성, 일관성 등
- 객관적 근거와 구체적 개선점 제시
- 우선순위 표시 (높음/중간/낮음)

### 5️⃣ 작은 태스크 관리

Orchestrator가 큰 태스크를 자동으로 감지하고 분리 제안:

```
⚠️ 태스크가 너무 큽니다!

현재 요청: "이벤트 관리 시스템 전체 개발"
예상 소요: 8-10시간

Task 1️⃣: 이벤트 타입 정의 (30분-1시간)
Task 2️⃣: 이벤트 CRUD API (1-2시간)
Task 3️⃣: 이벤트 목록 컴포넌트 (1-2시간)
Task 4️⃣: 이벤트 생성 폼 (2-3시간)

어떤 태스크부터 시작하시겠습니까?
```

**적절한 태스크 크기:**

- 소요 시간: 1-2시간 내
- 파일: 3개 이하
- 테스트: 5-10개 이하

---

## 🚀 빠른 시작

### 1단계: 워크플로우 시작

```
사용자: @orchestrator 일정 카테고리 필터링 기능 개발
```

Orchestrator가 task-id를 생성하고 작업을 초기화합니다.

**출력 예시:**

```
✅ 워크플로우가 초기화되었습니다!

📋 작업 정보
- Task ID: task-20250130-143022
- 기능명: 일정 카테고리 필터링 기능
- 상태 파일: bmad-tdd/_cfg/state/current-task.json

🎯 다음 단계: @feature-designer 호출
```

### 2단계: 기능 명세서 작성

```
사용자: @feature-designer
```

Feature Designer가 상세한 기능 명세서를 작성합니다.

**출력 위치:** `bmad-tdd/tdd/artifacts/features/task-20250130-143022.md`

**검토 사항:**

- [ ] 기능의 목적이 명확한가?
- [ ] 인수 조건이 측정 가능한가?
- [ ] 엣지 케이스를 충분히 고려했는가?

**승인 후:**

```
사용자: @orchestrator 다음 단계
```

### 3단계: 테스트 설계

```
사용자: @test-designer
```

Test Designer가 테스트 케이스를 설계합니다.

**출력 위치:** `bmad-tdd/tdd/artifacts/test-specs/task-20250130-143022.md`

**검토 사항:**

- [ ] 모든 인수 조건이 테스트로 변환되었는가?
- [ ] AAA 패턴을 따르는가?
- [ ] 엣지 케이스가 포함되었는가?

**승인 후:**

```
사용자: @orchestrator 다음 단계
```

### 4단계: 테스트 코드 작성 (🔴 RED)

```
사용자: @test-developer
```

Test Developer가 실패하는 테스트 코드를 작성합니다.

**출력 위치:** `src/__tests__/**/*.spec.ts(x)`

**실패 확인:**

```bash
pnpm test src/__tests__/features/categoryFilter.spec.tsx
```

**예상 결과:** 모든 테스트가 실패해야 함 (아직 구현 안됨)

**확인 후:**

```
사용자: @orchestrator 다음 단계
```

### 5단계: 구현 코드 작성 (✅ GREEN)

```
사용자: @code-developer
```

Code Developer가 테스트를 통과시키는 코드를 작성합니다.

**출력 위치:** `src/**/*.ts(x)`

**통과 확인:**

```bash
pnpm test
```

**예상 결과:** 모든 테스트가 통과해야 함

**확인 후:**

```
사용자: @orchestrator 다음 단계
```

### 6단계: 리팩토링 (🔧 REFACTOR)

```
사용자: @refactorer
```

Refactorer가 코드 품질을 개선합니다.

**개선 항목:**

- 중복 코드 제거
- 함수 분리
- 네이밍 개선
- 타입 안전성 강화

**검증:**

```bash
pnpm test  # 테스트 여전히 통과
pnpm lint  # 린트 에러 없음
```

**완료 후:**

```
사용자: @orchestrator 완료
```

### 7단계: 완료 및 보고서

Orchestrator가 최종 보고서를 생성하고 작업을 종료합니다.

## 📁 폴더 구조

```
tdd-workflow/
├── state/                          # 작업 상태
│   └── current-task.json           # 현재 진행 중인 작업 정보
│
├── specs/                          # 산출물
│   ├── features/                   # 기능 명세서
│   │   └── task-{id}.md
│   ├── test-specs/                 # 테스트 설계 문서
│   │   └── task-{id}.md
│   ├── test-code/                  # 테스트 코드 정보
│   │   └── task-{id}.json
│   └── implementation/             # 구현 결과 정보
│       ├── task-{id}.json
│       └── task-{id}-report.md     # 최종 보고서
│
└── templates/                      # 템플릿
    ├── feature-spec-template.md    # 기능 명세서 템플릿
    ├── test-spec-template.md       # 테스트 설계 템플릿
    └── refactor-checklist.md       # 리팩토링 체크리스트
```

## 💡 사용 팁

### Tip 1: 에이전트 호출 방법

Cursor에서 에이전트를 호출하는 방법:

```
방법 1: 채팅창에서
@orchestrator 일정 삭제 기능 개발

방법 2: Composer에서
@feature-designer (Composer 모드)

방법 3: 명령어로 (Cursor에 따라 다름)
/agent orchestrator
```

### Tip 2: 작업 중단 후 재개

작업을 중단했다가 나중에 재개하려면:

```
사용자: @orchestrator 상태

# 현재 진행 상황을 확인하고 다음 단계 계속 진행
사용자: @test-developer (예: 테스트 작성 단계였다면)
```

### Tip 3: 명세서 수정

명세서가 마음에 들지 않으면 수정 요청:

```
사용자: @feature-designer
엣지 케이스에 "네트워크 오류 상황"을 추가해주세요.
```

### Tip 4: 여러 작업 관리

새로운 작업을 시작하면 이전 작업이 완료되지 않았어도 경고를 받습니다:

```
사용자: @orchestrator 새 기능 개발

⚠️ 이미 진행 중인 워크플로우가 있습니다.
1. 현재 작업 계속
2. 현재 작업 종료
3. 강제로 새 작업 시작: @orchestrator 새로운작업 --force [기능 설명]
```

### Tip 5: 단계 건너뛰기 (권장하지 않음)

특별한 경우 단계를 건너뛸 수 있지만, TDD 사이클이 깨지므로 권장하지 않습니다.

## 🎓 워크플로우 예시

### 예시 1: 간단한 유틸 함수 추가

```
1. @orchestrator 이메일 유효성 검증 함수 추가
   → Task ID: task-20250130-100000

2. @feature-designer
   → specs/features/task-20250130-100000.md 생성
   → 검토 후 승인

3. @orchestrator 다음 단계

4. @test-designer
   → specs/test-specs/task-20250130-100000.md 생성
   → 검토 후 승인

5. @orchestrator 다음 단계

6. @test-developer
   → src/__tests__/unit/easy.validateEmail.spec.ts 생성
   → pnpm test (실패 확인)

7. @orchestrator 다음 단계

8. @code-developer
   → src/utils/validateEmail.ts 생성
   → pnpm test (통과 확인)

9. @orchestrator 다음 단계

10. @refactorer
    → 코드 개선 (타입 안전성, 네이밍 등)
    → pnpm test && pnpm lint (통과 확인)

11. @orchestrator 완료
    → 최종 보고서 생성
```

**소요 시간**: 약 15-20분

### 예시 2: 복잡한 컴포넌트 추가

```
1. @orchestrator 이벤트 필터 컴포넌트 개발
   → Task ID: task-20250130-110000

2. @feature-designer
   → 상세 명세서 작성 (UI/UX, 접근성, 상태 관리 등)

3. @test-designer
   → 통합 테스트 케이스 설계 (8개 테스트)

4. @test-developer
   → src/__tests__/components/EventFilter.spec.tsx
   → src/__tests__/hooks/medium.useEventFilter.spec.ts

5. @code-developer
   → src/components/EventFilter.tsx
   → src/hooks/useEventFilter.ts

6. @refactorer
   → 컴포넌트 분리 (FilterButton 추출)
   → 훅 최적화 (useMemo, useCallback)

7. 완료!
```

**소요 시간**: 약 1-2시간

## 🚨 문제 해결

### Q: 에이전트가 이전 단계 파일을 찾지 못해요

**A:** 상태 파일을 확인하세요:

```bash
cat bmad-tdd/_cfg/state/current-task.json
```

taskId가 올바른지 확인하고, 해당 명세서 파일이 존재하는지 확인합니다.

### Q: 테스트가 통과하는데 RED 단계가 완료되지 않았다고 해요

**A:** RED 단계에서는 테스트가 실패해야 정상입니다. 테스트가 통과한다면:

1. 테스트가 잘못 작성되었거나
2. 이미 기능이 구현되어 있거나
3. 테스트가 실제로 무언가를 검증하지 않고 있을 수 있습니다.

Test Developer에게 다시 테스트를 검토하도록 요청하세요.

### Q: 린트 에러가 계속 나와요

**A:** 각 에이전트는 프로젝트 규칙을 준수하지만, 때로 놓칠 수 있습니다:

```bash
# 자동 수정 시도
pnpm lint:eslint --fix

# 수동으로 수정이 필요한 경우
pnpm lint
```

Refactorer 단계에서 모든 린트 에러를 해결합니다.

### Q: 여러 파일을 한 번에 수정해야 하는 큰 기능인데요?

**A:** 큰 기능은 여러 개의 작은 작업으로 분리하는 것을 권장합니다:

1. 작업 1: 데이터 구조 및 타입 정의
2. 작업 2: 핵심 비즈니스 로직
3. 작업 3: UI 컴포넌트
4. 작업 4: 통합 및 테스트

각 작업을 별도의 워크플로우로 진행합니다.

## 📊 워크플로우 흐름도

```
┌─────────────────────────────────────────────────────────┐
│                    사용자 입력                           │
│              "일정 필터링 기능 개발"                      │
└────────────────────┬────────────────────────────────────┘
                     ↓
            ┌────────────────┐
            │ @orchestrator  │ ← 시작 및 상태 관리
            └────────┬───────┘
                     ↓
          ┌─────────────────┐
          │ @feature-designer│ ← 기능 명세서 작성
          └─────────┬────────┘
                    ↓
          specs/features/task-{id}.md
                    ↓
            [사용자 검토 & 승인]
                    ↓
          ┌──────────────────┐
          │  @test-designer  │ ← 테스트 설계
          └─────────┬────────┘
                    ↓
          specs/test-specs/task-{id}.md
                    ↓
            [사용자 검토 & 승인]
                    ↓
          ┌──────────────────┐
          │ @test-developer  │ ← 🔴 RED: 실패하는 테스트
          └─────────┬────────┘
                    ↓
          src/__tests__/**/*.spec.ts
                    ↓
            [테스트 실행: 실패 확인]
            $ pnpm test
                    ↓
          ┌──────────────────┐
          │ @code-developer  │ ← ✅ GREEN: 구현 코드
          └─────────┬────────┘
                    ↓
          src/**/*.ts(x)
                    ↓
            [테스트 실행: 통과 확인]
            $ pnpm test
                    ↓
          ┌──────────────────┐
          │   @refactorer    │ ← 🔧 REFACTOR: 코드 개선
          └─────────┬────────┘
                    ↓
          리팩토링된 코드
                    ↓
            [테스트 & 린트 확인]
            $ pnpm test && pnpm lint
                    ↓
          ┌──────────────────┐
          │  @orchestrator   │ ← 완료 처리
          └─────────┬────────┘
                    ↓
          specs/implementation/task-{id}-report.md
                    ↓
                  완료! 🎉
```

## 🎯 베스트 프랙티스

### 1. 작은 단위로 작업하기

하나의 워크플로우는 하나의 명확한 기능만 다룹니다.

**좋은 예:**

- "일정 카테고리 필터링 기능"
- "일정 삭제 확인 다이얼로그"
- "이메일 유효성 검증 함수"

**나쁜 예:**

- "일정 관리 시스템 전체 개발" (너무 큼)
- "버그 수정 및 새 기능 추가" (여러 작업 혼합)

### 2. 각 단계에서 충분히 검토하기

명세서나 테스트 설계가 마음에 들지 않으면 바로 다음 단계로 가지 말고 수정 요청합니다.

### 3. 테스트 실패/통과 반드시 확인하기

- RED 단계: 테스트가 실패하는지 확인
- GREEN 단계: 테스트가 통과하는지 확인
- REFACTOR 단계: 여전히 통과하는지 확인

### 4. 리팩토링을 건너뛰지 않기

시간이 없어도 리팩토링 단계를 건너뛰지 마세요. 기술 부채는 점점 쌓입니다.

### 5. 완료 후 커밋하기

워크플로우가 완료되면 바로 git commit:

```bash
git add .
git commit -m "feat: 일정 카테고리 필터링 기능 구현

- 기능 명세: bmad-tdd/tdd/artifacts/features/task-20250130-143022.md
- 테스트: src/__tests__/features/categoryFilter.spec.tsx
- 구현: src/components/CategoryFilter.tsx

Task-ID: task-20250130-143022"
```

## 📚 추가 참고 자료

- **TDD 가이드**: `docs/tdd-workflow-guide.md`
- **프로젝트 구조**: `.cursor/index.mdc`
- **Clean Code 원칙**: `.cursor/rules/clean-code.mdc`
- **React 베스트 프랙티스**: `.cursor/rules/react.mdc`
- **TypeScript 가이드**: `.cursor/rules/typescript.mdc`

## 🎉 마치며

이 워크플로우는 다음을 보장합니다:

- ✅ **높은 코드 품질**: Clean Code 원칙 준수
- ✅ **완전한 테스트 커버리지**: 모든 기능이 테스트됨
- ✅ **명확한 문서화**: 명세서와 테스트가 문서 역할
- ✅ **체계적인 개발**: 각 단계가 명확하게 정의됨
- ✅ **유지보수성**: 리팩토링을 통한 지속적인 개선

**Happy TDD Coding! 🚀**

---

문제가 있거나 개선 제안이 있으면 프로젝트 관리자에게 문의하세요.
