import { existsSync } from 'fs';
import { join } from 'path';
import { CONTACT, PHOTO_SRC } from './contact';
import { EXPERIENCE } from './experience';
import { FAQ } from './faq';
import { NAV_LINKS, SECTION_IDS } from './navigation';
import { PROCESS_STEPS } from './process';
import { PROJECTS } from './projects';
import { SERVICES } from './services';
import { STACK } from './stack';

const PUBLIC_DIR = join(__dirname, '..', '..', 'public');
const MARKETING_NUMBER = /\d+\s*\+\s*(clientes|horas|projetos)/i;

describe('content', () => {
  it('lists five live projects, each with its own screenshot', () => {
    expect(PROJECTS).toHaveLength(5);
    expect(new Set(PROJECTS.map((project) => project.id)).size).toBe(5);
    for (const project of PROJECTS) {
      expect(project.url).toMatch(/^https:\/\//);
      expect(existsSync(join(PUBLIC_DIR, project.image))).toBe(true);
    }
  });

  it('has four services and four process steps', () => {
    expect(SERVICES).toHaveLength(4);
    expect(PROCESS_STEPS).toHaveLength(4);
    expect(PROCESS_STEPS.map((step) => step.number)).toEqual(['01', '02', '03', '04']);
  });

  it('orders the experience from the most recent company', () => {
    expect(EXPERIENCE.map((job) => job.company)).toEqual(['Caju', 'PicPay', 'Somei']);
  });

  it('answers five questions', () => {
    expect(FAQ).toHaveLength(5);
    expect(new Set(FAQ.map((item) => item.id)).size).toBe(5);
  });

  it('points every navigation link at a section of the page', () => {
    const anchors = Object.values(SECTION_IDS).map((id) => `#${id}`);
    for (const link of NAV_LINKS) {
      expect(anchors).toContain(link.href);
    }
  });

  it('shows the photo that exists in the public folder, as a light WebP', () => {
    expect(PHOTO_SRC).toMatch(/\.webp$/);
    expect(existsSync(join(PUBLIC_DIR, PHOTO_SRC))).toBe(true);
  });

  it('links to the real profiles', () => {
    expect(CONTACT.linkedin).toBe('https://www.linkedin.com/in/kaduvuotto');
    expect(CONTACT.github).toBe('https://github.com/CarlosVuottoDeveloper');
    expect(CONTACT.whatsappPhone).toBe('5511964561982');
  });

  it('never claims marketing numbers', () => {
    const texts = JSON.stringify([PROJECTS, SERVICES, PROCESS_STEPS, EXPERIENCE, FAQ, STACK]);
    expect(texts).not.toMatch(MARKETING_NUMBER);
  });
});
