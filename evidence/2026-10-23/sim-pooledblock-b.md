# sim-pooledblock-b — pooled-block homecoming PD=1 sign-flip arm (backlog #858)

Run: fleshout-loop-b-20261023T2230Z (loop B), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-pooledblock-b (branch sim-pooledblock-b).
MEASUREMENT ONLY — zero src/js changes, ever. Third pre-registered seed block
(92831-92846) on the homecoming channel; this arm claims backlog #858.

Canon: docs/CANON.md read. There is NO dedicated homecoming/scholar-deposit
canon doc in docs/ (no DISEASES.md/BEAR.md/PRESERVATION.md/MONSTER-WAVES.md/
CONTESTS.md equivalent covers the homecoming channel). Per the brief I say
so here instead of inventing canon.

## Context (the two existing corpora)

- Block 1 (B1): sim-easingchannels-b, seeds 9250-9265, easingchannels-b-corpus/.
  scholarHomecoming glut-normalized Δ under PD=1 on DG=0: -590 (leadfeast),
  -195 (belongfeast) — homecoming FALLS. Corpus has NO hc sub-channel fields;
  common instrument is the named-channel glut inflow (see §Pre-registration).
- Block 2 (B2): sim-homecoming-resume-b, seeds 92801-92816, perseed-homecoming-diag-b/.
  belongfeast/dg0 deposit Δ +587 (RISES — brought/decision +919,
  supply-composition effect); leadfeast/dg0 deposit Δ -81 (falls). Verdict
  DIAG-NO-GO was a metric-scope artifact; attribution complete: brought Δ
  dominates DG=0; brought Δ + keepRaise Δ on DG=1; kept Δ on belongfeast/dg1.
- The question: is belongfeast/dg0's response to PD=1 seed-noise or regime?

## Pre-registration (§9-12, §14) — WRITTEN 2026-10-23 ~23:00Z, BEFORE ANY SIMS

PRIMARY METRIC: belongfeast/dg0 homecoming PD=1 response sign, on a third
pre-registered block, pooled across all three blocks.

Instrument (common to all 3 blocks; B1 has no hc sub-channel fields):
for each seed s, v(s, PD) = extra.glutInflowByChannel.scholarHomecoming /
extra.glutDays (kcal per glut-day). Seeds with glutDays=0 are EXCLUDED and
reported (attribution undefined); the exclude count is part of the verdict.

- Per-seed Δ: Δ(b,s) = v(s,PD=1) − v(s,PD=0). Seeds matched across PD arms
  within each block.
- Block Δ: Δ_b = median_s Δ(b,s); block sign = sign(Δ_b).
- Pooled Δ = median over all 48 (b,s) pairs of Δ(b,s).

GO (lever real): sign(Δ_B1) = sign(Δ_B2) = sign(Δ_B3), AND |pooled Δ| ≥ 400
kcal/glut-day.

NO-GO (noise): any sign disagreement across blocks, OR pooled |Δ| < 400.

NOTE on B1's published -195: B1's own verdict stands on its published
computation; the pooled analysis RECOMPUTES all three blocks on the common
instrument above (not re-scoring B1's run).

POOLING-LEGITIMACY CONTINGENCY (pre-registered): pooling requires same-code
sweeps. The only src/js commit in the B2 corpus window is e6d843ded
(src/js/safetynets.js, compound labels — voicing only). The proof test
(scripts/test-pooledblock-b.js) re-runs 2 B2 configs + 1 B1 config on current
master and must byte-reproduce the corpus hc + glut fields. If the repro
gate FAILS (code-regime drift), the 3-block pooled bar is VOID by
construction; verdict falls back to blocks 2+3 pairwise sign consistency +
a 32-seed pooled |Δ| ≥ 400 bar, with B1 as census-with-caveat. This is the
pre-registered contingency, not mid-run re-scoring.

HORIZON: 100d death-aware, +10d tail max (DAYS=100).
SEEDS: block 3 = 92831-92846, 16 seeds. Cells: {leadfeast,belongfeast} x
{pd0dg0,pd0dg1,pd1dg0,pd1dg1} = 8 cell/policy pairs x 16 = 128 new configs.
Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in the sweep);
PLENTYDEPRI/DEPOSITGATE explicit per cell. Identical sweep script +
instrument to B2 (scripts/sweep-pooledblock-b.js is a namespace-copy of
scripts/sweep-homecoming-diag-b.js; scripts/homecoming-instruments-b.js
reused UNCHANGED — shared instrument, not a sibling namespace clash).
C1 freshness: seeds 92831-92846 verified absent from all existing corpora
(per-seed "seed" fields scanned: B1=9250-9265, B2=92801-92816, depinteraction
9250-9265) and from scripts/*.js — verified 2026-10-23 ~22:58Z, re-proven
in the proof test. (One grep false-positive: easingchannels-b-pd0dg0-
leadfeast-s9252.json contains "tributeDeposit": 92831 — a kcal value, not a
seed; per-seed "seed" fields are the gate's evidence.)

SECONDARIES (report-only, no bar): leadfeast/dg0, leadfeast/dg1,
belongfeast/dg1 — same sign-consistency census across the 3 blocks on the
common instrument.

GUARDRAILS (FAIL bars pre-registered; else report-only):
- G1: paired median survival diff (armed−control) < −10d on any cell → FAIL.
- G2: starvation DEATHS armed−control ≥ +6 on any cell → FAIL.
- G3: new death modes (mechanism families vs B2) → FAIL-by-investigation.
- G4: exposure-normalized starvation — watch-only, reported.

WALL (measured on the new corpus, report-only): national / table / wins,
wave 4-5 unlocks, median survival.

SENSE TEST: read one belongfeast block-3 config transcript where homecoming
beats fire; judge meaning/coherence per the SENSE-TESTING LAW.

§15 BALANCED PANEL: run scripts/balance-panel.js before/after on paired
seeds; paired-block env-gated designs are often invalid-by-construction
(#797) — report honestly, attach the compare .md if produced, do NOT
re-score against the panel.

## Verdict (analyzer: scripts/analyze-pooledblock-b.js, report pooledblock-b-analyzer-report.json)

**PRIMARY — NO-GO** (binding, pre-registered): belongfeast/dg0 block signs
B1="-" (-14.3), B2="0" (0), B3="0" (0) → sign disagreement across blocks;
pooled |Δ| = 0 < 400. Double miss. The pre-registered contingency does not
fire: the pooling-legitimacy repro gate PASSED (test-pooledblock-b.js, see
proof section), so the 3-block pooled bar stands as constructed — and misses.

**Answer to the named question (#858): the sign flip is seed-noise on a
null channel, not a regime.** On the common instrument (scholarHomecoming
kcal per glut-day), the PD=1 response is noise-level on ALL three blocks:
-14.3 / 0 / 0, all two orders of magnitude below the 400 pre-registered
effect size. B2's own +587 "RISES" was on the deposit-attribution instrument
(brought/decision +919, supply-composition); on the channel-per-glut-day
instrument there is nothing to flip. The homecoming channel itself is real
and busy (see sense), but PD=1 does not move it on belongfeast/dg0 in any
block. #858 is ANSWERED: noise, not regime — no further blocks needed.

**Secondaries (report-only):** only leadfeast/pd0dg0 agreed on two blocks
(B1 "-" / B2 "-" / B3 "0") — B1's -265 does not reproduce on B2 (-8.4) or
B3 (0); no consistency to carry. leadfeast/pd0dg1 and belongfeast/pd0dg1
disagree across blocks. The PD=1 response on the homecoming channel is a
null across the census.

**Guardrails (B3):** G1 PASS (paired median survival diff 0d all cells),
G2 PASS (starvation death diffs -9/-2/-8/+2, all < +6), G3 no new death
modes, G4 watch-only exposure-starve reported (1.6/1.0/1.5/1.0 → 1.6-1.8).

**Wall (B3, n=128):** national 77, everNational 84, table 68, wins 0
(SEATDRIVE=0 structural), wave4 71/128, wave5 1/128 (leadfeast/pd0dg0),
median survival 100d (horizon cap). Death-cause top: combat-dominated (see
analyzer report).

## Adoption + recovery note (run fleshout-loop-b-20261023T2330Z)

The 2230Z coordinator died with this worker pre-commit. Adoption by the
2330Z coordinator: dead claim retired to .DEAD; registry run_id rewritten;
heartbeat refreshed. Corpus found 116/128: the container EPERM flap killed
the sweep mid-write, leaving 12 zero-byte per-seed JSONs (pd1dg0/pd1dg1 ×
{92843–92846} subsets). Recovery: re-swept exactly the 12 missing configs
with identical sweep script + pinned env (FEASTSCALE_R13=1, SEATDRIVE=0,
PLENTYDEPRI/DEPOSITGATE per cell, DAYS=100); 0 zero-byte remain; all 128
JSONs valid with hc channel fields. The sweep is byte-deterministic, so the
recovery overwrites nothing real. Corpus analyzed 128/128; verdict written
above. Commit via scripts/safe-commit.sh; rebase in-worktree; ff-merge.

## Metric review (§14)

The 400 kcal/glut-day bar was deliberately set as "lever-real" vs "noise";
with hindsight the homecoming channel's natural PD=1 response sits two
orders of magnitude below it, so any sign-only reading would be a false
discovery engine. Not re-scored mid-run (§14); the verdict is the
pre-registered NO-GO. For any future homecoming-channel work: the channel
volume itself (~12.5% of glut inflow in this corpus) is the interesting
object; the PD=1 modulation of it is a confirmed null — design questions
should move to homecoming VOLUME levers (who scholars feed, not whether
plenty-depri throttles the channel). No metric revision is needed for the
next run because the arm closes the question (#858 answered).

## §15 Balanced panel

Report-only per the pre-registration: the design is a paired PD=1/PD=0
env-gated instrument on pre-seat substrate — the #797 invalid-by-construction
class (the panel's validity requires a landed-behavior change, not an
env-gated policy switch). No panel case committed (caches never commit per
the standing rule); no re-scoring against the panel. The analyzer's paired
medians + guardrails are the judge, per the pre-registered header.

## Sense test (SENSE-TESTING LAW)

Read pooledblock-b-pd1dg0-belongfeast-s92831 (belongfeast, PD=1, B3):
survived, 2449 say lines, endReason survived. extra.hc: 60 decisions (55 in
glut), brought 112,940 kcal, kept 72,080, deposited 40,860 —
depositPerDecision 681 kcal. The homecoming beats read as a real, busy
supply channel: the scholar repeatedly brings food home during glut and
deposits the bulk of it. Kcal-honest (brought − kept = deposit, exact),
legible in the decision counts. This is the SAME pattern the 2030Z arm
sense-verified (brought delta dominates DG=0) — the channel is legible;
only its PD=1 modulation is null. PASS.
