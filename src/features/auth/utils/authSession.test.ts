import { parseAuthSessionPayload } from './authSession';

describe('parseAuthSessionPayload', () => {
  it('parses the snake-case token response', () => {
    expect(
      parseAuthSessionPayload({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: { id: 'user-id' },
      })
    ).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      userData: { id: 'user-id' },
    });
  });

  it('supports the current Backend cookie-only response', () => {
    expect(parseAuthSessionPayload({ id: 'user-id', roles: ['VENDOR_MANAGER'] })).toEqual({
      accessToken: '',
      refreshToken: '',
      userData: { id: 'user-id', roles: ['VENDOR_MANAGER'] },
    });
  });

  it('rejects invalid responses', () => {
    expect(parseAuthSessionPayload(null)).toBeNull();
  });
});
