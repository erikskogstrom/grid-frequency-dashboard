---
name: Grid Frequency Dashboard
description: Quiet, legible control-room dashboard for the Nordic grid frequency, light and dark.
colors:
  page: "#f4f6f8"
  panel: "#ffffff"
  sunken: "#eef1f4"
  line: "#d8dee5"
  edge: "#74808c"
  ink: "#12171c"
  muted: "#515c68"
  ok: "#17733f"
  warn: "#8a5200"
  crit: "#b3261e"
  page-dark: "#0d1014"
  panel-dark: "#141a20"
  sunken-dark: "#0a0e12"
  line-dark: "#27313b"
  edge-dark: "#66798c"
  ink-dark: "#e9eef3"
  muted-dark: "#9aa6b2"
  ok-dark: "#4ade80"
  warn-dark: "#fbbf24"
  crit-dark: "#ff7b72"
typography:
  value:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "6rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tnum"
  status:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
  headline:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.5rem"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
    fontFeature: "tnum"
rounded:
  xs: "2px"
  md: "6px"
  xl: "12px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
components:
  status-band:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "28px 32px"
  status-band-outside:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.warn}"
  status-band-critical:
    backgroundColor: "{colors.crit}"
    textColor: "{colors.crit}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.panel}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "0 16px"
  field:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "0 12px"
---

# Design System: Grid Frequency Dashboard

## Overview

**Creative North Star: "The Quiet Signboard"**

The page behaves like good signage: the one number that matters is the largest thing on it, status is a shape plus a word, and everything else stays out of the way until something is wrong. When the frequency is normal the screen is neutral and calm; when it is not, the status band tints and the shape and colour get louder. Nothing decorative competes with the reading.

It is a product UI, not a brand surface. The look is neutral and low-glare in both light and dark (it follows the system), set in the system sans with tabular numerals so digits do not jump at two updates a second. Colour is never decoration: green, amber and red mean frequency status, and the normal band on the chart is the only other place colour appears.

**Key Characteristics:**
- One framed surface (the status band); everything else is plain sections divided by hairlines. No grid of cards.
- Status is always shape plus text plus colour: circle with check, triangle, octagon.
- Neutral controls (ink on surface); no brand accent.
- Chart reference lines carry the meaning: nominal, normal band, critical limits, each labelled.
- Stale data is visibly dimmed, with the last-sample time shown.

## Colors

A cool-tinted neutral scale in two themes, plus three status colours that are chosen per theme to keep AA contrast on both the panel and the tinted status band.

### Primary
- **Ink** (#12171c light / #e9eef3 dark): text, the data line, nominal reference line, primary buttons, focus ring. There is no separate accent hue.

### Neutral
- **Page** (#f4f6f8 / #0d1014): the page ground.
- **Panel** (#ffffff / #141a20): the status band and the text colour on primary buttons.
- **Sunken** (#eef1f4 / #0a0e12): input fields.
- **Line** (#d8dee5 / #27313b): decorative dividers and chart gridlines.
- **Edge** (#74808c / #66798c): borders of controls (at least 3:1 on the surface they sit on).
- **Muted** (#515c68 / #9aa6b2): secondary text, units, axis labels (6.2:1 light, 7.2:1 dark on the page).

### Status
- **Normal green** (#17733f / #4ade80): the Normal label and icon, the normal band and its edge lines, the live chart marker.
- **Warning amber** (#8a5200 / #fbbf24): Outside normal band, a lost or reconnecting connection, a non-zero outside-band count.
- **Critical red** (#b3261e / #ff7b72): Critical, the critical limits and zones on the chart, a disconnected state, errors.

### Named Rules
**The Meaning-Only Colour Rule.** Green, amber and red appear only where they state a status or a limit. Never use them, or any hue, for decoration or emphasis.
**The Never-Colour-Alone Rule.** Every status colour is paired with a text label and, for frequency status, a distinct shape.
**The Quiet-Normal Rule.** The Normal state is neutral surface with ink text; only the small status label and icon carry green. Tints and heavy colour are reserved for warn and critical.

## Typography

**Display Font:** the platform sans (`ui-sans-serif, system-ui, sans-serif`)
**Body Font:** the same
**Label/Mono Font:** the same, with tabular numerals

**Character:** a single workhorse sans carries everything. Hierarchy comes from size and weight only, and every number uses tabular figures.

### Hierarchy
- **Value** (600, 6rem on sm and up / 3.75rem below, line-height 1): the current frequency, the largest element on the page.
- **Status** (600, 1.5rem): the status and trend words in the band.
- **Headline** (600, 1.25rem): the page title.
- **Title** (600, 1rem): section headings (Last 2 minutes, History, Alarm thresholds, Simulation).
- **Body** (400, 0.875rem): descriptions, captions, units, deviation line (1.125rem).
- **Label** (400, 0.75rem, tabular): chart axis and reference labels.

### Named Rules
**The Tabular Rule.** Every value that updates uses tabular numerals (`tabular-nums`), so digits never shift.

## Layout

A single centred column, max width 72rem, with 16px side gutters on phones and 32px from sm. Vertical rhythm is 40px between major sections (status band, chart, history and settings). History and settings sit side by side from lg (a 24rem settings column) and stack below, separated from the chart by a hairline. The status band is one row on large screens (value left, status and trend right) and stacks on small ones. The chart is full width with a 2.25rem axis column on the left and a reference-label column on the right (7rem from sm, 2.75rem below, where only the numbers show). Responsive behaviour is structural, not fluid type.

## Elevation & Depth

Flat. Depth is expressed by a 1px border (`line`) and by the tonal difference between page and panel; there are no shadows. The status band changes border and tint, never elevation.

### Named Rules
**The Flat-By-Default Rule.** No box shadows. A surface is either a hairline-bordered panel or part of the page.

## Shapes

Soft but restrained: 12px on the one large framed surface (the status band), 6px on controls, 2px on skeleton blocks and legend-like squares. Circles are reserved for status and connection shapes. Status shapes follow signage geometry: circle with check (normal), triangle with exclamation (outside normal band), octagon with exclamation (critical), dashed circle (no data). Stroke weight 2 on a 24px grid.

## Components

### Buttons
- **Shape:** 6px radius, 40px high, 16px horizontal padding, 14px medium text.
- **Primary:** ink background, panel-coloured text; hover and active step the ink opacity down (85% and 70%).
- **Secondary:** transparent with a 1px edge border and ink text; hover and active add a 5% and 10% ink wash. Used for Trigger disturbance and the time-range buttons (selected = inverted to ink, via aria-pressed).
- **Disabled:** 50% opacity, not-allowed cursor.
- **Focus:** 2px ink outline with a 2px offset on every focusable element.

### Inputs / Fields
- **Style:** sunken background, 1px edge border, 6px radius, 40px high, tabular figures.
- **Error:** the border turns critical red and the message sits below in red text, linked with aria-describedby; shown after the field is touched.

### Status band
The single framed surface. A 12px-radius, 1px-bordered panel: value and deviation on the left, status (shape plus label) and trend (arrow, word, mHz per 10 s) on the right. Warn and critical tint the band with 10% of the status colour and set its border to the full colour. Colour changes over 300 ms (none under reduced motion).

### Chart
Inline SVG drawn from signals, stretched to its box with non-scaling strokes; text and the end marker are HTML so they stay readable. Reference lines: nominal (solid ink), normal-band edges (dashed green), critical limits (dotted red), with 10% tinted zones for the band and the critical regions. The data line is ink, 2px; the end marker is coloured by the latest status and goes grey when data is stale. The most recent status change is marked with a dotted vertical line and a label (new status and clock time). Controls that act on the chart, such as Trigger disturbance, sit in its header so cause and effect are visible together; reference labels that would collide with the nominal label are hidden (the line stays).

## Do's and Don'ts

### Do:
- **Do** keep status as shape plus text plus colour.
- **Do** use the theme tokens (`bg-panel`, `text-muted`, `text-ok`, `border-line`) rather than raw palette colours.
- **Do** use tabular numerals for every changing value.
- **Do** make stale or disconnected data look stale: dim it and show the last-sample time.
- **Do** keep motion to short state transitions and respect `prefers-reduced-motion`.

### Don't:
- **Don't** add an accent colour, gradients, glass effects, shadows or decorative illustrations.
- **Don't** convey status with colour alone.
- **Don't** animate on every sample or flash on change.
- **Don't** turn the page into a grid of identical cards; the status band is the only framed surface.
