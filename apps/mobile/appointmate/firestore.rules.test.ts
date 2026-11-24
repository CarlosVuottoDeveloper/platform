import fs from 'fs';
import path from 'path';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

describe('Firestore security rules — forms', () => {
  let testEnv: RulesTestEnvironment;

  const ownerUid = 'user-alice';
  const otherUid = 'user-bob';
  const formId = 'form-1';

  const validFormData = {
    userId: ownerUid,
    createdAt: Date.now(),
    status: 'draft',
  };

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'appointmate-emulator',
      firestore: {
        rules: fs.readFileSync(path.resolve(__dirname, 'firestore.rules'), 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('own-user access', () => {
    it('allows the owner to read their own form', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`forms/${formId}`).set(validFormData);
      });

      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertSucceeds(getDoc(doc(ownerDb, 'forms', formId)));
    });

    it('allows the owner to create their own form', async () => {
      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertSucceeds(setDoc(doc(ownerDb, 'forms', formId), validFormData));
    });

    it('allows the owner to update their own form', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`forms/${formId}`).set(validFormData);
      });

      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertSucceeds(
        setDoc(doc(ownerDb, 'forms', formId), { ...validFormData, updatedAt: Date.now() }),
      );
    });

    it('allows the owner to delete their own form', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`forms/${formId}`).set(validFormData);
      });

      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertSucceeds(deleteDoc(doc(ownerDb, 'forms', formId)));
    });
  });

  describe('cross-user access', () => {
    it('denies another user from reading someone else’s form', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`forms/${formId}`).set(validFormData);
      });

      const otherDb = testEnv.authenticatedContext(otherUid).firestore();
      await assertFails(getDoc(doc(otherDb, 'forms', formId)));
    });

    it('denies another user from writing a form under their own uid but claiming someone else’s userId', async () => {
      const otherDb = testEnv.authenticatedContext(otherUid).firestore();
      await assertFails(
        setDoc(doc(otherDb, 'forms', formId), { userId: ownerUid, createdAt: Date.now() }),
      );
    });

    it('denies an unauthenticated user from reading a form', async () => {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`forms/${formId}`).set(validFormData);
      });
      await assertFails(getDoc(doc(unauthDb, 'forms', formId)));
    });

    it('denies another user from deleting someone else’s form', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`forms/${formId}`).set(validFormData);
      });

      const otherDb = testEnv.authenticatedContext(otherUid).firestore();
      await assertFails(deleteDoc(doc(otherDb, 'forms', formId)));
    });
  });

  describe('list (Dashboard query — APP-77)', () => {
    it('allows the owner to query their own forms filtered by userId', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`forms/${formId}`).set(validFormData);
      });

      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      const ownForms = query(
        collection(ownerDb, 'forms'),
        where('userId', '==', ownerUid),
        orderBy('createdAt', 'desc'),
      );
      await assertSucceeds(getDocs(ownForms));
    });

    it('denies a query without a userId filter — `read` governs `list` too', async () => {
      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      const unfiltered = query(collection(ownerDb, 'forms'), orderBy('createdAt', 'desc'));
      await assertFails(getDocs(unfiltered));
    });

    it('denies a query filtered by another user’s id', async () => {
      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      const otherUsersForms = query(
        collection(ownerDb, 'forms'),
        where('userId', '==', otherUid),
        orderBy('createdAt', 'desc'),
      );
      await assertFails(getDocs(otherUsersForms));
    });
  });

  describe('required fields', () => {
    it('denies a create missing the required createdAt field', async () => {
      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertFails(
        setDoc(doc(ownerDb, 'forms', formId), { userId: ownerUid, status: 'draft' }),
      );
    });

    it('denies a create missing the required userId field', async () => {
      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertFails(
        setDoc(doc(ownerDb, 'forms', formId), { createdAt: Date.now(), status: 'draft' }),
      );
    });

    it('denies a create missing the required status field', async () => {
      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertFails(
        setDoc(doc(ownerDb, 'forms', formId), { userId: ownerUid, createdAt: Date.now() }),
      );
    });

    it('denies a create with a status outside draft/submitted', async () => {
      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertFails(
        setDoc(doc(ownerDb, 'forms', formId), {
          userId: ownerUid,
          createdAt: Date.now(),
          status: 'archived',
        }),
      );
    });

    it('denies an update that drops the required createdAt field', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`forms/${formId}`).set(validFormData);
      });

      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertFails(
        setDoc(doc(ownerDb, 'forms', formId), { userId: ownerUid, status: 'draft' }),
      );
    });

    it('denies an update that rewrites createdAt to a different value', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`forms/${formId}`).set(validFormData);
      });

      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertFails(
        setDoc(doc(ownerDb, 'forms', formId), {
          ...validFormData,
          createdAt: validFormData.createdAt + 1,
        }),
      );
    });
  });

  describe('allowlisted fields', () => {
    it('denies a create with a field outside the allowlist', async () => {
      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertFails(
        setDoc(doc(ownerDb, 'forms', formId), {
          ...validFormData,
          notAllowed: 'nope',
        }),
      );
    });

    it('denies an update with a field outside the allowlist', async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`forms/${formId}`).set(validFormData);
      });

      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      await assertFails(
        setDoc(doc(ownerDb, 'forms', formId), { ...validFormData, notAllowed: 'nope' }),
      );
    });
  });

  describe('read/write smoke test (deferred from Task 3)', () => {
    it('writes a form with setDoc and reads it back with getDoc', async () => {
      const ownerDb = testEnv.authenticatedContext(ownerUid).firestore();
      const ref = doc(ownerDb, 'forms', formId);

      await setDoc(ref, validFormData);
      const snapshot = await getDoc(ref);

      expect(snapshot.exists()).toBe(true);
      expect(snapshot.data()).toEqual(validFormData);
    });
  });
});
