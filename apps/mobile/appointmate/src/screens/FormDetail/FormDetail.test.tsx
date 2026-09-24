import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FirebaseError } from 'firebase/app';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen, waitFor } from '../../test-utils';
import { deleteForm, getFormRecord } from '../../services/formsService';
import type { AppStackParamList } from '../../navigation/types';
import { FormDetail } from './FormDetail';

jest.mock('../../services/formsService', () => ({
  getFormRecord: jest.fn(),
  deleteForm: jest.fn(),
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
}));

const mockedGetFormRecord = getFormRecord as jest.Mock;
const mockedDeleteForm = deleteForm as jest.Mock;
const mockedPrintToFileAsync = Print.printToFileAsync as jest.Mock;
const mockedShareAsync = Sharing.shareAsync as jest.Mock;

type Props = NativeStackScreenProps<AppStackParamList, 'FormDetail'>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
  popToTop: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
} as unknown as Props['navigation'];

const mockedAddListener = mockNavigation.addListener as jest.Mock;

type BeforeRemoveEvent = { data: { action: { type: string } }; preventDefault: jest.Mock };

function fireBeforeRemove(actionType: string): BeforeRemoveEvent {
  const call = mockedAddListener.mock.calls.find(([event]) => event === 'beforeRemove');
  const event: BeforeRemoveEvent = {
    data: { action: { type: actionType } },
    preventDefault: jest.fn(),
  };
  call![1](event);
  return event;
}

function makeRoute(formId: string): Props['route'] {
  return { key: 'FormDetail', name: 'FormDetail', params: { formId } } as unknown as Props['route'];
}

const ASYNC_TIMEOUT = { timeout: 15000 };

const filledRecord = {
  values: {
    appointmentDate: '20/04/2026',
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
    consultationNotes: '',
  },
  status: 'submitted' as const,
  createdAt: new Date('2026-01-05T10:00:00Z'),
  updatedAt: new Date('2026-04-15T10:00:00Z'),
};

const emptyRecord = {
  values: {
    appointmentDate: '',
    lastAppointmentDate: '',
    overallMood: null,
    overallSummary: '',
    sleep: '',
    energy: '',
    appetite: '',
    concentration: '',
    medications: [],
    medicationAdherence: '',
    medicationEffects: '',
    whatWentWell: '',
    whatHasBeenHard: '',
    context: '',
    questions: [],
    todayFocus: '',
    consultationNotes: '',
  },
  status: 'draft' as const,
  createdAt: new Date('2026-01-05T10:00:00Z'),
  updatedAt: null,
};

describe('FormDetail', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while the form is fetched', () => {
    mockedGetFormRecord.mockReturnValue(new Promise(() => {}));

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    expect(screen.getByTestId('form-detail-loading')).toBeTruthy();
  });

  it('shows a not-found state when the form does not exist', async () => {
    mockedGetFormRecord.mockResolvedValue(null);

    render(<FormDetail navigation={mockNavigation} route={makeRoute('missing-form')} />);

    await waitFor(() => {
      expect(screen.getByTestId('form-detail-not-found')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 20000);

  it('shows an error message when loading fails', async () => {
    mockedGetFormRecord.mockRejectedValue(new Error('network error'));

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(screen.getByTestId('form-detail-error')).toBeTruthy();
    }, ASYNC_TIMEOUT);
    expect(screen.getByText('Não foi possível carregar o formulário.')).toBeTruthy();
  }, 20000);

  it('shows a connectivity-specific message when loading fails offline', async () => {
    mockedGetFormRecord.mockRejectedValue(new FirebaseError('unavailable', ''));

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(
        screen.getByText('Sem conexão. Verifique sua internet e tente novamente.'),
      ).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 20000);

  it('renders the filled fields and hides empty ones', async () => {
    mockedGetFormRecord.mockResolvedValue(filledRecord);

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(screen.getByText('20 de abril de 2026')).toBeTruthy();
    }, ASYNC_TIMEOUT);
    expect(screen.getByText('10/01/2026')).toBeTruthy();
    expect(screen.getByTestId('form-detail-overall-mood').props.children).toBe('Estável');
    expect(screen.getByText('Losartana 25mg 1x ao dia', { exact: false })).toBeTruthy();
    expect(screen.getByText('Posso reduzir a dose?', { exact: false })).toBeTruthy();
    expect(screen.queryByText('Anotações e orientações')).toBeNull();
  }, 20000);

  it('hides the medications and questions sections when their lists are empty', async () => {
    mockedGetFormRecord.mockResolvedValue({
      ...filledRecord,
      values: { ...filledRecord.values, medications: [], questions: [] },
    });

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(screen.getByText('20 de abril de 2026')).toBeTruthy();
    }, ASYNC_TIMEOUT);
    expect(screen.queryByText('Medicamentos e doses')).toBeNull();
    expect(screen.queryByText('Perguntas')).toBeNull();
  }, 20000);

  it('does not update state after unmounting while the load is still pending', async () => {
    let resolveGetFormRecord: (value: typeof filledRecord) => void = () => {};
    mockedGetFormRecord.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveGetFormRecord = resolve;
        }),
    );

    const { unmount } = render(
      <FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />,
    );
    unmount();

    expect(() => resolveGetFormRecord(filledRecord)).not.toThrow();
  });

  it('does not update state after unmounting while the load is still failing', async () => {
    let rejectGetFormRecord: (err: Error) => void = () => {};
    mockedGetFormRecord.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectGetFormRecord = reject;
        }),
    );

    const { unmount } = render(
      <FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />,
    );
    unmount();

    expect(() => rejectGetFormRecord(new Error('network error'))).not.toThrow();
  });

  it('shows the updated-at label derived from the loaded record', async () => {
    mockedGetFormRecord.mockResolvedValue(filledRecord);

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      const children = screen.getByTestId('form-detail-updated-at').props.children;
      const text = Array.isArray(children) ? children.join('') : children;
      expect(text).toEqual(expect.stringContaining('2026'));
    }, ASYNC_TIMEOUT);
  }, 20000);

  it('shows an empty state when the form has no answered fields', async () => {
    mockedGetFormRecord.mockResolvedValue(emptyRecord);

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(screen.getByTestId('form-detail-empty-state')).toBeTruthy();
    }, ASYNC_TIMEOUT);
  }, 20000);

  it('pops the stack back to Home when the AppBar back button is pressed', async () => {
    mockedGetFormRecord.mockResolvedValue(filledRecord);

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Voltar')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    fireEvent.press(screen.getByLabelText('Voltar'));

    expect(mockNavigation.popToTop).toHaveBeenCalled();
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
  }, 20000);

  it('redirects the hardware back gesture to Home instead of the previous screen', () => {
    mockedGetFormRecord.mockReturnValue(new Promise(() => {}));

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    const event = fireBeforeRemove('GO_BACK');

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockNavigation.popToTop).toHaveBeenCalled();
  });

  it('lets its own pop-to-top removal through without intercepting it', () => {
    mockedGetFormRecord.mockReturnValue(new Promise(() => {}));

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    const event = fireBeforeRemove('POP_TO_TOP');

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(mockNavigation.popToTop).not.toHaveBeenCalled();
  });

  it('unsubscribes the beforeRemove listener on unmount', () => {
    const unsubscribe = jest.fn();
    mockedAddListener.mockReturnValueOnce(unsubscribe);
    mockedGetFormRecord.mockReturnValue(new Promise(() => {}));

    const { unmount } = render(
      <FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />,
    );
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('stacks the summary cells one below the other', async () => {
    mockedGetFormRecord.mockResolvedValue(filledRecord);

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(screen.getByTestId('form-detail-summary-grid')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    const grid = screen.getByTestId('form-detail-summary-grid');
    expect(grid.props.children).toHaveLength(4);
    expect(StyleSheet.flatten(grid.props.style).flexDirection).toBeUndefined();
    expect(screen.getByText('Humor')).toBeTruthy();
    expect(screen.getByText('Sono')).toBeTruthy();
    expect(screen.getByText('Energia')).toBeTruthy();
    expect(screen.getByText('Apetite')).toBeTruthy();
  }, 20000);

  it('centers the status badge with the AppBar title', async () => {
    mockedGetFormRecord.mockResolvedValue(filledRecord);

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(screen.getByTestId('form-detail-status-badge')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    expect(
      StyleSheet.flatten(screen.getByTestId('form-detail-status-badge').props.style),
    ).toMatchObject({ alignSelf: 'center' });
  }, 20000);

  it('disables "Editar" for a submitted form', async () => {
    mockedGetFormRecord.mockResolvedValue(filledRecord);

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(screen.getByTestId('form-detail-edit-button')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    expect(screen.getByTestId('form-detail-edit-button').props.accessibilityState.disabled).toBe(
      true,
    );
    fireEvent.press(screen.getByTestId('form-detail-edit-button'));
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  }, 20000);

  it('disables "Exportar PDF" for a draft', async () => {
    mockedGetFormRecord.mockResolvedValue(emptyRecord);

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(screen.getByTestId('form-detail-export-pdf-button')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    expect(
      screen.getByTestId('form-detail-export-pdf-button').props.accessibilityState.disabled,
    ).toBe(true);
    fireEvent.press(screen.getByTestId('form-detail-export-pdf-button'));
    expect(mockedPrintToFileAsync).not.toHaveBeenCalled();
  }, 20000);

  it('navigates to FormEntry in edit mode when "Editar" is pressed on a draft', async () => {
    mockedGetFormRecord.mockResolvedValue(emptyRecord);

    render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

    await waitFor(() => {
      expect(screen.getByTestId('form-detail-edit-button')).toBeTruthy();
    }, ASYNC_TIMEOUT);

    fireEvent.press(screen.getByTestId('form-detail-edit-button'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('FormEntry', { formId: 'form-1' });
  }, 20000);

  describe('exporting to PDF', () => {
    it('generates and shares the PDF when "Exportar PDF" is pressed', async () => {
      mockedGetFormRecord.mockResolvedValue(filledRecord);
      mockedPrintToFileAsync.mockResolvedValue({ uri: 'file://form.pdf' });
      mockedShareAsync.mockResolvedValue(undefined);

      render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

      await waitFor(() => {
        expect(screen.getByTestId('form-detail-export-pdf-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('form-detail-export-pdf-button'));

      await waitFor(() => {
        expect(mockedPrintToFileAsync).toHaveBeenCalledWith({
          html: expect.stringContaining('20/04/2026'),
        });
      }, ASYNC_TIMEOUT);
      await waitFor(() => {
        expect(mockedShareAsync).toHaveBeenCalledWith('file://form.pdf', expect.any(Object));
      }, ASYNC_TIMEOUT);
    }, 20000);

    it('shows an error message when PDF generation fails', async () => {
      mockedGetFormRecord.mockResolvedValue(filledRecord);
      mockedPrintToFileAsync.mockRejectedValue(new Error('print failed'));

      render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

      await waitFor(() => {
        expect(screen.getByTestId('form-detail-export-pdf-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('form-detail-export-pdf-button'));

      await waitFor(() => {
        expect(screen.getByText('Não foi possível exportar o PDF. Tente novamente.')).toBeTruthy();
      }, ASYNC_TIMEOUT);
      expect(mockedShareAsync).not.toHaveBeenCalled();
    }, 20000);
  });

  describe('deleting the form', () => {
    it('does not delete anything until the confirmation dialog is accepted', async () => {
      mockedGetFormRecord.mockResolvedValue(filledRecord);

      render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

      await waitFor(() => {
        expect(screen.getByTestId('form-detail-delete-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('form-detail-delete-button'));

      expect(screen.getByText('Excluir formulário')).toBeTruthy();
      expect(screen.getByTestId('form-detail-delete-confirm-button')).toBeTruthy();
      expect(mockedDeleteForm).not.toHaveBeenCalled();
    }, 20000);

    it('dismisses the dialog without deleting when "Cancelar" is pressed', async () => {
      mockedGetFormRecord.mockResolvedValue(filledRecord);

      render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

      await waitFor(() => {
        expect(screen.getByTestId('form-detail-delete-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('form-detail-delete-button'));
      fireEvent.press(screen.getByTestId('form-detail-delete-cancel-button'));

      await waitFor(() => {
        expect(screen.queryByText('Excluir formulário')).toBeNull();
      }, ASYNC_TIMEOUT);
      expect(mockedDeleteForm).not.toHaveBeenCalled();
    }, 20000);

    it('dismisses the dialog without deleting when the backdrop is pressed', async () => {
      mockedGetFormRecord.mockResolvedValue(filledRecord);

      render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

      await waitFor(() => {
        expect(screen.getByTestId('form-detail-delete-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('form-detail-delete-button'));
      fireEvent.press(screen.getByTestId('form-detail-delete-dialog-backdrop'));

      await waitFor(() => {
        expect(screen.queryByText('Excluir formulário')).toBeNull();
      }, ASYNC_TIMEOUT);
      expect(mockedDeleteForm).not.toHaveBeenCalled();
    }, 20000);

    it('deletes the form and pops the stack back to Home when the confirmation is accepted', async () => {
      mockedGetFormRecord.mockResolvedValue(filledRecord);
      mockedDeleteForm.mockResolvedValue(undefined);

      render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

      await waitFor(() => {
        expect(screen.getByTestId('form-detail-delete-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('form-detail-delete-button'));
      fireEvent.press(screen.getByTestId('form-detail-delete-confirm-button'));

      await waitFor(() => {
        expect(mockedDeleteForm).toHaveBeenCalledWith('form-1');
      }, ASYNC_TIMEOUT);
      await waitFor(() => {
        expect(mockNavigation.popToTop).toHaveBeenCalled();
      }, ASYNC_TIMEOUT);
    }, 20000);

    it('shows an error message when deleting fails', async () => {
      mockedGetFormRecord.mockResolvedValue(filledRecord);
      mockedDeleteForm.mockRejectedValue(new Error('delete failed'));

      render(<FormDetail navigation={mockNavigation} route={makeRoute('form-1')} />);

      await waitFor(() => {
        expect(screen.getByTestId('form-detail-delete-button')).toBeTruthy();
      }, ASYNC_TIMEOUT);

      fireEvent.press(screen.getByTestId('form-detail-delete-button'));
      fireEvent.press(screen.getByTestId('form-detail-delete-confirm-button'));

      await waitFor(() => {
        expect(
          screen.getByText('Não foi possível excluir o formulário. Tente novamente.'),
        ).toBeTruthy();
      }, ASYNC_TIMEOUT);
      expect(mockNavigation.popToTop).not.toHaveBeenCalled();
    }, 20000);
  });
});
