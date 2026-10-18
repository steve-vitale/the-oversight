# sim-tabledeed — diagnostic attribution: does the endgame deed gate gate the table invitation? (2026-10-18)

Axis: scale-onramp (the blocking axis). Lever-10 lens (the table→win chain).
Sibling instrument: sim-readconfirm (2026-10-18).

## Out-of-arm finding under test

sim-readconfirm "Out-of-arm findings" #1: `tableWaiting` fires at wave 3
(14/16 on both arms) with maxWave=3 and zero wave-4/5 deeds — but
docs/MONSTER-WAVES.md says the endgame deed gate needs 5/5/4/3/2 distinct
monsters fought per wave 1–5. Question: is the invitation's deed gate
actually gating, does the invitation precede the gate BY DESIGN, or is
the gate broken?

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §14 — written BEFORE any sweep)

- PRIMARY QUESTION: full attribution of every `tableWaiting` set across
  16 runs. **GO: 100% attribution** — every set traced to a predicate
  evaluation site with a deed-state snapshot (tableSeat(), deedGateReady()
  bars) at set time.
- VERDICT CANDIDATES (mutually exclusive, chosen by the attribution):
  - **GATING**: the gate fires and the numbers match the doc —
    every invitation set occurs with `deedGateReady().ok === true`
    and per-wave bars ≥ 5/5/4/3/2.
  - **PRECEDING-BY-DESIGN**: the invitation is supposed to fire early —
    canon must name where (file:line establishing it).
  - **BROKEN**: the gate never fires, or fires misreading the doc bars.
- Horizon: 180d death-aware (+10d tail max) — same horizon as the
  sim-readconfirm instrument that measured the finding.
- Seeds: 54001–54008 (FRESH — verified unused as sim seeds: filename
  scan of evidence/**/perseed* shows zero hits; content greps for
  `54001`–`54008` return only float artifacts, e.g. preservedKcal
  54006). Policies: tribfloor-wrapped leadfeast / belongfeast, same as
  sim-readconfirm.
- Substrate (exact sim-readconfirm instrument): FEASTSCALE_R13=1,
  TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1, WINPURSUIT=1, WINDEFER=1,
  SEATDRIVE=0, NODEWITNESS=1; `loadGame({seed, mode:'tabledeed',
  fullTelemetry:false})`, `setupGame`, `runDays({days:180,
  manifest:undefined, sampleEvery:30})`.
- Policies: none added by this diagnostic — INSTRUMENT-ONLY
  (zero src/js changes, zero scripts/policies changes).
- Det-gate: byte-identical re-runs, instrument-on vs instrument-off
  (2 fixed seeds, leadfeast): the `tableWaiting` accessor must perturb
  nothing — comparison excludes the attribution log itself.
- Secondary (report, don't judge): wall numbers
  (national / table / wins / median survival), sense-test of ≥3
  invitation beats (SENSE-TESTING LAW).
- A miss of the GO (any set unattributed) is NO-GO, never re-scored (§14).

## Instrument

- `scripts/test-tabledeed-20261018.js` — proof: classifier/predicate
  fixtures against the REAL `Game.tableSeat()` / `Game.deedGateReady()`
  (full/lesser/none matrix), SMOKE (accessor capture on a live run),
  DET (instrument-on vs instrument-off byte-identical).
- `scripts/tabledeed-sweep-20261018.js` — 16-run sweep (8 seeds × 2
  policies). After setupGame, installs a `Object.defineProperty`
  accessor on `state.scholar.prog.tableWaiting` (the object every
  setter writes through — `progState()` returns it). Every set logs
  {day, value, callsite (from stack), tableSeat(), deedGateReady()
  full breakdown, arc, scaleRank}. No RNG, no writes — the det-gate
  pins this empirically. Per-seed JSONs written ONCE to
  `evidence/2026-10-18/perseed-tabledeed/<policy>/`; no timestamps,
  byte-comparable.
- `scripts/analyze-tabledeed-20261018.js` — attribution table +
  verdict + det-gate compare.

## Results

SWEEP COMPLETE (2026-10-18). 16/16 runs, 0 errors. Instrument:
`scripts/tabledeed-sweep-20261018.js` (exact sim-readconfirm substrate;
seeds 54001–54008 × {leadfeast, belongfeast}; per-seed JSONs in
`evidence/2026-10-18/perseed-tabledeed/tabledeed/<policy>/`).

ATTRIBUTION (the pre-registered primary): **15 sets across 16 runs;
100% attributed, 0 unattributed → GO met.**

Every true-set (invitation extended) traces to exactly one site:

- **15/15 — `Object.arcBeat` at `src/js/progression.js:754`** — the
  `arcBeat(4)` body: `this.progState().tableWaiting = true;`

Predicate state at set time (read by the instrument itself — no game code):

- `tableSeat()` = **'lesser' in 15/15**; 'full' in 0/15; 'none' in 0/15.
- `deedGateReady().ok` = **false in 15/15**. Per-wave bars at set time:
  e.g. 19/9/3/1/0, 16/8/3/5/0, 11/4/3/0/0, 20/10/3/0/0 (w1/w2/w3/w4/w5) —
  wave-4 deeds reached 5 distinct in one run, wave-5 deeds 0 in all 16.
- False-sets (withdrawals/clears): 0 — the tableScene withdrawal path
  and the checkArc re-fire (`progression.js:676`) never triggered in
  these 16 runs.
- The 16th run (belongfeast s54005) died at d50, wave 2, arc 3, seat
  'none' — no invitation, nothing to attribute.

The predicate chain, named end to end:

1. **The deed gate** — `Game.deedGateReady()` (`src/js/progression.js:588`):
   needs 5/5/4/3/2 DISTINCT monsters fought per wave 1–5 (fed by real
   startCombat/recordWaveKill/fieldFight), plus 3+ contests, 3+ crises,
   stage ≥ 2, food-thesis deeds. Proof-classifier fixtures confirm the
   bars are exactly the doc's numbers
   (`scripts/test-tabledeed-20261018.js`, 17/17 GREEN). A wave-3-only
   run — even 15/15/9 counts — returns `ok:false` with `w4=w5=0`.
2. **The seat** — `Game.tableSeat()` (`src/js/table.js:76`): `full`
   iff `deedGateReady().ok`; else `lesser` iff w1≥4, w2≥4, w3≥3,
   contests≥2, crises≥2, scale≥regional, stage≥2, foodDeeds; else `none`.
3. **The invitation gate** — `checkArc()` (`progression.js:669-671`):
   `if (want >= 3 && (seatNow === 'full' || seatNow === 'lesser')) want = 4;`
   → `arcBeat(4)` sets `tableWaiting = true` (progression.js:754).
4. Canon establishing the design: `docs/TABLE.md` — "The 2026-10-10 deed
   gate (`deedGateReady()`) becomes the **full seat**"; the lesser seat
   (4/4/3 w1–w3, 2+ contests, 2+ crises, regional+, stage≥2, food deeds)
   is the "reachable bar" for "competent non-god play"; "Below the
   lesser bar the table does not come". And the code comment at
   progression.js:652–668 (ARC IV SEAT GATE, win-path lever 2026-10-11):
   before the change the lesser seat was dead code in the invitation
   path — `tableWaiting` was only ever set on the full gate, "so the
   designed 'reachable bar' never fired (0/32 baseline runs reached any
   seat; the table never came)".

**The deed gate IS gating — the FULL seat — and the invitation precedes
it by design on the LESSER seat.** MONSTER-WAVES.md's 5/5/4/3/2 line
describes `deedGateReady()` (the full seat's wave bars), not the
invitation. The invitation fires when `tableSeat()` clears 'lesser' —
by explicit 2026-10-11 design. The finding's premise ("tableWaiting
fires with maxWave=3 and zero wave-4/5 deeds") is the designed
behavior: the lesser seat only needs waves 1–3.

Two runs show the upgrade path working as designed: leadfeast s54002
(5 distinct wave-4 monsters fought — w4 bar met) and belongfeast s54001
(1 wave-4 deed) — both still got the LESSER invitation (w5 bar = 0
everywhere; `deedGateReady` never fired). Wave-5 is unreachable on this
substrate (0/16), so the full seat never opens here — that is the scale
wall, not a gate bug (see Out-of-arm findings).

Det-gate: instrument-on vs instrument-off, 2 fixed seeds (54001, 54002,
leadfeast) — BYTE-IDENTICAL on all gameplay fields (2/2 PASS).
The proof script (classifier fixtures + SMOKE + DET) is 17/17 GREEN.

Wall numbers (secondary): national 8/16, table 15/16, wins 0/16, mean
survival 139.7d, maxWave {w4:9, w3:6, w2:1}. Matches sim-readconfirm's
profile (14/16 table there) — the wall holds; nothing here moves it.

## Sense-testing

Three invitation beats with narration:true (transcripts at
`~/workspace/tabledeed-sense-<seed>-<policy>.txt`, working material,
not committed):

1. **leadfeast s54001, invitation d50 (pre-90):** `◈ ARC IV — THE
   INEFFICIENCY. ... You stood up to the calibration fauna, the
   audience's notes, the Final Draft — lived through their Show,
   weathered the worst together, and built something bigger than a
   village. ... and yours, though unfinished, are undeniable.` The
   table is NOT named — NO SPOILERS holds (tableAnnounced withheld
   until day 90). The beat names exactly the waves faced (w1–w3) and
   says "though unfinished". The fiction knows the gate state.
2. **belongfeast s54007, invitation d50 (pre-90):** same lesser-seat
   Arc IV beat; the readiness HOLD beat fired the same day ("The next
   act is not for strangers... blood your fighters (0 of 1 veterans)")
   — the hold and the invitation coexist honestly: the door is open,
   the village hasn't walked through.
3. **leadfeast s54002, invitation d93 (post-90):** "The table is being
   set — a lesser seat, priced for what you built. They are watching
   to see who comes to it." Then the same Arc IV beat. This run had
   5 distinct wave-4 monsters fought by invitation day — yet the beat
   names only the Final Draft. The beat is SEAT-honest (lesser), not
   deed-exhaustive — matches the code's seat-honesty contract
   (progression.js:755–758 comment: claiming the Mirror Draft and the
   Producers on a lesser run "would be a lie the audit would catch").

Judgment: meaningful, coherent, relevant across all three. The fiction
never claims deeds it doesn't have and never names the table before
the seat can be taken. No sense-testing failure.

## Balanced panel (§15)

N/A — diagnostic arm; no lever, no before/after. Panel not required
for instrument-only attribution work (no game-code change to measure).

## Metric review

- Pre-registered GO (100% attribution of every tableWaiting set):
  measured 15/15 sets attributed, 0 unattributed → GO, no re-scoring.
- The verdict taxonomy (GATING / PRECEDING-BY-DESIGN / BROKEN) held —
  the attribution fell cleanly on PRECEDING-BY-DESIGN. No metric
  revision proposed: for a diagnostic arm the attribution-complete
  bar is the right instrument.
- Secondary note for future lever runs: the "table" metric in wall
  numbers conflates invitation (tableWaiting) with sitting — here all
  15 are invitations on the lesser seat, none sat. Wall reports should
  keep distinguishing `table` (invited) from wins.

## Out-of-arm findings

1. **The FULL seat is unreachable on this substrate** — wave-5
   unlocked 0/16, so `deedGateReady()` never fires and the full seat
   (indispensable path, full terms) never opens. The scale-onramp wall
   is now precisely: national→lesser-invitation opens 15/16, but the
   win chain needs the full seat or a lesser-seat path win — 0/16.
   This is the next lever-10 question, not this diagnostic's.
2. **Pre-day-90 invitations set tableWaiting with tableAnnounced
   withheld** (9/15 sets fired before d90). By design (NO SPOILERS,
   Steve 2026-10-14) — the invitation is armed, the table is never
   named. Documented, not a bug.
3. **The Arc IV beat is seat-honest, not deed-exhaustive** — a run with
   5 distinct wave-4 monsters fought (leadfeast s54002) still hears
   only the waves 1–3 fiction, because the seat is lesser. Matches the
   code contract; filed as an observation for the content lever, not
   a defect.

## Verdict

**PRECEDING-BY-DESIGN.** The invitation fires on the lesser seat
(tableSeat() ≥ 'lesser') by explicit 2026-10-11 design (docs/TABLE.md;
src/js/progression.js:652–668). The 5/5/4/3/2 deed gate
(`deedGateReady()`, src/js/progression.js:588) gates the FULL seat —
the richer terms (indispensable needs full; the audit names the seat).
It is not broken: classifier fixtures prove the bars read exactly the
doc's numbers (17/17 GREEN), and it simply never fired here because
wave-5 is unreachable on this substrate.
