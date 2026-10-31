import type { IconEntry } from "@/components/icon-selector/types";

const cache = new Map<string, Promise<IconEntry[]>>();

/**
 * Load icons for a set, sharing one in-flight/completed promise per set id.
 * Callers that need cancellation should ignore results after unmount / id change.
 */
export function fetchSetIcons(setId: string): Promise<IconEntry[]> {
  const existing = cache.get(setId);
  if (existing) return existing;

  const promise = fetch(`/data/sets/${encodeURIComponent(setId)}.json`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to load ${setId}`);
      return res.json() as Promise<{ icons: IconEntry[] }>;
    })
    .then((data) => data.icons)
    .catch((err: unknown) => {
      cache.delete(setId);
      throw err;
    });

  cache.set(setId, promise);
  return promise;
}
