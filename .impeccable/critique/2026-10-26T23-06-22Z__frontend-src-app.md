---
target: the dashboard
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/erikskogstrom/dev/private/grid-frequency-dashboard/frontend/src/app"
timestamp: 2026-10-26T23-06-22Z
slug: frontend-src-app
closed: true
---
# Critique: dashboard (frontend/src/app)

Score: 28/40 (Good, 70%). Heuristics: 1:3 2:3 3:3 4:3 5:3 6:3 7:2 8:3 9:3 10:2. Method: DEGRADED single-context (sub-agents not spawned without explicit user request).

## Design specificity verdict
Half authored (status shape + word + colour grammar, quiet-when-normal, stale dimming, all from PRODUCT.md), half category-standard (hairline panels, system sans, hero + chart + two columns). Detector: `[]` from CLI, "No anti-patterns found" in page.

## Priority issues
- [P1] Disturbance trigger is far from the chart it affects (below the fold at 1440x900, last on mobile). Fix: move it beside the chart heading or header. Command: layout.
- [P1] History is fetched once and goes stale silently, against "Honest about freshness". Fix: show "as of" time and refresh periodically (reload()), keep old values during reload. Command: harden.
- [P2] One concept, three names (normal band / alarm thresholds / outside band) and decimal mismatch (inputs show "49,9" vs two-decimal Hz). Fix: one vocabulary, format field values to two decimals. Command: clarify.
- [P2] Chart does not mark when status changed; reference labels collide when thresholds are near 50. Fix: onset tick with clock time; nudge or hide close labels. Command: layout.
- [P3] Empty lower-left on desktop; "Simulation" h2 nested inside the "Alarm thresholds" region. Fix: own labelled section, rebalance columns. Command: polish.

## Persona red flags
Alex: no presets/reset for thresholds. Sam: Simulation heading nested in another region; trend not announced. Riley: label overlap at 49.99/50.01; cleared number field gives no inline hint until blur; history cannot refresh except by changing range.
