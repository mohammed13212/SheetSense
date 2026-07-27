/**
 * SheetSense design-system tokens — JavaScript side.
 *
 * Use these constants wherever CSS custom properties cannot be read directly:
 *   - Recharts (chart colors, axis/grid styles)
 *   - Canvas APIs
 *   - Third-party components that accept inline style props
 *
 * Dark mode is the canonical reference for all values below.
 * The light-mode overrides are equivalent perceptual matches.
 *
 * Keep in sync with the CSS variables in src/index.css.
 */

// ─── Brand palette (hex) ─────────────────────────────────────────────────────

export const BRAND = {
  /** Page background            #0F172A  hsl(222 47% 11%) */
  background:    '#0F172A',
  /** Card / surface             #1E293B  hsl(217 32% 18%) */
  surface:       '#1E293B',
  /** Primary action / links     #3B82F6  hsl(217 91% 60%) */
  primary:       '#3B82F6',
  /** Primary text               #F8FAFC  hsl(210 40% 98%) */
  textPrimary:   '#F8FAFC',
  /** Secondary / muted text     #CBD5E1  hsl(215 20% 65%) */
  textSecondary: '#CBD5E1',
  /** Border                     #334155  hsl(215 25% 27%) */
  border:        '#334155',
  /** Success / positive         #22C55E  hsl(142 71% 45%) */
  success:       '#22C55E',
  /** Warning / caution          #F59E0B  hsl(38  92% 50%) */
  warning:       '#F59E0B',
  /** Error / destructive        #EF4444  hsl(0   84% 60%) */
  error:         '#EF4444',
} as const;

// ─── Chart palette ────────────────────────────────────────────────────────────
// Blue-primary, five balanced colors. Same values in light and dark mode.
// Order matches --chart-1 … --chart-5 in index.css.

export const CHART_COLORS = [
  '#3B82F6', // chart-1  blue-500   — primary
  '#2DD4BF', // chart-2  teal-400
  '#A78BFA', // chart-3  violet-400
  '#FBBF24', // chart-4  amber-400
  '#38BDF8', // chart-5  sky-400
] as const;

// Recharts axis / grid style tokens — use with useTheme() to swap modes.
export const CHART_THEME = {
  dark: {
    grid:    '#334155',   // --border
    tick:    '#CBD5E1',   // --muted-foreground
    tooltip: { bg: '#1E293B', border: '#334155', text: '#F8FAFC' },
  },
  light: {
    grid:    '#E2E8F0',
    tick:    '#64748B',
    tooltip: { bg: '#FFFFFF', border: '#E2E8F0', text: '#0F172A' },
  },
} as const;

// ─── Spacing scale (4px grid) ─────────────────────────────────────────────────

export const SPACING = {
  px:  '1px',
  0.5: '2px',
  1:   '4px',
  1.5: '6px',
  2:   '8px',
  2.5: '10px',
  3:   '12px',
  4:   '16px',
  5:   '20px',
  6:   '24px',
  7:   '28px',
  8:   '32px',
  10:  '40px',
  12:  '48px',
  16:  '64px',
  20:  '80px',
  24:  '96px',
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
// Matches --radius-* tokens in index.css (8px base).

export const RADIUS = {
  sm:   '4px',
  md:   '6px',
  DEFAULT: '8px',
  lg:   '8px',
  xl:   '12px',
  '2xl': '16px',
  full: '9999px',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const FONTS = {
  /** English UI — Inter */
  sans:    "'Inter', system-ui, sans-serif",
  /** Arabic UI — IBM Plex Sans Arabic (applied automatically via CSS lang selector) */
  arabic:  "'IBM Plex Sans Arabic', system-ui, sans-serif",
  /** Code / monospace */
  mono:    "ui-monospace, 'SF Mono', 'Menlo', 'Consolas', monospace",
} as const;

/** Font-weight names used across the design system */
export const FONT_WEIGHT = {
  regular:   400,
  medium:    500,
  semibold:  600,
  bold:      700,
} as const;
