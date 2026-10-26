---
version: 1
slug: "frontend-src-app"
primary_target: "frontend/src/app"
related_targets: []
---

# Surface brief: dashboard (single page)

Mode: Operate. Visitor: an operator or engineer glancing from a distance; actual audience is energy-sector developers who read the code. Task: read value, status and direction in two seconds; then trend, history, thresholds, disturbance. Constraints: Angular 22, Tailwind, inline SVG chart, no component library. Pinned by PRODUCT.md, not by the direction roll (user chose "build from PRODUCT.md").

## Direction contract

THESIS: One screen that reads like road-sign legibility: the value is the biggest thing, status is a shape plus a word, and the page stays quiet until something is wrong. Refuses the card grid, the hero-metric template with a coloured number, and decorative accent colour.

OWN-WORLD: Neutral low-glare surfaces in light and dark (follows the system), cool-tinted greys, system sans with tabular numerals. Colour only means something: green/amber/red for status, the normal band on the chart. Controls are neutral (ink on surface), focus ring in ink. Status shapes drawn in signage geometry: circle = normal, triangle = outside band, octagon = critical.

STORY: A domain expert sees the value, whether it is normal and which way it is heading without reading. A developer sees a credible tool, not a template, with source (Simulated) and connection always shown.

FIRST VIEWPORT: Slim header (title, "Simulated" source, connection state with last-sample time). Under it a status band across the full width: the value at 6rem with Hz and deviation in mHz on the left; on the right the status sign (shape plus label) and the trend (arrow, label, mHz per 10 s). The band tints amber or red when not normal. Below, the two-minute chart across the full width with nominal 50.00, band edges and critical limits as labelled reference lines, clock times on the x axis. History and settings follow as plain sections separated by hairlines.

FORM: Pinned by PRODUCT.md (position n/a); signature move from road-sign shape grammar. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
