import { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  AppBar,
  Badge,
  Button,
  EmptyState,
  IconButton,
  Sheet,
  Spinner,
  useTheme,
  useToast,
} from '@industry/mobile';
import { alpha, fontFamilyMono } from '@industry/tokens';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { deleteForm, getFormRecord, type FormRecord } from '../../services/formsService';
import { mapFirestoreError } from '../../utils/firebaseErrors';
import {
  MOOD_OPTIONS,
  formatDateLong,
  formatDateTimeShort,
  isFormValuesEmpty,
} from '../../domain/form';
import { buildFormHtml } from '../../domain/pdf';
import { LoadingView } from '../../components/LoadingView';
import { ErrorView } from '../../components/ErrorView';
import { SectionLabel } from '../../components/SectionLabel';
import { BottomBar } from '../../components/BottomBar';
import { styles } from './FormDetail.styles';

type Props = NativeStackScreenProps<AppStackParamList, 'FormDetail'>;

const monoFontFamily = Platform.select(fontFamilyMono);

function SummaryCell({
  label,
  value,
  testID,
}: {
  label: string;
  value: string | null | undefined;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.summaryCell, { backgroundColor: colors.bg }]}>
      <Text style={[styles.summaryCellLabel, { color: alpha(colors.text, 50) }]}>{label}</Text>
      <Text style={[styles.summaryCellValue, { color: colors.text }]} testID={testID}>
        {value?.trim() ? value : '—'}
      </Text>
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  if (!value.trim()) return null;
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: alpha(colors.text, 70) }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: alpha(colors.text, 80) }]}>{value}</Text>
    </View>
  );
}

function ListField({
  label,
  items,
  numbered,
}: {
  label: string;
  items: { text: string }[];
  numbered?: boolean;
}) {
  const { colors } = useTheme();
  const filled = items.filter((item) => item.text.trim());
  if (filled.length === 0) return null;
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: alpha(colors.text, 70) }]}>{label}</Text>
      {filled.map((item, index) => (
        <View key={`${index}-${item.text}`} style={styles.listItemRow}>
          <Text
            style={[
              styles.listItemNumber,
              { fontFamily: numbered ? monoFontFamily : undefined, color: alpha(colors.text, 50) },
            ]}
          >
            {numbered ? String(index + 1).padStart(2, '0') : '•'}
          </Text>
          <Text style={[styles.listItem, { color: alpha(colors.text, 80) }]}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

export function FormDetail({ navigation, route }: Props) {
  const { formId } = route.params;
  const { colors } = useTheme();
  const toast = useToast();

  const [record, setRecord] = useState<FormRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getFormRecord(formId)
      .then((result) => {
        if (cancelled) return;
        setRecord(result);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(mapFirestoreError(err, 'Não foi possível carregar o formulário.'));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formId]);

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (event.data.action.type !== 'GO_BACK') return;
        event.preventDefault();
        navigation.popToTop();
      }),
    [navigation],
  );

  async function onExportPdf() {
    setExporting(true);
    try {
      const html = buildFormHtml(record!.values, {
        status: record!.status,
        createdAt: record!.createdAt,
        updatedAt: record!.updatedAt,
      });
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } catch {
      toast.show({ tone: 'danger', title: 'Não foi possível exportar o PDF. Tente novamente.' });
    } finally {
      setExporting(false);
    }
  }

  async function onConfirmDelete() {
    setDeleting(true);
    try {
      await deleteForm(formId);
      setDeleteDialogVisible(false);
      navigation.popToTop();
    } catch (err) {
      toast.show({
        tone: 'danger',
        title: mapFirestoreError(err, 'Não foi possível excluir o formulário. Tente novamente.'),
      });
      setDeleteDialogVisible(false);
    } finally {
      setDeleting(false);
    }
  }

  const appBar = (
    <AppBar
      title="Formulário"
      onBackPress={() => navigation.popToTop()}
      trailing={
        record ? (
          <Badge
            tone={record.status === 'submitted' ? 'success' : 'warning'}
            style={styles.statusBadge}
            testID="form-detail-status-badge"
          >
            {record.status === 'submitted' ? 'Salvo' : 'Rascunho'}
          </Badge>
        ) : undefined
      }
      testID="form-detail-app-bar"
    />
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        {appBar}
        <LoadingView testID="form-detail-loading" />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        {appBar}
        <ErrorView description={errorMessage} testID="form-detail-error" />
      </SafeAreaView>
    );
  }

  if (!record) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        {appBar}
        <EmptyState
          title="Formulário não encontrado"
          body="Este formulário pode ter sido removido."
          testID="form-detail-not-found"
        />
      </SafeAreaView>
    );
  }

  const { values } = record;
  const dateHeading = formatDateLong(values.appointmentDate);
  const updatedAtLabel =
    formatDateTimeShort(record.updatedAt) ?? formatDateTimeShort(record.createdAt);
  const moodLabel = MOOD_OPTIONS.find((option) => option.value === values.overallMood)?.label;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {appBar}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleBlock}>
          <Text style={[styles.kicker, { color: alpha(colors.text, 50) }]}>Consulta</Text>
          {dateHeading && (
            <Text style={[styles.heading, { color: colors.text }]}>{dateHeading}</Text>
          )}
          {updatedAtLabel && (
            <Text
              style={[
                styles.updatedAt,
                { fontFamily: monoFontFamily, color: alpha(colors.text, 50) },
              ]}
              testID="form-detail-updated-at"
            >
              Última atualização em {updatedAtLabel}
            </Text>
          )}
        </View>

        {isFormValuesEmpty(values) ? (
          <EmptyState
            title="Nenhuma resposta registrada"
            body="Este formulário ainda não tem respostas preenchidas."
            testID="form-detail-empty-state"
          />
        ) : (
          <>
            <View style={[styles.summaryGrid, { backgroundColor: colors.divider }]}>
              <View style={styles.summaryRow}>
                <SummaryCell label="Humor" value={moodLabel} testID="form-detail-overall-mood" />
                <SummaryCell label="Sono" value={values.sleep} />
              </View>
              <View style={styles.summaryRow}>
                <SummaryCell label="Energia" value={values.energy} />
                <SummaryCell label="Apetite" value={values.appetite} />
              </View>
            </View>

            <Field label="Última consulta foi em" value={values.lastAppointmentDate} />
            <Field label="Em poucas palavras" value={values.overallSummary} />
            <Field label="Concentração e memória" value={values.concentration} />

            <SectionLabel>Medicação</SectionLabel>
            <ListField label="Medicamentos e doses" items={values.medications} />
            <Field
              label="Tenho conseguido tomar como combinado?"
              value={values.medicationAdherence}
            />
            <Field label="Efeitos que percebi (bons e ruins)" value={values.medicationEffects} />

            <SectionLabel>O que foi bem ou melhorou</SectionLabel>
            <Field label="O que foi bem ou melhorou" value={values.whatWentWell} />

            <SectionLabel>O que tem sido difícil</SectionLabel>
            <Field label="O que tem sido difícil" value={values.whatHasBeenHard} />

            <SectionLabel>Contexto</SectionLabel>
            <Field label="Situações importantes desde a última consulta" value={values.context} />

            <SectionLabel>Perguntas para o médico</SectionLabel>
            <ListField label="Perguntas" items={values.questions} numbered />

            <SectionLabel>Foco do dia</SectionLabel>
            <Field label="O que quero desta consulta" value={values.todayFocus} />

            <SectionLabel>Durante a consulta</SectionLabel>
            <Field label="Anotações e orientações" value={values.consultationNotes} />
          </>
        )}
      </ScrollView>

      {exporting ? <Spinner /> : null}
      <BottomBar>
        <Button
          style={styles.bottomBarPrimary}
          variant="primary"
          framed
          onPress={() => navigation.navigate('FormEntry', { formId })}
          disabled={record.status === 'submitted'}
          testID="form-detail-edit-button"
        >
          Editar
        </Button>
        <Button
          style={styles.bottomBarSecondary}
          variant="secondary"
          onPress={onExportPdf}
          disabled={exporting}
          testID="form-detail-export-pdf-button"
        >
          Exportar PDF
        </Button>
        <IconButton
          icon="Trash2"
          variant="danger"
          label="Excluir"
          onPress={() => setDeleteDialogVisible(true)}
          testID="form-detail-delete-button"
        />
      </BottomBar>

      <Sheet
        testID="form-detail-delete-dialog"
        open={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        title="Excluir formulário"
        actions={
          <>
            <Button
              variant="ghost"
              onPress={() => setDeleteDialogVisible(false)}
              testID="form-detail-delete-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onPress={onConfirmDelete}
              disabled={deleting}
              testID="form-detail-delete-confirm-button"
            >
              Excluir
            </Button>
          </>
        }
      >
        <Text style={{ color: colors.text }}>
          Tem certeza que deseja excluir este formulário? Essa ação não pode ser desfeita.
        </Text>
      </Sheet>
    </SafeAreaView>
  );
}
