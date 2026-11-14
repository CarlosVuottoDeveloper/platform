const CONTACT_EMAIL = 'kaduvuotto@gmail.com';

export function PrivacyNotice() {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 'var(--text-h6)',
        color: 'var(--color-neutral-400)',
        textAlign: 'center',
      }}
    >
      Este app guarda as contas, movimentações, orçamentos e metas que você cadastrar, associados à
      sua conta Google. Os dados ficam no Firebase (Google) e não são compartilhados com mais
      ninguém. O app usa o reCAPTCHA do Google para se proteger de abuso. Você pode exportar ou
      excluir tudo em Configurações. Contato:{' '}
      <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--color-accent-300)' }}>
        {CONTACT_EMAIL}
      </a>
    </p>
  );
}
