import type { Meta, StoryObj } from '@storybook/react';
import { Sheet } from './Sheet';

const meta: Meta<typeof Sheet> = {
  title: 'Core/Sheet',
  component: Sheet,
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <div style={{ position: 'relative', height: 320, border: '1px solid var(--color-divider)' }}>
      <Sheet title="Filtrar por status" onDismiss={() => {}}>
        <label style={{ display: 'grid', gap: 6 }}>
          Status
          <input defaultValue="Aberto" />
        </label>
      </Sheet>
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div style={{ position: 'relative', height: 320, border: '1px solid var(--color-divider)' }}>
      <Sheet
        title="Excluir item"
        onDismiss={() => {}}
        actions={<button type="button">Confirmar</button>}
      >
        <p>Essa ação não pode ser desfeita.</p>
      </Sheet>
    </div>
  ),
};
