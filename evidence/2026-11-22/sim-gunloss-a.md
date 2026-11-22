# sim-gunloss-a — omar's vanished gun, traced (DIAG-GO)

Loop A run `fleshout-20261122T1415Z`, axis scale-onramp. Arm: **sim-gunloss-a**,
the omar gun-loss TRACER (DIAG, instrument-only, no game-code behavior change).

## Verdict: DIAG-GO — the gun never vanished

**The exact call: `mantleBecome`, `src/js/villager-build.js`, day 134** — the
succession that made omar the scholar the day the previous scholar
(gen_e478zbq) died in the arena. It moved the gun and the cells onto the
new scholar's body, where the old census could not see them:

- the **searcaster went to the scholar's ranged weapon slot**
  (`scholar.equipped.ranged = 'searcaster'`),
- **one fusion cell went to the scholar's accessory slot 3**
  (`scholar.equipped.acc3 = 'fusion_cell'`) — Omar had been wearing a
  cell as a trinket since day 104,
- the **second cell was destroyed by the transfer itself**: the worn
  transfer copies worn gear as single units, so a 2-cell stack worn as
  one accessory collapses to 1. Net loss of the whole event: **0 guns,
  1 cell**.

The cellcheck census missed all of this because it counted only the
scholar's *inventory* for cells and read the ranged slot off the *wiped
villager record* — never the scholar's own worn slots. The gun and the
cell were sitting on the new scholar in plain sight the whole time.

In plain words: Omar didn't lose his gun. He *became* the scholar, and
the scholar's kit is worn, not carried. The old count looked in his
empty pockets and found nothing, while the gun was in his hands and a
cell was hanging off him as a charm. One cell really is gone, though —
worn down to a single charm when two went in.

## The story, day by day (seed 107369, reproduced exactly)

- **Day 103** — Omar wins the searcaster + 2 cells as a contest prize
  (`_cxItemPrize`, contests.js:229). Grant event in the corpus confirms
  it. His pack holds gun 1, cells 2.
- **Day 104** — the game's auto-gear step dresses him: the gun becomes
  his ranged weapon, and one fusion cell becomes accessory 3 — a trinket.
  His worn set from day 104 to day 133 reads
  `{melee: hunting_spear, ranged: searcaster, head: reading_glasses,
  torso: witness_coat, acc1: mixtape, acc2: chefs_knife,
  acc3: fusion_cell}`. The pack count stays 2 the whole time (wearing
  something does not take it out of the pack).
- **Day 128** — Omar leaves on expedition; away days 128–135.
- **Day 130** — Omar kills the anaconda empress on expedition. Cells
  still read 2 on days 130–133: no shot was fired.
- **Day 134** — gen_e478zbq, the scholar, dies in the arena. The death
  routine (`playerDeath`, ledger.js) calls `mantleBecome` (ledger.js:935)
  to make Omar the new scholar. Inside it, the worn-gear loop
  (villager-build.js:648) lifts each worn piece out of Omar's pack —
  two cuts, caught live by the tripwire: gun 1→0, then cells 2→0 —
  and seats them on the scholar (villager-build.js:672): ranged
  searcaster, acc3 fusion_cell. Omar's villager record is then wiped
  (villager-build.js:701). The census that morning still reads Omar's
  pack as gun 1 / cells 2; the next morning it reads 0 / 0, and the
  scholar's inventory reads 0 / 0 — the "vanishing". The recorder's
  day-134 scholar snapshot reads cells 1, gun in the ranged slot.
- **Day 136** — Omar dies in the wild *as the scholar*. The death
  routine moves the gun + the worn cell off the scholar and onto his
  corpse (`playerDeath` delta that day: scholar gun −1, cells −1). No
  one ever takes them from the corpse in the rest of the run
  (0 matching corpse-take events); the gun presumably still lies on
  Omar's body when the village is lost on day 145.

The same pattern fires elsewhere in the run: on day 84 another
succession moved a searcaster + 1 cell onto the scholar the same way
(ranged + accessory slot). This is not a one-off — it is how every
succession carries a holder's worn gear.

## Why the cellcheck refutation was wrong

The cellcheck evidence (§4.3) refuted succession *on the code as
written*: `mantleBecome` moves the successor's gear onto `scholar.*`,
so the gun "should have appeared in the scholar inventory". It did
appear — but on the scholar's *body*, not in the inventory. Two census
blind spots stacked:

1. The scholar cell count read `scholar.inventory` only. A cell worn as
   an accessory is not in the inventory.
2. The scholar ranged read came from `getPerson(villagerId)` — the
   villager record `mantleBecome` had just wiped. The live ranged slot
   lives on `state.scholar.equipped.ranged`, which the census never
   read.

No theft, no trade, no gift, no expedition strip, no corpse move, no
volley: the recorder wrapped all fifteen pack-removal paths in the
prereg census plus a splice tripwire and a reassignment watch, and on
day 134 exactly one named call empties the pack — `mantleBecome`,
with `playerDeath` showing the same numbers only because its
before/after snapshot spans the inner call (the mutation rows name
`mantleBecome`'s own lines: the cuts at villager-build.js:648, the
seating at :672, the wipe at :701; `playerDeath`'s own lines,
ledger.js:725–726, moved 0 guns and 0 cells — the dead bearer's gear,
which held none).

## Frozen bars (prereg `sim-gunloss-a-prereg.md`)

| Bar | Result |
|---|---|
| (1) Instrument validity — proof test green, analyzer selftest green, 0 instrument errors | **PASS** — proof test 42/42, analyzer selftest 20/20, `instrumentErrors: 0` on the judged run |
| (2) Reproduction — re-run reproduces the frozen cellcheck corpus on seed 107369 | **PASS** — 0 diffs (omar census rows 103–134, scholarId series 125–136, scholar cells every day, deaths 130–136 all identical) |
| (3) Attribution — day-134 loss names a SINGLE call path | **PASS (ATTRIBUTED)** — `src/js/villager-build.js :: mantleBecome`, day 134; destination gun → scholar ranged, 1 cell → scholar acc3; net loss 0 guns, 1 cell |
| (4) Det-gate — recorder-on vs recorder-off identical on recorder-independent counters | **PASS** — 0 diffs (days, endReason, maxWave, standing, deaths, killCalls, fights, casts, spawns, daily length all identical; see note on `sayCount` below) |
| (5) Wall numbers for the re-run window | reported below (single seed: a window, not a band verdict) |

**Verdict: DIAG-GO.** Anchor `c8c30bd55` (worktree tip at run time;
rebased onto local master `1c11dbb14` before the judged run, proofs
re-run green after the rebase). Judged corpus:
`evidence/2026-11-22/perseed-gunloss-a-diag/gunloss-a-s107369-gunloss-a-diag.json`
(1,279 gunloss events, 143 gun-census days, 0 errors). Det-gate leg:
`evidence/2026-11-22/perseed-gunloss-a-detgate/gunloss-a-s107369-gunloss-a-detgate-diag.json`.
Analysis: `evidence/2026-11-22/gunloss-a-analysis.json`.

## Wall numbers (re-run window, seed 107369, 150d death-aware)

Single seed — a window, not a band verdict. Days 145, village lost,
maxWave 4, unlockedWave 4, standing 199, scale regional, won false.
The village never reached national on this seed, on either leg.

## Instrument notes — two things the build taught us

1. **The recorder first hung on its own install (found and fixed).**
   The first build looked the target up with `Game.getPerson`, which
   for a background-survivor seed falls through to `hydrateSeed` — and
   `hydrateSeed` draws RNG and calls `autoEquip`, which the recorder
   wraps, so a snapshot re-entered getPerson → hydrateSeed → autoEquip
   forever (install never returned; ~318 CPU-seconds burned on seed 7,
   where Omar is not yet roster). The fix: the recorder reads
   `data.villagers` directly and never hydrates, plus a per-function
   re-entrancy guard on the wraps. Regression test added (§8 of the
   proof test: a non-roster target installs in <1s with `found:false`).
   A recorder must never draw RNG or mint people — `getPerson` does
   both for background seeds.
2. **Why a fusion cell becomes a trinket.** The gear step scores *any*
   carried item for an empty accessory slot (`equipScore`,
   equipment.js — non-tool, non-sentimental items score 3 for acc
   slots; any item scores 2 for an empty head slot). Omar's cell took
   acc3 because his head slot already held his reading glasses; on the
   proof-test seed the holder's empty head slot took it instead. Same
   mechanism, different slot — which is why the recorder counts the gun
   and the cells in *every* worn slot on both sides, not just ranged
   and inventory.

## Metric review (for the next run)

- **`sayCount` is not a det-gate counter.** The analyzer's det-gate
  field list originally included it; the off leg records 0 by
  construction because the say lines are counted by the instrument
  itself (on 13,836 vs off 0), while every game counter is identical.
  Removed from the det-gate fields; the prereg's bar-4 list never
  included it. The det-gate passes on the game counters.
- **Attribution must be nesting-aware.** A wrap's before/after
  snapshot spans everything inside it, so `playerDeath` shows the
  same pack delta as the `mantleBecome` it calls. The first analyzer
  build called that UNATTRIBUTED (two events, same numbers). The fix:
  the splice/reassign backstops name the function whose own lines
  moved the pieces, and the attribution goes to that inner call, with
  the outer span named. Backstop rows are evidence, never rival calls.
  (Analyzer selftest grew 17 → 20 with nested-pair fixtures.)
- **The scholar census should read `state.scholar.equipped`.** The
  cellcheck scholar census read the ranged slot off the wiped
  villager record and cells off inventory only. Any future scholar-gear
  census must count worn slots (the recorder's `gunlossScholarSnap`
  does this now: inventory + every equipped slot).
- **The 1-cell collapse is a real defect, not a measurement artifact.**
  The worn transfer copies worn gear as single units with no `units`
  field, so a stacked consumable worn as a trinket loses the rest of
  its stack. Worth a fix (carry the stack's units through the worn
  copy, or never wear a stacked consumable), but it is a one-cell
  defect, not the gun loss. Filed as the next lever below, not
  landed here — this arm is instrument-only.

## Sense test (transcripts around the loss, days 133–136)

The frozen corpus has almost nothing to say on these days — and that
is itself the reading. No say lines name Omar, gen, or the succession;
the day-134 fights (dustboar, callback, eulogy) are the *old*
scholar's fights, not Omar's; Omar is in no fight row days 128–136.
The only day-134 death that matters is gen_e478zbq in the arena, as
the player — the succession is a bureaucratic fact, not a scene. The
story the numbers tell is coherent: a scholar dies, the next in line
inherits the kit while away on expedition, and two days later he dies
in the wild wearing it. Nothing in the transcripts contradicts it, and
nothing in them explains it either — the explanation lives entirely in
the recorder rows, which is why the tracer was needed. The one sour
note is the day-84 succession (another gun + cell moving the same
way while its census also read 0) — the pattern repeats, and the old
census would have missed it every time.

## Next lever

1. **Worn-stack collapse (1 cell).** `mantleBecome`'s worn copy drops
   the `units` of a stacked consumable worn as gear (2 cells → 1
   worn). Fix the copy to carry units, or stop the gear step wearing
   stacked consumables. Small, real, and now measurable.
2. **Omar's corpse.** The gun + worn cell went onto Omar's corpse on
   day 136 and nobody took them. Whether corpse loot is reachable
   after a scholar's death in the wild is a separate open thread
   (corpse-take saw 50 events in the run, none for this gun).
3. **No further tracing needed on the day-134 loss.** The question
   the arm was asked — name the exact call — is answered.

## Files

- Prereg: `evidence/2026-11-22/sim-gunloss-a-prereg.md`
- Instrument: `scripts/gunloss-recorder-a.js`, `scripts/gunloss-driver-a.js`,
  `scripts/analyze-gunloss-a.js`, `scripts/test-gunloss-a.js`
- Judged corpus: `evidence/2026-11-22/perseed-gunloss-a-diag/gunloss-a-s107369-gunloss-a-diag.json`
- Det-gate corpus: `evidence/2026-11-22/perseed-gunloss-a-detgate/gunloss-a-s107369-gunloss-a-detgate-diag.json`
- Analysis: `evidence/2026-11-22/gunloss-a-analysis.json`
- Branch: `sim-gunloss-a`, tip `c8c30bd55` (+ evidence commit to follow).
  No merge, no push, no version bump, no live verification — report to
  coordinator.
