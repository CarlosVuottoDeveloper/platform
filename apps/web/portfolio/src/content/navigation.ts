import type { NavLink } from '../domain/content';

export const SECTION_IDS = {
  projects: 'projetos',
  services: 'servicos',
  about: 'sobre',
  faq: 'duvidas',
} as const;

export const MAIN_ID = 'conteudo';

export const NAV_LINKS: NavLink[] = [
  { label: 'Projetos', href: `#${SECTION_IDS.projects}` },
  { label: 'Serviços', href: `#${SECTION_IDS.services}` },
  { label: 'Sobre', href: `#${SECTION_IDS.about}` },
  { label: 'Dúvidas', href: `#${SECTION_IDS.faq}` },
];
