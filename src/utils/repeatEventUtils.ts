import type { EventForm, RepeatType } from '../types';

const MAX_REPEAT_COUNT = 100;
const MAX_MONTH_ATTEMPTS = 12;
const MAX_YEAR_ATTEMPTS = 100;

/**
 * Date 객체의 시간을 00:00:00으로 정규화합니다.
 */
function normalizeDate(date: Date): void {
  date.setHours(0, 0, 0, 0);
}

/**
 * 날짜 문자열을 YYYY-MM-DD 형식으로 변환합니다.
 */
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 기준 이벤트를 기반으로 반복 이벤트 배열을 생성합니다.
 * @param baseEvent 기준 이벤트
 * @param maxCount 최대 생성 개수 (기본값: 100)
 * @returns 반복 이벤트 배열
 */
export function generateRepeatEvents(
  baseEvent: EventForm,
  maxCount: number = MAX_REPEAT_COUNT
): EventForm[] {
  if (baseEvent.repeat.type === 'none') {
    return [baseEvent];
  }

  const { repeat, date: baseDateStr } = baseEvent;
  const baseDate = new Date(baseDateStr);
  const endDate = repeat.endDate ? new Date(repeat.endDate) : null;

  normalizeDate(baseDate);
  if (endDate) {
    normalizeDate(endDate);
  }

  // 기준일이 종료일보다 이후인 경우
  if (endDate && baseDate > endDate) {
    return [];
  }

  const events: EventForm[] = [{ ...baseEvent, date: baseDateStr }];
  let currentDate = new Date(baseDate);
  let count = 1;

  while (count < maxCount) {
    const nextDate = getNextOccurrenceDate(currentDate, baseDate, repeat.type, repeat.interval);
    if (!nextDate) {
      break;
    }

    normalizeDate(nextDate);

    if (endDate && nextDate > endDate) {
      break;
    }

    if (isValidRepeatDate(nextDate, baseDate, repeat.type)) {
      events.push({ ...baseEvent, date: toDateString(nextDate) });
      count++;
    }

    currentDate = nextDate;
  }

  return events;
}

/**
 * 다음 반복 발생 날짜를 계산합니다.
 * @param currentDate 현재 날짜
 * @param baseDate 기준 날짜
 * @param repeatType 반복 유형
 * @param interval 반복 간격
 * @returns 다음 발생 날짜 또는 null
 */
export function getNextOccurrenceDate(
  currentDate: Date,
  baseDate: Date,
  repeatType: RepeatType,
  interval: number
): Date | null {
  if (repeatType === 'none') {
    return null;
  }

  const nextDate = new Date(currentDate);

  switch (repeatType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + interval * 7);
      break;

    case 'monthly':
      return getNextMonthlyDate(nextDate, baseDate, interval);

    case 'yearly':
      return getNextYearlyDate(nextDate, baseDate, interval);

    default:
      return null;
  }

  return nextDate;
}

/**
 * 매월 반복의 다음 발생 날짜를 계산합니다.
 */
function getNextMonthlyDate(currentDate: Date, baseDate: Date, interval: number): Date | null {
  const baseDay = baseDate.getDate();
  let month = currentDate.getMonth() + interval;
  let year = currentDate.getFullYear();

  // 월이 12를 넘어가면 년도 조정
  while (month > 11) {
    month -= 12;
    year += 1;
  }

  const nextDate = new Date(currentDate);
  let attempts = 0;

  while (attempts < MAX_MONTH_ATTEMPTS) {
    nextDate.setFullYear(year);
    nextDate.setMonth(month);
    nextDate.setDate(1);

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    if (baseDay <= daysInMonth) {
      nextDate.setDate(baseDay);
      return nextDate;
    }

    // 해당 월에 기준 날짜가 없으면 다음 달로
    month += interval;
    if (month > 11) {
      month -= 12;
      year += 1;
    }
    attempts++;
  }

  return null;
}

/**
 * 매년 반복의 다음 발생 날짜를 계산합니다.
 */
function getNextYearlyDate(currentDate: Date, baseDate: Date, interval: number): Date {
  const baseDay = baseDate.getDate();
  const baseMonth = baseDate.getMonth();
  let year = currentDate.getFullYear() + interval;

  // 윤년 2월 29일 특수 케이스
  if (baseMonth === 1 && baseDay === 29) {
    let attempts = 0;
    while (attempts < MAX_YEAR_ATTEMPTS) {
      if (isLeapYear(year)) {
        break;
      }
      year += interval;
      attempts++;
    }
  }

  const nextDate = new Date(currentDate);
  nextDate.setFullYear(year);
  nextDate.setMonth(baseMonth);
  nextDate.setDate(baseDay);
  return nextDate;
}

/**
 * 반복 날짜가 유효한지 검증합니다.
 * @param date 검증할 날짜
 * @param baseDate 기준 날짜
 * @param repeatType 반복 유형
 * @returns 유효 여부
 */
export function isValidRepeatDate(date: Date, baseDate: Date, repeatType: RepeatType): boolean {
  if (repeatType === 'daily' || repeatType === 'weekly' || repeatType === 'none') {
    return true;
  }

  const baseDay = baseDate.getDate();
  const currentDay = date.getDate();
  const currentMonth = date.getMonth();

  if (repeatType === 'monthly') {
    // 기준 날짜와 현재 날짜가 같아야 함
    return currentDay === baseDay;
  }

  if (repeatType === 'yearly') {
    const baseMonth = baseDate.getMonth();
    // 기준 월과 날짜가 모두 같아야 함
    return currentMonth === baseMonth && currentDay === baseDay;
  }

  return true;
}

/**
 * 윤년 여부를 확인합니다.
 * @param year 확인할 연도
 * @returns 윤년 여부
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
