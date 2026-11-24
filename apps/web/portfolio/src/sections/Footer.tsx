import { BrandIcon } from '@industry/web';
import type { BrandName } from '@industry/web';
import { CONTACT, WHATSAPP_URL } from '../content/contact';
import { NAV_LINKS } from '../content/navigation';

const SOCIAL: { brand: BrandName; label: string; href: string }[] = [
  { brand: 'linkedin', label: 'LinkedIn', href: CONTACT.linkedin },
  { brand: 'github', label: 'GitHub', href: CONTACT.github },
  { brand: 'whatsapp', label: 'WhatsApp', href: WHATSAPP_URL },
];

export function Footer() {
  return (
    <footer
      style={{
        display: 'grid',
        gap: 'var(--space-6)',
        justifyItems: 'center',
        paddingTop: 'var(--space-12)',
        borderTop: '1px solid var(--color-divider)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-heading-weight)',
          fontSize: 'clamp(44px, 10vw, 128px)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(180deg, var(--color-text), var(--color-neutral-400))',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {CONTACT.name}
      </p>
      <nav aria-label="Rodapé">
        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '44px',
                  padding: '0 var(--space-3)',
                  color: 'var(--color-neutral-200)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <ul
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {SOCIAL.map((item) => (
          <li key={item.brand}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.label} de ${CONTACT.name}`}
              style={{
                display: 'inline-grid',
                placeItems: 'center',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-divider)',
                color: 'var(--color-text)',
              }}
            >
              <BrandIcon name={item.brand} size="md" />
            </a>
          </li>
        ))}
      </ul>
      <p style={{ margin: 0, fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
        © {new Date().getFullYear()} {CONTACT.name}
      </p>
    </footer>
  );
}
