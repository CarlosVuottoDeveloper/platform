import { MAIN_ID } from './content/navigation';
import { About } from './sections/About';
import { Companies } from './sections/Companies';
import { ContactCta } from './sections/ContactCta';
import { Faq } from './sections/Faq';
import { Footer } from './sections/Footer';
import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { Process } from './sections/Process';
import { Projects } from './sections/Projects';
import { Services } from './sections/Services';

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
          <Services />
          <Process />
          <About />
          <Faq />
          <ContactCta />
        </main>
        <div style={{ marginTop: 'var(--space-12)' }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}
