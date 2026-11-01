# Loop B round 1725Z — food-economy: dipslide tolerance GO + multisweep pilot NO-GO
Run: fleshout-loop-b-20261101T1725Z. Axis: food-economy (converging).
Sibling Loop A live on scale-onramp for the whole run (1706Z claim at run
start, then a new 1742Z claim mid-landing: heraldarr2 + muster3, NOT touched).
No B lock at run start; claim written before any sims. Pre-flight: main tree
clean, disk 20%.

Arms take the 1543Z closeout's next blanks (2) dipslide tolerance design and
(4) haul-size follow-up second-trip/multi-sweep, in order. Blank (1) HUNGER
WINTER relief passivity skipped again as a steve-call candidate needing a
ruling first; blank (3) shelling default-flip call remains a call, not a sim arm.

## Arm 1 — sim-dipslide3-b: tolerance-design sensor, pilot GO + confirm GO (DIAG only)

Worker commits 9e987f519 (prereg, committed BEFORE any judged sweep),
9577edbb3 (analyzer + proof), 6e09c7104 (closeout). Rebased onto
Loop-A-landed master clean (3 commits, no stop-at-pick quirk this time);
proof re-run green post-rebase 34/34; merged --ff-only as 53a75258e.
Tree released, branch deleted.

Rule (single, pre-registered): recovery = EITHER a margin breach (any window
evening >=105% of candidate level) OR sustained at-level (two consecutive
evenings >= candidate level). A single sub-5% evening wiggle, undone the next
evening, is forgiven. Endpoint must still end below candidate level.
Candidate/eligibility/final-run counting unchanged from dipslide2.

Results judged against the prereg (verbatim bars):
- Pilot (51311–51318, 30d competent, depositgate-armed): GO-1 PASS 5/8
  confirm (51312, 51314, 51315, 51316, 51318) vs >=3 bar; GO-2 PASS zero
  hairline-only confirmations. Pilot GO.
- Confirm (51319–51330, freshness re-verified by seed-field scan immediately
  before the sweep): c3-1 PASS 5/12 confirm (51319, 51320, 51324, 51326,
  51328) vs >=4 bar; c3-2 PASS zero hairline-only. Confirm GO.
- Combined: 10/20 confirm, 0 hairline-only. Every first-confirmation window
  is a clean fall (or below-level wiggle only). The tolerance rule's restored
  set (later candidates confirming under tolerance but not dipslide2: 51315
  [10,15], 51320 [11], 51324 [9], 51326 [23], 51328 [19]) never carries a
  verdict. Rejected-by-tolerance set is empty on all 20 seeds — tolerance is
  a pure relaxation of dipslide2's rule, proven by inclusion.
- Calibration (not judged, after prereg commit): on the dipslide2 pilot
  corpus the rule restores exactly one confirmation — 51308, flagged
  hairline-only — and nothing else.

Reported, NOT gated (prereg tension, stated before judging): false-fire rate
(dipslide2 definition: confirmed fire on a survived seed) is 62.5% pilot /
41.7% confirm — above dipslide2's 25% cap, because all 20 seeds survived.
This GO means tolerance restores firing without resting on hairline shapes;
it does NOT mean the sensor is deployable. Metric review flags the program's
open question: whether "survived slide" should count as a false alarm at all.
Panel §15 inapplicability declared (same reasoning as prior arms — DIAG
instrument comparison, no game-code change, no lever); no compare fabricated.

Wall (in-window, 30d limit stated): 20/20 survived 30 days (median 30,
max 30); collapses 0/20; wave max 2 (18/20 reach wave 2; wave 1 only on 51317,
51325); waves 3–5, Arc II/III/IV, regional→national, table, win flag not
reachable in this window, not claimed. Collapse earliness UNJUDGED again
(program-wide collapse supply still n=1).

Sense test: on every confirming evening the voice still says "shelves are
full, ~N days of fresh on hand" while the total store slides (sharpest:
51326 day 24, total 6,396 kcal, "~5 days of fresh") — the level-vs-stock gap
persists. Transcripts read like people (paired outings, self-correcting
teaching on 51319 day 13). "Pot stays full" line: 0/20, recorded only.

Evidence: evidence/2026-11-01/sim-dipslide3-b-prereg.md,
sim-dipslide3-b.md, sim-dipslide3-b-pilot-armed.jsonl,
sim-dipslide3-b-confirm-armed.jsonl, sim-dipslide3-b-corpus/*.json.
Analyzer scripts/analyze-dipslide3-b.js; proof scripts/test-dipslide3-b.js.
Seeds 51311–51330 now consumed; 51331+ remain fresh but unverified for any
specific band until a future arm checks.

## Arm 2 — sim-multisweep-b: second-trip/multi-sweep policy, pilot NO-GO

Worker commits a7a99fbc8 (prereg + variant skeletons, committed BEFORE any
judged sim), aa7776273 (pilot evidence). Rebased onto Loop-A-landed master
clean; proof re-run green post-rebase 6/6 pure; merged --ff-only as
8ce533b51. Tree released, branch deleted.

Variant (frozen rule, NEW policy file scripts/policies/competent-multisweep-b.js,
default-OFF, zero src/js, zero edits to competent.js): after baseline
competent.daily, if the scholar is alive, at the haven, and the base daily
had >=1 successful forage: up to 2 extra forageTripSeedFirst calls (<=3
sweeps/day), guarded by alive/at-haven/pack <95%/no fight, stopping after a
0-return trip or pack >=95%. Extra trips run after the base daily's
sort/donate/eat — a genuine second outing from home. One additive
panel-registry line in scripts/sweep-compare.js (leanlink/spearfund
precedent; zero behavior change to existing entries).

Pilot judged against the prereg (verbatim bar): fresh seeds 51801–51808
(freshness verified; 517 band abandoned after 51711 turned up in older
files), 30d, competent, DEPOSITGATE=0, identical seeds both arms. Primary =
pooled mean finished-pack value on successful-trip days (day's final live
return). GO required armed >=1.25x baseline AND cost bar clean.

| | Baseline | Armed |
|---|---|---|
| Primary, pooled mean finished | 887.5 kcal (n=110 days) | 738.1 kcal (n=94 days) |
| Ratio vs 1.25 bar | — | 0.832 — MISS |
| Starvation deaths (bar <= baseline+1) | 1 | 1 (delta 0, clean) |
| Median survival (bar >=0.8x) | 30 | 30 (ratio 1.0, clean) |
| POLICY_ONE_TRIP / multi-sweep share | 1.000 / 0.000 | 0.619 / 0.381 |
| Mean daily haul (diagnostic) | 592.0 | 856.7 (+45%) |
| Mean final combined (diagnostic) | 1676.4 | 1000.9 |
| Failed-trip days / FAILED_WORKED_OUT share | 98 / 0.918 | 119 / 0.966 |
| Unload total | 157,435 | 147,090 |

Verdict: PILOT NO-GO. Cost bar clean does not rescue a primary miss (GO
requires both). No confirm run — confirm seeds 51821–51832 were reserved,
never run, and remain fresh. Armed primary higher on only 3/8 seeds. Second
outings genuinely happen (extra successes on 40 days) and daily haul rises,
but finished packs at returns do not grow, and failed days rise — the
depletion-feedback reading (extra sweeps pick more cells clean against
~2-day regrow) is flagged as hypothesis only, not a claim. Proof:
scripts/test-multisweep-b.js, pure 6/6 green; live modes on non-judged
seed 51809 only (control + determinism green, instrument proof only, does
not soften the verdict).

Panel §15 (honest limitation, nothing fabricated): formal balance-panel.js
compare (baseline-only panel vs armed-only panel) returns decision
"invalid" — errors "Unmatched policies" / "Unmatched cases". The compare
tool matches cases by policy id, so a new-policy arm can never match across
single-policy panels. That compare .md is attached as the record. Valid
instrument shape: one COMBINED panel (both policies, same source/seeds/days,
16 cases, sourcesStable true, neutrality matched, zero warnings): national 0,
table 0, won 0 both arms; panel survival30 mean 0.571 baseline vs 0.429
armed and player/village deaths 3/55 vs 8/87 — panel survival/death
definitions differ from the driver's judged cost bar, so these are
context/flag, not verdict. Next arm should pre-declare the combined panel
as the instrument.

In-window wall numbers: 8/8 survived 30 loopDays both arms, wave max 2,
collapses 0, national/table/wins 0 (not measurable in a 30d pre-seat window).

Sense test: 51801 loopDay 3 reads as a person going back out (worked-out
patch → step to another patch → pays), but NOTHING marks a second outing as
a second outing — no "head back out" line; behaviorally real, narratively
invisible. (Appended to the findings backlog by the coordinator.)

Evidence: evidence/2026-11-01/sim-multisweep-b-prereg.md,
sim-multisweep-b.md, sim-multisweep-b-pilot-baseline.jsonl,
sim-multisweep-b-pilot-armed.jsonl, sim-multisweep-b-pilot-analysis.json,
sim-multisweep-b-corpus-51801-day3.txt, sim-multisweep-b-panel-compare.md.

## Wall (this run's judged corpora — 30d pre-seat windows, not a win-seeking run)

Full seat 0 / wave 5 reached 0 stand as last measured (Loop A lane).
In-window: dipslide 20/20 survived 30d, wave max 2, collapses 0; multisweep
16/16 survived 30d (both arms), wave max 2, collapses 0. No wall movement
shown or claimed.

## Telemetry deviation check (coordinator, post-merge)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-01/sim-multisweep-b-pilot-armed.jsonl' --metrics
national,table,wins,exiled` → LOUD parse refusal by the tool itself:
"could not parse ... Unexpected non-whitespace character after JSON at
position 799295 (line 2 column 1)". Same input-format limitation precedent
as 1543Z/1430Z (tool expects a single JSON document; multi-line jsonl fails
at line 2) — NOT a deviation, no investigation item, baseline NOT rolled.

## Infrastructure

- No EPERM write flap this run (contrast 1543Z's ~16:20–17:15Z flap).
- Safe-commit index clobber (known class) hit all worker commits (both
  arms); each repaired via --add --cacheinfo from HEAD blobs, commits
  verified correct. Coordinator evidence commit: see commit note for
  clobber check.
- MERGE DISCIPLINE honored: each arm merged --ff-only ALONE and verified
  before any release step; releases/removals/deletions as separate verified
  steps. Both arms rebased clean onto Loop-A-landed master (no conflicts,
  no file overlap with A's heraldarr/stay work).
- check.js --quick NOT re-run: zero src/js, zero green-list files
  (one additive panel-registry line only, zero behavior change to existing
  entries); standing pre-existing profile untouched.
- Loop A 1706Z run landed mid-run (coordinator evidence b33a9a9a4); its
  1742Z run (heraldarr2 + muster3) started mid-landing and was NOT touched.

## Metric review

- Dipslide: the tolerance GO rests on the prereg's confirmed-recovery
  definition, while the false-fire definition (survived slide = false
  alarm?) is now the program's open question — a future arm must settle
  that definition before any deploy claim, and must also close the
  hairline-only gap (two separated sub-5% evenings confirm unflagged).
  Collapse earliness stays unjudged for lack of collapse supply (n=1).
- Multisweep: the primary (finished-pack value at return) and the
  diagnostic (daily haul) disagree in direction — the arm's own review
  notes a re-scoped arm needs a divergence-aware primary and a
  finished-vs-sorted definition decided BEFORE the run, not a re-run of
  this prereg. Panel instrument lesson: new-policy arms must pre-declare
  a combined panel, since single-policy panels can never match.

food-economy stays converging (NOT converged): the sensor program now has
a tolerance rule that fires without resting on hairline shapes, but the
false-fire definition is unsettled and the sensor is not deployable; the
haul ceiling's first follow-up lever is killed at pilot (second outings
happen, finished packs do not grow). No default has flipped, no game change
landed, no wall movement shown. scale-onramp untouched (sibling Loop A lane).

Next blanks, in order: (1) HUNGER WINTER relief passivity (steve-call
candidate — still needs a ruling before any work); (2) dipslide
false-fire-definition settlement + hairline-only gap (two separated
sub-5% evenings) — new prereg, no deploy claim until settled; (3) shelling
default-flip call (is the proven habit to become default play, and on which
trigger?); (4) haul-size follow-ups in evidence order: regrow/patch-rotation,
then route-blockage (gates currently OFF — do not bundle), plus a re-scoped
multi-sweep only with a divergence-aware primary decided before the run;
(5) P3 reset follow-ups — night-22 +3,005 silent inflow bridge (still
undocumented), double endDays on vessel-death days; (6) patrol-departure
narration; (7) garden/fish/traps early path (marginal 2.8% combined —
ripening / assignment path, not yield numbers); (8) creek clearance
wood-bound — evening wood-carrying before any creek-clearing lever;
(9) rubble daytime-clearing habit unmeasured; (10) washed_out scramble
narration; (11) 96-tick bridge edge unobserved; (12) a 120d window only if
a new horizon-cut episode appears.

Claim deleted; lock deleted.
Merged locally, pending ship.
