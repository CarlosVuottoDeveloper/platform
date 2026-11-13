import { Text } from 'react-native';
import { render, screen } from '../../test-utils';
import { SectionLabel } from './SectionLabel';

describe('SectionLabel', () => {
  it('renders its label text', () => {
    render(<SectionLabel testID="section">Cabeçalho</SectionLabel>);
    expect(screen.getByText('Cabeçalho')).toBeTruthy();
  });

  it('forwards testID to the container', () => {
    render(<SectionLabel testID="section">Cabeçalho</SectionLabel>);
    expect(screen.getByTestId('section')).toBeTruthy();
  });

  it('does not render trailing content by default', () => {
    render(<SectionLabel testID="section">Medicação</SectionLabel>);
    expect(screen.queryByText('2 itens')).toBeNull();
  });

  it('renders optional trailing content next to the label', () => {
    render(
      <SectionLabel testID="section" trailing={<Text>2 itens</Text>}>
        Medicação
      </SectionLabel>,
    );
    expect(screen.getByText('2 itens')).toBeTruthy();
  });
});
