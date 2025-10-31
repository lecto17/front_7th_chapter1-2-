## 🎯 전체 워크플로우

```
사용자 요구사항
      ↓
[@orchestrator] 워크플로우 초기화
      ↓
[@feature-designer] 기능 명세서 작성
      ↓
[@test-designer] 테스트 설계 문서 작성
      ↓
🔴 RED: [@test-developer] 실패하는 테스트 작성
      ↓
✅ GREEN: [@code-developer] 테스트 통과 코드 작성
      ↓
🔧 REFACTOR: [@refactorer] 코드 개선
      ↓
[@orchestrator] 워크플로우 완료
```

## 📂 폴더 구조

```
bmad-tdd/
├── core/                    # 핵심 프레임워크
│   ├── agents/              # 6개 전문 에이전트
│   ├── templates/           # 문서 템플릿
│   └── rules/               # 코딩 규칙
│
├── tdd/                     # TDD Method 모듈
│   ├── workflows/           # 이 가이드 문서들
│   └── artifacts/           # 산출물
│       ├── features/        # 기능 명세서
│       ├── test-specs/      # 테스트 설계
│       ├── test-code/       # 테스트 메타데이터
│       └── implementation/  # 구현 메타데이터
│
└── _cfg/                    # 사용자 영역 (업데이트 안전)
    └── state/               # 현재 작업 상태
```

## 🎯 각 단계별 역할

### 1. **워크플로우 초기화** - @orchestrator

- 고유 task-id 생성
- 상태 파일 생성 (`_cfg/state/current-task.json`)
- 작업 복잡도 및 예상 시간 평가

### 2. **기능 설계** - @feature-designer

- 사용자 스토리 작성
- 인수 조건 정의
- 기술적 요구사항 명세
- 산출물: `tdd/artifacts/features/{taskId}.md`

### 3. **테스트 설계** - @test-designer

- AAA 패턴의 테스트 케이스 작성
- 테스트 우선순위 설정
- 테스트 데이터 준비 방법 정의
- 산출물: `tdd/artifacts/test-specs/{taskId}.md`

### 4. **테스트 코드 작성 (RED)** - @test-developer

- React Testing Library 기반 테스트 작성
- 실패하는 테스트 확인
- 산출물: `src/__tests__/**/*.spec.ts(x)`

### 5. **구현 코드 작성 (GREEN)** - @code-developer

- 최소한의 코드로 테스트 통과
- 타입 안전성 및 접근성 확보
- 산출물: `src/**/*.ts(x)`

### 6. **리팩토링 (REFACTOR)** - @refactorer

- Clean Code 원칙 적용
- 중복 제거, 구조 개선
- 테스트 통과 유지

## 🔄 단계 간 전환

각 단계는 **사람의 승인**이 필요합니다:

```
단계 완료 → 산출물 검토 → 승인 → 다음 단계
```

승인 방법:

- `@orchestrator 다음 단계` 호출
- Orchestrator가 산출물 확인 후 다음 에이전트 안내

## 📊 진행 상황 추적

현재 상태 확인:

```
@orchestrator 상태
```

출력 예시:

```
📊 진행 상황
✅ 1. 기능 설계 (feature-design) - 완료
✅ 2. 테스트 설계 (test-design) - 완료
🔄 3. 테스트 코드 작성 (test-development) - 진행중
⬜ 4. 구현 코드 작성 (implementation)
⬜ 5. 리팩토링 (refactoring)

⏳ 진행률: 40% (2/5 단계 완료)
```

## 💡 BMAD 철학 적용

### Collaboration (협업)

- 각 에이전트는 전문 분야에 집중
- 인간이 각 단계를 검토하고 승인

### Optimized (최적화)

- 각 단계마다 최적화된 프로세스
- 불필요한 작업 최소화

### Reflection (성찰)

- 각 에이전트의 자기 평가 (100점 만점)
- 객관적 품질 지표 제공

### Engine (엔진)

- 6개 전문 에이전트의 체계적 협업
- 명확한 입출력과 의존성

## 🚀 빠른 시작

1. **새 기능 시작**

   ```
   @orchestrator 사용자 로그인 기능 개발
   ```

2. **각 단계 진행**

   - 각 에이전트가 완료되면 산출물 검토
   - 만족스러우면 `@orchestrator 다음 단계`

3. **완료**
   ```
   @orchestrator 완료
   ```

---

**다음 문서**:

- [02-red-phase.md](./02-red-phase.md) - RED 단계 상세 가이드
- [03-green-phase.md](./03-green-phase.md) - GREEN 단계 상세 가이드
- [04-refactor-phase.md](./04-refactor-phase.md) - REFACTOR 단계 상세 가이드
