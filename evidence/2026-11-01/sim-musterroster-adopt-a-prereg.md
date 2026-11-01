# sim-musterroster-adopt-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261101T2315Z, arm sim-musterroster-adopt-a, axis scale-onramp.
Build under test: 11ea80917 (on current master, pending ship) — src/js/titans.js
titanAlliedFaces only: a muster call reaching a linked village with no roster
generates its people through the call itself via genVillageRoster.
Question (LIVE-SEED ADOPTION, not the fixture): does the build move real
90111-shape timelines, not just the synthetic proof?

## Instrument (adapted, not rewritten)
scripts/musterroster-adopt-replay-20261101.js — adapts scripts/muster3-replay-20261101.js:
same policy stack (leadfeast + windefer + seatdrive + fullseat-diag), same env
flags, same herald + muster-diag recorders, but (a) SEEDS-parameterized,
(b) triggers on the FIRST refused Herald attempt on any day (not day-87-only,
so the 85106 control works), (c) records pre-call roster presence per link
via a pure _otherVillage read, link count before/after, per-village ally
names with roster verification, the call transcript lines, commit returns,
ready-after, and fought/refused Herald attempts after the call, plus the
sweep's wall fields (maxWave, national, table, won, days, endReason, deaths).
Validator: scripts/test-musterroster-adopt-a.js — checks replay JSONs
against the bars below; no game code changed by this arm.

## BEFORE (recorded corpora — NOT re-derived by checking out old code)
- Seed 90111 (muster3 corpus, base 7f87585608b5): 22 refused Herald attempts
  days 87–89, omen stage 2, snapshot callYield 3 on every snapshot, ceiling
  6/10 with full Haven commit; sounded call at first day-87 refusal brought
  exactly 3 allies (Emberhold only), muster NOT READY, zero later Herald
  fights. Stonebridge/Thornfield: quota 6 each, facesFree 0 on all 22 snapshots,
  roster field ABSENT (freeface probe).
- Seed 85106 (mustercall-b, reachable control): sounded call 5 early → 9 late
  in the before corpus; Thornfield had faces there, Emberhold/Ashford
  rosterless in the freeface contrast.

## PRIMARY METRIC (seed 90111, first refused Herald attempt)
Sounded-call allied yield at the trigger moment, compared with the
muster-diag snapshot callYield AT THE SAME MOMENT on the new build (which
still reads pre-call rosters, so it reproduces the before value 3 if the
timeline is unchanged up to the trigger). Muster ready after two
titanCommitOwn taps.

## GO (all must hold on 90111)
1. Yield ≥ 10 (need), vs snapshot callYield 3 at the same moment.
2. Stonebridge AND Thornfield each contribute ≥ 1 responder, every responder
   a named living adult verified present on its village's roster at call time.
3. Link count unchanged by the call (before == after; no link created).
4. Muster ready TRUE after Haven commit (allies + haven ≥ 10).
5. Guardrail: any link with trust < 25 / opinion < -10 / arrears > 0 present
   at the trigger moment yields 0. If no such link is present, this bar is
   N/A-live and rests on the build's synthetic proof (low-trust village
   refused 0 on all seeds) — stated, not faked.
6. instrumentErrors 0 and muster-diag errs 0 on the judged seeds.

## CONTROL (seed 85106, reported, gated only on no-regression)
Yield ≥ snapshot callYield at its trigger moment (the build never reduces a
real timeline's yield), responders all named living adults on roster, link
count unchanged. Absolute yield reported against the before 5→9 range; no
absolute bar is set because the first-refusal moment on 85106 need not be
the late (9) moment.

## PILOT GATE
Pilot = 90111 + 85106. Confirm spend ONLY on pilot GO (90111 bars 1–4 + 6).
Confirm = adoption replay on the muster3 20-seed selection (90101–90140
selected set as recorded in sim-muster3-a.md); judged seeds = those with a
refused Herald attempt. Confirm verdict: GO if ≥ 2 judged seeds meet bars
1–4; SINGLE-CLUSTER (bounded, as muster3 was) if only 90111 judges.

## HORIZON (death-aware, never fixed 200d)
runDays days:200 as in muster3-replay — dead villages stop simulating; the
refusal window is days 87–89 on 90111 and the tail must show whether a
later Herald attempt is FOUGHT. 200 is a cap, not a target.

## POLICIES / SEEDS
Policy stack exactly as muster3 (see instrument). Pilot seeds: 90111, 85106.
Confirm seeds: muster3 selection (20). Wall numbers reported per judged
seed: national / table / wins, wave 1–5 reach (maxWave, w4Day, w5Day),
median/max survival across the band, death-cause shares from samples.

## PANEL (§15)
Balanced panel (scripts/balance-panel.js) does NOT apply: this is a
single-arm before/after on identical seeds with a snapshot-vs-actual
comparison at the same trigger moment, not a panel policy comparison —
same declaration class as muster3 (DIAG, no panel fabricated).

## OUT OF SCOPE (task bounds)
No #1538 steve-call queue work (sounded-but-short meaning, re-sound
routing, links-require-approach). No gate/stage/deed-bar/win-price retunes.
No game-code change in this arm; if adoption fails, the finding is
documented, not patched mid-run by retuning.
