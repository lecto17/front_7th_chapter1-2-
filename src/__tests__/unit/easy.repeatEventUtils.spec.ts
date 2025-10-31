import { describe, expect, it } from 'vitest';

import type { EventForm } from '../../types';
import {
  generateRepeatEvents,
  getNextOccurrenceDate,
  isValidRepeatDate,
} from '../../../src/utils/repeatEventUtils';

describe('generateRepeatEvents', () => {
  describe('매일 반복', () => {
    it('기본 동작: 간격 1일, 5일간 반복', () => {
      const baseEvent: EventForm = {
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
          endDate: '2025-01-05',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[1].date).toBe('2025-01-02');
      expect(result[2].date).toBe('2025-01-03');
      expect(result[3].date).toBe('2025-01-04');
      expect(result[4].date).toBe('2025-01-05');

      result.forEach((event) => {
        expect(event.title).toBe('매일 회의');
        expect(event.startTime).toBe('10:00');
        expect(event.endTime).toBe('11:00');
        expect(event.repeat.type).toBe('daily');
      });
    });

    it('간격 2일로 반복', () => {
      const baseEvent: EventForm = {
        title: '격일 회의',
        date: '2025-01-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 2,
          endDate: '2025-01-10',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[1].date).toBe('2025-01-03');
      expect(result[2].date).toBe('2025-01-05');
      expect(result[3].date).toBe('2025-01-07');
      expect(result[4].date).toBe('2025-01-09');
    });
  });

  describe('매주 반복', () => {
    it('기본 동작: 간격 1주, 월요일마다 반복', () => {
      const baseEvent: EventForm = {
        title: '주간 회의',
        date: '2025-01-06', // 월요일
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-02-03',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-01-06');
      expect(result[1].date).toBe('2025-01-13');
      expect(result[2].date).toBe('2025-01-20');
      expect(result[3].date).toBe('2025-01-27');
      expect(result[4].date).toBe('2025-02-03');

      // 모두 월요일인지 확인
      result.forEach((event) => {
        const date = new Date(event.date);
        expect(date.getDay()).toBe(1); // 1 = 월요일
      });
    });

    it('간격 2주로 반복', () => {
      const baseEvent: EventForm = {
        title: '격주 회의',
        date: '2025-01-06', // 월요일
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 2,
          endDate: '2025-02-17',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(4);
      expect(result[0].date).toBe('2025-01-06');
      expect(result[1].date).toBe('2025-01-20');
      expect(result[2].date).toBe('2025-02-03');
      expect(result[3].date).toBe('2025-02-17');
    });
  });

  describe('매월 반복', () => {
    it('기본 동작: 간격 1개월, 15일마다 반복', () => {
      const baseEvent: EventForm = {
        title: '월간 회의',
        date: '2025-01-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-05-15',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-01-15');
      expect(result[1].date).toBe('2025-02-15');
      expect(result[2].date).toBe('2025-03-15');
      expect(result[3].date).toBe('2025-04-15');
      expect(result[4].date).toBe('2025-05-15');
    });

    it('31일 특수 케이스: 31일이 없는 달은 건너뜀', () => {
      const baseEvent: EventForm = {
        title: '월말 정산',
        date: '2025-01-31',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(7);
      expect(result[0].date).toBe('2025-01-31');
      expect(result[1].date).toBe('2025-03-31'); // 2월 건너뜀
      expect(result[2].date).toBe('2025-05-31'); // 4월 건너뜀
      expect(result[3].date).toBe('2025-07-31'); // 6월 건너뜀
      expect(result[4].date).toBe('2025-08-31');
      expect(result[5].date).toBe('2025-10-31'); // 9월 건너뜀
      expect(result[6].date).toBe('2025-12-31'); // 11월 건너뜀
    });

    it('30일 날짜: 2월만 건너뜀', () => {
      const baseEvent: EventForm = {
        title: '30일 일정',
        date: '2025-01-30',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-30',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(11); // 2월 제외 11개월
      expect(result[0].date).toBe('2025-01-30');
      expect(result[1].date).toBe('2025-03-30'); // 2월 건너뜀
      expect(result[2].date).toBe('2025-04-30');
      expect(result[10].date).toBe('2025-12-30');
    });

    it('간격 2개월로 반복', () => {
      const baseEvent: EventForm = {
        title: '격월 회의',
        date: '2025-01-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 2,
          endDate: '2025-09-15',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-01-15');
      expect(result[1].date).toBe('2025-03-15');
      expect(result[2].date).toBe('2025-05-15');
      expect(result[3].date).toBe('2025-07-15');
      expect(result[4].date).toBe('2025-09-15');
    });
  });

  describe('매년 반복', () => {
    it('기본 동작: 간격 1년, 같은 날짜 반복', () => {
      const baseEvent: EventForm = {
        title: '연간 행사',
        date: '2025-03-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2029-03-15',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-03-15');
      expect(result[1].date).toBe('2026-03-15');
      expect(result[2].date).toBe('2027-03-15');
      expect(result[3].date).toBe('2028-03-15');
      expect(result[4].date).toBe('2029-03-15');
    });

    it('2월 29일 윤년 케이스: 윤년에만 생성', () => {
      const baseEvent: EventForm = {
        title: '윤년 기념일',
        date: '2024-02-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2032-02-29',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2024-02-29');
      expect(result[1].date).toBe('2028-02-29'); // 2025, 2026, 2027 건너뜀
      expect(result[2].date).toBe('2032-02-29'); // 2029, 2030, 2031 건너뜀
    });

    it('간격 2년으로 반복', () => {
      const baseEvent: EventForm = {
        title: '격년 행사',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'yearly',
          interval: 2,
          endDate: '2033-06-15',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-06-15');
      expect(result[1].date).toBe('2027-06-15');
      expect(result[2].date).toBe('2029-06-15');
      expect(result[3].date).toBe('2031-06-15');
      expect(result[4].date).toBe('2033-06-15');
    });
  });

  describe('제한 조건', () => {
    it('종료일이 없는 경우: 최대 100개로 제한', () => {
      const baseEvent: EventForm = {
        title: '무기한 반복',
        date: '2025-01-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: undefined,
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result.length).toBeLessThanOrEqual(100);
      expect(result.length).toBeGreaterThan(0);
    });

    it('최대 이벤트 개수 제한 (100개)', () => {
      const baseEvent: EventForm = {
        title: '매일 반복',
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

      const result = generateRepeatEvents(baseEvent, 100);

      expect(result).toHaveLength(100);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[99].date).toBe('2025-04-10');
    });

    it('종료일이 기준일과 동일한 경우: 1개만 생성', () => {
      const baseEvent: EventForm = {
        title: '단일 일정',
        date: '2025-01-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-01',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-01-01');
    });

    it('종료일이 기준일보다 이전인 경우: 1개 또는 빈 배열', () => {
      const baseEvent: EventForm = {
        title: '잘못된 종료일',
        date: '2025-01-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
        notificationTime: 10,
      };

      const result = generateRepeatEvents(baseEvent);

      expect(result.length).toBeLessThanOrEqual(1);
    });
  });
});

describe('getNextOccurrenceDate', () => {
  it('매일 반복: 다음 날짜 계산', () => {
    const currentDate = new Date('2025-01-01');
    const baseDate = new Date('2025-01-01');

    const result = getNextOccurrenceDate(currentDate, baseDate, 'daily', 1);

    expect(result).not.toBeNull();
    expect(result?.toISOString().split('T')[0]).toBe('2025-01-02');
  });

  it('매주 반복: 다음 같은 요일 계산', () => {
    const currentDate = new Date('2025-01-06'); // 월요일
    const baseDate = new Date('2025-01-06');

    const result = getNextOccurrenceDate(currentDate, baseDate, 'weekly', 1);

    expect(result).not.toBeNull();
    expect(result?.toISOString().split('T')[0]).toBe('2025-01-13'); // 다음 월요일
  });

  it('매월 반복: 다음 같은 날짜 계산 (일반)', () => {
    const currentDate = new Date('2025-01-15');
    const baseDate = new Date('2025-01-15');

    const result = getNextOccurrenceDate(currentDate, baseDate, 'monthly', 1);

    expect(result).not.toBeNull();
    expect(result?.toISOString().split('T')[0]).toBe('2025-02-15');
  });

  it('매월 반복: 31일 다음 발생 계산 (2월 건너뛰기)', () => {
    const currentDate = new Date('2025-01-31');
    const baseDate = new Date('2025-01-31');

    const result = getNextOccurrenceDate(currentDate, baseDate, 'monthly', 1);

    expect(result).not.toBeNull();
    expect(result?.toISOString().split('T')[0]).toBe('2025-03-31');
  });

  it('매년 반복: 다음 같은 날짜 계산', () => {
    const currentDate = new Date('2025-03-15');
    const baseDate = new Date('2025-03-15');

    const result = getNextOccurrenceDate(currentDate, baseDate, 'yearly', 1);

    expect(result).not.toBeNull();
    expect(result?.toISOString().split('T')[0]).toBe('2026-03-15');
  });

  it('매년 반복: 2월 29일 다음 발생 (윤년 건너뛰기)', () => {
    const currentDate = new Date('2024-02-29'); // 윤년
    const baseDate = new Date('2024-02-29');

    const result = getNextOccurrenceDate(currentDate, baseDate, 'yearly', 1);

    expect(result).not.toBeNull();
    expect(result?.toISOString().split('T')[0]).toBe('2028-02-29'); // 다음 윤년
  });
});

describe('isValidRepeatDate', () => {
  it('매월 반복: 31일이 유효한 달 (1월)', () => {
    const date = new Date('2025-01-31');
    const baseDate = new Date('2025-01-31');

    const result = isValidRepeatDate(date, baseDate, 'monthly');

    expect(result).toBe(true);
  });

  it('매월 반복: 31일이 유효하지 않은 달 (2월)', () => {
    const date = new Date(2025, 1, 31); // JavaScript가 자동으로 3월 3일로 조정
    const baseDate = new Date('2025-01-31');

    const result = isValidRepeatDate(date, baseDate, 'monthly');

    expect(result).toBe(false);
  });

  it('매년 반복: 윤년 2월 29일 유효', () => {
    const date = new Date('2024-02-29'); // 윤년
    const baseDate = new Date('2024-02-29');

    const result = isValidRepeatDate(date, baseDate, 'yearly');

    expect(result).toBe(true);
  });

  it('매년 반복: 평년 2월 29일 무효', () => {
    const date = new Date(2025, 1, 29); // JavaScript가 자동으로 3월 1일로 조정
    const baseDate = new Date('2024-02-29');

    const result = isValidRepeatDate(date, baseDate, 'yearly');

    expect(result).toBe(false);
  });

  it('매일/매주 반복: 항상 유효', () => {
    const date = new Date('2025-02-28');
    const baseDate = new Date('2025-01-01');

    const resultDaily = isValidRepeatDate(date, baseDate, 'daily');
    const resultWeekly = isValidRepeatDate(date, baseDate, 'weekly');

    expect(resultDaily).toBe(true);
    expect(resultWeekly).toBe(true);
  });
});
