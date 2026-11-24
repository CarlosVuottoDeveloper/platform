export function mockWideScreen(isWide: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: isWide && !query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as typeof window.matchMedia;
}
