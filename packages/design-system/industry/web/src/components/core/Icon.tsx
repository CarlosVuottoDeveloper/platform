import type { CSSProperties } from 'react';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';

const SIZES = { xs: 14, sm: 16, md: 20, lg: 24 } as const;

export type IconSize = keyof typeof SIZES | number;
export type { IconName };

export interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function Icon({
  name,
  size = 'sm',
  color = 'currentColor',
  strokeWidth = 1.5,
  className,
  style,
  'aria-label': ariaLabel,
}: IconProps) {
  const px = typeof size === 'number' ? size : SIZES[size];

  return (
    <DynamicIcon
      name={name}
      size={px}
      color="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      style={color === 'currentColor' ? style : { color, ...style }}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
    />
  );
}
