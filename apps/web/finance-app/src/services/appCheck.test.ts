import type { FirebaseApp } from 'firebase/app';
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check';
import { enableAppCheck } from './appCheck';

const app = { name: 'app' } as FirebaseApp;

describe('enableAppCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('attests requests with reCAPTCHA v3 and keeps the token fresh when a site key is configured', () => {
    enableAppCheck(app, 'site-key');

    expect(ReCaptchaV3Provider).toHaveBeenCalledWith('site-key');
    expect(initializeAppCheck).toHaveBeenCalledWith(app, {
      provider: jest.mocked(ReCaptchaV3Provider).mock.instances[0],
      isTokenAutoRefreshEnabled: true,
    });
  });

  it.each([undefined, ''])(
    'stays off without a site key (%p), as in local development',
    (siteKey) => {
      enableAppCheck(app, siteKey);

      expect(initializeAppCheck).not.toHaveBeenCalled();
    },
  );
});
