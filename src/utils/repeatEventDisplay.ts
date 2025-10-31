import type { RepeatType } from '../types';

/**
 * 반복 유형별 시간 단위 매핑
 */
const REPEAT_UNIT_MAP: Record<Exclude<RepeatType, 'none'>, string> = {
  daily: '일',
  weekly: '주',
  monthly: '개월',
  yearly: '년',
} as const;

/**
 * 반복 유형별 접두사 매핑 (interval=1일 때)
 */
const REPEAT_PREFIX_MAP: Record<Exclude<RepeatType, 'none'>, string> = {
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년',
} as const;

/**
 * 반복 유형과 간격을 받아 한글 레이블을 생성합니다.
 *
 * @param repeatType - 반복 유형 ('none' | 'daily' | 'weekly' | 'monthly' | 'yearly')
 * @param interval - 반복 간격 (기본값: 1)
 * @param endDate - 반복 종료일 (선택적)
 * @returns 한글 레이블 문자열
 *
 * @example
 * getRepeatIconLabel('daily', 1) // "매일 반복"
 * getRepeatIconLabel('weekly', 2) // "2주마다 반복"
 * getRepeatIconLabel('weekly', 2, '2025-12-31') // "2주마다 반복 (종료: 2025-12-31)"
 * getRepeatIconLabel('none', 1) // ""
 */
export function getRepeatIconLabel(
  repeatType: RepeatType,
  interval: number = 1,
  endDate?: string
): string {
  // 반복 없음
  if (repeatType === 'none') {
    return '';
  }

  // interval 값 검증 및 기본값 처리
  const validInterval = interval <= 0 ? 1 : interval;

  let label: string;

  // interval이 1인 경우: "매일 반복", "매주 반복" 등
  if (validInterval === 1) {
    label = `${REPEAT_PREFIX_MAP[repeatType]} 반복`;
  } else {
    // interval이 1보다 큰 경우: "2일마다 반복", "3주마다 반복" 등
    const unit = REPEAT_UNIT_MAP[repeatType];
    label = `${validInterval}${unit}마다 반복`;
  }

  // 종료일이 있으면 추가
  if (endDate) {
    label += ` (종료: ${endDate})`;
  }

  return label;
}
