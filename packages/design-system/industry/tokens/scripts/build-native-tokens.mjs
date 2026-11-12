// These color values mirror src/tokens/colors.css by hand — this script does not
// parse the CSS. Keep the two in sync manually whenever one changes.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatHex, oklch, wcagContrast } from 'culori';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src', 'native');
mkdirSync(outDir, { recursive: true });

function hex(l, c, h) {
  return formatHex(oklch({ mode: 'oklch', l, c, h }));
}

function assertContrast(foreground, background, minimum, label) {
  const ratio = wcagContrast(foreground, background);
  if (ratio < minimum) {
    throw new Error(`${label}: contrast ${ratio.toFixed(2)} is below ${minimum}`);
  }
}

function alpha(hexColor, percent) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${(percent / 100).toFixed(2)})`;
}

const steps = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const rampL = {
  100: 0.95,
  200: 0.88,
  300: 0.8,
  400: 0.72,
  500: 0.64,
  600: 0.55,
  700: 0.45,
  800: 0.34,
  900: 0.24,
};
const accentC = {
  100: 0.05,
  200: 0.09,
  300: 0.13,
  400: 0.17,
  500: 0.19,
  600: 0.18,
  700: 0.15,
  800: 0.11,
  900: 0.075,
};
const accent2C = {
  100: 0.03,
  200: 0.06,
  300: 0.1,
  400: 0.13,
  500: 0.12,
  600: 0.1,
  700: 0.08,
  800: 0.06,
  900: 0.04,
};

const neutral = Object.fromEntries(steps.map((s) => [s, hex(rampL[s], 0.03, 265)]));
const accentRamp = Object.fromEntries(steps.map((s) => [s, hex(rampL[s], accentC[s], 255)]));
const accent2Ramp = Object.fromEntries(steps.map((s) => [s, hex(rampL[s], accent2C[s], 205)]));

const text = '#F2F5FA';
const color = {
  bg: '#070B1F',
  surface: '#0E1533',
  surface2: '#162048',
  text,
  accent: accentRamp[400],
  accent2: accent2Ramp[400],
  divider: alpha(text, 8),
  dividerStrong: alpha(text, 16),
};

const success = {
  200: hex(0.88, 0.07, 158),
  300: hex(0.8, 0.11, 158),
  400: hex(0.72, 0.14, 158),
  700: hex(0.45, 0.12, 158),
  900: hex(0.24, 0.06, 158),
};
const warning = {
  200: hex(0.88, 0.09, 82),
  300: hex(0.8, 0.14, 82),
  400: hex(0.76, 0.17, 82),
  700: hex(0.45, 0.13, 82),
  900: hex(0.24, 0.07, 82),
};
const danger = {
  200: hex(0.88, 0.08, 28),
  300: hex(0.8, 0.13, 28),
  400: hex(0.72, 0.18, 28),
  700: hex(0.45, 0.16, 28),
  900: hex(0.24, 0.09, 28),
};

const semanticColor = {
  success: success[400],
  warning: warning[400],
  danger: danger[400],
  info: accent2Ramp[400],
};

const viz = {
  1: hex(0.72, 0.14, 250),
  2: hex(0.72, 0.14, 205),
  3: hex(0.72, 0.14, 160),
  4: hex(0.72, 0.14, 95),
  5: hex(0.72, 0.14, 35),
  6: hex(0.72, 0.14, 305),
  grid: alpha(text, 10),
};

assertContrast(color.text, color.bg, 4.5, 'text on bg');
assertContrast(color.text, color.surface, 4.5, 'text on surface');
assertContrast(color.text, color.surface2, 4.5, 'text on surface2');
assertContrast(neutral[400], color.bg, 4.5, 'neutral-400 on bg');
assertContrast(neutral[400], color.surface, 4.5, 'neutral-400 on surface');
assertContrast(accentRamp[300], color.bg, 4.5, 'accent-300 on bg');
assertContrast(accentRamp[300], color.surface, 4.5, 'accent-300 on surface');
assertContrast(success[300], color.surface, 4.5, 'success-300 on surface');
assertContrast(warning[300], color.surface, 4.5, 'warning-300 on surface');
assertContrast(danger[300], color.surface, 4.5, 'danger-300 on surface');
assertContrast(accentRamp[400], color.bg, 3, 'accent-400 on bg');

const output = `// GENERATED FILE — do not edit by hand.
// Resolved from tokens/colors.css by scripts/build-native-tokens.mjs.
// Re-run \`yarn build\` after changing colors.css to regenerate this file.

export const color = ${JSON.stringify(color, null, 2)} as const;

export const neutral = ${JSON.stringify(neutral, null, 2)} as const;

export const accentRamp = ${JSON.stringify(accentRamp, null, 2)} as const;

export const accent2Ramp = ${JSON.stringify(accent2Ramp, null, 2)} as const;

export const success = ${JSON.stringify(success, null, 2)} as const;

export const warning = ${JSON.stringify(warning, null, 2)} as const;

export const danger = ${JSON.stringify(danger, null, 2)} as const;

export const semanticColor = ${JSON.stringify(semanticColor, null, 2)} as const;

export const viz = ${JSON.stringify(viz, null, 2)} as const;
`;

writeFileSync(join(outDir, 'colors.generated.ts'), output);
