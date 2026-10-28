# Live Architecture

Local draw.io icon corpus and a Lucid-style web picker.

- [`icons/`](icons/) — SVG icon sets downloaded from [icons.diagrams.net](https://icons.diagrams.net/)
- [`web/`](web/) — Vite + React demo: choose which sets to enable (max 20 by default), browse/search icons, drag onto a drop target

```bash
cd web
npm install
npm run dev
```

Then open http://127.0.0.1:5500/ (Vite may pick another free port if 5500 is taken).

## Updating icons

The picker reads a generated index, not the filesystem on every load. After you move, rename, add, or remove set folders or files under `svg/`, the UI will stay stale until you regenerate:

```bash
npm run generate:icons
```

(Runs the script in [`web/`](web/); `cd web` first only if you prefer working from that folder.)

(or restart dev / run build, which does the same thing).

See [`web/README.md`](web/README.md) for index file layout and embed notes.
