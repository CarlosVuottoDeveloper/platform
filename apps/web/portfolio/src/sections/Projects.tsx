import { MediaCard, Reveal } from '@industry/web';
import { Section } from '../components/Section';
import { SECTION_IDS } from '../content/navigation';
import { PROJECTS } from '../content/projects';
import { useIsWideScreen } from '../hooks/useIsWideScreen';

function isAloneInLastRow(index: number): boolean {
  return PROJECTS.length % 2 === 1 && index === PROJECTS.length - 1;
}

export function Projects() {
  const isWide = useIsWideScreen();

  return (
    <Section
      id={SECTION_IDS.projects}
      title="Projetos recentes"
      subtitle="Sites que desenvolvi para pequenos negócios, todos no ar. Clique para visitar."
    >
      <div
        data-testid="projects-grid"
        style={{
          display: 'grid',
          gap: 'var(--space-6)',
          gridTemplateColumns: isWide ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
        }}
      >
        {PROJECTS.map((project, index) => (
          <Reveal
            key={project.id}
            delay={isWide ? (index % 2) * 120 : 0}
            style={
              isWide && isAloneInLastRow(index)
                ? {
                    display: 'grid',
                    gridColumn: '1 / -1',
                    justifySelf: 'center',
                    width: 'calc((100% - var(--space-6)) / 2)',
                  }
                : { display: 'grid' }
            }
          >
            <MediaCard
              image={{ src: project.image, alt: `Página inicial do site ${project.name}` }}
              kicker={project.category}
              title={project.name}
              body={project.summary}
              href={project.url}
            />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
