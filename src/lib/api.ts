import {
  APP_SESSION_STORAGE_KEY,
  resolveStoredAppSession,
} from './auth-session';
import { API_BASE_URL } from './utils/index';

type Params = Record<string, string | number | boolean>;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const getStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to set ${key}:`, error);
  }
};

const clearStorage = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(APP_SESSION_STORAGE_KEY);
    localStorage.removeItem('appUser');
    localStorage.removeItem('gymDetails');
    localStorage.removeItem('gymBranch');
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
};

const redirectToLogin = (): void => {
  if (typeof window === 'undefined') return;
  window.location.href = '/auth/login';
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getStorageItem('refreshToken');
      if (!refreshToken) {
        clearStorage();
        redirectToLogin();
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        clearStorage();
        redirectToLogin();
        return null;
      }

      const data = await response.json();
      const newAccessToken = data?.data?.accessToken;
      const newRefreshToken = data?.data?.refreshToken;

      if (!newAccessToken || typeof newAccessToken !== 'string') {
        clearStorage();
        redirectToLogin();
        return null;
      }

      setStorageItem('accessToken', newAccessToken);

      // Server uses rotating refresh tokens — MUST save the new one or next refresh fails
      if (newRefreshToken && typeof newRefreshToken === 'string') {
        setStorageItem('refreshToken', newRefreshToken);
      }

      // Update cookie
      if (typeof document !== 'undefined') {
        document.cookie = `accessToken=${newAccessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      }

      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearStorage();
      redirectToLogin();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

interface ExtendedRequestInit extends RequestInit {
  next?: { revalidate?: number; cache?: string };
  responseType?: 'json' | 'blob';
  skipAuth?: boolean;
  isRetry?: boolean;
}

const baseFetch: typeof fetch = async (url, options = {}) => {
  const { next, responseType, skipAuth, isRetry, ...restOptions } =
    options as ExtendedRequestInit;

  const isFormData = restOptions.body instanceof FormData;
  const accessToken = getStorageItem('accessToken');

  // Get user data for X-User and X-Role headers
  let sessionData = null;
  try {
    sessionData = resolveStoredAppSession({
      encryptedSession: getStorageItem(APP_SESSION_STORAGE_KEY),
    }).session;
  } catch (error) {
    console.warn('Failed to get auth session for headers:', error);
  }

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken && !skipAuth
      ? { Authorization: `Bearer ${accessToken}` }
      : {}),
    ...(sessionData && !skipAuth
      ? {
          'X-User': String(sessionData.user?.userId || ''),
          'X-Role':
            sessionData.entitlements?.role || sessionData.user?.userRole || '',
        }
      : {}),
    ...(restOptions.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers,
    ...restOptions,
    next: {
      cache: next?.cache || 'no-store',
      ...next,
    },
  });

  // Handle 401 - Token expired (only retry once)
  if (
    response.status === 401 &&
    !skipAuth &&
    typeof window !== 'undefined' &&
    !isRetry
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry with new token (mark as retry to prevent infinite loop)
      return baseFetch(url, {
        ...options,
        isRetry: true,
      } as ExtendedRequestInit);
    }
    return response;
  }

  if (!response.ok) {
    let errorMessage = 'Unknown API error';
    let errorPayload:
      | {
          status?: string;
          message?: string;
          feature?: string;
        }
      | undefined;

    try {
      const responseText = await response.text();
      if (responseText) {
        try {
          const error = JSON.parse(responseText);
          errorPayload = error;
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = responseText;
        }
      }
    } catch (e) {
      console.error('Error reading response:', e);
    }

    const error = new Error(errorMessage) as Error & {
      response: { status: number };
      status?: string;
      feature?: string;
    };
    error.response = { status: response.status };
    if (errorPayload?.status) {
      error.status = errorPayload.status;
    }
    if (errorPayload?.feature) {
      error.feature = errorPayload.feature;
    }
    throw error;
  }

  // Handle no-content response (204)
  if (response.status === 204) return;

  // Handle blob response
  if (responseType === 'blob') {
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    return { blob, contentDisposition };
  }

  return response.json();
};

interface GetOptions extends ExtendedRequestInit {
  params?: Params;
}

export const api = {
  get: async <TResponse>(url: string, options?: GetOptions) => {
    const path = options?.params
      ? `${url}?${new URLSearchParams(options.params as Record<string, string>)}`
      : url;
    return baseFetch(path, options) as Promise<TResponse>;
  },
  post: async <TResponse>(
    url: string,
    data?: Record<string, unknown> | object | FormData,
    options?: ExtendedRequestInit
  ) => {
    return baseFetch(url, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }) as Promise<TResponse>;
  },
  put: async <TResponse>(
    url: string,
    data?: Record<string, unknown> | object | FormData,
    options?: ExtendedRequestInit
  ) => {
    return baseFetch(url, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }) as Promise<TResponse>;
  },
  patch: async <TResponse>(
    url: string,
    data?: Record<string, unknown>,
    options?: ExtendedRequestInit
  ) => {
    return baseFetch(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Promise<TResponse>;
  },
  delete: async (
    url: string,
    data?: Record<string, unknown>,
    options?: ExtendedRequestInit
  ) => {
    return baseFetch(url, {
      ...options,
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },
};
