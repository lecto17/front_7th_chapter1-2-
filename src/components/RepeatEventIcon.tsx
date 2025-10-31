import AutorenewIcon from '@mui/icons-material/Autorenew';
import CakeIcon from '@mui/icons-material/Cake';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { Box, Tooltip } from '@mui/material';
import { memo, type ComponentType } from 'react';

import type { RepeatType } from '../types';
import { getRepeatIconLabel } from '../utils/repeatEventDisplay';

/**
 * 아이콘 크기 매핑 (px)
 */
const ICON_SIZE_MAP = {
  small: '16px',
  medium: '20px',
  large: '24px',
} as const;

/**
 * 반복 유형별 아이콘 컴포넌트 매핑
 */
const REPEAT_ICON_MAP: Record<Exclude<RepeatType, 'none'>, ComponentType<{ sx?: object }>> = {
  daily: AutorenewIcon,
  weekly: EventRepeatIcon,
  monthly: CalendarMonthIcon,
  yearly: CakeIcon,
} as const;

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
export const RepeatEventIcon = memo(function RepeatEventIcon({
  repeatType,
  interval = 1,
  size = 'small',
}: RepeatEventIconProps) {
  // 반복 없음인 경우 null 반환
  if (repeatType === 'none') {
    return null;
  }

  const label = getRepeatIconLabel(repeatType, interval);
  const IconComponent = REPEAT_ICON_MAP[repeatType];
  const iconSize = ICON_SIZE_MAP[size];

  return (
    <Tooltip title={label}>
      <Box
        component="span"
        role="img"
        aria-label={`반복 일정: ${label.replace(' 반복', '')}`}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <IconComponent sx={{ fontSize: iconSize }} />
      </Box>
    </Tooltip>
  );
});
