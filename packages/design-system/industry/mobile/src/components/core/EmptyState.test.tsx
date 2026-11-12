import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { color, fontSize, neutral, radii } from '@industry/tokens';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('forwards testID to the container', () => {
    const { getByTestId } = render(<EmptyState title="Nenhum projeto" testID="empty-state" />);
    expect(getByTestId('empty-state')).toBeTruthy();
  });

  it('renders title, body, icon and action', () => {
    const { getByText } = render(
      <EmptyState
        icon={<Text>icon</Text>}
        title="Nenhum projeto"
        body="Crie o primeiro projeto."
        action={<Text>Criar</Text>}
      />,
    );

    expect(getByText('icon')).toBeTruthy();
    expect(getByText('Nenhum projeto')).toBeTruthy();
    expect(getByText('Crie o primeiro projeto.')).toBeTruthy();
    expect(getByText('Criar')).toBeTruthy();
  });

  it('omits optional slots that are not provided', () => {
    const { getByText, queryByText } = render(<EmptyState title="Só título" />);

    expect(getByText('Só título')).toBeTruthy();
    expect(queryByText('Criar')).toBeNull();
  });

  it('omits the title when not provided', () => {
    const { getByText } = render(<EmptyState body="Só corpo" />);

    expect(getByText('Só corpo')).toBeTruthy();
  });

  it('colors the title with the theme text color, not the default black', () => {
    const { getByText } = render(<EmptyState title="Nenhum formulário" />);

    const styles = [getByText('Nenhum formulário').props.style].flat();
    expect(styles.some((s) => s?.color === color.text)).toBe(true);
  });
});

describe('EmptyState look', () => {
  it('draws a rounded dashed outline with the divider color', () => {
    const { getByTestId } = render(<EmptyState title="Vazio" testID="empty" />);

    expect(StyleSheet.flatten(getByTestId('empty').props.style)).toMatchObject({
      borderRadius: radii.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: color.dividerStrong,
    });
  });

  it('sizes the title from the type scale and mutes the body', () => {
    const { getByText } = render(<EmptyState title="Vazio" body="Corpo" />);

    expect(StyleSheet.flatten(getByText('Vazio').props.style).fontSize).toBe(fontSize.h4);
    expect(StyleSheet.flatten(getByText('Corpo').props.style)).toMatchObject({
      color: neutral['400'],
      fontSize: fontSize.h6,
    });
  });
});
