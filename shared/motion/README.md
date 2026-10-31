# `@live-architecture/motion`

Shared micro-interactions for Live Architecture widgets: CSS timing tokens plus Motion-for-React primitives.

React and React DOM are peer dependencies. Install them only in the consuming app (for example `icon_palette/web`), not under `shared/motion/node_modules`, or Vite can load two React copies and Motion context breaks (`useContext` on null).

## Setup (once per app shell)

```tsx
import { MotionProvider } from "@live-architecture/motion";
import "@live-architecture/motion/tokens.css";

createRoot(el).render(
  <MotionProvider>
    <App />
  </MotionProvider>,
);
```

`MotionProvider` sets `reducedMotion="user"` so Motion respects `prefers-reduced-motion`. The tokens stylesheet zeros CSS durations under the same media query.

## When to use what

| Need | Prefer |
|------|--------|
| Hover/background, chevron rotate, border color | CSS + `--la-motion-*` tokens |
| Accordion / disclosure height | `<Collapse open={…}>` |
| Tab or panel opacity swap | `<Fade open={…} presenceKey={…}>` |
| Custom enter/exit or press scale | `motionPresets` + `motion` from `motion/react` |

## Tokens

| Variable | Default | Typical use |
|----------|---------|-------------|
| `--la-motion-duration-fast` | `120ms` | Chevrons, hovers |
| `--la-motion-duration-md` | `220ms` | Collapse, fades |
| `--la-motion-duration-slow` | `320ms` | Large panel moves |
| `--la-motion-ease-standard` | cubic-bezier(0.2, 0, 0, 1) | Default UI motion |
| `--la-motion-ease-emphasized` | cubic-bezier(0.3, 0, 0, 1) | Stronger emphasis |

## Accordion body

```tsx
import { Collapse } from "@live-architecture/motion";

<button type="button" aria-expanded={open} aria-controls={panelId} onClick={toggle}>
  …
</button>
<Collapse open={open} id={panelId} role="region" aria-labelledby={headerId}>
  <div className="la-accordion__panel">{/* content */}</div>
</Collapse>
```

Keep fetch/load gates on the boolean `open`/`expanded` state, not on whether the panel is still exiting the DOM.

## Presets

`motionPresets.collapse`, `.fade`, `.press`, and `.chevron` expose shared `variants` + `transition` objects. Prefer them over ad-hoc durations so widgets stay in sync.
