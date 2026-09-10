import { useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBar, Button, Spinner, TextField, useTheme, useToast } from '@industry/mobile';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { register } from '../../services/authService';
import { mapFirebaseAuthError } from '../../utils/firebaseErrors';
import { emailFormatError, passwordMinLengthError } from '../../utils/validation';
import { styles } from './Register.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function Register({ navigation }: Props) {
  const { colors } = useTheme();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const emailError = emailFormatError(email);
  const passwordError = passwordMinLengthError(password);
  const canSubmit = Boolean(name.trim()) && Boolean(email) && !emailError && !passwordError;

  async function handleRegister() {
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: unknown) {
      toast.show({ tone: 'danger', title: mapFirebaseAuthError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar
        title="Criar conta"
        onBackPress={() => navigation.goBack()}
        testID="register-app-bar"
      />
      <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <View style={styles.form}>
            <TextField
              label="Nome"
              placeholder="Seu nome completo"
              value={name}
              onChangeText={setName}
              testID="register-name-input"
            />
            <TextField
              label="E-mail"
              error={emailError}
              placeholder="email@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="register-email-input"
            />
            <TextField
              label="Senha"
              error={passwordError}
              hint="Mínimo de 8 caracteres"
              placeholder="Sua senha"
              secureTextEntry
              secureToggle
              value={password}
              onChangeText={setPassword}
              testID="register-password-input"
            />
            {loading ? <Spinner /> : null}
            <Button
              variant="primary"
              block
              framed
              onPress={handleRegister}
              disabled={!canSubmit || loading}
              testID="register-submit-button"
            >
              Cadastrar
            </Button>
            <Button
              variant="ghost"
              block
              onPress={() => navigation.navigate('Login')}
              testID="register-back-to-login-button"
            >
              Voltar para o login
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
