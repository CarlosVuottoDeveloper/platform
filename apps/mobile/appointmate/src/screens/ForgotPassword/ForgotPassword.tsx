import { useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBar, Button, Spinner, TextField, useTheme, useToast } from '@industry/mobile';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { sendPasswordReset } from '../../services/authService';
import { mapFirebaseAuthError } from '../../utils/firebaseErrors';
import { emailFormatError } from '../../utils/validation';
import { styles } from './ForgotPassword.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPassword({ navigation }: Props) {
  const { colors } = useTheme();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const emailError = emailFormatError(email);
  const canSubmit = Boolean(email) && !emailError;

  async function handleResetPassword() {
    setLoading(true);
    try {
      await sendPasswordReset(email);
      toast.show({
        tone: 'success',
        title: 'Link enviado',
        description: `Verifique a caixa de entrada de ${email}.`,
      });
      navigation.goBack();
    } catch (err: unknown) {
      toast.show({ tone: 'danger', title: mapFirebaseAuthError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <AppBar
        title="Recuperar senha"
        onBackPress={() => navigation.goBack()}
        testID="forgot-password-app-bar"
      />
      <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <View style={styles.form}>
            <TextField
              label="E-mail"
              error={emailError}
              placeholder="email@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="forgot-password-email-input"
            />
            {loading ? <Spinner /> : null}
            <Button
              variant="primary"
              block
              framed
              onPress={handleResetPassword}
              disabled={!canSubmit || loading}
              testID="forgot-password-submit-button"
            >
              Enviar link
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
