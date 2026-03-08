import { useEffect, useRef, useCallback } from "react";
import { useDataSourceStore } from "../stores/useDataSourceStore";

interface Options {
  key: string;
  url: string;
  apiKey: string;
  enabled: boolean;
  onMessage: (data: unknown) => void;
  subscribeMessage?: unknown;
}

export function useWebSocket({ key, url, apiKey, enabled, onMessage, subscribeMessage }: Options) {
  const update = useDataSourceStore((s) => s.update);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!enabled || !apiKey) return;

    update(key, { status: "loading" });

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      update(key, { status: "success", lastUpdated: new Date(), error: null });
      if (subscribeMessage) {
        ws.send(JSON.stringify(subscribeMessage));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      update(key, { status: "error", error: "WebSocket error" });
    };

    ws.onclose = () => {
      // Reconnect after 5 seconds
      reconnectTimer.current = setTimeout(() => {
        if (enabled && apiKey) connect();
      }, 5000);
    };
  }, [enabled, apiKey, url, key, subscribeMessage, update]);

  useEffect(() => {
    if (!enabled || !apiKey) {
      update(key, { status: "idle" });
      return;
    }

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on cleanup
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, apiKey, connect, key, update]);
}
