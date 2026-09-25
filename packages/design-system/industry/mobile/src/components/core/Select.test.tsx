import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { space } from '@industry/tokens';
import { Select } from './Select';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 0 }),
}));

const OPTIONS = ['a', 'b'];

describe('Select', () => {
  it('shows the placeholder when nothing is selected', () => {
    const { getByText } = render(
      <Select options={OPTIONS} placeholder="Selecionar" onValueChange={jest.fn()} />,
    );

    expect(getByText('Selecionar')).toBeTruthy();
  });

  it('shows the selected option label', () => {
    const { getByText } = render(<Select options={OPTIONS} value="b" onValueChange={jest.fn()} />);

    expect(getByText('b')).toBeTruthy();
  });

  it('opens the sheet and lists every option when pressed', () => {
    const { getByTestId, queryByTestId } = render(
      <Select options={OPTIONS} testID="status-select" onValueChange={jest.fn()} />,
    );

    expect(queryByTestId('select-option-a')).toBeNull();

    fireEvent.press(getByTestId('status-select'));

    expect(getByTestId('select-option-a')).toBeTruthy();
    expect(getByTestId('select-option-b')).toBeTruthy();
  });

  it('calls onValueChange and closes the sheet when an option is picked', () => {
    const onValueChange = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <Select options={OPTIONS} testID="status-select" onValueChange={onValueChange} />,
    );

    fireEvent.press(getByTestId('status-select'));
    fireEvent.press(getByTestId('select-option-b'));

    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(queryByTestId('select-option-b')).toBeNull();
  });

  it('closes the sheet when the backdrop is pressed', () => {
    const { getByTestId, queryByTestId } = render(
      <Select options={OPTIONS} testID="status-select" onValueChange={jest.fn()} />,
    );

    fireEvent.press(getByTestId('status-select'));
    fireEvent.press(getByTestId('status-select-backdrop'));

    expect(queryByTestId('select-option-a')).toBeNull();
  });

  it('highlights the currently selected option in the sheet', () => {
    const { getByTestId } = render(
      <Select options={OPTIONS} value="b" testID="status-select" onValueChange={jest.fn()} />,
    );

    fireEvent.press(getByTestId('status-select'));

    expect(getByTestId('select-option-b').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(getByTestId('select-option-a').props.accessibilityState).toMatchObject({
      selected: false,
    });
  });

  it('renders object options by their label', () => {
    const { getByTestId, getByText } = render(
      <Select
        options={[{ value: 'grid', label: 'Grade' }]}
        testID="status-select"
        onValueChange={jest.fn()}
      />,
    );

    fireEvent.press(getByTestId('status-select'));

    expect(getByText('Grade')).toBeTruthy();
  });

  it('renders the error message', () => {
    const { getByText } = render(
      <Select options={OPTIONS} error="Campo obrigatório" onValueChange={jest.fn()} />,
    );

    expect(getByText('Campo obrigatório')).toBeTruthy();
  });

  it('renders the hint when there is no error', () => {
    const { getByText } = render(
      <Select options={OPTIONS} hint="Escolha um status" onValueChange={jest.fn()} />,
    );

    expect(getByText('Escolha um status')).toBeTruthy();
  });

  it('renders the label above the trigger', () => {
    const { getByText, getByLabelText } = render(
      <Select label="Status" options={OPTIONS} onValueChange={jest.fn()} />,
    );

    expect(getByText('Status')).toBeTruthy();
    expect(getByLabelText('Status')).toBeTruthy();
  });

  it('defaults to an empty option list', () => {
    const { getByText, getByTestId } = render(
      <Select testID="status-select" onValueChange={jest.fn()} />,
    );

    fireEvent.press(getByTestId('status-select'));

    expect(getByText('Selecionar')).toBeTruthy();
  });

  it('is not pressable when disabled', () => {
    const { getByTestId } = render(
      <Select options={OPTIONS} testID="status-select" disabled onValueChange={jest.fn()} />,
    );

    expect(getByTestId('status-select').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('pads the option panel by the bottom safe area so the last option clears the navigation bar', () => {
    const { getByTestId } = render(
      <Select options={OPTIONS} testID="status-select" onValueChange={jest.fn()} />,
    );

    fireEvent.press(getByTestId('status-select'));

    expect(StyleSheet.flatten(getByTestId('status-select-panel').props.style).paddingBottom).toBe(
      space[2] + 34,
    );
  });
});
