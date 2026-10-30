# sim-fleepolicy-a — flee-choosing policy, natural fled observations (GO-STRONG)

**Verdict: GO-STRONG** — the prereg's stronger bar is met:
16 natural fled lingerer fights observed with origin + restore
outcome classified, including 13 RESTORED and 3 BLOCKED —
the clear-restored / blocked-blocked contrast, produced by
real villages under a flee-choosing policy, not by scripted
scenarios. The natural fled population is no longer empty.
Run: flesh-out loop, run fleshout-20261030T1315Z, worker
sim-fleepolicy-a, axis scale-onramp (blocking axis,
converging, NOT converged). POLICY-SIDE MEASUREMENT ONLY —
no game changes, no default flip, no gate move, no deed-bar
move. No [needs-eyes]: this arm changes no feel, combat, or
UI — it only measures through a non-default policy.
Committed on branch, pending coordinator merge. No push, no
version bump, no live verification (the batch ship job owns
deploys).

Prereg: `evidence/2026-10-30/sim-fleepolicy-a-prereg.md`
(committed 711832b6, BEFORE any judged analysis).
Instrument: `scripts/policies/fleepolicy-a.js` (FLEEPOLICY=1,
wraps tableseat-nowait; gate-off delegates to the base
fight untouched, pinned by fixture).
Proof: `scripts/test-fleepolicy-a.js` (fixtures 24/24 +
door/chase scenario proofs, both RESTORED, determinism
byte-identical).
Sweep: `scripts/sweep-fleepolicy-a.js` (copy of
sweep-draftflag-a.js; deltas: policy, EVID dir, SEEDS
75301-75308, additive `fleepolicy` row field from ctx).
Analyzer: `scripts/analyze-fleepolicy-a.js` (pure; run
twice byte-identical).
Corpus: `evidence/2026-10-30/perseed-fleepolicy-a/` (8 rows
+ 8 census files + summary.json; corpus + census gates
true). Analysis: `evidence/2026-10-30/sim-fleepolicy-a-analysis.json`.
Scenario proof output: `evidence/2026-10-30/sim-fleepolicy-a-scenarios.json`
(kept beside the evidence; the judged counts below come
from the natural band only — scenario counts are never
blended into them).

## What was asked

sim-fledcover-a proved the fled-restore MECHANISM via 3
scripted scenarios, but the NATURAL fled population was
empty: 0 fled tbend events on 24 seeds across two bands
(75101-75116 and 75201-75208) under competent play, because
the base fight loop strikes until won/lost/routed and never
walks a lingerer fight to an exit. This arm built the
unbuilt prereg Leg C — a policy that chooses to run from a
linger fight (2 damaging strikes, then walk to the Haven
door or the grid edge and out) — and ran a fresh natural
band with it, classifying each fled lingerer fight by
origin + restore outcome from the draftflag + scholarmelt
recorder fields verbatim. No new recorder field was built.

## Prereg bars (header vs result)

| Bar | Result |
|---|---|
| Prereg committed before judged analysis | PASS — 711832b6 before any judged run |
| Pilot gate (fixtures + 1 pilot seed) | PASS — fixtures 24/24; pilot seed 75301 clean (recorders errs 0, counters present); pilot already yielded 1 classified natural fled (d26 anaconda_empress, RESTORED) |
| Instrument validity (fpFleePhaseFights > 0) | PASS — 19 flee-phase fights band-wide, 0 abandoned |
| Seeds (confirm) | PASS — 8/8 valid (days > 0, recorders errs 0, counters present, census gates true) |
| GO (>= 1 natural fled lingerer classified) | PASS — 16 |
| STRONGER GO (>= 3 with >= 1 RESTORED and >= 1 BLOCKED) | PASS — 16, with 13 RESTORED and 3 BLOCKED |
| Determinism (analyzer twice byte-identical; scenarios twice byte-identical) | PASS — both DETERMINISM-PASS |
| Sense (>= 2 fled chains read end to end) | PASS — 3 chains read end to end (see sense section) |
| Fixtures green before judged analysis | PASS — FIXTURES-PASS 24/24 + SCENARIOS-PASS 2/2 before the band |

**Formal verdict is GO-STRONG.** No metric was re-scored
mid-run. No fled rate is quoted anywhere in this file: 16
instrument-induced flees are a classification sample, not
a population frequency, and the 0/24 unmodified-play
statement stands as the unmodified-play statement.

## The judged counts

### Instrument counters (ctx, band total)

lingerer fights seen 46, strike turns 106, flee-phase
fights 19, flee turns 49 (door 4, edge 45), flee abandonments
0. The policy fired in natural play on its first band, in
both exit paths, and never stalled a fight into
abandonment. Natural siege fights are mostly outside-Haven
fights (45 edge turns vs 4 door turns): the scholar meets
besiegers on the grounds and runs for the grid edge, not
for the hall door.

Two counting notes, stated plainly so the numbers are not
over-read. (1) tbend lingerer rows total 48 while the
policy saw 46 lingerer fights: 2 fights never presented a
player turn to the policy (same-call resolution, the class
prior arms already note), so they could neither be struck
nor fled by any policy. (2) 19 flee-phase fights vs 16
fled lingerer outcomes: 3 flee-phase fights ended
non-fled. There is no shared fight id between the ctx
counters and the recorder rows, so the linkage is bounded,
not exact: per-seed, 75302's single 1-turn flee-phase
fight sits on a seed with no tbend fled at all (its only
fled is a bystander non-origin meeting, below), so it most
plausibly ended won while allies finished the beast; on
75307, 9 flee-phase fights vs 7 fled outcomes against 1
lost lingerer row leaves at most one mid-flee death and
one won/routed-while-fleeing. The 16 fled rows themselves
are exact — every one carries its origin, day, and
restore classification.

### tbend outcomes (worldOrigin fights only, 48 lingerer rows)

fled 16, won 25, routed 5, lost 2. All 16 fled rows are
linger-origin (no fled-non-origin tbend rows on this
band). Scholarmelt fled meetings: 17 — the 16 tbend fled
rows plus one fled-non-origin meeting (75302, bystander
hold: nightcourt fighter at full HP 57→57, scholar HP
97→97, no strike landed by either side, worldOrigin null;
counted separately per the prereg, never folded into the
linger count). The two lost lingerer rows (75304, 75307)
are the nearest-miss counterfactual: even with a
flee-choosing policy, a scholar can still die in a
linger fight (mid-flee or before the flee phase — the
linkage limit above applies).

### Fled lingerer fights (16, all classified, 0 unclassified)

| Seed | Day | Origin (wave, HP pre) | Restore | Blocker |
|---|---|---|---|---|
| 75301 | 26 | anaconda_empress, w1, 1/90 | RESTORED | — |
| 75303 | 104 | gallowdeer, w1, 1/150 | BLOCKED | sweeps_week, 1 HP, w1, (4,4) |
| 75305 | 140 | ad_break, w3, 1/320 | RESTORED | — |
| 75305 | 140 | chorus_line, w3, 1/300 | RESTORED | — |
| 75305 | 143 | ad_break, w3, 1/320 | BLOCKED | chorus_line, 1 HP, w3, (4,4) |
| 75305 | 144 | chorus_line, w3, 1/300 | RESTORED | — |
| 75307 | 89 | belltoad, w1, 9/45 | RESTORED | — |
| 75307 | 92 | belltoad, w1, 9/45 | RESTORED | — |
| 75307 | 94 | belltoad, w1, 9/45 | RESTORED | — |
| 75307 | 133 | belltoad, w1, 1/45 | BLOCKED | suburb, 975 HP, w4, (4,4) |
| 75307 | 142 | callback, w3, 21/260 | RESTORED | — |
| 75307 | 173 | eulogy, w4, 366/900 | RESTORED | — |
| 75307 | 175 | eulogy, w4, 254/900 | RESTORED | — |
| 75308 | 149 | terms_of_service, w3, 1/340 | RESTORED | — |
| 75308 | 153 | terms_of_service, w3, 1/340 | RESTORED | — |
| 75308 | 172 | redactor, w3, 98/260 | RESTORED | — |

The 3 blocked rows repeat the fledcover/lost-band shape
exactly: a named fellow occupant still standing on the
origin tile (4,4) at tbEnd. The blocker need not be
lingering — the 75307 suburb blocker carries no lingering
flag — occupancy blocks, not lingering status, as the
fledcover fixtures already encoded. The 13 restored rows
span waves 1–4 and include repeat besiegers met, fled,
and met again (belltoad 3×, eulogy 2×, terms_of_service
2×): a restored lingerer stays in the siege and can be
fled again, which is the mechanism working as written
across days, not a one-off.

### Per-seed (confirm band 75301-75308, 180d death-aware)

| Seed | Days | Won | Wave | Nat ever/final | Table/entered | tbend fled (ling) | Flee-phase fights |
|---|---|---|---|---|---|---|---|
| 75301 | 180 | 0 | 3 | 1/1 | 0/0 | 1 (1) | 1 |
| 75302 | 130 | 1 | 3 | 1/1 | 1/1 | 0 (0) | 1 |
| 75303 | 109 | 1 | 4 | 1/1 | 1/1 | 1 (1) | 1 |
| 75304 | 180 | 0 | 3 | 0/0 | 0/0 | 0 (0) | 0 |
| 75305 | 153 | 1 | 4 | 1/1 | 1/1 | 4 (4) | 4 |
| 75306 | 180 | 0 | 3 | 1/1 | 0/0 | 0 (0) | 0 |
| 75307 | 180 | 0 | 4 | 1/0 | 1/0 | 7 (7) | 9 |
| 75308 | 180 | 0 | 4 | 0/0 | 1/0 | 3 (3) | 3 |

Seeds 75304 and 75306 never entered the flee phase (6
and 1 lingerer fights seen, all ending won/lost/routed
before 2 damaging scholar strikes — allies finish
besiegers fast, or the beast routes): the instrument
only converts fights that survive to the scholar's third
turn. That is a coverage boundary for future arms, not a
failure: where the fight lasts, the policy flees.

## Wall numbers (this band only, report-only)

won 3/8 (full 0), national ever 6/8, national final 5/8,
table reached 5/8, table entered 3/8, wave reach
at-least 8/8/8/4/0 (wave 5: 0/8), sweep median days 180
(capped-horizon median; per-seed days 180, 130, 109, 180,
153, 180, 180, 180), deaths 290. NOT a before/after
comparison: different seeds from the fledcover band, and
a different (flee-choosing) policy. For context only, the
fledcover baseline band (75201-75208, unmodified stack)
read won 2/8, national ever 7/8, national final 4/8,
table 4/8, entered 2/8, waves 8/8/7/4/0 — the two lines
are never averaged and no lever effect is claimed from
them. The wall's shape is unchanged by this arm
(measurement only): wave 5 0, full seat 0, as on every
band this cycle.

## Reachability verdict

Unchanged by this arm (measurement only): waves 1–4
reachable, wave 5 unreachable on this band (0/8), the
table reachable only through the lesser seat, the full
seat unreached. What this arm changes is the wall's
plumbing, completed: lingerer-keeps now has natural
observations on BOTH halves — lost (24 old + 20 fresh +
2 here, with blocked shapes throughout) and fled (3
scenario + 16 natural, 13 restored / 3 blocked natural)
— and the fled answer under natural siege composition is
the same as under scripted composition: tile clear →
the lingerer comes back wounded; fellow occupant on the
tile → the lingerer melts, blocker named.

## Village assessment (plain words)

When the scholar is told to run from a siege fight, the
villages finally show what running looks like: the
scholar hits the beast twice, turns, and walks for the
edge of the grounds — almost never for the hall door —
while the beast's fellow besiegers keep standing on the
treeline patch. If the patch is empty when the scholar
gets out, the beast is still there the next morning,
wounded from the fight, ready to be met again — the
same belltoad came back three times on one seed, the
same eulogy twice. If another beast is already standing
on the patch, the one the scholar ran from is simply
gone, crowded out by its own side — one seed watched a
pair of beasts take turns on the same patch, each
fleeing and coming back, until the day one of them fled
while the other still stood there, and that one never
came back. Running does not break the siege: the patch
stays held, the beasts stay, and the scholar lives to
meet them again. The one thing this band also shows is
that most siege fights never last long enough to run
from — allies kill the beast, or it routes, before the
scholar's third turn — so fleeing is a real but narrow
door out of a siege, not a general escape.

## Sense notes (chains read end to end)

- SENSE-PASS on three chains (tbend event + scholarmelt
  meeting + daily census snapshots around the day; node
  sims stub Game.say to no-op, so there is no say
  transcript — stated as such, as in prior arms).
- Chain 1 — 75301 d26, anaconda_empress RESTORED: the
  lingerer stood at (4,4) at 1 HP pre-fight (census d26);
  the scholar's fighter copy ended at 6 HP with the
  fled flag, scholar HP 100→100 (never hit); the restore
  cap min(pre 1, fighter-end 6) = 1, and the census d27
  shows the same beast still at (4,4) at 1 HP, lingering.
  The scholar struck, walked 7 edge turns, and left
  unhurt; the beast kept its patch at 1 HP. The numbers
  cohere to the unit.
- Chain 2 — 75307 d133, belltoad BLOCKED: census d132
  shows belltoad 1 HP lingering at (4,4) with suburb 975
  HP also at (4,4) (no lingering flag); census d133 shows
  belltoad gone, suburb 975 still at (4,4). The block is
  occupancy, not the blocker's status — a healthy
  non-lingering occupant blocks exactly like a lingering
  one. This is the same belltoad that restored at 9 HP
  on d89/d92/d94: it kept its patch while it had it
  alone, and lost it the day it shared the tile.
- Chain 3 — 75305 d140–144, the ad_break/chorus_line
  pair: d140 both fled and restored at (4,4) at 1 HP;
  d141–142 both still hold the tile; d143 ad_break flees
  while chorus_line still stands there → ad_break melts
  (absent from the d143 census); d144 chorus_line flees
  and restores, still at (4,4) at 1 HP on d145. The
  clear/blocked contrast plays out inside one siege
  across four days, with the same two beasts: the rule
  is not a scenario artifact, it is the siege's daily
  arithmetic — one beast per patch, the patch decides.
- Nearest-miss sense (why most lingerer fights never
  flee): of 46 lingerer fights seen, 27 never reached the
  flee phase — they ended won (allies + scholar kill
  fast), routed, or lost before the scholar's third
  turn. The instrument converts fights that last; it
  cannot convert fights that end. Seeds 75304/75306 are
  the pure case: 7 lingerer fights seen, 0 flee-phase.
  A future arm that wants more fled volume would need
  longer fights (or an earlier flee trigger), not a
  better exit path — the exit path never failed (0
  abandonments in 19 attempts).

## Metric review

- The prereg bound the run and was honored: no metric
  was re-scored mid-run. GO and STRONGER GO were stated
  before judged analysis and both met exactly as stated
  (16 fled lingerer, 13 restored + 3 blocked).
- Population-definition discipline, kept: "fled lingerer
  fight" here means the tbend definition (origin snapshot
  lingering && !titan). The one extra scholarmelt fled
  meeting (75302 bystander hold) is reported separately
  and never folded in; scenario counts (fledcover-a's 3)
  are never blended with this band's 16; no rate is
  quoted from 16 instrument-induced observations.
- Linking limit, disclosed: ctx counters and recorder
  rows share no fight id (fight ids carry timestamps/RNG
  and are never stored), so flee-phase-to-outcome linkage
  is per-seed and bounded, never exact — the 3
  non-fled flee-phase fights are characterized as above,
  not individually identified. A future arm that wants
  exact linkage would need a recorder-side flee-phase
  flag; this arm did not build one because the prereg
  forbade new recorder fields without justification, and
  the verdict does not depend on the linkage.
- Instrument-effect note (not a verdict): the band's
  wall numbers moved in no interpretable direction vs
  the fledcover band, and no comparison is claimed —
  different seeds, different policy, no panel. Any
  future before/after claim about flee-choosing play
  must run the balanced panel on identical seeds per
  MEASUREMENT.md §15.

## Infrastructure notes (disclosed, all repaired or clean)

- safe-commit index-clobber (known class) hit the
  prereg commit (711832b6): bogus staged deletion,
  worktree file intact, commit contents verified
  byte-identical to the worktree file before repair;
  repaired via update-index --cacheinfo from the HEAD
  blob and verified `git status` clean + `git diff HEAD`
  empty before proceeding. The commit itself is correct;
  only the main index lied.
- No jest was run by this arm (fixtures + scenarios +
  sweeps are plain node scripts; the --cacheDirectory
  rule is vacuous here, recorded as such rather than
  claimed). No sibling tree was touched; no concurrent
  jest ran against the sibling loops' test runs.
- Corpus untouched by the analyzer (pure reads; output
  goes to the analysis JSON beside it). Scratch
  (determinism second runs) removed before the work
  commit; `git status` shows only committed-work files.
- Master did not move under this arm (behind-count 0
  at analysis time), so no rebase was needed.

## RANKED NEXT (with numbers — no lever built here)

1. BLOCKED-RESTORE DESIGN QUESTION (steve-call,
   carried from blockedrestore, now strengthened by
   natural observations): a fled lingerer melts whenever
   ANY occupant still stands on the treeline tile —
   3/16 natural fled here, 1/3 scenario in fledcover-a,
   13/24 lost on the old band, 4/20 lost on the fresh
   band. Should the restore displace/queue when the
   tile is held, or is melt-while-the-siege-continues
   intended? The question now covers natural fled as
   well as lost and scenario fled, by observation.
2. FLEE-TRIGGER DEPTH (measurement, not a rule
   question): 27/46 seen lingerer fights ended before
   the flee phase (won/routed/lost in ≤ 2 scholar
   strikes). If a future arm wants fled volume rather
   than fled classification, the lever is fight length
   or trigger timing — the exit path itself is proven
   (0 abandonments in 19 attempts, both paths).
3. BYSTANDER-HOLD FLED (small, observed once): the
   75302 nightcourt fight ended fled with zero damage
   either side and no worldOrigin. The mechanism that
   ends an unstruck bystander hold as 'fled' is
   unexamined; it is outside this arm's population and
   is recorded here, not investigated.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0,
wave 5 0 on this band, as on every band this cycle. No
axis is converged. No gate number was moved on this
evidence, per the 2026-10-29 gate-sequencing note (prove
behavior normal before tuning gates to it). What
converged further is the linger-keeps rule in full:
lost, fled, and dissolved halves all now have natural
observations, and the fled answer is the same under
natural siege composition as under scripted composition
— the treeline tile decides, not the exit verb, not the
staging.
