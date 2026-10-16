# Design call #6 — Batch verb scope (2026-10-16)

Call (Steve-approved): batch actions (process/cook/preserve-all) act blind —
they should see the relevant counter/stash state (what's available, what's
needed), so batching is informed work, not blind busywork.

## Root cause

The batch verbs live in two layers: engine (`src/js/food.js`, `src/js/game.js`)
and UI (`src/js/app.js`). Grep-mapped:

| Batch verb | Engine | Container param? | Single-item verb sees container? |
|---|---|---|---|
| `cookAll()` | game.js:14044 (+ food.js:2737 wrapper) | **NO** — hardcoded to `state.scholar.inventory` | `cookFood(idx, container)` — yes |
| `preserveFood(idx, container)` | food.js:685 | yes | same fn |
| `renderFat(idx, container)` | food.js | yes | same fn |
| `cleanCarcass(idx, container)` | food.js:619 | yes | same fn |
| `makePemmican(container)` | food.js | yes (batch by design) | n/a |

Two-part blindness, both confirmed in code:

1. **`cookAll` lacks the visibility its own single-item sibling has.**
   `cookFood(idx, container)` takes a container; `cookAll()` is hardcoded to
   the pack (`for (const item of (this.state.scholar.inventory || []))` in
   game.js:14044, plus five more pack reads in the food.js wrapper). This is
   exactly the hypothesized shape: the batch verb calls in a loop without the
   visibility the single verb has.

2. **The stash-counter UI never offers the batch forms.** The counter
   (`stashSectionHtml`, app.js:14356) wires per-item verbs to the stash
   (`data-stash-clean/smoke/render/cook` → `Game.cleanCarcass(idx, stashOf())`
   etc.) but has no batch buttons — except pemmican, which already ships an
   honest preview (`Make pemmican (N bars)`). At camp, unprocessed hauls live
   on the counter (`prepStash`), so the fire-popup batch buttons
   (`Cook N raw` / `Smoke N (preserve)`, app.js:1818+) act on the pack only
   and can say "Nothing to preserve (cleaned or cooked meat)" while the
   counter holds smokable meat. The engine already accepted containers for
   3 of 4 verbs (cf. the 2026-10-09 comment at app.js:14972: "the engine
   takes a container; the UI just never passed the stash") — the batch forms
   were the remaining gap, plus `cookAll` which couldn't take one at all.

What the verbs ALREADY see (not broken, left alone):
- Fire: `nearFire()` gates + honest "Need a fire…" in every batch path.
- Fuel: `consumeCookFire(16/12)`; mid-batch death narrated, batch downgraded.
- Water: cook checks per-item with an honest "haul water first" message.
- Tools: `cleanCarcass` batch checks `hasCuttingTool()` with a pointing message.
- Spoilage: every batch path drops rotten inputs with "leave it for the flies"
  narration — rot is never laundered.
- Technique: blind penalties + one-time teaching (canon PRESERVATION.md).

Deliberately OUT of scope (new systems, not root cause):
- Specialist batch ("have a specialist smoke everything") — specialists are
  per-item via `askSpecialist` with who/howFar option detail; a batch
  specialist verb would be a new system.
- Pantry as a batch source — pantry is the *destination* of finished food;
  taking is physically gated (miser break-it). Not a source.
- Spoilage-urgency in button labels — the counter already sorts rotting-first
  with per-item clocks (`stashUrgency`/`stashClock`); the verbs narrate
  spoiled drops. Labels stay counts-only (mobile-safe).

## The call made

Scoping rule: **a batch verb acts on the container you invoke it from, and
says what's there.** Pack buttons act on the pack (already count-labeled);
the counter gets the batch forms it was missing, acting on the stash with
honest counts. No verb reaches into a container you didn't point it at.

Changes:
1. `Game.cookAll(container)` — optional container (default pack), threaded
   through the food.js fuel/wrapper so the wrapper's pack reads (anyCookable,
   rawBefore, spoilage sweep, meat/plant pipeline, blind-cook scaling) all
   use the same container. Zero behavior change for existing pack callers.
2. Counter footer gains conditional batch buttons (only when N>0):
   `Clean all (N)`, `Cook all (N)`, `Smoke all (N)`, `Render all (N)` —
   wired to the batch forms with `stashOf()`. Counts mirror each verb's own
   target predicate, excluding items the verb drops as spoiled (what the
   verb will actually act on). Empty containers keep the existing honest
   engine messages ("No carcasses to clean.", "Nothing raw to cook.", …) —
   no silent no-ops.

## Verification

- `scripts/test-batch-20261016.js` (RED→GREEN via sim-harness `loadGame`,
  seeded): batch verbs act on a passed stash container and leave the pack
  untouched; empty containers report honestly; spoiled inputs are dropped
  with narration, never batched.
- `node scripts/check.js --quick` green.
- UI wiring (app.js) verified by inspection only — app.js is DOM-only and
  not loaded in node. The four new buttons follow the existing
  `data-stash-*` + `rewire` pattern exactly; the logic layer they call is
  what the proof test covers.
