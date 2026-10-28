import { useState, type DragEvent } from "react";
import { ICON_DRAG_MIME } from "@/config";
import type { IconRef } from "@/components/icon-selector/types";

type DropZoneProps = {
  className?: string;
};

function parseDrop(event: DragEvent): IconRef | null {
  const custom = event.dataTransfer.getData(ICON_DRAG_MIME);
  if (custom) {
    try {
      return JSON.parse(custom) as IconRef;
    } catch {
      // fall through
    }
  }
  const uri =
    event.dataTransfer.getData("text/uri-list") ||
    event.dataTransfer.getData("text/plain");
  if (!uri) return null;
  const url = uri.split(/\r?\n/).find((line) => line && !line.startsWith("#"));
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.origin);
    const parts = parsed.pathname.split("/").filter(Boolean);
    // /icons/{setId}/svg/{file}
    const iconsIdx = parts.indexOf("icons");
    if (iconsIdx >= 0 && parts[iconsIdx + 2] === "svg") {
      const setId = parts[iconsIdx + 1];
      const file = parts[iconsIdx + 3];
      return {
        setId,
        file,
        title: file.replace(/\.svg$/i, ""),
        publicPath: parsed.pathname,
        svgUrl: parsed.href,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function DropZone({ className }: DropZoneProps) {
  const [active, setActive] = useState(false);
  const [latest, setLatest] = useState<IconRef | null>(null);
  const [history, setHistory] = useState<IconRef[]>([]);

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setActive(true);
  }

  function onDragLeave() {
    setActive(false);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setActive(false);
    const icon = parseDrop(event);
    if (!icon) return;
    setLatest(icon);
    setHistory((prev) => [icon, ...prev].slice(0, 8));
  }

  return (
    <div className={`la-panel la-dropzone ${className ?? ""}`.trim()}>
      <div className="la-panel__title">Drop target</div>
      <div
        className={`la-dropzone__target ${active ? "is-active" : ""}`.trim()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {latest ? (
          <div className="la-dropzone__preview">
            <img src={latest.publicPath} alt="" width={96} height={96} />
            <div className="la-dropzone__meta">
              <strong>{latest.title}</strong>
              <span>{latest.setId}</span>
              <code>{latest.publicPath}</code>
            </div>
          </div>
        ) : (
          <p className="la-muted">Drag an icon here from the picker</p>
        )}
      </div>
      {history.length > 0 ? (
        <div className="la-dropzone__history">
          <div className="la-dropzone__history-title">Recent drops</div>
          <ul>
            {history.map((item, i) => (
              <li key={`${item.publicPath}-${i}`}>
                <img src={item.publicPath} alt="" width={20} height={20} />
                <span>
                  {item.title}
                  <em> · {item.setId}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
