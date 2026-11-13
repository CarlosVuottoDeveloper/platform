import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Usually a `<Sidebar>`. */
  sidebar?: ReactNode;
  /** Contents of the top bar above the page body. */
  header?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

export function AppShell({ sidebar, header, children, style, ...rest }: AppShellProps) {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '232px 1fr', minHeight: '100%', ...style }}
      {...rest}
    >
      {sidebar}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {header ? (
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-6)',
              background: 'transparent',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-heading-weight)',
              fontSize: 'var(--text-h4)',
            }}
          >
            {header}
          </header>
        ) : null}
        <div
          style={{
            padding: 'var(--space-6)',
            flex: 1,
            minWidth: 0,
            background: 'var(--color-bg)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
