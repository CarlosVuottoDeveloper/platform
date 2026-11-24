import { render, screen } from '@testing-library/react';
import { WHATSAPP_URL } from '../content/contact';
import { ContactCta } from './ContactCta';

describe('ContactCta', () => {
  it('ends the page with an invitation to talk on WhatsApp', () => {
    render(<ContactCta />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Tem um produto para tirar do papel?' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Vamos conversar' })).toHaveAttribute(
      'href',
      WHATSAPP_URL,
    );
  });
});
