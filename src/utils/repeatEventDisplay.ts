import type { RepeatType } from '../types';

/**
 * 반복 유형과 간격을 받아 한글 레이블을 생성합니다.
 *
 * @param repeatType - 반복 유형 ('none' | 'daily' | 'weekly' | 'monthly' | 'yearly')
 * @param interval - 반복 간격 (기본값: 1)
 * @returns 한글 레이블 문자열
 *
 * @example
 * getRepeatIconLabel('daily', 1) // "매일 반복"
 * getRepeatIconLabel('weekly', 2) // "2주마다 반복"
 * getRepeatIconLabel('none', 1) // ""
 */
export function getRepeatIconLabel(repeatType: RepeatType, interval: number = 1): string {
  // interval 값 검증 및 기본값 처리
  const validInterval = interval <= 0 ? 1 : interval;

  // 반복 없음
  if (repeatType === 'none') {
    return '';
  }

  // 단위 매핑
  const unitMap: Record<Exclude<RepeatType, 'none'>, string> = {
    daily: '일',
    weekly: '주',
    monthly: '개월',
    yearly: '년',
  };

  const unit = unitMap[repeatType];

  // interval이 1인 경우
  if (validInterval === 1) {
    const prefixMap: Record<Exclude<RepeatType, 'none'>, string> = {
      daily: '매일',
      weekly: '매주',
      monthly: '매월',
      yearly: '매년',
    };
    return `${prefixMap[repeatType]} 반복`;
  }

  // interval이 1보다 큰 경우
  return `${validInterval}${unit}마다 반복`;
}
