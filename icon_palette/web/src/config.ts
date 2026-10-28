/** Maximum number of icon sets that can be enabled in the picker at once. */
export const DEFAULT_MAX_ENABLED_ICON_SETS = 20;

/** Curated defaults so the demo picker is usable on first visit. */
export const DEFAULT_ENABLED_SET_IDS = [
  "azure",
  "kubernetes",
  "developer",
  "infrastructure",
  "generic",
] as const;

export const ENABLED_SETS_STORAGE_KEY = "live-architecture.enabledIconSets";

/** Drag MIME for IconRef JSON payloads. */
export const ICON_DRAG_MIME = "application/vnd.live-architecture.icon+json";
