# journey-scale r36 — PRE-REGISTRATION (lane A, leg 3 SCALE, days 80–140 + post-national tail)

**Run id:** oversight-playtest-loop-20261025T2315Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. **Base:** master at run start (43a0786f8 at
pre-flight; rebased if a sibling lands mid-run, proof re-run after any
rebase). **Arm:** r35 blank (a) — BOOK THE TWO UNBOOKED TRUST MOVES, no
number changes (Steve's discipline: book the move, change no numbers):
1. `src/js/titans.js` titanEscalate night-strike: after the `trust −5`
   assignment, one `Game._linkNote(link, 'titan', …)` (guarded, same
   pattern as the existing titan-turn note at titans.js:868).
2. `src/js/hierarchy.js` covenantTick league-pool shortfall: inside the
   `paid < havenShare` branch, one `this._linkNote(ls[i], 'pool', …)`
   per link charged `−4`, naming the shortfall amounts.
**Driver:** `scripts/journey-scale-r36-20261025.js` — the r35 driver with
ONLY the run label / EVIDIR / mode string changed (same policy
scalecourt-nogate, same DAYCAP 180, same picker cap, same setter
instrument). **Analyzer:** `scripts/analyze-scale-r36-20261025.js` (r35
analyzer + BOOK join section). **Proof test:**
`scripts/test-journey-scale-r36-bookmoves.js` (must pass on r36; the
static-wiring assertions fail on the unpatched files).
**Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED. Standing
scalecourt.js untouched.

## Leg question (r35's named next arm, verbatim)

r35 proved every trust move routes through a logged setter and named all
112 drops ≤ −4, but two move classes are voiced in the moment and never
booked: titan night-strikes (−5) and league-pool shortfall charges (−4).
A player scrolling back cannot find them. r36's question: **does booking
one link-history note per move close the scrollback blank — i.e. does
every titan −5 and every pool-short −4 in a matched 4-seed run carry a
book entry a player can find later — with zero change to trust numbers,
pantry, or outcomes?**

## Pre-registered metrics (BINDING — §14; a miss is NO-GO, never re-scored)

- **BOOK-TITAN:** every trustSetLog event with site `titanEscalate` and
  delta −5 has a matching trustEvents entry: same link, noteKind
  `titan`, note naming the strike, snapDay in [eventDay, eventDay+1]
  (night-lag allowance per r35's phase lesson). Bar: 100% booked; any
  unbooked titan −5 is a NO-GO on the arm.
- **BOOK-POOL:** every trustSetLog event with site `covenantTick` and
  delta −4 has a matching trustEvents entry: same link, noteKind
  `pool`, note containing `came up short`, snapDay in [eventDay,
  eventDay+1]. Bar: 100% booked; any unbooked pool-short −4 is a NO-GO.
  (If a covenantTick −4 of a DIFFERENT cause appears, it is listed
  separately as an unbooked-cause finding, not silently counted as
  pool-short — the note-text match is what qualifies it.)
- **NO-NUMBER-CHANGE (outcome parity):** per-seed outcome lines
  (final day, alive/total, rank, national/global day, covenant
  trust finals) match r35's control lines within the known instrument
  tolerance — the fix adds notes only, so outcomes must not move. Any
  moved outcome is a NO-GO requiring investigation before landing.
  (Base moved since r35, so a moved line is first checked against
  sibling landings, not assumed to be the arm's fault.)
- **PICK-G (picker-cap guard, inherited):** max consecutive
  dlg:more/goon ≤ 1 on every transcript; post-deflect goon = 0. Any
  violation is a regression, not a metric to re-tune.
- **BETRAY (inherited):** transcripts are NOT driver-dropped on
  betrayal choices; if a betrayal want is encountered it is engaged
  (betrayal:accept) and judged for meaning. If none is encountered,
  BETRAY is reported NOT-ENCOUNTERED.
- **BONDS/NATIONAL (report-only, as r32–r35):** third bond by d110,
  national by d140, lesser/full seat, wave reached, post-national days.

## What would count as an interesting finding

- A titan −5 or pool-short −4 with NO book entry after the fix (the arm
  failed somewhere — e.g. a second unpatched call site writing the same
  move) — that widens the blank instead of closing it.
- A covenantTick −4 that is NOT a pool shortfall (a third unbooked
  cause hiding under the same site+delta signature).
- Any outcome line that moves vs r35 without a sibling-landing
  explanation (the "notes only" claim breaking).
- A betrayal transcript whose accept still lands in a generic close
  (r35 blank (b), carried — measured, not fixed, this run).

## Seeds, horizon, pilot gate

- **Seeds:** MATCHED to r30–r35: 85001–85004. Same world-gen, new base.
- **Horizon:** DAYCAP=180 loop-days, death-aware stop.
- **PILOT GATE:** seed 85001 runs first; if it crashes or pilgrimages
  == 0, STOP and report — do not launch the other three.

## Metric review (to be filled after the run — never mid-run)

- No metric re-scored mid-run. Revisions proposed here apply to r37.
