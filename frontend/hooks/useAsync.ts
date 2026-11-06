"use client";

import { useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  key: string | null;
  data?: T;
  error?: Error;
}

/**
 * Runs `fn` whenever `key` changes (pass null to skip). `reload` re-runs it with the same key.
 */
export function useAsync<T>(fn: (signal: AbortSignal) => Promise<T>, key: string | null) {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<AsyncState<T>>({ key: null });
  const fnRef = useRef(fn);
  const requestKey = key === null ? null : `${key}#${nonce}`;

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    if (requestKey === null) return;
    const controller = new AbortController();
    fnRef.current(controller.signal).then(
      (data) => setState({ key: requestKey, data }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ key: requestKey, error: error instanceof Error ? error : new Error(String(error)) });
      },
    );
    return () => controller.abort();
  }, [requestKey]);

  const settled = state.key === requestKey;
  return {
    data: settled ? state.data : undefined,
    error: settled ? state.error : undefined,
    loading: requestKey !== null && !settled,
    reload: () => setNonce((value) => value + 1),
  };
}
