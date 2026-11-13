import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text, View } from 'react-native';
import { accentRamp, alpha, color, control, danger, glow, neutral, radii } from '@industry/tokens';
import type { ComponentProps } from 'react';
import { Button } from './Button';
import { PRIMARY_ACTION_FILL } from './PrimaryActionSurface';

const grant = {
  nativeEvent: { touches: [], changedTouches: [], timestamp: 0 },
  persist: jest.fn(),
};

describe('Button', () => {
  it('renders string children wrapped in Text', () => {
    const { getByText } = render(<Button>Save</Button>);
    expect(getByText('Save')).toBeTruthy();
  });

  it('renders non-string children without wrapping them in Text', () => {
    const { getByTestId, UNSAFE_queryAllByType } = render(
      <Button>
        <View testID="icon-child" />
      </Button>,
    );
    expect(getByTestId('icon-child')).toBeTruthy();
    expect(UNSAFE_queryAllByType(Text)).toHaveLength(0);
  });

  it('sets accessibilityState.disabled when disabled', () => {
    const { getByTestId } = render(<Button disabled>Save</Button>);
    expect(getByTestId('button-root').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  it('renders the primary skin on a gradient surface with the accent glow', () => {
    const { getByTestId } = render(<Button variant="primary">Save</Button>);
    const surface = StyleSheet.flatten(getByTestId('button-surface').props.style);

    expect(surface.boxShadow).toBe(glow.accent);
    expect(surface.borderRadius).toBe(radii.pill);
    expect(StyleSheet.flatten(getByTestId('button-root').props.style).borderRadius).toBe(
      radii.pill,
    );
  });

  it('uses the regular text colour on the primary gradient', () => {
    const { getByText } = render(<Button variant="primary">Save</Button>);
    expect(StyleSheet.flatten(getByText('Save').props.style).color).toBe(color.text);
  });

  it('shows no glow when a primary button is disabled', () => {
    const { getByTestId } = render(
      <Button variant="primary" disabled>
        Salvar
      </Button>,
    );
    expect(StyleSheet.flatten(getByTestId('button-surface').props.style).boxShadow).toBeUndefined();
  });

  it('dims the primary surface while pressed', () => {
    const { getByTestId } = render(<Button variant="primary">Save</Button>);
    expect(StyleSheet.flatten(getByTestId('button-surface').props.style).opacity).toBe(1);

    fireEvent(getByTestId('button-root'), 'responderGrant', grant);

    expect(StyleSheet.flatten(getByTestId('button-surface').props.style).opacity).toBe(0.85);
  });

  it('draws no gradient and no glow when a primary button is selected', () => {
    const { queryByTestId } = render(
      <Button variant="primary" selected>
        Admin
      </Button>,
    );
    expect(queryByTestId('button-surface')).toBeNull();
  });

  it('caps a long label at two lines inside the pill', () => {
    const { getByText } = render(<Button>{'a'.repeat(200)}</Button>);
    expect(getByText('a'.repeat(200)).props.numberOfLines).toBe(2);
  });

  it.each([
    ['md' as const, control.height],
    ['sm' as const, control.heightSm],
  ])('uses a pill with the %s control height', (size, height) => {
    const { getByTestId } = render(<Button size={size}>Save</Button>);
    expect(StyleSheet.flatten(getByTestId('button-root').props.style)).toMatchObject({
      borderRadius: radii.pill,
      minHeight: height,
    });
  });

  it('fills the secondary variant with surface2 and a soft border', () => {
    const { getByTestId } = render(<Button>Save</Button>);
    expect(StyleSheet.flatten(getByTestId('button-root').props.style)).toMatchObject({
      backgroundColor: color.surface2,
      borderColor: alpha(color.text, 10),
    });
  });

  it('keeps the ghost variant transparent with accent text', () => {
    const { getByTestId, getByText } = render(<Button variant="ghost">Save</Button>);
    expect(StyleSheet.flatten(getByTestId('button-root').props.style).backgroundColor).toBe(
      'transparent',
    );
    expect(StyleSheet.flatten(getByText('Save').props.style).color).toBe(accentRamp['300']);
  });

  it('tints the danger variant instead of outlining it', () => {
    const { getByTestId, getByText } = render(<Button variant="danger">Delete</Button>);
    expect(StyleSheet.flatten(getByTestId('button-root').props.style).backgroundColor).toBe(
      alpha(danger['400'], 16),
    );
    expect(StyleSheet.flatten(getByText('Delete').props.style).color).toBe(danger['300']);
  });

  it('keeps the primary box the same size as the secondary by trading its border for padding', () => {
    const boxOf = (props: Partial<ComponentProps<typeof Button>>) => {
      const { getByTestId, unmount } = render(<Button {...props}>Save</Button>);
      const style = StyleSheet.flatten(getByTestId('button-root').props.style);
      unmount();
      return style;
    };
    for (const size of ['md', 'sm'] as const) {
      const secondary = boxOf({ size });
      const primary = boxOf({ variant: 'primary', size });
      expect(primary.borderWidth).toBe(0);
      expect(primary.paddingHorizontal).toBe(Number(secondary.paddingHorizontal) + 1);
      expect(primary.minHeight).toBe(secondary.minHeight);
    }
    expect(boxOf({ variant: 'primary', selected: true }).borderWidth).toBe(1);
  });

  it('fills the pressed secondary with a tone that no surface container shares', () => {
    const { getByTestId } = render(<Button>Save</Button>);
    fireEvent(getByTestId('button-root'), 'responderGrant', grant);
    const { backgroundColor } = StyleSheet.flatten(getByTestId('button-root').props.style);
    expect(backgroundColor).toBe(neutral['800']);
    expect([color.bg, color.surface, color.surface2]).not.toContain(backgroundColor);
  });

  it('keeps an opaque base fill under the primary gradient', () => {
    const { getByTestId } = render(<Button variant="primary">Save</Button>);
    expect(StyleSheet.flatten(getByTestId('button-root').props.style).backgroundColor).toBe(
      PRIMARY_ACTION_FILL,
    );
  });

  it('dims a disabled button', () => {
    const { getByTestId } = render(<Button disabled>Save</Button>);
    expect(StyleSheet.flatten(getByTestId('button-root').props.style).opacity).toBe(0.45);
  });

  it('exposes the selected state to assistive tech', () => {
    const { getByRole } = render(<Button selected>Admin</Button>);
    expect(getByRole('button').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('highlights the border and background when selected', () => {
    const { getByTestId } = render(<Button selected>Admin</Button>);
    expect(getByTestId('button-root').props.style).toContainEqual(
      expect.objectContaining({
        borderColor: accentRamp['400'],
        backgroundColor: alpha(color.accent, 16),
      }),
    );
  });

  it('uses the regular label colour when selected, even for the primary variant', () => {
    const { getByText } = render(
      <Button variant="primary" selected>
        Admin
      </Button>,
    );
    expect(StyleSheet.flatten(getByText('Admin').props.style).color).toBe(color.text);
  });

  it('gives the selected skin its own pressed state', () => {
    const { getByTestId } = render(<Button selected>Admin</Button>);
    const fill = () => StyleSheet.flatten(getByTestId('button-root').props.style).backgroundColor;
    expect(fill()).toBe(alpha(color.accent, 16));

    fireEvent(getByTestId('button-root'), 'responderGrant', grant);

    expect(fill()).toBe(alpha(color.accent, 28));
  });

  it('merges a caller accessibilityState with the computed one', () => {
    const { getByTestId } = render(
      <Button disabled accessibilityState={{ busy: true }}>
        Save
      </Button>,
    );
    expect(getByTestId('button-root').props.accessibilityState).toEqual({
      busy: true,
      disabled: true,
      selected: false,
    });
  });

  it('keeps a caller accessibilityState.selected when the selected prop is not passed', () => {
    const { getByTestId } = render(<Button accessibilityState={{ selected: true }}>Opção</Button>);

    expect(getByTestId('button-root').props.accessibilityState).toMatchObject({ selected: true });
  });

  it('lets the selected prop win over a caller accessibilityState.selected', () => {
    const { getByTestId } = render(
      <Button selected={false} accessibilityState={{ selected: true }}>
        Opção
      </Button>,
    );

    expect(getByTestId('button-root').props.accessibilityState).toMatchObject({ selected: false });
  });

  it('still takes disabled from the component, not from a caller accessibilityState', () => {
    const { getByTestId } = render(<Button accessibilityState={{ disabled: true }}>Opção</Button>);

    expect(getByTestId('button-root').props.accessibilityState).toMatchObject({ disabled: false });
  });

  it('tints the ghost variant while pressed', () => {
    const { getByTestId } = render(<Button variant="ghost">Save</Button>);
    fireEvent(getByTestId('button-root'), 'responderGrant', grant);

    expect(StyleSheet.flatten(getByTestId('button-root').props.style).backgroundColor).toBe(
      alpha(color.accent, 22),
    );
  });

  it('deepens the danger tint while pressed', () => {
    const { getByTestId } = render(<Button variant="danger">Excluir</Button>);
    fireEvent(getByTestId('button-root'), 'responderGrant', grant);

    expect(StyleSheet.flatten(getByTestId('button-root').props.style).backgroundColor).toBe(
      alpha(danger['400'], 28),
    );
  });

  it('makes an icon-only button a square of the control height with no padding', () => {
    const { getByTestId } = render(
      <Button iconOnly>
        <View />
      </Button>,
    );

    expect(StyleSheet.flatten(getByTestId('button-root').props.style)).toMatchObject({
      width: control.height,
      paddingHorizontal: 0,
    });
  });

  it('sizes a small icon-only button by the small control height', () => {
    const { getByTestId } = render(
      <Button iconOnly size="sm">
        <View />
      </Button>,
    );

    expect(StyleSheet.flatten(getByTestId('button-root').props.style).width).toBe(control.heightSm);
  });

  it('stretches a block button to the full width', () => {
    const { getByTestId } = render(<Button block>Save</Button>);

    expect(StyleSheet.flatten(getByTestId('button-root').props.style).width).toBe('100%');
  });
});
