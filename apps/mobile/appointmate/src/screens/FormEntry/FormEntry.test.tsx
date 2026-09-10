import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FirebaseError } from 'firebase/app';
import { fireEvent, render, screen, waitFor } from '../../test-utils';
import { createForm, getFormRecord, updateForm } from '../../services/formsService';
import { AuthProvider } from '../../context/AuthContext';
import { subscribeToAuthChanges, type AuthUser } from '../../services/authService';
import type { AppStackParamList } from '../../navigation/types';
import { FormEntry } from './FormEntry';

jest.mock('../../services/formsService', () => ({
  createForm: jest.fn(),
  updateForm: jest.fn(),
  getFormRecord: jest.fn(),
}));

jest.mock('../../services/authService', () => ({
  subscribeToAuthChanges: jest.fn(),
}));

const mockedCreateForm = createForm as jest.Mock;
const mockedUpdateForm = updateForm as jest.Mock;
const mockedGetFormRecord = getFormRecord as jest.Mock;
const mockedSubscribeToAuthChanges = subscribeToAuthChanges as jest.Mock;

function signedInAs(user: AuthUser | null) {
  mockedSubscribeToAuthChanges.mockImplementation((callback: (u: AuthUser | null) => void) => {
    callback(user);
    return jest.fn();
  });
}

type Props = NativeStackScreenProps<AppStackParamList, 'FormEntry'>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
} as unknown as Props['navigation'];

function makeRoute(formId?: string): Props['route'] {
  return {
    key: 'FormEntry',
    name: 'FormEntry',
    params: formId ? { formId } : undefined,
  } as unknown as Props['route'];
}

const ASYNC_TIMEOUT = { timeout: 15000 };

function renderFormEntry(formId?: string) {
  return render(
    <AuthProvider>
      <FormEntry navigation={mockNavigation} route={makeRoute(formId)} />
    </AuthProvider>,
  );
}

function dateOffsetFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

const FUTURE_APPOINTMENT_DATE = dateOffsetFromToday(30);

const existingValues = {
  appointmentDate: FUTURE_APPOINTMENT_DATE,
  lastAppointmentDate: '10/01/2026',
  overallMood: 'estavel' as const,
  overallSummary: 'Semana estável.',
  sleep: 'Dormindo bem.',
  energy: 'Energia normal.',
  appetite: 'Apetite bom.',
  concentration: 'Concentração ok.',
  medications: [{ text: 'Losartana 25mg 1x ao dia' }],
  medicationAdherence: 'Sim, sempre.',
  medicationEffects: 'Nenhum efeito notado.',
  whatWentWell: 'Mantive a rotina de sono.',
  whatHasBeenHard: 'Ansiedade no trabalho.',
  context: 'Mudança de emprego.',
  questions: [{ text: 'Posso reduzir a dose?' }],
  todayFocus: 'Ajustar a medicação.',
  consultationNotes: 'Nenhuma nota adicional.',
};

const draftRecord = {
  values: existingValues,
  status: 'draft' as const,
  createdAt: null,
  updatedAt: null,
};

const submittedRecord = { ...draftRecord, status: 'submitted' as const };

function fillAllRequiredFields() {
  fireEvent.changeText(
    screen.getByTestId('form-entry-appointment-date-input'),
    FUTURE_APPOINTMENT_DATE,
  );
  fireEvent.changeText(screen.getByTestId('form-entry-last-appointment-date-input'), '10012026');
  fireEvent.press(screen.getByTestId('form-entry-overall-mood-chip-bem'));
  fireEvent.changeText(screen.getByTestId('form-entry-overall-summary-input'), 'Resumo da semana.');
  fireEvent.changeText(screen.getByTestId('form-entry-sleep-input'), 'Dormindo bem.');
  fireEvent.changeText(screen.getByTestId('form-entry-energy-input'), 'Energia normal.');
  fireEvent.changeText(screen.getByTestId('form-entry-appetite-input'), 'Apetite bom.');
  fireEvent.changeText(screen.getByTestId('form-entry-concentration-input'), 'Concentração ok.');
  fireEvent.changeText(screen.getByTestId('form-entry-medication-0-input'), 'Sertralina 50mg');
  fireEvent.changeText(screen.getByTestId('form-entry-medication-adherence-input'), 'Sim, sempre.');
  fireEvent.changeText(screen.getByTestId('form-entry-medication-effects-input'), 'Nenhum efeito.');
  fireEvent.changeText(
    screen.getByTestId('form-entry-what-went-well-input'),
    'Dormi melhor essa semana.',
  );
  fireEvent.changeText(
    screen.getByTestId('form-entry-what-has-been-hard-input'),
    'Ansiedade no trabalho.',
  );
  fireEvent.changeText(screen.getByTestId('form-entry-context-input'), 'Mudança de emprego.');
  fireEvent.changeText(screen.getByTestId('form-entry-question-0-input'), 'Posso reduzir a dose?');
  fireEvent.changeText(screen.getByTestId('form-entry-today-focus-input'), 'Ajustar a medicação.');
  fireEvent.changeText(
    screen.getByTestId('form-entry-consultation-notes-input'),
    'Nenhuma nota adicional.',
  );
}

describe('FormEntry', () => {
  beforeEach(() => {
    signedInAs({ uid: 'user-abc', email: 'user@example.com' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('creating a new form', () => {
    it('renders all 10 sections with their fields', () => {
      renderFormEntry();

      expect(screen.getByTestId('form-entry-appointment-date-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-last-appointment-date-input')).toBeTruthy();
      expect(screen.getByText('Bem')).toBeTruthy();
      expect(screen.getByTestId('form-entry-overall-summary-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-sleep-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-energy-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-appetite-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-concentration-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-medication-adherence-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-medication-effects-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-what-went-well-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-what-has-been-hard-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-context-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-today-focus-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-consultation-notes-input')).toBeTruthy();
      expect(screen.getByTestId('form-entry-save-draft-button')).toBeTruthy();
      expect(screen.getByTestId('form-entry-submit-button')).toBeTruthy();
    });

    it('navigates back when the AppBar back button is pressed', () => {
      renderFormEntry();

      fireEvent.press(screen.getByLabelText('Voltar'));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('starts with exactly 1 medication row and 1 question row', () => {
      renderFormEntry();

      expect(screen.getByTestId('form-entry-medication-0-input')).toBeTruthy();
      expect(screen.queryByTestId('form-entry-medication-1-input')).toBeNull();

      expect(screen.getByTestId('form-entry-question-0-input')).toBeTruthy();
      expect(screen.queryByTestId('form-entry-question-1-input')).toBeNull();
    });

    it('formats the date fields as dd/mm/aaaa as digits are typed', () => {
      renderFormEntry();

      fireEvent.changeText(screen.getByTestId('form-entry-appointment-date-input'), '15032026');

      expect(screen.getByTestId('form-entry-appointment-date-input').props.value).toBe(
        '15/03/2026',
      );
    });

    it('selects a single mood chip at a time', () => {
      renderFormEntry();

      fireEvent.press(screen.getByTestId('form-entry-overall-mood-chip-estavel'));

      expect(
        screen.getByTestId('form-entry-overall-mood-chip-estavel').props.accessibilityState
          .selected,
      ).toBe(true);
      expect(
        screen.getByTestId('form-entry-overall-mood-chip-bem').props.accessibilityState.selected,
      ).toBe(false);
    });

    it('adds and removes a medication row', () => {
      renderFormEntry();

      fireEvent.press(screen.getByTestId('form-entry-add-medication-button'));
      expect(screen.getByTestId('form-entry-medication-1-input')).toBeTruthy();

      fireEvent.press(screen.getByTestId('form-entry-remove-medication-1-button'));
      expect(screen.queryByTestId('form-entry-medication-1-input')).toBeNull();
    });

    it('adds and removes a question row', () => {
      renderFormEntry();

      fireEvent.press(screen.getByTestId('form-entry-add-question-button'));
      expect(screen.getByTestId('form-entry-question-1-input')).toBeTruthy();

      fireEvent.press(screen.getByTestId('form-entry-remove-question-1-button'));
      expect(screen.queryByTestId('form-entry-question-1-input')).toBeNull();
    });

    it('removes the only medication row, leaving zero', () => {
      renderFormEntry();

      fireEvent.press(screen.getByTestId('form-entry-remove-medication-0-button'));

      expect(screen.queryByTestId('form-entry-medication-0-input')).toBeNull();
    });

    it('saves as draft with the form completely empty — drafts skip validation', async () => {
      mockedCreateForm.mockResolvedValue('new-form-id');
      renderFormEntry();

      fireEvent.press(screen.getByTestId('form-entry-save-draft-button'));

      await waitFor(() => {
        expect(mockedCreateForm).toHaveBeenCalledWith(
          'user-abc',
          expect.objectContaining({ appointmentDate: '', overallMood: null }),
          'draft',
        );
      }, ASYNC_TIMEOUT);
      await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('FormDetail', {
          formId: 'new-form-id',
        });
      }, ASYNC_TIMEOUT);
    }, 20000);

    it('does not submit and shows validation errors when required fields are empty', async () => {
      renderFormEntry();

      fireEvent.press(screen.getByTestId('form-entry-submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('form-entry-overall-mood-error')).toBeTruthy();
      }, ASYNC_TIMEOUT);
      expect(screen.getAllByText('Campo obrigatório').length).toBeGreaterThan(1);
      expect(mockedCreateForm).not.toHaveBeenCalled();
    }, 20000);

    it('blocks submit and shows an error when the consultation date is in the past', async () => {
      renderFormEntry();

      fillAllRequiredFields();
      fireEvent.changeText(
        screen.getByTestId('form-entry-appointment-date-input'),
        dateOffsetFromToday(-1),
      );
      fireEvent.press(screen.getByTestId('form-entry-submit-button'));

      await waitFor(() => {
        expect(screen.getByText('A data não pode ser anterior a hoje')).toBeTruthy();
      }, ASYNC_TIMEOUT);
      expect(mockedCreateForm).not.toHaveBeenCalled();
    }, 20000);

    it('accepts today as a valid consultation date', async () => {
      mockedCreateForm.mockResolvedValue('new-form-id');
      renderFormEntry();

      fillAllRequiredFields();
      fireEvent.changeText(
        screen.getByTestId('form-entry-appointment-date-input'),
        dateOffsetFromToday(0),
      );
      fireEvent.press(screen.getByTestId('form-entry-submit-button'));

      await waitFor(() => {
        expect(mockedCreateForm).toHaveBeenCalledWith(
          'user-abc',
          expect.objectContaining({ appointmentDate: dateOffsetFromToday(0) }),
          'submitted',
        );
      }, ASYNC_TIMEOUT);
    }, 20000);

    it('calls createForm with status "submitted" once every field is filled in', async () => {
      mockedCreateForm.mockResolvedValue('new-form-id');
      renderFormEntry();

      fillAllRequiredFields();
      fireEvent.press(screen.getByTestId('form-entry-submit-button'));

      await waitFor(() => {
        expect(mockedCreateForm).toHaveBeenCalledWith(
          'user-abc',
          expect.objectContaining({
            appointmentDate: FUTURE_APPOINTMENT_DATE,
            overallMood: 'bem',
          }),
          'submitted',
        );
      }, ASYNC_TIMEOUT);
      await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('FormDetail', {
          formId: 'new-form-id',
        });
      }, ASYNC_TIMEOUT);
    }, 20000);

    it('shows an error message when saving fails', async () => {
      mockedCreateForm.mockRejectedValue(new Error('network error'));
      renderFormEntry();

      fillAllRequiredFields();
      fireEvent.press(screen.getByTestId('form-entry-submit-button'));

      await waitFor(() => {
        expect(
          screen.getByText('Não foi possível salvar o formulário. Tente novamente.'),
        ).toBeTruthy();
      }, ASYNC_TIMEOUT);
      expect(mockNavigation.replace).not.toHaveBeenCalled();
    }, 20000);

    it('shows a connectivity-specific message when saving fails offline', async () => {
      mockedCreateForm.mockRejectedValue(new FirebaseError('unavailable', ''));
      renderFormEntry();

      fillAllRequiredFields();
      fireEvent.press(screen.getByTestId('form-entry-submit-button'));

      await waitFor(() => {
        expect(
          screen.getByText('Sem conexão. Verifique sua internet e tente novamente.'),
        ).toBeTruthy();
      }, ASYNC_TIMEOUT);
    }, 20000);
  });

  it('does not save when there is no signed-in user', () => {
    signedInAs(null);
    renderFormEntry();

    fireEvent.press(screen.getByTestId('form-entry-save-draft-button'));

    expect(mockedCreateForm).not.toHaveBeenCalled();
  });

  it('asks for a recap of the last month in both narrative sections', () => {
    renderFormEntry();

    expect(screen.getAllByText('Conte como foi no último mês')).toHaveLength(2);
  });

  describe('editing an existing form', () => {
    it('does not update state after unmounting while the load is still pending', () => {
      let resolveGetForm: (value: typeof draftRecord) => void = () => {};
      mockedGetFormRecord.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveGetForm = resolve;
          }),
      );

      const { unmount } = renderFormEntry('form-1');
      unmount();

      expect(() => resolveGetForm(draftRecord)).not.toThrow();
    });

    it('does not update state after unmounting while the load is still failing', () => {
      let rejectGetForm: (err: Error) => void = () => {};
      mockedGetFormRecord.mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            rejectGetForm = reject;
          }),
      );

      const { unmount } = renderFormEntry('form-1');
      unmount();

      expect(() => rejectGetForm(new Error('network error'))).not.toThrow();
    });

    it('stops loading without resetting the form when no values are found', async () => {
      mockedGetFormRecord.mockResolvedValue(null);

      renderFormEntry('form-1');

      await waitFor(() => {
        expect(screen.getByTestId('form-entry-submit-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);
      expect(screen.getByTestId('form-entry-appointment-date-input').props.value).toBe('');
    }, 20000);

    it('shows a loading state while the existing form is fetched', () => {
      mockedGetFormRecord.mockReturnValue(new Promise(() => {}));

      renderFormEntry('form-1');

      expect(screen.getByTestId('form-entry-loading')).toBeTruthy();
    });

    it('populates all sections with the loaded values', async () => {
      mockedGetFormRecord.mockResolvedValue(draftRecord);

      renderFormEntry('form-1');

      await waitFor(() => {
        expect(screen.getByTestId('form-entry-appointment-date-input').props.value).toBe(
          FUTURE_APPOINTMENT_DATE,
        );
      }, ASYNC_TIMEOUT);
      expect(screen.getByTestId('form-entry-last-appointment-date-input').props.value).toBe(
        '10/01/2026',
      );
      expect(
        screen.getByTestId('form-entry-overall-mood-chip-estavel').props.accessibilityState
          .selected,
      ).toBe(true);
      expect(screen.getByTestId('form-entry-sleep-input').props.value).toBe('Dormindo bem.');
      expect(screen.getByTestId('form-entry-medication-0-input').props.value).toBe(
        'Losartana 25mg 1x ao dia',
      );
      expect(screen.getByTestId('form-entry-question-0-input').props.value).toBe(
        'Posso reduzir a dose?',
      );
      expect(screen.getByTestId('form-entry-today-focus-input').props.value).toBe(
        'Ajustar a medicação.',
      );
    }, 20000);

    it('calls updateForm (not createForm) on submit', async () => {
      mockedGetFormRecord.mockResolvedValue(draftRecord);
      mockedUpdateForm.mockResolvedValue(undefined);

      renderFormEntry('form-1');

      await waitFor(() => {
        expect(screen.getByTestId('form-entry-submit-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('form-entry-submit-button'));

      await waitFor(() => {
        expect(mockedUpdateForm).toHaveBeenCalledWith('form-1', existingValues, 'submitted');
      }, ASYNC_TIMEOUT);
      expect(mockedCreateForm).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('FormDetail', { formId: 'form-1' });
      }, ASYNC_TIMEOUT);
    }, 20000);

    it('disables "Salvar rascunho" when the form was already submitted', async () => {
      mockedGetFormRecord.mockResolvedValue(submittedRecord);

      renderFormEntry('form-1');

      await waitFor(() => {
        expect(screen.getByTestId('form-entry-save-draft-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      expect(
        screen.getByTestId('form-entry-save-draft-button').props.accessibilityState.disabled,
      ).toBe(true);
      fireEvent.press(screen.getByTestId('form-entry-save-draft-button'));
      expect(mockedUpdateForm).not.toHaveBeenCalled();
    }, 20000);

    it('keeps "Salvar rascunho" enabled for a draft', async () => {
      mockedGetFormRecord.mockResolvedValue(draftRecord);

      renderFormEntry('form-1');

      await waitFor(() => {
        expect(screen.getByTestId('form-entry-save-draft-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      expect(
        screen.getByTestId('form-entry-save-draft-button').props.accessibilityState.disabled,
      ).toBe(false);
    }, 20000);

    it('shows an error message when the form fails to load', async () => {
      mockedGetFormRecord.mockRejectedValue(new Error('not found'));

      renderFormEntry('form-1');

      await waitFor(() => {
        expect(screen.getByText('Não foi possível carregar o formulário.')).toBeTruthy();
      }, ASYNC_TIMEOUT);
    }, 20000);
  });
});
