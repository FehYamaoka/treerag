// Server-side (SSR/SSG): use internal Docker network name via API_URL
// Client-side (browser): use public URL via NEXT_PUBLIC_API_URL
const BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { headers }),

  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), headers }),

  put: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), headers }),

  delete: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: 'DELETE', headers }),

  withAuth: (token: string) => ({
    get: <T>(path: string) => api.get<T>(path, { Authorization: `Bearer ${token}` }),
    post: <T>(path: string, body: unknown) => api.post<T>(path, body, { Authorization: `Bearer ${token}` }),
    put: <T>(path: string, body: unknown) => api.put<T>(path, body, { Authorization: `Bearer ${token}` }),
    delete: <T>(path: string) => api.delete<T>(path, { Authorization: `Bearer ${token}` }),
  })
}
