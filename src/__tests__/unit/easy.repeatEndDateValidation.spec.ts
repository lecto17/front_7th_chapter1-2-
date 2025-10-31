import { describe, expect, it } from 'vitest';

import { validateRepeatEndDate } from '../../utils/repeatEndDateValidation';

describe('validateRepeatEndDate >', () => {
  describe('유효한 경우 >', () => {
    it('종료일이 시작일보다 이후인 경우 null을 반환한다', () => {
      // Arrange
      const startDate = '2025-11-01';
      const endDate = '2025-12-31';
      const maxDate = '2025-12-31';

      // Act
      const result = validateRepeatEndDate(startDate, endDate, maxDate);

      // Assert
      expect(result).toBeNull();
    });

    it('종료일이 비어있는 경우 null을 반환한다 (무제한 반복)', () => {
      // Arrange
      const startDate = '2025-11-01';
      const endDate = '';
      const maxDate = '2025-12-31';

      // Act
      const result = validateRepeatEndDate(startDate, endDate, maxDate);

      // Assert
      expect(result).toBeNull();
    });

    it('종료일이 최대 날짜와 같은 경우 null을 반환한다', () => {
      // Arrange
      const startDate = '2025-11-01';
      const endDate = '2025-12-31';
      const maxDate = '2025-12-31';

      // Act
      const result = validateRepeatEndDate(startDate, endDate, maxDate);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('에러 케이스 >', () => {
    it('종료일이 시작일보다 이전인 경우 에러 메시지를 반환한다', () => {
      // Arrange
      const startDate = '2025-11-10';
      const endDate = '2025-11-05';
      const maxDate = '2025-12-31';

      // Act
      const result = validateRepeatEndDate(startDate, endDate, maxDate);

      // Assert
      expect(result).toBe('종료일은 시작일 이후여야 합니다');
    });

    it('종료일이 시작일과 같은 경우 에러 메시지를 반환한다', () => {
      // Arrange
      const startDate = '2025-11-10';
      const endDate = '2025-11-10';
      const maxDate = '2025-12-31';

      // Act
      const result = validateRepeatEndDate(startDate, endDate, maxDate);

      // Assert
      expect(result).toBe('종료일은 시작일 이후여야 합니다');
    });

    it('종료일이 최대 날짜보다 이후인 경우 에러 메시지를 반환한다', () => {
      // Arrange
      const startDate = '2025-11-01';
      const endDate = '2026-01-01';
      const maxDate = '2025-12-31';

      // Act
      const result = validateRepeatEndDate(startDate, endDate, maxDate);

      // Assert
      expect(result).toBe('종료일은 2025-12-31 이전이어야 합니다');
    });
  });
});

