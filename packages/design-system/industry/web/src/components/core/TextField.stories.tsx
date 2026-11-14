import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Core/TextField',
  component: TextField,
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <TextField label="Nome" placeholder="Digite seu nome" />
    </div>
  ),
};

export const WithHint: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <TextField label="E-mail" hint="Usamos só para login" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <TextField label="E-mail" error="E-mail inválido" defaultValue="not-an-email" />
    </div>
  ),
};

export const Multiline: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <TextField label="Notas" multiline rows={4} />
    </div>
  ),
};

export const Large: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <TextField label="Valor" size="lg" placeholder="R$ 0,00" />
    </div>
  ),
};
