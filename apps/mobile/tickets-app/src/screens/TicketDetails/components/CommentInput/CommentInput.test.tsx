import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '../../../../test-utils';
import { CommentInput } from './CommentInput';

const onChangeText = jest.fn();
const onSubmit = jest.fn();

function renderInput(disabled = false) {
  return render(
    <CommentInput value="" onChangeText={onChangeText} onSubmit={onSubmit} disabled={disabled} />,
  );
}

describe('CommentInput', () => {
  beforeEach(async () => jest.clearAllMocks());

  it('renders a single-line input with a placeholder and no label', () => {
    renderInput();
    const input = screen.getByPlaceholderText('Escrever um comentário');
    expect(input.props.multiline).toBeFalsy();
    expect(screen.queryByText('Novo comentário')).toBeNull();
  });

  it('renders the submit action as an icon button', () => {
    renderInput();
    expect(screen.getByLabelText('Enviar comentário')).toBeTruthy();
    expect(screen.queryByText('Enviar')).toBeNull();
  });

  it('does not submit while disabled', () => {
    renderInput(true);
    fireEvent.press(screen.getByLabelText('Enviar comentário'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit when the icon button is pressed', () => {
    renderInput();
    fireEvent.press(screen.getByLabelText('Enviar comentário'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onChangeText when text changes', () => {
    renderInput();
    fireEvent.changeText(screen.getByPlaceholderText('Escrever um comentário'), 'Hello');
    expect(onChangeText).toHaveBeenCalledWith('Hello');
  });
});
