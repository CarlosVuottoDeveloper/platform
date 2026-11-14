import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagsField } from './TagsField';

function Harness({
  initial = [],
  suggestions = [],
}: {
  initial?: string[];
  suggestions?: string[];
}) {
  const [tags, setTags] = useState(initial);
  return (
    <>
      <TagsField value={tags} onChange={setTags} suggestions={suggestions} />
      <output data-testid="tags">{tags.join('|')}</output>
    </>
  );
}

describe('TagsField', () => {
  it('adds a normalised tag on Enter and clears the input', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText('Tags'), '  Mercado {Enter}');

    expect(screen.getByTestId('tags')).toHaveTextContent('mercado');
    expect(screen.getByLabelText('Tags')).toHaveValue('');
  });

  it('adds a tag when a comma is typed', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText('Tags'), 'casa,');

    expect(screen.getByTestId('tags')).toHaveTextContent('casa');
  });

  it('ignores duplicates and blank input', async () => {
    render(<Harness initial={['casa']} />);

    await userEvent.type(screen.getByLabelText('Tags'), 'Casa{Enter}   {Enter}');

    expect(screen.getByTestId('tags')).toHaveTextContent(/^casa$/);
  });

  it('removes a tag', async () => {
    render(<Harness initial={['casa', 'mercado']} />);

    await userEvent.click(screen.getByRole('button', { name: 'Remover tag casa' }));

    expect(screen.getByTestId('tags')).toHaveTextContent(/^mercado$/);
  });

  it('stops accepting tags at ten', async () => {
    const ten = Array.from({ length: 10 }, (_, index) => `t${index}`);
    render(<Harness initial={ten} />);

    expect(screen.getByLabelText('Tags')).toBeDisabled();
  });

  it('suggests tags already in use, except the ones already added', () => {
    const { container } = render(
      <Harness initial={['casa']} suggestions={['casa', 'mercado', 'viagem']} />,
    );

    const options = [...container.querySelectorAll('datalist option')].map((option) =>
      option.getAttribute('value'),
    );
    expect(options).toEqual(['mercado', 'viagem']);
  });

  it('keeps the form from submitting when Enter adds a tag', async () => {
    const onSubmit = jest.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Harness />
      </form>,
    );

    await userEvent.type(screen.getByLabelText('Tags'), 'casa{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps a tag that was typed but not confirmed when the field loses focus', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByLabelText('Tags'), 'viagem');
    await userEvent.tab();

    expect(screen.getByTestId('tags')).toHaveTextContent('viagem');
  });
});
