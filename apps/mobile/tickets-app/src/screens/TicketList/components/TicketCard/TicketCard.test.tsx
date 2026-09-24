import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '../../../../test-utils';
import { TicketCard } from './TicketCard';

const onPress = jest.fn();

const baseProps = {
  title: 'Fix login bug',
  priority: 'high' as const,
  creatorName: 'Alice',
  createdAt: new Date(2024, 0, 15, 14, 30),
  onPress,
};

describe('TicketCard', () => {
  beforeEach(async () => jest.clearAllMocks());

  it('renders the ticket title', () => {
    render(<TicketCard {...baseProps} />);
    expect(screen.getByText('Fix login bug')).toBeTruthy();
  });

  it('renders the priority label', () => {
    render(<TicketCard {...baseProps} />);
    expect(screen.getByText('Alta')).toBeTruthy();
  });

  it('renders the creator name in meta text', () => {
    render(<TicketCard {...baseProps} />);
    expect(screen.getByText(/Alice/)).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    render(<TicketCard {...baseProps} />);
    fireEvent.press(screen.getByText('Fix login bug'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders without error when createdAt is null', () => {
    render(<TicketCard {...baseProps} createdAt={null} />);
    expect(screen.getByText(/Alice/)).toBeTruthy();
  });

  it('renders assignee name when provided', () => {
    render(<TicketCard {...baseProps} assigneeName="Bob" />);
    expect(screen.getByText('Responsável: Bob')).toBeTruthy();
  });

  it('shows "não designado" for the assignee row when assigneeName is null', () => {
    render(<TicketCard {...baseProps} assigneeName={null} />);
    expect(screen.getByText('Responsável: não designado')).toBeTruthy();
  });
});
