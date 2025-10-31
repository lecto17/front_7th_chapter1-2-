import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRepeatEvents } from '../utils/repeatEventUtils';

const MAX_REPEAT_WARNING_COUNT = 100;

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  const handleSuccess = async (message: string) => {
    await fetchEvents();
    onSave?.();
    enqueueSnackbar(message, { variant: 'success' });
  };

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

  const createRepeatEvents = async (eventData: EventForm) => {
    const repeatEvents = generateRepeatEvents(eventData);

    if (repeatEvents.length >= MAX_REPEAT_WARNING_COUNT) {
      enqueueSnackbar('반복 일정이 너무 많아 100개까지만 생성되었습니다', {
        variant: 'warning',
      });
    }

    const response = await fetch('/api/events-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: repeatEvents }),
    });

    if (!response.ok) {
      throw new Error('Failed to save repeat events');
    }

    await handleSuccess(`${repeatEvents.length}개의 반복 일정이 생성되었습니다`);
  };

  const createSingleEvent = async (eventData: EventForm) => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error('Failed to save event');
    }

    await handleSuccess('일정이 추가되었습니다');
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      if (editing) {
        await updateEvent(eventData as Event);
        return;
      }

      const isRepeatEvent = eventData.repeat.type !== 'none';
      if (isRepeatEvent) {
        await createRepeatEvents(eventData as EventForm);
      } else {
        await createSingleEvent(eventData as EventForm);
      }
    } catch (error) {
      console.error('Error saving event:', error);

      const isRepeatError =
        !editing &&
        eventData.repeat.type !== 'none' &&
        error instanceof Error &&
        error.message.includes('repeat');

      enqueueSnackbar(
        isRepeatError ? '반복 일정 생성에 실패했습니다. 다시 시도해주세요.' : '일정 저장 실패',
        { variant: 'error' }
      );
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
