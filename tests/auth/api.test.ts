import { beforeEach, describe, expect, it, vi } from 'vitest';

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

describe('api auth headers', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://devapi.kurlclub.com/api';
  });

  it('sends X-Role from canonical entitlements instead of the legacy user role', async () => {
    const localStorage = new MemoryStorage();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'success', data: {} }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    vi.stubGlobal('window', { location: { href: '' } });
    vi.stubGlobal('document', { cookie: '' });
    vi.stubGlobal('localStorage', localStorage);
    vi.stubGlobal('fetch', fetchMock);

    const { APP_SESSION_STORAGE_KEY, serializeStoredAppSession } =
      await import('@/lib/auth-session');
    const { api } = await import('@/lib/api');

    localStorage.setItem('accessToken', 'test-token');
    localStorage.setItem(
      APP_SESSION_STORAGE_KEY,
      serializeStoredAppSession({
        user: {
          userId: 81,
          userName: 'Role Legacy',
          userEmail: 'legacy@kurlclub.com',
          userRole: 'legacy_owner',
          uid: 'uid-81',
          photoURL: null,
          isMultiClub: false,
          gyms: [],
          clubs: [],
        },
        gymDetails: null,
        entitlements: {
          role: 'admin',
          permissions: [],
          subscriptionPlan: null,
        },
      })
    );

    await api.get('/Access/me');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://devapi.kurlclub.com/api/Access/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'X-User': '81',
          'X-Role': 'admin',
        }),
      })
    );
  });
});
