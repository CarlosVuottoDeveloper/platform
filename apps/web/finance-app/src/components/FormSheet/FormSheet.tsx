import type { FormEventHandler, ReactNode } from 'react';
import { Button, Sheet } from '@industry/web';

interface FormSheetProps {
  title: string;
  submitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onDismiss: () => void;
  children: ReactNode;
}

export function FormSheet({ title, submitting, onSubmit, onDismiss, children }: FormSheetProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
      <Sheet
        title={title}
        onDismiss={onDismiss}
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          alignSelf: 'center',
        }}
      >
        <form noValidate onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {children}
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={onDismiss}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              Salvar
            </Button>
          </div>
        </form>
      </Sheet>
    </div>
  );
}
