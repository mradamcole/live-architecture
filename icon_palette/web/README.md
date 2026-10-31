# Icon selector (web)

Lucid-style icon picker for the shared [`assets/icons/`](../../assets/icons/) corpus, plus a checklist to choose which sets appear in the picker.

## Quick start

```bash
cd web
npm install
npm run dev
```

Open the URL Vite prints (default http://127.0.0.1:5500/). Port **5500** avoids Windows Hyper-V excluded ranges that often block 5173.

`npm run dev` and `npm run build` both regenerate the icon index first.

## Generate the index

After you move, rename, add, or remove set folders or files under `svg/`, the UI will stay stale until you regenerate:

```bash
npm run generate:icons
```

(or restart dev / run build, which does the same thing).

Writes under `public/data/` (gitignored):

| File | Contents |
|------|----------|
| `sets.json` | All icon sets (id, name, count, license, author) |
| `sets/{id}.json` | Icons in one set |
| `search-min.json` | Flat search index |

Icon files stay in `../../assets/icons/` (SVG and PNG under each set’s `svg/` folder) and are served at `/icons/...` in dev and preview.

## Demo layout

1. **Icon palette** — one panel with two tabs:
   - **Icons** (default) — accordion + search over enabled sets; hover highlight; drag icons.
   - **Icon Sets** — check up to 20 sets (configurable).
2. **Drop target** — accepts dragged icons and shows metadata.

Selection persists in `localStorage` under `live-architecture.enabledIconSets`.

## Configure the max

In [`src/config.ts`](src/config.ts):

```ts
export const DEFAULT_MAX_ENABLED_ICON_SETS = 20;
```

Or pass `maxEnabled` to `IconPalettePanel` (or `IconSetList`) from your host app.

## Embed

Prefer the combined panel:

```ts
import {
  IconPalettePanel,
  DEFAULT_MAX_ENABLED_ICON_SETS,
  ICON_DRAG_MIME,
} from "./index"; // or your package path
```

Typical wiring:

1. Load `/data/sets.json`.
2. Keep `enabledSetIds` in parent state.
3. Render `IconPalettePanel` with `sets`, `enabledSetIds`, `onEnabledSetIdsChange`, and optional `maxEnabled` / `storageKey`.
4. On drop, read `ICON_DRAG_MIME` JSON (`IconRef`) or `text/uri-list`.

`IconPalettePanel` props: `sets`, `enabledSetIds`, `onEnabledSetIdsChange`, optional `maxEnabled`, `storageKey`, `singleExpand`, `onIconDragStart`.

`IconSelector` and `IconSetList` remain available for separate layouts. Pass `embedded` when nesting them inside custom chrome.

## Licenses

Icon sets have mixed licenses. Check [`assets/icons/README.md`](../../assets/icons/README.md) and each set’s README before reuse.
