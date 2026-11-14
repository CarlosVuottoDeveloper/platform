import { useEffect, useState } from 'react';
import { Button, Card, RingProgress } from '@industry/web';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { formatDateBR } from '../../domain/calendarDate';
import { goalProgress } from '../../domain/goal';
import type { Contribution, Goal } from '../../domain/goal';
import { formatCents } from '../../domain/money';
import { deleteContribution, subscribeToContributions } from '../../services/goalsService';

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onContribute: () => void;
  onDelete: () => void;
}

function useContributions(goalId: string): Contribution[] {
  const { user } = useAuth();
  const { showToast } = useToast();
  const uid = user?.uid;
  const [contributions, setContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    if (!uid) return undefined;
    const onError = () => showToast('danger', 'Não foi possível carregar seus dados.');
    return subscribeToContributions(uid, goalId, setContributions, onError);
  }, [uid, goalId, showToast]);

  return contributions;
}

export function GoalCard({ goal, onEdit, onContribute, onDelete }: GoalCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const contributions = useContributions(goal.id);
  const progress = goalProgress(goal, contributions);
  const percent = `${Math.floor(progress.ratio * 100)}%`;
  const newestFirst = [...contributions].sort((a, b) => b.date.localeCompare(a.date));

  async function removeContribution(contribution: Contribution) {
    if (!user) return;
    try {
      await deleteContribution(user.uid, goal.id, contribution.id);
    } catch {
      showToast('danger', 'Não foi possível excluir.');
    }
  }

  return (
    <Card elevation="sm" data-testid={`goal-${goal.id}`}>
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <RingProgress
            value={progress.ratio}
            max={1}
            size={72}
            centerLabel={percent}
            accessibilityLabel={`${goal.name}: ${percent} concluído`}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 'var(--text-h4)' }}>{goal.name}</h2>
            <div>{`${formatCents(progress.savedCents)} de ${formatCents(goal.targetCents)}`}</div>
            {goal.deadline ? (
              <div style={{ fontSize: 'var(--text-h6)', color: 'var(--color-neutral-400)' }}>
                {`Prazo: ${formatDateBR(goal.deadline)}`}
              </div>
            ) : null}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Button
            size="sm"
            variant="secondary"
            aria-label={`Aportar em ${goal.name}`}
            onClick={onContribute}
          >
            Aportar
          </Button>
          <Button size="sm" variant="ghost" aria-label={`Editar ${goal.name}`} onClick={onEdit}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" aria-label={`Excluir ${goal.name}`} onClick={onDelete}>
            Excluir
          </Button>
        </div>
        {newestFirst.length > 0 ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {newestFirst.map((contribution) => (
              <li
                key={contribution.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  fontSize: 'var(--text-h6)',
                }}
              >
                <span style={{ flex: 1 }}>{formatDateBR(contribution.date)}</span>
                <span>{formatCents(contribution.amountCents)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Remover aporte de ${formatDateBR(contribution.date)}`}
                  onClick={() => removeContribution(contribution)}
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
