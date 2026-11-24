import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Reveal } from './Reveal';

const meta: Meta<typeof Reveal> = {
  title: 'Core/Reveal',
  component: Reveal,
};

export default meta;
type Story = StoryObj<typeof Reveal>;

export const Staggered: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)', width: 360 }}>
      {[0, 120, 240].map((delay) => (
        <Reveal key={delay} delay={delay}>
          <Card title={`Atraso de ${delay}ms`} body="Aparece ao entrar na tela." />
        </Reveal>
      ))}
    </div>
  ),
};
