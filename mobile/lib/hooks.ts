import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ApptechApp, fetchApps, getOwnedIds } from "./api";

let appsCache: ApptechApp[] | null = null;

/** Fetches the app catalog once and caches it in memory for the session. */
export function useApps() {
  const [apps, setApps] = useState<ApptechApp[]>(appsCache ?? []);
  const [loading, setLoading] = useState(!appsCache);

  useEffect(() => {
    if (appsCache) return;
    let cancelled = false;
    fetchApps()
      .then(({ apps: loaded }) => {
        appsCache = loaded;
        if (!cancelled) setApps(loaded);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { apps, loading };
}

/** Re-reads "내가 쓰는 앱" from AsyncStorage every time the screen regains focus. */
export function useOwnedIds() {
  const [ownedIds, setOwnedIds] = useState<string[]>([]);

  const refresh = useCallback(() => {
    getOwnedIds().then(setOwnedIds);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { ownedIds, refresh };
}
