import { Button } from '@industry/web';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { CategoriesSection } from './CategoriesSection';
import { DataSection } from './DataSection';
import { RecurrencesSection } from './RecurrencesSection';

export function Settings() {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      <h1 style={{ margin: 0 }}>Configurações</h1>
      <CategoriesSection />
      <RecurrencesSection />
      <DataSection />
      <section style={{ display: 'grid', gap: 'var(--space-3)', justifyItems: 'start' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-h4)' }}>Sessão</h2>
        <p style={{ margin: 0, color: 'var(--color-neutral-400)' }}>{user?.email}</p>
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
      </section>
    </div>
  );
}
