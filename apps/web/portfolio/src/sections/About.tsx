import { Badge, BrandIcon, Card, LinkButton, Reveal } from '@industry/web';
import { PhotoFrame } from '../components/PhotoFrame';
import { Section } from '../components/Section';
import { CONTACT, PHOTO_SRC } from '../content/contact';
import { BIO, EXPERIENCE } from '../content/experience';
import { SECTION_IDS } from '../content/navigation';
import { STACK } from '../content/stack';
import { useIsWideScreen } from '../hooks/useIsWideScreen';

const HEADING = {
  margin: 0,
  fontFamily: 'var(--font-heading)',
  fontWeight: 'var(--font-heading-weight)',
  fontSize: 'var(--text-h4)',
} as const;

export function About() {
  const isWide = useIsWideScreen();

  return (
    <Section
      id={SECTION_IDS.about}
      title="Sobre mim"
      subtitle="Interfaces que escalam, do site ao design system."
    >
      <div
        data-testid="about-grid"
        style={{
          display: 'grid',
          gap: 'var(--space-6)',
          gridTemplateColumns: isWide ? 'minmax(0, 1fr) minmax(0, 1.6fr)' : 'minmax(0, 1fr)',
          alignItems: 'start',
        }}
      >
        <Reveal>
          <Card
            elevation="sm"
            style={{ alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-6)' }}
          >
            <PhotoFrame src={PHOTO_SRC} alt="" size={240} />
            <Badge tone="success">Disponível para novos projetos</Badge>
            <p style={{ ...HEADING, fontSize: 'var(--text-h3)' }}>{CONTACT.name}</p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 'var(--space-3)',
              }}
            >
              <LinkButton href={CONTACT.linkedin} size="sm" external>
                <BrandIcon name="linkedin" />
                LinkedIn
              </LinkButton>
              <LinkButton href={CONTACT.github} size="sm" external>
                <BrandIcon name="github" />
                GitHub
              </LinkButton>
            </div>
          </Card>
        </Reveal>
        <Reveal delay={isWide ? 150 : 0} style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <Card elevation="sm" style={{ gap: 'var(--space-4)', padding: 'var(--space-6)' }}>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-body)',
                lineHeight: 1.7,
                color: 'var(--color-neutral-200)',
              }}
            >
              {BIO}
            </p>
            <h3 style={HEADING}>Stack</h3>
            <ul
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              {STACK.map((tool) => (
                <li key={tool}>
                  <Badge tone="accent">{tool}</Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card elevation="sm" style={{ gap: 'var(--space-2)', padding: 'var(--space-6)' }}>
            <h3 style={HEADING}>Experiência</h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {EXPERIENCE.map((job, index) => (
                <li
                  key={job.company}
                  data-testid={`experience-${job.company}`}
                  style={{
                    display: 'grid',
                    gap: 'var(--space-1)',
                    padding: 'var(--space-3) 0',
                    borderTop: index > 0 ? '1px solid var(--color-divider)' : undefined,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <span style={{ ...HEADING, fontSize: 'var(--text-body)' }}>{job.company}</span>
                    <span style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
                      {job.period}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--text-h6)',
                      lineHeight: 1.6,
                      color: 'var(--color-neutral-300)',
                    }}
                  >
                    {job.description}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}
