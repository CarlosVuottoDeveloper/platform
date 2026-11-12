import { create } from '@storybook/theming/create';
import { accentRamp, color, fontFamily, neutral, radii } from '@industry/tokens';

export const industryTheme = create({
  base: 'dark',
  brandTitle: 'Industry',

  appBg: color.bg,
  appContentBg: color.bg,
  appPreviewBg: color.bg,
  appBorderColor: color.divider,
  appBorderRadius: radii.md,

  barBg: color.surface,
  barTextColor: neutral['400'],
  barSelectedColor: color.accent,
  barHoverColor: color.accent,

  colorPrimary: color.accent,
  colorSecondary: color.accent,
  textColor: color.text,
  textInverseColor: color.bg,
  textMutedColor: neutral['400'],

  inputBg: color.surface2,
  inputBorder: color.controlBorder,
  inputTextColor: color.text,
  inputBorderRadius: radii.sm,

  booleanBg: color.surface2,
  booleanSelectedBg: accentRamp['700'],

  fontBase: `${fontFamily.body}, system-ui, sans-serif`,
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});
