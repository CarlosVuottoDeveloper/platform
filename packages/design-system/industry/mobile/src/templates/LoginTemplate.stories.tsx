import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Card, TextField } from '../components/core';
import { color, fontSize, fontWeight, neutral, space } from '@industry/tokens';

const meta: Meta = {
  title: 'Templates/Login',
  parameters: { gradientKnownIssue: true },
};

export default meta;
type Story = StoryObj;

function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: color.bg,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingHorizontal: space[4],
      }}
    >
      <Card style={{ gap: space[4] }}>
        <View style={{ gap: space[1] }}>
          <Text
            style={{ fontSize: fontSize.h3, fontWeight: fontWeight.heading, color: color.text }}
          >
            Entrar
          </Text>
          <Text style={{ fontSize: fontSize.h6, color: neutral['400'] }}>
            Acesse sua conta para continuar
          </Text>
        </View>
        <TextField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@empresa.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <Button variant="primary" block>
          Entrar
        </Button>
      </Card>
    </View>
  );
}

export const Default: Story = {
  render: () => <LoginScreen />,
};
