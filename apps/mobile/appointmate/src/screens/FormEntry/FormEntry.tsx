import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useFieldArray, useForm, type Control } from 'react-hook-form';
import { AppBar, Button, Chip, Spinner, TextField, useTheme, useToast } from '@industry/mobile';
import { alpha, fontFamilyMono, semanticColor } from '@industry/tokens';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { createForm, getFormRecord, updateForm } from '../../services/formsService';
import { mapFirestoreError } from '../../utils/firebaseErrors';
import {
  EMPTY_FORM_VALUES,
  MOOD_OPTIONS,
  formatDateInput,
  isDateOnOrAfterToday,
  type FormStatus,
  type FormValues,
} from '../../domain/form';
import { LoadingView } from '../../components/LoadingView';
import { SectionLabel } from '../../components/SectionLabel';
import { BottomBar } from '../../components/BottomBar';
import { styles } from './FormEntry.styles';
import { DynamicListField } from './DynamicListField';
import { REQUIRED_MESSAGE } from './constants';

const monoFontFamily = Platform.select(fontFamilyMono);

type Props = NativeStackScreenProps<AppStackParamList, 'FormEntry'>;

type TextareaFieldName =
  | 'overallSummary'
  | 'sleep'
  | 'energy'
  | 'appetite'
  | 'concentration'
  | 'medicationAdherence'
  | 'medicationEffects'
  | 'whatWentWell'
  | 'whatHasBeenHard'
  | 'context'
  | 'todayFocus'
  | 'consultationNotes';

function TextareaField({
  control,
  name,
  label,
  testID,
}: {
  control: Control<FormValues>;
  name: TextareaFieldName;
  label: string;
  testID: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: REQUIRED_MESSAGE }}
      render={({ field, fieldState }) => (
        <TextField
          label={label}
          error={fieldState.error?.message}
          multiline
          value={field.value}
          onChangeText={field.onChange}
          testID={testID}
        />
      )}
    />
  );
}

export function FormEntry({ navigation, route }: Props) {
  const formId = route.params?.formId;
  const { user } = useAuth();
  const { colors } = useTheme();
  const toast = useToast();

  const [loadingForm, setLoadingForm] = useState(Boolean(formId));
  const [status, setStatus] = useState<FormStatus>('draft');
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset, getValues } = useForm<FormValues>({
    defaultValues: EMPTY_FORM_VALUES,
  });
  const medicationsArray = useFieldArray({ control, name: 'medications' });
  const questionsArray = useFieldArray({ control, name: 'questions' });

  useEffect(() => {
    if (!formId) return;
    let cancelled = false;

    getFormRecord(formId)
      .then((record) => {
        if (cancelled) return;
        if (record) {
          reset(record.values);
          setStatus(record.status);
        }
        setLoadingForm(false);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.show({
          tone: 'danger',
          title: mapFirestoreError(err, 'Não foi possível carregar o formulário.'),
        });
        setLoadingForm(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formId, reset, toast]);

  const appBar = (
    <AppBar
      title={formId ? 'Editar formulário' : 'Novo formulário'}
      onBackPress={() => navigation.goBack()}
      testID="form-entry-app-bar"
    />
  );

  async function onSave(values: FormValues, status: FormStatus) {
    if (!user) return;
    setSaving(true);
    try {
      let savedFormId = formId;
      if (formId) {
        await updateForm(formId, values, status);
      } else {
        savedFormId = await createForm(user.uid, values, status);
      }
      navigation.replace('FormDetail', { formId: savedFormId! });
    } catch (err) {
      toast.show({
        tone: 'danger',
        title: mapFirestoreError(err, 'Não foi possível salvar o formulário. Tente novamente.'),
      });
    } finally {
      setSaving(false);
    }
  }

  function onSaveDraft() {
    onSave(getValues(), 'draft');
  }

  if (loadingForm) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        {appBar}
        <LoadingView testID="form-entry-loading" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {appBar}
      <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <SectionLabel>Cabeçalho</SectionLabel>
          <View style={styles.fieldRow}>
            <Controller
              control={control}
              name="appointmentDate"
              rules={{
                required: REQUIRED_MESSAGE,
                validate: (value) =>
                  isDateOnOrAfterToday(value) || 'A data não pode ser anterior a hoje',
              }}
              render={({ field, fieldState }) => (
                <TextField
                  style={styles.fieldRowItem}
                  label="Data desta consulta"
                  error={fieldState.error?.message}
                  placeholder="dd/mm/aaaa"
                  value={field.value}
                  onChangeText={(text) => field.onChange(formatDateInput(text))}
                  testID="form-entry-appointment-date-input"
                />
              )}
            />
            <Controller
              control={control}
              name="lastAppointmentDate"
              rules={{ required: REQUIRED_MESSAGE }}
              render={({ field, fieldState }) => (
                <TextField
                  style={styles.fieldRowItem}
                  label="Última consulta foi em"
                  error={fieldState.error?.message}
                  placeholder="dd/mm/aaaa"
                  value={field.value}
                  onChangeText={(text) => field.onChange(formatDateInput(text))}
                  testID="form-entry-last-appointment-date-input"
                />
              )}
            />
          </View>

          <SectionLabel>Panorama geral</SectionLabel>
          <Text style={[styles.sectionPrompt, { color: alpha(colors.text, 70) }]}>
            Como tem se sentido desde a última consulta?
          </Text>

          <Controller
            control={control}
            name="overallMood"
            rules={{ required: REQUIRED_MESSAGE }}
            render={({ field, fieldState }) => (
              <>
                <View style={styles.chipRow}>
                  {MOOD_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      selected={field.value === option.value}
                      onPress={() => field.onChange(option.value)}
                      testID={`form-entry-overall-mood-chip-${option.value}`}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
                {fieldState.error && (
                  <Text
                    style={[styles.errorText, { color: semanticColor.danger }]}
                    testID="form-entry-overall-mood-error"
                  >
                    {fieldState.error.message}
                  </Text>
                )}
              </>
            )}
          />
          <TextareaField
            control={control}
            name="overallSummary"
            label="Em poucas palavras"
            testID="form-entry-overall-summary-input"
          />

          <SectionLabel>No dia a dia</SectionLabel>
          <TextareaField
            control={control}
            name="sleep"
            label="Sono"
            testID="form-entry-sleep-input"
          />
          <TextareaField
            control={control}
            name="energy"
            label="Energia e disposição"
            testID="form-entry-energy-input"
          />
          <TextareaField
            control={control}
            name="appetite"
            label="Apetite e alimentação"
            testID="form-entry-appetite-input"
          />
          <TextareaField
            control={control}
            name="concentration"
            label="Concentração e memória"
            testID="form-entry-concentration-input"
          />

          <SectionLabel
            trailing={
              <Text
                style={[
                  styles.sectionCount,
                  { fontFamily: monoFontFamily, color: alpha(colors.text, 60) },
                ]}
              >
                {medicationsArray.fields.length}{' '}
                {medicationsArray.fields.length === 1 ? 'item' : 'itens'}
              </Text>
            }
          >
            Medicação
          </SectionLabel>
          <DynamicListField
            control={control}
            name="medications"
            fieldArray={medicationsArray}
            itemLabel="Medicamento e dose"
            addLabel="Adicionar medicamento"
            testIdKind="medication"
          />
          <TextareaField
            control={control}
            name="medicationAdherence"
            label="Tenho conseguido tomar como combinado?"
            testID="form-entry-medication-adherence-input"
          />
          <TextareaField
            control={control}
            name="medicationEffects"
            label="Efeitos que percebi (bons e ruins)"
            testID="form-entry-medication-effects-input"
          />

          <SectionLabel>O que foi bem ou melhorou</SectionLabel>
          <TextareaField
            control={control}
            name="whatWentWell"
            label="Conte como foi no último mês"
            testID="form-entry-what-went-well-input"
          />

          <SectionLabel>O que tem sido difícil</SectionLabel>
          <TextareaField
            control={control}
            name="whatHasBeenHard"
            label="Conte como foi no último mês"
            testID="form-entry-what-has-been-hard-input"
          />

          <SectionLabel>Contexto</SectionLabel>
          <TextareaField
            control={control}
            name="context"
            label="Situações importantes desde a última consulta"
            testID="form-entry-context-input"
          />

          <SectionLabel
            trailing={
              <Text
                style={[
                  styles.sectionCount,
                  { fontFamily: monoFontFamily, color: alpha(colors.text, 60) },
                ]}
              >
                {questionsArray.fields.length}{' '}
                {questionsArray.fields.length === 1 ? 'item' : 'itens'}
              </Text>
            }
          >
            Minhas perguntas
          </SectionLabel>
          <DynamicListField
            control={control}
            name="questions"
            fieldArray={questionsArray}
            itemLabel="Pergunta"
            addLabel="Adicionar pergunta"
            testIdKind="question"
          />

          <SectionLabel>Foco do dia</SectionLabel>
          <TextareaField
            control={control}
            name="todayFocus"
            label="O que quero desta consulta"
            testID="form-entry-today-focus-input"
          />

          <SectionLabel>Durante a consulta</SectionLabel>
          <TextareaField
            control={control}
            name="consultationNotes"
            label="Anotações e orientações"
            testID="form-entry-consultation-notes-input"
          />
        </ScrollView>
        {saving ? <Spinner /> : null}
        <BottomBar>
          <Button
            style={styles.bottomBarButton}
            variant="secondary"
            onPress={onSaveDraft}
            disabled={saving || status === 'submitted'}
            testID="form-entry-save-draft-button"
          >
            Salvar rascunho
          </Button>
          <Button
            style={styles.bottomBarButton}
            variant="primary"
            onPress={handleSubmit((values) => onSave(values, 'submitted'))}
            disabled={saving}
            testID="form-entry-submit-button"
          >
            Enviar
          </Button>
        </BottomBar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
