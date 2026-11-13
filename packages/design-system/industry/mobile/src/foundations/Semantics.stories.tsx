import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { color, success, warning, danger, accentRamp, viz, radii, neutral } from '@industry/tokens';

const meta: Meta = {
  title: 'Foundations/Semantics',
};

export default meta;
type Story = StoryObj;

const accentSubset: [string, string][] = [
  ['200', accentRamp['200']],
  ['300', accentRamp['300']],
  ['400', accentRamp['400']],
  ['700', accentRamp['700']],
  ['900', accentRamp['900']],
];

function RampRow({ label, entries }: { label: string; entries: [string, string][] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1, marginBottom: 1 }}>
      <Text style={{ width: 92, fontSize: 12, color: neutral['400'] }}>{label}</Text>
      {entries.map(([step, hex]) => (
        <View key={step} style={{ flex: 1, height: 40, backgroundColor: hex }} />
      ))}
    </View>
  );
}

export const SemanticRamps: Story = {
  render: () => (
    <View>
      <RampRow label="Success" entries={Object.entries(success)} />
      <RampRow label="Warning" entries={Object.entries(warning)} />
      <RampRow label="Danger" entries={Object.entries(danger)} />
      <RampRow label="Accent" entries={accentSubset} />
    </View>
  ),
};

const BADGES: { label: string; hex: string }[] = [
  { label: 'Draft', hex: color.text },
  { label: 'In review', hex: accentRamp['300'] },
  { label: 'Resolved', hex: success['300'] },
  { label: 'Waiting', hex: warning['300'] },
  { label: 'Overdue', hex: danger['300'] },
];

export const InUse: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
      {BADGES.map(({ label, hex }) => (
        <View
          key={label}
          style={{
            borderRadius: radii.pill,
            backgroundColor: color.surface2,
            paddingVertical: 4,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ fontSize: 12, color: hex }}>{label}</Text>
        </View>
      ))}
    </View>
  ),
};

export const DataVizSeries: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {Object.entries(viz)
        .filter(([key]) => key !== 'grid')
        .map(([key, hex]) => (
          <View key={key} style={{ flex: 1, height: 56, backgroundColor: hex }} />
        ))}
    </View>
  ),
};
