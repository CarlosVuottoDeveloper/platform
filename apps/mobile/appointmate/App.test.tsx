import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { onAuthStateChanged } from 'firebase/auth';
import App from './App';
import { createForm, deleteForm, getFormRecord, listForms } from './src/services/formsService';

jest.mock('./src/services/firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('./src/services/formsService', () => ({
  listForms: jest.fn().mockResolvedValue([]),
  createForm: jest.fn(),
  getFormRecord: jest.fn(),
  deleteForm: jest.fn(),
}));

jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));

const mockedOnAuthStateChanged = onAuthStateChanged as jest.Mock;
const mockedListForms = listForms as jest.Mock;
const mockedCreateForm = createForm as jest.Mock;
const mockedGetFormRecord = getFormRecord as jest.Mock;
const mockedDeleteForm = deleteForm as jest.Mock;

const ASYNC_TIMEOUT = { timeout: 15000 };

function renderAsAuthenticatedUser() {
  mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
    callback({ uid: 'user-abc' });
    return jest.fn();
  });
  render(<App />);
}

function dateOffsetFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

const FUTURE_APPOINTMENT_DATE = dateOffsetFromToday(30);

function fillAllRequiredFormFields() {
  fireEvent.changeText(
    screen.getByTestId('form-entry-appointment-date-input'),
    FUTURE_APPOINTMENT_DATE,
  );
  fireEvent.changeText(screen.getByTestId('form-entry-last-appointment-date-input'), '10012026');
  fireEvent.press(screen.getByTestId('form-entry-overall-mood-chip-bem'));
  fireEvent.changeText(screen.getByTestId('form-entry-overall-summary-input'), 'Semana estável.');
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

describe('App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a loading indicator before the auth state resolves', () => {
    mockedOnAuthStateChanged.mockImplementation(() => jest.fn());

    render(<App />);

    expect(screen.getByTestId('app-loading')).toBeTruthy();
  });

  it('renders AuthStack when there is no authenticated user', async () => {
    mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => expect(screen.getByTestId('login-email-input')).toBeTruthy());
    expect(screen.queryByText('Home')).toBeNull();
  });

  it('renders AppStack when there is an authenticated user', async () => {
    mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback({ uid: 'abc123' });
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => expect(screen.getByTestId('home-new-form-button')).toBeTruthy());
    expect(screen.queryByTestId('login-email-input')).toBeNull();
  });

  describe('flow: create a form and see it in the dashboard', () => {
    it('navigates Home → FormEntry → FormDetail through the real stack, saving the filled values', async () => {
      mockedListForms.mockResolvedValue([]);
      mockedCreateForm.mockResolvedValue('new-form-id');
      mockedGetFormRecord.mockResolvedValue({
        values: {
          appointmentDate: FUTURE_APPOINTMENT_DATE,
          lastAppointmentDate: '10/01/2026',
          overallMood: 'bem',
          overallSummary: 'Semana estável.',
          sleep: 'Dormindo bem.',
          energy: 'Energia normal.',
          appetite: 'Apetite bom.',
          concentration: 'Concentração ok.',
          medications: [{ text: 'Sertralina 50mg' }],
          medicationAdherence: 'Sim, sempre.',
          medicationEffects: 'Nenhum efeito.',
          whatWentWell: 'Dormi melhor essa semana.',
          whatHasBeenHard: 'Ansiedade no trabalho.',
          context: 'Mudança de emprego.',
          questions: [{ text: 'Posso reduzir a dose?' }],
          todayFocus: 'Ajustar a medicação.',
          consultationNotes: 'Nenhuma nota adicional.',
        },
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: null,
      });

      renderAsAuthenticatedUser();

      await waitFor(() => expect(screen.getByTestId('home-new-form-button')).toBeTruthy());
      fireEvent.press(screen.getByTestId('home-new-form-button'));

      await waitFor(() =>
        expect(screen.getByTestId('form-entry-appointment-date-input')).toBeTruthy(),
      );
      fillAllRequiredFormFields();
      fireEvent.press(screen.getByTestId('form-entry-submit-button'));

      await waitFor(() => expect(mockedCreateForm).toHaveBeenCalled(), ASYNC_TIMEOUT);
      expect(mockedCreateForm).toHaveBeenCalledWith(
        'user-abc',
        expect.objectContaining({ overallSummary: 'Semana estável.' }),
        'submitted',
      );

      await waitFor(() => expect(screen.getByText('Semana estável.')).toBeTruthy(), ASYNC_TIMEOUT);
      expect(mockedGetFormRecord).toHaveBeenCalledWith('new-form-id');
    }, 30000);
  });

  describe('flow: delete a form from its detail screen', () => {
    it('navigates Home → FormDetail → deletes and returns to an updated dashboard', async () => {
      const formSummary = {
        id: 'form-a',
        appointmentDate: '15/03/2026',
        overallSummary: 'Semana tranquila.',
        status: 'submitted' as const,
        createdAt: new Date(),
        updatedAt: null,
      };
      let formDeleted = false;
      mockedListForms.mockImplementation(() => Promise.resolve(formDeleted ? [] : [formSummary]));
      mockedGetFormRecord.mockResolvedValue({
        values: {
          appointmentDate: '15/03/2026',
          lastAppointmentDate: '',
          overallMood: null,
          overallSummary: 'Semana tranquila.',
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
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: null,
      });
      mockedDeleteForm.mockImplementation(async () => {
        formDeleted = true;
      });

      renderAsAuthenticatedUser();

      await waitFor(() => expect(screen.getByTestId('home-form-card-form-a')).toBeTruthy());
      fireEvent.press(screen.getByTestId('home-form-card-form-a'));

      await waitFor(() => expect(screen.getByTestId('form-detail-delete-button')).toBeTruthy());
      fireEvent.press(screen.getByTestId('form-detail-delete-button'));
      fireEvent.press(screen.getByTestId('form-detail-delete-confirm-button'));

      await waitFor(() => expect(mockedDeleteForm).toHaveBeenCalledWith('form-a'), ASYNC_TIMEOUT);
      await waitFor(
        () => expect(screen.getByTestId('home-empty-state')).toBeTruthy(),
        ASYNC_TIMEOUT,
      );
    }, 30000);
  });
});
