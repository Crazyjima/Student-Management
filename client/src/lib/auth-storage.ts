const REFRESH_TOKEN_KEY = 'school-mngt:refresh-token';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const authStorage = {
  getRefreshToken: (): string | null => {
    if (!isBrowser) {
      return null;
    }
    try {
      return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken: (token: string): void => {
    if (!isBrowser) {
      return;
    }
    try {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
    }
  },

  clearRefreshToken: (): void => {
    if (!isBrowser) {
      return;
    }
    try {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
    }
  },
};
