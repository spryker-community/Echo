/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORUM_API_URL: string
  readonly VITE_FORUM_API_KEY: string
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
