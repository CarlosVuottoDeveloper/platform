import type { IconName } from '@industry/web';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export const SERVICES: Service[] = [
  {
    id: 'websites',
    title: 'Sites & Landing Pages',
    description:
      'Sites institucionais e landing pages rápidas, responsivas e feitas para converter, com performance e SEO cuidados desde o início.',
    icon: 'monitor-smartphone',
  },
  {
    id: 'web-apps',
    title: 'Aplicativos Web',
    description:
      'Aplicações React completas: dashboards, portais e fluxos com tabelas, formulários e integrações, com código limpo e testado.',
    icon: 'code-xml',
  },
  {
    id: 'mobile-apps',
    title: 'Aplicativos Mobile',
    description:
      'Apps iOS e Android com React Native, do desenvolvimento à publicação nas lojas, reaproveitando a base do web quando faz sentido.',
    icon: 'smartphone',
  },
  {
    id: 'design-systems',
    title: 'Design Systems',
    description:
      'Tokens, componentes, documentação no Storybook e versionamento, para dar consistência entre times e plataformas.',
    icon: 'layers',
  },
];
