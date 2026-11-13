import { render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { accentRamp, color, fontFamily } from '@industry/tokens';
import { SectionLabel } from './SectionLabel';

describe('SectionLabel', () => {
  it('renders its label text', () => {
    render(<SectionLabel testID="section">Cabeçalho</SectionLabel>);
    expect(screen.getByText('Cabeçalho')).toBeTruthy();
  });

  it('sets the label font family and colour from the tokens', () => {
    render(<SectionLabel>Cabeçalho</SectionLabel>);
    expect(StyleSheet.flatten(screen.getByText('Cabeçalho').props.style)).toMatchObject({
      fontFamily: fontFamily.body,
      color: accentRamp['300'],
    });
  });

  it('draws a divider under the label', () => {
    render(<SectionLabel testID="section">Cabeçalho</SectionLabel>);
    const divider = screen.getByTestId('section').children[1] as ReactTestInstance;
    expect(StyleSheet.flatten(divider.props.style)).toMatchObject({
      height: 1,
      backgroundColor: color.divider,
    });
  });

  it('forwards testID to the container', () => {
    render(<SectionLabel testID="section">Cabeçalho</SectionLabel>);
    expect(screen.getByTestId('section')).toBeTruthy();
  });

  it('does not render trailing content by default', () => {
    render(<SectionLabel testID="section">Seção</SectionLabel>);
    expect(screen.queryByText('3 itens')).toBeNull();
  });

  it('renders optional trailing content next to the label', () => {
    render(
      <SectionLabel testID="section" trailing={<Text>3 itens</Text>}>
        Seção
      </SectionLabel>,
    );
    expect(screen.getByText('3 itens')).toBeTruthy();
  });
});
