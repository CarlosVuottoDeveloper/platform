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
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { materializeRecurrence } from './src/services/recurrenceMaterializer';

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

  describe('transactions', () => {
    const transactionPath = `users/${alice}/transactions/t1`;
    const validExpense = () => ({
      kind: 'expense',
      amountCents: 1999,
      date: '2026-03-05',
      accountId: 'a1',
      toAccountId: null,
      categoryId: 'c1',
      description: 'Mercado',
      tags: ['casa'],
      recurrenceId: null,
      installment: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const validTransfer = () => ({
      ...validExpense(),
      kind: 'transfer',
      toAccountId: 'a2',
      categoryId: null,
    });

    it('lets the owner create an expense, an income and a transfer', async () => {
      const db = ownerDb(alice);
      await assertSucceeds(setDoc(doc(db, transactionPath), validExpense()));
      await assertSucceeds(
        setDoc(doc(db, `users/${alice}/transactions/t2`), { ...validExpense(), kind: 'income' }),
      );
      await assertSucceeds(setDoc(doc(db, `users/${alice}/transactions/t3`), validTransfer()));
    });

    it('accepts an instalment and a recurrence link', async () => {
      await assertSucceeds(
        setDoc(doc(ownerDb(alice), transactionPath), {
          ...validExpense(),
          recurrenceId: 'r1',
          installment: { groupId: 'g1', index: 2, count: 3 },
        }),
      );
    });

    it('denies another user and anonymous creating', async () => {
      await assertFails(setDoc(doc(strangerDb(), transactionPath), validExpense()));
      await assertFails(setDoc(doc(anonymousDb(), transactionPath), validExpense()));
    });

    it.each([
      ['an undeclared field', { extra: 'x' }],
      ['an unknown kind', { kind: 'gift' }],
      ['a zero amount', { amountCents: 0 }],
      ['a negative amount', { amountCents: -1 }],
      ['a fractional amount', { amountCents: 10.5 }],
      ['an amount beyond the limit', { amountCents: 100000000000 }],
      ['a malformed date', { date: '05/03/2026' }],
      ['no account', { accountId: '' }],
      ['an expense without a category', { categoryId: null }],
      ['an expense with a destination account', { toAccountId: 'a2' }],
      ['a description over 140 characters', { description: 'd'.repeat(141) }],
      ['more than 10 tags', { tags: Array.from({ length: 11 }, (_, i) => `t${i}`) }],
      ['a non-text tag', { tags: [1] }],
      ['a tag over 30 characters', { tags: ['t'.repeat(31)] }],
      ['an empty tag', { tags: [''] }],
      ['tags that are not a list', { tags: 'casa' }],
      [
        'an instalment index above its count',
        { installment: { groupId: 'g', index: 4, count: 3 } },
      ],
      ['an instalment count above 48', { installment: { groupId: 'g', index: 1, count: 49 } }],
      [
        'an instalment with an extra field',
        { installment: { groupId: 'g', index: 1, count: 2, x: 1 } },
      ],
      ['a client-chosen creation time', { createdAt: new Date(2020, 0, 1) }],
    ])('denies creating with %s', async (_label, override) => {
      await assertFails(
        setDoc(doc(ownerDb(alice), transactionPath), { ...validExpense(), ...override }),
      );
    });

    it.each([
      ['no destination', { toAccountId: null }],
      ['the same account on both sides', { toAccountId: 'a1' }],
      ['a category', { categoryId: 'c1' }],
    ])('denies a transfer with %s', async (_label, override) => {
      await assertFails(
        setDoc(doc(ownerDb(alice), transactionPath), { ...validTransfer(), ...override }),
      );
    });

    describe('updating', () => {
      beforeEach(async () => {
        await setDoc(doc(ownerDb(alice), transactionPath), validExpense());
      });

      it('lets the owner edit and requires a fresh update time', async () => {
        await assertSucceeds(
          updateDoc(doc(ownerDb(alice), transactionPath), {
            amountCents: 2500,
            updatedAt: serverTimestamp(),
          }),
        );
        await assertFails(updateDoc(doc(ownerDb(alice), transactionPath), { amountCents: 2600 }));
      });

      it('denies changing the creation time', async () => {
        await assertFails(
          updateDoc(doc(ownerDb(alice), transactionPath), {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
        );
      });

      it('denies another user updating', async () => {
        await assertFails(
          updateDoc(doc(strangerDb(), transactionPath), {
            amountCents: 1,
            updatedAt: serverTimestamp(),
          }),
        );
      });
    });
  });

  describe('categories and the seeding marker', () => {
    const categoryPath = `users/${alice}/categories/c1`;
    const validCategory = () => ({
      name: 'Alimentação',
      kind: 'expense',
      color: 'viz-5',
      icon: 'utensils',
      archived: false,
    });

    it('lets the owner create, rename and archive a category', async () => {
      const db = ownerDb(alice);
      await assertSucceeds(setDoc(doc(db, categoryPath), validCategory()));
      await assertSucceeds(updateDoc(doc(db, categoryPath), { name: 'Mercado', archived: true }));
    });

    it.each([
      ['an undeclared field', { extra: 'x' }],
      ['an unknown kind', { kind: 'transfer' }],
      ['an empty name', { name: '' }],
      ['a name over 40 characters', { name: 'n'.repeat(41) }],
      ['a non-boolean archived flag', { archived: 0 }],
    ])('denies a category with %s', async (_label, override) => {
      await assertFails(
        setDoc(doc(ownerDb(alice), categoryPath), { ...validCategory(), ...override }),
      );
    });

    it('denies another user creating a category in the owner tree', async () => {
      await assertFails(setDoc(doc(strangerDb(), categoryPath), validCategory()));
    });

    it('lets the owner read and write the seeding marker once, stamped by the server', async () => {
      const db = ownerDb(alice);
      await assertSucceeds(getDoc(doc(db, `users/${alice}`)));
      await assertSucceeds(setDoc(doc(db, `users/${alice}`), { seededAt: serverTimestamp() }));
      await assertFails(setDoc(doc(db, `users/${alice}`), { seededAt: serverTimestamp() }));
    });

    it('denies a seeding marker with other fields or a client-chosen time', async () => {
      const db = ownerDb(alice);
      await assertFails(
        setDoc(doc(db, `users/${alice}`), { seededAt: serverTimestamp(), role: 'admin' }),
      );
      await assertFails(setDoc(doc(db, `users/${alice}`), { seededAt: new Date(2020, 0, 1) }));
    });

    it('denies another user reading or writing the seeding marker', async () => {
      await assertFails(getDoc(doc(strangerDb(), `users/${alice}`)));
      await assertFails(
        setDoc(doc(strangerDb(), `users/${alice}`), { seededAt: serverTimestamp() }),
      );
    });
  });

  describe('recurrences', () => {
    const recurrencePath = `users/${alice}/recurrences/r1`;
    const validRecurrence = () => ({
      kind: 'expense',
      amountCents: 150000,
      dayOfMonth: 5,
      accountId: 'a1',
      categoryId: 'c1',
      description: 'Aluguel',
      tags: ['casa'],
      startMonth: '2026-01',
      endMonth: null,
      materializedThrough: null,
    });

    it('lets the owner create and update a rule', async () => {
      const db = ownerDb(alice);
      await assertSucceeds(setDoc(doc(db, recurrencePath), validRecurrence()));
      await assertSucceeds(
        updateDoc(doc(db, recurrencePath), { endMonth: '2026-12', materializedThrough: '2026-02' }),
      );
    });

    it.each([
      ['an undeclared field', { extra: 'x' }],
      ['a transfer kind', { kind: 'transfer' }],
      ['a zero amount', { amountCents: 0 }],
      ['day 0', { dayOfMonth: 0 }],
      ['day 32', { dayOfMonth: 32 }],
      ['a fractional day', { dayOfMonth: 5.5 }],
      ['a malformed start month', { startMonth: '2026-1' }],
      ['a malformed end month', { endMonth: 'dezembro' }],
      ['no category', { categoryId: null }],
    ])('denies a rule with %s', async (_label, override) => {
      await assertFails(
        setDoc(doc(ownerDb(alice), recurrencePath), { ...validRecurrence(), ...override }),
      );
    });

    it('denies another user creating a rule in the owner tree', async () => {
      await assertFails(setDoc(doc(strangerDb(), recurrencePath), validRecurrence()));
    });

    describe('materialising', () => {
      const transactionIds = async () =>
        (await getDocs(collection(ownerDb(alice), `users/${alice}/transactions`))).docs
          .map((document) => document.id)
          .sort();

      beforeEach(async () => {
        await setDoc(doc(ownerDb(alice), recurrencePath), validRecurrence());
      });

      it('creates exactly one movement per month when two tabs run at the same time', async () => {
        const outcomes = await Promise.allSettled([
          materializeRecurrence(ownerDb(alice), alice, 'r1', '2026-03-10'),
          materializeRecurrence(ownerDb(alice), alice, 'r1', '2026-03-10'),
        ]);

        expect(outcomes.some((outcome) => outcome.status === 'fulfilled')).toBe(true);

        expect(await transactionIds()).toEqual(['r1_2026-01', 'r1_2026-02', 'r1_2026-03']);
        const rule = await getDoc(doc(ownerDb(alice), recurrencePath));
        expect(rule.data()?.materializedThrough).toBe('2026-03');
      });

      it('does not recreate an occurrence the user deleted', async () => {
        await materializeRecurrence(ownerDb(alice), alice, 'r1', '2026-03-10');
        await deleteDoc(doc(ownerDb(alice), `users/${alice}/transactions/r1_2026-02`));

        await materializeRecurrence(ownerDb(alice), alice, 'r1', '2026-03-10');

        expect(await transactionIds()).toEqual(['r1_2026-01', 'r1_2026-03']);
      });
    });
  });

  describe('budgets', () => {
    const budgetPath = `users/${alice}/budgets/c1`;

    it('lets the owner set and change the limit of a category', async () => {
      const db = ownerDb(alice);
      await assertSucceeds(setDoc(doc(db, budgetPath), { categoryId: 'c1', limitCents: 100000 }));
      await assertSucceeds(setDoc(doc(db, budgetPath), { categoryId: 'c1', limitCents: 120000 }));
    });

    it.each([
      ['an undeclared field', { categoryId: 'c1', limitCents: 100000, extra: 1 }],
      ['a zero limit', { categoryId: 'c1', limitCents: 0 }],
      ['a fractional limit', { categoryId: 'c1', limitCents: 10.5 }],
      ['a category different from its key', { categoryId: 'c2', limitCents: 100000 }],
      ['no limit', { categoryId: 'c1' }],
    ])('denies a budget with %s', async (_label, data) => {
      await assertFails(setDoc(doc(ownerDb(alice), budgetPath), data));
    });

    it('denies another user setting a budget in the owner tree', async () => {
      await assertFails(
        setDoc(doc(strangerDb(), budgetPath), { categoryId: 'c1', limitCents: 100000 }),
      );
    });
  });
});
