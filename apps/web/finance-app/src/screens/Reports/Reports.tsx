import { useState } from 'react';
import { Tabs } from '@industry/web';
import { MonthSwitcher } from '../../components/MonthSwitcher/MonthSwitcher';
import { yearMonthOf } from '../../domain/calendarDate';
import { useToday } from '../../hooks/useToday';
import { ChartsTab } from './ChartsTab';
import { NetWorthTab } from './NetWorthTab';
import { ReportTab } from './ReportTab';

const TABS = [
  { id: 'charts', label: 'Gráficos' },
  { id: 'net-worth', label: 'Patrimônio' },
  { id: 'report', label: 'Relatório' },
];

export function Reports() {
  const today = useToday();
  const [tab, setTab] = useState('charts');
  const [month, setMonth] = useState(yearMonthOf(today));

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <h1 style={{ margin: 0 }}>Relatórios</h1>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-3)',
          justifyContent: 'space-between',
        }}
      >
        <Tabs items={TABS} current={tab} onSelect={setTab} />
        {tab === 'charts' ? <MonthSwitcher month={month} onChange={setMonth} /> : null}
      </div>
      {tab === 'charts' ? <ChartsTab month={month} /> : null}
      {tab === 'net-worth' ? <NetWorthTab /> : null}
      {tab === 'report' ? <ReportTab /> : null}
    </div>
  );
}
