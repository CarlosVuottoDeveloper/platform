import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Card, Stepper, TextField } from '../components/core';

const meta: Meta = {
  title: 'Templates/Multi-step Form',
};

export default meta;
type Story = StoryObj;

const STEPS = ['Dados pessoais', 'Endereço', 'Confirmação'];

function MultiStepFormScreen() {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

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
      <Card style={{ width: 420 }}>
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <Stepper steps={STEPS} current={step} />

          {step === 0 ? (
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <TextField label="Nome completo" placeholder="Seu nome" />
              <TextField label="E-mail" type="email" placeholder="voce@empresa.com" />
            </div>
          ) : null}
          {step === 1 ? (
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <TextField label="Endereço" placeholder="Rua, número" />
              <TextField label="Cidade" placeholder="Sua cidade" />
            </div>
          ) : null}
          {step === 2 ? (
            <p style={{ margin: 0, fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
              Revise os dados e confirme para concluir o cadastro.
            </p>
          ) : null}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <Button
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Voltar
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              {isLast ? 'Concluir' : 'Próximo'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export const Default: Story = {
  render: () => <MultiStepFormScreen />,
};
