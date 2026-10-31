import { Collapse } from "@live-architecture/motion";
import { useEffect, useId, useState, type DragEvent } from "react";
import { IconGrid } from "./IconGrid";
import type { IconEntry, IconRef, IconSetSummary } from "./types";

type AccordionSectionProps = {
  set: IconSetSummary;
  expanded: boolean;
  onToggle: () => void;
  filterQuery: string;
  onIconDragStart?: (icon: IconRef, event: DragEvent) => void;
  /** When set is disabled upstream, discard cached icons. */
  active: boolean;
};

export function AccordionSection({
  set,
  expanded,
  onToggle,
  filterQuery,
  onIconDragStart,
  active,
}: AccordionSectionProps) {
  const panelId = useId();
  const headerId = useId();
  const [icons, setIcons] = useState<IconEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setIcons(null);
      setError(null);
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    if (!expanded || !active || icons) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/data/sets/${encodeURIComponent(set.id)}.json`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load ${set.id}`);
        return res.json() as Promise<{ icons: IconEntry[] }>;
      })
      .then((data) => {
        setIcons(data.icons);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Load failed");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [expanded, active, icons, set.id]);

  const q = filterQuery.trim().toLowerCase();
  const visibleIcons =
    icons && q.length >= 2
      ? icons.filter(
          (icon) =>
            icon.title.toLowerCase().includes(q) ||
            icon.file.toLowerCase().includes(q) ||
            icon.tags.some((t) => t.toLowerCase().includes(q)),
        )
      : icons;

  return (
    <section className={`la-accordion ${expanded ? "is-open" : ""}`}>
      <h3 className="la-accordion__heading">
        <button
          type="button"
          id={headerId}
          className="la-accordion__header"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="la-accordion__chevron" aria-hidden="true">
            ▸
          </span>
          <span className="la-accordion__name">{set.name}</span>
          <span className="la-accordion__count">{set.count}</span>
        </button>
      </h3>
      <Collapse
        open={expanded}
        id={panelId}
        role="region"
        aria-labelledby={headerId}
      >
        <div className="la-accordion__panel">
          {loading ? (
            <p className="la-muted">Loading icons…</p>
          ) : error ? (
            <p className="la-error">{error}</p>
          ) : visibleIcons && visibleIcons.length === 0 ? (
            <p className="la-muted">No matching icons</p>
          ) : visibleIcons ? (
            <IconGrid
              setId={set.id}
              icons={visibleIcons}
              onIconDragStart={onIconDragStart}
            />
          ) : null}
        </div>
      </Collapse>
    </section>
  );
}
