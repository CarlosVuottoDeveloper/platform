import { useEffect } from 'react';
import { Platform, View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBar, Button, EmptyState, Icon, Spinner, useTheme, useToast } from '@industry/mobile';
import { accentRamp, alpha, fontFamilyMono } from '@industry/tokens';
import { useTicketList } from '../../hooks/useTicketList';
import { useAuthStore } from '../../store/useAuthStore';
import { STATUS_LABELS, STATUS_PLURAL_LABELS } from '../../constants/ticketStatus';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { styles } from './TicketList.styles';
import { TicketCard } from './components/TicketCard';

const monoFontFamily = Platform.select(fontFamilyMono);

type Props = NativeStackScreenProps<AppStackParamList, 'TicketList'>;

export function TicketList({ route, navigation }: Props) {
  const { colors } = useTheme();
  const toast = useToast();
  const { status } = route.params;
  const { tickets, loading, error, clearError } = useTicketList(status);
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');

  useEffect(() => {
    if (!error) return;
    toast.show({ tone: 'danger', title: error });
    clearError();
  }, [error, toast, clearError]);

  const appBar = (
    <AppBar
      title={status ? STATUS_LABELS[status] : 'Todos os chamados'}
      onBackPress={() => navigation.goBack()}
    />
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.flex}>
        {appBar}
        <View style={styles.center}>
          <Spinner />
        </View>
      </SafeAreaView>
    );
  }

  const statusPlural = status ? STATUS_PLURAL_LABELS[status] : null;

  return (
    <SafeAreaView edges={['top']} style={styles.flex}>
      {appBar}
      <View style={[styles.scopeRow, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.scopeCount, { fontFamily: monoFontFamily, color: colors.text }]}>
          {tickets.length} {tickets.length === 1 ? 'chamado' : 'chamados'}
        </Text>
        <View
          style={
            isAdmin
              ? [styles.scopeTag, styles.scopeTagOutline, { borderColor: colors.accent }]
              : [styles.scopeTag, { backgroundColor: colors.surface2 }]
          }
          testID="ticket-list-scope-tag"
        >
          <Text
            style={[
              styles.scopeTagText,
              { color: isAdmin ? colors.accent : alpha(colors.text, 70) },
            ]}
          >
            {isAdmin ? 'Admin · workspace todo' : 'Padrão · meus chamados'}
          </Text>
        </View>
      </View>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.ticketItem}>
              <TicketCard
                title={item.title}
                priority={item.priority}
                creatorName={item.creatorName}
                createdAt={item.createdAt}
                assigneeName={item.assigneeName}
                onPress={() => navigation.replace('TicketDetails', { ticketId: item.id })}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <EmptyState
                icon={<Icon name="Plus" size={30} color={accentRamp['400']} />}
                title="Nada com este status"
                body={
                  statusPlural
                    ? `Você não tem chamados ${statusPlural}. O filtro vem da Dashboard e pode ser trocado voltando para lá.`
                    : 'Nenhum ticket encontrado.'
                }
                action={
                  <Button variant="secondary" onPress={() => navigation.navigate('Dashboard')}>
                    Voltar ao painel
                  </Button>
                }
              />
            </View>
          }
          contentContainerStyle={tickets.length === 0 ? styles.fillHeight : styles.list}
        />
      </View>
    </SafeAreaView>
  );
}
