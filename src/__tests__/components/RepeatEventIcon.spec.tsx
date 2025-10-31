import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { RepeatType } from '../../types';
import { RepeatEventIcon } from '../../components/RepeatEventIcon';

describe('RepeatEventIcon', () => {
  describe('반복 유형별 아이콘 렌더링 (Critical)', () => {
    it('매일 반복 일정: 아이콘 표시 및 aria-label 확인', () => {
      // Arrange
      const repeatType: RepeatType = 'daily';
      const interval = 1;

      // Act
      render(<RepeatEventIcon repeatType={repeatType} interval={interval} />);

      // Assert
      const icon = screen.getByRole('img', { name: /반복 일정: 매일/i });
      expect(icon).toBeInTheDocument();
    });

    it('매주 반복 일정: 아이콘 표시 및 aria-label 확인', () => {
      // Arrange
      const repeatType: RepeatType = 'weekly';
      const interval = 1;

      // Act
      render(<RepeatEventIcon repeatType={repeatType} interval={interval} />);

      // Assert
      const icon = screen.getByRole('img', { name: /반복 일정: 매주/i });
      expect(icon).toBeInTheDocument();
    });

    it('매월 반복 일정: 아이콘 표시 및 aria-label 확인', () => {
      // Arrange
      const repeatType: RepeatType = 'monthly';
      const interval = 1;

      // Act
      render(<RepeatEventIcon repeatType={repeatType} interval={interval} />);

      // Assert
      const icon = screen.getByRole('img', { name: /반복 일정: 매월/i });
      expect(icon).toBeInTheDocument();
    });

    it('매년 반복 일정: 아이콘 표시 및 aria-label 확인', () => {
      // Arrange
      const repeatType: RepeatType = 'yearly';
      const interval = 1;

      // Act
      render(<RepeatEventIcon repeatType={repeatType} interval={interval} />);

      // Assert
      const icon = screen.getByRole('img', { name: /반복 일정: 매년/i });
      expect(icon).toBeInTheDocument();
    });

    it('일반 일정(none): 아이콘이 렌더링되지 않음 (null 반환)', () => {
      // Arrange
      const repeatType: RepeatType = 'none';

      // Act
      const { container } = render(<RepeatEventIcon repeatType={repeatType} interval={1} />);

      // Assert
      expect(container.firstChild).toBeNull();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('툴팁 표시 및 상호작용 (Important)', () => {
    it('매주 반복: hover 시 "매주 반복" 툴팁 표시', async () => {
      // Arrange
      const user = userEvent.setup();
      const repeatType: RepeatType = 'weekly';
      const interval = 1;
      render(<RepeatEventIcon repeatType={repeatType} interval={interval} />);

      // Act
      const icon = screen.getByRole('img', { name: /반복 일정: 매주/i });
      await user.hover(icon);

      // Assert
      const tooltip = await screen.findByText('매주 반복');
      expect(tooltip).toBeInTheDocument();
    });

    it('2주마다 반복: hover 시 "2주마다 반복" 툴팁 표시', async () => {
      // Arrange
      const user = userEvent.setup();
      const repeatType: RepeatType = 'weekly';
      const interval = 2;
      render(<RepeatEventIcon repeatType={repeatType} interval={interval} />);

      // Act
      const icon = screen.getByRole('img', { name: /반복 일정: 2주마다/i });
      await user.hover(icon);

      // Assert
      const tooltip = await screen.findByText('2주마다 반복');
      expect(tooltip).toBeInTheDocument();
    });

    it('3일마다 반복: hover 시 "3일마다 반복" 툴팁 표시', async () => {
      // Arrange
      const user = userEvent.setup();
      const repeatType: RepeatType = 'daily';
      const interval = 3;
      render(<RepeatEventIcon repeatType={repeatType} interval={interval} />);

      // Act
      const icon = screen.getByRole('img', { name: /반복 일정: 3일마다/i });
      await user.hover(icon);

      // Assert
      const tooltip = await screen.findByText('3일마다 반복');
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('접근성 속성 검증', () => {
    it('role="img" 속성이 존재', () => {
      // Arrange & Act
      render(<RepeatEventIcon repeatType="daily" interval={1} />);

      // Assert
      const icon = screen.getByRole('img');
      expect(icon).toBeInTheDocument();
    });

    it('aria-label에 반복 정보가 포함됨', () => {
      // Arrange & Act
      render(<RepeatEventIcon repeatType="monthly" interval={1} />);

      // Assert
      const icon = screen.getByRole('img', { name: /반복 일정/i });
      expect(icon).toHaveAttribute('aria-label');
    });
  });

  describe('엣지 케이스', () => {
    it('interval이 undefined인 경우 기본값 1로 처리', () => {
      // Arrange & Act
      render(<RepeatEventIcon repeatType="weekly" />);

      // Assert
      const icon = screen.getByRole('img', { name: /반복 일정: 매주/i });
      expect(icon).toBeInTheDocument();
    });

    it('size prop이 medium인 경우 정상 렌더링', () => {
      // Arrange & Act
      render(<RepeatEventIcon repeatType="daily" interval={1} size="medium" />);

      // Assert
      const icon = screen.getByRole('img', { name: /반복 일정: 매일/i });
      expect(icon).toBeInTheDocument();
    });

    it('size prop이 large인 경우 정상 렌더링', () => {
      // Arrange & Act
      render(<RepeatEventIcon repeatType="yearly" interval={1} size="large" />);

      // Assert
      const icon = screen.getByRole('img', { name: /반복 일정: 매년/i });
      expect(icon).toBeInTheDocument();
    });
  });
});
