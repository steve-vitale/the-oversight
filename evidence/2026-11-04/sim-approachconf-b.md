# sim-approachconf-b — CONFIRM of the approachfall pilot (Loop B run fleshout-loop-b-20261104T1212Z)

## Verdict

**GO (confirm, THIN — read the thinness caveat before citing this as a
loop kill).** All three pre-registered bars pass: armed approach-loop
fights 0, baseline approach-loop fights 1 (the signal bar, met), cost
bar clean. But the fallback NEVER fired in a live sim on either leg
(armed fallback-consistent events 0), and the one baseline loop fight's
seed diverged on the armed leg (armed 99605: 1 exposure, 0 approach
steps — the loop fight never materialized there), so this confirm still
cannot distinguish "fallback works" from "no loop on the armed
trajectory". It is a strictly stronger result than the pilot — this
band DOES produce a baseline loop, and the armed leg shows 0 loops with
no harm — but the live loop kill itself remains UNPROVEN. Citing this
confirm as "the approach loop is fixed" would be wrong. No gate/price/
deed/standing change. No src/js change. The variant is used verbatim
from master. Landing remains the coordinator's --ff-only merge,
pending ship. No push, no version bump, no live verification.

## Design (from the prereg, committed before any judged seed)

- Prereg: evidence/2026-11-04/sim-approachconf-b-prereg.md (commit
  4a3b7d273, before any judged sweep). Tooling in the same commit:
  weakest-monster analyzer scripts/approachconf-analyze-20261104.js,
  driver scripts/approachconf-driver-20261104.js, summarizer scripts/
  approachconf-summarize-20261104.js, proof scripts/
  test-approachconf-20261104.js (ALL PASS at anchor, re-run after the
  sweeps with no code change in between — proof stands for the swept
  corpus).
- Single-base judging: all 24 legs share the anchor at sweep time
  (prereg commit's parent tree state; variant + competent.js verified
  unmodified vs HEAD at prereg time, `git diff HEAD` empty for both).
- STAGE 0 — band screen (baseline leg only, competent verbatim,
  140d death-aware): band 99601–99612, the fleerepair confirm band
  where approach loops were observed. This screen's baseline leg is a
  NEW leg (verbatim competent, flee repair OFF), not a re-judgement
  of the fleerepair confirm's corpus, which used different policies.
  Signal bar (>= 1 baseline loop fight): PASSED with exactly 1.
  The second band (99901–99912, named in the prereg) was NOT needed
  and NOT run — no screen spend beyond the passing band.
- STAGE 1 — confirm: the same 12 seeds, baseline vs armed on
  IDENTICAL seeds, same policy/horizon as the pilot. The screen's
  baseline legs ARE the confirm's baseline legs (no re-run); only
  the armed legs were added. Baseline = scripts/policies/competent.js
  VERBATIM; armed = scripts/policies/competent-approachfall-b.js
  (COMPETENT_DIRECTIONAL_FLEE=1, COMPETENT_EXIT_VERIFIED_FLEE=1,
  COMPETENT_FLEE_REPAIR=1, COMPETENT_APPROACH_FALLBACK=1, nothing
  else; DPS_RACE off). Policy-side only: ZERO src/js changes.
- BALANCED PANEL (§15): not run as a panel compare, for the reason
  stated in the prereg (balance-panel.js `compare` takes two
  panel.json.gz files from its own registry runs; the variant is not
  a registry policy and registering it would contaminate the
  baseline child — the same reason the pilot and the fleerepair
  confirm documented). The comparison is the pre-registered per-seed
  table + analyzer aggregates — never a fabricated panel compare.
- Corpus: evidence/2026-11-04/perseed-approachconf-b/
  (approachconf-s996*-baseline.json / approachconf-s996*-armed.json,
  24 files). Summaries: approachconf-screen-baseline.json (the
  baseline leg, also the confirm baseline) and
  approachconf-summary-armed.json. Logs: approachconf-screen-
  baseline.log, approachconf-sweep-armed.log. 0 instrument errors on
  all 24 legs; 0 scale-read errors (scaleMeasured 12/12 both legs).
- Instrument correction vs the pilot (the point of this confirm):
  the pilot classified failed-approach turns by the CLOSEST monster's
  distance; the approach branch keys on the WEAKEST monster (lowest
  hp alive). The confirm analyzer classifies every zero-tile
  move-only turn by the weakest monster and splits blocked steps into
  APPROACH-STEP (weakest out of range), FLEE-WALK (weakest in range,
  non-adjacent target — the pilot's reclassification, now
  implemented), and OTHER-BLOCKED (in range + adjacent target, or
  unreadable distance/range). The proof contains a fixture where the
  pilot predicate scores 0 and the confirm predicate scores 1, so the
  correction is demonstrated, not just asserted.

## Judged tables (12-seed confirm, per-seed)

Baseline leg (competent verbatim):

| seed | days | end | TB exp | loops | appr | fleeW | fbEv | maxRun | kills | standingFinal |
|------|------|-----|--------|-------|------|-------|------|--------|-------|---------------|
| 99601 | 134 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 120 |
| 99602 | 37 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 50 |
| 99603 | 80 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 100 |
| 99604 | 65 | lost | 5 | 0 | 4 | 0 | 1 | 3 | 0 | 100 |
| 99605 | 140 | survived | 3 | 1 | 14 | 0 | 0 | 14 | 1 | 125 |
| 99606 | 129 | lost | 8 | 0 | 0 | 3 | 0 | 0 | 1 | 185 |
| 99607 | 140 | survived | 8 | 0 | 0 | 0 | 0 | 0 | 1 | 165 |
| 99608 | 132 | lost | 6 | 0 | 0 | 5 | 0 | 0 | 1 | 245 |
| 99609 | 79 | lost | 6 | 0 | 0 | 2 | 0 | 0 | 1 | 220 |
| 99610 | 52 | lost | 9 | 0 | 0 | 4 | 0 | 0 | 0 | 150 |
| 99611 | 117 | lost | 11 | 0 | 0 | 5 | 0 | 0 | 2 | 175 |
| 99612 | 45 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 70 |

Armed leg (approachfall variant):

| seed | days | end | TB exp | loops | appr | fleeW | fbEv | maxRun | kills | standingFinal |
|------|------|-----|--------|-------|------|-------|------|--------|-------|---------------|
| 99601 | 131 | lost | 5 | 0 | 4 | 0 | 0 | 2 | 1 | 125 |
| 99602 | 91 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 120 |
| 99603 | 79 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 100 |
| 99604 | 131 | lost | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 240 |
| 99605 | 140 | survived | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 125 |
| 99606 | 94 | lost | 13 | 0 | 2 | 0 | 0 | 2 | 2 | 320 |
| 99607 | 124 | lost | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 190 |
| 99608 | 140 | survived | 4 | 0 | 0 | 0 | 0 | 0 | 2 | 320 |
| 99609 | 102 | lost | 4 | 0 | 0 | 0 | 0 | 0 | 2 | 375 |
| 99610 | 65 | lost | 8 | 0 | 0 | 0 | 0 | 0 | 1 | 175 |
| 99611 | 49 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 50 |
| 99612 | 52 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 95 |

appr = approach-step turns; fleeW = flee-walk turns; fbEv =
fallback-consistent events (transcript proxy, see below); kills =
killRows per leg. Orphans (pre-registered non-exposure class, tbEnd
with no exposure): baseline 99606 x1; armed 99607 x2. Reported
separately, not scored as missed fights. Four legs in each leg have
zero recorded TB exposures (baseline 99601–99603, 99612; armed
99602, 99603, 99611, 99612) despite startCombat calls in the wrap
counts — the instrument attaches only a subset of fights as
exposures, the same shape the pilot showed. Exposure counts are
therefore instrument-attached fights, not all fights; loop counts
are over attached fights only, stated here so nobody over-reads a 0.

## GO judgement (strict, prereg threshold)

Verdict: **GO (confirm, THIN)** — all three bars pass, but the
pre-registered fallback-firing qualifier forces the THIN suffix.

(a) **Armed approach-loop fights == 0: PASS.** Armed loops 0,
    max same-step run 2 (99601, 99606 — both fights broke out of
    their approach steps within 2 turns and went on to strike).
(b) **Baseline approach-loop fights >= 1: PASS, exactly 1.**
    Baseline loop fight: 99605 seq 2, day 136, influencer, 14 turns,
    14 approach steps to target (0,7), 14 "No path there" lines, 0
    strikes, fighter died. Max run 14 — the longest same-step run
    in either leg, and the exact loop shape the fleerepair confirm
    described (5–9 steps there; 14 here).
(c) **Cost bar clean: PASS, both halves, both readings — but the
    totals half passes EXACTLY at the boundary, stated plainly.**
    (a) Starvation deaths, totals: armed 8 <= baseline 6 + 2 = 8.
    One more armed starvation death would have failed the bar.
    Arm-only reading (death-tele records flagged player=true):
    armed 3 <= baseline 2 + 2 = 4.
    (b) Median survival: armed 98 days >= 0.8 x baseline median
    98.5 = 78.8 days. Baseline days sorted: 37, 45, 52, 65, 79, 80,
    117, 129, 132, 134, 140, 140. Armed days sorted: 49, 52, 65, 79,
    91, 94, 102, 124, 131, 131, 140, 140.

FALLBACK-FIRING QUALIFIER (pre-registered): armed fallback-
consistent events = 0, in 0 fights. Per the prereg, a GO with 0
firings is GO-THIN, not GO. The armed leg's approach steps never
reached the 3-same-target mark (max run 2), so the fallback's mark
condition never triggered in a live sim — same vacuity as the
pilot, now on a band where a baseline loop DOES exist. What is
proven: the mechanism in stubs (pilot proof), no harm on a live
band that produces loops, and 0 loops under the armed policy. What
is NOT proven: any live loop broken by the fallback.

Supporting mechanism evidence (not judged):

- The split works: baseline blocked steps divide into 18 approach
  steps vs 19 flee walks vs 0 other-blocked — the two loop classes
  no longer share one count. The pilot band's "all flee walks"
  reading was a property of that band, not of the instrument: on
  this band the approach class is real (18 turns, 1 loop fight).
- Armed blocked steps collapse to 6 approach steps, 0 flee walks,
  6 "No path there" lines (vs baseline 35 lines) — but the armed
  leg also carries the flee-repair gates, so the flee-walk collapse
  is not attributable to the approach fallback alone. The approach
  comparison is: baseline 18 approach steps / 1 loop vs armed 6
  approach steps / 0 loops, on divergent trajectories.
- Armed fights strike more (median strikes/fight 3.5 vs baseline 2;
  lost fights 4 vs 2; median damage fraction in lost fights 0.168
  vs 0.041) and escape more (5 fled outcomes vs 0) — but the armed
  leg carries all four gates including the flee repair, so these are
  supporting observations of the combined variant, not of the
  approach fallback. Per-seed trajectories diverge sharply (99604:
  65d vs 131d; 99611: 117d vs 49d), the same chaotic divergence the
  pilot and fleerepair runs showed. Totals judging is the honest
  route.
- The baseline's one fallback-proxy event is itself a warning (see
  Metric review): baseline 99604 seq 5 shows 3 approach steps to
  (3,6) followed by a zero-tile move to edge tile (0,7), which the
  proxy counts as 'repick-attempt' with the gate OFF — a
  flee-branch target change wearing the proxy's shape. Had the
  armed leg shown repick-attempt events, they could not have been
  credited to the fallback without transcript scrutiny. As it
  stands the armed leg shows 0 events of any kind, so no such
  miscredit occurs here — but the proxy is proven confounded, and
  the next run must not rely on it alone.

## Thinness caveat (the headline qualification)

This confirm passes its written bars and still does not prove a
loop kill, for two stated reasons. First, the fallback never fired:
no armed fight reached 3 same-target approach steps, so the mark
condition never triggered — the mechanism's live behavior is
untested, exactly as in the pilot. Second, the one baseline loop
fight does not survive to the armed leg as a comparable case:
armed 99605 runs a different trajectory (1 exposure vs 3, 0
approach steps), so there is no same-seed "loop here, broken there"
pair to point at. The signal bar did its job — it prevented a
vacuous 0-vs-0 from passing silently — but with exactly 1 baseline
loop, the confirm's power is one fight deep. A future claim that
the fallback kills loops needs either a band with several baseline
loops (so armed divergence cannot dodge all of them) or, better,
the named next blank below: replay the loop geometry itself through
the armed policy.

## Sense-test (SENSE-TESTING LAW)

Before (baseline loop fight, 99605 seq 2, influencer, day 136): the
transcript is fourteen identical turns — move toward (0,7), "No
path there.", no strike, no wait, no re-pick, no narration change —
then death. It reads as a broken robot, not a person: a person
blocked fourteen times would try another way in, wait for the beast
to come, or run. The loop is real, and it reads as wrong. No
mitigating narration appears on any of the 14 turns.

After (armed, closest cases — no fallback firing exists to read, so
per the prereg the closest cases were read): armed 99601 seq 4
(influencer): two "No path there." steps toward (3,5), then a
successful step to (4,5) with no narration, then seven clean
strikes with legible narration ("OVERCHARGED ×1.25 (well-fed):
food is fuel", "You STRIKE the influencer for 10/21/15…
(Sharpened stick)"). That reads as a person: bump, bump, step
around, fight — but it is NOT a fallback firing (only 2 fails,
below the 3-mark; the geometry simply let the fighter through).
Armed 99601 seq 5 (influencer, kill): the same shape — 2 failed
steps, then movement, then strikes to a kill. Nothing robotic in
the armed approach path, but nothing that demonstrates the
fallback either: its human-readability still rests on the stub
proofs (wait instead of hammering; re-pick to a reachable tile),
not on a live transcript. The sense veto does not fire — there is
no repaired approach to veto — and the sense-test cannot confirm
the fallback reads human, for the same reason the numbers cannot.

## Wall numbers (REPORTED, not judged — honestly measured)

Every leg carries measured scale fields (scaleMeasured 12/12 both
legs, scaleReadError null everywhere). Nothing below is hard-coded.

| metric | baseline | armed |
|--------|----------|-------|
| wins | 0 | 0 |
| national reached | 0 / 12 | 0 / 12 |
| table reached (sat, end-state tableDone) | 0 / 12 | 0 / 12 |
| table invited (end-state tableWaiting) | 0 / 12 | 0 / 12 |
| wave-4 faced (TB + field) | 92 | 74 |
| wave-4 kills (killRows) | 7 | 8 |
| wave-5 UNLOCKED (seeds with maxWave >= 5; see note) | 0 | 2 (99608, 99609) |
| wave-5 kills | 0 | 0 |
| median survival (days) | 98.5 | 98 |
| max standing (final) | 245 | 375 |
| median standing (final) | 137.5 | 150 |
| arc reached (all legs) | 3 | 3 |

Wave-5 note (pilot/confirm honesty correction, kept): the
summarizer's "wave5faced" counts seeds with maxWave >= 5, which is
wave-5 UNLOCKED, not wave-5 faced. Two armed seeds unlock wave 5
with zero wave-5 kills evidenced in either leg — the unlock moved,
the kill did not. No wave-5 spawn is evidenced unless a killRow or
exposure carries it, and none does.

Scale observation (reported, not judged): rank stayed 'village' on
ALL 24 legs even as standing climbed to 245 (baseline 99608) and
375 (armed 99609). Standing alone does not lift rank — the same
standing-without-rank pattern the pilot and the confirm reported.
The scale wall is unchanged by this arm (as expected — an approach
fallback was never going to move the wall).

Death-cause shares: combat dominates both legs (baseline 753
deaths: villager combat 320, expedition 132, combat 124, the wild
78, monster 47, starvation 6; armed 723 deaths: villager combat
328, expedition 115, combat 110, the wild 62, monster 56,
starvation 8). Starvation is a small share in both. No village
reaches national, the table, or a win in either leg.

## Village assessment (plain words)

The village still mostly dies, and nothing in this arm changes that
arc: 10 of 12 villages are lost in the baseline leg (survivors:
99605, 99607 at 140d) and 10 of 12 in the armed leg (survivors:
99605, 99608 at 140d), combat deaths dominate, no win, no
national, no table. What changed is narrow and honestly bounded:
on a band where a fighter really does die repeating "No path
there." fourteen times, the armed leg shows no such death, fighters
strike more per fight, and two seeds unlock wave 5 where the
baseline unlocked none — but the armed leg's trajectories diverge
so sharply from baseline (99604 doubles its lifespan, 99611 more
than halves it) that none of that reads as proof the new fallback
did anything. The blank filled is the measurement itself: the
weakest-monster split now separates approach loops from flee walks,
and a baseline loop fight is now on record with its transcript.
The blank documented is the live fallback firing, which two runs
in a row have failed to produce. Knowledge/capability gaps that
remain: no live fallback transcript exists yet; the proxy for
firings is proven confounded (it fires on the gate-off baseline);
and same-seed loop-vs-break pairs are defeated by trajectory
divergence, so the next proof must come from replaying loop
geometry, not from another band screen.

## Metric review (for the NEXT run, not a re-score of this one)

- The weakest-monster split works and should be kept: approach vs
  flee-walk vs other-blocked is now a reported three-way split, and
  the proof's discriminator fixture pins it. The pilot's
  closest-monster predicate must not be reused for approach claims.
- The fallback proxy is CONFOUNDED and must not be the sole firing
  evidence next time: baseline 99604 seq 5 produces a
  'repick-attempt' event with the gate OFF (3 approach steps, then
  a zero-tile move to edge tile (0,7) — a flee-branch target change
  wearing the proxy's shape). A direct fallback counter (policy
  ctx counts surfaced through the instrument, e.g. approachFallback
  Marks/waits/re-picks per fight) is needed before any future GO
  leans on firing counts. The wait kind was not observed confounded
  here, but the proxy as a whole is now suspect.
- The starvation cost bar passed exactly at its boundary on totals
  (8 <= 8). A bar that passes by zero margin on a 12-seed run is a
  fragile bar; the next run should either pre-register a wider
  margin or report the exact-margin pass as THIN alongside the
  verdict, as done here.
- The flee-class counters miss door-exit escapes: armed escapes 5
  come with flee-attempt turns 0 and barrier pushes 0, because 4 of
  the 5 escaped fights record zero turns and the 5th exits via a
  move action narrated "You push through the doors into open air"
  rather than a barrierExit action. Escape counts (end result
  'fled') are real; flee-attempt/barrier-push counters undercount
  them. Out of this arm's scope, but the next flee-adjacent run
  should not lean on those two counters.
- Unexplained-but-outside-exposure observation: armed 99608 logs
  1171 tbPlayerWait calls in the wrap counts but 0 wait turns
  across its 4 TB exposures — the waits happen outside TB fights
  (non-exposure policy contexts), so they are NOT fallback waits.
  Worth one line, not a chase: this arm's instrument cannot see
  them, and they do not touch the approach verdict.
- TELEMETRY DEVIATION CHECK (run-book step 10): scripts/
  telemetry-check.js REFUSED this corpus, same as the pilot —
  "all 12 --current rows carry top-level anchorCommit, so they are
  sweep recorder rows, not runs. Recorder corpora are compared with
  sweep-compare tables, never against a run baseline here."
  --allow-recorder-corpus was not forced (it is for
  recorder-vs-recorder compares, not for a recorder corpus against
  the run-shaped scale-wall baseline). That refusal is a tool-shape
  rule, not a deviation finding; the wall numbers above are
  reported directly from the measured per-seed scale fields
  (scaleMeasured 12/12 both legs).
- check.js --quick was NOT run for this arm: it adds no src/js,
  policy-default, or game-code change (new scripts + evidence
  only), and the pilot already established this base's check
  profile (284 passed, 6 pre-existing failures unrelated to
  competent.js/policies/TB). The relevant test — scripts/
  test-approachconf-20261104.js — is green, re-run after the
  sweeps. A full check run belongs to the coordinator/ship loop's
  base profile, not to a tooling-only confirm.

## Findings for the coordinator (do NOT edit hidden_files from this arm)

1. NEXT BLANK (named, blocking for the kill claim): the live
   fallback firing. Two runs (pilot band + this confirm band) have
   now failed to produce one in sims, and the proxy is confounded.
   The next arm should (a) replay the 99605 seq-2 loop geometry
   (influencer fight, target (0,7), 14-step shape) through the real
   armed policy in the harness and show wait/re-pick breaking it,
   and (b) add a direct fallback counter to the instrument so
   future sims record firings rather than proxying them. Another
   band screen is NOT the next blank — trajectory divergence
   defeats same-seed pairing, and a third 0-firing screen would add
   nothing the first two did not.
2. Proxy confound (proven): the fallback proxy fires on the
   gate-off baseline (99604 seq 5, repick-attempt via edge target
   (0,7)). Any future firing claim needs the direct counter in (1).
3. Flee-counter gap: door-exit escapes (5 armed) are invisible to
   flee-attempt/barrier-push counters. Next flee-adjacent run
   should count end-result 'fled' directly, not those counters.
4. Standing-without-rank (pilot/confirm finding, reproduced): rank
   'village' on all 24 legs despite standing up to 375.
   Scale-onramp evidence, unchanged by this arm.
5. Armed wave-5 unlocks (2 seeds) with 0 wave-5 kills: the unlock
   moved under the combined variant, the kill did not. Reported,
   not judged; the unlock seeds are 99608 and 99609.
6. Index-clobber phantoms (routine, repaired twice this run):
   after each safe-commit.sh commit, the main index showed the
   just-committed files as staged-deleted while the worktree files
   existed untracked. Repaired both times via HEAD-blob
   update-index --cacheinfo; every commit verified correct with
   `git show --stat` + empty `git status` + empty `git diff HEAD`
   before proceeding. The commits themselves were never wrong;
   only the main index lied.

## Proof

`node scripts/test-approachconf-20261104.js` — ALL PASS (exit 0),
run before the screen and re-run after the sweeps with no code
change in between. Coverage: weakest-monster approach/flee-walk/
other-blocked classification with both discriminator directions
(including the pilot-predicate contrast fixture), loop definition
(4 same-step fails = loop), fallback proxy kinds (wait /
repick-attempt / repick-moved after >= 3 fails, none before),
summarizer split totals + suffix filter (armed file excluded from
a baseline summary — the pilot footgun, fixed), variant gates
exact with DPS_RACE off, 2-day live-harness smoke on seed 99601
with the verbatim policy.

Sibling proof, no regression: `node scripts/test-approachfall-20261104.js`
— ALL PASS on this branch before the screen (the pilot proof shares
competent.js; this arm changes no policy file and no src/js file,
so no regression path exists beyond the shared files it leaves
untouched — verified by empty `git diff HEAD` for competent.js
and competent-approachfall-b.js at prereg time).

## Verdict (restated)

**GO (confirm, THIN)** — armed loops 0, baseline loops 1, cost bar
clean (starvation totals exactly at the boundary, 8 <= 8) — but the
fallback never fired in a live sim (0 fallback-consistent events),
and the one baseline loop's seed diverged on the armed leg, so the
live loop kill is UNPROVEN. The arm is CONFIRM-GO-THIN; a loop-
geometry replay with a direct firing counter is still owed before
any default flip is even proposed. Branch tip at report time: the
evidence commit itself (below). No rebase, no push, no version
bump, no live verification — those belong to the coordinator and
the ship loop.

## Files

- Evidence (this file): evidence/2026-11-04/sim-approachconf-b.md
- Prereg: evidence/2026-11-04/sim-approachconf-b-prereg.md
- Corpus (24 files): evidence/2026-11-04/perseed-approachconf-b/
  (approachconf-s996*-baseline.json, approachconf-s996*-armed.json)
- Summaries: evidence/2026-11-04/approachconf-screen-baseline.json,
  evidence/2026-11-04/approachconf-summary-armed.json
- Logs: evidence/2026-11-04/approachconf-screen-baseline.log,
  evidence/2026-11-04/approachconf-sweep-armed.log
- Confirm tooling + proof: scripts/approachconf-analyze-20261104.js,
  scripts/approachconf-driver-20261104.js, scripts/
  approachconf-summarize-20261104.js, scripts/
  test-approachconf-20261104.js
- Variant used verbatim (untouched by this arm): scripts/policies/
  competent-approachfall-b.js, scripts/policies/competent.js

---

## CORRECTION — 2026-11-04 (arm sim-approachbranch-a, Loop B run fleshout-20261104T1326Z)

Metric binding (§14): the original text above is left intact. This
appendix supersedes ONLY the lines it names. The branch split in
scripts/approachbranch-analyze-20261104.js (proof: scripts/
test-approachbranch-20261104.js, ALL PASS) re-classifies every old
APPROACH-STEP turn in this confirm's own 24-file corpus by issuing
branch (flee vs CLOSE THE DISTANCE vs other, from policy precedence
+ recorded HP/round/target).

OVERTURNED LABELS (confirm corpus, 24 files):

- The confirm's one baseline "approach-loop fight", 99605 seq 2, is
  NOT an approach loop. Its 14 old approach steps split into flee
  14, approach 0 (every turn HP below the 35% flee line, target
  (0,7) = the legacy flee walk to the nearest x-edge). Under the
  split loop definition (fighter-died + 0 strikes + max true-
  approach run >= 4) it is a FLEE loop, and true-approach loops in
  this confirm's corpus number 0, not 1.
- Baseline old approach steps 18 split into flee 15, approach 3,
  other 0. Armed old approach steps 6 split into approach 6, other
  0, flee 0. Corpus totals: old 24 -> flee 15, approach 9, other 0;
  old loops 1 -> true loops 0.
- The 99604 seq 5 fight's 4 old steps split into approach 3 (turns
  18-20, HP 1.00/0.54/0.54, target (3,6)) + flee 1 (turn 21, HP 0.24,
  target (0,7)). Its fallback-proxy event (3 approach steps, then a
  zero-tile move to edge tile (0,7)) is therefore, under the split,
  a flee-branch target change after the fighter dropped below the
  flee line — consistent with, and strengthening, the proxy-confound
  warning already in this file's Metric review.

CONSEQUENCE FOR THIS FILE'S VERDICT: the confirm's bar (b)
("baseline approach-loop fights >= 1: PASS, exactly 1") does NOT
pass under the corrected taxonomy — the signal fight was a flee
loop, so the confirm never put a true approach loop in front of
the armed policy. The confirm's other numbers stand (armed loops
0 under either taxonomy; cost bar clean as measured), and its
THIN qualification stands, but the headline must now read: the
confirm showed 0 loops under the armed policy with no harm on a
band whose only old-class loop was a flee loop — it did not test
the fallback against a true approach loop at all. The live
fallback firing remains unproven, as sim-approachfire-b already
concluded for the 99605 geometry. This correction aligns this
file with sim-approachfire-b.md, which had already classified
99605 seq 2 as a flee loop; the confirm's text predates that
classification and is superseded on this point only.
