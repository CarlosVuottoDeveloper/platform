import fs from 'fs';
import path from 'path';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

describe('Firestore security rules — finance-app', () => {
  let testEnv: RulesTestEnvironment;

  const alice = 'alice';
  const bob = 'bob';

  const ownerDb = (uid: string) => testEnv.authenticatedContext(uid).firestore();
  const strangerDb = () => testEnv.authenticatedContext(bob).firestore();
  const anonymousDb = () => testEnv.unauthenticatedContext().firestore();

  async function seed(documentPath: string, data: Record<string, unknown>) {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), documentPath), data);
    });
  }

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'finance-app-emulator',
      firestore: {
        rules: fs.readFileSync(path.resolve(__dirname, 'firestore.rules'), 'utf8'),
        host: '127.0.0.1',
        port: 8082,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('ownership', () => {
    const accountPath = `users/${alice}/accounts/a1`;

    beforeEach(async () => {
      await seed(accountPath, { name: 'Conta' });
    });

    it('lets the owner read their own document', async () => {
      await assertSucceeds(getDoc(doc(ownerDb(alice), accountPath)));
    });

    it('lets the owner delete their own document', async () => {
      await assertSucceeds(deleteDoc(doc(ownerDb(alice), accountPath)));
    });

    it('denies another user reading or deleting', async () => {
      await assertFails(getDoc(doc(strangerDb(), accountPath)));
      await assertFails(deleteDoc(doc(strangerDb(), accountPath)));
    });

    it('denies anonymous reading or deleting', async () => {
      await assertFails(getDoc(doc(anonymousDb(), accountPath)));
      await assertFails(deleteDoc(doc(anonymousDb(), accountPath)));
    });

    it('denies the owner writing to an undeclared collection', async () => {
      await assertFails(setDoc(doc(ownerDb(alice), `users/${alice}/qualquer/x`), { a: 1 }));
    });

    it('denies reading outside the users tree', async () => {
      await assertFails(getDoc(doc(ownerDb(alice), 'outra/x')));
    });
  });
});
