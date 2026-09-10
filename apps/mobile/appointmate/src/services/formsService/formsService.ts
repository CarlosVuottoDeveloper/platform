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
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { FormStatus, FormValues } from '../../domain/form';

export interface FormRecord {
  values: FormValues;
  status: FormStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface FormSummary {
  id: string;
  appointmentDate: string;
  overallSummary: string;
  status: FormStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
}

function toStringList(items: { text: string }[]) {
  return items.map((item) => item.text.trim()).filter((text) => text.length > 0);
}

function toFirestoreData(values: FormValues) {
  return {
    appointmentDate: values.appointmentDate,
    lastAppointmentDate: values.lastAppointmentDate,
    overallMood: values.overallMood,
    overallSummary: values.overallSummary,
    sleep: values.sleep,
    energy: values.energy,
    appetite: values.appetite,
    concentration: values.concentration,
    medications: toStringList(values.medications),
    medicationAdherence: values.medicationAdherence,
    medicationEffects: values.medicationEffects,
    whatWentWell: values.whatWentWell,
    whatHasBeenHard: values.whatHasBeenHard,
    context: values.context,
    questions: toStringList(values.questions),
    todayFocus: values.todayFocus,
    consultationNotes: values.consultationNotes,
  };
}

export async function createForm(
  userId: string,
  values: FormValues,
  status: FormStatus,
): Promise<string> {
  const ref = await addDoc(collection(db, 'forms'), {
    userId,
    status,
    ...toFirestoreData(values),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateForm(
  formId: string,
  values: FormValues,
  status: FormStatus,
): Promise<void> {
  await updateDoc(doc(db, 'forms', formId), {
    status,
    ...toFirestoreData(values),
    updatedAt: serverTimestamp(),
  });
}

function toFormValues(data: Record<string, unknown>): FormValues {
  return {
    appointmentDate: (data.appointmentDate ?? '') as string,
    lastAppointmentDate: (data.lastAppointmentDate ?? '') as string,
    overallMood: (data.overallMood ?? null) as FormValues['overallMood'],
    overallSummary: (data.overallSummary ?? '') as string,
    sleep: (data.sleep ?? '') as string,
    energy: (data.energy ?? '') as string,
    appetite: (data.appetite ?? '') as string,
    concentration: (data.concentration ?? '') as string,
    medications: ((data.medications ?? []) as string[]).map((text) => ({ text })),
    medicationAdherence: (data.medicationAdherence ?? '') as string,
    medicationEffects: (data.medicationEffects ?? '') as string,
    whatWentWell: (data.whatWentWell ?? '') as string,
    whatHasBeenHard: (data.whatHasBeenHard ?? '') as string,
    context: (data.context ?? '') as string,
    questions: ((data.questions ?? []) as string[]).map((text) => ({ text })),
    todayFocus: (data.todayFocus ?? '') as string,
    consultationNotes: (data.consultationNotes ?? '') as string,
  };
}

function toDateOrNull(value: unknown): Date | null {
  const timestamp = value as Timestamp | undefined;
  return typeof timestamp?.toDate === 'function' ? timestamp.toDate() : null;
}

export async function getFormRecord(formId: string): Promise<FormRecord | null> {
  const snapshot = await getDoc(doc(db, 'forms', formId));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    values: toFormValues(data),
    status: (data.status ?? 'draft') as FormStatus,
    createdAt: toDateOrNull(data.createdAt),
    updatedAt: toDateOrNull(data.updatedAt),
  };
}

export async function listForms(userId: string): Promise<FormSummary[]> {
  // firestore.rules' `read` permission also governs `list` — this filter is
  // required, not just an optimization: a query without it is denied outright.
  const formsQuery = query(
    collection(db, 'forms'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(formsQuery);

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      appointmentDate: (data.appointmentDate ?? '') as string,
      overallSummary: (data.overallSummary ?? '') as string,
      status: (data.status ?? 'draft') as FormStatus,
      createdAt: toDateOrNull(data.createdAt),
      updatedAt: toDateOrNull(data.updatedAt),
    };
  });
}

export async function deleteForm(formId: string): Promise<void> {
  await deleteDoc(doc(db, 'forms', formId));
}
