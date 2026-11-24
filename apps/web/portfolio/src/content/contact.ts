import { whatsappLink } from '../domain/whatsapp';

export const CONTACT = {
  name: 'Carlos Vuotto',
  whatsappPhone: '5511964561982',
  whatsappMessage: 'Olá, Carlos! Vi seu portfólio e quero conversar sobre um projeto.',
  linkedin: 'https://www.linkedin.com/in/kaduvuotto',
  github: 'https://github.com/CarlosAmorimDeveloper',
} as const;

export const WHATSAPP_URL = whatsappLink(CONTACT.whatsappPhone, CONTACT.whatsappMessage);

export const PHOTO_SRC = '/carlos.png';
