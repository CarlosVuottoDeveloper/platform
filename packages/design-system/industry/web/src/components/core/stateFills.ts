export interface StateFills {
  rest: string;
  hovered: string;
  pressed: string;
}

export function tint(colorVar: string, percent: number) {
  return `color-mix(in srgb, ${colorVar} ${percent}%, transparent)`;
}

export function tintedFills(
  colorVar: string,
  rest: number,
  hovered: number,
  pressed: number,
): StateFills {
  return {
    rest: tint(colorVar, rest),
    hovered: tint(colorVar, hovered),
    pressed: tint(colorVar, pressed),
  };
}

export function resolveFill(fills: StateFills, hovered: boolean, pressed: boolean) {
  return pressed ? fills.pressed : hovered ? fills.hovered : fills.rest;
}

export const TEXT_TINT_FILLS: StateFills = {
  rest: 'transparent',
  hovered: tint('var(--color-text)', 8),
  pressed: tint('var(--color-text)', 14),
};
