import { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppBar,
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  IconButton,
  Menu,
  Skeleton,
  useTheme,
  useToast,
} from '@industry/mobile';
import { accentRamp, alpha, fontFamilyMono } from '@industry/tokens';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { listForms, type FormSummary } from '../../services/formsService';
import { mapFirestoreError } from '../../utils/firebaseErrors';
import {
  DEFAULT_TIME_FILTER,
  TIME_FILTER_PRESETS,
  isWithinTimeFilter,
  type TimeFilter,
} from '../../domain/timeFilter';
import { ErrorView } from '../../components/ErrorView';
import { FormCard } from './FormCard';
import { styles } from './Home.styles';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

const monoFontFamily = Platform.select(fontFamilyMono);

const SELECTABLE_PRESETS = TIME_FILTER_PRESETS.filter((preset) => preset.value !== 'personalizado');

export function Home({ navigation }: Props) {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<TimeFilter>(DEFAULT_TIME_FILTER);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  const loadForms = useCallback(
    (options?: { silent?: boolean }) => {
      if (!user) return;
      if (!options?.silent) setLoading(true);
      listForms(user.uid)
        .then((result) => {
          setForms(result);
          setErrorMessage(null);
        })
        .catch((err) => {
          const message = mapFirestoreError(err, 'Não foi possível carregar seus formulários.');
          setErrorMessage(message);
          if (options?.silent) toast.show({ tone: 'danger', title: message });
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [user, toast],
  );

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadForms({ silent: true });
    });
    return unsubscribe;
  }, [navigation, loadForms]);

  function onFilterMenuOpenChange(open: boolean) {
    setFilterMenuVisible(open);
    if (!open) loadForms({ silent: true });
  }

  const activePresetLabel =
    TIME_FILTER_PRESETS.find((preset) => preset.value === filter.preset)?.label ?? 'Todos';

  const appBar = (
    <AppBar
      title="Meus formulários"
      trailing={
        <Menu
          open={filterMenuVisible}
          onOpenChange={onFilterMenuOpenChange}
          header="Período"
          trigger={
            <IconButton
              icon="ListFilter"
              variant="ghost"
              label="Filtrar por período"
              onPress={() => setFilterMenuVisible(true)}
              testID="home-filter-icon-button"
            />
          }
          items={SELECTABLE_PRESETS.map((preset) => ({
            key: preset.value,
            label: preset.label,
            selected: preset.value === filter.preset,
            onSelect: () => {
              setFilter({ preset: preset.value, customStart: '', customEnd: '' });
            },
          }))}
          testID="home-filter-menu"
        />
      }
      actions={[
        {
          icon: 'LogOut',
          onPress: logout,
          label: 'Sair',
          testID: 'home-logout-button',
        },
      ]}
      testID="home-app-bar"
    />
  );

  const bottomBar = (
    <View
      style={[
        styles.bottomBar,
        {
          borderTopColor: colors.divider,
          backgroundColor: colors.bg,
          paddingBottom: 20 + insets.bottom,
        },
      ]}
    >
      <Button
        variant="primary"
        block
        onPress={() => navigation.navigate('FormEntry', undefined)}
        disabled={loading}
        testID="home-new-form-button"
      >
        Novo formulário
      </Button>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        {appBar}
        <View testID="home-loading" style={styles.loadingContainer}>
          {[0, 1, 2].map((index) => (
            <Card key={index} framed style={styles.skeletonCard}>
              <Skeleton lines={3} />
            </Card>
          ))}
        </View>
        {bottomBar}
      </SafeAreaView>
    );
  }

  if (errorMessage && forms.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        {appBar}
        <ErrorView description={errorMessage} onAction={() => loadForms()} testID="home-error" />
      </SafeAreaView>
    );
  }

  const filteredForms = forms.filter((form) => isWithinTimeFilter(form.createdAt, filter));

  function onRefresh() {
    setRefreshing(true);
    loadForms({ silent: true });
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {appBar}
      <View style={styles.countRow}>
        <Text
          style={[styles.countText, { color: alpha(colors.text, 60), fontFamily: monoFontFamily }]}
        >
          {forms.length} {forms.length === 1 ? 'formulário' : 'formulários'}
        </Text>
        <Badge tone="neutral">{activePresetLabel}</Badge>
      </View>
      <FlatList
        testID="home-list"
        data={filteredForms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FormCard
            form={item}
            onPress={() => navigation.navigate('FormDetail', { formId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            testID="home-refresh-control"
          />
        }
        ListEmptyComponent={
          forms.length === 0 ? (
            <EmptyState
              icon={<Icon name="Calendar" size={30} color={accentRamp['400']} />}
              title="Nenhum formulário ainda"
              body="Os formulários que você preencher para as consultas aparecem aqui, do mais recente para o mais antigo."
              action={
                <Button
                  variant="primary"
                  framed
                  onPress={() => navigation.navigate('FormEntry', undefined)}
                  testID="home-empty-cta-button"
                >
                  Criar o primeiro
                </Button>
              }
              testID="home-empty-state"
            />
          ) : (
            <EmptyState
              title="Nenhum formulário neste período"
              body="Tente outro filtro de tempo."
              testID="home-empty-filtered-state"
            />
          )
        }
      />
      {bottomBar}
    </SafeAreaView>
  );
}
