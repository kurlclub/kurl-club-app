export const GOOGLE_ONE_TAP_SUPPRESSION_KEY = 'KC_SKIP_GOOGLE_ONE_TAP_ONCE';

export const suppressGoogleOneTapOnce = () => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(GOOGLE_ONE_TAP_SUPPRESSION_KEY, '1');
  } catch (error) {
    console.warn(
      'Failed to suppress Google One Tap for the next visit:',
      error
    );
  }
};

export const isGoogleOneTapSuppressed = () => {
  if (typeof window === 'undefined') return false;

  try {
    return (
      window.sessionStorage.getItem(GOOGLE_ONE_TAP_SUPPRESSION_KEY) === '1'
    );
  } catch (error) {
    console.warn('Failed to read Google One Tap suppression state:', error);
    return false;
  }
};

export const clearGoogleOneTapSuppression = () => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(GOOGLE_ONE_TAP_SUPPRESSION_KEY);
  } catch (error) {
    console.warn('Failed to clear Google One Tap suppression state:', error);
  }
};
