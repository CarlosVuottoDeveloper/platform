import { Accordion, Reveal } from '@industry/web';
import { Section } from '../components/Section';
import { FAQ } from '../content/faq';
import { SECTION_IDS } from '../content/navigation';

export function Faq() {
  return (
    <Section
      id={SECTION_IDS.faq}
      title="Dúvidas frequentes"
      subtitle="Respostas rápidas sobre como trabalho."
    >
      <Reveal style={{ width: '100%', maxWidth: '48rem', margin: '0 auto' }}>
        <Accordion
          items={FAQ.map((item) => ({
            key: item.id,
            title: item.question,
            content: (
              <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--color-neutral-200)' }}>
                {item.answer}
              </p>
            ),
          }))}
        />
      </Reveal>
    </Section>
  );
}
