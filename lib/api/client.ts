import { ApiEnvelope } from '@/types/api';
import { ApiError, messageFromEnvelope } from './errors';

function csrfToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('zuri_ops_csrf='))
    ?.split('=')[1] ?? '';
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const headers = new Headers(init.headers);
  const method = (init.method || 'GET').toUpperCase();
  if (!(init.body instanceof FormData) && init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers.set('X-CSRF-Token', decodeURIComponent(csrfToken()));
  headers.set('Accept', 'application/json');

  const response = await fetch(`/api/backend/${path.replace(/^\/+/, '')}`, {
    ...init,
    headers,
    credentials: 'same-origin',
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    // A hard navigation clears all in-memory protected data after session expiry.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (response.status === 401 && typeof window !== 'undefined') window.location.assign('/login');
    throw new ApiError(messageFromEnvelope(payload, `Request failed (${response.status})`), response.status, payload?.errors);
  }
  return payload;
}

export const apiGet = <T>(path: string) => apiRequest<T>(path);
export const apiPost = <T>(path: string, body?: unknown) =>
  apiRequest<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) });
export const apiPatch = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) });
export const apiDelete = <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' });
