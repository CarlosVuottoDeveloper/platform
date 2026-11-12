import { render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';
import { color, radii } from '@industry/tokens';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders lines without needing a testID', () => {
    const { UNSAFE_getAllByType } = render(<Skeleton lines={2} />);

    expect(UNSAFE_getAllByType(Animated.View)).toHaveLength(2);
  });

  it('freezes opacity at 1 when the user prefers reduced motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

    const { getByTestId } = render(<Skeleton testID="skeleton" />);

    await waitFor(() => {
      expect(getByTestId('skeleton').props.style).toMatchObject({ opacity: 1 });
    });

    jest.restoreAllMocks();
  });

  it('renders a single block by default', () => {
    const { getByTestId, queryByTestId } = render(<Skeleton testID="skeleton" />);

    expect(getByTestId('skeleton')).toBeTruthy();
    expect(queryByTestId('skeleton-line-0')).toBeNull();
  });

  it('applies the given height and width to the block', () => {
    const { getByTestId } = render(<Skeleton height={80} width={200} testID="skeleton" />);

    expect(getByTestId('skeleton').props.style).toMatchObject({ height: 80, width: 200 });
  });

  it('renders N lines when lines is set', () => {
    const { getByTestId } = render(<Skeleton lines={3} testID="skeleton" />);

    expect(getByTestId('skeleton-line-0')).toBeTruthy();
    expect(getByTestId('skeleton-line-1')).toBeTruthy();
    expect(getByTestId('skeleton-line-2')).toBeTruthy();
  });

  it('makes the last line shorter than the others', () => {
    const { getByTestId } = render(<Skeleton lines={2} testID="skeleton" />);

    expect(getByTestId('skeleton-line-0').props.style).toMatchObject({ width: '100%' });
    expect(getByTestId('skeleton-line-1').props.style).toMatchObject({ width: '62%' });
  });
});

describe('Skeleton look', () => {
  it('fills with surface2 and rounds with radii.md', () => {
    const { getByTestId } = render(<Skeleton testID="skeleton" />);

    expect(StyleSheet.flatten(getByTestId('skeleton').props.style)).toMatchObject({
      backgroundColor: color.surface2,
      borderRadius: radii.md,
    });
  });

  it('lets a consumer style override the radius', () => {
    const { getByTestId } = render(<Skeleton testID="skeleton" style={{ borderRadius: 4 }} />);

    expect(StyleSheet.flatten(getByTestId('skeleton').props.style).borderRadius).toBe(4);
  });
});
