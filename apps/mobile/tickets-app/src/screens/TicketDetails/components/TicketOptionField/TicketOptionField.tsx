import { View } from 'react-native';
import { Badge, RadioGroup, SegmentedControl, type BadgeTone } from '@industry/mobile';
import { sharedOptionFieldStyles as styles } from '../sharedOptionField.styles';

interface Props<T extends string> {
  value: T;
  editing: boolean;
  draft: T;
  onChangeDraft: (v: T) => void;
  options: readonly T[];
  labels: Record<T, string>;
  tones: Record<T, BadgeTone>;
}

const SEGMENTED_MAX_OPTIONS = 3;

export function TicketOptionField<T extends string>({
  value,
  editing,
  draft,
  onChangeDraft,
  options,
  labels,
  tones,
}: Props<T>) {
  if (editing) {
    const widgetOptions = options.map((o) => ({ value: o, label: labels[o] }));
    return options.length <= SEGMENTED_MAX_OPTIONS ? (
      <SegmentedControl
        options={widgetOptions}
        value={draft}
        onValueChange={(v) => onChangeDraft(v as T)}
      />
    ) : (
      <RadioGroup
        options={widgetOptions}
        value={draft}
        onValueChange={(v) => onChangeDraft(v as T)}
      />
    );
  }

  return (
    <View style={styles.badge}>
      <Badge tone={tones[value]}>{labels[value]}</Badge>
    </View>
  );
}
