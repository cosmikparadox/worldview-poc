import type { SourceAdapter, MaritimeTrack } from "../types";

// Ships use WebSocket — this adapter is a no-op placeholder.
// Actual ship data flows through useShips.ts → useWebSocket.ts → dataHubStore.
// The registry marks this as fetchMode: "websocket" so useDataHub skips polling.
export const aisAdapter: SourceAdapter<MaritimeTrack[]> = {
  id: "aisstream-ships",
  async fetch(_signal) {
    // WebSocket sources don't use this fetch method.
    // Ship data is pushed into the store by the WebSocket handler.
    return [];
  },
};
