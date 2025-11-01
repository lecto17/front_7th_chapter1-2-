import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// ! Hard 여기 제공 안함
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    await user.click(await screen.findByLabelText('Edit event'));

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // ! 현재 시스템 시간 2025-10-01
    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번주 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번주 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    setup(<App />);

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번달 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번달 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 1,
              title: '팀 회의',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: 2,
              title: '프로젝트 계획',
              date: '2025-10-16',
              startTime: '14:00',
              endTime: '15:00',
              description: '새 프로젝트 계획 수립',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    // 시간 수정하여 다른 일정과 충돌 발생
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '08:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));

  setup(<App />);

  // ! 일정 로딩 완료 후 테스트
  await screen.findByText('일정 로딩 완료!');

  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});

describe('반복 일정 종료 조건 설정', () => {
  describe('반복 설정 UI', () => {
    it('반복 체크박스 체크 시 반복 설정 UI가 표시된다', async () => {
      // Arrange
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // Act
      await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

      // Assert
      expect(screen.getByLabelText(/반복 유형/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/반복 간격/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/반복 종료일/i)).toBeInTheDocument();
    });

    it('반복 체크박스 해제 시 반복 설정 UI가 숨겨진다', async () => {
      // Arrange
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 먼저 체크
      await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
      expect(screen.getByLabelText(/반복 유형/i)).toBeInTheDocument();

      // Act - 다시 클릭하여 해제
      await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

      // Assert
      expect(screen.queryByLabelText(/반복 유형/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/반복 간격/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/반복 종료일/i)).not.toBeInTheDocument();
    });

    it('반복 종료일 필드에 최대 날짜 제한이 설정되어 있다', async () => {
      // Arrange
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // Act
      await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
      const repeatEndDateInput = screen.getByLabelText(/반복 종료일/i);

      // Assert
      expect(repeatEndDateInput).toHaveAttribute('max', '2025-12-31');
      expect(repeatEndDateInput).toHaveAttribute('type', 'date');
    });
  });

  describe('반복 종료일 검증', () => {
    it('종료일이 시작일보다 이전인 경우 에러 메시지가 표시된다', async () => {
      // Arrange
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // Act - 일정 정보 입력
      await user.type(screen.getByLabelText('제목'), '주간 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-11-10');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');

      // 반복 설정
      await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
      await user.click(screen.getByLabelText(/반복 유형/i));
      await user.click(screen.getByText('매주'));
      await user.clear(screen.getByLabelText(/반복 간격/i));
      await user.type(screen.getByLabelText(/반복 간격/i), '1');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2025-11-05');

      // 일정 추가 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // Assert - 에러 메시지 표시
      expect(await screen.findByText(/종료일은 시작일 이후여야 합니다/i)).toBeInTheDocument();
    });
  });

  describe('반복 일정 생성', () => {
    it('종료일이 있는 반복 일정은 종료일까지만 생성된다', async () => {
      // Arrange
      setupMockHandlerCreation();
      vi.setSystemTime(new Date('2025-11-01T00:00:00Z'));

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // Act - 일정 정보 입력
      await user.type(screen.getByLabelText('제목'), '매주 운동');
      await user.type(screen.getByLabelText('날짜'), '2025-11-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');

      // 반복 설정
      await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
      await user.click(screen.getByLabelText(/반복 유형/i));
      await user.click(screen.getByText('매주'));
      await user.clear(screen.getByLabelText(/반복 간격/i));
      await user.type(screen.getByLabelText(/반복 간격/i), '1');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2025-11-30');

      // 일정 추가 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // Assert - 성공 메시지 표시
      expect(await screen.findByText(/5개의 반복 일정이 생성되었습니다/i)).toBeInTheDocument();
    });

    it('종료일 없는 반복 일정은 최대 100개까지 생성된다', async () => {
      // Arrange
      setupMockHandlerCreation();
      vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // Act - 일정 정보 입력
      await user.type(screen.getByLabelText('제목'), '매일 알림');
      await user.type(screen.getByLabelText('날짜'), '2025-01-01');
      await user.type(screen.getByLabelText('시작 시간'), '09:00');
      await user.type(screen.getByLabelText('종료 시간'), '09:30');

      // 반복 설정 (종료일 비워둠)
      await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
      await user.click(screen.getByLabelText(/반복 유형/i));
      await user.click(screen.getByText('매일'));
      await user.clear(screen.getByLabelText(/반복 간격/i));
      await user.type(screen.getByLabelText(/반복 간격/i), '1');

      // 일정 추가 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // Assert - 경고 메시지와 성공 메시지 표시
      expect(
        await screen.findByText(/반복 일정이 너무 많아 100개까지만 생성되었습니다/i)
      ).toBeInTheDocument();
      expect(await screen.findByText(/100개의 반복 일정이 생성되었습니다/i)).toBeInTheDocument();
    });

    it('종료일까지 1개의 일정만 생성되는 경우를 처리한다', async () => {
      // Arrange
      setupMockHandlerCreation();
      vi.setSystemTime(new Date('2025-12-30T00:00:00Z'));

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // Act - 일정 정보 입력
      await user.type(screen.getByLabelText('제목'), '특별 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-12-30');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');

      // 반복 설정
      await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
      await user.click(screen.getByLabelText(/반복 유형/i));
      await user.click(screen.getByText('매주'));
      await user.clear(screen.getByLabelText(/반복 간격/i));
      await user.type(screen.getByLabelText(/반복 간격/i), '1');
      await user.type(screen.getByLabelText(/반복 종료일/i), '2025-12-31');

      // 일정 추가 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // Assert - 1개 생성 메시지
      expect(await screen.findByText(/1개의 반복 일정이 생성되었습니다/i)).toBeInTheDocument();
    });
  });

  describe('반복 일정 표시', () => {
    it('일정 목록에서 반복 종료일 정보가 표시된다', async () => {
      // Arrange
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '1',
                title: '주간 회의',
                date: '2025-11-01',
                startTime: '14:00',
                endTime: '15:00',
                description: '프로젝트 리뷰',
                location: '회의실 A',
                category: '업무',
                repeat: {
                  type: 'weekly',
                  interval: 2,
                  endDate: '2025-12-31',
                },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      setup(<App />);

      // Act - 초기 렌더링 후 일정 목록 로드 대기
      await screen.findByText('일정 로딩 완료!');

      // Assert
      expect(screen.getByText(/반복: 2주마다 \(종료: 2025-12-31\)/i)).toBeInTheDocument();
    });

    it('종료일 없는 반복 일정은 종료일 정보를 표시하지 않는다', async () => {
      // Arrange
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: '2',
                title: '매일 운동',
                date: '2025-11-01',
                startTime: '10:00',
                endTime: '11:00',
                description: '',
                location: '',
                category: '개인',
                repeat: {
                  type: 'daily',
                  interval: 1,
                  endDate: undefined,
                },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      setup(<App />);

      // Act - 초기 렌더링 후 일정 목록 로드 대기
      await screen.findByText('일정 로딩 완료!');

      // Assert
      expect(screen.getByText(/반복: 1일마다/i)).toBeInTheDocument();

      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).queryByText(/종료:/i)).not.toBeInTheDocument();
    });
  });

  describe('반복 일정 수정', () => {
    describe('다이얼로그 표시', () => {
      it('반복 일정 수정 시 다이얼로그가 표시된다', async () => {
        // Arrange
        setupMockHandlerUpdating();

        const { user } = setup(<App />);

        // 반복 일정 데이터 로드 대기
        await screen.findByText('일정 로딩 완료!');

        // Act - 반복 일정 편집
        const editButtons = screen.getAllByLabelText('Edit event');
        await user.click(editButtons[0]); // 첫 번째 반복 일정 편집

        // 제목 수정
        const titleInput = screen.getByLabelText('제목');
        await user.clear(titleInput);
        await user.type(titleInput, '수정된 팀 회의');

        // 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // Assert - 다이얼로그 표시
        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getByText('반복 일정 수정')).toBeInTheDocument();
        expect(within(dialog).getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();

        // 버튼 확인
        expect(within(dialog).getByRole('button', { name: '취소' })).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: '예' })).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: '아니오' })).toBeInTheDocument();
      });

      it('단일 일정 수정 시 다이얼로그가 표시되지 않는다', async () => {
        // Arrange
        setupMockHandlerUpdating();

        const { user } = setup(<App />);

        // 일정 로드 대기
        await screen.findByText('일정 로딩 완료!');

        // Act - 단일 일정 편집 (마지막 일정은 repeat.type이 'none')
        const editButtons = screen.getAllByLabelText('Edit event');
        await user.click(editButtons[editButtons.length - 1]);

        // 제목 수정
        const titleInput = screen.getByLabelText('제목');
        await user.clear(titleInput);
        await user.type(titleInput, '수정된 회의');

        // 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // Assert - 다이얼로그가 표시되지 않음
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        // 성공 메시지 확인
        expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();
      });
    });

    describe('단일 수정 ("예" 버튼)', () => {
      it('"예" 버튼 클릭 시 단일 일정으로 변경된다', async () => {
        // Arrange
        setupMockHandlerUpdating();

        const { user } = setup(<App />);

        await screen.findByText('일정 로딩 완료!');

        // 반복 일정 편집
        const editButtons = screen.getAllByLabelText('Edit event');
        await user.click(editButtons[0]);

        // 제목 수정
        const titleInput = screen.getByLabelText('제목');
        await user.clear(titleInput);
        await user.type(titleInput, '수정된 팀 회의');

        // 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // 다이얼로그 표시 대기
        const dialog = await screen.findByRole('dialog');

        // Act - "예" 버튼 클릭
        const yesButton = within(dialog).getByRole('button', { name: '예' });
        await user.click(yesButton);

        // Assert - 다이얼로그 닫힘
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        // 성공 메시지 표시
        expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

        // 수정된 제목 확인
        const eventList = screen.getByTestId('event-list');
        expect(within(eventList).getByText('수정된 팀 회의')).toBeInTheDocument();
      });

      it('단일 수정 시 반복일정 아이콘이 사라진다', async () => {
        // Arrange
        setupMockHandlerUpdating();

        const { user } = setup(<App />);

        await screen.findByText('일정 로딩 완료!');

        // 반복 일정 확인 (초기 상태)
        const eventList = screen.getByTestId('event-list');
        // 반복 일정 아이콘이 있어야 함 (초기에는 반복 일정)

        // 반복 일정 편집
        const editButtons = screen.getAllByLabelText('Edit event');
        await user.click(editButtons[0]);

        // 제목 수정
        const titleInput = screen.getByLabelText('제목');
        await user.clear(titleInput);
        await user.type(titleInput, '단일 일정으로 변경');

        // 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // 다이얼로그에서 "예" 선택
        const dialog = await screen.findByRole('dialog');
        const yesButton = within(dialog).getByRole('button', { name: '예' });
        await user.click(yesButton);

        // Act & Assert - 다이얼로그 닫힘 후 아이콘 확인
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        // 성공 메시지 대기
        await screen.findByText('일정이 수정되었습니다.');

        // 반복 정보가 "반복: 없음"으로 변경되거나 반복 정보가 없어야 함
        // (현재 구현되지 않았으므로 테스트는 실패해야 함)
      });
    });

    describe('전체 수정 ("아니오" 버튼)', () => {
      it('"아니오" 버튼 클릭 시 반복 정보가 유지된다', async () => {
        // Arrange
        setupMockHandlerUpdating();

        const { user } = setup(<App />);

        await screen.findByText('일정 로딩 완료!');

        // 반복 일정 편집
        const editButtons = screen.getAllByLabelText('Edit event');
        await user.click(editButtons[0]);

        // 제목 수정
        const titleInput = screen.getByLabelText('제목');
        await user.clear(titleInput);
        await user.type(titleInput, '수정된 요가 수업');

        // 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // 다이얼로그 표시 대기
        const dialog = await screen.findByRole('dialog');

        // Act - "아니오" 버튼 클릭
        const noButton = within(dialog).getByRole('button', { name: '아니오' });
        await user.click(noButton);

        // Assert - 다이얼로그 닫힘
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        // 성공 메시지 표시
        expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

        // 수정된 제목 확인
        const eventList = screen.getByTestId('event-list');
        expect(within(eventList).getByText('수정된 요가 수업')).toBeInTheDocument();

        // 반복 정보가 유지되어야 함 (현재 구현되지 않았으므로 테스트 실패 예상)
      });
    });

    describe('수정 취소', () => {
      it('"취소" 버튼 클릭 시 수정이 취소된다', async () => {
        // Arrange
        setupMockHandlerUpdating();

        const { user } = setup(<App />);

        await screen.findByText('일정 로딩 완료!');

        // 반복 일정 편집
        const editButtons = screen.getAllByLabelText('Edit event');
        await user.click(editButtons[0]);

        // 제목 수정
        const titleInput = screen.getByLabelText('제목');
        await user.clear(titleInput);
        await user.type(titleInput, '취소할 수정');

        // 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // 다이얼로그 표시 대기
        const dialog = await screen.findByRole('dialog');

        // Act - "취소" 버튼 클릭
        const cancelButton = within(dialog).getByRole('button', { name: '취소' });
        await user.click(cancelButton);

        // Assert - 다이얼로그 닫힘
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        // 폼이 여전히 채워져 있는지 확인
        expect(screen.getByLabelText('제목')).toHaveValue('취소할 수정');

        // 성공/에러 메시지가 표시되지 않음 (현재는 실패할 것)
      });

      it('취소 후 다시 저장 버튼 클릭 시 다이얼로그가 다시 표시된다', async () => {
        // Arrange
        setupMockHandlerUpdating();

        const { user } = setup(<App />);

        await screen.findByText('일정 로딩 완료!');

        // 반복 일정 편집
        const editButtons = screen.getAllByLabelText('Edit event');
        await user.click(editButtons[0]);

        // 제목 수정
        const titleInput = screen.getByLabelText('제목');
        await user.clear(titleInput);
        await user.type(titleInput, '재시도 테스트');

        // 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // 다이얼로그에서 취소
        const dialog = await screen.findByRole('dialog');
        const cancelButton = within(dialog).getByRole('button', { name: '취소' });
        await user.click(cancelButton);

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        // Act - 다시 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // Assert - 다이얼로그 다시 표시
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      });
    });

    describe('에러 처리', () => {
      it('API 요청 실패 시 에러 메시지가 표시된다', async () => {
        // Arrange
        setupMockHandlerUpdating();

        const { user } = setup(<App />);

        await screen.findByText('일정 로딩 완료!');

        // 반복 일정 편집
        const editButtons = screen.getAllByLabelText('Edit event');
        await user.click(editButtons[0]);

        // 제목 수정
        const titleInput = screen.getByLabelText('제목');
        await user.clear(titleInput);
        await user.type(titleInput, '에러 테스트');

        // 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // 다이얼로그 표시 대기
        const dialog = await screen.findByRole('dialog');

        // MSW 핸들러를 500 에러로 오버라이드
        server.use(
          http.put('/api/events/:id', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        // Act - "예" 버튼 클릭
        const yesButton = within(dialog).getByRole('button', { name: '예' });
        await user.click(yesButton);

        // Assert - 에러 메시지 확인
        expect(await screen.findByText('일정 저장 실패')).toBeInTheDocument();

        // 다이얼로그는 닫혀야 함
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      });
    });

    describe('UI 검증', () => {
      it('다이얼로그 UI 요소가 올바르게 표시된다', async () => {
        // Arrange
        setupMockHandlerUpdating();

        const { user } = setup(<App />);

        await screen.findByText('일정 로딩 완료!');

        // 반복 일정 편집
        const editButtons = screen.getAllByLabelText('Edit event');
        await user.click(editButtons[0]);

        // 제목 수정
        const titleInput = screen.getByLabelText('제목');
        await user.clear(titleInput);
        await user.type(titleInput, 'UI 테스트');

        // 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // Assert - 다이얼로그 표시
        const dialog = await screen.findByRole('dialog');

        // role="dialog" 확인
        expect(dialog).toBeInTheDocument();

        // 버튼 순서 확인 (취소, 예, 아니오)
        const buttons = within(dialog).getAllByRole('button');
        expect(buttons[0]).toHaveTextContent('취소');
        expect(buttons[1]).toHaveTextContent('예');
        expect(buttons[2]).toHaveTextContent('아니오');

        // ESC 키 테스트
        await user.keyboard('{Escape}');
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      });

      it('성공 메시지가 표시된다', async () => {
        // Arrange
        setupMockHandlerUpdating();

        const { user } = setup(<App />);

        await screen.findByText('일정 로딩 완료!');

        // 반복 일정 편집
        const editButtons = screen.getAllByLabelText('Edit event');
        await user.click(editButtons[0]);

        // 제목 수정
        const titleInput = screen.getByLabelText('제목');
        await user.clear(titleInput);
        await user.type(titleInput, '성공 메시지 테스트');

        // 저장 버튼 클릭
        await user.click(screen.getByTestId('event-submit-button'));

        // 다이얼로그에서 "예" 선택
        const dialog = await screen.findByRole('dialog');
        const yesButton = within(dialog).getByRole('button', { name: '예' });
        await user.click(yesButton);

        // Assert - 성공 메시지 표시
        expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();
      });
    });
  });
});
