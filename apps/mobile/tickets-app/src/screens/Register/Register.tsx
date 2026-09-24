import { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBar, Button, Spinner, TextField, useTheme, useToast } from '@industry/mobile';
import { accentRamp } from '@industry/tokens';
import { register, mapFirebaseAuthError } from '../../services/authService';
import { passwordMinLengthError } from '../../domain/validation';
import { useAuthStore } from '../../store/useAuthStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { styles } from './Register.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function Register({ navigation }: Props) {
  const { colors } = useTheme();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    AsyncStorage.getItem('first_user_registered').then((val) => {
      setIsFirstUser(val === null);
    });
  }, []);

  const passwordError = passwordMinLengthError(password);

  async function handleRegister() {
    setLoading(true);
    try {
      const user = await register(name, email, password);
      await AsyncStorage.setItem('first_user_registered', 'true');
      setUser(user);
    } catch (err: unknown) {
      toast.show({ tone: 'danger', title: mapFirebaseAuthError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.keyboardView}>
      <AppBar title="Criar conta" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          {isFirstUser && (
            <View
              style={[
                styles.adminNotice,
                { backgroundColor: accentRamp['900'], borderLeftColor: colors.accent },
              ]}
            >
              <Text style={[styles.adminNoticeKicker, { color: accentRamp['200'] }]}>
                Primeiro acesso
              </Text>
              <Text style={[styles.adminNoticeText, { color: colors.text }]}>
                Esta conta abre um workspace novo e você fica como administrador dele. Para entrar
                num workspace existente, peça ao administrador para criar seu acesso.
              </Text>
            </View>
          )}
          <View style={styles.form}>
            <TextField
              label="Nome"
              placeholder="Seu nome completo"
              value={name}
              onChangeText={setName}
            />
            <TextField
              label="E-mail"
              placeholder="email@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
            />
            {loading ? <Spinner /> : null}
            <Button
              variant="primary"
              framed
              onPress={handleRegister}
              disabled={!name.trim() || !email.trim() || password.length < 8 || loading}
            >
              Cadastrar
            </Button>
            <Button
              variant="ghost"
              block
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
            >
              Voltar para o login
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
