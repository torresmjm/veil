/** Browser-safe configuration only. Secrets belong in server-only code. */
export const publicConfig = {
  apiBaseUrl: import.meta.env.VITE_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '',
} as const;
