import type { Meta, StoryObj } from '@storybook/react';
import { MediaCard } from './MediaCard';

const meta: Meta<typeof MediaCard> = {
  title: 'Core/MediaCard',
  component: MediaCard,
};

export default meta;
type Story = StoryObj<typeof MediaCard>;

const PREVIEW = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#268bfc"/><stop offset="1" stop-color="#070b1f"/></linearGradient></defs><rect width="160" height="100" fill="url(#g)"/></svg>',
)}`;

export const Default: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <MediaCard
        image={{ src: PREVIEW, alt: 'Prévia do site de exemplo' }}
        kicker="Landing page"
        title="Site de exemplo"
        body="Página institucional com agendamento pelo WhatsApp."
        href="https://example.com"
      />
    </div>
  ),
};
