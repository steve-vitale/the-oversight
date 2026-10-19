# sim-traphandbook-b — Trapper Handbook loot tuning + the day-0 pit beat (2026-10-18)

Loop-B food-economy KNOWLEDGE arm, run fleshout-loop-b-20261018T1845Z.
Executes sim-pitknowledge-b's NAMED NEXTS #2 (Trapper Handbook loot tuning)
and #3 (the silent scholar-background L3 grant gets a day-0 beat).

## Canon read (BEFORE sims)

- docs/CANON.md: knowledge gates every surface ("If you don't know, it
  doesn't show"); human skills ≠ alien abilities; no silent actions.
- docs/PRESERVATION.md: the food ladder (cleaned→cooked→smoked→rendered→
  pemmican) — the pit's boar/deer meat enters the existing ladder.
- No hunting/traps canon doc exists (docs/TRAPS.md does NOT exist —
  verified; stated here instead of invented, per protocol).
- Engine mechanics read from the code: books surface as loot in exactly
  two places — (1) the day-24 stalk trial pamphlet (system_manual_traps
  only), (2) the ruin first-search roll: 30% per ruin, first search only;
  at wild ruins (≥3 wild tiles in the 5×5) the roll draws from the 4-book
  field shelf (trappers_handbook, system_manual_traps, fishers_ledger,
  basket_weavers_primer), uniformly 1/4. readBook grants recipes at L3
  via grantKnowledge (the engine's own book path); books are pushed with
  `bookId`, not `itemId` (the pitstaff probe bug — it read 0/8 through
  that bug).

## The probe fix (named next #2, first half)

scripts/probe-traphandbook.js — the honest instrument. The pitstaff probe
counted `itemId === 'trappers_handbook'`; books are pushed with `bookId`.
This probe tours every world-map ruin (honest hop-by-hop walkTo), forages
to search it, and counts the say line `You find a book: "Trapper
Handbook".` plus `bookId` inventory items — then reads anything found and
checks the grantKnowledge path.

Honest base rate (8 probe seeds 105101–105108, current base, no lever):
8/8 ruins reached and searched, 3 book finds (37.5% — the 30% design),
**0 handbooks**. Only ~1 ruin per map on these seeds. The book route is a
lottery ticket, not a channel: per wild-ruin first search, the handbook is
0.30 × 0.50 × 0.25 = **3.75%**; per non-wild ruin, 0.30 × 1/34 ≈ 0.9%.

## The arm (named next #2, second half): "the field-shelf weight"

The smallest honest tuning, data over code:

1. `src/data/books.json`: `"fieldWeight": 3` on trappers_handbook (one-line
   splice; a trapper's camp holds the trapper's book more often than not).
2. `src/js/game.js`: `pickFieldBook(pool)` — weighted field-shelf pick
   honoring `fieldWeight` (default 1), consuming ONE Math.random() like the
   uniform line it replaces; `trapHandbookOn()` gate (TRAPHANDBOOK=0 keeps
   the old uniform line verbatim — byte-identical control substrate).
   Armed: handbook = 3/6 = 50% of field-shelf draws (2× the base 25%) →
   ~7.5% per wild-ruin first search.

All grants still flow through grantKnowledge (readBook → recipe L3, the
engine's own book path — the pitknowledge-b L1 grants are the OTHER
channel; the book has always granted L3, unchanged). Game.craft's L0
refusal is untouched. PITKNOWLEDGE=1 stays the landed default-ON channel
(both sweep sides run it ON) — this arm is additive to it.

## The beat (named next #3)

The scholar-background L3 pit_trap grant (newGame, occ.knowsPit) was a
silent ledger entry. One say line at the grant site makes it a learning
moment:

"🪤 Your old life comes back to your hands: the pit you dug before the
Scattering — deep enough for a boar, staked at the bottom, brushed over
with leaves and marked well. You never forgot the shape of it."

Fires exactly once per run for pit-background scholars (hunting_guide,
trail_crew, rancher), never otherwise, never when PITKNOWLEDGE=0.
[needs-eyes] on the beat commit — Steve's feel check on the line.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- QUESTION: does weighting the Trapper Handbook on the ruin field shelf
  deliver pit_trap knowledge faster on the competent substrate, through
  the game's own book channel?
- PRIMARY (binding): pit_trap recipe knowledge acquired (scholar codex
  level ≥ 1 at any point in the run, any via) on ≥ 4/16 armed runs (same
  bar as pitknowledge-b). Control expectation: ~6/16 (the PITKNOWLEDGE
  channel is ON for both sides — the primary does NOT discriminate the
  lever; it guards that the substrate still learns).
- ENGAGEMENT (binding, the lever's real test): handbook surfacing counts
  + knowledge-via-book events ≥ 8 across the armed side (16 runs).
  Surfacing = the `You find a book: "Trapper Handbook".` say line;
  knowledge-via-book = pit_trap acquired with via='read'.
- GUARDRAILS: median survival ≥ control−10d on the paired reading; no new
  death mode attributable to the arm; starvation deaths armed ≤ control+2
  paired; det-gate byte-identical gate-off on feature-quiet seeds.
- HORIZON: 180d death-aware (dead villages stop). SUBSTRATE:
  FEASTSCALE_R13=1; SEATDRIVE=0 EXPLICIT (pre-seat); PITKNOWLEDGE unset
  (ON); HUNTSTAFF unset; PITSTAFF absent (layer killed).
- SEEDS: 6901–6908 (freshness verified against evidence/ + scripts/ before
  any sims — 6601–6609 consumed by pitknowledge-b, 105101–105104 by the
  pitstaff probe, 67xx by earlier arms; the evidence/ hits on 69xx are
  incidental JSON values, never sim seeds) × {leadtraphandbook,
  belongtraphandbook} × {control: TRAPHANDBOOK=0, armed: unset} = 32 runs,
  identical seeds both sides, own in-sweep paired control. Env asserted up
  front; SWEEP STOPS on mismatch.
- Policies: scripts/policies/traphandbook.js wraps leadfeast/belongfeast
  with a book-reading layer (reads up to 2 found books/day via the real
  readBook verb; tours seen unsearched ruins every 12th day when healthy —
  seenTiles 'v' only, honest walkTo, no map-knowledge cheat, no kcal
  top-up). IDENTICAL on both sides — the game-code tuning is the only
  delta. Registry: additive entries in scripts/sweep-compare.js only
  (leadtraphandbook/belongtraphandbook), never reordered.
- Balanced panel compare (scripts/balance-panel.js) per §15 — the panel is
  the instrument, the pre-registered threshold is the judge.
- A miss is NO-GO, never re-scored mid-run. Metric doubts go under
  "metric review".

## Proof: scripts/test-traphandbook-b.js — ALL GREEN

- PART A fixture (real Game via sim-harness, 18/18):
  GATE: trapHandbookOn() default true, TRAPHANDBOOK=0 → false.
  DIST: pickFieldBook seeded 4000 draws — handbook weight 3 → ~50%
  handbook; all weights 1 → uniform ~25% each (the old line's
  distribution, one RNG call like the old line).
  READ: readBook('trappers_handbook') → pit_trap L3 via grantKnowledge
  (via 'read', learnedFrom 'Trapper Handbook' — the engine path, not a
  direct write); the book is consumed; the read narrates.
  CRAFT (RED): Game.craft('pit_trap') at L0 → null + honest refusal
  ("don't know how to make") — the gate the arm must never bypass, intact.
  BEAT (GREEN): newGame with a knowsPit scholar (seed 105101, roster
  scan) → the beat fires exactly once; non-pit scholar → absent, pit_trap
  stays L0.
- PART B2 beatgate (PITKNOWLEDGE=0): knowsPit scholar → no beat,
  pit_trap L0. The beat is gated with the grant.
- `node scripts/check.js --quick`: 96 passed, 1 failed — the failure is
  scripts/test-sprites-valid-20261014.js (sunback/sweeps_week/cliffhanger
  calm+aggro sprites). PROVEN PRE-EXISTING and unrelated (loads only
  sprites.js + godhood.js + data JSONs — never game.js, books.json, or
  the policy files).

## Det-gate result

TRAPHANDBOOK=0 vs unset, seeds 6901/6902 × {leadtraphandbook,
belongtraphandbook} × 40d, per-day trajectory hashes (day, kcal, hp,
pantryKcal, pit_trap flag) — **4/4 byte-identical**, bookFinds=0 on all
8 runs (feature-quiet, so the gate is the only possible delta and it is
none). The gate-off path is the old uniform line verbatim. (Logs:
detgate-on.log / detgate-off.log — ephemeral; the proof script
reproduces them via `node scripts/test-traphandbook-b.js detgate` ±
TRAPHANDBOOK=0.)

## Sweep result — 32 runs

Seeds 6901–6908 × {leadtraphandbook, belongtraphandbook} × {control TRAPHANDBOOK=0, armed unset}, 180d death-aware, identical seeds both sides.

| metric | control | armed | bar | verdict |
|---|---|---|---|---|
| pit_trap acquired ≥L1 | 8/16 | 8/16 | ≥4/16 armed | GO (guards substrate learning; does not discriminate the lever) |
| engagement: handbook surfacing + via-book events (armed) | — | 2 (readVia=0) | ≥8 | **MISS → NO-GO** |
| median survival | 133d | 133d | ≥ control−10d | GO |
| starvation deaths | 7 | 7 | ≤ control+2 | GO |
| new death mode | — | none | none | GO |

**The book channel never fired.** books=0, hb=0, hbReads=0 on all 32 runs, both sides. The policy's ruin-touring found no searchable ruins with books in 180d on this substrate — the weighting had nothing to weight. The lever is untestable here, and where it is testable (the 2 surfacing events) it shows no delta.

**VERDICT: NO-GO at pilot. The Trapper Handbook field-shelf weighting is KILLED.** Per §14 the miss is not re-scored. Deleted zero-trace: game.js pickFieldBook/trapHandbookOn + weighted branch (uniform line restored), books.json fieldWeight, sweep-compare.js registry entries, scripts/policies/traphandbook.js. The proof test was repaired (GATE/DIST det-gate/smoke → INFO-SKIP; beat/read/craft fixtures kept, 13/13 + beatgate 2/2 green).

## Panel compare (§15)

Not run — there is no "after"; the lever was killed at its pre-registered pilot gate. Documented, not skipped silently.

## Village assessment (plain words)

Identical villages on both sides (the lever made zero difference): 133d median survival, 7 starvation deaths each, 0 wins, national 8/16, table 15/16. The substrate learns pit_trap on its own (8/16 both sides, via the landed PITKNOWLEDGE channel) — the book channel contributed nothing.

## Sense-test (SENSE-TESTING LAW)

The surviving day-0 beat was read through newGame on seed 105101: "🪤 Your old life comes back to your hands: the pit you dug before the Scattering — deep enough for a boar, staked at the bottom, brushed over with leaves and marked well. You never forgot the shape of it." It fires exactly once for pit-background scholars, never otherwise. It lands — a learning moment, not a ledger entry.

## Metric review (mandatory)

The engagement bar (≥8 surfacing/via-book events) was the lever's real test and it missed decisively (2, readVia=0). The primary (≥4/16 acquired) passed on both sides but was pre-registered as a substrate guard, not a discriminator — correctly not re-scored as a win. Metric doubts for the NEXT run: the book-find rate on the competent substrate is ~0/32 runs — any future book-channel lever must first prove the channel fires (a find-rate instrument), or it will die the same way. The traphandbook family is now 0-for-1 at the gate; pitknowledge-b's NPC trapper line remains the live pit economy.

## Named next

None from this arm — the lever is dead. The open question it leaves: why ruin book finds are ~0 on the competent substrate (find-rate instrument), if anyone wants the book channel at all.

## Wall numbers (report-only)

national 8/16, table 15/16, wins 0/16, wave-4 0/16, wave-5 0/16 (pre-seat substrate, unchanged by the arm — the lever was substrate-invisible).