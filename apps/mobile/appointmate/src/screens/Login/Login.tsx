import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner, TextField, useTheme, useToast } from '@industry/mobile';
import { accentRamp, alpha, fontFamilyMono } from '@industry/tokens';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { login, loginWithGoogle } from '../../services/authService';
import { mapFirebaseAuthError, mapGoogleSignInError } from '../../utils/firebaseErrors';
import { styles } from './Login.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const monoFontFamily = Platform.select(fontFamilyMono);

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
              Entra ou cria sua conta, conforme o caso
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
              testID="login-password-input"
            />
            {loading ? <Spinner /> : null}
            <Button
              variant="secondary"
              block
              onPress={handleLogin}
              disabled={loading}
              testID="login-submit-button"
            >
              Entrar
            </Button>
            <Button
              variant="ghost"
              onPress={() => navigation.navigate('ForgotPassword')}
              testID="login-forgot-password-button"
            >
              <Text style={[styles.link, { color: accentRamp['300'] }]}>Esqueceu a senha?</Text>
            </Button>
          </View>
          <View style={styles.footer}>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.footerRow}>
              <Text style={[styles.footerHint, { color: alpha(colors.text, 60) }]}>
                Primeira vez?
              </Text>
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                onPress={() => navigation.navigate('Register')}
                testID="login-create-account-button"
              >
                <Text style={[styles.link, { color: accentRamp['300'] }]}>
                  Criar conta com e-mail
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
