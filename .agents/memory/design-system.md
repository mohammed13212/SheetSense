---
name: SheetSense design system
description: Brand tokens, font setup, and theme architecture for the SheetSense frontend.
---

## Theme architecture

- Tailwind v4 — all config lives in `artifacts/sheet-sense/src/index.css` via `@theme inline {}`. No tailwind.config.ts.
- Dark/light toggle: `class="dark"` on `<html>`. A tiny inline `<script>` in `index.html` reads `localStorage.getItem('sheetsense-theme')` before first paint and sets the class. Runtime toggle: `window.__setTheme('dark' | 'light')`.
- Dark is default/primary. `class="dark"` is hardcoded on `<html>` as fallback before the script runs.
- `next-themes` is installed but NOT used — it conflicts with React 19.1.0 (invalid hook call). Use `window.__setTheme` instead.

## Font setup

- English: Inter (400/500/600/700), loaded via `<link>` in index.html.
- Arabic: IBM Plex Sans Arabic (400/500/600/700), loaded in the same Google Fonts URL.
- Switch is automatic: `html[lang="ar"] { --app-font-sans: 'IBM Plex Sans Arabic' }` in index.css. LocaleProvider sets `document.documentElement.lang`.

## Brand colors (dark mode, canonical)

| Token | Hex | HSL |
|---|---|---|
| background | #0F172A | 222 47% 11% |
| surface/card | #1E293B | 217 32% 18% |
| primary | #3B82F6 | 217 91% 60% |
| text primary | #F8FAFC | 210 40% 98% |
| text secondary / muted-foreground | #CBD5E1 | 215 20% 65% |
| border | #334155 | 215 25% 27% |
| success | #22C55E | 142 71% 45% |
| warning | #F59E0B | 38 92% 50% |
| error/destructive | #EF4444 | 0 84% 60% |

**Why:** `hsl(from ...)` relative color syntax is used for button border tints — keep `--opaque-button-border-intensity: 9` (dark) / `-8` (light).

## JS tokens

`src/lib/theme.ts` exports `BRAND`, `CHART_COLORS` (hex array), `CHART_THEME` (dark/light axis styles), `SPACING`, `RADIUS`, `FONTS`, `FONT_WEIGHT`. Use for Recharts and canvas APIs that can't read CSS vars.

## Chart palette (same light + dark)

1. `#3B82F6` blue-500 (primary)
2. `#2DD4BF` teal-400
3. `#A78BFA` violet-400
4. `#FBBF24` amber-400
5. `#38BDF8` sky-400
