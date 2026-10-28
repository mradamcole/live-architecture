# Icon selector (web)

Lucid-style icon picker for the local [`icons/`](../icons/) corpus, plus a checklist to choose which sets appear in the picker.

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

Icon files stay in `../icons/` (SVG and PNG under each set’s `svg/` folder) and are served at `/icons/...` in dev and preview.

## Demo layout

1. **Icon sets** — check up to 20 sets (configurable).
2. **Icons** — accordion + search over enabled sets only; hover highlight; drag icons.
3. **Drop target** — accepts dragged icons and shows metadata.

Selection persists in `localStorage` under `live-architecture.enabledIconSets`.

## Configure the max

In [`src/config.ts`](src/config.ts):

```ts
export const DEFAULT_MAX_ENABLED_ICON_SETS = 20;
```

Or pass `maxEnabled` to `IconSetList` from your host app.

## Embed

```ts
import {
  IconSetList,
  IconSelector,
  DEFAULT_MAX_ENABLED_ICON_SETS,
  ICON_DRAG_MIME,
} from "./index"; // or your package path
```

Typical wiring:

1. Load `/data/sets.json`.
2. Keep `enabledSetIds` in parent state (cap with `IconSetList`).
3. Pass the same ids to `IconSelector`.
4. On drop, read `ICON_DRAG_MIME` JSON (`IconRef`) or `text/uri-list`.

`IconSelector` props: `enabledSetIds`, optional `sets`, `singleExpand`, `onIconDragStart`.

## Licenses

Icon sets have mixed licenses. Check [`icons/README.md`](../icons/README.md) and each set’s README before reuse.
