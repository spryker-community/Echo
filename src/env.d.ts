/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string;
  readonly VITE_AI_MODEL: string;
  readonly VITE_YOUTUBE_API_TOKEN: string;
  readonly VITE_YOUTUBE_CHANNEL_ID: string;
  readonly VITE_FORUM_API_URL: string;
  readonly VITE_FORUM_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv extends ImportMetaEnv {}
}
