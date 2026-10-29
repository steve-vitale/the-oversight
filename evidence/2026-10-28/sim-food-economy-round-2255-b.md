# Loop B round 2255Z — food-economy: nighttravel screened rerun (HELD) + creekpath diag (LANDED)

Run: fleshout-loop-b-20261028T2255Z. Axis: food-economy (converging).
Sibling loop A live on scale-onramp throughout (2236Z claim: tileparty +
sortiedpr) — NOT touched. Loop A landed mid-run (coordinator evidence
d9affc3d3: sortiedpr DIAG-GO merged, tileparty PILOT NO-GO held unmerged).

## Arm 1 — sim-nighttravel-screened-b: INSUFFICIENT-DATA, HELD UNMERGED

Held branch sim-nighttravel-b (worktree ~/workspace/worktrees/sim-nighttravel-b,
registered, fresh heartbeat, clean). NOT merged as a landed lever — verdict is
insufficient-data, not a pass. This follows the 2224Z precedent: the branch
keeps accumulating for the next B run.

What was done, in the mandated order:
(a) G3 landing-check fix, committed BEFORE any judged run (1346ae47): the
landing check now judges only hops that MOVED; refused hops are verified by
arrival == departure and never count as landing failures. Validated
instrument-only on the 2224Z corpus (its verdict stands, not re-judged):
6 creek refusals no longer flag G3; rerun proof R1–R11 green; legacy proof
T1–T9 green (T3 fixed, T8 made conditional); 2126Z regression primary 2/2.
Policy, driver, substrate untouched; zero src/js.
(b) Preregistration + reaching-seed strategy, committed BEFORE the scan
(c6f9ade5 + scripts/analyze-nighttravel-scan-b.js): primary within-reach
conversion M1r >= 0.50, minimum-n >= 8, guards G1/G2/G3-fixed. Screening rule
(declared, never outcome-touching): control-only scan, qualifier = >= 2
near-home away evenings (preStep away, evening-end coords within d <= 3 of
the villager's OWN haven (4,4) — the travelTargets() envelope); qualifier
order = nearHomeAway desc, seed asc. The scan analyzer refuses non-control
input mechanically, so selection cannot touch conversion. Perception law
stated in the prereg: home is the villager's own haven, known through
lived-in knowledge + engine-offered targets only — no roster/crew/snapshot.
(c) Staged judged run (scan 21b4dd38, evidence e244632c): scan of 192 control
seeds (10800–10991) banked 14 qualifiers (7.3%). Per the prereg's 8–15
branch: pilot = first 8, extension = remaining 6, NO confirm band exists.
Pilot withinReach 2/2; extension 5/5; pooled (14 seeds, 420 evenings/leg)
withinReach 7/7 = 1.00, but n = 7 < minimum-n 8 — ONE evening short. Min-n
binds even at a perfect rate: INSUFFICIENT-DATA, not GO, not NO-GO. No
confirm spent. Pooled composition: expedition 26, blockedPath 62
(fallen_tree 32, washed_out 23, rubble 7), blockedGuard 8, havenUnknown 0,
unclassified 0, away 103. Streaks 7/23 broken. WithinReach tap days 2/2 by
position. Guards: G1 median 30 vs 30, G2 starvation 2 vs 2, G3-fixed 0
violations (legacy raw-false count 62 — under the old check this corpus
false-fails G3 62 times; refused hops 62/62 verified). Legacy pooled M1
7/95 = 0.074 reported for comparability only. Costs on all 7 conversions:
hop 0 kcal / 0 ticks; entry walks -8/-10 kcal, 4–5 ticks; distances d1 x3,
d2 x2, d3 x2. Proofs on the pooled corpus, both PROOF-GREEN: rerun proof
R1–R11 and legacy proof T1–T9, with real sense anchors on all 7 conversions.

Sense-testing (read end-to-end): all 7 travelled-home evenings read as
played evenings, not teleports ("You walk back into Haven… The village is
glad to see you", "Walking 4 squares (8 kcal)…", "You step into the Haven
hall"; 10953: "You come home after 2 days. The smell of the cookfire does
something to your chest…"). Blocked-path evenings narrate honestly ("The
path is washed out."). Expedition evenings read as the honest single-hop
boundary. Villagers act like people (assignments reporting back, solo
monster kills, maulings, gossip drift across retellings, language barriers
played through mime).

Key finding for the next run: the screen enriched away evenings ~15x over
2224Z's blind band (103 vs 7) but revealed the composition — 60% of away
evenings are blocked paths, and within-reach is only 7% of away evenings
even on away-prone seeds (7/103, ~0.5 per screened seed). The next run must
bank 24+ qualifiers (wider scan, same rule — never a sharper
outcome-touching screen) so pilot + extension + confirm can all stage. The
daytime crossing fix class for the 62 blocked-path evenings is the dominant
night-travel-adjacent blank. Tap lifts remain confounded (position
conversions 2/2, but lifts answer 'other-refusal' on the carried ownership
confound; one kcal-floor button refusal) — not claimed as fixed.

Coordinator verification of the held branch: worktree clean; own commits
touch only analyzer/test/prereg/evidence/corpus files (no src/js, no
nighttravel policy, no creekpath files); evidence + prereg + pooled corpora
present. No balance-panel compare .md, as pre-registered (policy-side arm:
no game-root delta to compare; panel registry policies don't include the
trace policies).

Wall (this arm's judged corpus, 30d — scale metrics not observable, not
zero): national 0, table 0, wins 0; wave reach control all 14 at wave 2,
policy 1 at wave 1, 12 at wave 2, 1 at wave 3; waves 4–5: 0; median survival
30 vs 30.

## Arm 2 — sim-creekpath-b: DIAG-GO, fix NO-GO at confirm, LANDED as measurement

Merged locally, pending ship: prereg 028a37756 + evidence d5581ca97
(cherry-pick equivalents of worker commits 19d924e5f / 63829b6cb; original
branch retired after a worker-file tree-equality check). Proof PROOF-GREEN
(9/9) post-rebase and on merged master. No src/js changes; no sibling-owned
files touched; the route-around policy file was deleted, not committed
(killed arm leaves no trace).

Diag answers:
1. block:creek is an INTERMEDIATE tile, not the destination or an edge:
on seed 10757 the (3,3)->(4,4) hop is refused by creek tile (3,4)
(needsBridge, no swimmer, no bridge), while the (4,3) detour is open and
the same length. travelTo refuses when ANY shortest-path intermediate is
blocked — it never tries the other shortest path. A creek is
crossable-with-cost (bridge 4 wood / swim / go-around), not permanent
terrain.
2. Daytime faces the SAME block — travelBlockage is time-agnostic.
Evening hops only observe the strand; daytime trips create it.
3. Default competent cannot route around (walkTo stops dead at the first
refusal); with COMPETENT_ROUTE_AROUND=1 it can, via shipped routeAround
code.
4. Census (24 before-leg seeds, 30d): 23 refused evenings, all
intermediate-leg — creek 14, rubble 5, washed_out 4. Route-around existed
for 23/23; crossing-fix feasible for only 9/23 (every creek refusal had
wood 0, no swimmer — the route is the only alternative for creeks).
Strands run 2–8 evenings at one tile.

Fix Arm A (competent + daytime route-around on trip-home walks): pilot GO
(stranded evenings 9 -> 3, bar <= 4) but confirm NO-GO (14 -> 11, bar <= 7
— only a 21% cut). Killed per its bar. Why it half-works (transcript-read):
trip returns use direct Game.travelTo(haven), not walkTo, so route-around
never engages (day 25 ends with "The creek runs fast here" as the last
line); some days never attempt a trip home at all (day 26: no travel).
Route-around also re-routes whole days (10767: deaths 28 -> 4, one
8-evening strand -> 3 shorter strands), so pooled counts are confounded
by trajectory divergence. Guards (confirm): starvation deaths 8 -> 7,
player deaths 17 -> 14, perception-lawful only (own tile, home haven,
engine-offered adjacent steps). No guard violation — the failure is the
primary alone.

Substrate discovery (prereg deviation, disclosed): the reported strand
did NOT reproduce under plain competent or insideevening — both end every
evening at home. It reproduced exactly (10757 days 25–30 at (3,3)) only
with the nighttravel corpus driver's thief-ability grant. The census
therefore ran under competent + thief grant; metric and bars unchanged,
ungranted negative control committed beside it. Next blocked-path preregs
must name the grant.

Sense-testing: the strand is silent from the villager's side (refusal
line, then no reaction or plan across 6 nights — a one-line blank for the
next arm); surrounding village life is coherent (Dina miming across the
Russian gap, garden work, mutating fireside gossip). 10770's hop-clear away
evenings prove away != stranded, and the probe keeps them separate.

Wall (30d horizon — scale metrics out of reach by construction):
national / table / wins = NOT MEASURED (not zero). Wave reach max 2,
median survival 30 days (two village-lost ends at 28/22 days in confirm),
deaths dominated by villager combat, pilot starvation 0. Panel limitation,
stated honestly: no balance-panel.js compare is attached — the panel's
contract metrics don't include stranded evenings; guard metrics are
reported from the corpora instead.

## Village assessment (plain words)

The village's evenings are mostly fine — people come home, work the
garden, gossip, and tell each other what happened. The breakage is narrow
and specific: a villager stuck two squares from home behind a creek (or a
fallen tree, or a washed-out path) gets the same refusal every night and
never forms a plan about it — no detour, no bridge, no complaint beyond
the one line. The night-travel lever itself works whenever it actually
gets a fair try (7 out of 7 within-reach evenings came home, cheaply),
but fair tries are rare: on evenings spent away, most of the time the
path itself is blocked, not the hour. So the next work is not a better
evening lever — it is daytime roadwork (a way around, or across, the
blockage) plus a bigger screened seed bank so the evening lever can
finally be judged on a full sample.

## Telemetry deviation check

Creekpath confirm corpus (creekpath leg, n=16) and nighttravel screened
pooled corpus (nighttravel leg, n=14): 3 LOUD lines each (national 12->0,
table 16->0, wins 16->0), all the KNOWN field-shape + regime artifact
class (30-day pre-seat competent substrates vs the WINSEAT baseline);
no exiled LOUD line. Baseline NOT rolled, no investigation item.

## Metric review

Nighttravel: min-n binds at 7/8 — the prereg's minimum-n rule did exactly
what it was written to do (a perfect rate on 7 evenings is not a verdict).
No metric re-scoring: the pooled 7/7 is reported as insufficient-data,
and the next prereg must carry the 24+ qualifier bank, not a lowered bar.
Creekpath: the pooled-evening bar was confounded by trajectory divergence
(whole-day re-routing changes which evenings exist); the designed Arm B
prereg must carry a per-seed strand-length guard alongside the pooled bar.
No other metric is contested this run.

## Infrastructure (loud, with the recovery)

- Master moved three times under the creekpath landing (ship bump
cb30d8f98, sortiedpr 19f667bf7, loop-A coordinator evidence d9affc3d3).
The first merge attempt failed ff-only correctly; the chained release
step then ran unconditionally and wrongly marked sim-creekpath-b
done-merged while its branch was unmerged and its worktree directory was
removed. Recovery (sanctioned path only): registered landing tree
sim-creekpath-land from current master, cherry-picked the two worker
commits (zero file overlap with sortiedpr confirmed, shared base
cb30d8f98), verified the worker-file tree identical, re-ran proof green,
then rebased + merged in one tight window (d5581ca97, ancestor verified,
tree clean). Release + branch deletions happened ONLY after verified
merge success. The original branch is retired; its content is on master
via the cherry-pick equivalents. Lesson carried: never chain release
after merge — release only on a separately verified merge.
- Safe-commit index clobber hit both workers' commits (repaired via
HEAD-blob cacheinfo each time, commits verified correct) and the
creekpath worker's heartbeat hit registry-lock contention twice
(read-back verified the heartbeat landed).
- No EPERM flap blocked this run. check.js --quick NOT re-run: zero
src/js in any landed or held commit this run.

## Blanks filled / documented

Filled (landed): creek blocked-path diagnosis + route-around census +
killed Arm A, with Arm B designed (below). Documented (held): nighttravel
G3 fix + screened rerun (INSUFFICIENT-DATA) on held branch
sim-nighttravel-b; daytime-crossing fix class for 62 blocked-path
evenings; silent-strand narration blank (one line).

Backlog maintenance (sim-findings.md, this run): marked the 2224Z
"nighttravel next run needs G3 fix + reaching seed strategy" entry fixed
(both prerequisites delivered on the held branch); appended [open]
nighttravel 24+ qualifier bank + blocked-path dominance entries. The
creekpath worker's own Arm B entry stands (not duplicated).

food-economy stays converging (NOT converged): the evening lever is
proven only 7/7 with n=7<8, the blocked-path diagnosis is landed but its
fix is killed at confirm, and no food-economy change in this run touches
the scale wall. scale-onramp stays converging (untouched; sibling loop A
lane). Claim deleted; lock deleted.
Evidence: evidence/2026-10-28/sim-food-economy-round-2255-b.md
(coordinator) + sim-creekpath-b.md (on master) +
sim-nighttravel-screened-b.md (held branch sim-nighttravel-b, NOT on
master).

Next blanks, in order: (1) NIGHTTRAVEL 24+ QUALIFIER BANK — wider scan,
same control-only away-presence rule (never outcome-touching), pilot +
extension + confirm all staged; adopt held branch sim-nighttravel-b
(G3 fix + prereg + scan analyzer already on it). (2) CREEKPATH ARM B —
route-around-aware trip returns: replace direct travelTo(haven)
home-returns in competent trip functions (starting forageTripSeedFirst)
with the walkTo home walk; metric stranded evenings <= 50% of before on
identical seeds + per-seed strand-length guard; pilot 10750–10757 /
confirm 10758–10773, thief-grant substrate named in prereg, 30d
death-aware. (3) Hall shelter — ONLY after Steve's call (unchanged, still
gated). (4) "Eyes on your bedroll" wording tune (string only,
needs-eyes). (5) Silent-strand narration line (villager reacts/plans
after a refused hop home).
