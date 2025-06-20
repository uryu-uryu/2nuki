/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PLAYFAB_TITLE_ID: string
  readonly VITE_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 