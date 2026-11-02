# Loop B 0619Z round — food-economy: jump-faithful guard + stayhome recall (both PILOT NO-GO, branches HELD)

Run: fleshout-loop-b-20261102T0619Z. Sibling Loop A live on scale-onramp
the whole run (0605Z claim, then 0725Z claim) — NOT touched.
Axis: food-economy (converging). Pre-flight: main tree clean at
6d9dd7193, disk 27%, reap no-op (12/16 active). Claim written before
any sims. This file is the coordinator record; arm evidence lives on
the held branches (see below).

## Arm 1 — sim-jumpfaithful-b: PILOT NO-GO, branch HELD (not merged)

Successor to the 0459Z roadguard NO-GO (food-economy next blank 1).
Commits: f6321162c (prereg, before any judged sim), 345799b29
(build), e90db9717 (evidence + corpora + panel + diag).
Proof: scripts/test-jumpfaithful-b.js 32/32.

What was built: a return simulation that replays policy walkTo
exactly — travelTargets recomputed from the sim position in engine
order, min-Manhattan hop choice, up to 10 hops, each hop checked with
the engine's travelTo rule (destination blockage + intermediate-
blockage scan over every shortest-path tile/entry). Policy-side only:
zero src/js, zero competent.js edits, zero default flips. One
roadwork credit carried unchanged from roadguard.

Census (proven): live-engine battery, 7 hop cases + 6 full-walk
cases — false opens 0, false closes 0, 100% agreement between the
no-credit sim core and real walkTo/travelTo, including the 0459Z
root-cause shape (orthogonal path exists, d=3 jump refused by an
intermediate fallen tree). Credit-1 divergence verified as designed
(single rubble: sim ok with creditUsed 1, real walkTo fails).

Pilot (substrate identical to 0459Z: competent, 30d, DEPOSITGATE=0).
Screening spend disclosed: bands 61501–61508 and 61601–61608 both
QUIET (0 away day-ends; detector validated on 60307, which reproduces
the 0459 shape exactly — away days 5–10 at (2,0), death day 10).
Pilot band 61701–61708 qualifies via 61704 (away days 11–16 at (1,7),
sim fails all 6 days, strand-linked dehydration death day 16).
Banned bands not reused for judged work.

| Bar | Baseline | Armed | Verdict |
|---|---|---|---|
| PRIMARY prevented pocket-entries (≥2) | 1 episode (61704) | 0 episodes | 1 — FAIL |
| B1 away day-ends | 6 | 0 | PASS |
| B2 new-or-worsened | — | none | PASS |
| B4 failed-trip share (≤ baseline) | 0.217 (52/240) | 0.254 (61/240) | FAIL |
| B5 mean daily haul (≥0.95×) | 520.2 | 546.6 | PASS |
| B6 median survival / starv seeds | 30d / 0 | 30d / 0 | PASS |
| B7 false opens in the wild | — | 0 | PASS (reported) |

Zero-veto seeds byte-identical both legs. Roadwork credit uses 0
everywhere. Balanced panel (§15, context only): 16 cases, 0 reused,
neutrality matched both policies; per-seed outcomes identical both
legs (survived 8/8, wave 1–2, maxArc 3, national/table/wins/vests 0).
check.js --quick 284/6 in 772s — same counts as the pre-existing
pattern; failing names are godpath proof-freshness / establishment
tests, none of which read this arm's files (verified by grep).

The two findings that matter:
1. The guard genuinely prevents a true pocket with NO reroute. On
   61704 it vetoes the day-11 entry hop into (1,7); the scholar never
   leaves home ground again, no death (baseline: dehydration death
   day 16), haul 298→512. Diagnostic 60307 (disclosed reuse, not
   judged): the (2,0) pocket is prevented with NO (5,2) reroute
   death — where roadguard whack-a-moled, this guard holds (6 vetoes
   days 5–7, then silence).
2. But walkTo-home is the WRONG escape model — trace-proven. On
   61705 day 14 the guard vetoes (1,6)→(0,6), yet the baseline
   scholar visits (0,6) and comes home the same day by walking
   ONWARD: (0,6)→(2,7)→(2,8)→(2,5)→home. Trips escape laterally
   through subsequent picks, not by walking straight home. That veto
   is a CONFIRMED false close (full travelTo trace in
   scripts/jumpfaithful-b-diag61705.js), costing +4 failed-trip
   days. The analyzer's day-end-home false-close proxy over-counted
   after divergence (14 artifact entries on 61704 days 17–30, where
   the baseline successor never attempted the hop); fixed mid-run to
   an exact-hop-visited proxy keeping exactly the 1 confirmed case.
   B7 is report-only, so no judged bar changed. One line appended to
   hidden_files/sim-findings.md (lateral escape + veto-memory).

Village assessment (plain words): the village is a place where a
scholar can walk into a dead-end pocket and die of thirst while the
pantry sits full at home — and this guard, for the first time, can
see that pocket coming and stop it without shoving the scholar into
a second pocket. But it is also a guard that sometimes shouts "don't
go there" at a path the scholar would have walked out of sideways,
and on a quiet band that shouting costs more trips than it saves.
It does not land as-is.

## Arm 2 — sim-stayhome-b: PILOT NO-GO, branch HELD (not merged)

Standing go-home rule for staying-type stranding (food-economy next
blank 4; 61308 shape). Commits: cc2250cdd (prereg + policy + sweep +
analyzer + proof, before any judged sim), 46b946b64 (evidence +
corpora), cb4a60594 (§15 panels).
Proof: scripts/test-stayhome-b.js 47/47.

What was built: a policy-side standing go-home recall
(scripts/policies/competent-stayhome-b.js; zero src/js, zero
competent.js edits). A scholar away from camp who is starving is
recalled with an honest line naming trigger, nights away, kcal, and
outcome. The trigger is the proven half; the walk is the broken
half (see below).

Pilot (30d, competent vs competent-stayhome-b, identical seeds,
DEPOSITGATE=0). Band 61401–61408 — first fresh band screened,
qualifies immediately with 2 staying-type seeds (screening corpus
doubles as the pilot control leg, stated not hidden; banned bands
untouched).

| Bar | Baseline | Armed | Verdict |
|---|---|---|---|
| PRIMARY prevented staying-type deaths (≥2) | 2 qualifying seeds (61403, 61407) | 0 prevented | FAIL |
| New-or-worsened strandings (must be 0) | — | 0 | PASS |
| Median survival (≥0.8× control) | 30d | 30d | PASS — vacuous |
| Total starvation deaths (≤ control+2) | 5 | 5 | PASS — vacuous |
| Mean daily haul (≥0.8× control) | 7.68 | 7.68 | PASS — vacuous |
| Failed-trip share (≤ control) | 0.390 | 0.390 | PASS — vacuous |

Per-seed rows identical on every judged number. The armed leg banked
13 fires (61403: 3 starving fires days 15/16/18; 61407: 10 starving
fires days 5–10 + 13–16) and reached home 0 times (moved=false on
all 13). The no-harm passes are vacuous, not reassuring — trajectories
are identical because no walk ever moved a scholar; the next arm
must re-judge no-harm once walks succeed.

Mechanism, proven to the tile: 61403 direct jump (5,3)→(4,4) refused
with creek (tile (4,3) is an unbridged creek on a shortest path)
while a clean orthogonal path home exists via (5,4) meadow (the
scholar's own daily activity walks (5,3)→(5,4) successfully, and the
successor walks (5,4)→(4,4) on day 19). The recall picks the single
best target (home itself), tries the direct jump, gets refused, and
stops dead — it never steps to (5,4). 61407: same class, fallen_tree
intermediate side-blockage on (3,3)→(4,4), while steps
(3,3)→(2,3)→(2,2) succeed. This is the roadguard 0459Z root cause on
the staying line: the BFS qualifier is more permissive than the
return walk (steps vs one greedy jump). "Way home open" was true in
both cases — open for a stepping walk, closed for the jumping walk.

What the trigger got right (keep unchanged): starving trigger fired
days before the deaths (61403 day 15 at 98 kcal; 61407 day 5 at 426
kcal), honest lines, succession/fed/home/tent/leg-board guards
behaved. The next arm fixes ONLY the walk (route-around stepping
walk, or next-best-target fallback).

Other findings (coordinator appended to sim-findings.md at closeout;
worker appended nothing itself to avoid racing the coordinator):
- 61308 does NOT reproduce on current master (survived 30d, zero away
  day-ends) — base drift: titans.js +158 across sumdeploy landings
  shifted the RNG stream since 0459Z. Do not quote 61308 as current.
- Fresh qualified staying-type seeds: 61403 (days 13–18, kcal
  2370→0, player starvation death day 18, pantry ~30,000 kcal at home
  while the scholar sat at 0) and 61407 (days 4–16 at (3,3), two
  scholars in a row, dehydration death day 10 + "the wild" day 17).
  61402 correctly does NOT qualify (9 away nights but kcal rose —
  fed staying, not starving).
- Successor-clause correction: both seeds qualify via the death
  clause only; the "successor walks home" reading is unverified in
  this corpus (61403's successor is first observed already home —
  spawn-vs-walk undistinguished). Next prereg should drop or
  instrument that clause.
- Panel (§15, context only): single-policy panels + compare returned
  invalid (compare expects matched policies); correct construction is
  one both-policy campaign (16 cases, sources stable, neutrality
  matched both proof seeds) with byte-identical per-seed death maps
  across legs — independent confirmation the lever never engaged.
- check.js --quick 284/6 in 492s, same counts as the pre-existing
  pattern; causality checked (two measurement tests fail identically
  with pre-change sweep-compare.js restored), so no failure is caused
  by this arm.

Village assessment (plain words): the village watches its scholar
decide, honestly and days in advance, to turn for home while he
still can walk there — and then watches him try the same blocked
jump night after night, told about the creek, never stepping around
it, until he dies with a full pantry a short walk away. The deciding
is fixed. The walking is not.

## Telemetry deviation check

- Jumpfaithful corpus: LOUD parse line only — the KNOWN
  multi-line-jsonl limitation precedent from 0330Z/0459Z, not a
  deviation.
- Stayhome corpus: 3 LOUD lines (national 12→0, table/wins 16→0) —
  the known REGIME + field-shape artifact class (30d competent-only
  pre-seat window vs WINSEAT baseline, n=1 file).
Baseline NOT rolled, no investigation item.

## Wall numbers

UNCHANGED in kind (30d pre-seat windows): full seat 0 / wave 5
reached 0 stand as last measured (Loop A lane). In-window: both
pilots median 30/30, national / table / wins 0 both legs (expected
measurement profile, not a regression).

## Infrastructure

Container EPERM flap blocked the second worktree registration +
heartbeats ~20 min at run start (worktree add "Could not reset index
file", registry write PermissionError, branch delete packed-refs.new
EPERM); waited it out per precedent, NO ref surgery — orphan
sim-stayhome-b branch (== master tip, zero own commits) deleted clean
once writes cleared, registration retried clean, heartbeats fresh.
Safe-commit index clobber hit all worker commits on both arms
(repaired via HEAD-blob cacheinfo, commits verified correct, trees
clean). Held trees sim-jumpfaithful-b + sim-stayhome-b left in place
with fresh heartbeats for re-port (0459Z precedent: NO-GO branches
held, NOT rebased — bases behind master after Loop A's 0605Z
landing). Loop A landed mid-run (0605Z round evidence 4da1c1efb);
a new Loop A run (0725Z) started before this closeout — neither
touched.

## Verdict

food-economy stays converging (NOT converged): the jump-faithful sim
is proven and the stayhome trigger is proven, but NEITHER guard lands
as-is. No gate change landed, no default flipped. scale-onramp
untouched (sibling Loop A lane).

Next blanks, in order: (1) lateral-escape-aware guard model (or
trip-loop model) + veto memory/budget, judged on a POCKET-type band
with prevented pocket-entries as primary; (2) stayhome trigger
unchanged + stepping return walk, judged on band 61401–61408
(disclosed reuse, already qualified with 2 staying-type seeds),
engagement = reached-home fires, no-harm re-judged once walks
succeed; (3) 60501-shape band to test the roadwork credit itself
(0 uses in every leg — still owed); (4) guard + return-capability
pairing OR veto-budget expedition abort, decided up front, not both;
(5) sensor non-pantry collapse signal, recovery tied to stand-down
pantry or absolute level, survivors only, substrate re-run leg
before any threshold prereg; (6) gatediseng confirm band 76701–76712
still unspent.

Merged locally, pending ship (nothing landed: both arms HELD,
branches kept).
