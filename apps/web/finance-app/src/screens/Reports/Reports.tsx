import { useState } from 'react';
import { Tabs } from '@industry/web';
import { ChartsTab } from './ChartsTab';
import { NetWorthTab } from './NetWorthTab';

const TABS = [
  { id: 'charts', label: 'Gráficos' },
  { id: 'net-worth', label: 'Patrimônio' },
];

export function Reports() {
  const [tab, setTab] = useState('charts');

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <h1 style={{ margin: 0 }}>Relatórios</h1>
      <Tabs items={TABS} current={tab} onSelect={setTab} />
      {tab === 'charts' ? <ChartsTab /> : null}
      {tab === 'net-worth' ? <NetWorthTab /> : null}
    </div>
  );
}
