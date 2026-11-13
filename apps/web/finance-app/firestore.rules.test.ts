import fs from 'fs';
import path from 'path';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

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

  describe('accounts', () => {
    const accountPath = `users/${alice}/accounts/a1`;
    const validAccount = () => ({
      name: 'Nubank',
      type: 'bank',
      color: 'viz-1',
      icon: 'landmark',
      initialBalanceCents: 100000,
      openingDate: '2026-01-01',
      archived: false,
      createdAt: serverTimestamp(),
    });

    it('lets the owner create a valid account', async () => {
      await assertSucceeds(setDoc(doc(ownerDb(alice), accountPath), validAccount()));
    });

    it('accepts a negative opening balance for what is owed', async () => {
      await assertSucceeds(
        setDoc(doc(ownerDb(alice), accountPath), {
          ...validAccount(),
          type: 'credit_card',
          initialBalanceCents: -50000,
        }),
      );
    });

    it('denies another user and anonymous creating in the owner tree', async () => {
      await assertFails(setDoc(doc(strangerDb(), accountPath), validAccount()));
      await assertFails(setDoc(doc(anonymousDb(), accountPath), validAccount()));
    });

    it.each([
      ['an undeclared field', { extra: 'x' }],
      ['an unknown type', { type: 'x' }],
      ['a fractional balance', { initialBalanceCents: 1.5 }],
      ['a balance beyond the limit', { initialBalanceCents: 100000000000 }],
      ['an empty name', { name: '' }],
      ['a name over 60 characters', { name: 'n'.repeat(61) }],
      ['a malformed opening date', { openingDate: '01/01/2026' }],
      ['a non-boolean archived flag', { archived: 'no' }],
      ['a client-chosen creation time', { createdAt: new Date(2020, 0, 1) }],
    ])('denies creating with %s', async (_label, override) => {
      await assertFails(
        setDoc(doc(ownerDb(alice), accountPath), { ...validAccount(), ...override }),
      );
    });

    it('denies creating without a required field', async () => {
      const { openingDate: _omitted, ...incomplete } = validAccount();

      await assertFails(setDoc(doc(ownerDb(alice), accountPath), incomplete));
    });

    describe('updating', () => {
      beforeEach(async () => {
        await setDoc(doc(ownerDb(alice), accountPath), validAccount());
      });

      it('lets the owner rename and archive', async () => {
        await assertSucceeds(
          updateDoc(doc(ownerDb(alice), accountPath), { name: 'Nu Conta', archived: true }),
        );
      });

      it('denies changing the creation time', async () => {
        await assertFails(
          updateDoc(doc(ownerDb(alice), accountPath), { createdAt: serverTimestamp() }),
        );
      });

      it('denies adding an undeclared field', async () => {
        await assertFails(updateDoc(doc(ownerDb(alice), accountPath), { extra: 'x' }));
      });

      it('denies another user updating', async () => {
        await assertFails(updateDoc(doc(strangerDb(), accountPath), { name: 'Hack' }));
      });
    });
  });
});
