import { fireEvent, render, screen } from '@testing-library/react';
import { FileDrop, partitionFiles } from './FileDrop';

function makeFile(name: string, type: string, sizeBytes: number): File {
  const file = new File([new Uint8Array(sizeBytes)], name, { type });
  return file;
}

describe('partitionFiles', () => {
  it('accepts every file when no accept/maxSize is given', () => {
    const files = [makeFile('a.png', 'image/png', 10)];
    expect(partitionFiles(files, undefined, undefined)).toEqual({ accepted: files, rejected: [] });
  });

  it('rejects files that do not match an extension pattern', () => {
    const file = makeFile('a.txt', 'text/plain', 10);
    const { accepted, rejected } = partitionFiles([file], '.png,.jpg', undefined);
    expect(accepted).toHaveLength(0);
    expect(rejected).toEqual([{ file, reason: 'type' }]);
  });

  it('rejects files that do not match a wildcard MIME pattern', () => {
    const file = makeFile('a.txt', 'text/plain', 10);
    const { rejected } = partitionFiles([file], 'image/*', undefined);
    expect(rejected).toEqual([{ file, reason: 'type' }]);
  });

  it('rejects files that do not match an exact MIME type', () => {
    const file = makeFile('a.png', 'image/png', 10);
    const { rejected } = partitionFiles([file], 'application/pdf', undefined);
    expect(rejected).toEqual([{ file, reason: 'type' }]);
  });

  it('rejects files over maxSizeBytes', () => {
    const file = makeFile('a.png', 'image/png', 20);
    const { accepted, rejected } = partitionFiles([file], undefined, 10);
    expect(accepted).toHaveLength(0);
    expect(rejected).toEqual([{ file, reason: 'size' }]);
  });

  it('accepts files within type and size constraints', () => {
    const file = makeFile('a.png', 'image/png', 5);
    const { accepted, rejected } = partitionFiles([file], 'image/*', 10);
    expect(accepted).toEqual([file]);
    expect(rejected).toHaveLength(0);
  });
});

describe('FileDrop', () => {
  it('calls onFiles when a file is chosen via the input', async () => {
    const onFiles = jest.fn();
    const { container } = render(<FileDrop onFiles={onFiles} />);
    await screen.findByRole('button');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('a.png', 'image/png', 10);

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('calls onReject for files that fail validation', async () => {
    const onFiles = jest.fn();
    const onReject = jest.fn();
    const { container } = render(<FileDrop accept=".png" onFiles={onFiles} onReject={onReject} />);
    await screen.findByRole('button');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('a.txt', 'text/plain', 10);

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFiles).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith([{ file, reason: 'type' }]);
  });

  it('does nothing when the change event carries no files', async () => {
    const onFiles = jest.fn();
    const { container } = render(<FileDrop onFiles={onFiles} />);
    await screen.findByRole('button');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [] } });
    fireEvent.change(input, { target: { files: null } });

    expect(onFiles).not.toHaveBeenCalled();
  });

  it('clears the hover tint on drag leave', async () => {
    render(<FileDrop label="Solte aqui" />);
    const dropzone = await screen.findByRole('button', { name: /Solte aqui/ });

    fireEvent.dragOver(dropzone);
    fireEvent.dragLeave(dropzone);

    expect(dropzone).toHaveStyle({ background: 'var(--color-surface)' });
  });

  it('accepts a dropped file and clears the over state', async () => {
    const onFiles = jest.fn();
    render(<FileDrop onFiles={onFiles} label="Solte aqui" />);
    const dropzone = await screen.findByRole('button', { name: /Solte aqui/ });
    const file = makeFile('a.png', 'image/png', 10);

    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('accepts a pasted file', async () => {
    const onFiles = jest.fn();
    render(<FileDrop onFiles={onFiles} label="Solte aqui" />);
    const dropzone = await screen.findByRole('button', { name: /Solte aqui/ });
    const file = makeFile('a.png', 'image/png', 10);

    fireEvent.paste(dropzone, { clipboardData: { files: [file] } });

    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('ignores paste events with no files', async () => {
    const onFiles = jest.fn();
    render(<FileDrop onFiles={onFiles} label="Solte aqui" />);
    const dropzone = await screen.findByRole('button', { name: /Solte aqui/ });

    fireEvent.paste(dropzone, { clipboardData: { files: [] } });
    fireEvent.paste(dropzone, { clipboardData: undefined });

    expect(onFiles).not.toHaveBeenCalled();
  });

  it('opens the file dialog on Enter and Space', async () => {
    const { container } = render(<FileDrop label="Solte aqui" />);
    const dropzone = await screen.findByRole('button', { name: /Solte aqui/ });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => {});

    fireEvent.keyDown(dropzone, { key: 'Enter' });
    fireEvent.keyDown(dropzone, { key: ' ' });
    fireEvent.keyDown(dropzone, { key: 'a' });

    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('ignores drop/paste/keydown while disabled', async () => {
    const onFiles = jest.fn();
    render(<FileDrop onFiles={onFiles} label="Solte aqui" disabled />);
    const dropzone = await screen.findByRole('button', { name: /Solte aqui/ });
    const file = makeFile('a.png', 'image/png', 10);

    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    fireEvent.paste(dropzone, { clipboardData: { files: [file] } });
    fireEvent.keyDown(dropzone, { key: 'Enter' });

    expect(onFiles).not.toHaveBeenCalled();
    expect(dropzone).toHaveAttribute('aria-disabled', 'true');
    expect(dropzone).toHaveAttribute('tabindex', '-1');
  });

  it('renders the hint and error text', async () => {
    const { rerender } = render(<FileDrop hint="Até 10 MB" />);
    expect(await screen.findByText('Até 10 MB')).toBeInTheDocument();

    rerender(<FileDrop error="Arquivo inválido" />);
    expect(screen.getByText('Arquivo inválido')).toBeInTheDocument();
  });

  it('draws a large-radius dashed zone on the surface', async () => {
    render(<FileDrop label="Solte aqui" />);
    const dropzone = await screen.findByRole('button', { name: /Solte aqui/ });

    expect(dropzone.style.borderRadius).toBe('var(--radius-lg)');
    expect(dropzone.style.borderStyle).toBe('dashed');
    expect(dropzone.style.borderColor).toBe('var(--color-divider-strong)');
    expect(dropzone.style.background).toBe('var(--color-surface)');
  });

  it('uses the danger border for an error and the accent while dragging over', async () => {
    const { rerender } = render(<FileDrop label="Solte aqui" error="Arquivo inválido" />);
    const dropzone = await screen.findByRole('button', { name: /Solte aqui/ });
    expect(dropzone.style.borderColor).toBe('var(--color-danger)');

    rerender(<FileDrop label="Solte aqui" />);
    fireEvent.dragOver(dropzone);
    expect(dropzone.style.borderColor).toBe('var(--color-accent)');
    expect(dropzone.style.background).toBe('var(--color-surface-2)');
  });
});
