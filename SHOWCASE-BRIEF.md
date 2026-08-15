# Scattered: reporting control showcase

## Recommendation

Lead with a live, anonymous “portfolio decisions” radar. It should make a visitor move a point before it explains anything. The interaction is the proof: reporting does not have to be a static dashboard.

## Audience and action

- **Audience:** Oracle reporting peers, hiring managers, and technically curious collaborators.
- **Primary action:** Drag one item to a new category or stage, then notice the resulting update.
- **Second action:** Visit the open-source repository or copy the component into a project.

## Storyboard

1. **Claim — 5 seconds.** “Reporting people can think inside.” A quiet one-line explanation of the two axes.
2. **Try it — 20 seconds.** Full-width live radar with a small prompt: “Move one signal.” Selected point details update on focus, click, or drag.
3. **Explain it — 20 seconds.** Three short captions: sector = owner/category; ring = confidence/maturity; motion = a changed reporting decision.
4. **Make it real — 20 seconds.** A compact changelog card updates after a move: “Rust: Assess → Trial.” The demo may keep changes in memory, clearly labeled.
5. **Take it — 10 seconds.** “Scattered is open source.” Link to source, API snippet, and contact route.

## Companion demo: Daypaint

Place **Dayparting Control** beside Scattered as the second proof point. Built from Aubrey’s advertising work at Zynga, it treats a campaign’s weekly schedule as paintable space, then normalizes the paint into time ranges. Together the demos show two related strengths: polar direct manipulation for classification and time-grid painting for ad scheduling.

## Visual direction

Use Aubrey’s portfolio voice: editorial, warm, precise, and a little theatrical. The radar should be mostly paper/ink with saturated point colors—avoid the generic “dark dashboard” look. Give the live control generous whitespace and make its labels feel like annotations in a report, not a software settings screen.

## Page title and card copy

**Title:** Scattered — a reporting surface you can move through

**Card copy:** “A two-axis reporting control for mapping a portfolio, capability set, or decision backlog. Move a signal. See the story change.”

## Technical handoff

The control is a dependency-free Web Component (`<scattered-radar>`). It takes a JSON-compatible `data` object, emits `select` and `change` events, supports pointer drag and keyboard movement, and makes no persistence assumption. The showcase should persist its local demo changes only in the page session.
