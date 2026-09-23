import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
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
            <Text style={[styles.appTitle, { color: colors.text }]}>tickets</Text>
            <Text style={[styles.kicker, { color: accentRamp['300'] }]}>Gestão de chamados</Text>
          </View>
          <View style={styles.form} testID="login-form">
            <TextField
              placeholder="email@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="login-email-input"
            />
            <TextField
              placeholder="Sua senha"
              secureTextEntry
              secureToggle
              value={password}
              onChangeText={setPassword}
              testID="login-password-input"
            />
            <View style={styles.helperRow}>
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                onPress={() => navigation.navigate('ForgotPassword')}
                testID="login-forgot-password-button"
              >
                <Text style={[styles.link, { color: accentRamp['300'] }]}>Esqueceu a senha?</Text>
              </Pressable>
            </View>
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
              <Text
                style={[
                  styles.orLabel,
                  { fontFamily: monoFontFamily, color: alpha(colors.text, 50) },
                ]}
              >
                ou
              </Text>
              <View style={[styles.orDivider, { backgroundColor: colors.divider }]} />
            </View>
            <Button
              variant="secondary"
              block
              onPress={handleGoogleLogin}
              disabled={loading}
              testID="login-google-button"
            >
              <View style={[styles.googleMark, { backgroundColor: colors.text }]}>
                <Text style={[styles.googleMarkLetter, { color: colors.bg }]}>G</Text>
              </View>
              <Text style={[styles.googleLabel, { color: colors.text }]}>Continuar com Google</Text>
            </Button>
          </View>
          <View style={styles.footerRow}>
            <Text style={[styles.footerHint, { color: alpha(colors.text, 60) }]}>
              Não tem conta?
            </Text>
            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              onPress={() => navigation.navigate('Register')}
              testID="login-create-account-button"
            >
              <Text style={[styles.link, { color: accentRamp['300'] }]}>Criar conta</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
