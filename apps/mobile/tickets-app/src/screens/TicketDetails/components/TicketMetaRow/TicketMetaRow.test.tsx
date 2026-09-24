import { render, screen } from '../../../../test-utils';
import { TicketMetaRow } from './TicketMetaRow';

describe('TicketMetaRow', () => {
  it('renders creator name under a "Criador" label', () => {
    render(<TicketMetaRow creatorName="Alice" createdAt={null} assigneeName={null} />);
    expect(screen.getByText('Criador')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('renders formatted date under an "Abertura" label when createdAt is provided', () => {
    const date = new Date(2024, 0, 15, 14, 30);
    render(<TicketMetaRow creatorName="Alice" createdAt={date} assigneeName={null} />);
    expect(screen.getByText('Abertura')).toBeTruthy();
    const dateEl = screen.getByText(/15\/01\/2024/);
    expect(dateEl).toBeTruthy();
  });

  it('does not render the "Abertura" cell when createdAt is null', () => {
    render(<TicketMetaRow creatorName="Alice" createdAt={null} assigneeName={null} />);
    expect(screen.queryByText('Abertura')).toBeNull();
  });

  it('renders assigneeName under a "Responsável" label', () => {
    render(<TicketMetaRow creatorName="Alice" createdAt={null} assigneeName="Bob" />);
    expect(screen.getByText('Responsável')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('shows "não designado" under "Responsável" when there is no assignee', () => {
    render(<TicketMetaRow creatorName="Alice" createdAt={null} assigneeName={null} />);
    expect(screen.getByText('Responsável')).toBeTruthy();
    expect(screen.getByText('não designado')).toBeTruthy();
  });
});
