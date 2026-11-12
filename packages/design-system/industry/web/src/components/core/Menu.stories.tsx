import type { Meta, StoryObj } from '@storybook/react';
import { Menu } from './Menu';
import { Button } from './Button';

const meta: Meta<typeof Menu> = {
  title: 'Core/Menu',
  component: Menu,
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 80 }}>
      <Menu
        trigger={<Button>Ações</Button>}
        items={[
          { label: 'Editar', onSelect: () => {} },
          { label: 'Duplicar', onSelect: () => {} },
          { label: 'Excluir', onSelect: () => {}, disabled: true },
        ]}
      />
    </div>
  ),
};

export const WithHeaderAndSelection: Story = {
  render: () => (
    <div style={{ padding: 80 }}>
      <Menu
        trigger={<Button>Período</Button>}
        header="Período"
        items={[
          { label: 'Hoje', onSelect: () => {} },
          { label: 'Esta semana', onSelect: () => {}, selected: true },
          { label: 'Este mês', onSelect: () => {} },
        ]}
      />
    </div>
  ),
};
