export function passwordMinLengthError(password: string): string | undefined {
  return password.length > 0 && password.length < 8 ? 'Mínimo de 8 caracteres' : undefined;
}
