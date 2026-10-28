import { useEffect, useMemo, useState } from "react";
import { IconSelector } from "@/components/icon-selector";
import type { IconSetSummary } from "@/components/icon-selector/types";
import { IconSetList } from "@/components/icon-set-list";
import {
  DEFAULT_ENABLED_SET_IDS,
  DEFAULT_MAX_ENABLED_ICON_SETS,
  ENABLED_SETS_STORAGE_KEY,
} from "@/config";
import { DropZone } from "./DropZone";
import "./demo.css";

function loadInitialEnabled(
  catalog: IconSetSummary[],
  maxEnabled: number,
): string[] {
  const known = new Set(catalog.map((s) => s.id));
  try {
    const raw = localStorage.getItem(ENABLED_SETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const ids = parsed
          .filter((x): x is string => typeof x === "string" && known.has(x))
          .slice(0, maxEnabled);
        if (ids.length > 0) return ids;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_ENABLED_SET_IDS.filter((id) => known.has(id)).slice(
    0,
    maxEnabled,
  );
}

export function App() {
  const [sets, setSets] = useState<IconSetSummary[]>([]);
  const [enabledSetIds, setEnabledSetIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const maxEnabled = DEFAULT_MAX_ENABLED_ICON_SETS;

  useEffect(() => {
    let cancelled = false;
    fetch("/data/sets.json")
      .then((res) => res.json() as Promise<IconSetSummary[]>)
      .then((data) => {
        if (cancelled) return;
        setSets(data);
        setEnabledSetIds(loadInitialEnabled(data, maxEnabled));
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [maxEnabled]);

  const setCount = useMemo(() => sets.length, [sets]);

  return (
    <div className="la-app">
      <header className="la-app__header">
        <h1>Icon selector</h1>
        <p>
          Lucid-style picker over {setCount || "…"} local draw.io icon sets.
          Check licenses in{" "}
          <a href="/icons/README.md" target="_blank" rel="noreferrer">
            icons/README.md
          </a>
          .
        </p>
      </header>
      <main className="la-app__main">
        {ready ? (
          <>
            <IconSetList
              sets={sets}
              enabledSetIds={enabledSetIds}
              onEnabledSetIdsChange={setEnabledSetIds}
              maxEnabled={maxEnabled}
              storageKey={ENABLED_SETS_STORAGE_KEY}
            />
            <IconSelector
              enabledSetIds={enabledSetIds}
              sets={sets}
              singleExpand={false}
            />
            <DropZone />
          </>
        ) : (
          <p className="la-muted">Loading icon catalog…</p>
        )}
      </main>
      <footer className="la-app__footer">
        Max enabled sets: {maxEnabled} (change{" "}
        <code>DEFAULT_MAX_ENABLED_ICON_SETS</code> in{" "}
        <code>src/config.ts</code>)
      </footer>
    </div>
  );
}
