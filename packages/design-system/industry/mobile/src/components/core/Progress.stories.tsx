import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Progress, Spinner } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Core/Progress',
  component: Progress,
  parameters: { gradientKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => (
    <View style={{ width: 280 }}>
      <Progress value={62} label="Enviando" />
    </View>
  ),
};

export const NoValue: Story = {
  render: () => (
    <View style={{ width: 280 }}>
      <Progress value={40} showValue={false} label="Processando" />
    </View>
  ),
};

export const SpinnerStory: StoryObj<typeof Spinner> = {
  name: 'Spinner',
  render: () => <Spinner />,
};
