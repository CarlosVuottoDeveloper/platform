import { MAIN_ID } from './content/navigation';
import { Companies } from './sections/Companies';
import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { Projects } from './sections/Projects';

export function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(60rem 40rem at 80% -10%, color-mix(in srgb, var(--color-accent-600) 35%, transparent), transparent 70%), var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 var(--space-4) var(--space-12)',
        }}
      >
        <Header />
        <main
          id={MAIN_ID}
          tabIndex={-1}
          style={{ display: 'grid', gap: 'var(--space-12)', outline: 'none' }}
        >
          <Hero />
          <Companies />
          <Projects />
        </main>
      </div>
    </div>
  );
}
