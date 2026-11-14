export const COLOR_OPTIONS = [
  { value: 'viz-1', label: 'Azul' },
  { value: 'viz-2', label: 'Ciano' },
  { value: 'viz-3', label: 'Verde' },
  { value: 'viz-4', label: 'Amarelo' },
  { value: 'viz-5', label: 'Coral' },
  { value: 'viz-6', label: 'Lilás' },
];

export const ICON_OPTIONS = [
  { value: 'landmark', label: 'Banco' },
  { value: 'wallet', label: 'Carteira' },
  { value: 'smartphone', label: 'Celular' },
  { value: 'banknote', label: 'Dinheiro' },
  { value: 'trending-up', label: 'Investimento' },
  { value: 'credit-card', label: 'Cartão' },
  { value: 'hand-coins', label: 'Empréstimo' },
  { value: 'piggy-bank', label: 'Cofrinho' },
  { value: 'utensils', label: 'Alimentação' },
  { value: 'house', label: 'Moradia' },
  { value: 'car', label: 'Transporte' },
  { value: 'heart-pulse', label: 'Saúde' },
  { value: 'gamepad-2', label: 'Lazer' },
  { value: 'graduation-cap', label: 'Educação' },
  { value: 'briefcase', label: 'Trabalho' },
  { value: 'tag', label: 'Outros' },
];

export function colorVariable(color: string): string {
  return `var(--${color})`;
}
