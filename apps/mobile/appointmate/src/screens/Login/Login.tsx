import { useState } from 'react';
import { KeyboardAvoidingView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner, TextField, useTheme, useToast } from '@industry/mobile';
import { accentRamp, alpha } from '@industry/tokens';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { login, loginWithGoogle } from '../../services/authService';
import { mapFirebaseAuthError, mapGoogleSignInError } from '../../utils/firebaseErrors';
import { styles } from './Login.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function Login({ navigation }: Props) {
  const { colors } = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      toast.show({ tone: 'danger', title: mapFirebaseAuthError(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      toast.show({ tone: 'danger', title: mapGoogleSignInError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: accentRamp['300'] }]}>
              Acompanhamento de consultas
            </Text>
            <Text style={[styles.appTitle, { color: colors.text }]}>AppointMate</Text>
          </View>
          <View style={styles.form}>
            <TextField
              label="E-mail"
              placeholder="email@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="login-email-input"
            />
            <TextField
              label="Senha"
              placeholder="Sua senha"
              secureTextEntry
              secureToggle
              value={password}
              onChangeText={setPassword}
              testID="login-password-input"
            />
            {loading ? <Spinner /> : null}
            <Button
              variant="primary"
              block
              framed
              onPress={handleLogin}
              disabled={loading}
              testID="login-submit-button"
            >
              Entrar
            </Button>
            <View style={styles.orRow}>
              <View style={[styles.orDivider, { backgroundColor: colors.divider }]} />
              <Text style={[styles.orLabel, { color: alpha(colors.text, 60) }]}>ou</Text>
              <View style={[styles.orDivider, { backgroundColor: colors.divider }]} />
            </View>
            <Button
              variant="secondary"
              block
              onPress={handleGoogleLogin}
              disabled={loading}
              testID="login-google-button"
            >
              Continuar com Google
            </Button>
            <Button
              variant="ghost"
              onPress={() => navigation.navigate('ForgotPassword')}
              testID="login-forgot-password-button"
            >
              <Text style={[styles.forgotPasswordLabel, { color: accentRamp['300'] }]}>
                Esqueceu a senha?
              </Text>
            </Button>
          </View>
          <View style={styles.footer}>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <Text style={[styles.footerHint, { color: alpha(colors.text, 60) }]}>
              Primeira vez por aqui?
            </Text>
            <Button
              variant="secondary"
              block
              onPress={() => navigation.navigate('Register')}
              testID="login-create-account-button"
            >
              Criar conta
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
