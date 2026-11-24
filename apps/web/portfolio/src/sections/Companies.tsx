import { Reveal } from '@industry/web';
import { EXPERIENCE } from '../content/experience';

export function Companies() {
  return (
    <Reveal>
      <div style={{ display: 'grid', gap: 'var(--space-3)', justifyItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
          Onde já trabalhei
        </p>
        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'var(--space-8)',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {EXPERIENCE.map((job) => (
            <li
              key={job.company}
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--font-heading-weight)',
                fontSize: 'var(--text-h3)',
                color: 'var(--color-neutral-200)',
              }}
            >
              {job.company}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
