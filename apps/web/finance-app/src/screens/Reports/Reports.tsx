import { ChartsTab } from './ChartsTab';

export function Reports() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <h1 style={{ margin: 0 }}>Relatórios</h1>
      <ChartsTab />
    </div>
  );
}
