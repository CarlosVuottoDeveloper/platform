import { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, TextField } from '../components/core';
import { color, space } from '@industry/tokens';

const meta: Meta = {
  title: 'Templates/Login',
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
      <View style={{ padding: space[4], gap: space[4] }}>
        <View style={{ gap: space[1] }}>
          <Text style={{ fontSize: 22, fontWeight: '600', color: color.text }}>Entrar</Text>
          <Text style={{ fontSize: 13, color: color.text }}>Acesse sua conta para continuar</Text>
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
      </View>
    </View>
  );
}

export const Default: Story = {
  render: () => <LoginScreen />,
};
