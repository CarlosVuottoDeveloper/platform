import { useState } from 'react';
import { Button, Card } from '@industry/web';
import { PrivacyNotice } from '../../components/PrivacyNotice/PrivacyNotice';
import { useToast } from '../../context/ToastContext/ToastContext';
import { loginWithGoogle } from '../../services/authService';

export function Login() {
  const { showToast } = useToast();
  const [signingIn, setSigningIn] = useState(false);

  async function handleGoogleLogin() {
    setSigningIn(true);
    try {
      await loginWithGoogle();
    } catch {
      showToast('danger', 'Não foi possível entrar. Tente novamente.');
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <Card elevation="md" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'grid', gap: 'var(--space-6)', textAlign: 'center' }}>
          <div>
            <h1>Finanças</h1>
            <p style={{ margin: 0, color: 'var(--color-neutral-400)' }}>
              Acompanhe contas, gastos, orçamentos e metas em um só lugar.
            </p>
          </div>
          <Button variant="primary" block disabled={signingIn} onClick={handleGoogleLogin}>
            Continuar com Google
          </Button>
          <PrivacyNotice />
        </div>
      </Card>
    </main>
  );
}
