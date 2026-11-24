import { render, screen } from '@testing-library/react';
import { Companies } from './Companies';

describe('Companies', () => {
  it('names the companies Carlos worked at', () => {
    render(<Companies />);

    expect(screen.getByText('Onde já trabalhei')).toBeInTheDocument();
    for (const company of ['PicPay', 'Caju', 'Somei']) {
      expect(screen.getByText(company)).toBeInTheDocument();
    }
  });
});
