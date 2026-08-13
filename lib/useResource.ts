"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";

interface State<T> {
  /** The path this data belongs to, so a filter change doesn't show stale rows. */
  key: string | null;
  data: T | null;
  error: string | null;
}

/**
 * Fetch-on-mount for the authenticated dashboard pages: waits for the session
 * cookie to be read, sends the token, and exposes a manual `reload`.
 * Pass `path: null` to hold off (e.g. while a filter is undecided).
 */
export function useResource<T>(path: string | null) {
  const { user, ready } = useAuth();
  const token = user?.token;

  const [state, setState] = useState<State<T>>({
    key: null,
    data: null,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!ready || !token || !path) return;

    let cancelled = false;

    apiFetch<T>(path, { token })
      .then((result) => {
        if (!cancelled) setState({ key: path, data: result, error: null });
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setState({
          key: path,
          data: null,
          error:
            caught instanceof Error ? caught.message : "Something went wrong.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [path, token, ready, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  /** In-place update of the loaded data, e.g. after a PATCH returns a row. */
  const setData = useCallback((update: (current: T | null) => T | null) => {
    setState((current) => ({ ...current, data: update(current.data) }));
  }, []);

  const settled = ready && state.key === path;

  return {
    data: settled ? state.data : null,
    setData,
    loading: !settled,
    error: settled ? state.error : null,
    reload,
    token,
  };
}
