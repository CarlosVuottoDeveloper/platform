import type { ProcessStep } from '../domain/content';

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'discovery',
    number: '01',
    title: 'Entender o produto',
    description: 'Alinho objetivo, público e escopo antes de escrever qualquer linha.',
  },
  {
    id: 'architecture',
    number: '02',
    title: 'Estrutura & design',
    description: 'Defino componentes, padrões e a organização do código.',
  },
  {
    id: 'build',
    number: '03',
    title: 'Desenvolvimento',
    description: 'Construo com código limpo, testado e revisado.',
  },
  {
    id: 'delivery',
    number: '04',
    title: 'Publicação & suporte',
    description: 'Publico, documento e acompanho a evolução do projeto.',
  },
];
