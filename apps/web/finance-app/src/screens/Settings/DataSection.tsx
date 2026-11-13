import { useState } from 'react';
import { Button, Sheet, TextField } from '@industry/web';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useToast } from '../../context/ToastContext/ToastContext';
import { deleteCurrentUser } from '../../services/authService';
import { deleteAllUserData, downloadAllData } from '../../services/userDataService';

const CONFIRMATION_WORD = 'EXCLUIR';

export function DataSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);

  function closeConfirmation() {
    setConfirming(false);
    setTyped('');
  }

  async function exportData() {
    if (!user) return;
    try {
      await downloadAllData(user.uid);
    } catch {
      showToast('danger', 'Não foi possível exportar.');
    }
  }

  async function deleteEverything() {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteAllUserData(user.uid);
    } catch {
      showToast('danger', 'Não foi possível excluir. Tente novamente.');
      setDeleting(false);
      return;
    }
    try {
      await deleteCurrentUser();
    } catch {
      showToast(
        'warning',
        'Seus dados foram excluídos, mas o acesso não pôde ser removido. Tente excluir a conta de novo.',
      );
      setDeleting(false);
      closeConfirmation();
    }
  }

  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)', justifyItems: 'start' }}>
      <h2 style={{ margin: 0, fontSize: 'var(--text-h4)' }}>Seus dados</h2>
      <p style={{ margin: 0, color: 'var(--color-neutral-400)' }}>
        Baixe uma cópia de tudo que você cadastrou ou exclua sua conta e todos os dados.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <Button variant="secondary" onClick={exportData}>
          Exportar meus dados
        </Button>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          Excluir minha conta
        </Button>
      </div>
      {confirming ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
          <Sheet
            title="Excluir conta e todos os dados"
            onDismiss={closeConfirmation}
            style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}
            actions={
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={closeConfirmation}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  disabled={typed !== CONFIRMATION_WORD || deleting}
                  onClick={deleteEverything}
                >
                  Excluir tudo
                </Button>
              </div>
            }
          >
            <p style={{ margin: 0 }}>
              Contas, movimentações, categorias, recorrentes, orçamentos e metas serão apagados de
              forma definitiva. Exporte seus dados antes, se quiser guardá-los.
            </p>
            <TextField
              label={`Digite ${CONFIRMATION_WORD} para confirmar`}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
            />
          </Sheet>
        </div>
      ) : null}
    </section>
  );
}
