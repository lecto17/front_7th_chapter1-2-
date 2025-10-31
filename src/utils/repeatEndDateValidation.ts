/**
 * 반복 종료일 유효성 검증
 *
 * @param startDate - 일정 시작일 (YYYY-MM-DD)
 * @param endDate - 반복 종료일 (YYYY-MM-DD)
 * @param maxDate - 최대 허용 날짜 (YYYY-MM-DD)
 * @returns 에러 메시지 또는 null (유효한 경우)
 */
export function validateRepeatEndDate(
  startDate: string,
  endDate: string,
  maxDate: string
): string | null {
  // 종료일이 비어있으면 유효 (무제한 반복)
  if (!endDate || endDate.trim() === '') {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const max = new Date(maxDate);

  // 종료일이 시작일보다 이전이거나 같은 경우
  if (end <= start) {
    return '종료일은 시작일 이후여야 합니다';
  }

  // 종료일이 최대 날짜보다 이후인 경우
  if (end > max) {
    return `종료일은 ${maxDate} 이전이어야 합니다`;
  }

  return null;
}

