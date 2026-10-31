import { useId, useState, type DragEvent } from "react";
import { IconSelector } from "@/components/icon-selector";
import type { IconRef, IconSetSummary } from "@/components/icon-selector/types";
import { IconSetList } from "@/components/icon-set-list";
import { DEFAULT_MAX_ENABLED_ICON_SETS } from "@/config";

export type IconPalettePanelProps = {
  sets: IconSetSummary[];
  enabledSetIds: string[];
  onEnabledSetIdsChange: (ids: string[]) => void;
  maxEnabled?: number;
  /** Delay before opening the set-name hover preview (ms). */
  previewHoverDelayMs?: number;
  /** Max icons shown in the set-name hover preview. */
  previewIconCount?: number;
  storageKey?: string;
  singleExpand?: boolean;
  onIconDragStart?: (icon: IconRef, event: DragEvent) => void;
  className?: string;
};

type PaletteTab = "icons" | "sets";

export function IconPalettePanel({
  sets,
  enabledSetIds,
  onEnabledSetIdsChange,
  maxEnabled = DEFAULT_MAX_ENABLED_ICON_SETS,
  previewHoverDelayMs,
  previewIconCount,
  storageKey,
  singleExpand = false,
  onIconDragStart,
  className,
}: IconPalettePanelProps) {
  const [tab, setTab] = useState<PaletteTab>("icons");
  const baseId = useId();
  const iconsTabId = `${baseId}-tab-icons`;
  const setsTabId = `${baseId}-tab-sets`;
  const panelId = `${baseId}-panel`;

  return (
    <div className={`la-panel la-icon-palette ${className ?? ""}`.trim()}>
      <div className="la-tabs" role="tablist" aria-label="Icon palette">
        <button
          type="button"
          role="tab"
          id={iconsTabId}
          className={`la-tab${tab === "icons" ? " is-active" : ""}`}
          aria-selected={tab === "icons"}
          aria-controls={panelId}
          tabIndex={tab === "icons" ? 0 : -1}
          onClick={() => setTab("icons")}
        >
          Icons
        </button>
        <button
          type="button"
          role="tab"
          id={setsTabId}
          className={`la-tab${tab === "sets" ? " is-active" : ""}`}
          aria-selected={tab === "sets"}
          aria-controls={panelId}
          tabIndex={tab === "sets" ? 0 : -1}
          onClick={() => setTab("sets")}
        >
          Icon Sets
        </button>
      </div>
      <div
        role="tabpanel"
        id={panelId}
        className="la-icon-palette__body"
        aria-labelledby={tab === "icons" ? iconsTabId : setsTabId}
      >
        {tab === "icons" ? (
          <IconSelector
            embedded
            enabledSetIds={enabledSetIds}
            sets={sets}
            singleExpand={singleExpand}
            onIconDragStart={onIconDragStart}
          />
        ) : (
          <IconSetList
            embedded
            sets={sets}
            enabledSetIds={enabledSetIds}
            onEnabledSetIdsChange={onEnabledSetIdsChange}
            maxEnabled={maxEnabled}
            previewHoverDelayMs={previewHoverDelayMs}
            previewIconCount={previewIconCount}
            storageKey={storageKey}
          />
        )}
      </div>
    </div>
  );
}
