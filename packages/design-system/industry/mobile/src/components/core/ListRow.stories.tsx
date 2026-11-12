import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { color } from '@industry/tokens';
import { ListRow } from './ListRow';
import { Icon } from './Icon';

const meta: Meta<typeof ListRow> = {
  title: 'Core/ListRow',
  component: ListRow,
  parameters: { svgKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof ListRow>;

export const Default: Story = {
  render: () => (
    <View style={{ width: 360 }}>
      <ListRow title="Relatório de vendas" meta="Atualizado há 2h" />
      <ListRow
        lead={<Icon name="Folder" color="#86a8cc" />}
        title="Contratos"
        meta="12 arquivos"
        trail={<Icon name="ChevronRight" size="sm" color={color.text} />}
      />
    </View>
  ),
};
