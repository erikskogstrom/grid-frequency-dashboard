# Product: Grid Frequency Dashboard

<!-- impeccable:product-schema 1 -->

## What it is
A small real-time dashboard that shows the frequency of the Nordic power grid (synchronous area, nominal 50 Hz). The data is either simulated or a replay of real historical measurements from Fingrid. It is a demo project: a modern Angular frontend on top of a .NET backend that streams samples over SignalR.

It is not an operational tool, and the UI should never suggest that it is.

## Who it's for
- **Imagined user:** an operator or engineer in a balancing or control-room setting. They glance at the screen, often from a distance, to see whether the frequency is inside the normal band and which way it is heading, and they act when it isn't.
- **Actual audience:** developers and technical leads in the energy sector who open the app or read the code. They know the domain and will notice if units, thresholds or terminology are off.

Desktop browser first, often on a large second monitor. Must also work on a laptop and stay usable on a phone.

## What the user needs to do
1. See the current frequency and its status at a glance, within two seconds and from a few metres away
2. See the recent trend (about the last two minutes) to judge direction and stability
3. Look back at history over 1, 5 or 15 minutes
4. Adjust the alarm thresholds
5. Trigger a disturbance (simulated mode only) and watch the system react

## Domain rules
- Nominal frequency 50.00 Hz. Normal band 49.90–50.10 Hz, used as default thresholds that the user can adjust.
- Status: **Normal** inside the band, **Outside normal band** outside it, **Critical** below 49.50 Hz or above 50.50 Hz.
- Show the frequency in Hz with two decimals, and the deviation from 50 Hz in mHz as a secondary value (for example −23 mHz).
- Times in 24-hour format, local time.
- Always show the data source: "Simulated" or "Replay · Fingrid · <date>". Replayed data must never look live.
- Always show the connection state: Connected, Reconnecting, Disconnected. Stale data must look stale.

## Tone
Calm, precise and factual, like good control-room software. Short labels in plain English. No marketing copy, no exclamation marks, no emoji. The interface stays quiet when everything is normal and only gets louder when something is wrong.

## Visual direction
- Mode: product UI, not brand or marketing
- One page with a clear hierarchy: the current value is the largest thing on screen, then status, then trend, then history and settings
- Neutral, low-glare surfaces. Color is reserved for meaning (status and the normal band on the chart), never decoration.
- Dark and light themes, following the system setting
- Tabular numerals for all values, so digits don't jump as they update
- The chart shows nominal 50 Hz and the normal band as reference lines, so the trend can be read without looking at numbers
- Information-dense but uncluttered: no gradients, glass effects, decorative illustrations or grids of identical cards

## Motion and updates
- New samples arrive every 500 ms. Updates should feel steady, not busy: no animation on every value change and no flashing.
- Status changes may get a short, subtle transition. Respect prefers-reduced-motion.

## Accessibility
- WCAG 2.2 AA contrast in both themes
- Status is never conveyed by color alone: always a text label, plus a shape or icon
- Status changes are announced politely to screen readers (aria-live), individual samples are not
- Fully keyboard operable with visible focus

## Constraints
- Angular 22 with Tailwind CSS, no component library
- The chart is an inline SVG drawn from signals, no chart library
- Single page, no auth
- Replay of real Fingrid data is planned, not built. Only simulated data exists today, so the UI must only ever claim "Simulated".

## What good looks like
A domain expert glancing at the screen can tell the current value, whether it is normal and which way it is heading. A developer opening the app sees a clean, credible tool, not a template.

## Platform

web

## Positioning
A small, readable modern Angular + .NET + SignalR codebase whose domain details (units, thresholds, terminology, status rules) hold up to an energy-sector expert. A generic real-time demo could not truthfully claim the domain credibility.

## Operating Context
- Imagined use: glanced at from a distance on a large second monitor in a balancing or control-room setting.
- Actual use: a developer or technical lead runs it locally (`aspire run`, or backend and frontend separately) or reads the code.
- Data today comes from the backend simulator (`backend/GridFrequency.Api/FrequencySimulator.cs`), pushed every 500 ms over SignalR; history is an in-memory buffer of about 15 minutes.

## Evidence on Hand
- A working simulator, API, SignalR hub and Angular app in this repository.
- Absent, and not to be fabricated: any real Fingrid measurement data, any real operator or user feedback, any claim of operational use.

## Product Principles
- Never look operational: it is a demo, and the UI always shows its data source.
- Quiet when normal: calm when everything is normal, louder only when something is wrong.
- Honest about freshness: connection state and data source are always visible; stale or replayed data never looks live.
- Domain precision over decoration: units, thresholds, decimals and terminology are exact.
