import { appEnv } from '../../app/config/env';

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function resolveUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  if (appEnv.enableMsw && path.startsWith('/api/')) {
    return path;
  }
  if (!appEnv.apiBaseUrl) {
    return path;
  }

  if (/^https?:\/\//.test(appEnv.apiBaseUrl)) {
    return new URL(path, appEnv.apiBaseUrl).toString();
  }

  const normalizedBase = appEnv.apiBaseUrl.replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+/, '');

  return `${normalizedBase}/${normalizedPath}`;
}

export async function httpRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(resolveUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload =
    contentType.includes('application/json')
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      payload,
    );
  }

  return payload as T;
}

export async function httpListRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T[]> {
  try {
    const payload = await httpRequest<T[] | undefined>(path, init);
    return payload ?? [];
  } catch (error) {
    if (
      appEnv.dataSource === 'api' &&
      error instanceof ApiError &&
      error.status === 404
    ) {
      return [];
    }

    throw error;
  }
}
