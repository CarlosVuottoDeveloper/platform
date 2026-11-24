import type { Meta, StoryObj } from '@storybook/react';
import { LinkButton } from './LinkButton';
import { TopNav } from './TopNav';

const meta: Meta<typeof TopNav> = {
  title: 'Core/TopNav',
  component: TopNav,
};

export default meta;
type Story = StoryObj<typeof TopNav>;

const LINKS = [
  { label: 'Projetos', href: '#projetos' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Dúvidas', href: '#duvidas' },
];

const ACTION = (
  <LinkButton href="#contato" variant="primary" size="sm">
    Vamos conversar
  </LinkButton>
);

export const Default: Story = {
  render: () => <TopNav brand="Carlos Vuotto" links={LINKS} action={ACTION} />,
};

export const Collapsed: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <TopNav brand="Carlos Vuotto" links={LINKS} action={ACTION} collapsed />
    </div>
  ),
};
