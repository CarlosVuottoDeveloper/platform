import { whatsappLink } from './whatsapp';

describe('whatsappLink', () => {
  it('opens a chat with the message encoded exactly once', () => {
    expect(whatsappLink('5511964561982', 'Olá, Carlos! Projeto & site?')).toBe(
      'https://wa.me/5511964561982?text=Ol%C3%A1%2C%20Carlos!%20Projeto%20%26%20site%3F',
    );
  });

  it('keeps only the digits of a formatted phone number', () => {
    expect(whatsappLink('+55 (11) 96456-1982', 'Oi')).toBe('https://wa.me/5511964561982?text=Oi');
  });
});
