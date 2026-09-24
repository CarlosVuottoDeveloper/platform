import { useEffect, useState } from 'react';
import { Platform, View, Text, Pressable, FlatList, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBar,
  Badge,
  Button,
  Card,
  EmptyState,
  FAB,
  Icon,
  PieChart,
  Sheet,
  Spinner,
  useTheme,
  useToast,
} from '@industry/mobile';
import { accentRamp, alpha, fontFamilyMono, space, viz } from '@industry/tokens';
import { useTicketList } from '../../hooks/useTicketList';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDayMonth } from '../../domain/ticket';
import type { Ticket } from '../../domain/ticket';
import type { TicketStatus } from '../../constants/ticketStatus';
import { ALL_STATUSES, STATUS_LABELS, STATUS_TONES } from '../../constants/ticketStatus';
import { PRIORITY_LABELS, PRIORITY_TONES, isPriorityMaximum } from '../../constants/ticketPriority';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { styles } from './Dashboard.styles';

const monoFontFamily = Platform.select(fontFamilyMono);

const STATUS_VIZ_COLOR: Record<TicketStatus, string> = {
  open: viz['1'],
  in_progress: viz['4'],
  done: viz['3'],
};

type Props = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;

function StatusStatCard({
  status,
  count,
  onPress,
}: {
  status: TicketStatus;
  count: number;
  onPress: () => void;
}) {
  return (
    <View style={styles.statCardWrapper}>
      <Pressable onPress={onPress}>
        <Badge tone={STATUS_TONES[status]}>{`${STATUS_LABELS[status]} · ${count}`}</Badge>
      </Pressable>
    </View>
  );
}

function RecentTicketsCard({
  tickets,
  onPressTicket,
}: {
  tickets: Ticket[];
  onPressTicket: (id: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.recentList}>
      {tickets.slice(0, 3).map((t) => (
        <Pressable key={t.id} onPress={() => onPressTicket(t.id)}>
          <Card framed style={styles.recentItem}>
            <View style={styles.recentHeader}>
              <Text style={[styles.recentTitle, { color: colors.text }]}>{t.title}</Text>
              <Badge tone={PRIORITY_TONES[t.priority]} solid={isPriorityMaximum(t.priority)}>
                {PRIORITY_LABELS[t.priority]}
              </Badge>
            </View>
            <Text style={[styles.recentMeta, { color: alpha(colors.text, 50) }]}>
              {t.creatorName}
              {t.createdAt ? ` · ${formatDayMonth(t.createdAt)}` : ''} ·{' '}
              {t.assigneeName ?? 'não designado'}
            </Text>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}

export function Dashboard({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { tickets, loading, error, clearError } = useTicketList();
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    if (!error) return;
    toast.show({ tone: 'danger', title: error });
    clearError();
  }, [error, toast, clearError]);

  const trailing = (
    <View style={styles.trailingActions}>
      {user?.role === 'admin' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Criar usuário"
          onPress={() => navigation.navigate('CreateUser')}
          hitSlop={8}
          style={styles.trailingIconButton}
        >
          <Icon name="UserPlus" size="md" color={colors.text} />
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sair"
        onPress={() => setLogoutOpen(true)}
        hitSlop={8}
        style={styles.trailingTextButton}
      >
        <Text style={[styles.trailingTextButtonLabel, { color: accentRamp['300'] }]}>Sair</Text>
      </Pressable>
    </View>
  );

  const appBar = <AppBar title="Painel" trailing={trailing} />;

  const logoutSheet = (
    <Sheet
      testID="logout-sheet"
      open={logoutOpen}
      onDismiss={() => setLogoutOpen(false)}
      title="Sair da conta"
      actions={
        <>
          <Button key="cancel" variant="secondary" onPress={() => setLogoutOpen(false)}>
            Cancelar
          </Button>
          <Button key="confirm" variant="danger" onPress={logout}>
            Sair
          </Button>
        </>
      }
    >
      <Text style={{ color: colors.text }}>Tem certeza que deseja sair?</Text>
    </Sheet>
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.flex}>
        {appBar}
        <View style={styles.center}>
          <Spinner />
        </View>
        {logoutSheet}
      </SafeAreaView>
    );
  }

  if (tickets.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.flex}>
        {appBar}
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <View style={styles.center}>
            <EmptyState
              style={styles.emptyState}
              icon={<Icon name="MessageSquare" size={30} color={accentRamp['400']} />}
              title="Nenhum chamado ainda"
              body="Quando alguém do workspace abrir um chamado, ele aparece aqui com o status e a prioridade."
              action={
                <Button variant="primary" framed onPress={() => navigation.navigate('NewTicket')}>
                  Abrir o primeiro
                </Button>
              }
            />
          </View>
          <FAB
            onPress={() => navigation.navigate('NewTicket')}
            style={[styles.fab, { bottom: space[8] + insets.bottom }]}
            label="New ticket"
          />
        </View>
        {logoutSheet}
      </SafeAreaView>
    );
  }

  const total = tickets.length;

  return (
    <SafeAreaView edges={['top']} style={styles.flex}>
      {appBar}
      <View style={[styles.flex, { backgroundColor: colors.bg }]}>
        <ScrollView contentContainerStyle={styles.container}>
          <View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={ALL_STATUSES}
              renderItem={({ item: s }) => (
                <StatusStatCard
                  key={s}
                  status={s}
                  count={tickets.filter((t) => t.status === s).length}
                  onPress={() => navigation.navigate('TicketList', { status: s })}
                />
              )}
              ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
              ListFooterComponent={<View style={styles.listFooterSpacer} />}
            />
          </View>
          <View style={styles.sectionPad}>
            <Pressable
              accessibilityLabel="Ver todos os chamados"
              style={[styles.chartCard, { borderColor: colors.divider }]}
              onPress={() => navigation.navigate('TicketList', {})}
            >
              <PieChart
                size={118}
                legendPlacement="right"
                legendValue="percent"
                centerLabel={
                  <Text
                    style={[
                      styles.chartTotalText,
                      { fontFamily: monoFontFamily, color: colors.text },
                    ]}
                    testID="dashboard-chart-total"
                  >
                    {total}
                  </Text>
                }
                slices={ALL_STATUSES.map((s) => ({
                  label: STATUS_LABELS[s],
                  value: tickets.filter((t) => t.status === s).length,
                  color: STATUS_VIZ_COLOR[s],
                }))}
              />
            </Pressable>
          </View>
          <View style={styles.sectionPad}>
            <View style={styles.sectionLabelRow}>
              <Text style={[styles.sectionLabel, { color: accentRamp['300'] }]}>
                Chamados recentes
              </Text>
              <Text
                style={[
                  styles.sectionLabelCount,
                  { fontFamily: monoFontFamily, color: alpha(colors.text, 50) },
                ]}
              >
                {Math.min(total, 3)}
              </Text>
            </View>
            <View style={[styles.sectionHairline, { backgroundColor: colors.divider }]} />
            <RecentTicketsCard
              tickets={tickets}
              onPressTicket={(id) => navigation.navigate('TicketDetails', { ticketId: id })}
            />
          </View>
        </ScrollView>
        <FAB
          onPress={() => navigation.navigate('NewTicket')}
          style={[styles.fab, { bottom: space[8] + insets.bottom }]}
          label="New ticket"
        />
      </View>
      {logoutSheet}
    </SafeAreaView>
  );
}
