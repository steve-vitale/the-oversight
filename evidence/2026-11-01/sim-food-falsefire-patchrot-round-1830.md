# Loop B round 1830Z — food-economy: false-fire definition settled (sensor still NOT deployable) + patch-rotation pilot NO-GO
Run: fleshout-loop-b-20261101T1830Z. Axis: food-economy (converging).
Sibling Loop A live on scale-onramp for the whole run (1742Z claim:
heraldarr2 + muster3, NOT touched). No B lock at run start; claim written
before any sims. Pre-flight: main tree clean, disk 20%.

Arms take the 1725Z closeout's next blanks in order: (2) dipslide
false-fire-definition settlement + hairline-only gap (two separated sub-5%
evenings); (4) haul-size follow-up regrow/patch-rotation. Blank (1) HUNGER
WINTER relief passivity skipped again as a steve-call candidate needing a
ruling first; blank (3) shelling default-flip call remains a call, not a
sim arm.

## Arm 1 — sim-falsefire-b: false-fire definition settled, deployability NO-GO + separated-wiggle NO-GO (DIAG only)

Worker commits 1aa0f4163 (prereg + analyzer + proof, before any judged
sweep), 361956f7 (analyzer fix implementing the prereg's censored-rate
rule verbatim; first corpus run discarded and re-run, no judged result
rests on the buggy version), 58f410c3 (evidence + pilot corpus +
re-analysis). Merged --ff-only as 58f410c3e (base was current, no rebase
needed); proof re-run green on merged master 52/52. Tree released, branch
deleted.

Settled definition (one sentence): a sensor warning is a false alarm only
if the pantry climbs back to where it was when the warning fired within ten
evenings — a slide that stays down for ten evenings and only then recovers,
or ends in collapse, was a real slide worth warning about, even if the
village survives.

Judged literally against the prereg:
- Q1 definition settled, deployability NO-GO. FF-1 pooled judged rate PASS:
  2/9 = 22.2% <= 25% (corpus 1/8 = 12.5%, pilot 1/1 = 100%). FF-2 pilot
  sensitivity FAIL: 2 confirms vs >=3 bar. FF-3 pilot judged rate FAIL:
  1/1 = 100% > 25%. The pooled pass does not rescue two fresh-band
  failures. The definition stands as settled; the sensor is still NOT
  deployable as a slide warning.
- Q2 separated-wiggle extension NO-GO by the letter. W-1 PASS: 0
  extension-resting confirmations on the pilot (and 0 on the corpus).
  W-2 FAIL: sensitivity excluding extension = 2 < 3. The failure is pilot
  quietness, not extension incidence — nothing rested on the extension
  anywhere (0/28 seeds), but the band can't certify the >=3 floor. The
  flag stands (gap closed definitionally); adoption for verdict purposes
  is withheld, and a future deploy claim must decide separated shapes in
  its own prereg.

Numbers:
- Corpus re-analysis (dipslide3, seeds 51311–51330, no new sims): all 10
  fires match dipslide3's published tables exactly (no analyzer
  discrepancy); re-scored 9 true / 1 false. The one false, 51316, rides
  on a +5 kcal bounce (21,255 vs level 21,250) the evening after
  confirmation, then re-slides to 15,700 — the recovery test's missing
  noise margin, carried in metric review. Censored trues: 51314
  (2 evenings), 51326 (6 evenings). Old survived-seed rate for
  comparison: 50% -> new judged 12.5%.
- Fresh pilot (51601–51608, verified fresh by seed-field scan, all 8
  first-try): 7 survived, 1 collapsed (51608, village-lost day 28 —
  program's second collapse ever). Only 2 confirms: 51602 FALSE (genuine
  reversal: 16,401 -> 22,097 in 5 evenings, then 30,148) and 51604
  TRUE-but-censored (slides 15,072 -> 10,500 by day 30). Old pilot rate:
  2/7 = 28.6%. Wave max 2; no wall movement claimed (30d window).
- The collapsing village never got a warning: 51608's gate stood down day
  12 and never re-engaged while the pantry fell 9,483 -> 700, so
  final-run counting had nothing to score. Flagged for the coordinator's
  backlog as the next instrument problem (gate coverage, not scoring).

Sense test: confirming evenings read like a real slide a player would
recognize — "shelves are full, ~7 days of fresh" at 16,401 on 51602's
confirmation, "~6 days" at 14,300 on 51604's — while the whole store thins
underneath. The settled split reads sensibly: 51602's warning feels like a
reasonable alarm about a slide that genuinely reversed; 51604's stays true
to month's end. Grim note: the known "pot stays full" line reproduced 1/8
on 51608 day 28 ("The pot stays full and nobody touches it") as villagers
starved — recorded only.

Evidence: evidence/2026-11-01/sim-falsefire-b-prereg.md,
sim-falsefire-b.md, sim-falsefire-b-pilot-armed.jsonl,
sim-falsefire-b-corpus/. Analyzer scripts/analyze-falsefire-b.js; proof
scripts/test-falsefire-b.js. Seeds 51601–51608 now consumed.

## Arm 2 — sim-patchrot-b: patch-rotation policy, pilot NO-GO

Worker commits b4418fadcb (prereg + policy/driver/analyzer/test skeletons
+ sweep-compare registry line, before any judged sim), 60d57b2ec (pilot
evidence + jsonl/analysis + panel record + corpus extracts). Rebased onto
the falsefire-merged master clean (no conflicts, no stop-at-pick quirk);
proof re-run green post-rebase 9/9; merged --ff-only as 99d22897f. Proof
re-run green on merged master 9/9. Tree released, branch deleted.

Frozen rotation rule (one sentence): a tile the scholar foraged on
scholar-day D counts as resting on days D and D+1 (the ~2-day regrow
window) and sorts as 99 steps farther for forage-target choice on those
days, returning to full standing at age >= 2 days — the candidate menu is
never filtered, only reweighted, implemented purely in the new policy
file (travelTargets `d` inflation during `competent.daily` only), zero
src/js changes, zero edits to `competent.js`.

Pilot judged exactly against the prereg pair (30d competent,
DEPOSITGATE=0, identical fresh seeds 51901–51908 both arms; control 51909
instrument-proof only):

| Leg | Baseline | Armed | Bar | Result |
|---|---|---|---|---|
| (a) failed-trip day share, pooled | 0.346 (83/240 days) | 0.171 (41/240 days) | <= baseline − 0.10 | PASS, delta −0.175 |
| (b) mean daily haul | 511.9 kcal | 457.2 kcal | >= baseline | FAIL, delta −54.7 |
| Cost: median survival | 30 | 30 | >= 0.8x | clean |
| Cost: starvation deaths | 1 | 1 | <= baseline+1 | clean |

Verdict: PILOT NO-GO — the pair requires both legs. No confirm spend;
reserve 51921–51932 stays fresh, never run. Finished-pack value (398.7 vs
365.3) and unload (25,135 vs 0) reported as diagnostics only, per prereg;
they do not rescue the miss.

What happened: rotation genuinely engages (1,458 penalized menus, 445
forage attempts, 67 visited tiles, ZERO stale attempts — fresh ground
within reach always existed) and trip days rise 140 -> 179, but the extra
trips go to thinner ground. Remaining 41 failed days are still all
FAILED_WORKED_OUT: rule-fresh is not harvestable. Counterexample seed
51901 hurts on both legs (failed share 0.033 -> 0.200, haul 848.2 ->
313.0) — on a seed whose nearest patch already paid, rotation trades a
good patch for thin ones. Next candidates (coordinator backlog, not
claimed here): route-blockage arm, fertility-signal rotation,
success-anchored rotation.

Sense test: trips read as a person stepping to another green patch —
nothing robotic, but rotation is narratively invisible: no line ever marks
skipping yesterday's patch or choosing unworked ground (same invisibility
class as multisweep's missing second-outing line). Not a grid march, but
not a choice the player can see being made.

Panel §15 (pre-declared instrument): single campaign, both policies, same
seeds/days — 16 cases, sourcesStable true, neutrality matched, zero
warnings; both arms 8/8 survived, won 0, national 0, table 0, maxRank
village. Context only, never verdict.

Evidence: evidence/2026-11-01/sim-patchrot-b-prereg.md,
sim-patchrot-b.md, sim-patchrot-b-pilot-{baseline,armed}.jsonl,
sim-patchrot-b-pilot-analysis.json, sim-patchrot-b-panel.json.gz,
sim-patchrot-b-panel-summary.md, sim-patchrot-b-corpus/. Policy
scripts/policies/competent-patchrot-b.js; driver
scripts/patchrot-b-driver.js; analyzer scripts/analyze-patchrot-b.js;
proof scripts/test-patchrot-b.js. Seeds 51901–51908 now consumed.

## Wall (this run's judged corpora — 30d pre-seat windows, not a win-seeking run)

Full seat 0 / wave 5 reached 0 stand as last measured (Loop A lane).
In-window: falsefire 7/8 survived 30d (1 collapse, 51608 day 28), wave max
2, collapses 1/8; patchrot 16/16 survived 30d (both arms), wave max 2,
collapses 0. No wall movement shown or claimed.

## Telemetry deviation check (coordinator, post-merge)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-01/sim-patchrot-b-pilot-armed.jsonl' --metrics
national,table,wins,exiled` → LOUD parse refusal by the tool itself:
"could not parse ... Unexpected non-whitespace character after JSON at
position 642006 (line 2 column 1)". Same input-format limitation
precedent as 1725Z/1543Z/1430Z (tool expects a single JSON document;
multi-line jsonl fails at line 2) — NOT a deviation, no investigation
item, baseline NOT rolled.

## Infrastructure

- No EPERM write flap this run.
- Safe-commit index clobber (known class) hit all worker commits (both
  arms); each repaired via --add --cacheinfo from HEAD blobs, commits
  verified correct. Coordinator evidence commit: see commit note for
  clobber check.
- MERGE DISCIPLINE honored: falsefire merged --ff-only alone and verified
  before patchrot's turn; patchrot's ff failed on the moved master, so its
  private branch was rebased onto the new master clean, proof re-run
  green, then merged --ff-only and verified. Releases/removals/deletions
  as separate verified steps. Both branches deleted after merge.
- check.js --quick NOT re-run: zero src/js, zero green-list files (one
  additive panel-registry line only, zero behavior change to existing
  entries).
- Sibling Loop A 1742Z run (heraldarr2 + muster3) still active at closeout;
  its trees untouched, its claim untouched.

## Metric review

- Falsefire: the settled 10-evening recovery test has no noise margin —
  51316's +5 kcal bounce counts as a recovery, then the pantry re-slides
  to 15,700. A future deploy claim should decide a margin (e.g. recovery
  must exceed the warning level by more than trivial noise, or hold for
  more than one evening) in its own prereg. Censored trues (windows cut by
  the 30d horizon) are excluded from the judged rate per prereg — the
  pooled 22.2% pass leans on that exclusion, and the pilot's own 1/1
  judged rate is the honest fresh-band warning.
- Patchrot: the prereg pair did its job — a single-leg story (failed
  share halved) would have read as a win, while the haul leg shows the
  extra trips go to thinner ground. Rule-fresh vs harvestable is the next
  distinction: the rotation penalty keys on visit recency, not on whether
  cells on the tile are actually harvestable. A fertility-signal or
  success-anchored rotation must pre-register how it observes
  harvestability without a magic list (policy-side observation only).
- Program-wide: collapse supply is now n=2 (51101, 51608) and the second
  collapse was never warned — gate coverage (when the gate stands down
  and never re-engages during a slide) is now the binding instrument
  problem, ahead of further scoring refinements.

food-economy stays converging (NOT converged): the sensor program now has
a settled false-fire definition, but the sensor is still not deployable
(fresh-band sensitivity and judged rate both fail); the haul ceiling's
second follow-up lever is killed at pilot (rotation halves failed-trip
share but lowers daily haul — extra trips go to thinner ground). No
default has flipped, no game change landed, no wall movement shown.
scale-onramp untouched (sibling Loop A lane).

Next blanks, in order: (1) HUNGER WINTER relief passivity (steve-call
candidate — still needs a ruling before any work); (2) dipslide gate
coverage — 51608 collapse never warned (gate stood down day 12, never
re-engaged, pantry 9,483 -> 700); recovery-test noise margin for the
settled definition (51316 +5 kcal bounce); (3) shelling default-flip call
(is the proven habit to become default play, and on which trigger?);
(4) haul-size follow-ups in evidence order: route-blockage (gates
currently OFF — do not bundle), fertility-signal rotation,
success-anchored rotation; plus a re-scoped multi-sweep only with a
divergence-aware primary decided before the run; (5) P3 reset follow-ups
— night-22 +3,005 silent inflow bridge (still undocumented), double
endDays on vessel-death days; (6) patrol-departure narration;
(7) garden/fish/traps early path (marginal 2.8% combined — ripening /
assignment path, not yield numbers); (8) creek clearance wood-bound —
evening wood-carrying before any creek-clearing lever;
(9) rubble daytime-clearing habit unmeasured; (10) washed_out scramble
narration; (11) 96-tick bridge edge unobserved; (12) a 120d window only
if a new horizon-cut episode appears.

Claim deleted; lock deleted.
Merged locally, pending ship.
