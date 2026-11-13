import { Button, Sheet } from '@industry/web';

interface ConfirmSheetProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  alternative?: { label: string; onChoose: () => void };
  onDismiss: () => void;
}

export function ConfirmSheet({
  title,
  message,
  confirmLabel,
  onConfirm,
  alternative,
  onDismiss,
}: ConfirmSheetProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
      <Sheet
        title={title}
        onDismiss={onDismiss}
        style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={onDismiss}>
              Cancelar
            </Button>
            {alternative ? (
              <Button variant="danger" onClick={alternative.onChoose}>
                {alternative.label}
              </Button>
            ) : null}
            <Button variant="danger" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0 }}>{message}</p>
      </Sheet>
    </div>
  );
}
