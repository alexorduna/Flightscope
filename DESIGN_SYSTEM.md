# FlightScope Design System

## Design Read

Product UI for a Mexico–US flight search tool (academic project). Editorial-minimal direction: warm paper surfaces, ink typography, timetable-style data rows. Built with React + Vite + CSS custom properties.

## Concept

**The concept is: a departure board at a travel desk** — expressed through horizontal timetable rows, mono numerals for schedules and fares, warm off-white field with ink-navy type, and a single bronze accent reserved for prices and primary actions only.

## Anti-slop gate (passed)

| Check | Status |
|---|---|
| No emoji icons | Pass — Lucide SVG only |
| No Inter / system-blue default | Pass — Plus Jakarta Sans + IBM Plex Mono |
| No purple gradients | Pass |
| No category-reflex palette (sky-blue travel) | Pass — warm neutrals + bronze |
| No uppercase label spam | Pass — sentence-case labels |
| No card-in-card nesting | Pass — flat elevation hierarchy |
| No borders-as-default elevation | Pass — shadow + background contrast |
| Touch targets ≥44px | Pass |
| Empty / loading / error states | Pass |
| `:focus-visible` rings | Pass |

## Color (60 / 30 / 10)

| Role | Light | Dark |
|---|---|---|
| 60% Background | `#f4f1ec` | `#121110` |
| 30% Surface | `#ffffff` | `#1e1d1b` |
| 10% Accent (CTA) | `#1c1b19` | `#f4f1ec` |
| Price emphasis | `#8f5e2c` | `#c49a6c` |
| Link / detail | `#0b5f63` | `#3d9ea3` |

Muted text `#5c5852` on `#f4f1ec` ≈ 5.8:1 (AA pass).

## Typography

| Token | Size | Weight | Use |
|---|---|---|---|
| display | clamp(1.75rem, 4vw, 2.25rem) | 700 | Page title |
| h2 | 1.375rem | 700 | Section headings |
| h3 | 1.0625rem | 600 | Card titles |
| body | 1rem (16px) | 400 | Default |
| body-sm | 0.875rem | 400 | Meta |
| caption | 0.8125rem | 500 | Labels |
| mono-data | 0.9375rem | 500 | Times, codes, prices |

- **Display / UI:** Plus Jakarta Sans
- **Data:** IBM Plex Mono (tabular nums)

## Spacing & shape

8px grid. Radii: 6 / 10 / 14px. Shadows: ambient only, no harsh drop shadows.

## Motion

150–250ms ease-out. `prefers-reduced-motion` disables transforms.

## Components

| Primitive | Location |
|---|---|
| Logo | `components/brand/FlightScopeLogo` — scope arc + flight path; ink plate + bronze node |
| Button | `components/ui/Button` |
| Badge | `components/ui/Badge` |
| Switch | `components/ui/Switch` |
| Grouped results panel | `components/ResultsList` — one surface, hairline dividers (Apple grouped list) |
| Price chart | `components/PriceTrend` + `utils/priceChart.ts` |

## References adapted

- **Google Flights** — inline search bar, horizontal result rows, nearby-date price strip
- **Monocle / editorial travel** — warm paper, restrained palette
- **Airport FIDS boards** — mono times, endpoint alignment
- **ui-ux-kit B3** — sticky nav with logo lockup; footer with brand, explore links, legal bar
- **Apple HIG** — clarity/deference chrome, frosted sticky header, 44px touch targets
