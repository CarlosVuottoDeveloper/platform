import { Link } from 'react-router';
import { Icon } from '@industry/web';
import { MORE_ENTRIES } from '../../components/AppLayout/navigation';

export function More() {
  return (
    <section>
      <h1>Mais</h1>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {MORE_ENTRIES.map((entry) => (
          <li key={entry.path} style={{ borderBottom: '1px solid var(--color-divider)' }}>
            <Link
              to={entry.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                minHeight: 'var(--control-h)',
                color: 'var(--color-text)',
                textDecoration: 'none',
              }}
            >
              <Icon name={entry.icon} size="sm" />
              {entry.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
