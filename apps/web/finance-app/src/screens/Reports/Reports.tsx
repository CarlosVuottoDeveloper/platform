import { useState } from 'react';
import { Tabs } from '@industry/web';
import { ChartsTab } from './ChartsTab';
import { NetWorthTab } from './NetWorthTab';
import { ReportTab } from './ReportTab';

const TABS = [
  { id: 'charts', label: 'Gráficos' },
  { id: 'net-worth', label: 'Patrimônio' },
  { id: 'report', label: 'Relatório' },
];

export function Reports() {
  const [tab, setTab] = useState('charts');

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <h1 style={{ margin: 0 }}>Relatórios</h1>
      <Tabs items={TABS} current={tab} onSelect={setTab} />
      {tab === 'charts' ? <ChartsTab /> : null}
      {tab === 'net-worth' ? <NetWorthTab /> : null}
      {tab === 'report' ? <ReportTab /> : null}
    </div>
  );
}
