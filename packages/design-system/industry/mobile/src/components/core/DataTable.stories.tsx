import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';

function SortableTable() {
  const [sort, setSort] = useState<{ key: 'name' | 'role'; dir: 'asc' | 'desc' }>({
    key: 'name',
    dir: 'asc',
  });
  const rows = [...ROWS].sort((a, b) => {
    const order = String(a[sort.key]).localeCompare(String(b[sort.key]));
    return sort.dir === 'asc' ? order : -order;
  });
  const toggle = (key: string) =>
    setSort((current) => ({
      key: key === 'role' ? 'role' : 'name',
      dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc',
    }));

  return (
    <DataTable
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'role', label: 'Cargo' },
      ]}
      rows={rows}
      sort={sort}
      onSort={toggle}
      testID="data-table"
    />
  );
}

const meta: Meta<typeof DataTable> = {
  title: 'Core/DataTable',
  component: DataTable,
  parameters: { svgKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

const ROWS = [
  { id: 1, name: 'Ana Silva', role: 'Engenheira' },
  { id: 2, name: 'Bruno Costa', role: 'Designer' },
  { id: 3, name: 'Carla Nunes', role: 'Product Manager' },
];

export const Default: Story = {
  render: () => (
    <DataTable
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'role', label: 'Cargo' },
      ]}
      rows={ROWS}
      testID="data-table"
    />
  ),
};

export const Sortable: Story = {
  render: () => <SortableTable />,
};

export const WithPagination: Story = {
  render: () => (
    <DataTable
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'role', label: 'Cargo' },
      ]}
      rows={ROWS}
      page={2}
      pageCount={5}
      total={48}
      testID="data-table"
    />
  ),
};
