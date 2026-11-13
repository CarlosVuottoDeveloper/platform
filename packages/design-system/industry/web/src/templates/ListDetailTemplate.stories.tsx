import type { Meta, StoryObj } from '@storybook/react';
import { AppShell, Card, DataTable, Sidebar } from '../components/core';

const meta: Meta = {
  title: 'Templates/List + Detail',
};

export default meta;
type Story = StoryObj;

interface ProjectRow extends Record<string, string> {
  id: string;
  name: string;
  owner: string;
  status: string;
}

const ROWS: ProjectRow[] = [
  { id: '1', name: 'Rebranding', owner: 'Kadu', status: 'Em andamento' },
  { id: '2', name: 'App Ticketing', owner: 'Equipe Mobile', status: 'Em revisão' },
  { id: '3', name: 'AppointMate', owner: 'Equipe Saúde', status: 'Concluído' },
];

function ListDetailScreen() {
  const selected = ROWS[0];

  return (
    <div style={{ height: '100vh' }}>
      <AppShell
        sidebar={
          <Sidebar
            brand="Industry"
            items={[
              { id: 'projects', label: 'Projetos' },
              { id: 'settings', label: 'Configurações' },
            ]}
            current="projects"
          />
        }
        header={<span>Projetos</span>}
        style={{ height: '100%' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 'var(--space-4)',
            padding: 'var(--space-4)',
          }}
        >
          <DataTable
            columns={[
              { key: 'name', label: 'Projeto' },
              { key: 'owner', label: 'Responsável' },
              { key: 'status', label: 'Status' },
            ]}
            rows={ROWS}
            toolbar={
              <span style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
                {ROWS.length} projetos
              </span>
            }
          />
          {selected ? (
            <Card
              kicker="Detalhe"
              title={selected.name}
              body={`Responsável: ${selected.owner}`}
              meta={selected.status}
            />
          ) : null}
        </div>
      </AppShell>
    </div>
  );
}

export const Default: Story = {
  render: () => <ListDetailScreen />,
};
