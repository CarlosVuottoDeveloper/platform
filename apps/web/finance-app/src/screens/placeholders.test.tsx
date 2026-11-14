import { render, screen } from '@testing-library/react';
import { Budgets } from './Budgets/Budgets';
import { Reports } from './Reports/Reports';

describe('screens still to be built', () => {
  it.each([
    ['Orçamentos', Budgets],
    ['Relatórios', Reports],
  ])('%s announces that it is coming', (title, Screen) => {
    render(<Screen />);

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText('Em breve')).toBeInTheDocument();
  });
});
