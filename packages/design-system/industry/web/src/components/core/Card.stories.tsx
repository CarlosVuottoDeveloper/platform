import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Core/Card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Card
        kicker="Projeto"
        title="Migração de dados"
        body="Movendo os registros legados para o novo schema."
        meta="Atualizado há 2h"
      />
    </div>
  ),
};

export const Elevated: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Card title="Card com sombra" elevation="md" body="Usa --shadow-md do token." />
    </div>
  ),
};
