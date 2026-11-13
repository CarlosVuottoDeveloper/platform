import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Cents } from '../../domain/money';
import { MoneyField } from './MoneyField';

function Harness({ initial = null, error }: { initial?: Cents | null; error?: string }) {
  const [value, setValue] = useState<Cents | null>(initial);
  return (
    <>
      <MoneyField label="Valor" value={value} onChange={setValue} error={error} />
      <output data-testid="cents">{value === null ? 'null' : value}</output>
    </>
  );
}

describe('MoneyField', () => {
  it('reports the typed amount in cents', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText('Valor'), '19,99');

    expect(screen.getByTestId('cents')).toHaveTextContent('1999');
  });

  it('shows an existing amount formatted for editing', () => {
    render(<Harness initial={123456} />);

    expect(screen.getByLabelText('Valor')).toHaveValue('1.234,56');
  });

  it('tidies a valid amount when the field loses focus', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText('Valor'), '10');
    await userEvent.tab();

    expect(screen.getByLabelText('Valor')).toHaveValue('10,00');
  });

  it('flags an amount it cannot read and reports no value', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText('Valor'), '12abc');
    await userEvent.tab();

    expect(screen.getByText('Valor inválido')).toBeInTheDocument();
    expect(screen.getByTestId('cents')).toHaveTextContent('null');
  });

  it('does not complain about an empty field on blur', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByLabelText('Valor'));
    await userEvent.tab();

    expect(screen.queryByText('Valor inválido')).not.toBeInTheDocument();
  });

  it('prefers the error given by the form', () => {
    render(<Harness error="Informe o valor" />);

    expect(screen.getByText('Informe o valor')).toBeInTheDocument();
  });

  it('asks for a decimal keyboard', () => {
    render(<Harness />);

    expect(screen.getByLabelText('Valor')).toHaveAttribute('inputmode', 'decimal');
  });
});
