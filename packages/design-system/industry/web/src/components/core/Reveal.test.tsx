import { act, render, screen } from '@testing-library/react';
import { Reveal } from './Reveal';

type Callback = (entries: { isIntersecting: boolean }[]) => void;

let trigger: Callback = () => undefined;
const disconnect = jest.fn();

function installObserver() {
  window.IntersectionObserver = jest.fn((callback: Callback) => {
    trigger = callback;
    return { observe: jest.fn(), disconnect, unobserve: jest.fn() };
  }) as unknown as typeof IntersectionObserver;
}

function preferReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as typeof window.matchMedia;
}

describe('Reveal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    preferReducedMotion(false);
    installObserver();
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'IntersectionObserver');
  });

  it('starts hidden and slightly lowered until it scrolls into view', () => {
    render(
      <Reveal testID="reveal">
        <p>Conteúdo</p>
      </Reveal>,
    );
    const wrapper = screen.getByTestId('reveal');

    expect(wrapper.style.opacity).toBe('0');
    expect(wrapper.style.transform).toBe('translateY(16px)');

    act(() => trigger([{ isIntersecting: true }]));

    expect(wrapper.style.opacity).toBe('1');
    expect(wrapper.style.transform).toBe('none');
    expect(disconnect).toHaveBeenCalled();
  });

  it('ignores updates that are not about entering the screen', () => {
    render(<Reveal testID="reveal">x</Reveal>);

    act(() => trigger([{ isIntersecting: false }]));

    expect(screen.getByTestId('reveal').style.opacity).toBe('0');
  });

  it('waits the given delay before animating', () => {
    render(
      <Reveal testID="reveal" delay={120}>
        x
      </Reveal>,
    );

    expect(screen.getByTestId('reveal').style.transitionDelay).toBe('120ms');
  });

  it('shows the content at once for someone who prefers reduced motion', () => {
    preferReducedMotion(true);
    render(<Reveal testID="reveal">x</Reveal>);
    const wrapper = screen.getByTestId('reveal');

    expect(wrapper.style.opacity).toBe('');
    expect(wrapper.style.transform).toBe('');
    expect(wrapper.style.transition).toBe('');
    expect(window.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('shows the content at once where the browser cannot observe scrolling', () => {
    Reflect.deleteProperty(window, 'IntersectionObserver');
    render(<Reveal testID="reveal">x</Reveal>);

    expect(screen.getByTestId('reveal').style.opacity).toBe('');
  });
});
