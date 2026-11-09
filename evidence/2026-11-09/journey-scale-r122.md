# Journey Scale r122 — run note (Lane A, leg 3)

Prereg: `evidence/2026-11-09/journey-scale-r122-prereg.md` (binding). Base
`8419eefa4` (zero `src/js` change since r113's base). Seeds: matched panel
97901–97904 (the r112/r113 band — NOT fresh). Pilot 97904 + confirm 97901,
DAYCAP=60 each (the full 180-day 4-seed band is out of this run's budget;
the fix's claim is the mechanism, not the ladder outcome). Policy: the
r113 trade-road stack with ONLY the `walkTo` fix applied.

## Verdicts (prereg bars)

- **Q1 PILGRIMAGE WALK: GO.** 97904 pilot (DAY CAP 60): **3 studies**
  (d29 village_0, d45 village_2, d57 village_spl_28_19000) — the first
  studies on this seed ever (r113: 0 in 158 days; before-leg repro: 0 in
  45 days). **Zero trips stalled ≥5 consecutive no-move days** (every
  walk moved; every trip completed in 2 days: walk day + study day).
  Confirm 97901: **3 studies** (d27/d30/d33), zero stalls — no
  regression (guardrail: ≥1 study, met 3×). The pilgrimage walk is fixed.
- **Q2 PEOPLE CHECK: NOT clean — carried defects persist, unchanged.**
  2 raise talks read in full (no d90/d120 transcripts exist at a d60
  horizon). Accept echo 2/2, brush-off close 2/2, unvoiced raise 1/2,
  unanswered invitation 1/2 — the same three r111–r113 defects, same
  counts per talk. The fix touches no conversation code; the defects
  are carried, not re-litigated, and still owed.
- **Q3 CENSUS: see below.**

## The fix (policy-side only, zero src/js)

`scripts/policies/scalecourt-traderoad-r113.js` — `walkTo` rewritten
(+78/−17), mirroring the engine's own `walkHome` pattern. Root cause,
pinned before the fix by a before-leg repro on current master (stock
r113 driver, 97904, DAYCAP=45, preserved in
`evidence/2026-11-09/journey-scale-r122-before/` with the day-stamped
diagnostic log):

1. The old walkTo tried exactly ONE d≤3 jump per day and abandoned the
   walk on the first refusal. The jump (4,4)→(2,5) is refused by
   `travelTo`'s intermediate-blockage scan: **intermediate (2,4) is a
   creek needing a bridge** (the return names it: `{x:2, y:4}`).
   (2,5) itself is passable. The tied alternatives: (3,6) is itself a
   bridgeless creek; only (4,7) was open — never tried.
2. **The destination itself is unreachable:** village_0 (2,8) sits on a
   creek needing a bridge. Exact arrival was impossible on this seed
   without bridging/swimming — so the walk must stop at STUDY RANGE
   (dist ≤ 2), where the courtship studies, not at the village tile.
3. The new walkTo steps orthogonally (d=1, so the intermediate-fan scan
   never applies), tries the longer axis then the other, then sidesteps
   perpendicular (toward-target side first, never revisiting a tile),
   stops at a caller-given closeEnough (pilgrimage 2, return home 0),
   and stops honestly with the block named when every escape refuses.
   No resource spend: no bridge, no clearing — going around is the fix.
4. CORRECTION to r113's reading: r113's note said "capture empty
   d28–30". The day-stamped log proves the creek line WAS said on d28,
   d29, d30 (once per pilgrim day). The refusal was narrated honestly
   by the engine; the policy never acted on it.

The engine is correct here and untouched. The pilot's walks prove the
mechanism live: (4,4)→(2,6) in 4 steps on d28, study d29; (4,4)→(2,2),
study d45; (4,4)→(3,2), study d57. The scholar's codex grows on return
("You walk back into Haven. 3 Codex entries… 4… 5…"). Creek-refusal say
lines in the 97904 capture: 6 in 60 days (competent's foraging only —
the pilgrimage contributes zero now; r113's band had 123 in 158 days).

## Census (plain words)

- **97904 — alive to d61, 7 of 7 alive, pantry 11,313.** The strong
  seed, finally learning: three codex studies in 60 days where the
  village before learned nothing in 158. Naran died (the first-grave
  crisis). National stage d36, lesser seat priced d44. Trade still 0
  proposals by d60 — the opinion climb has only just started (the
  studies land d29/d45/d57; proposals need opinion 10 + courtship).
  The trade wall is NOT claimed moved — that needs the longer horizon.
- **97901 — alive to d61, 10 of 10 alive, pantry 18,061.** Three
  studies (d27/d30/d33), two peer proposals by d60. National stage
  unreached at d60 on this run's pace (r113's band reached it d37 —
  the d60 runs are a mechanism check, not a ladder re-proof).

## People check (Q2)

Read in full: raisetalk-97904-1 (Stella, d7, accepted) and
raisetalk-97901-1 (Kennedy, d24, accepted). Stella: mood line + trap-line
invitation, never voices the raise — yet the player answers a link
proposal nobody made and it is carried anyway; "Walk my trap line with
me?" never answered; accept echo + brush-off close ("Sure. I'll be
around.") verbatim. Kennedy: the raise IS voiced ("We should link with
them"), but the echo + brush-off close are identical. No NEW senseless
moments beyond the carried family. The gossip voice-break (r113) and
the raise defects remain owed (conversation-engine work, out of this
run's prereg scope).

## Metric review (§14)

- Q1's bars worked as written: GO fired on studies + zero stalls. One
  gap the bars don't capture: the pilot's studies land late (d29/d45/
  d57) because the first trip only starts d28 — the bars judge the
  walk, not the climb's pace. Next run's prereg should add
  first-study-day as a secondary with the r113 band as the comparison
  (r113: never; r122: d29 on 97904).
- Q2's "senseless count must be 0" held: the run is not clean, and the
  count correctly names the carried family rather than a new defect.
- The prereg's root-cause section was CORRECTED before the after-leg
  runs (the (2,4) intermediate + the (2,8) creek destination, found by
  the tile probe after the first proof-test run failed on the old
  exact-arrival bar). That is a pre-run correction, not a re-score:
  no after-leg number was observed before it, and the GO/NO-GO bars
  themselves did not move — only the mechanism description did. The
  proof test's bar moved with it (study range, not exact arrival),
  for the same reason, before any judged sim ran.
- The `candidates` snapshot timing artifact (r113 metric review) is
  untouched by this run.

## Telemetry

NOT run. The pilot/confirm regime (2 seeds, d60) differs from the
`scale.json` baseline regime (4 seeds, d129–180, sums 446/289/646); a
pilot-vs-baseline comparison would be a category error, and the baseline
must NOT roll forward on pilot numbers (prereg). The check runs when a
same-regime band completes.

## Tests

- Proof test `scripts/test-journey-scale-r122-walkto-20261109.js`:
  **6/6 pass** (97904 real-creek walk-around to study range, reach on
  97901 + 97902, determinism, honest stop on a creek-ringed Haven,
  return-home walk). The first version failed 2/6 on the wrong bar
  (exact arrival at a creek village tile) — corrected to study range
  before any judged sim.
- r113 proof test `scripts/test-journey-scale-r113-traderoad-20261109.js`:
  **12/12 pass** (regression cover for the shared file — the trade
  helpers are unbroken by the walkTo change; its live smoke leg ran
  with the fixed walkTo).
- `check.js --quick` NOT run this run: the run budget does not hold a
  ~31-minute gate, and this run changes ZERO `src/js` and ZERO
  harness/collector inputs (one policy function + its export). The two
  proof tests + the pilot/confirm sims are the regression cover. The
  gate is owed on the next run that touches `src/js` or the harness.
- Band stderr: 0 instrument errors on both seeds (reggate/ladder/trade/
  wild rows all present, 60/60 rows each).

## Files (this run, in the worktree)

- `evidence/2026-11-09/journey-scale-r122-prereg.md` — binding prereg
  (root-cause correction noted above, pre-run).
- `evidence/2026-11-09/journey-scale-r122-before/` — before-leg repro
  (postrace + walkdiag log + preload, md5-verified copies).
- `scripts/policies/scalecourt-traderoad-r113.js` — the fix (+78/−17:
  walkTo rewrite + closeEnough + export).
- `scripts/test-journey-scale-r122-walkto-20261109.js` — proof test, 6/6.
- `scripts/journey-scale-r122-20261109.js` — driver clone (labels/EVIDIR
  only; policy require unchanged).
- `evidence/2026-11-09/journey-scale-r122/` — pilot + confirm evidence
  (2 seeds × 60 days: postrace, morntrace, capture, raise talks, all
  instrument rows).
- `evidence/2026-11-09/journey-scale-r122.md` — this note.

## LOUD items

1. **Local master is ahead ~217 / behind ~156 vs origin/master**
   (pre-flight 2026-11-09 ~11:47 UTC; merge-base divergence — origin
   has Codex PR merges, local has loop work). Did NOT merge/rebase/
   push — the ship loop owns origin reconciliation. This run proceeds
   on local master `8419eefa4` and merges locally only.
2. **Stale-lock recovery at run start:** the Lane A lock held r113's
   run_id (`2026-11-09T09:43:34Z`, 2h02m old, no registry entry, no
   journey-scale worktree, no heartbeat process — r113 had landed and
   its closeout never deleted the lock). Deleted per the overlap-guard
   rule; own lock `2026-11-09T11:47:13Z` created. (Lock-file mtime
   anomaly noted: the file's mtime was 11:28:48Z while its content
   read 09:43:34Z — consistent with a runtime restore; no live run
   owned it either way.)
3. **Same brittle `walkTo` is duplicated in ~12 policy files**
   (`scalecourt.js`, `competent.js`, `scalecourt-nogate*.js`,
   `morntrace*.js`, …). This run fixes the one the scale leg uses; a
   family-wide shared helper is owed, not 12 copies.
4. **Tribute spends veterans** (r113 LOUD #3) — still a Steve design
   question, not built. **Trade trust flicker** (r113 #4) — TEND_PEER
   lever still owed. **Gossip voice-break + raise defects** (r113 #5,
   this run's Q2) — conversation-engine fix still owed.
   **sayOncePerFight barrier noise** (r113 #6) — same 3 entries on
   97904 (d30/d57, from `Game.sleep`), instrument noise, not a crash.
5. **97902/97903 confirm not run** (budget) — the band is pilot +
   1 confirm, labeled partial. The full 180-day 4-seed band (ladder
   verdict: does the earlier climb move trade proposals / the charter)
   is owed to a later run.
