import { SIDEBAR_ENTRIES, TAB_BAR_ENTRIES } from './navigation';

describe('navigation', () => {
  it('uses the wireframe icons in the sidebar', () => {
    expect(SIDEBAR_ENTRIES.map((entry) => entry.icon)).toEqual([
      'layout-dashboard',
      'arrow-left-right',
      'wallet',
      'chart-pie',
      'target',
      'trending-up',
      'sliders-horizontal',
    ]);
  });

  it('gives the bottom tab bar the same icons for the shared entries', () => {
    expect(TAB_BAR_ENTRIES.map((entry) => entry.icon)).toEqual([
      'layout-dashboard',
      'arrow-left-right',
      'wallet',
      'chart-pie',
      'ellipsis',
    ]);
  });
});
