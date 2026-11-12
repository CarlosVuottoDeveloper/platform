import { color, fontFamily, radii } from '@industry/tokens';
import { industryTheme } from './theme';

describe('industryTheme', () => {
  it('takes colors, radii and font family from the tokens', () => {
    expect(industryTheme).toMatchObject({
      appBg: color.bg,
      barBg: color.surface,
      colorPrimary: color.accent,
      appBorderRadius: radii.md,
      inputBorderRadius: radii.sm,
      inputBorder: color.controlBorder,
    });
    expect(industryTheme.fontBase).toContain(fontFamily.body);
  });
});
