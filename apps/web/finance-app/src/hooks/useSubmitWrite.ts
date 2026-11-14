import { useToast } from '../context/ToastContext/ToastContext';

export function useSubmitWrite(
  onClose: () => void,
): (write: () => Promise<unknown>) => Promise<void> {
  const { showToast } = useToast();
  const warn = () => showToast('danger', 'Não foi possível salvar.');

  return async (write) => {
    if (!window.navigator.onLine) {
      write().catch(warn);
      showToast('accent', 'Sem conexão. A alteração será enviada quando a internet voltar.');
      onClose();
      return;
    }
    try {
      await write();
      onClose();
    } catch {
      warn();
    }
  };
}
