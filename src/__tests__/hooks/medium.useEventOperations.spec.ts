import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([
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
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(); // ? Med: 이걸 왜 써야하는지 물어보자

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: Event = {
    id: '1',
    title: '새 회의',
    date: '2025-10-16',
    startTime: '11:00',
    endTime: '12:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toEqual([{ ...newEvent, id: '1' }]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const updatedEvent: Event = {
    id: '1',
    date: '2025-10-15',
    startTime: '09:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    title: '수정된 회의',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(result.current.events[0]).toEqual(updatedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });

  server.resetHandlers();
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const nonExistentEvent: Event = {
    id: '999', // 존재하지 않는 ID
    title: '존재하지 않는 이벤트',
    date: '2025-07-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '이 이벤트는 존재하지 않습니다',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });

  expect(result.current.events).toHaveLength(1);
});

describe('반복 일정 기능', () => {
  it('반복 일정 저장 시 /api/events-list 엔드포인트를 호출한다', async () => {
    const eventsListSpy = vi.fn();

    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const body = await request.json();
        eventsListSpy(body);
        return HttpResponse.json({ success: true });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const repeatEvent: Event = {
      id: '1',
      title: '매일 회의',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '일일 스탠드업',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-03',
      },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(repeatEvent);
    });

    expect(eventsListSpy).toHaveBeenCalledTimes(1);
    const calledBody = eventsListSpy.mock.calls[0][0];
    expect(calledBody.events).toHaveLength(3);
    expect(calledBody.events[0].date).toBe('2025-01-01');
    expect(calledBody.events[1].date).toBe('2025-01-02');
    expect(calledBody.events[2].date).toBe('2025-01-03');

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('3개의 반복 일정이 생성되었습니다', {
      variant: 'success',
    });

    server.resetHandlers();
  });

  it('일반 일정(type=none) 저장 시 기존 /api/events 엔드포인트를 호출한다', async () => {
    const eventsSpy = vi.fn();
    const eventsListSpy = vi.fn();

    server.use(
      http.post('/api/events', async ({ request }) => {
        const body = await request.json();
        eventsSpy(body);
        return HttpResponse.json({ success: true, event: { ...(body as Event), id: '2' } });
      }),
      http.post('/api/events-list', async () => {
        eventsListSpy();
        return HttpResponse.json({ success: true });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const normalEvent: Event = {
      id: '2',
      title: '일반 회의',
      date: '2025-01-10',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(normalEvent);
    });

    expect(eventsSpy).toHaveBeenCalledTimes(1);
    expect(eventsListSpy).not.toHaveBeenCalled();

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다', {
      variant: 'success',
    });

    server.resetHandlers();
  });

  it('반복 일정 수정 시 개별 이벤트만 수정한다 (PUT /api/events/:id)', async () => {
    const updateSpy = vi.fn();

    server.use(
      http.put('/api/events/:id', async ({ request, params }) => {
        const body = await request.json();
        updateSpy({ id: params.id, body });
        return HttpResponse.json({ success: true, event: { ...(body as Event), id: params.id } });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(() => Promise.resolve(null));

    const updatedRepeatEvent: Event = {
      id: '1',
      title: '수정된 반복 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '12:00',
      description: '시간 연장',
      location: '회의실 B',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-11-15',
      },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(updatedRepeatEvent);
    });

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy.mock.calls[0][0].id).toBe('1');

    server.resetHandlers();
  });

  it('반복 일정 생성 실패 시 에러 메시지를 표시한다', async () => {
    server.use(
      http.post('/api/events-list', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const initialEventsLength = result.current.events.length;

    const repeatEvent: Event = {
      id: '99',
      title: '실패할 반복 일정',
      date: '2025-02-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-02-05',
      },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(repeatEvent);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      '반복 일정 생성에 실패했습니다. 다시 시도해주세요.',
      { variant: 'error' }
    );

    expect(result.current.events).toHaveLength(initialEventsLength);

    server.resetHandlers();
  });

  it('반복 일정이 100개 초과 시 100개만 생성하고 경고를 표시한다', async () => {
    const eventsListSpy = vi.fn();

    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const body = await request.json();
        eventsListSpy(body);
        return HttpResponse.json({ success: true });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const repeatEvent: Event = {
      id: '100',
      title: '매일 반복 (365일)',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2026-01-01', // 365일
      },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(repeatEvent);
    });

    expect(eventsListSpy).toHaveBeenCalledTimes(1);
    const calledBody = eventsListSpy.mock.calls[0][0];
    expect(calledBody.events).toHaveLength(100);

    expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      '반복 일정이 너무 많아 100개까지만 생성되었습니다',
      { variant: 'warning' }
    );

    server.resetHandlers();
  });
});
