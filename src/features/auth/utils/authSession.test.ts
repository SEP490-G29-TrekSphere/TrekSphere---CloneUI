import { parseAuthSessionPayload } from './authSession';

describe('parseAuthSessionPayload', () => {
  it('parses the snake-case Backend login contract', () => {
    const session = parseAuthSessionPayload({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: { id: 'user-id', roles: ['VENDOR_MANAGER'] },
    });

    expect(session).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      userData: { id: 'user-id', roles: ['VENDOR_MANAGER'] },
    });
  });

  it('accepts camel-case tokens for backward compatibility', () => {
    const session = parseAuthSessionPayload({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      id: 'user-id',
    });

    expect(session?.userData.id).toBe('user-id');
  });

  it('rejects a user-only response so the UI cannot enter a broken session', () => {
    expect(parseAuthSessionPayload({ user: { id: 'user-id' } })).toBeNull();
  });
});
