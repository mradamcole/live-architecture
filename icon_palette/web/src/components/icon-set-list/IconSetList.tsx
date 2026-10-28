import { useEffect, useMemo, useState } from "react";
import { SearchField } from "@/components/icon-selector/SearchField";
import type { IconSetSummary } from "@/components/icon-selector/types";
import { DEFAULT_MAX_ENABLED_ICON_SETS } from "@/config";
import { SetListItem } from "./SetListItem";

export type IconSetListProps = {
  sets: IconSetSummary[];
  enabledSetIds: string[];
  onEnabledSetIdsChange: (ids: string[]) => void;
  maxEnabled?: number;
  className?: string;
  /** When set, writes selection to localStorage after changes (parent still owns state). */
  storageKey?: string;
};

export function IconSetList({
  sets,
  enabledSetIds,
  onEnabledSetIdsChange,
  maxEnabled = DEFAULT_MAX_ENABLED_ICON_SETS,
  className,
  storageKey,
}: IconSetListProps) {
  const [filter, setFilter] = useState("");
  const [capMessage, setCapMessage] = useState<string | null>(null);

  const enabled = useMemo(() => new Set(enabledSetIds), [enabledSetIds]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(enabledSetIds));
    } catch {
      // ignore quota / private mode
    }
  }, [enabledSetIds, storageKey]);

  useEffect(() => {
    if (!capMessage) return;
    const t = window.setTimeout(() => setCapMessage(null), 3200);
    return () => window.clearTimeout(t);
  }, [capMessage]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return sets;
    return sets.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
    );
  }, [sets, filter]);

  function handleToggle(id: string, next: boolean) {
    if (next) {
      if (enabled.has(id)) return;
      if (enabledSetIds.length >= maxEnabled) {
        setCapMessage(
          `Maximum ${maxEnabled} sets — uncheck one to add another`,
        );
        return;
      }
      onEnabledSetIdsChange([...enabledSetIds, id]);
      setCapMessage(null);
      return;
    }
    onEnabledSetIdsChange(enabledSetIds.filter((x) => x !== id));
    setCapMessage(null);
  }

  const atCap = enabledSetIds.length >= maxEnabled;

  return (
    <div className={`la-panel la-set-list ${className ?? ""}`.trim()}>
      <div className="la-panel__title">Icon sets</div>
      <div className="la-set-list__summary">
        <span>
          {enabledSetIds.length} / {maxEnabled} selected
        </span>
      </div>
      <SearchField
        value={filter}
        onChange={setFilter}
        placeholder="Filter sets…"
        ariaLabel="Filter icon sets"
      />
      <div className="la-live" aria-live="polite">
        {capMessage}
      </div>
      <div className="la-set-list__items" role="list">
        {filtered.map((set) => (
          <div key={set.id} role="listitem">
            <SetListItem
              set={set}
              checked={enabled.has(set.id)}
              disabled={atCap && !enabled.has(set.id)}
              onToggle={handleToggle}
            />
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="la-muted">No sets match</p>
        ) : null}
      </div>
    </div>
  );
}
