/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_N8N_URL: string
  readonly VITE_OLLAMA_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
