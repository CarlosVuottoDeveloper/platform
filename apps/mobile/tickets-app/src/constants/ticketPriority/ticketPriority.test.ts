import {
  ALL_PRIORITIES,
  PRIORITY_TONES,
  PRIORITY_LABELS,
  isPriorityMaximum,
} from './ticketPriority';

describe('ticketPriority', () => {
  beforeEach(() => jest.clearAllMocks());

  it('ALL_PRIORITIES contains all 5 priority levels in order', () => {
    expect(ALL_PRIORITIES).toEqual(['very_low', 'low', 'medium', 'high', 'very_high']);
  });

  it('PRIORITY_LABELS has a label for every priority', () => {
    ALL_PRIORITIES.forEach((priority) => {
      expect(PRIORITY_LABELS[priority]).toBeTruthy();
    });
  });

  it('PRIORITY_LABELS agree in gender with "prioridade"', () => {
    expect(PRIORITY_LABELS).toEqual({
      very_low: 'Muito baixa',
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      very_high: 'Muito alta',
    });
  });

  it('PRIORITY_TONES has a color for every priority', () => {
    ALL_PRIORITIES.forEach((priority) => {
      expect(PRIORITY_TONES[priority]).toBeTruthy();
    });
  });

  it('PRIORITY_LABELS values are non-empty strings', () => {
    Object.values(PRIORITY_LABELS).forEach((label) => {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });

  it('PRIORITY_TONES values are non-empty strings', () => {
    Object.values(PRIORITY_TONES).forEach((color) => {
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });
  });
});

describe('isPriorityMaximum', () => {
  it('is true only for very_high', () => {
    expect(isPriorityMaximum('very_high')).toBe(true);
    expect(isPriorityMaximum('high')).toBe(false);
    expect(isPriorityMaximum('medium')).toBe(false);
    expect(isPriorityMaximum('low')).toBe(false);
    expect(isPriorityMaximum('very_low')).toBe(false);
  });
});
