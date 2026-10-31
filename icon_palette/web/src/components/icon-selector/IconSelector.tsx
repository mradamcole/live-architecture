import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
} from "react";
import { AccordionSection } from "./AccordionSection";
import { SearchField } from "./SearchField";
import type {
  IconRef,
  IconSetSummary,
  SearchMinEntry,
} from "./types";

export type IconSelectorProps = {
  enabledSetIds: string[];
  sets?: IconSetSummary[];
  className?: string;
  singleExpand?: boolean;
  onIconDragStart?: (icon: IconRef, event: DragEvent) => void;
  /** When true, skip outer panel chrome (for use inside IconPalettePanel). */
  embedded?: boolean;
};

export function IconSelector({
  enabledSetIds,
  sets: setsProp,
  className,
  singleExpand = false,
  onIconDragStart,
  embedded = false,
}: IconSelectorProps) {
  const [catalog, setCatalog] = useState<IconSetSummary[]>(setsProp ?? []);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [searchIndex, setSearchIndex] = useState<SearchMinEntry[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [globalHits, setGlobalHits] = useState<
    Array<{ setId: string; file: string; title: string }>
  >([]);

  useEffect(() => {
    if (setsProp) {
      setCatalog(setsProp);
      return;
    }
    let cancelled = false;
    fetch("/data/sets.json")
      .then((res) => res.json() as Promise<IconSetSummary[]>)
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      });
    return () => {
      cancelled = true;
    };
  }, [setsProp]);

  const enabledSets = useMemo(() => {
    const byId = new Map(catalog.map((s) => [s.id, s]));
    return enabledSetIds
      .map((id) => byId.get(id))
      .filter((s): s is IconSetSummary => Boolean(s));
  }, [catalog, enabledSetIds]);

  const enabledIdSet = useMemo(
    () => new Set(enabledSetIds),
    [enabledSetIds],
  );

  // Drop expansion state for sets that were unchecked.
  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set([...prev].filter((id) => enabledIdSet.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [enabledIdSet]);

  const headerFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length >= 2) return enabledSets;
    if (!q) return enabledSets;
    return enabledSets.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
    );
  }, [enabledSets, query]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setGlobalHits([]);
      return;
    }

    let cancelled = false;

    async function run() {
      let index = searchIndex;
      if (!index) {
        setSearchLoading(true);
        try {
          const res = await fetch("/data/search-min.json");
          if (!res.ok) throw new Error("search index failed");
          index = (await res.json()) as SearchMinEntry[];
          if (!cancelled) setSearchIndex(index);
        } catch {
          if (!cancelled) setSearchIndex([]);
          return;
        } finally {
          if (!cancelled) setSearchLoading(false);
        }
      }
      if (!index || cancelled) return;

      const hits: Array<{ setId: string; file: string; title: string }> = [];
      for (const row of index) {
        if (!enabledIdSet.has(row.set)) continue;
        const hay = `${row.t} ${row.tags.join(" ")} ${row.id}`.toLowerCase();
        if (!hay.includes(q)) continue;
        const file = row.id.slice(row.set.length + 1);
        hits.push({ setId: row.set, file, title: row.t });
        if (hits.length >= 200) break;
      }
      if (!cancelled) setGlobalHits(hits);
    }

    const t = window.setTimeout(() => {
      void run();
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query, searchIndex, enabledIdSet]);

  const toggle = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        if (singleExpand) {
          return prev.has(id) ? new Set() : new Set([id]);
        }
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [singleExpand],
  );

  // Auto-expand sets that have search hits when searching.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || globalHits.length === 0) return;
    const hitSets = new Set(globalHits.map((h) => h.setId));
    setExpanded((prev) => {
      const next = singleExpand
        ? new Set([[...hitSets][0]].filter(Boolean) as string[])
        : new Set([...prev, ...hitSets]);
      return next;
    });
  }, [globalHits, query, singleExpand]);

  const rootClass = embedded
    ? `la-icon-selector la-icon-selector--embedded ${className ?? ""}`.trim()
    : `la-panel la-icon-selector ${className ?? ""}`.trim();

  if (enabledSets.length === 0) {
    return (
      <div className={rootClass}>
        {!embedded ? <div className="la-panel__title">Icons</div> : null}
        <p className="la-empty">
          {embedded
            ? "Select icon sets in the Icon Sets tab"
            : "Select icon sets in the list"}
        </p>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      {!embedded ? <div className="la-panel__title">Icons</div> : null}
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search icons…"
        ariaLabel="Search icons in enabled sets"
      />
      {query.trim().length >= 2 ? (
        <p className="la-search-meta" aria-live="polite">
          {searchLoading
            ? "Searching…"
            : `${globalHits.length}${globalHits.length >= 200 ? "+" : ""} matches in enabled sets`}
        </p>
      ) : null}
      <div className="la-accordion-list">
        {headerFiltered.map((set) => (
          <AccordionSection
            key={set.id}
            set={set}
            expanded={expanded.has(set.id)}
            onToggle={() => toggle(set.id)}
            filterQuery={query}
            onIconDragStart={onIconDragStart}
            active={enabledIdSet.has(set.id)}
          />
        ))}
      </div>
    </div>
  );
}
