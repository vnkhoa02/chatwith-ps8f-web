export const AUTH_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_P8_FS_API ?? "https://p8fs.percolationlabs.ai",
  STORAGE_KEYS: {
    ACCESS_TOKEN: "@auth:access_token",
    REFRESH_TOKEN: "@auth:refresh_token",
    EXPIRES_AT: "@auth:expires_at",
    ED_PRIV_KEY: "@auth:ed:priv",
    ED_PUB_KEY: "@auth:ed:pub",
    ID_TOKEN: "@auth:id_token",
    TENANT_ID: "@auth:tenant_id",
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;
