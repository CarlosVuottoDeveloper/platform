import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Core/Tabs',
  component: Tabs,
  parameters: { gradientKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs
      current="overview"
      items={[
        { id: 'overview', label: 'Visão geral' },
        { id: 'activity', label: 'Atividade', count: 3 },
        { id: 'settings', label: 'Configurações' },
      ]}
    />
  ),
};
