import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Stepper, TextField } from '../components/core';
import { color, fontSize, neutral, space } from '@industry/tokens';

const meta: Meta = {
  title: 'Templates/Multi-step Form',
};

export default meta;
type Story = StoryObj;

const STEPS = ['Dados pessoais', 'Endereço', 'Confirmação'];

function MultiStepFormScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.bg,
        paddingTop: insets.top + space[4],
        paddingBottom: insets.bottom + space[4],
        paddingHorizontal: space[4],
        gap: space[4],
      }}
    >
      <Stepper steps={STEPS} current={step} />

      {step === 0 ? (
        <View style={{ gap: space[3] }}>
          <TextField label="Nome completo" placeholder="Seu nome" />
          <TextField label="E-mail" placeholder="voce@empresa.com" keyboardType="email-address" />
        </View>
      ) : null}
      {step === 1 ? (
        <View style={{ gap: space[3] }}>
          <TextField label="Endereço" placeholder="Rua, número" />
          <TextField label="Cidade" placeholder="Sua cidade" />
        </View>
      ) : null}
      {step === 2 ? (
        <Text style={{ fontSize: fontSize.body, color: neutral['200'] }}>
          Revise os dados e confirme para concluir o cadastro.
        </Text>
      ) : null}

      <View style={{ flex: 1 }} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space[3] }}>
        <Button
          variant="secondary"
          disabled={step === 0}
          onPress={() => setStep((s) => Math.max(0, s - 1))}
        >
          Voltar
        </Button>
        <Button variant="primary" onPress={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
          {isLast ? 'Concluir' : 'Próximo'}
        </Button>
      </View>
    </View>
  );
}

export const Default: Story = {
  render: () => <MultiStepFormScreen />,
};
