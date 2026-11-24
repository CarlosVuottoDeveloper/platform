import type { Project } from '../domain/content';

export const PROJECTS: Project[] = [
  {
    id: 'jb-barbershop',
    name: 'Barbearia JB1',
    category: 'Barbearia',
    summary: 'Site com serviços, horários e agendamento direto pelo WhatsApp.',
    url: 'https://barbeariajb1.com/',
    image: '/projects/jb-barbershop.webp',
  },
  {
    id: 'kalliamma-music-therapy',
    name: 'Kali Amma',
    category: 'Musicoterapia',
    summary: 'Musicoterapia obstétrica, canto pré-natal e doulagem, com contato direto.',
    url: 'https://www.kalliammamusicoterapia.com.br/',
    image: '/projects/kalliamma-music-therapy.webp',
  },
  {
    id: 'wanog-law',
    name: 'Wanog Soluções Jurídicas',
    category: 'Advocacia',
    summary: 'Site institucional de assessoria jurídica em São Paulo.',
    url: 'https://wanogadv.vercel.app/',
    image: '/projects/wanog-law.webp',
  },
  {
    id: 'fernanda-nakabara-psychiatry',
    name: 'Dra. Fernanda Nakabara',
    category: 'Psiquiatria',
    summary: 'Página de consultório com áreas de atuação e agendamento de consultas.',
    url: 'https://drafernandanakabara.vercel.app/',
    image: '/projects/fernanda-nakabara-psychiatry.webp',
  },
  {
    id: 'mistura-e-sabores',
    name: 'Mistura & Sabores',
    category: 'Cooperativa de alimentação',
    summary: 'A história, os horários e o endereço de uma cooperativa do Jardim Edite.',
    url: 'https://misturaesabores.vercel.app/',
    image: '/projects/mistura-e-sabores.webp',
  },
];
