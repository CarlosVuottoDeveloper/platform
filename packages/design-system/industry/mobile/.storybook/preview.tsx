import type { Preview, Decorator } from '@storybook/react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { alpha, color, space, warning } from '@industry/tokens';
import { industryTheme } from './theme';

const KNOWN_ISSUE_NOTES: Record<string, string> = {
  svgKnownIssue:
    '⚠️ Usa react-native-svg (Icon/PieChart) — não renderiza neste preview do Storybook. Limitação conhecida do react-native-web, não afeta o app real.',
  gradientKnownIssue:
    '⚠️ O gradiente (experimental_backgroundImage) só renderiza no dispositivo — o react-native-web deste preview o ignora e mostra a cor sólida de fallback.',
};

function KnownIssueBanner({ message }: { message: string }) {
  return (
    <View style={{ padding: space[2], backgroundColor: alpha(warning['400'], 20) }}>
      <Text style={{ color: warning['300'], fontSize: 12 }}>{message}</Text>
    </View>
  );
}

export const withKnownIssueNotes: Decorator = (Story, context) => {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <View style={{ flex: 1, backgroundColor: color.bg }}>
        {Object.entries(KNOWN_ISSUE_NOTES)
          .filter(([parameter]) => Boolean(context.parameters[parameter]))
          .map(([parameter, message]) => (
            <KnownIssueBanner key={parameter} message={message} />
          ))}
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
