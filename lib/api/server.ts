import 'server-only';

export function laravelApiUrl(path: string) {
  const base = process.env.LARAVEL_API_URL || 'http://localhost/zurimgt/api/v2';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
}

export async function readJson(response: Response) {
  return response.json().catch(() => ({
    success: false,
    message: `The backend returned an unreadable response (${response.status}).`,
    data: [],
    meta: {},
  }));
}
