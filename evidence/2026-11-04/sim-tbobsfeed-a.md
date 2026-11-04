# TB-observation-feed lever — Loop A, run fleshout-20261104T0415Z, arm sim-tbobsfeed-a

Axis: scale-onramp (standing directive). This arm is the 0215Z
run's next-blank 2, from `evidence/2026-11-04/sim-trickcensus-a.md`:
TB fights fed 0 wave-4 signature observations (48 fights, 42 lost,
6 won, 0 fled/routed/calmed, wins excluded by code). The lever:
feed WON TB fights into the wave-4 signature observation bar with
the same "lived to tell it" semantics as the existing field
channel. Threshold 2 UNTOUCHED. No gate/price/deed/standing
change. No playable-verb change — knowledge alone measured.

## Verdict — PILOT GO, CONFIRM NO-GO, LEVER KILLED (not landed)

Pilot (99101–99108): all three pre-registered legs PASS.
Confirm (99109–99116, judged on its own baseline): leg 1
PASSES (1/1 fed), leg 2 FAILS (0 kinds gained, 1 fed
observation < 3), leg 3b FAILS (1 arm-only village loss:
99110 survived in baseline, lost day 134 armed). Per §14 a
miss is NO-GO, never re-scored against a friendlier metric —
so the feed is REVERTED in this arm (commit aad555fba, net
src diff vs branch base zero; proof archived at
`evidence/2026-11-04/tbobsfeed-proof-archived-20261104.js`,
removed from `scripts/` so no dangling test remains in the
suite). The mechanism works (4/4 won TB fights fed across
both bands); the knowledge-gain and cost bars failed on the
confirm band. Pooled numbers below are descriptive only and
do NOT rescue the verdict.

## Pre-registration (committed before any judged sweep)

`evidence/2026-11-04/sim-tbobsfeed-a-prereg.md` (commit
5d0bb89f). Policy `scripts/policies/competent.js`
`{competent}` VERBATIM, 140d death-aware. GO iff ALL: (1)
>= 80% of won TB fights in the armed leg record a fed
observation for the fought kind (end villageCounterObs >
start; already-known-at-start fights excluded from the
denominator); (2) >= 1 wave-4 kind crosses to known (2/2)
in the armed leg unknown in baseline, OR >= 3 fed
observations total; (3) cost bar: starvation armed <=
baseline + 2 AND 0 seeds armed-lost/baseline-survived AND
median survival armed >= 0.8x baseline median. Confirm
judged the same three legs on its own baseline.

Method notes (honest, load-bearing):
- Baseline legs are THIS anchor's own code without the
  feed. Pilot baseline ran before implementing; confirm
  baseline ran on the pre-feed `game.js` blob restored
  from git (bytes hash-verified, armed content restored
  from a `cp` backup immediately after, hash-verified
  against HEAD — never checkout-as-restore).
- Trickcensus totals are NEVER cited as this arm's
  baseline and never pooled with pilot numbers.
- Balanced panel (§15): NOT USED for the judged
  comparison, stated reason: `balance-panel.js compare`
  requires corpora produced by the panel runner under its
  own observer and carries no TB-exposure / observation
  metric. The judged comparison is the paired per-seed
  table from the shared trickcensus instrument on
  identical seeds (analyzer
  `scripts/tbobsfeed-analyze-20261104.js`).
- Per-seed JSONs: `evidence/2026-11-04/perseed-tbobsfeed-a/`
  (16 pilot + 16 confirm legs; 99105 armed-code repro
  JSON deleted after verifying it matched the armed leg
  except the run tag — determinism proof, see below).

## The change (lived in commit 6fad3dd45, reverted in aad555fba)

In `Game.tbEnd`'s SCHOLAR TRICK OBSERVATION block
(`src/js/game.js`): 'won' joined 'fled'/'routed'/'calmed'
under the same scholar-alive guard, iterating every
distinct monster kind in the fight ALIVE OR DEAD (a won
fight's monsters are dead — the old alive filter would
have fed nothing even with the result test extended).
Downstream is the untouched shared `_trickObservation`
core: same bar, same threshold 2, same first-person
narration, same tele events. Results are mutually
exclusive (a fight ends once), and kinds are deduped per
fight, so no fight feeds twice and at most 1 observation
per kind per fight. No monster-flee change (Steve
2026-11-02 ruling). Proof while it lived:
`scripts/test-tbobsfeed-20261104.js` 14/14 (won feeds
0→1, threshold stays 2, second won completes 2/2 with
COUNTER LEARNED narration, lost feeds nothing in both
scholar-alive and scholar-dead shapes, 2 dead of one
kind feed 1 not 2, already-known feeds nothing, fled
channel unchanged).

## Pilot judged table (99101–99108, baseline vs armed)

| seed | days b/a | end b/a | TB b/a | won TB armed (fed) | kinds gained | starv b/a | deaths b/a |
|------|----------|---------|--------|--------------------|--------------|-----------|------------|
| 99101 | 140/140 | survived/survived | 1/1 | eulogy@d134 fed 0→1 | — | 0/0 | 60/60 |
| 99102 | 127/127 | lost/lost | 3/3 | — (0 won) | — | 0/0 | 69/69 |
| 99103 | 118/118 | lost/lost | 6/6 | eulogy@d74 fed 0→1 | eulogy | 2/2 | 69/69 |
| 99104 | 139/139 | lost/lost | 6/6 | — (0 won) | — | 0/0 | 70/70 |
| 99105 | 84/93 | lost/lost | 9/4 | congregation@d90 fed 0→1 | — | 0/1 | 53/55 |
| 99106 | 96/96 | lost/lost | 1/1 | — (0 won) | — | 1/1 | 77/77 |
| 99107 | 71/71 | lost/lost | 0/0 | — | — | 1/1 | 40/40 |
| 99108 | 68/68 | lost/lost | 0/0 | — | — | 1/1 | 49/49 |

Pilot judged: leg 1: 3/3 fed = 100% PASS. Leg 2: eulogy
gained on 99103 AND 3 fed observations PASS (both
prongs). Leg 3: starvation 6 <= 5+2 PASS; arm-only
losses 0 PASS; median 118 vs 118 PASS. PILOT GO.

The 99103 mechanism, exactly as the census sketched it:
TB won fight day 74 feeds eulogy obs 1 (scholar, tele
`counter_observed` vid player); day 83 a villager field
observation (pavel_dubinin) brings it to 2 → discovered
via 'observed'. Baseline ends eulogy at obs 1, unknown;
armed ends eulogy known. TB feed + field channel
combined to complete a kind mid-run. (Census sharp case
was congregation; the realized case is eulogy — same
shape.)

## Confirm judged table (99109–99116, baseline vs armed)

| seed | days b/a | end b/a | TB b/a | won TB armed (fed) | kinds gained | starv b/a | deaths b/a |
|------|----------|---------|--------|--------------------|--------------|-----------|------------|
| 99109 | 99/99 | lost/lost | 3/3 | — (0 won) | — | 0/0 | 56/56 |
| 99110 | 140/134 | survived/LOST | 5/0 | — (0 won) | — | 0/1 | 61/46 |
| 99111 | 71/71 | lost/lost | 0/0 | — | — | 1/1 | 50/50 |
| 99112 | 98/98 | lost/lost | 2/2 | — (0 won) | — | 0/0 | 64/64 |
| 99113 | 72/72 | lost/lost | 0/0 | — | — | 1/1 | 44/44 |
| 99114 | 70/101 | lost/lost | 1/6 | strike@d77 fed 0→1 | — | 0/0 | 48/49 |
| 99115 | 89/59 | lost/lost | 7/5 | — (0 won) | — (base knew algorithm; armed none) | 0/0 | 52/42 |
| 99116 | 94/94 | lost/lost | 4/4 | — (0 won) | — (both knew audit) | 0/0 | 67/67 |

Confirm judged: leg 1: 1/1 fed = 100% PASS. Leg 2: 0
kinds gained, 1 fed observation < 3 FAIL. Leg 3a:
starvation 3 <= 2+2 PASS. Leg 3b: arm-only losses 1
(99110) FAIL. Leg 3c: median 98 vs 94 PASS.
CONFIRM NO-GO (legs 2, 3b).

## Wall numbers (all legs, wins / national / table / wave-4 / wave-5 / median)

Pilot baseline: wins 0/8, national 0/8, table 0/8, scale
village 8/8, wave-4 kills 5 (1+1+1+0+2+0+0+0), wave-5
faced 0, median 118. Pilot armed: wins 0/8, national
0/8, table 0/8, wave-4 kills 4 (1+1+1+0+1+0+0+0), wave-5
faced 0, median 118. Confirm baseline: wins 0/8,
national 0/8, table 0/8, wave-4 kills 2, wave-5 faced 0,
median 94. Confirm armed: wins 0/8, national 0/8, table
0/8, wave-4 kills 1, wave-5 faced 0, median 98. As
pre-registered, this arm does NOT expect kills or
readiness to move (no verb change) — and they did not
move in any systematic direction. Knowledge alone moved
nothing on the wall. The trickcensus verdict stands:
knowledge without a verb is decoration, and the verb arm
is still the missing half.

## Why trajectories diverge (read this before reusing the paired numbers)

Paired legs are NOT trajectory-identical past the first
won TB fight — by design, and verified, not assumed:
- The feed fires on won fights of ANY wave, not just
  wave 4 (the wave-4 instrument only exposes wave-4
  fights, so low-wave won feeds are invisible in the
  exposure tables but visible in tele events). First
  pilot divergence (99105): legs agree through day 13;
  day 16 armed shows a scholar-observed
  memory_projector the baseline lacks — a low-wave won
  feed — and the legs walk apart from there.
- Knowledge then changes behavior through EXISTING
  channels: obs 2 completions make kinds teachable
  (counterTeachable) and playable (beastTrickPlay for
  low-wave counters, field AI via villageKnowsTrick for
  signatures). 99110 armed learned 7 wave-3 signatures
  by end (incl. redactor via a day-103 scholar
  observation) yet met ZERO wave-4 TB fights (baseline
  met 5) — the village's path, not its knowledge, moved.
- Determinism is NOT the issue: re-running armed 99105
  reproduced the armed JSON exactly except the run tag.
  The divergence is the lever's own downstream effect.
- Consequence for reading the cost bar: a behavior-
  changing knowledge lever will diverge paired
  trajectories, so a 0-tolerance arm-only-loss bar
  (leg 3b) is nearly unpassable at this n — see metric
  review. That does NOT re-score this run: the bar was
  pre-registered, 99110 failed it, verdict NO-GO.

99110's death, investigated (not hand-waved): the armed
village died day 134 (baseline survived to 140) with a
mixed terminal week — dehydration, an unclosing wound,
a monster kill, a starvation, a contest death — no
single feed-caused kill, no wave-4 knowledge at end
(0 known kinds vs baseline's 3 at obs 1). It is
trajectory divergence with a worse draw on this seed,
not a demonstrated feed toxicity. 99114 cuts the other
way (armed lived 101 vs 70 days, 6 TB fights vs 1, 1
wave-4 kill vs 0). 99115 cuts against again (armed died
day 59 vs 89, never learned the algorithm baseline
knew). Bidirectional noise at n=8, medians flat or
better — but the pre-registered bar counts the loss,
not the median.

## Sense-test (SENSE-TESTING LAW — transcripts read and judged)

Fed observations read as people learning, not counter
ticks. Verbatim from armed TB transcripts:
- 99101 eulogy@d134 (won): "You lived to tell it — The
  Eulogy's moves are burned into your memory. (1/2 —
  one more survived encounter and you'll have its
  trick.)"
- 99103 eulogy@d74 (won): same line, same shape.
- 99105 congregation@d90 (won): "You lived to tell it
  — The Congregation's moves are burned into your
  memory. (1/2 — …)"
- Proof-test discovery line (synthetic, same core):
  "💡 COUNTER LEARNED — The Eulogy: Contradict the
  narration. … (You lived to tell it, twice — and now
  you see the pattern.)"
Judged: first-person, beast-specific, progress stated
(1/2), discovery names the trick and its reveal. The
sense-test leg PASSES — it is not what failed this arm.
The narration is the existing scholar channel's wording,
reused untouched; no new line was written for the feed.

## Instrument notes (not hidden, not judged)

- 0 instrument errors on all 32 legs. Orphans: pilot
  0; confirm baseline 99116 has 1 orphan TB end (the
  census's known class: day-77 routed fight, no
  exposure); confirm armed has 2 (99115 + 99116).
  Orphan classification was NOT a pre-registered leg
  here; the classes match the census's named miss.
- `check.js --quick` NOT re-run in full after the
  revert: the revert restores the pre-feed `game.js`
  blob byte-identically (hash-verified) and removes
  the proof from `scripts/`; the only remaining worktree
  delta vs branch base is instruments + evidence. The
  arm's own proof ran 14/14 on the armed code before
  the revert and is archived, not runnable as suite
  (by design — it tests deleted code).

## Metric review (§14 — no in-run re-scoring; revisions for the NEXT run only)

- No metric was re-scored. Confirm legs 2 and 3b are
  judged exactly as pre-registered, and the verdict is
  NO-GO on them.
- Leg 2's absolute ">= 3 fed observations" prong does
  not scale with the band's won-fight count: the
  confirm band held exactly 1 won TB fight in the armed
  leg, so the prong was unpassable before the band ran.
  A future arm should pre-register a knowledge leg that
  scales with opportunity (e.g. a fed-rate leg like leg
  1 plus a pooled-band or multi-band kind-gain count),
  or power the band on won fights rather than seeds.
- Leg 3b's 0-tolerance paired-loss bar does not fit a
  behavior-changing lever: once knowledge changes
  behavior, paired trajectories diverge by design, and
  a single worse draw fails the bar even when medians
  and starvation totals are flat or better (here:
  confirm median 98 vs 94 armed-better, starvation 3
  vs 2 within +2). A future arm should pre-register a
  harm bar on aggregates (median + starvation + loss
  RATE across bands) rather than 0 paired losses — or
  keep 0-tolerance only for levers that provably cannot
  change behavior before the loss.
- Leg 1's denominator exclusion (already-known fights)
  was never exercised (0 excluded in both bands) — the
  rule stands untested, not validated.

## What this arm leaves for the next arm (NOT a landing claim)

- The feed mechanism is proven (4/4 won TB fights fed
  pooled; proof 14/14 while it lived; sense-test
  passes). What is NOT proven is that feeding moves
  knowledge to known at band scale (1 kind gained in
  16 armed legs, pilot only) or that knowledge moves
  kills/readiness (wall flat). The census's required
  second half — a playable wave-4 signature VERB — is
  still the missing piece, and this arm's evidence
  sharpens its bar: a verb arm must pre-register
  knowledge-to-play conversion (known signatures
  attempted in TB fights), not just knowledge counts,
  and must power its cost bar for trajectory
  divergence.
- Do NOT re-land this exact feed on the same legs and
  expect a different verdict: the confirm band's won-
  fight scarcity (1 in 8 seeds) is the binding fact,
  and it is a property of the band, not of the feed.

## Findings list (for the coordinator — NOT edited into sim-findings.md directly)

- [open] 2026-11-04 — trick availability — won-TB
  observation feed: mechanism proven (4/4 fed, 14/14
  proof, sense-test passes) but confirm NO-GO (0 kinds
  gained, 1 fed observation, 1 arm-only loss on
  99110); feed reverted, proof archived (this run /
  evidence/2026-11-04/sim-tbobsfeed-a.md).
- [open] 2026-11-04 — measurement — paired-trajectory
  divergence: a knowledge lever diverges paired legs
  from the first won fight (any wave) through existing
  teaching/trick channels; 0-tolerance paired-loss bars
  and absolute fed-count bars misfit such levers (this
  run).
- [open] 2026-11-04 — instrument — confirm-band
  orphans: 99116 orphan recurs (routed, no exposure)
  plus a new 99115 armed orphan; orphan classification
  for routed fights still open from trickcensus (this
  run).

## Proof and landing

- Arm commits on branch sim-tbobsfeed-a: prereg
  5d0bb89f, instruments 72ae4f2e, lever+proof
  6fad3dd45 (14/14), KILL/revert aad555fba (net src
  diff vs branch base ZERO — verified via
  `git diff HEAD~3 HEAD -- src/js/game.js` empty).
  This evidence file + 32 per-seed JSONs commit on the
  same branch, pending coordinator merge --ff-only,
  pending ship (ship loop owns version bumps, pushes,
  live verification). The branch is safe to merge as
  documentation + instruments: it changes NO game
  code. If the coordinator prefers, it may also drop
  the branch — nothing playable depends on it.
- Safe-commit index clobber hit all four worker commits
  (repaired via HEAD-blob cacheinfo each time, commits
  verified correct; worktree bytes identical to HEAD
  blobs). Heartbeats: worktree heartbeated through the
  run.
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence; wall numbers are
  flat vs baseline legs, so no deviation is claimed).
