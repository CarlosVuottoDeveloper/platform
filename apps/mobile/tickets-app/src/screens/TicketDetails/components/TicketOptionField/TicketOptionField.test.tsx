import React from 'react';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { fireEvent, render, screen } from '../../../../test-utils';
import { TicketOptionField } from './TicketOptionField';
import { ALL_STATUSES, STATUS_LABELS, STATUS_TONES } from '../../../../constants/ticketStatus';
import {
  ALL_PRIORITIES,
  PRIORITY_LABELS,
  PRIORITY_TONES,
} from '../../../../constants/ticketPriority';

const onChangeDraft = jest.fn();

beforeEach(() => {
  onChangeDraft.mockClear();
});

describe('TicketOptionField — status', () => {
  it('renders badge with correct label when not editing', () => {
    render(
      <TicketOptionField
        value="open"
        editing={false}
        draft="open"
        onChangeDraft={onChangeDraft}
        options={ALL_STATUSES}
        labels={STATUS_LABELS}
        tones={STATUS_TONES}
      />,
    );
    expect(screen.getByText('Aberto')).toBeTruthy();
  });

  it('renders option buttons when editing=true', () => {
    render(
      <TicketOptionField
        value="open"
        editing={true}
        draft="open"
        onChangeDraft={onChangeDraft}
        options={ALL_STATUSES}
        labels={STATUS_LABELS}
        tones={STATUS_TONES}
      />,
    );
    expect(screen.getByText('Aberto')).toBeTruthy();
    expect(screen.getByText('Em andamento')).toBeTruthy();
    expect(screen.getByText('Concluído')).toBeTruthy();
  });

  it('renders all option buttons when draft differs from value', () => {
    render(
      <TicketOptionField
        value="open"
        editing={true}
        draft="in_progress"
        onChangeDraft={onChangeDraft}
        options={ALL_STATUSES}
        labels={STATUS_LABELS}
        tones={STATUS_TONES}
      />,
    );
    expect(screen.getByText('Aberto')).toBeTruthy();
    expect(screen.getByText('Em andamento')).toBeTruthy();
    expect(screen.getByText('Concluído')).toBeTruthy();
  });

  it('calls onChangeDraft when an option button is pressed', () => {
    render(
      <TicketOptionField
        value="open"
        editing={true}
        draft="open"
        onChangeDraft={onChangeDraft}
        options={ALL_STATUSES}
        labels={STATUS_LABELS}
        tones={STATUS_TONES}
      />,
    );
    fireEvent.press(screen.getByText('Concluído'));
    expect(onChangeDraft).toHaveBeenCalledWith('done');
  });
});

describe('TicketOptionField — priority', () => {
  it('renders badge with correct label when not editing', () => {
    render(
      <TicketOptionField
        value="medium"
        editing={false}
        draft="medium"
        onChangeDraft={onChangeDraft}
        options={ALL_PRIORITIES}
        labels={PRIORITY_LABELS}
        tones={PRIORITY_TONES}
      />,
    );
    expect(screen.getByText('Média')).toBeTruthy();
  });

  it('renders all priority buttons when editing=true', () => {
    render(
      <TicketOptionField
        value="medium"
        editing={true}
        draft="medium"
        onChangeDraft={onChangeDraft}
        options={ALL_PRIORITIES}
        labels={PRIORITY_LABELS}
        tones={PRIORITY_TONES}
      />,
    );
    expect(screen.getByText('Muito baixa')).toBeTruthy();
    expect(screen.getByText('Baixa')).toBeTruthy();
    expect(screen.getByText('Média')).toBeTruthy();
    expect(screen.getByText('Alta')).toBeTruthy();
    expect(screen.getByText('Muito alta')).toBeTruthy();
  });

  it('renders all option buttons when draft differs from value', () => {
    render(
      <TicketOptionField
        value="medium"
        editing={true}
        draft="high"
        onChangeDraft={onChangeDraft}
        options={ALL_PRIORITIES}
        labels={PRIORITY_LABELS}
        tones={PRIORITY_TONES}
      />,
    );
    expect(screen.getByText('Média')).toBeTruthy();
    expect(screen.getByText('Alta')).toBeTruthy();
    expect(screen.getByText('Muito alta')).toBeTruthy();
  });

  it('calls onChangeDraft when an option button is pressed', () => {
    render(
      <TicketOptionField
        value="medium"
        editing={true}
        draft="medium"
        onChangeDraft={onChangeDraft}
        options={ALL_PRIORITIES}
        labels={PRIORITY_LABELS}
        tones={PRIORITY_TONES}
      />,
    );
    fireEvent.press(screen.getByText('Alta'));
    expect(onChangeDraft).toHaveBeenCalledWith('high');
  });
});
