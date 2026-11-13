import { useState } from 'react';
import { Button } from '@industry/web';
import { ConfirmSheet } from '../../components/ConfirmSheet/ConfirmSheet';
import { RecurrenceSheet } from '../../components/RecurrenceSheet/RecurrenceSheet';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { formatCents } from '../../domain/money';
import type { Recurrence } from '../../domain/recurrence';
import { accountName, categoryName } from '../../domain/transactionList';
import { deleteRecurrence } from '../../services/recurrencesService';

type SheetState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; recurrence: Recurrence }
  | { mode: 'delete'; recurrence: Recurrence };

export function RecurrencesSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { accounts, categories, recurrences } = useUserData();
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' });
  const closeSheet = () => setSheet({ mode: 'closed' });

  async function confirmDelete(recurrence: Recurrence) {
    if (!user) return;
    closeSheet();
    try {
      await deleteRecurrence(user.uid, recurrence.id);
    } catch {
      showToast('danger', 'Não foi possível excluir.');
    }
  }

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-h4)' }}>Recorrentes</h2>
        <Button size="sm" variant="secondary" onClick={() => setSheet({ mode: 'create' })}>
          Nova recorrente
        </Button>
      </div>
      {recurrences.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--color-neutral-400)' }}>
          Nenhuma movimentação recorrente.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {recurrences.map((recurrence) => {
            const category = categoryName(categories, recurrence.categoryId);
            const title = recurrence.description || category;
            const amount = formatCents(recurrence.amountCents);
            return (
              <li
                key={recurrence.id}
                data-testid={`recurrence-${recurrence.id}`}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) 0',
                  borderBottom: '1px solid var(--color-divider)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div>{title}</div>
                  <div style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
                    {`Todo dia ${recurrence.dayOfMonth} · ${category} · ${accountName(accounts, recurrence.accountId)}`}
                  </div>
                </div>
                <span style={{ fontWeight: 'var(--font-medium-weight)' }}>
                  {recurrence.kind === 'income' ? `+${amount}` : `-${amount}`}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Editar ${title}`}
                  onClick={() => setSheet({ mode: 'edit', recurrence })}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Excluir ${title}`}
                  onClick={() => setSheet({ mode: 'delete', recurrence })}
                >
                  Excluir
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      {sheet.mode === 'create' ? <RecurrenceSheet onClose={closeSheet} /> : null}
      {sheet.mode === 'edit' ? (
        <RecurrenceSheet recurrence={sheet.recurrence} onClose={closeSheet} />
      ) : null}
      {sheet.mode === 'delete' ? (
        <ConfirmSheet
          title="Excluir recorrente"
          message="Os lançamentos já criados continuam; só deixam de ser gerados os próximos."
          confirmLabel="Excluir"
          onConfirm={() => confirmDelete(sheet.recurrence)}
          onDismiss={closeSheet}
        />
      ) : null}
    </section>
  );
}
