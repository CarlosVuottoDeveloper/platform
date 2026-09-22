import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner, TextField, useTheme, useToast } from '@industry/mobile';
import { accentRamp, alpha, fontFamilyMono } from '@industry/tokens';
import {
  login,
  loginWithGoogle,
  mapFirebaseAuthError,
  mapGoogleSignInError,
} from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { styles } from './Login.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const monoFontFamily = Platform.select(fontFamilyMono);

export function Login({ navigation }: Props) {
  const { colors } = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      setUser(user);
    } catch (err: unknown) {
      toast.show({ tone: 'danger', title: mapFirebaseAuthError(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) setUser(user);
    } catch (err: unknown) {
      toast.show({ tone: 'danger', title: mapGoogleSignInError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.keyboardView}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: accentRamp['300'] }]}>Gestão de chamados</Text>
            <Text style={[styles.appTitle, { color: colors.text }]}>tickets</Text>
          </View>
          <View style={styles.form} testID="login-form">
            <Button
              variant="primary"
              block
              framed
              onPress={handleGoogleLogin}
              disabled={loading}
              testID="login-google-button"
            >
              <View style={[styles.googleMark, { backgroundColor: colors.bg }]}>
                <Text style={[styles.googleMarkLetter, { color: colors.text }]}>G</Text>
              </View>
              <Text style={[styles.googleLabel, { color: colors.bg }]}>Continuar com Google</Text>
            </Button>
            <Text style={[styles.googleCaption, { color: alpha(colors.text, 60) }]}>
              Entra ou abre um workspace novo
            </Text>
            <View style={styles.orRow}>
              <View style={[styles.orDivider, { backgroundColor: colors.divider }]} />
              <Text
                style={[
                  styles.orLabel,
                  { fontFamily: monoFontFamily, color: alpha(colors.text, 50) },
                ]}
              >
                ou com e-mail
              </Text>
              <View style={[styles.orDivider, { backgroundColor: colors.divider }]} />
            </View>
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
            />
            {loading ? <Spinner /> : null}
            <Button variant="secondary" block onPress={handleLogin} disabled={loading}>
              Entrar
            </Button>
            <Button variant="ghost" block onPress={() => navigation.navigate('ForgotPassword')}>
              Esqueceu a senha?
            </Button>
          </View>
          <View style={styles.footer}>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <Text style={[styles.footerHint, { color: alpha(colors.text, 60) }]}>
              Criar conta abre um workspace novo
            </Text>
            <Button variant="secondary" block onPress={() => navigation.navigate('Register')}>
              Criar conta
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
