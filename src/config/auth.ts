export const AUTH_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_P8_FS_API ?? "https://p8fs.percolationlabs.ai",
  STORAGE_KEYS: {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    EXPIRES_AT: "expires_at",
    ED_PRIV_KEY: "ed:priv",
    ED_PUB_KEY: "ed:pub",
    ID_TOKEN: "id_token",
    TENANT_ID: "tenant_id",
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;
