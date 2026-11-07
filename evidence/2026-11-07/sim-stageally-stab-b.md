# sim-stageally-stab-b — staged-trajectory stability, mechanism half (DIAG)

**Arm:** sim-stageally-stab-b (run fleshout-loop-b-20261107T0530Z, Loop B,
axis scale-onramp / winnability chain) · **DIAG only, zero src/js, no
gate/price/deed change.** Staged policy
`scripts/policies/competent-stageally-a.js` used verbatim on its legs;
the bisection variants are policy-side toggles only, each its own file.
**Base:** master b690777cc · **Driver:**
`scripts/stab-driver-20261107.js` · **Draw census:**
`scripts/stab-instrument-20261107.js` · **Analyzer:**
`scripts/stab-analyze-20261107.js` · **Proof:**
`scripts/test-stageally-stab-20261107.js` (43/43 at the sampler-fix
commit; re-run green 43/43 on the final tip in closeout).

## Question

The confirm2 re-run (sim-stageally-confirm2-b) went GO on the same band
where the confirm went NO-GO, with no change to the lever. Its
trajectory-distance section showed the flip is master movement amplified
through a fragile staged trajectory: 53006 staged moved D=13.65 between
masters while its baseline moved D=0.133; 53007 staged 8.74 vs baseline
4.42. trajfrag-b proved the fragility shape on the staged leg alone
(one extra day-0 draw flips 3 of 4 seeds). This arm does the mechanism
half (tracker 0420Z blank 2, second half): (a) count and locate the
staged leg's extra RNG draws vs the baseline; (b) inject one extra draw
at day 0 on the staged leg AND on the baseline leg and measure the flip
rate on each; (c) bisect by neutralizing one staged subsystem at a time
— only if the pilot gap bar holds.

## Pre-registered primary metric

**Flip rate** = fraction of seeds whose CLASS outcome differs between
the unperturbed and perturbed legs of the same policy on the same seed.
CLASS is trajfrag-b's: (1) survival (`endReason` survived vs
village-lost); (2) wave-4 kills (`waveKillLog` wave ≥ 4 count 0 vs ≥ 1);
(3) living veterans at end (last daily row `readiness5.veterans` 0 vs
≥ 1). Pair-formed flip (pair days > 0 on exactly one leg) is secondary,
reported alongside, never the verdict. The D metric
(`stageally-trajdist-20261107.js`, reused verbatim) is reported for
every injected pair.

## DIAG-GO bar (binding)

DIAG-GO iff **BOTH** hold: (1) the injection reproduces a
staged-vs-baseline flip gap — staged flip rate ≥ 3/8 AND staged
exceeds baseline by ≥ 2 seeds on band 53001–53008; (2) the bisection
names a subsystem — neutralizing one staged subsystem cuts the staged
flip rate by ≥ 50%. If (1) holds but no subsystem dominates, the verdict
is DIAG-NO-GO with the measured gap table. If (1) fails, DIAG-NO-GO and
the bisection is not run. Instrument errors must be 0 on every judged leg.

## Corpus

`evidence/2026-11-07/perseed-stageally-stab-b/` — 32/32 pilot files
(8 seeds × baseline/staged × unperturbed/perturbed), 150d death-aware,
0 instrument errors on every leg. Analysis:
`evidence/2026-11-07/stab-b-analysis.json` (written by the analyzer).

**Closeout note:** at the coordinator timeout the corpus stood at 31/32
— the last leg, `stab-s53008-stab-staged-perturbed.json`, had not been
written (the driver was mid-leg when the run timed out). The main
session re-ran exactly that leg in closeout with the single-seed
invocation (`SEEDS=53008 RUN=stab-staged-perturbed POLICY=staged
PERTURB=1`; the driver refuses to overwrite, so a full-leg re-run was
not possible and not needed). The recovered leg: 53008 staged perturbed,
150d, survived, standing 199, 1 wave-4 kill, 1 end veteran, 47
pair-days, 0 errors. The corpus is complete and the verdict below is
judged on all 32 legs.

**Smoke (prereg stage 0, satisfied by the corpus itself):** the staged
53006 unperturbed leg reproduces the confirm2 corpus headlines exactly
(150d, standing 440, 11 wave-4+ kills, maxWave 5, 2 end veterans), and
the staged 53006 perturbed leg reproduces the trajfrag perturbed leg
(73d lost, standing 195, 1 wave-4 kill, 0 veterans, maxWave 4). The
counting wrapper changes nothing.

## Part (b) — flip table

| seed | baseline flip | staged flip | baseline pair-flip | staged pair-flip |
|---|---|---|---|---|
| 53001 | no (64d lost → 47d lost) | no (106d lost → 87d lost) | no | no |
| 53002 | no (66d lost → 108d lost) | **yes** survived+w4kills (150d survived → 133d lost) | no | no |
| 53003 | **yes** veterans (116d lost → 70d lost) | **yes** w4kills+veterans (92d lost → 66d lost) | no | no |
| 53004 | **yes** survived (85d lost → 150d survived, st 480, 7 w4 kills) | no (88d lost → 106d lost) | **yes** | **yes** |
| 53005 | **yes** w4kills+veterans (89d lost → 63d lost) | no (89d lost → 51d lost) | no | no |
| 53006 | no (125d lost → 125d lost) | **yes** survived+veterans (150d survived, st 440, 11 w4 kills, 2 vets → 73d lost) | no | **yes** |
| 53007 | **yes** survived+veterans (103d lost → 150d survived) | **yes** survived+veterans (150d survived → 148d lost) | no | **yes** |
| 53008 | **yes** veterans (147d lost → 136d lost) | **yes** survived+w4kills+veterans (123d lost → 150d survived) | no | no |
| **total** | **5/8** | **5/8** | **1** | **3** |

- **Gap: staged 5/8, baseline 5/8, gap 0 seeds → bar 1 FALSE.**
- D (composite trajectory distance) per pair: baseline 0.363–9.243
  (largest 53004, 9.243 — the perturbation turned an 85-day loss into a
  150-day survival with 7 wave-4 kills); staged 0.127–14.963 (largest
  53006, 14.963 — the confirm2 headline seed).
- **Every pair's first divergence is a `kill-ledger` entry at day 4–8**
  (`waveKillLog[0]` or `[1]`): the displacement first shows up as a
  different wave-1 beast dying first, then the whole trajectory rewrites
  from there. Same shape as trajfrag-b.

## Part (a) — draw census

Mean draws per day are nearly identical across all four legs
(~3600–3656/day); the staged leg is NOT draw-heavy. The staged
subsystems' own draws are small: `stageParty` ~118–127 draws/day
(~3% of the daily total); rally-verb and pending draw 0. The engine
draws dominate (~330–399k of the run total). Total draws differ
between legs mostly because longer-lived villages accumulate more
draws (staged-unperturbed 427,637 vs baseline-unperturbed 352,563 —
the staged leg lived longer on average, median 114.5d vs 96d). The
staged-vs-baseline DELTA is the estimand: about +75k total draws over
a run, of which the staged subsystems contribute only ~118/day.
**Draw volume is not the amplifier.** The fragility is that one
displaced draw anywhere in a ~3650/day stream flips the trajectory —
on either policy.

## Wall numbers (per leg, 8 seeds each)

| leg | national | table | wins | wave-4 unlock | wave-5 unlock | median survival | max survival |
|---|---|---|---|---|---|---|---|
| baseline-unperturbed | 0 | 0 | 0 | 7 | 0 | 96d | 147d |
| baseline-perturbed | 0 | 0 | 0 | 8 | 1 | 116.5d | 150d |
| staged-unperturbed | 0 | 0 | 0 | 7 | 1 | 114.5d | 150d |
| staged-perturbed | 0 | 0 | 0 | 7 | 1 | 96.5d | 150d |

0 wins, 0 national, 0 table on every leg, as pre-registered. The wall
stands; the perturbation moves survival and kills around, not the wall.

## Sense test

Read the transcripts around the first divergence on the headline seed,
staged 53006. Unperturbed (150d, survived, 11 wave-4 kills): day 7
brings three wave-1 kills (two Drum-Belly, one nevermore), day 8 two
murkcap kills, day 9 a wave-2 moderator kill — the village kills early
and often, and the same villagers (gen_76n8yer, gen_y8hmuwz,
gen_6httusd) keep killing. Perturbed (73d, lost, 1 wave-4 kill): day 5
two kills (mirrormoth, cliffhanger), day 7 three (two hummice, one
sanjun), day 8 three (two sunbasker, one Drum-Belly) — also killing
early, but different beasts, different killers, different days. The
lines in both legs are coherent — the same people doing the same kinds
of things (wild kills, fireside lingering, deadfall gathering) — so the
divergence reads as the same village with a different first week, not
a different village and not a broken one. But it IS a genuine rewrite,
not a re-label: the perturbed village never builds the killer pipeline
the unperturbed one does (150d survived with 2 veterans vs 73d lost
with none). One repeated line was seen ("Larry and Jamie lingered over
the fire together." twice on day 5, unperturbed) — the known
verbatim-accept-line pattern from confirm2, noted not judged.

## Verdict: DIAG-NO-GO

Bar 1 fails: the staged flip rate is 5/8 (the ≥ 3/8 half holds) but the
staged leg exceeds the baseline by 0 seeds (the ≥ 2 half fails). The
bisection was **not run**, exactly as the prereg binds. The mechanism
half is answered in the negative: **the staged trajectory is NOT
uniquely fragile. The baseline flips just as often (5/8) under the
same one-draw displacement.** The confirm2 flip — GO on one master,
NO-GO on the previous one, with no lever change — is therefore NOT
explained by a staged-subsystem amplifier. What the arm establishes
instead is that the game's trajectories are chaotic at the one-draw
scale on BOTH policies: a single displaced draw at day 0 rewrites the
CLASS outcome on 5 of 8 seeds, starting from a different wave-1 kill
in the first week. Any master change that shifts the draw stream by
even one draw can flip a band verdict — which is the more likely
explanation of the confirm2 flip, and it means band verdicts on this
game need the same caution trajfrag-b already named: a verdict is a
verdict about one draw stream, not about the lever alone.

## Metric review

The CLASS taxonomy held: the flips are genuine rewrites (survival
swings of 40–65 days, wave-4 kill counts 0↔7, veterans 0↔2), not
cosmetic re-labels — the D values (up to 14.96) and the wall numbers
confirm it. The pair-flip secondary (staged 3 vs baseline 1) is
reported as observed, not as a verdict: on 8 seeds it could be noise,
but pair formation is the winnability chain's binding link, and if
pairs are more perturbation-sensitive under the staged policy that
matters for how much to trust any single pair-forming verdict. Proposed
for the next run: judge pair formation on the pooled pair-flip rate
across a wider band rather than per-seed. The one-draw displacement
instrument is validated: it reproduces confirm2 and trajfrag legs
exactly, and the smoke bars are satisfied by the corpus itself.

## Telemetry

`telemetry-check` refused the corpus, as anticipated for DIAG arms:
all 32 `--current` rows carry top-level `anchorCommit`, so they are
sweep recorder rows, not runs ("Recorder corpora are compared with
sweep-compare tables, never against a run baseline here"). Same
outcome as trajfrag-b, confirm2-b, killersurvive-a. No deviation
check applies.

## Follow-ups (not this arm's verdict)

1. The confirm2 master-move flip needs a different explanation than a
   staged amplifier — chaotic amplification of any draw-stream shift is
   the standing candidate. Band verdicts should carry the trajfrag
   scope note (a verdict is about one draw stream).
2. Pair-formation perturbation sensitivity (staged 3 pair-flips vs
   baseline 1) — a thread for the winnability chain, judged on a wider
   band if pursued.
3. The staged policy's extra draws are ~3% of the daily stream; if a
   future arm wants a less chaotic instrument, the displacement must
   land somewhere the stream is less load-bearing than the day-0 kill
   ledger — or the verdict must be pooled over displacements.

## Convergence

Axis: scale-onramp / winnability chain. **stab-b: DIAG-NO-GO** — the
mechanism half is answered (no staged-specific amplifier; fragility is
policy-general). The tracker blank (0420Z blank 2, second half) is
closed by this verdict. No game change, no lever verdict, nothing to
land except the evidence and the corpus.
