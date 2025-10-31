import { describe, expect, it } from 'vitest';

import type { RepeatType } from '../../types';
import { getRepeatIconLabel } from '../../utils/repeatEventDisplay';

describe('getRepeatIconLabel', () => {
  describe('기본 반복 유형 (interval=1)', () => {
    it('매일 반복: daily, interval=1 → "매일 반복"', () => {
      // Arrange
      const repeatType: RepeatType = 'daily';
      const interval = 1;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('매일 반복');
    });

    it('매주 반복: weekly, interval=1 → "매주 반복"', () => {
      // Arrange
      const repeatType: RepeatType = 'weekly';
      const interval = 1;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('매주 반복');
    });

    it('매월 반복: monthly, interval=1 → "매월 반복"', () => {
      // Arrange
      const repeatType: RepeatType = 'monthly';
      const interval = 1;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('매월 반복');
    });

    it('매년 반복: yearly, interval=1 → "매년 반복"', () => {
      // Arrange
      const repeatType: RepeatType = 'yearly';
      const interval = 1;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('매년 반복');
    });

    it('반복 없음: none, interval=1 → ""', () => {
      // Arrange
      const repeatType: RepeatType = 'none';
      const interval = 1;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('');
    });
  });

  describe('커스텀 interval (1보다 큰 경우)', () => {
    it('2일마다 반복: daily, interval=3 → "3일마다 반복"', () => {
      // Arrange
      const repeatType: RepeatType = 'daily';
      const interval = 3;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('3일마다 반복');
    });

    it('2주마다 반복: weekly, interval=2 → "2주마다 반복"', () => {
      // Arrange
      const repeatType: RepeatType = 'weekly';
      const interval = 2;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('2주마다 반복');
    });

    it('3개월마다 반복: monthly, interval=3 → "3개월마다 반복"', () => {
      // Arrange
      const repeatType: RepeatType = 'monthly';
      const interval = 3;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('3개월마다 반복');
    });

    it('2년마다 반복: yearly, interval=2 → "2년마다 반복"', () => {
      // Arrange
      const repeatType: RepeatType = 'yearly';
      const interval = 2;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('2년마다 반복');
    });
  });

  describe('엣지 케이스', () => {
    it('interval이 undefined인 경우 기본값 1로 처리', () => {
      // Arrange
      const repeatType: RepeatType = 'weekly';

      // Act
      const result = getRepeatIconLabel(repeatType);

      // Assert
      expect(result).toBe('매주 반복');
    });

    it('interval이 0인 경우 기본값 1로 처리', () => {
      // Arrange
      const repeatType: RepeatType = 'daily';
      const interval = 0;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('매일 반복');
    });

    it('interval이 음수인 경우 기본값 1로 처리', () => {
      // Arrange
      const repeatType: RepeatType = 'monthly';
      const interval = -2;

      // Act
      const result = getRepeatIconLabel(repeatType, interval);

      // Assert
      expect(result).toBe('매월 반복');
    });
  });
});
