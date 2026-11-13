import type { FirebaseApp } from 'firebase/app';
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check';

export function enableAppCheck(app: FirebaseApp, siteKey: string | undefined): void {
  if (!siteKey) return;
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}
