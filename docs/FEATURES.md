# Scattered feature reference

This is the behavioral contract for the `scattered-radar` Web Component. It is intentionally framework-neutral: React, Vue, server-rendered pages, and plain HTML can all host the same element.

## Rendering model

- **Slices** are named colored categories around the chart.
- **Bands** are named concentric stages, ordered from the center outward.
- **Items** belong to exactly one slice and one band.
- **Position** is optional and stores the fractional angle/radius inside that slice-band cell. When omitted, Scattered derives a stable placement from the item id.
- **Native hover labels** name the item, slice, and band, while the SVG button has the same accessible name.

## Interaction model

| Input | Result |
| --- | --- |
| Pointer click or focus | Selects a signal and emits `select`. |
| Pointer drag | Calculates a new slice, band, and durable in-cell `position`, then emits `change`. |
| Left / Right | Moves the focused signal one slice, wrapping around the radar. |
| Up / Down | Moves the focused signal one band, bounded by the center and outermost ring. |
| Enter / Space | Selects the focused signal. |
| Escape | Clears the current selection. |

`readonly` leaves inspection, hover labels, and keyboard focus available, but disables pointer and keyboard reclassification.

## Events

All events bubble and are composed, so application code can listen from a parent element even though the chart renders in Shadow DOM.

| Event | Detail |
| --- | --- |
| `load` | `{ data }` after a `data-src` document loads and normalizes. |
| `error` | `{ error }` when a `data-src` request or validation fails. |
| `select` | `{ item }` with a cloned selected item. |
| `change` | `{ data, item, previous }` with the updated complete radar and cloned before/after values for the changed item. |

Scattered does not save. That is deliberate: the host owns the data store, undo model, validation rules, and network behavior.

## Host controls

| Control | Effect |
| --- | --- |
| `radar.data = document` | Validates and renders either data shape. |
| `data-src="/report.json"` | Loads a JSON document when connected. |
| `radar.filter = "text"` | Shows only matching item names, descriptions, slice names, or band names. |
| `radar.selectedId = "item-id"` | Sets the visible selected point. |
| `radar.readonly = true` | Uses the control as a non-editable report. |

For a visual, end-to-end walkthrough, see the [README screenshots](../README.md#see-it-working) and the [live demo](https://ui.aubreyalexander.com/scattered/).
