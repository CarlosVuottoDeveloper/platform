import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text, View } from 'react-native';
import { accentRamp, alpha, color } from '@industry/tokens';
import { Button } from './Button';

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

  it('applies the pressed skin for the primary variant on press', () => {
    const { getByTestId } = render(<Button variant="primary">Save</Button>);
    const root = getByTestId('button-root');

    expect(root.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: color.accent }),
    );

    fireEvent(root, 'pressIn');

    expect(getByTestId('button-root').props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: accentRamp['500'] }),
    );
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

    fireEvent(getByTestId('button-root'), 'pressIn');

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
});
