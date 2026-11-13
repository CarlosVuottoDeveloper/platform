import { fireEvent, render } from '@testing-library/react-native';
import { color, radii } from '@industry/tokens';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('renders the default "Search" placeholder', () => {
    const { getByPlaceholderText } = render(<SearchField />);
    expect(getByPlaceholderText('Search')).toBeTruthy();
  });

  it('renders a custom placeholder when given', () => {
    const { getByPlaceholderText } = render(<SearchField placeholder="Buscar tickets" />);
    expect(getByPlaceholderText('Buscar tickets')).toBeTruthy();
  });

  it('renders as a pill', () => {
    const { getByPlaceholderText } = render(<SearchField />);
    expect(getByPlaceholderText('Search').props.style).toMatchObject({ borderRadius: radii.pill });
  });

  it('calls onFocus and onBlur and updates the border color accordingly', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(<SearchField onFocus={onFocus} onBlur={onBlur} />);
    const input = getByPlaceholderText('Search');

    expect(input.props.style).toMatchObject({ borderColor: color.controlBorder });

    fireEvent(input, 'focus', { nativeEvent: {} });
    expect(onFocus).toHaveBeenCalled();
    expect(input.props.style).toMatchObject({ borderColor: color.accent });

    fireEvent(input, 'blur', { nativeEvent: {} });
    expect(onBlur).toHaveBeenCalled();
    expect(input.props.style).toMatchObject({ borderColor: color.controlBorder });
  });
});
