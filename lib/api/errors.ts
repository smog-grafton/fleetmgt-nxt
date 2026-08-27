import { ApiEnvelope } from '@/types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string[] | string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function messageFromEnvelope(payload: Partial<ApiEnvelope<unknown>> | null, fallback: string) {
  if (payload?.errors) {
    const first = Object.values(payload.errors)[0];
    if (Array.isArray(first)) return first[0] || fallback;
    if (typeof first === 'string') return first;
  }
  if (payload?.message) return payload.message;
  return fallback;
}
