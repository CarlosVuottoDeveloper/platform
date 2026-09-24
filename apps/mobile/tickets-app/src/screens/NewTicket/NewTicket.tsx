import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBar, Button, Select, Spinner, TextField, useTheme, useToast } from '@industry/mobile';
import { accentRamp, alpha, fontFamilyMono } from '@industry/tokens';
import { createTicket } from '../../services/ticketService';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserList } from '../../hooks/useUserList';
import {
  ALL_PRIORITIES,
  PRIORITY_LABELS,
  type TicketPriority,
} from '../../constants/ticketPriority';
import { BottomBar } from '../../components/BottomBar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { styles } from './NewTicket.styles';

const monoFontFamily = Platform.select(fontFamilyMono);

type Props = NativeStackScreenProps<AppStackParamList, 'NewTicket'>;

function SectionLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionLabelBlock}>
      <Text style={[styles.sectionLabel, { color: accentRamp['300'] }]}>{children}</Text>
      <View style={[styles.sectionHairline, { backgroundColor: colors.divider }]} />
    </View>
  );
}

export function NewTicket({ navigation }: Props) {
  const { colors } = useTheme();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { users } = useUserList();

  const isAdmin = user?.role === 'admin';

  async function handleSave() {
    if (!user) return;
    const trimmedTitle = title.trim();
    setLoading(true);
    try {
      const selectedUser = users.find((u) => u.uid === assigneeId);
      await createTicket(
        {
          title: trimmedTitle,
          description: description.trim(),
          priority,
          assigneeId: selectedUser?.uid ?? null,
          assigneeName: selectedUser?.name ?? null,
        },
        user,
      );
      navigation.goBack();
    } catch (err: unknown) {
      toast.show({
        tone: 'danger',
        title: err instanceof Error ? err.message : 'Falha ao criar o chamado.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.flex}>
      <AppBar title="Novo chamado" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <SectionLabel>Classificação</SectionLabel>
          <Select
            label="Prioridade"
            value={priority}
            onValueChange={(v) => setPriority(v as TicketPriority)}
            options={ALL_PRIORITIES.map((p) => ({ label: PRIORITY_LABELS[p], value: p }))}
          />
          <Select
            label="Responsável"
            value={assigneeId}
            onValueChange={(v) => setAssigneeId(v)}
            disabled={!isAdmin}
            hint={isAdmin ? undefined : 'Somente administradores designam responsável'}
            options={[
              { label: 'Não designado', value: '' },
              ...users.map((u) => ({ label: u.name, value: u.uid })),
            ]}
          />

          <SectionLabel>Descrição</SectionLabel>
          <TextField
            label="Título"
            placeholder="Título do chamado"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <TextField
            label="Detalhes"
            placeholder="Descreva o problema..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
          />

          <Text
            style={[styles.metaLine, { fontFamily: monoFontFamily, color: alpha(colors.text, 50) }]}
          >
            status: open · criador: sessão atual · workspace: implícito
          </Text>

          {loading ? <Spinner /> : null}
        </ScrollView>
        <BottomBar>
          <Button
            style={styles.submitButton}
            variant="primary"
            framed
            block
            onPress={handleSave}
            disabled={!title.trim() || loading}
          >
            Salvar chamado
          </Button>
        </BottomBar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
