import { LinkButton } from '@industry/web';
import { PhotoFrame } from '../components/PhotoFrame';
import { CONTACT, PHOTO_SRC, WHATSAPP_URL } from '../content/contact';
import { SECTION_IDS } from '../content/navigation';
import { useIsWideScreen } from '../hooks/useIsWideScreen';

export function Hero() {
  const isWide = useIsWideScreen();

  return (
    <div
      data-testid="hero-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: isWide ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)',
        alignItems: 'center',
        gap: 'var(--space-8)',
        paddingTop: isWide ? 'var(--space-12)' : 'var(--space-6)',
      }}
    >
      <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.1,
            color: 'var(--color-text)',
          }}
        >
          <span style={{ display: 'block', fontWeight: 400, fontSize: 'clamp(26px, 3.6vw, 40px)' }}>
            Olá! Sou o {CONTACT.name},
          </span>{' '}
          <span
            style={{
              display: 'block',
              fontWeight: 'var(--font-heading-weight)',
              fontSize: 'clamp(34px, 5.4vw, 60px)',
            }}
          >
            construindo experiências digitais.
          </span>
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: '32rem',
            fontSize: 'var(--text-body)',
            lineHeight: 1.6,
            color: 'var(--color-neutral-200)',
          }}
        >
          Sites, aplicativos web e mobile e design systems com React e React Native. Do protótipo ao
          produto no ar, com código testado e fácil de manter.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <LinkButton href={WHATSAPP_URL} variant="primary" external>
            Vamos conversar
          </LinkButton>
          <LinkButton href={`#${SECTION_IDS.projects}`}>Ver projetos</LinkButton>
        </div>
      </div>
      <div style={{ justifySelf: 'center', width: '100%', display: 'grid' }}>
        <div style={{ justifySelf: 'center', width: '100%', maxWidth: 420 }}>
          <PhotoFrame
            src={PHOTO_SRC}
            alt={`${CONTACT.name}, de óculos e camiseta preta, sorrindo de braços cruzados`}
            size={420}
          />
        </div>
      </div>
    </div>
  );
}
