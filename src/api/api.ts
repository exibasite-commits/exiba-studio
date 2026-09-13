// Cliente HTTP da API própria.
// Todas as chamadas usam cookie de sessão (credentials: 'include').

export interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  plan?: 'free' | 'pro';
  planExpiresAt?: string | null;
  isAdmin?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const base = import.meta.env.VITE_API_URL ?? '';
  const res = await fetch(`${base}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      data &&
      typeof data === 'object' &&
      'error' in data &&
      typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `Erro ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}
