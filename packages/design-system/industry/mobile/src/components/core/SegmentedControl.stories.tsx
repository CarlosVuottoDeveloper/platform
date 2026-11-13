import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';
import { Icon } from './Icon';
import { color, neutral } from '@industry/tokens';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Core/SegmentedControl',
  component: SegmentedControl,
  parameters: { svgKnownIssue: true, gradientKnownIssue: true },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const TextOnly: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('dia');
      return (
        <SegmentedControl
          options={['dia', 'semana', 'mes']}
          value={value}
          onValueChange={setValue}
        />
      );
    }
    return <Demo />;
  },
};

export const WithIcons: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState('grid');
      return (
        <SegmentedControl
          options={[
            {
              value: 'grid',
              label: 'Grade',
              icon: (
                <Icon
                  name="Grid2x2"
                  size="sm"
                  color={value === 'grid' ? color.text : neutral['400']}
                />
              ),
            },
            {
              value: 'list',
              label: 'Lista',
              icon: (
                <Icon
                  name="List"
                  size="sm"
                  color={value === 'list' ? color.text : neutral['400']}
                />
              ),
            },
          ]}
          value={value}
          onValueChange={setValue}
        />
      );
    }
    return <Demo />;
  },
};
