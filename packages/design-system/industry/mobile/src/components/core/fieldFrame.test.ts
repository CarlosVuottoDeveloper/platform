import { color, radii, semanticColor } from '@industry/tokens';
import { resolveFieldFrameStyle } from './fieldFrame';

describe('resolveFieldFrameStyle', () => {
  it('outlines a resting field with the control border on a rounded surface', () => {
    expect(resolveFieldFrameStyle({})).toMatchObject({
      backgroundColor: color.surface,
      borderWidth: 1,
      borderRadius: radii.md,
      borderColor: color.controlBorder,
      opacity: 1,
    });
  });

  it('uses the accent border when focused', () => {
    expect(resolveFieldFrameStyle({ focused: true }).borderColor).toBe(color.accent);
  });

  it('lets an invalid state win over focus', () => {
    expect(resolveFieldFrameStyle({ focused: true, invalid: true }).borderColor).toBe(
      semanticColor.danger,
    );
  });

  it('dims a disabled field', () => {
    expect(resolveFieldFrameStyle({ disabled: true }).opacity).toBe(0.45);
  });
});
