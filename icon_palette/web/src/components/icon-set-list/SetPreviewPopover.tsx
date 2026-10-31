import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  iconPublicPath,
  type IconEntry,
  type IconSetSummary,
} from "@/components/icon-selector/types";

const GAP = 8;
const VIEWPORT_PAD = 8;

type SetPreviewPopoverProps = {
  set: IconSetSummary;
  icons: IconEntry[] | null;
  loading: boolean;
  error: string | null;
  anchorRect: DOMRect;
  previewIconCount: number;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

function computePosition(
  anchor: DOMRect,
  popWidth: number,
  popHeight: number,
): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = anchor.right + GAP;
  if (left + popWidth > vw - VIEWPORT_PAD) {
    left = anchor.left - GAP - popWidth;
  }
  left = Math.max(
    VIEWPORT_PAD,
    Math.min(left, vw - VIEWPORT_PAD - popWidth),
  );

  let top = anchor.top;
  if (top + popHeight > vh - VIEWPORT_PAD) {
    top = vh - VIEWPORT_PAD - popHeight;
  }
  top = Math.max(VIEWPORT_PAD, top);

  return { top, left };
}

export function SetPreviewPopover({
  set,
  icons,
  loading,
  error,
  anchorRect,
  previewIconCount,
  onPointerEnter,
  onPointerLeave,
}: SetPreviewPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(() =>
    computePosition(anchorRect, 280, 200),
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPos(computePosition(anchorRect, width, height));
  }, [anchorRect, icons, loading, error]);

  const shown = icons?.length ?? 0;
  const subtitle =
    loading && !icons
      ? "Loading…"
      : error
        ? error
        : `First ${shown} of ${set.count}`;

  return createPortal(
    <div
      ref={ref}
      className="la-set-preview"
      role="tooltip"
      style={{ top: pos.top, left: pos.left }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="la-set-preview__header">
        <span className="la-set-preview__title">{set.name}</span>
        <span className="la-set-preview__meta">{subtitle}</span>
      </div>
      {error && !icons ? (
        <p className="la-set-preview__status la-error">{error}</p>
      ) : loading && !icons ? (
        <p className="la-set-preview__status la-muted">Loading icons…</p>
      ) : icons && icons.length === 0 ? (
        <p className="la-set-preview__status la-muted">No icons</p>
      ) : icons ? (
        <div className="la-set-preview__grid" aria-hidden="true">
          {icons.slice(0, previewIconCount).map((icon) => (
            <div
              key={icon.file}
              className="la-set-preview__cell"
              title={icon.title}
            >
              <img
                src={iconPublicPath(set.id, icon.file)}
                alt=""
                width={28}
                height={28}
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
