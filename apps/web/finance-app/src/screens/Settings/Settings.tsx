import { Button } from '@industry/web';
import { useAuth } from '../../context/AuthContext/AuthContext';

export function Settings() {
  const { user, logout } = useAuth();

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', justifyItems: 'start' }}>
      <h1>Configurações</h1>
      <p style={{ margin: 0, color: 'var(--color-neutral-400)' }}>{user?.email}</p>
      <Button variant="secondary" onClick={logout}>
        Sair
      </Button>
    </section>
  );
}
