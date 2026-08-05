export function createMockJwt(userData: { id: string; email: string }) {
  const header = btoa(JSON.stringify({ alg: 'HS256', type: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      ...userData,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    }),
  );

  const fakeSignature = 'mock_signature_user';

  return `${header}.${payload}.${fakeSignature}`;
}
