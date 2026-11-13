import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Card, TextField } from '../components/core';

const meta: Meta = {
  title: 'Templates/Login',
};

export default meta;
type Story = StoryObj;

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: 'var(--space-4)',
      }}
    >
      <Card style={{ width: 360 }}>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'var(--text-h3)' }}>Entrar</h1>
            <p
              style={{
                margin: 'var(--space-1) 0 0',
                fontSize: 'var(--text-h6)',
                color: 'var(--color-neutral-400)',
              }}
            >
              Acesse sua conta para continuar
            </p>
          </div>
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Button variant="primary" block>
            Entrar
          </Button>
        </div>
      </Card>
    </div>
  );
}

export const Default: Story = {
  render: () => <LoginScreen />,
};
