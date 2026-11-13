import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { withKnownIssueNotes } from './preview';

type DecoratorArgs = Parameters<typeof withKnownIssueNotes>;
type StoryArg = DecoratorArgs[0];
type ContextArg = DecoratorArgs[1];

function renderDecorator(parameters: { svgKnownIssue?: boolean; gradientKnownIssue?: boolean }) {
  const Story = (() => <Text>story content</Text>) as StoryArg;
  const context = { parameters } as unknown as ContextArg;
  return render(withKnownIssueNotes(Story, context));
}

describe('withKnownIssueNotes', () => {
  it('always renders the story content', () => {
    const { getByText } = renderDecorator({ svgKnownIssue: true });
    expect(getByText('story content')).toBeTruthy();
  });

  it('shows the warning banner when svgKnownIssue is true', () => {
    const { getByText } = renderDecorator({ svgKnownIssue: true });
    expect(getByText(/react-native-svg/)).toBeTruthy();
  });

  it('hides the warning banner when svgKnownIssue is not set', () => {
    const { queryByText } = renderDecorator({});
    expect(queryByText(/react-native-svg/)).toBeNull();
  });

  it('shows the gradient banner only when gradientKnownIssue is true', () => {
    expect(
      renderDecorator({ gradientKnownIssue: true }).getByText(/experimental_backgroundImage/),
    ).toBeTruthy();
    expect(renderDecorator({}).queryByText(/experimental_backgroundImage/)).toBeNull();
  });
});
