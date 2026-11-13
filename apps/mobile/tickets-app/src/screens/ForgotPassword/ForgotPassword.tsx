import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBar, Button, Spinner, TextField, useTheme, useToast } from '@industry/mobile';
import { alpha } from '@industry/tokens';
import { sendPasswordReset, mapFirebaseAuthError } from '../../services/authService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { styles } from './ForgotPassword.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

function backToLogin(navigation: Props['navigation']) {
  navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
}

export function ForgotPassword({ navigation }: Props) {
  const { colors } = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    setLoading(true);
    try {
      await sendPasswordReset(email);
      toast.show({
        tone: 'success',
        title: 'Link enviado',
        description: 'Voltando para o login em 2 segundos.',
      });
      setTimeout(() => backToLogin(navigation), 2000);
    } catch (err: unknown) {
      toast.show({ tone: 'danger', title: mapFirebaseAuthError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.keyboardView}>
      <AppBar title="Recuperar senha" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <Text style={[styles.description, { color: alpha(colors.text, 70) }]}>
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </Text>
          <View style={styles.form}>
            <TextField
              label="E-mail"
              placeholder="email@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {loading ? <Spinner /> : null}
            <Button
              variant="primary"
              block
              onPress={handleResetPassword}
              disabled={!email || loading}
            >
              Enviar link
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
