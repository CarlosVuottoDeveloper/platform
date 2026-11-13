// GENERATED FILE — do not edit by hand.
// Authored in scripts/build-tokens.mjs. Re-run `yarn build` after changing it.

export interface GradientToken {
  colors: readonly [string, string];
  angle: number;
}

export type GradientName = 'primary' | 'surface' | 'backdrop';

export const gradient: Record<GradientName, GradientToken> = {
  primary: {
    colors: ['#026fd7', '#02376f'],
    angle: 180,
  },
  surface: {
    colors: ['#162048', '#0E1533'],
    angle: 180,
  },
  backdrop: {
    colors: ['#04254f', '#070B1F'],
    angle: 180,
  },
};

export const glow: Record<'accent', string> = {
  accent: '0px 8px 20px 0px rgba(38, 139, 252, 0.45)',
};
