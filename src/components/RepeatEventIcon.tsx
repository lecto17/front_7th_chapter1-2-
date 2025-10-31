import AutorenewIcon from '@mui/icons-material/Autorenew';
import CakeIcon from '@mui/icons-material/Cake';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { Tooltip } from '@mui/material';

import type { RepeatType } from '../types';
import { getRepeatIconLabel } from '../utils/repeatEventDisplay';

interface RepeatEventIconProps {
  repeatType: RepeatType;
  interval?: number;
  size?: 'small' | 'medium' | 'large';
}

/**
 * 반복 일정 아이콘 컴포넌트
 *
 * 반복 유형에 따라 적절한 아이콘을 표시하고,
 * hover 시 툴팁으로 반복 정보를 제공합니다.
 *
 * @param repeatType - 반복 유형
 * @param interval - 반복 간격 (기본값: 1)
 * @param size - 아이콘 크기 (기본값: 'small')
 */
export function RepeatEventIcon({
  repeatType,
  interval = 1,
  size = 'small',
}: RepeatEventIconProps) {
  // 반복 없음인 경우 null 반환
  if (repeatType === 'none') {
    return null;
  }

  // 레이블 생성
  const label = getRepeatIconLabel(repeatType, interval);

  // 아이콘 크기 매핑
  const sizeMap = {
    small: '16px',
    medium: '20px',
    large: '24px',
  };
  const iconSize = sizeMap[size];

  // 반복 유형별 아이콘 선택
  const getIcon = () => {
    const iconProps = {
      sx: { fontSize: iconSize },
    };

    switch (repeatType) {
      case 'daily':
        return <AutorenewIcon {...iconProps} />;
      case 'weekly':
        return <EventRepeatIcon {...iconProps} />;
      case 'monthly':
        return <CalendarMonthIcon {...iconProps} />;
      case 'yearly':
        return <CakeIcon {...iconProps} />;
      default:
        return null;
    }
  };

  const icon = getIcon();

  if (!icon) {
    return null;
  }

  // Tooltip과 접근성 속성을 위한 wrapper
  return (
    <Tooltip title={label}>
      <span
        role="img"
        aria-label={`반복 일정: ${label.replace(' 반복', '')}`}
        style={{ display: 'inline-flex', alignItems: 'center' }}
      >
        {icon}
      </span>
    </Tooltip>
  );
}
