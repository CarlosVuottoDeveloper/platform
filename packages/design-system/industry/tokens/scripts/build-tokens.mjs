import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatHex, oklch, wcagContrast } from 'culori';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nativeDir = join(root, 'src', 'native');
const cssDir = join(root, 'src', 'tokens');
mkdirSync(nativeDir, { recursive: true });
mkdirSync(cssDir, { recursive: true });

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

function rampSpec(chroma, hue) {
  return Object.fromEntries(steps.map((s) => [s, { l: rampL[s], c: chroma[s], h: hue }]));
}

const neutralSpec = rampSpec(Object.fromEntries(steps.map((s) => [s, 0.03])), 265);
const accentSpec = rampSpec(
  {
    100: 0.05,
    200: 0.09,
    300: 0.13,
    400: 0.17,
    500: 0.19,
    600: 0.18,
    700: 0.15,
    800: 0.11,
    900: 0.075,
  },
  255,
);
const accent2Spec = rampSpec(
  {
    100: 0.03,
    200: 0.06,
    300: 0.1,
    400: 0.13,
    500: 0.12,
    600: 0.1,
    700: 0.08,
    800: 0.06,
    900: 0.04,
  },
  205,
);
const successSpec = {
  200: { l: 0.88, c: 0.07, h: 158 },
  300: { l: 0.8, c: 0.11, h: 158 },
  400: { l: 0.72, c: 0.14, h: 158 },
  700: { l: 0.45, c: 0.12, h: 158 },
  900: { l: 0.24, c: 0.06, h: 158 },
};
const warningSpec = {
  200: { l: 0.88, c: 0.09, h: 82 },
  300: { l: 0.8, c: 0.14, h: 82 },
  400: { l: 0.76, c: 0.17, h: 82 },
  700: { l: 0.45, c: 0.13, h: 82 },
  900: { l: 0.24, c: 0.07, h: 82 },
};
const dangerSpec = {
  200: { l: 0.88, c: 0.08, h: 28 },
  300: { l: 0.8, c: 0.13, h: 28 },
  400: { l: 0.72, c: 0.18, h: 28 },
  700: { l: 0.45, c: 0.16, h: 28 },
  900: { l: 0.24, c: 0.09, h: 28 },
};
const vizHues = { 1: 250, 2: 205, 3: 160, 4: 95, 5: 35, 6: 305 };

function resolveRamp(spec) {
  return Object.fromEntries(
    Object.entries(spec).map(([step, { l, c, h }]) => [step, hex(l, c, h)]),
  );
}

function oklchCss({ l, c, h }) {
  return `oklch(${l} ${c} ${h})`;
}

const neutral = resolveRamp(neutralSpec);
const accentRamp = resolveRamp(accentSpec);
const accent2Ramp = resolveRamp(accent2Spec);
const success = resolveRamp(successSpec);
const warning = resolveRamp(warningSpec);
const danger = resolveRamp(dangerSpec);

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
  controlBorder: neutral[600],
};

const semanticColor = {
  success: success[400],
  warning: warning[400],
  danger: danger[400],
  info: accent2Ramp[400],
};

const viz = {
  ...Object.fromEntries(Object.entries(vizHues).map(([n, h]) => [n, hex(0.72, 0.14, h)])),
  grid: alpha(text, 10),
};

function mixOver(foregroundHex, percent, backgroundHex) {
  const channel = (index) => {
    const fg = parseInt(foregroundHex.slice(index, index + 2), 16);
    const bg = parseInt(backgroundHex.slice(index, index + 2), 16);
    return Math.round((fg * percent + bg * (100 - percent)) / 100);
  };
  return `#${[1, 3, 5].map((i) => channel(i).toString(16).padStart(2, '0')).join('')}`;
}

const rampSources = {
  accent: { values: accentRamp, cssPrefix: 'color-accent' },
  accent2: { values: accent2Ramp, cssPrefix: 'color-accent-2' },
  neutral: { values: neutral, cssPrefix: 'color-neutral' },
};
const colorCssNames = { bg: 'color-bg', surface: 'color-surface', surface2: 'color-surface-2' };

const rampStop = (ramp, step) => ({
  hex: rampSources[ramp].values[step],
  css: `var(--${rampSources[ramp].cssPrefix}-${step})`,
});
const colorStop = (name) => ({ hex: color[name], css: `var(--${colorCssNames[name]})` });
const mixStop = (foreground, percent, background) => ({
  hex: mixOver(foreground.hex, percent, background.hex),
  css: `color-mix(in srgb, ${foreground.css} ${percent}%, ${background.css})`,
});

const gradientDefinitions = {
  primary: { from: rampStop('accent', 600), to: rampStop('accent', 800), angle: 180 },
  surface: { from: colorStop('surface2'), to: colorStop('surface'), angle: 180 },
  backdrop: {
    from: mixStop(rampStop('accent', 800), 60, colorStop('bg')),
    to: colorStop('bg'),
    angle: 180,
  },
};

const gradient = Object.fromEntries(
  Object.entries(gradientDefinitions).map(([name, { from, to, angle }]) => [
    name,
    { colors: [from.hex, to.hex], angle },
  ]),
);

const glowDefinition = {
  accent: { offsetX: 0, offsetY: 8, blur: 20, spread: 0, tint: rampStop('accent', 500), alpha: 45 },
};

const glow = Object.fromEntries(
  Object.entries(glowDefinition).map(([name, d]) => [
    name,
    `${d.offsetX}px ${d.offsetY}px ${d.blur}px ${d.spread}px ${alpha(d.tint.hex, d.alpha)}`,
  ]),
);

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
assertContrast(color.controlBorder, color.bg, 3, 'control-border on bg');
assertContrast(color.controlBorder, color.surface, 3, 'control-border on surface');
assertContrast(color.controlBorder, color.surface2, 3, 'control-border on surface2');
gradient.primary.colors.forEach((stop, index) =>
  assertContrast(color.text, stop, 4.5, `text on gradient-primary stop ${index + 1}`),
);
gradient.surface.colors.forEach((stop, index) =>
  assertContrast(color.text, stop, 4.5, `text on gradient-surface stop ${index + 1}`),
);

const nativeHeader = `// GENERATED FILE — do not edit by hand.
// Authored in scripts/build-tokens.mjs. Re-run \`yarn build\` after changing it.
`;

const colorsTs = `${nativeHeader}
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

const effectsTs = `${nativeHeader}
export interface GradientToken {
  colors: readonly [string, string];
  angle: number;
}

export type GradientName = 'primary' | 'surface' | 'backdrop';

export const gradient: Record<GradientName, GradientToken> = ${JSON.stringify(gradient, null, 2)};

export const glow: Record<'accent', string> = ${JSON.stringify(glow, null, 2)};
`;

const cssHeader = `/* GENERATED FILE — do not edit by hand. Authored in scripts/build-tokens.mjs. */`;

function cssVars(prefix, spec) {
  return Object.entries(spec)
    .map(([step, value]) => `  --${prefix}-${step}: ${oklchCss(value)};`)
    .join('\n');
}

const cssHex = (value) => value.toLowerCase();

const colorsCss = `${cssHeader}
:root {
  color-scheme: dark;

  --color-bg: ${cssHex(color.bg)};
  --color-surface: ${cssHex(color.surface)};
  --color-surface-2: ${cssHex(color.surface2)};
  --color-text: ${cssHex(color.text)};
  --color-accent: var(--color-accent-400);
  --color-accent-2: var(--color-accent-2-400);
  --color-divider: color-mix(in srgb, ${cssHex(text)} 8%, transparent);
  --color-divider-strong: color-mix(in srgb, ${cssHex(text)} 16%, transparent);
  --color-control-border: var(--color-neutral-600);

${cssVars('color-neutral', neutralSpec)}

${cssVars('color-accent', accentSpec)}

${cssVars('color-accent-2', accent2Spec)}

${cssVars('color-success', successSpec)}
${cssVars('color-warning', warningSpec)}
${cssVars('color-danger', dangerSpec)}
  --color-success: var(--color-success-400);
  --color-warning: var(--color-warning-400);
  --color-danger: var(--color-danger-400);
  --color-info: var(--color-accent-2-400);

${Object.entries(vizHues)
  .map(([n, h]) => `  --viz-${n}: ${oklchCss({ l: 0.72, c: 0.14, h })};`)
  .join('\n')}
  --viz-grid: color-mix(in srgb, var(--color-text) 10%, transparent);
}
`;

const gradientCssLines = Object.entries(gradientDefinitions).flatMap(
  ([name, { from, to, angle }]) => [
    `  --gradient-${name}-start: ${from.css};`,
    `  --gradient-${name}-end: ${to.css};`,
    `  --gradient-${name}: linear-gradient(${angle}deg, var(--gradient-${name}-start), var(--gradient-${name}-end));`,
  ],
);
const glowCssLines = Object.entries(glow).map(([name, value]) => `  --glow-${name}: ${value};`);

const gradientsCss = `${cssHeader}
:root {
${[...gradientCssLines, ...glowCssLines].join('\n')}
}
`;

writeFileSync(join(nativeDir, 'colors.generated.ts'), colorsTs);
writeFileSync(join(nativeDir, 'effects.generated.ts'), effectsTs);
writeFileSync(join(cssDir, 'colors.css'), colorsCss);
writeFileSync(join(cssDir, 'gradients.css'), gradientsCss);
