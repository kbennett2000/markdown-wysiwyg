/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Google OAuth Client ID for the (online-only) Drive integration. */
  readonly VITE_GDRIVE_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
