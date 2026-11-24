import { useState } from 'react';
import { LinkButton, TopNav } from '@industry/web';
import { CONTACT, WHATSAPP_URL } from '../content/contact';
import { MAIN_ID, NAV_LINKS } from '../content/navigation';
import { useIsWideScreen } from '../hooks/useIsWideScreen';

function SkipLink() {
  const [focused, setFocused] = useState(false);

  return (
    <a
      href={`#${MAIN_ID}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        position: 'absolute',
        left: 'var(--space-4)',
        top: focused ? 'var(--space-4)' : '-100px',
        zIndex: 20,
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--color-surface-2)',
        color: 'var(--color-text)',
      }}
    >
      Pular para o conteúdo
    </a>
  );
}

export function Header() {
  const isWide = useIsWideScreen();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        padding: 'var(--space-4) 0 0',
      }}
    >
      <SkipLink />
      <TopNav
        brand={
          <a
            href={`#${MAIN_ID}`}
            style={{
              display: 'block',
              lineHeight: 'var(--tap)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {CONTACT.name}
          </a>
        }
        links={NAV_LINKS}
        collapsed={!isWide}
        action={
          <LinkButton href={WHATSAPP_URL} variant="primary" size="sm" external>
            Vamos conversar
          </LinkButton>
        }
      />
    </header>
  );
}
