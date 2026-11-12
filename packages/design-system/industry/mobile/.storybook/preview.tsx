import type { Preview, Decorator } from '@storybook/react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { color } from '@industry/tokens';
import { industryTheme } from './theme';

// react-native-svg's WebShape never mounts a real <svg> in this Storybook's
// react-native-web preview (Icon and PieChart render empty) — confirmed not
// to be a react-native-web version issue, and not reproducible in the real
// apps (Metro/Fabric renders SVG normally there). Root cause still open;
// this banner is a stopgap so the gap is visible in every affected story
// instead of silently looking broken. Opt in per story file via
// `parameters: { svgKnownIssue: true }`.
export const withKnownIssueNotes: Decorator = (Story, context) => {
  const hasSvgKnownIssue = Boolean(context.parameters.svgKnownIssue);
  const hasGradientKnownIssue = Boolean(context.parameters.gradientKnownIssue);

  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <View style={{ flex: 1, backgroundColor: color.bg }}>
        {hasSvgKnownIssue && (
          <View style={{ padding: 8, backgroundColor: '#5a3d00' }}>
            <Text style={{ color: '#ffd580', fontSize: 12 }}>
              ⚠️ Usa react-native-svg (Icon/PieChart) — não renderiza neste preview do Storybook.
              Limitação conhecida do react-native-web, não afeta o app real.
            </Text>
          </View>
        )}
        {hasGradientKnownIssue && (
          <View style={{ padding: 8, backgroundColor: '#5a3d00' }}>
            <Text style={{ color: '#ffd580', fontSize: 12 }}>
              ⚠️ O gradiente (experimental_backgroundImage) só renderiza no dispositivo — o
              react-native-web deste preview o ignora e mostra a cor sólida de fallback.
            </Text>
          </View>
        )}
        <Story />
      </View>
    </SafeAreaProvider>
  );
};

const preview: Preview = {
  decorators: [withKnownIssueNotes],
  parameters: {
    backgrounds: {
      default: 'industry',
      values: [{ name: 'industry', value: color.bg }],
    },
    docs: { theme: industryTheme },
  },
};

export default preview;
