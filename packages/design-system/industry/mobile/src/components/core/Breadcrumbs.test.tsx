import { fireEvent, render, screen } from '@testing-library/react-native';
import { color, neutral } from '@industry/tokens';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders every item label', () => {
    render(
      <Breadcrumbs items={[{ label: 'Início' }, { label: 'Projetos' }, { label: 'Detalhes' }]} />,
    );
    expect(screen.getByText('Início')).toBeTruthy();
    expect(screen.getByText('Projetos')).toBeTruthy();
    expect(screen.getByText('Detalhes')).toBeTruthy();
  });

  it('calls onPress for a non-last item that has one', () => {
    const onPress = jest.fn();
    render(<Breadcrumbs items={[{ label: 'Início', onPress }, { label: 'Perfil' }]} testID="bc" />);

    fireEvent.press(screen.getByTestId('bc-Início'));

    expect(onPress).toHaveBeenCalled();
  });

  it('renders a non-last item with no onPress as plain text, not pressable', () => {
    render(<Breadcrumbs items={[{ label: 'Início' }, { label: 'Perfil' }]} testID="bc" />);
    expect(screen.queryByTestId('bc-Início')).toBeNull();
  });

  it('renders the last item as plain text even when it has an onPress', () => {
    const onPress = jest.fn();
    render(<Breadcrumbs items={[{ label: 'Início' }, { label: 'Perfil', onPress }]} testID="bc" />);
    expect(screen.queryByTestId('bc-Perfil')).toBeNull();
  });

  it('renders a separator between items but not after the last one', () => {
    render(<Breadcrumbs items={[{ label: 'A' }, { label: 'B' }, { label: 'C' }]} />);
    expect(screen.getAllByText('/')).toHaveLength(2);
  });

  it('calls onPress for a pressable item even without a testID', () => {
    const onPress = jest.fn();
    render(<Breadcrumbs items={[{ label: 'Início', onPress }, { label: 'Perfil' }]} />);

    fireEvent.press(screen.getByText('Início'));

    expect(onPress).toHaveBeenCalled();
  });

  it('renders nothing when there are no items', () => {
    render(<Breadcrumbs testID="bc" />);
    expect(screen.getByTestId('bc').children).toHaveLength(0);
  });

  it('colours the current crumb, previous crumbs and separators', () => {
    render(<Breadcrumbs items={[{ label: 'A' }, { label: 'B' }]} />);

    expect(screen.getByText('B').props.style).toMatchObject({ color: color.text });
    expect(screen.getByText('A').props.style).toMatchObject({ color: neutral['400'] });
    expect(screen.getByText('/').props.style).toMatchObject({ color: neutral['600'] });
  });
});
