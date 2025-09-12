// Global type definitions

declare global {
  interface Window {
    // Add any global window properties here if needed
  }
}

// Extend the CSS properties to include custom properties
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}
