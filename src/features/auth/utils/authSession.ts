export interface AuthSessionPayload {
  accessToken: string;
  refreshToken: string;
  userData: Record<string, unknown>;
}

function readToken(data: Record<string, unknown>, camelKey: string, snakeKey: string): string {
  const value = data[camelKey] ?? data[snakeKey];
  return typeof value === 'string' ? value.trim() : '';
}

export function parseAuthSessionPayload(raw: unknown): AuthSessionPayload | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = raw as Record<string, unknown>;
  const accessToken = readToken(data, 'accessToken', 'access_token');
  const refreshToken = readToken(data, 'refreshToken', 'refresh_token');
  const nestedUser = data.user;
  const userData =
    nestedUser && typeof nestedUser === 'object' ? (nestedUser as Record<string, unknown>) : data;

  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken, userData };
}
