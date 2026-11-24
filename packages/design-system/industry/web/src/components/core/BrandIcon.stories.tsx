import type { Meta, StoryObj } from '@storybook/react';
import { BrandIcon } from './BrandIcon';
import type { BrandName } from './BrandIcon';

const meta: Meta<typeof BrandIcon> = {
  title: 'Core/BrandIcon',
  component: BrandIcon,
};

export default meta;
type Story = StoryObj<typeof BrandIcon>;

const NAMES: BrandName[] = ['linkedin', 'github', 'whatsapp'];

export const All: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)', color: 'var(--color-text)' }}>
      {(['sm', 'lg'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 'var(--space-4)' }}>
          {NAMES.map((name) => (
            <BrandIcon key={name} name={name} size={size} aria-label={name} />
          ))}
        </div>
      ))}
    </div>
  ),
};
