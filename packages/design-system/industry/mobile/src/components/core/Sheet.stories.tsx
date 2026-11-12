import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { Sheet } from './Sheet';

const meta: Meta<typeof Sheet> = {
  title: 'Core/Sheet',
  component: Sheet,
  parameters: { gradientKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet title="Filtrar por status" onDismiss={() => {}}>
      <Text>Conteúdo da sheet.</Text>
    </Sheet>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Sheet title="Excluir item" onDismiss={() => {}} actions={<Text>Confirmar</Text>}>
      <Text>Essa ação não pode ser desfeita.</Text>
    </Sheet>
  ),
};
