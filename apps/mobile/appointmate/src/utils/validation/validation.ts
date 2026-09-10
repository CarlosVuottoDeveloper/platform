const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailFormatError(email: string): string | undefined {
  return email.length > 0 && !EMAIL_REGEX.test(email) ? 'Formato de e-mail inválido' : undefined;
}

export function passwordMinLengthError(password: string): string | undefined {
  return password.length > 0 && password.length < 8 ? 'Mínimo de 8 caracteres' : undefined;
}
