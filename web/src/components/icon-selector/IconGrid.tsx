import { useCallback, useMemo, useRef, type DragEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ICON_DRAG_MIME } from "@/config";
import {
  iconPublicPath,
  toIconRef,
  type IconEntry,
  type IconRef,
} from "./types";

const CELL = 56;
const GAP = 6;
const VIRTUALIZE_THRESHOLD = 200;

type IconGridProps = {
  setId: string;
  icons: IconEntry[];
  onIconDragStart?: (icon: IconRef, event: DragEvent) => void;
};

function IconCell({
  setId,
  icon,
  onIconDragStart,
}: {
  setId: string;
  icon: IconEntry;
  onIconDragStart?: (icon: IconRef, event: DragEvent) => void;
}) {
  const handleDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      const ref = toIconRef(setId, icon);
      const payload = JSON.stringify(ref);
      event.dataTransfer.setData(ICON_DRAG_MIME, payload);
      event.dataTransfer.setData("text/uri-list", ref.svgUrl);
      event.dataTransfer.setData("text/plain", ref.svgUrl);
      event.dataTransfer.effectAllowed = "copy";

      const img = event.currentTarget.querySelector("img");
      if (img) {
        event.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
      }

      onIconDragStart?.(ref, event);
    },
    [icon, onIconDragStart, setId],
  );

  return (
    <button
      type="button"
      className="la-icon-cell"
      title={icon.title}
      draggable
      onDragStart={handleDragStart}
      aria-label={icon.title}
    >
      <img
        src={iconPublicPath(setId, icon.file)}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        draggable={false}
      />
      <span className="la-icon-cell__label">{icon.title}</span>
    </button>
  );
}

export function IconGrid({ setId, icons, onIconDragStart }: IconGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const useVirtual = icons.length > VIRTUALIZE_THRESHOLD;

  const columns = useMemo(() => {
    // Fixed column count for virtualization math; CSS can still look dense.
    return 5;
  }, []);

  const rowCount = Math.ceil(icons.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: useVirtual ? rowCount : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CELL + GAP,
    overscan: 4,
  });

  if (!useVirtual) {
    return (
      <div className="la-icon-grid">
        {icons.map((icon) => (
          <IconCell
            key={icon.file}
            setId={setId}
            icon={icon}
            onIconDragStart={onIconDragStart}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="la-icon-grid la-icon-grid--virtual" ref={parentRef}>
      <div
        className="la-icon-grid__virtual-inner"
        style={{ height: rowVirtualizer.getTotalSize() }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const start = virtualRow.index * columns;
          const rowIcons = icons.slice(start, start + columns);
          return (
            <div
              key={virtualRow.key}
              className="la-icon-grid__row"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowIcons.map((icon) => (
                <IconCell
                  key={icon.file}
                  setId={setId}
                  icon={icon}
                  onIconDragStart={onIconDragStart}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
