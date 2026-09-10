import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { createForm, deleteForm, getFormRecord, listForms, updateForm } from './formsService';
import type { FormValues } from '../../domain/form';

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(),
  updateDoc: jest.fn(),
  where: jest.fn(),
}));

jest.mock('../firebase', () => ({
  db: { fake: 'db-instance' },
}));

const mockedAddDoc = addDoc as jest.Mock;
const mockedCollection = collection as jest.Mock;
const mockedDeleteDoc = deleteDoc as jest.Mock;
const mockedDoc = doc as jest.Mock;
const mockedGetDoc = getDoc as jest.Mock;
const mockedGetDocs = getDocs as jest.Mock;
const mockedOrderBy = orderBy as jest.Mock;
const mockedQuery = query as jest.Mock;
const mockedServerTimestamp = serverTimestamp as jest.Mock;
const mockedUpdateDoc = updateDoc as jest.Mock;
const mockedWhere = where as jest.Mock;

const sampleValues: FormValues = {
  appointmentDate: '15/03/2026',
  lastAppointmentDate: '10/01/2026',
  overallMood: 'bem',
  overallSummary: 'Semana tranquila.',
  sleep: 'Dormindo bem.',
  energy: 'Disposição normal.',
  appetite: 'Apetite estável.',
  concentration: 'Concentração ok.',
  medications: [{ text: 'Sertralina 50mg 1x ao dia' }],
  medicationAdherence: 'Sim, todos os dias.',
  medicationEffects: 'Nenhum efeito colateral notado.',
  whatWentWell: 'Consegui manter a rotina de sono.',
  whatHasBeenHard: 'Ansiedade no trabalho.',
  context: 'Mudança de emprego.',
  questions: [{ text: 'Posso reduzir a dose?' }],
  todayFocus: 'Ajustar a medicação.',
  consultationNotes: '',
};

const sampleFirestoreData = {
  appointmentDate: '15/03/2026',
  lastAppointmentDate: '10/01/2026',
  overallMood: 'bem',
  overallSummary: 'Semana tranquila.',
  sleep: 'Dormindo bem.',
  energy: 'Disposição normal.',
  appetite: 'Apetite estável.',
  concentration: 'Concentração ok.',
  medications: ['Sertralina 50mg 1x ao dia'],
  medicationAdherence: 'Sim, todos os dias.',
  medicationEffects: 'Nenhum efeito colateral notado.',
  whatWentWell: 'Consegui manter a rotina de sono.',
  whatHasBeenHard: 'Ansiedade no trabalho.',
  context: 'Mudança de emprego.',
  questions: ['Posso reduzir a dose?'],
  todayFocus: 'Ajustar a medicação.',
  consultationNotes: '',
};

describe('formsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createForm', () => {
    it('adds a document to the forms collection with userId, status and createdAt', async () => {
      mockedCollection.mockReturnValue({ ref: 'forms-collection' });
      mockedServerTimestamp.mockReturnValue('server-timestamp');
      mockedAddDoc.mockResolvedValue({ id: 'new-form-id' });

      await createForm('user-abc', sampleValues, 'draft');

      expect(mockedAddDoc).toHaveBeenCalledWith(
        { ref: 'forms-collection' },
        {
          userId: 'user-abc',
          status: 'draft',
          ...sampleFirestoreData,
          createdAt: 'server-timestamp',
        },
      );
    });

    it('flattens medications and questions from {text} objects to plain strings, dropping blank items', async () => {
      mockedCollection.mockReturnValue({});
      mockedServerTimestamp.mockReturnValue('server-timestamp');
      mockedAddDoc.mockResolvedValue({ id: 'new-form-id' });

      await createForm(
        'user-abc',
        {
          ...sampleValues,
          medications: [{ text: 'Remédio 1' }, { text: '  ' }, { text: 'Remédio 2' }],
          questions: [{ text: 'Pergunta 1' }, { text: '' }],
        },
        'submitted',
      );

      const [, payload] = mockedAddDoc.mock.calls[0];
      expect(payload.medications).toEqual(['Remédio 1', 'Remédio 2']);
      expect(payload.questions).toEqual(['Pergunta 1']);
    });

    it('returns the id of the newly created document', async () => {
      mockedCollection.mockReturnValue({});
      mockedServerTimestamp.mockReturnValue('server-timestamp');
      mockedAddDoc.mockResolvedValue({ id: 'new-form-id' });

      const id = await createForm('user-abc', sampleValues, 'draft');

      expect(id).toBe('new-form-id');
    });
  });

  describe('updateForm', () => {
    it('updates the document with the new values, status and an updatedAt timestamp', async () => {
      mockedDoc.mockReturnValue({ ref: 'form-doc' });
      mockedServerTimestamp.mockReturnValue('server-timestamp');
      mockedUpdateDoc.mockResolvedValue(undefined);

      await updateForm('form-1', sampleValues, 'submitted');

      expect(mockedUpdateDoc).toHaveBeenCalledWith(
        { ref: 'form-doc' },
        {
          status: 'submitted',
          ...sampleFirestoreData,
          updatedAt: 'server-timestamp',
        },
      );
    });

    it('does not include userId or createdAt in the update payload', async () => {
      mockedDoc.mockReturnValue({});
      mockedServerTimestamp.mockReturnValue('server-timestamp');
      mockedUpdateDoc.mockResolvedValue(undefined);

      await updateForm('form-1', sampleValues, 'draft');

      const [, payload] = mockedUpdateDoc.mock.calls[0];
      expect(payload).not.toHaveProperty('userId');
      expect(payload).not.toHaveProperty('createdAt');
    });
  });

  describe('getFormRecord', () => {
    it('returns null when the document does not exist', async () => {
      mockedDoc.mockReturnValue({});
      mockedGetDoc.mockResolvedValue({ exists: () => false });

      const result = await getFormRecord('missing-form');

      expect(result).toBeNull();
    });

    it('returns values, status and converted timestamps', async () => {
      const createdAtDate = new Date('2026-03-01T10:00:00Z');
      const updatedAtDate = new Date('2026-03-10T15:30:00Z');
      mockedDoc.mockReturnValue({});
      mockedGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          ...sampleFirestoreData,
          status: 'submitted',
          createdAt: { toDate: () => createdAtDate },
          updatedAt: { toDate: () => updatedAtDate },
        }),
      });

      const result = await getFormRecord('form-1');

      expect(result).toEqual({
        values: sampleValues,
        status: 'submitted',
        createdAt: createdAtDate,
        updatedAt: updatedAtDate,
      });
    });

    it('defaults status to draft and dates to null when missing', async () => {
      mockedDoc.mockReturnValue({});
      mockedGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({}),
      });

      const result = await getFormRecord('form-1');

      expect(result?.status).toBe('draft');
      expect(result?.createdAt).toBeNull();
      expect(result?.updatedAt).toBeNull();
    });
  });

  describe('listForms', () => {
    it('queries forms filtered by userId and ordered by createdAt desc', async () => {
      mockedCollection.mockReturnValue({ ref: 'forms-collection' });
      mockedWhere.mockReturnValue('where-clause');
      mockedOrderBy.mockReturnValue('order-by-clause');
      mockedQuery.mockReturnValue('the-query');
      mockedGetDocs.mockResolvedValue({ docs: [] });

      await listForms('user-abc');

      expect(mockedWhere).toHaveBeenCalledWith('userId', '==', 'user-abc');
      expect(mockedOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockedQuery).toHaveBeenCalledWith(
        { ref: 'forms-collection' },
        'where-clause',
        'order-by-clause',
      );
      expect(mockedGetDocs).toHaveBeenCalledWith('the-query');
    });

    it('maps each document into a FormSummary', async () => {
      const createdAtDate = new Date('2026-03-01T10:00:00Z');
      mockedCollection.mockReturnValue({});
      mockedWhere.mockReturnValue('where-clause');
      mockedOrderBy.mockReturnValue('order-by-clause');
      mockedQuery.mockReturnValue('the-query');
      mockedGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'form-1',
            data: () => ({
              appointmentDate: '15/03/2026',
              overallSummary: 'Semana tranquila.',
              status: 'submitted',
              createdAt: { toDate: () => createdAtDate },
            }),
          },
        ],
      });

      const result = await listForms('user-abc');

      expect(result).toEqual([
        {
          id: 'form-1',
          appointmentDate: '15/03/2026',
          overallSummary: 'Semana tranquila.',
          status: 'submitted',
          createdAt: createdAtDate,
          updatedAt: null,
        },
      ]);
    });

    it('fills in safe defaults for missing fields', async () => {
      mockedCollection.mockReturnValue({});
      mockedWhere.mockReturnValue('where-clause');
      mockedOrderBy.mockReturnValue('order-by-clause');
      mockedQuery.mockReturnValue('the-query');
      mockedGetDocs.mockResolvedValue({
        docs: [{ id: 'form-1', data: () => ({}) }],
      });

      const result = await listForms('user-abc');

      expect(result).toEqual([
        {
          id: 'form-1',
          appointmentDate: '',
          overallSummary: '',
          status: 'draft',
          createdAt: null,
          updatedAt: null,
        },
      ]);
    });

    it('returns an empty array when the user has no forms', async () => {
      mockedCollection.mockReturnValue({});
      mockedWhere.mockReturnValue('where-clause');
      mockedOrderBy.mockReturnValue('order-by-clause');
      mockedQuery.mockReturnValue('the-query');
      mockedGetDocs.mockResolvedValue({ docs: [] });

      const result = await listForms('user-abc');

      expect(result).toEqual([]);
    });
  });

  describe('deleteForm', () => {
    it('deletes the document by id', async () => {
      mockedDoc.mockReturnValue({ ref: 'form-doc' });
      mockedDeleteDoc.mockResolvedValue(undefined);

      await deleteForm('form-1');

      expect(mockedDeleteDoc).toHaveBeenCalledWith({ ref: 'form-doc' });
    });
  });
});
