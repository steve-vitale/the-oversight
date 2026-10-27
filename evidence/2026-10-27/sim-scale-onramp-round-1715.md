# sim-scale-onramp-round-1715 — coordinator evidence (run fleshout-20261027T1715Z, axis scale-onramp)

Run: flesh-out loop A, run fleshout-20261027T1715Z. Axis scale-onramp (blocking,
converging, NOT converged). No live lock or claim at run start; lock + claim
created 17:16Z. Base at registration 72b77805b; master moved once mid-run to
3cc2c0e63, which is only the ship loop's version bump (index.html / sw.js /
build.js / version.json — no logic, no scripts/evidence overlap). Both arms
rebased clean onto 3cc2c0e63 in their own worktrees, proofs re-run green
post-rebase, then merged ff-only in order w5block -> defnoffer. Merged
locally, pending ship. No push, no version bump by this run.

## Plain words

Two questions, both measurement only, zero game changes:

1. What exactly blocks wave 5? Answer: not one thing — two keys, and this
   band held neither. No village had a living wave-4 killer (wave-4 kills
   were zero on all 8 census seeds, and every wave-3 killer had died by
   the end), and only one village ever reached the standing number wave 5
   asks for. The nearest village sat one point short of the standing bar
   for 60 days, then lost its armor and weapons to decay. Knowledge is
   not the block: every village met the tricks bar.
2. Can the fallback-feared table rule ever fire live? Not on this
   substrate. Across three fresh bands (24 villages, 9 seatings), defiance
   was offered every single time a village sat down — defiance scores of
   5–13 against a threshold of 4. The rule stays proven in unit tests
   only. A future live test needs a different kind of village that earns
   less defiance, not a fourth batch of fresh seeds on the same substrate.

## Arm 1 — sim-w5block-a: wave-5 blocker census, DIAG-NO-GO

Prereg c930720ce (committed before any sweep) + census 7754affca. Proof
scripts/test-w5block-a.js ALL PROOFS PASS post-rebase (V1–V7).
Band: seeds 74301–74308, tableseat-nowait substrate, 180d death-aware.
Wall: national ever/final 6/8, table entered 2/8 (both feared lesser
wins), wins 2/8, full seat 0/8, wave-4 4/8, wave-5 0/8, median 159d,
deaths 259, starvation 3.
Verdict is DIAG-NO-GO under the binding prereg: no single blocker is
short at end on >= 6/8 seeds while every other gate component is met
(blocker support counts all zero under the end-state sole-shortfall
rule). The secondary picture, reported as analysis not verdict: veterans
0/2 at end AND at peak on 8/8 seeds; wave-4 kills 0 on all 8 seeds;
8 distinct wave-4 types faced, 0 killed; standing >= 200 reached on
1/8 seeds only (peak raw 307 capped 227 on 74305; other peaks 80–147).
Nearest seed 74305 parked at gated 199 for 60 days (d99–d159): a wave-3
kill released wave 4, then deferral + cap + decay ate the lead.
Gate re-derived from code and validator-checked: wave 5 = wave-3 rung
AND gated standing >= 200 AND wave-4 engaged, with the plenty cap and
rd5/rd4 deferrals able to mask the total (rd4 bound 99). Live demands:
w5 = 4/15/6/3/2, w4 = 3/10/5/3/1.
Sense read (74305): villagers read as people — pantry discipline,
teaching, envoy talk, a language barrier — and the game names the block
honestly ("The fifth draft stays in the wings — armor the village;
blood your fighters"). The Herald muster beat repeats identically and
nobody musters: there is no veteran pipeline for them to pass through.
Death causes: villager combat 36.3%, villager-vs-villager 26.3%,
player arena 22.0%, starvation 1.2%.

## Arm 2 — sim-defnoffer-screen-a: defiance-not-offered screen, SCREEN-NEGATIVE

Prereg 4d83c4db7 (committed before any sweep) + evidence 33ad28e9c.
Proof scripts/test-defnoffer-screen-a.js --require A,B,C: ALL APPLICABLE
PROOFS PASS post-rebase (screen 16/16 rows per band, offer consistency
on all 9 seated armed rows, leak pass on all bands). 74201–74208 were
NOT re-swept or re-scored.
Bands (tableseat-nowait baseline vs tablepaths-defiant armed, 180d):
A 74601–74608 seated 5/8, no-defiance seated 0; B 74801–74808 seated 1/8,
no-defiance 0; C 75701–75708 seated 3/8, no-defiance 0. Total seated
9/24, no-defiance seated 0/9, fallback-feared 0. Every seated seed took
rule 'defiant' and won. Qualifying-band definition (seated >= 3 AND
>= 2 no-defiance seated) met by no band, so no Phase 2 live test ran
and no fourth band was screened, per the prereg. No seating transcript
is claimed — none occurred.
Wall (armed legs; baseline identical except the door): national ever
21/24, final 17/24, table 12/24, wins 9/24, wave-4 14/24, wave-5 0/24,
all seats lesser, no full seat anywhere. Notable: villages reached
global rank without ever seeing a table offer (74601, 74603, 75704
armed) — rank and seating remain decoupled.
Mechanism note for the next run's prereg: under the leanlinkrescue
courtship substrate, ledger defiance at seating is 5–13 vs threshold
4 — not marginal. Across defiantdoor-era bands the no-defiance seated
rate is ~1 in 19 (only 74106, defiance 3). A future rule-(3) test needs
a lower-defiance substrate, not more seeds on this one.

## Reachability verdict (this run's judged material)

Waves 1–3 reachable; wave 4 reachable (4/8 census, 14/24 screen);
wave 5 unreached on 32/32 fresh villages this run; full seat unreached;
lesser seat reachable and winnable (11/32 wins, all lesser). National
is not the wall on these bands (national ever 27/32) — the wall is
wave 5 -> full seat, and it is a two-key lock (standing + living
veterans), not a single gate.

## Village assessment

Villages that push toward the top starve less than they stall: they
reach national, sit down at the lesser table and win small, or park
just short of wave 5 while their fighters die and their gear decays.
The missing capability is not knowledge (tricks met everywhere) or
food (starvation ~1%) — it is a living pipeline of fighters who have
killed a wave-4 monster and survived to be counted. Wave-4 monsters are
met but never killed on these bands. Who thrived: villages that took
the lesser seat early. Who died and why: fighters, in combat and in
fights with each other, before any wave-4 kill could stick.

## Blanks filled or documented

- Documented (evidence, not game change): the wave-5 block is two-key,
  measured on two independent fresh bands; the end-state sole-shortfall
  metric cannot see decaying bars — next run's prereg should frame the
  question as a two-key lock or a looser one-component rule (veterans
  meets it 8/8 at end and peak).
- Documented: rule (3) is structurally unreachable on the
  leanlinkrescue substrate (0/9 seated without defiance across 3
  bands); next test needs a lower-defiance substrate.
- Findings passed to the backlog (coordinator, not chased): game.js
  unlockedWave() comment still says wave 4 holds "until 3 distinct
  wave-3 kinds are faced" — stale vs the live readiness gate; 74305's
  final-day standing jump (raw 205 -> 307 on the win day) — mechanism
  unexamined; rank/seating decoupling (global rank without a table
  offer) as a reachability note.

## Metric review

Both arms' pre-registered metrics held with no mid-run re-score. Two
weaknesses for the NEXT run's preregs (not applied here): (1) the
w5block end-state sole-shortfall rule is blind to bars that decay —
peak-state or two-key framing needed; deedGateReady bars were not
instrumented, so no "kills-zero while deed bars met" claim is made.
(2) The defnoffer screen's qualifying band definition assumed a
no-defiance seated seed exists on this substrate at a usable rate —
it does not (0/9); substrate choice, not seed count, is the lever.
Balanced panel (§15): scripts/balance-panel.js has no corpus-ingest
mode for either corpus (both workers checked) — no panel artifact
faked; the per-seed tables + validators are the comparison of record.

## Telemetry deviation check (coordinator, on merged master)

- w5block corpus: 3 LOUD lines (national 12 -> 0, table -87% 16 -> 2,
  wins 16 -> 0). Defnoffer corpus: 2 LOUD lines (national 12 -> 0,
  wins 16 -> 0). No exiled LOUD line on either corpus.
- Verdict: KNOWN ARTIFACT, baseline NOT rolled. The baseline's own
  regime note forbids this comparison (a ~100%-win winseat suite with
  top-level national/table/wins fields) against per-seed corpora that
  carry nationalEver/entered/won rows and pre-seat/lesser-seat regimes.
  Same class as the 1315Z/1631Z rounds.

## Infrastructure

- Safe-commit index clobber hit both workers' commits (repaired per the
  documented HEAD-blob cacheinfo recipe, commits verified correct) and
  did not hit the coordinator commit.
- Master moved once (ship-loop version bump only); both arms rebased
  clean, proofs re-run green post-rebase, merges ff-only in order.
- check.js --quick NOT re-run: zero src/js across all 4 arm commits +
  this coordinator file; arm proofs are the attributable verification
  (1016Z/1130Z/1230Z/1315Z/1631Z precedent).
- Reaper final sweep: sibling trees with uncommitted changes left
  alone (journey-scale, gap-social, others); this run's trees released
  done-merged, worktrees removed, branches deleted. Main tree clean
  at closeout (git status empty).
- No push, no bump. Merged locally, pending ship.

## Files

- Coordinator evidence (this file): evidence/2026-10-27/sim-scale-onramp-round-1715.md
- Arm 1: evidence/2026-10-27/sim-w5block-a-prereg.md,
  evidence/2026-10-27/sim-w5block-a.md,
  evidence/2026-10-27/perseed-w5block-a/,
  scripts/test-w5block-a.js, scripts/test-w5block-a-sweep.js,
  scripts/test-w5block-a-sense.js
- Arm 2: evidence/2026-10-27/sim-defnoffer-screen-a-prereg.md,
  evidence/2026-10-27/sim-defnoffer-screen-a.md,
  evidence/2026-10-27/perseed-defnoffer-screen-a/,
  scripts/test-defnoffer-screen-a.js
