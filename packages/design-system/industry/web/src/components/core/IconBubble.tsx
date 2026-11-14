import type { CSSProperties, ReactNode } from 'react';

export type IconBubbleSize = 'sm' | 'md';

export interface IconBubbleProps {
  children: ReactNode;
  size?: IconBubbleSize;
  style?: CSSProperties;
  testID?: string;
}

const LENGTH: Record<IconBubbleSize, string> = {
  sm: '32px',
  md: 'var(--control-h-sm)',
};

export function IconBubble({ children, size = 'md', style, testID }: IconBubbleProps) {
  return (
    <span
      aria-hidden="true"
      data-testid={testID}
      style={{
        width: LENGTH[size],
        height: LENGTH[size],
        flexShrink: 0,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--color-accent-800)',
        color: 'var(--color-accent-300)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
