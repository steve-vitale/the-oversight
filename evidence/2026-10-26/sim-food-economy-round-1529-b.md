# Loop B round — food-economy — 2026-10-26T1529Z (coordinator evidence)

Run: fleshout-loop-b-20261026T1529Z, axis food-economy (second non-converged
axis; scale-onramp untouched — loop A live on sim-eggroad-a during this run,
NOT touched). Takes the 1438Z run's named next blanks in order: (1) land the
blocked inflowtrail arm as repo evidence + scripts, (2) run the garden-state
sweep. No live lock or claim at run start (both loops free at 15:29Z; loop A's
eggroad tree appeared mid-run and was left alone).

Pre-registration: both arms pre-registered before their work — inflowtrail's
bar comes verbatim from the 1438Z brief (median daysSinceLastInflow ≤ 7 → GO);
gardenstate's bar from its own pre-registration file (one mechanism ≥ 95% of
seed-days, else NO-GO). Neither verdict was re-scored mid-run.

## Arm 1 — sim-inflowtrail-b-land (commit a7701e6d2, merged --ff-only)

LANDING of the 1438Z analysis (DIAG-GO, analysis only, zero src/js). The
branch started at the stray 1438Z tip 86deaa04e with zero unique commits; the
worker fast-forward-merged master to be3a588c2 first, so the commit's parent
is be3a588c2 and the merge was clean.

Reproduction EXACT (proof scripts/test-inflowtrail-b.py, 10/10 assertions,
GREEN on the worker tree and re-run GREEN on the rebased garden tree):
neutrality 327 bound days / 289 attributed / 38 unattributed (reproduces
inflow-b exactly), median daysSinceLastInflow = 1.0 (bar ≤ 7 → GO),
distribution 1×32 / 2×4 / 3×1 / 4×1, zero no-prior-inflow days, full 38-row
table identical to the 1438Z RESULT.md table.

One caveat, documented in the arm evidence: the 1438Z run's saved
inflowtrail-result.json in the goal hidden_files dir is 0 bytes (an
EPERM-flap write casualty from that run), so exactness was verified against
the RESULT.md prose + table, not that JSON. Nothing was adjusted to force a
match. Analyzer logic identical to the 1438Z original apart from corpus-path
lines.

Verdict carried unchanged (NOT re-judged): the inflow-b gap is a
same-day-window artifact — racks are smoked from yesterday's pantry (forage
+ scholar deposits + contest winnings put away), not from ancient stock.
Wall carried from 1438Z (SEATDRIVE=0 band): national/table/wins 0/8,
wave-4/5 0/8, median 100d.

Files: evidence/2026-10-26/sim-inflowtrail-b.md, scripts/analyze-inflowtrail.py,
scripts/test-inflowtrail-b.py (a .py proof, justified in the evidence: the
analyzer is Python, so a .js wrapper would only shell out to it).

## Arm 2 — sim-gardenstate-b (commit 786b3da20, rebased to 93357be27, merged --ff-only)

DIAG sweep answering why the garden never stocks the pantry. Band: same as
inflow-b for comparability — competent-nofeast, seeds 9750–9757, 100d,
SEATDRIVE=0. Fresh 8-seed sweep, all 8 seeds completed, per-seed JSONs
persisted as each seed finished. Analyzer scripts/analyze-gardenstate-b.js
reproduces the counts below from the corpus (re-run by the coordinator on
the rebased tree: identical).

Verdict vs pre-registered bar: NO-GO (mechanism unclear, as the bar is
written). No single mechanism reaches ≥ 95% of seed-days. But the bar's
failure is a bar artifact, not a mystery — (a)+(b)+(d) = 100% of seed-days:

| class | seed-days (of 745) | share |
|---|---|---|
| (d) garden food via a non-'Garden harvest' door | 42 | 5.6% |
| H stockPantry 'Garden harvest' kcal > 0 | 0 | 0.0% |
| (e) no garden-duty signal ever | 0 | 0.0% |
| (a) planted == 0 | 216 | 29.0% |
| (b) planted > 0, ripe == 0 | 487 | 65.4% |
| (c) ripe > 0, no harvest | 0 | 0.0% |

The causal chain, all counted:
1. (e) is REFUTED — garden duty exists: keeper set day 2 in every seed
   (257 keeperSets, 2,948 keeper turns, 690 garden resolutions). Nuance: the
   competent policy never calls assignTask('garden') (0 calls) — duty flows
   through the standing-keeper mechanism, not task assignment. That is a
   policy-shape finding, not a game-code bug.
2. The production throttle redirects 89.3% of NPC garden work (616/690
   resolutions entered throttle-engaged; the branch tends beds but never
   sows or harvests).
3. Every unthrottled resolution sows, none harvests — unthrottled count
   equals NPC sow count exactly on every seed. Ripeness and throttle-off
   never coincide for NPC duty.
4. Ripening outruns the horizon without player magic (burdock 90d,
   sumac/woody 730d, shoots 30d). The only fast ripening seen came from
   daily player Green Thumb/Whisper coaxing.
5. (d) is the ONLY pantry route: all 73 garden-origin pantry records
   arrived via the deposit door (player harvest → pack → donation: Burdock
   on 9752, Muscadine Grapes on 9757, Hawthorn on 9756), never via NPC
   stock. Inflow 'Garden harvest' records: 0 — confirming inflow-b's zero
   through a second instrument.
6. Zero seed-days in 745 ever had a ripe crop standing at the end-of-day
   snapshot for NPC duty to harvest.

Sense: the planted-day transcript exists (9750 day 24: "You sow Common
Plantain: 30 days to first harvest..."), but ripeDay and harvestDay are
both null — the nulls ARE the finding. No NPC garden harvest was ever
available to narrate.

Wall (this band, band facts not arm findings): national 0/8, table 0,
wins 0, wave-4/5 reach 0/8, median survival 100d (survivals 48, 97, 100×6;
village-lost days 48, 97).

Files: evidence/2026-10-26/sim-gardenstate-b.md,
evidence/2026-10-26/sim-gardenstate-b-PRE-REGISTRATION.md,
evidence/2026-10-26/sim-gardenstate-b-corpus/ (8 per-seed JSONs),
scripts/sweep-gardenstate-b.js, scripts/garden-capture.js,
scripts/analyze-gardenstate-b.js.

## Village assessment (plain words)

The village in these bands eats well but gardens in name only. The pantry
is full — scholars haul plants home, hunters and contest prizes pour in —
so the racks smoke yesterday's food and nobody goes hungry. The garden
keeper shows up every day and tends the beds, but the village's own rule
("we have plenty, don't grow more") sends that work sideways on nearly
nine days in ten, and on the rare day the rule lifts, the keeper only
plants — the crops take a month to two years to ripen, far longer than the
season the sim watches, so nothing ever comes back out. The only garden
food that ever reaches the pantry is food the player picks with their own
hands (sometimes hurried along with a bit of magic) and donates. In short:
the garden is a player toy, not a village food source — and that is now
measured, not guessed.

Who thrived and who died: 6 of 8 garden-band villages survived to day 100;
9751 was lost day 48 and 9754 day 97 (village-lost, not garden-caused —
food was plentiful on this band). No starvation story attaches to the
garden on this band; the blank filled is a production story, not a hunger
story.

## Metric review (§14 — binding for the NEXT run, not a re-score)

- Gardenstate: the single-mechanism ≥ 95% bar is the wrong shape for a
  phased process — (a) dominates early days, (b) later days. Next garden
  arm must pre-register a combined "(a)+(b) = no ripe crop available to
  NPC duty" bar at ≥ 95% PLUS a pre/post-first-sow phase split, before
  sweeping. Do NOT re-judge this corpus against a revised bar.
- Inflowtrail: no metric change — the pre-registered median bar decided
  cleanly, and the landing reproduced it exactly.
- Whether the throttle's sow/harvest-blind garden branch is intended design
  (keepers tend but never reap) is left as Steve's call — the DIAG arm
  makes no design ruling.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-26/sim-gardenstate-b-corpus/*.json' --metrics
national,table,wins,exiled`: 3 LOUD lines (national 12 → 0, table 16 → 0,
wins 16 → 0) — the known artifact class: SEATDRIVE=0 measurement band
with no seat instruments, recorder rows carrying nationalEver/won rather
than top-level national/wins paths. Baseline NOT rolled, no investigation
item. Balanced panel NOT attached (cannot ingest recorder corpora; paired
identical-seed tables are the comparison of record, as in prior B runs).

## Infrastructure

- The 1438Z EPERM flap has CLEARED for git ref writes: both worktree
  registrations succeeded. Garden registration was slow (~7 min on
  `git worktree add`, sibling contention with live journey/loop-A trees),
  not failed.
- Safe-commit index clobber hit BOTH worker commits — repaired via
  HEAD-blob cacheinfo each time, commits verified correct, worktrees clean
  before release.
- Sibling journey-deepening r52 landed on top of this run's merges
  (88b8d7e32); both arm commits verified as ancestors of HEAD before the
  coordinator evidence commit. Zero file overlap.
- Loop A live on sim-eggroad-a through closeout — untouched, as was every
  other live tree. Reap left all uncommitted live trees alone (7/16 active
  at closeout).
- No check.js --quick re-run by the coordinator: zero src/js landed in
  either arm, and the standing 280/7 pre-existing profile was just recorded
  by sibling runs; attributable evidence is the arm proofs re-run on the
  merged base (inflowtrail GREEN, gardenstate counts identical).

## Convergence state

food-economy stays converging (NOT converged): inflow provenance is now
CLOSED on this band and landed in the repo, and the garden mechanism is
decomposed to named counts — but no food-economy game-code fix has landed
from either arm, and the scale wall is untouched by this axis.
scale-onramp stays converging (untouched; sibling loop A).

Next blanks, in order: (1) garden bar revision — (a)+(b) combined ≥ 95%
plus pre/post-first-sow phase split, pre-registered before sweeping;
(2) the preserve-scheduling question (why racks-bound days fall on
no-inflow days); (3) presence-aware share bar + next diversity arm (bar
fixed before sweeping); (4) plain-silenced indistinguishability;
(5) rule-R voice taxonomy rebuild; (6) scholar-donation visibility;
(7) throttle garden-branch intent — Steve's call.

Claim deleted; lock deleted. Merged locally, pending ship.
