# sim-fullseat-a — PRE-REGISTRATION (binding, written BEFORE any judged leg)

Run: fleshout-20261029T1715Z. Arm: sim-fullseat-a (backlog #920).
Worktree: `~/workspace/worktrees/sim-fullseat-a` (branch sim-fullseat-a).
Base commit: 84eba8a86 (master at registration; note any move in the
evidence file). Axis: scale-onramp (standing directive — still stands:
no run has yet taken a full seat).

## Canon read first

- docs/CANON.md, docs/TABLE.md, docs/PROGRESSION.md, docs/MONSTER-WAVES.md.
- Full seat (code authority, src/js/progression.js `deedGateReady()` +
  src/js/table.js `tableSeat()`): national/global scale, wave bars
  5/5/4/3/2 distinct fought, 3+ contests survived, 3+ crises, stage ≥ 2,
  food-thesis deeds (sentimentTaught + feastSurgeUsed). Lesser seat:
  waves 4/4/3, 2+ contests, 2+ crises, regional+ scale, stage ≥ 2,
  food deeds.
- #1223 discrepancy (MEASURE ONLY — Steve call required before any
  move; this arm changes NO bar): docs/PROGRESSION.md:20 and
  docs/MONSTER-WAVES.md:354 still say the deed gate needs stage ≥ 3,
  and in-code comments repeat it (progression.js header, deedState and
  checkArc comments). docs/TABLE.md was corrected to stage ≥ 2 on
  2026-10-28 (sim-fullseat-stage-a, fixture proof: stage 2 + full legs
  prices as FULL through the real gates). This arm judges against the
  REAL gate functions, so its numbers are true under the code's ≥ 2
  bar; if Steve later rules ≥ 3, every full-seat count here must be
  re-read with stage as an additional blocker. No doc or code edit to
  the bar is in scope.
- #1272 context: seed 74902 reached national rank with wave 5 open and
  never got a table offer — the full seat's w5 deed bar + food deeds
  gate the offer after the unlock. This arm's attribution separates
  "wave unlocked" from "wave deeds filled" from "offer priced" for
  exactly that reason.

## Prior work this arm builds on (read before sweeping)

- 1955Z tableseat round (evidence/2026-10-24/sim-tableseat-round-1955.md):
  substrate = leanlinkrescue courtship + seat legs (no wait leg);
  6 lesser seats taken, 0 full; wins 6/16 armed, wave 5 0/32.
- 2115Z diag arm (evidence/2026-10-24/sim-fullseat-diag-a.md): pure-read
  gate attribution on the substrate, seeds 73641–73648: full 0/8;
  binding w5 8/8 (wave 5 never unlocked, standing max 172, four seeds
  pinned at 99), w4 6/8, foodDeeds 6/8 (always the surge half);
  winners truncate the full-seat window (lesser wins end runs before
  wave bars fill).
- This arm is NOT a re-run of the diag arm: the ON arm PURSUES
  (declines ready lesser seats to keep the window open + patrol /
  channel / feast / integration verbs). The diag arm recorded; this
  arm tries to move the gates.

## Arms (identical seeds, same instrument, horizon 180d death-aware)

- OFF (control): `scripts/policies/tableseat-nowait.js`
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) wrapped with
  `scripts/policies/fullseat-diag.js` (FULLSEAT=1, pure-read recorder).
  This is the substrate itself — it also serves as the substrate
  reproduction check on current master (see below).
- ON (pursuit): `scripts/policies/fullseat-pursuit.js`
  (LEANLINKRESCUE=1, FULLSEATPURSUIT=1) wrapped with fullseat-diag
  (FULLSEAT=1). Courtship shared exactly with OFF (leanlinkrescue.daily
  directly); seat legs take ONLY a full seat (ready lesser previews
  counted and skipped); pursuit verbs = upkeep patrol (winseek
  huntPatrol pattern), sentiment channeling, weekly feast road,
  integration road. NO fight hook on either arm — competent.fight runs
  identically both sides; the patrol changes how often fights happen,
  never how they are fought. Contests are harness-driven (choice 0 =
  participate) identically both sides.
- Seeds (pilot): 76001–76008. Freshness verified at run start: no
  76001–76008 filenames anywhere under evidence/, no hits in
  scripts/, no hits in evidence/2026-10-28 or 2026-10-29 *.md.
  (73701–73708, 73801–73808, 73901–73908, 74001–74008, 74101–74108,
  75001–75008 bands all rejected as already used.)
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).

## PRIMARY METRIC + GO THRESHOLD (judged as written, never re-scored)

- Full OFFER (ON arm): any day on which `tablePreview()` returns a
  preview with `seat === 'full'` (ready or not — the seat is priced
  full; readiness is reported separately as fullReady). Full ENTERED:
  `tableTakeSeat()` ok on a full preview.
- GO iff (ON full offers ≥ 2/8) OR (ON full entered ≥ 1/8), AND all
  three guards below pass. A miss is NO-GO, never re-scored against
  a friendlier metric mid-run. Metric doubts go under "metric
  review" for the next run.

## GUARDS (all three must pass WITH the primary, or NO-GO)

1. Starvation deaths ON total ≤ OFF total + 2.
2. Arm-only starvation (ON starvation deaths on seeds where the
   paired OFF row had none) ≤ 2.
3. Median days ON ≥ 0.8 × median days OFF (relative guard — the old
   absolute 120d bar is unpassable on win-ending bands; wins and
   declines both move medians, so the guard is a floor, not a target).
   Starvation matcher: death cause matching /starv|hunger/i.

## SUBSTRATE REPRODUCTION (reported, not the GO bar)

On current master the substrate is reproduced iff OFF takes ≥ 1
lesser seat AND reaches national ever on ≥ 4/8 seeds (1955Z band:
national 5/8, entered 3/8; diag band: national 7/8, entered 2/8).
If OFF fails this, base drift is stated plainly in the evidence and
the full-seat judgment is flagged as measured on a drifted substrate.

## SECONDARY (reported, not judged)

Per-seed full-seat gate attribution (end snapshot AND max-reach, via
the diag recorder + end-of-run `snapFullSeat` pure read): which check
fails on each seed that reaches national but gets no full offer;
wave unlock (unlockedWave, standing vs t4/t5) vs wave deeds filled;
food-deed split (sentiment day vs surge day); seat kinds taken;
lesser previews skipped (ON) and overtime tier accrued while
unseated; patrols / channels / feasts actually fired (did the
pursuit verbs even run?); wall numbers (national/table/wins, full
vs lesser entered, wave 4–5, median survival).

## PROOF GATES (failures exit 1 in sweep mode)

- G1 pursuit det-gate: FULLSEATPURSUIT unset, pursuit policy ==
  tableseat-nowait on seed 76001: days/gameDays identical, ts
  counters identical, no fs counters on ctx.
- G2 diag neutrality (re-proof on current master): tableseat-nowait
  vs tableseat-nowait+fullseat-diag (FULLSEAT set) on seed 76001:
  days/gameDays/ts counters/starvation identical (the recorder fires
  daily; any divergence anywhere is a leak).
- G3 corpus integrity: 16/16 rows, days > 0, endSnap with dist on
  every row, diag block on every row.
- G4 determinism: re-run one ON seed; row byte-identical modulo
  corpusFile/corpusSha fields.
- G5 (sweep-internal) pre-national read-only: for every pilot seed
  where NEITHER arm reached national ever, days/gameDays identical
  (the seat legs fire only at national+; the pursuit verbs are the
  known, declared exception — patrol/channel/feast/integration CAN
  diverge pre-national trajectories by design, so G5 is reported as
  diagnostic here, NOT a gate failure: any pre-national divergence
  must be attributable to a counted pursuit verb).

## LANDING RULE

- GO → pursuit policy lands as its own commit, default-OFF only, NO
  default flips (GO CANDIDATE as an instrument, not competent play).
- NO-GO → DELETE the pursuit policy file, land only instruments +
  evidence (seat logic stays reproducible via the sweep instrument,
  tableseat precedent). No src/js in either case — policy /
  instrumentation only.
- Balanced panel (§15): attempt `scripts/balance-panel.js` compare on
  the corpus; attach the compare .md if the panel ingests it, else
  record exactly why not + sweep-compare tables (1955Z/2115Z
  precedent: the panel throws on per-seed rows).

## SENSE-TESTING LAW

One NON-MEASURED narration-on replay read of an ON seed that reaches
national but gets no full offer (or a full-offer seed if any):
does the offer — or its absence, or the deliberate lesser-skip —
read coherently, or does the village sit at national with no
explanation? Judge meaning/coherence/consequences, never numbers.

## CONVERGENCE REPORTING

Report convergence state every run: converging | converged | parked
| killed-at-pilot. Pilot NO-GO stops the run — no confirm seeds.
