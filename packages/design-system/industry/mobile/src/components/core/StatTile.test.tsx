import { StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { accentRamp, color, control, fontSize, fontWeight, neutral, radii } from '@industry/tokens';
import { StatTile } from './StatTile';

const flat = (node: { props: { style?: unknown } }) =>
  StyleSheet.flatten(node.props.style as never) as Record<string, unknown>;

describe('StatTile', () => {
  it('renders the value and the label', () => {
    render(<StatTile value="48 kWh" label="Uso em 24h" />);

    expect(screen.getByText('48 kWh')).toBeTruthy();
    expect(screen.getByText('Uso em 24h')).toBeTruthy();
  });

  it('draws the icon inside an accent 800 circle', () => {
    render(<StatTile icon={<Text>icone</Text>} value="1" label="x" testID="tile" />);

    expect(screen.getByText('icone')).toBeTruthy();
    expect(flat(screen.getByTestId('tile-icon'))).toMatchObject({
      width: control.heightSm,
      height: control.heightSm,
      borderRadius: radii.pill,
      backgroundColor: accentRamp['800'],
    });
  });

  it('does not reserve the circle without an icon', () => {
    render(<StatTile value="1" label="x" testID="tile" />);

    expect(screen.queryByTestId('tile-icon')).toBeNull();
  });

  it('lets the text column shrink so long text wraps in a narrow card', () => {
    render(<StatTile value="48" label="Uso" testID="tile" />);
    const column = screen.getByText('48').parent?.parent as unknown as {
      props: { style?: unknown };
    };

    expect(flat(column)).toMatchObject({ flex: 1, minWidth: 0 });
  });

  it('styles the value as a heading and mutes the label', () => {
    render(<StatTile value="48" label="Uso" />);

    expect(flat(screen.getByText('48'))).toMatchObject({
      fontSize: fontSize.h4,
      fontWeight: fontWeight.heading,
      color: color.text,
    });
    expect(flat(screen.getByText('Uso'))).toMatchObject({
      fontSize: fontSize.h6,
      color: neutral['400'],
    });
  });
});
