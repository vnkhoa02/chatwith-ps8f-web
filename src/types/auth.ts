export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  idToken: string | null;
  tenantId: string | null;
};
