/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CESIUM_ION_TOKEN?: string;
  readonly VITE_AISSTREAM_API_KEY?: string;
  readonly VITE_ALPHA_VANTAGE_KEY?: string;
  readonly VITE_OPENSKY_USERNAME?: string;
  readonly VITE_OPENSKY_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const CESIUM_BASE_URL: string;
