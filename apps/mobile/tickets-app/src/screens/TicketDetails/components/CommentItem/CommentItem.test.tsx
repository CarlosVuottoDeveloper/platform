import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '../../../../test-utils';
import type { Comment } from '../../../../domain/ticket';
import { CommentItem } from './CommentItem';

const mockComment: Comment = {
  id: 'c1',
  text: 'Test comment',
  authorId: 'u1',
  authorName: 'Alice',
  createdAt: new Date(2024, 0, 15, 14, 30),
};

const onDeletePress = jest.fn();

describe('CommentItem', () => {
  beforeEach(async () => jest.clearAllMocks());

  it('uses the first and last initials when the author has several names', () => {
    render(
      <CommentItem
        comment={{ ...mockComment, authorName: 'Ana Maria Lima' }}
        canDelete={false}
        onDeletePress={jest.fn()}
      />,
    );
    expect(screen.getByText('AL')).toBeTruthy();
  });

  it('uses a single initial when the author has only one name', () => {
    render(
      <CommentItem
        comment={{ ...mockComment, authorName: 'Madonna' }}
        canDelete={false}
        onDeletePress={jest.fn()}
      />,
    );
    expect(screen.getByText('M')).toBeTruthy();
  });

  it('renders no initials when the author name is empty', () => {
    render(
      <CommentItem
        comment={{ ...mockComment, authorName: '   ' }}
        canDelete={false}
        onDeletePress={jest.fn()}
      />,
    );
    expect(screen.queryByText(/^[A-Z]{1,2}$/)).toBeNull();
  });

  it('renders the timestamp as day, abbreviated month and time', () => {
    render(
      <CommentItem
        comment={{ ...mockComment, createdAt: new Date(2026, 2, 12, 9, 20) }}
        canDelete={false}
        onDeletePress={jest.fn()}
      />,
    );
    expect(screen.getByText('12 mar · 09:20')).toBeTruthy();
  });

  it('renders author name', () => {
    render(<CommentItem comment={mockComment} canDelete={false} onDeletePress={onDeletePress} />);
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('renders comment text', () => {
    render(<CommentItem comment={mockComment} canDelete={false} onDeletePress={onDeletePress} />);
    expect(screen.getByText('Test comment')).toBeTruthy();
  });

  it('renders formatted date', () => {
    render(<CommentItem comment={mockComment} canDelete={false} onDeletePress={onDeletePress} />);
    const dateEl = screen.getByText(/15/);
    expect(dateEl).toBeTruthy();
  });

  it('shows a delete icon button when canDelete=true', () => {
    render(<CommentItem comment={mockComment} canDelete={true} onDeletePress={onDeletePress} />);
    expect(screen.getByLabelText('Apagar comentário')).toBeTruthy();
    expect(screen.queryByText('Apagar')).toBeNull();
  });

  it('hides the delete icon button when canDelete=false', () => {
    render(<CommentItem comment={mockComment} canDelete={false} onDeletePress={onDeletePress} />);
    expect(screen.queryByLabelText('Apagar comentário')).toBeNull();
  });

  it('calls onDeletePress when the delete icon is pressed', () => {
    render(<CommentItem comment={mockComment} canDelete={true} onDeletePress={onDeletePress} />);
    fireEvent.press(screen.getByLabelText('Apagar comentário'));
    expect(onDeletePress).toHaveBeenCalledTimes(1);
  });
});
