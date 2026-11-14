import { useState } from 'react';
import { Button, EmptyState } from '@industry/web';
import { ConfirmSheet } from '../../components/ConfirmSheet/ConfirmSheet';
import { ContributionSheet } from '../../components/ContributionSheet/ContributionSheet';
import { GoalSheet } from '../../components/GoalSheet/GoalSheet';
import { useSignedInUser } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { useUserData } from '../../context/UserDataContext/UserDataContext';
import { useIsWideScreen } from '../../hooks/useIsWideScreen';
import type { Goal } from '../../domain/goal';
import { deleteGoal } from '../../services/goalsService';
import { GoalCard } from './GoalCard';

type SheetState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit' | 'contribute' | 'delete'; goal: Goal };

export function Goals() {
  const user = useSignedInUser();
  const { showToast } = useToast();
  const { goals } = useUserData();
  const isWide = useIsWideScreen();
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' });
  const closeSheet = () => setSheet({ mode: 'closed' });
  const sorted = [...goals].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  async function confirmDelete(goal: Goal) {
    closeSheet();
    try {
      await deleteGoal(user.uid, goal.id);
    } catch {
      showToast('danger', 'Não foi possível excluir.');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Metas</h1>
        <Button variant="primary" onClick={() => setSheet({ mode: 'create' })}>
          Nova meta
        </Button>
      </div>
      {sorted.length === 0 ? (
        <EmptyState
          title="Nenhuma meta cadastrada"
          body="Defina um objetivo, como uma viagem ou uma reserva de emergência, e acompanhe os aportes."
        />
      ) : (
        <div
          data-testid="goal-grid"
          style={{
            display: 'grid',
            gap: 'var(--space-4)',
            gridTemplateColumns: isWide ? 'repeat(3, 1fr)' : '1fr',
            alignItems: 'start',
          }}
        >
          {sorted.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => setSheet({ mode: 'edit', goal })}
              onContribute={() => setSheet({ mode: 'contribute', goal })}
              onDelete={() => setSheet({ mode: 'delete', goal })}
            />
          ))}
        </div>
      )}
      {sheet.mode === 'create' ? <GoalSheet onClose={closeSheet} /> : null}
      {sheet.mode === 'edit' ? <GoalSheet goal={sheet.goal} onClose={closeSheet} /> : null}
      {sheet.mode === 'contribute' ? (
        <ContributionSheet goal={sheet.goal} onClose={closeSheet} />
      ) : null}
      {sheet.mode === 'delete' ? (
        <ConfirmSheet
          title="Excluir meta"
          message={`A meta "${sheet.goal.name}" e seus aportes serão excluídos.`}
          confirmLabel="Excluir"
          onConfirm={() => confirmDelete(sheet.goal)}
          onDismiss={closeSheet}
        />
      ) : null}
    </div>
  );
}
