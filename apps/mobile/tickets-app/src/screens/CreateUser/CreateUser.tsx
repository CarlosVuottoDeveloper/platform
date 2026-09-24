import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBar, Button, Spinner, TextField, useTheme, useToast } from '@industry/mobile';
import { accentRamp, alpha } from '@industry/tokens';
import { createUser } from '../../services/authService';
import { passwordMinLengthError } from '../../domain/validation';
import { useAuthStore } from '../../store/useAuthStore';
import { BottomBar } from '../../components/BottomBar';
import type { UserRole } from '../../domain/user';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { styles } from './CreateUser.styles';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateUser'>;

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Padrão', value: 'standard' },
  { label: 'Administrador', value: 'admin' },
];

function SectionLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionLabelBlock}>
      <Text style={[styles.sectionLabel, { color: accentRamp['300'] }]}>{children}</Text>
      <View style={[styles.sectionHairline, { backgroundColor: colors.divider }]} />
    </View>
  );
}

export function CreateUser({ navigation }: Props) {
  const { colors } = useTheme();
  const currentUser = useAuthStore((s) => s.user);
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('standard');
  const [loading, setLoading] = useState(false);

  if (currentUser?.role !== 'admin') {
    navigation.goBack();
    return null;
  }

  const passwordError = passwordMinLengthError(password);

  const isValid = name.trim() !== '' && email.trim() !== '' && password.length >= 8;

  async function handleCreate() {
    setLoading(true);
    try {
      await createUser(name, email, password, role, currentUser!);
      toast.show({ tone: 'success', title: 'Usuário criado com sucesso!' });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err: unknown) {
      toast.show({
        tone: 'danger',
        title: err instanceof Error ? err.message : 'Falha ao criar usuário',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.flex}>
      <AppBar
        title="Criar usuário"
        onBackPress={() => navigation.goBack()}
        trailing={
          <View style={[styles.adminTag, { borderColor: colors.accent }]}>
            <Text style={[styles.adminTagText, { color: colors.accent }]}>Admin</Text>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.intro, { color: alpha(colors.text, 70) }]}>
          A conta é criada já dentro deste workspace, com a senha que você definir. Não há link de
          convite — entregue as credenciais à pessoa.
        </Text>

        <SectionLabel>Dados de acesso</SectionLabel>
        <TextField label="Nome" placeholder="Nome completo" value={name} onChangeText={setName} />
        <TextField
          label="E-mail"
          placeholder="email@exemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="Senha provisória"
          error={passwordError}
          hint="Mínimo de 8 caracteres"
          placeholder="Defina a senha provisória"
          secureTextEntry
          secureToggle
          value={password}
          onChangeText={setPassword}
        />

        <SectionLabel>Perfil</SectionLabel>
        <View style={styles.roleRow}>
          {ROLE_OPTIONS.map((option) => {
            const selected = role === option.value;
            return (
              <Button
                key={option.value}
                style={styles.roleButton}
                variant={selected ? 'primary' : 'secondary'}
                framed={selected}
                accessibilityState={{ selected }}
                onPress={() => setRole(option.value)}
              >
                {option.label}
              </Button>
            );
          })}
        </View>
        <Text style={[styles.roleHint, { color: alpha(colors.text, 60) }]}>
          Padrão vê apenas os chamados que criou ou que lhe foram designados. Administrador vê o
          workspace todo e pode editar, excluir e criar usuários.
        </Text>

        {loading ? <Spinner /> : null}
      </ScrollView>
      <BottomBar>
        <Button
          style={styles.bottomBarButton}
          variant="secondary"
          onPress={() => navigation.goBack()}
        >
          Cancelar
        </Button>
        <Button
          style={styles.bottomBarButton}
          variant="primary"
          framed
          onPress={handleCreate}
          disabled={!isValid || loading}
        >
          Criar usuário
        </Button>
      </BottomBar>
    </SafeAreaView>
  );
}
