import {
  FIELD_ERROR_STYLE,
  FIELD_HINT_STYLE,
  FIELD_LABEL_STYLE,
  resolveFieldFrameStyle,
} from './fieldFrame';

describe('resolveFieldFrameStyle', () => {
  it('fills the field on the surface with the medium radius and a control border', () => {
    expect(resolveFieldFrameStyle({})).toEqual({
      background: 'var(--color-surface)',
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 'var(--radius-md)',
      borderColor: 'var(--color-control-border)',
      opacity: 1,
    });
  });

  it('lifts the border on hover', () => {
    expect(resolveFieldFrameStyle({ hovered: true }).borderColor).toBe('var(--color-neutral-500)');
  });

  it('uses the accent border while focused', () => {
    expect(resolveFieldFrameStyle({ focused: true, hovered: true }).borderColor).toBe(
      'var(--color-accent)',
    );
  });

  it('uses the danger border when invalid, even while focused', () => {
    expect(resolveFieldFrameStyle({ invalid: true, focused: true }).borderColor).toBe(
      'var(--color-danger)',
    );
  });

  it('ignores hover while disabled', () => {
    expect(resolveFieldFrameStyle({ hovered: true, disabled: true }).borderColor).toBe(
      'var(--color-control-border)',
    );
  });

  it('dims a disabled field', () => {
    expect(resolveFieldFrameStyle({ disabled: true }).opacity).toBe(0.45);
  });
});

describe('field text styles', () => {
  it('shares the label, hint and error text styles', () => {
    expect(FIELD_LABEL_STYLE).toEqual({
      fontSize: 'var(--text-h6)',
      color: 'color-mix(in srgb, var(--color-text) 70%, transparent)',
    });
    expect(FIELD_HINT_STYLE).toEqual({
      fontSize: 12,
      color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
    });
    expect(FIELD_ERROR_STYLE).toEqual({ fontSize: 12, color: 'var(--color-danger-300)' });
  });
});
