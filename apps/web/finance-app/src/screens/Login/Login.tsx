import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Card, DotGrid, Icon } from '@industry/web';
import type { IconName } from '@industry/web';
import { PrivacyNotice } from '../../components/PrivacyNotice/PrivacyNotice';
import { useToast } from '../../context/ToastContext/ToastContext';
import { useIsWideScreen } from '../../hooks/useIsWideScreen';
import { loginWithGoogle } from '../../services/authService';
import { DAILY_SPENDING_ILLUSTRATION, ILLUSTRATION_COLUMNS } from './loginIllustration';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'wallet',
    title: 'Contas e saldos',
    body: 'Bancos, carteiras, cartões e dívidas, com o saldo de cada um.',
  },
  {
    icon: 'piggy-bank',
    title: 'Orçamentos com aviso',
    body: 'Teto por categoria e alerta antes de estourar.',
  },
  {
    icon: 'target',
    title: 'Metas com aportes',
    body: 'Objetivos com prazo e o progresso de cada aporte.',
  },
];

const GLASS = {
  backgroundImage: 'none',
  background: 'color-mix(in srgb, var(--color-surface) 55%, transparent)',
  backdropFilter: 'blur(14px)',
};

const HEADING_RESET = {
  margin: 0,
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
};

function CardTitle({ children }: { children: ReactNode }) {
  return <h2 style={HEADING_RESET}>{children}</h2>;
}

export function Login() {
  const { showToast } = useToast();
  const [signingIn, setSigningIn] = useState(false);
  const isWide = useIsWideScreen();

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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)',
        padding: 'var(--space-6) clamp(var(--space-4), 5vw, var(--space-12))',
        background:
          'radial-gradient(60% 45% at 85% 0%, color-mix(in srgb, var(--color-accent-400) 70%, transparent), transparent 70%), linear-gradient(180deg, var(--color-accent-500) 0%, color-mix(in srgb, var(--color-accent-700) 70%, var(--color-bg)) 35%, var(--color-bg) 80%)',
        overflowX: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-heading-weight)',
            fontSize: 'var(--text-h4)',
          }}
        >
          <Icon name="chart-no-axes-column-increasing" size="md" />
          Finanças
        </span>
        <Button variant="secondary" size="sm" disabled={signingIn} onClick={handleGoogleLogin}>
          Entrar com Google
        </Button>
      </header>

      <main style={{ display: 'grid', gap: 'var(--space-8)', flex: 1 }}>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <span
            style={{
              justifySelf: 'start',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid color-mix(in srgb, var(--color-text) 30%, transparent)',
              background: 'color-mix(in srgb, var(--color-bg) 35%, transparent)',
              fontSize: 'var(--text-h6)',
            }}
          >
            Controle financeiro pessoal
          </span>
          <h1
            style={{
              margin: 0,
              display: 'grid',
              fontSize: 'clamp(44px, 9vw, 112px)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            <span>Suas finanças</span>{' '}
            <span style={{ paddingLeft: 'clamp(var(--space-6), 18vw, 320px)' }}>em ordem</span>
          </h1>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 'var(--space-6)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            alignItems: 'end',
          }}
        >
          <Card
            aria-label="Gastos dia a dia"
            role="region"
            title={<CardTitle>Gastos dia a dia</CardTitle>}
            style={GLASS}
          >
            <DotGrid
              values={DAILY_SPENDING_ILLUSTRATION}
              columns={ILLUSTRATION_COLUMNS}
              legend={{ low: 'menos', high: 'mais' }}
            />
          </Card>

          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div
              data-testid="feature-cards"
              style={{
                display: 'grid',
                gap: 'var(--space-3)',
                gridTemplateColumns: isWide ? 'repeat(3, 1fr)' : '1fr',
              }}
            >
              {FEATURES.map((feature) => (
                <Card
                  key={feature.title}
                  title={<CardTitle>{feature.title}</CardTitle>}
                  body={feature.body}
                  kicker={<Icon name={feature.icon} size="sm" />}
                  style={GLASS}
                />
              ))}
            </div>
            <p style={{ margin: 0, color: 'var(--color-neutral-300)' }}>
              Registre receitas e despesas, acompanhe o mês, veja gráficos e evolução do patrimônio
              e exporte relatórios em CSV, Excel ou PDF.
            </p>
            <Button
              variant="primary"
              disabled={signingIn}
              onClick={handleGoogleLogin}
              style={{ justifySelf: 'start' }}
            >
              <Icon name="arrow-up-right" size="sm" />
              Continuar com Google
            </Button>
          </div>
        </div>
      </main>

      <footer style={{ maxWidth: 720 }}>
        <PrivacyNotice />
      </footer>
    </div>
  );
}
