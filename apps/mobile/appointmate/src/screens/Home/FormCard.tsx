import { Pressable, StyleSheet } from 'react-native';
import { Badge, Card } from '@industry/mobile';
import { space } from '@industry/tokens';
import { formatDate } from '../../domain/form';
import type { FormSummary } from '../../services/formsService';

const STATUS_LABELS: Record<FormSummary['status'], string> = {
  draft: 'Rascunho',
  submitted: 'Salvo',
};

const STATUS_TONES: Record<FormSummary['status'], 'warning' | 'success'> = {
  draft: 'warning',
  submitted: 'success',
};

const styles = StyleSheet.create({
  card: { marginBottom: space[3] },
  badge: { position: 'absolute', top: space[4], right: space[4] },
});

export function FormCard({ form, onPress }: { form: FormSummary; onPress: () => void }) {
  const dateLabel = form.appointmentDate || 'Sem data';
  const filledAt = formatDate(form.createdAt);
  const accessibilityLabel = `Formulário de consulta em ${dateLabel}, ${STATUS_LABELS[form.status].toLowerCase()}`;

  return (
    <Pressable
      onPress={onPress}
      testID={`home-form-card-${form.id}`}
      accessibilityLabel={accessibilityLabel}
    >
      <Card
        style={styles.card}
        kicker="Consulta"
        title={dateLabel}
        meta={filledAt ? `Preenchido em ${filledAt}` : undefined}
      >
        <Badge tone={STATUS_TONES[form.status]} style={styles.badge}>
          {STATUS_LABELS[form.status]}
        </Badge>
      </Card>
    </Pressable>
  );
}
