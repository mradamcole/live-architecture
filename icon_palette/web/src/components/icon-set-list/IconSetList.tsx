import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchField } from "@/components/icon-selector/SearchField";
import type {
  IconEntry,
  IconSetSummary,
} from "@/components/icon-selector/types";
import {
  DEFAULT_MAX_ENABLED_ICON_SETS,
  DEFAULT_SET_PREVIEW_HOVER_DELAY_MS,
  DEFAULT_SET_PREVIEW_ICON_COUNT,
} from "@/config";
import { fetchSetIcons } from "./fetchSetIcons";
import { SetListItem } from "./SetListItem";
import { SetPreviewPopover } from "./SetPreviewPopover";

const HIDE_GRACE_MS = 100;

function canHoverPreview(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

export type IconSetListProps = {
  sets: IconSetSummary[];
  enabledSetIds: string[];
  onEnabledSetIdsChange: (ids: string[]) => void;
  maxEnabled?: number;
  /** Delay before opening the set-name hover preview (ms). */
  previewHoverDelayMs?: number;
  /** Max icons shown in the set-name hover preview. */
  previewIconCount?: number;
  className?: string;
  /** When set, writes selection to localStorage after changes (parent still owns state). */
  storageKey?: string;
  /** When true, skip outer panel chrome (for use inside IconPalettePanel). */
  embedded?: boolean;
};

type ActivePreview = {
  set: IconSetSummary;
  anchorRect: DOMRect;
};

export function IconSetList({
  sets,
  enabledSetIds,
  onEnabledSetIdsChange,
  maxEnabled = DEFAULT_MAX_ENABLED_ICON_SETS,
  previewHoverDelayMs = DEFAULT_SET_PREVIEW_HOVER_DELAY_MS,
  previewIconCount = DEFAULT_SET_PREVIEW_ICON_COUNT,
  className,
  storageKey,
  embedded = false,
}: IconSetListProps) {
  const [filter, setFilter] = useState("");
  const [capMessage, setCapMessage] = useState<string | null>(null);

  const [activePreview, setActivePreview] = useState<ActivePreview | null>(
    null,
  );
  const [previewIcons, setPreviewIcons] = useState<IconEntry[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const openTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const previewSetIdRef = useRef<string | null>(null);
  const fetchGenRef = useRef(0);

  const enabled = useMemo(() => new Set(enabledSetIds), [enabledSetIds]);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current != null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const closePreview = useCallback(() => {
    clearOpenTimer();
    clearHideTimer();
    previewSetIdRef.current = null;
    fetchGenRef.current += 1;
    setActivePreview(null);
    setPreviewIcons(null);
    setPreviewLoading(false);
    setPreviewError(null);
  }, [clearHideTimer, clearOpenTimer]);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      closePreview();
    }, HIDE_GRACE_MS);
  }, [clearHideTimer, closePreview]);

  const cancelHide = useCallback(() => {
    clearHideTimer();
  }, [clearHideTimer]);

  const loadPreview = useCallback(
    (set: IconSetSummary, anchorRect: DOMRect) => {
      previewSetIdRef.current = set.id;
      const gen = ++fetchGenRef.current;
      setActivePreview({ set, anchorRect });
      setPreviewIcons(null);
      setPreviewLoading(true);
      setPreviewError(null);

      fetchSetIcons(set.id)
        .then((icons) => {
          if (fetchGenRef.current !== gen) return;
          setPreviewIcons(icons.slice(0, previewIconCount));
          setPreviewLoading(false);
        })
        .catch((err: unknown) => {
          if (fetchGenRef.current !== gen) return;
          setPreviewError(err instanceof Error ? err.message : "Load failed");
          setPreviewLoading(false);
        });
    },
    [previewIconCount],
  );

  const handleNameHoverStart = useCallback(
    (set: IconSetSummary, el: HTMLElement) => {
      if (!canHoverPreview()) return;
      clearHideTimer();
      clearOpenTimer();

      if (previewSetIdRef.current === set.id) {
        // Already showing or loading this set; refresh anchor in case of scroll.
        setActivePreview((prev) =>
          prev && prev.set.id === set.id
            ? { set, anchorRect: el.getBoundingClientRect() }
            : prev,
        );
        return;
      }

      // Different set: drop any open preview so only one is pending/active.
      if (previewSetIdRef.current != null) {
        previewSetIdRef.current = null;
        fetchGenRef.current += 1;
        setActivePreview(null);
        setPreviewIcons(null);
        setPreviewLoading(false);
        setPreviewError(null);
      }

      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null;
        loadPreview(set, el.getBoundingClientRect());
      }, previewHoverDelayMs);
    },
    [clearHideTimer, clearOpenTimer, loadPreview, previewHoverDelayMs],
  );

  const handleNameHoverEnd = useCallback(() => {
    clearOpenTimer();
    if (previewSetIdRef.current != null) {
      scheduleHide();
    }
  }, [clearOpenTimer, scheduleHide]);

  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearHideTimer();
    };
  }, [clearHideTimer, clearOpenTimer]);

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

  const rootClass = embedded
    ? `la-set-list la-set-list--embedded ${className ?? ""}`.trim()
    : `la-panel la-set-list ${className ?? ""}`.trim();

  return (
    <div className={rootClass}>
      {!embedded ? <div className="la-panel__title">Icon sets</div> : null}
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
              onNameHoverStart={handleNameHoverStart}
              onNameHoverEnd={handleNameHoverEnd}
            />
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="la-muted">No sets match</p>
        ) : null}
      </div>
      {activePreview ? (
        <SetPreviewPopover
          set={activePreview.set}
          icons={previewIcons}
          loading={previewLoading}
          error={previewError}
          anchorRect={activePreview.anchorRect}
          previewIconCount={previewIconCount}
          onPointerEnter={cancelHide}
          onPointerLeave={scheduleHide}
        />
      ) : null}
    </div>
  );
}
