# sim-food-economy-round-1015 — coordinator evidence (run fleshout-20261104T1015Z, Loop A)

Axis food-economy (NOT scale-onramp: sibling Loop B's live claim
fleshout-loop-b-20261104T0930Z names scale-onramp, heartbeat 10:03Z at
run start, so this run worked the next unconverged axis to avoid
collision). No gate/price/deed changes. Zero net game-code change
landed: one arm is a confirm of already-landed code, the other
reverted its fix before landing.

## Arm 1 — sim-stasharmor-a: vessel stash armor fetch — GO (confirm)

Branch sim-stasharmor-a, commits ba0dbb4d3 (prereg, before any judged
sim) + 394d30224 (evidence + corpus + analyzer). Worktree clean,
proof scripts/test-armorfetch-b.js Parts A+B 38/38 GREEN on the
rebased branch (Part C SKIPPED: after-corpus not built on this run;
the worker's 40/41 Part C run on the pre-rebase branch failed C1
only on a stale-item artifact, see findings).

The assigned blank was already filled: `Game.vesselArmorFetch()`
landed as 3e94b55cc (Loop B arm sim-armorfetch-b, GO 3/3 WORN,
evidence/2026-10-30/sim-armorfetch-b.md). Re-implementing it would
have duplicated landed work, so per the assignment's "or prove"
branch this run became an independent confirm on the current tree.

Before/after on identical seeds (band 16101–16116, 60d,
nighttravel + woodcarry, WOODWARM=0, COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1):
- Before-leg (armorfetch-b, pre-armor code): stashed armor never
  entered the scholar kit within 7 days on any acceptance seed (0/3).
- After-leg, this confirm: pilot 16101–16108 8/8 WORN; confirm
  16109–16116 7/7 WORN plus 16109 no-spawn; band total 15/15 WORN
  wherever spawn armor exists. Day-1 fetch narration, day-2
  stash-loss / kit / worn, every case.
- Prereg bar (≥2/3 WORN in 7d): 16101 bark_armor WORN, 16103
  bloodplate WORN, 16109 no stashed armor spawns (untestable, not
  a miss) — 2/3 WORN, bar met exactly, band-wide 15/15
  corroborating.
- Cost bar HOLDS on both legs: village-lost 2/16 (16113 day 22,
  16115 day 36; bound ≤2), median daysAlive 60 (bound ≥48).
- Spawn drift, stated not hidden: 16103's swat_vest is now a
  bloodplate; 16109's farstrider_boots no longer spawn.
- Sense: 16103 day-1 paired first-person lines (Crowbar, then
  Bloodplate fetched from "your space in the haven"), both worn
  day 2 by the normal path. The back-to-back "remember the X…
  remember the Y…" patness armorfetch-b noted persists; not a
  GO blocker.
- Instrument anomaly: one 8-seed confirm batch invocation exited 1
  in ~3s with an empty redirected log; all judged numbers come
  from successful per-seed re-runs covering all 8 confirm seeds.
- Wall numbers (this driver, no code changed by this arm):
  village-lost 2/16, median 60d capped, max wave 4 on 6/16 seeds
  (vs armorfetch-b's max wave 3 — attributable to intervening
  landings, not this run). National/table/wins not re-read by
  this driver; no win claimed.

Verdict: the backlog item (vesselStashFetch covers weapons only;
the swat_vest in the stash never moves) is FIXED — it was fixed
by armorfetch-b, and this run confirms it independently. The
backlog item itself moves to fixed on this confirm, not on a
new implementation.

## Arm 2 — sim-hurthome-fix-a: hurt-aware turn-home rule for trips — INSUFFICIENT-DATA

Branch sim-hurthome-fix-a, commits 22b81154d (prereg, binding GO
header, [needs-eyes]) + 1416a6cfc (baseline instrument + 16-seed
pristine corpus) + 023de1d89 (the fix + proof test, [needs-eyes])
+ aae58f520 (armed corpus + evidence) + 93823af9f (REVERT of the
fix). The fix commit stays in history for re-application (its
pre-rebase hash 299d94403 is cited in the arm evidence; the
rebased hash is 023de1d89). Worktree clean. Proof test
scripts/test-hurthome-fix-a.js was 10/10 GREEN with the fix and
was reverted with it, since it asserts a function the reverted
tree lacks — correct discipline, not a lost test.

Mechanism (prereg-chosen, expedHurt write-back rejected there as
expedition-only): a health check on the return path in
`npcNodeTravel` — a ledger-away villager on a trip (any purpose
except `leave`) with hp ≤ 7 returns at the next travel tick —
plus the hurt-aware return line ("🧭 {name} returns from the
wilds hurt (health {hp}/100) — the trip cut short").
Walk-outs excluded by purpose, not clock arithmetic.

Before/after on identical seeds (competent, 100d death-aware cap,
seeds 97501–97516, PLENTYDEPRI=1, DEPOSITGATE=1, instrument
errors 0, 0 unclassified, both cells):

| | Baseline (pristine) | Armed (fix) |
|---|---|---|
| Trip episodes | 15 | 6 |
| Trip come-home rate (returned / all trips) | 14/15 = 0.933 | 6/6 = 1.000 |
| Conditional turn-home (same+next / returned) | 13/14 = 0.929 | 6/6 = 1.000 |
| Trip died-away share | 1/15 = 0.067 | 0/6 = 0.000 |
| Stayed-out ≥ 3 days (trips) | 1 | 0 |
| Walk-outs returned | 0/3 | 0/2 (exclusion holds) |
| Hurt-return lines | 0 | 39 |
| Hurt meal lines (2nd census) | 35 | 10 |
| Median daysAlive / survived seeds | 86 / 5 | 79 / 6 (guardrails hold: −7 within −10, +1 within −2) |
| Wave / national / table / wins | 4 / 0 / 0 / 0 | 4 / 0 / 0 / 0 |

Why INSUFFICIENT-DATA, not GO or NO-GO: the prereg's
judged-census bar (≥16 trip episodes per cell) failed in BOTH
cells (15 and 6), so the rate verdict is withheld per §14 —
thresholds were never moved. Descriptively the lift is +0.067,
below the +0.15 bar, but that lift is itself biased: the rule
fires intra-day, so most hurt travelers are home before the
next dawn and never open a dawn episode (39 hurt-return lines
vs 6 armed dawn episodes). Baseline come-home was already
0.933 on this band (vs 0.682 on the diag band), leaving max
lift 0.067. The dawn census was the right diag instrument and
the wrong fix instrument. The fix demonstrably fires and reads
true (sample lines match episode hp exactly: Greta guard hp 3,
Arturo expedition hp 5, Sari water hp 2), but that is
descriptive, not a GO. Per kill discipline the unjudged
behavior does NOT ship: it was reverted, and the revert is
what merged.

Named next arm (documented, not landed): sim-hurthome-fix-b —
re-apply 023de1d89, judge with an EVENT-based instrument
(hurtVillager event → return latency in parts; hurt-return
count per seed; died-while-away among event-defined cases),
with a metric that has headroom (latency/tail, not come-home
lift on a saturated baseline).

Sense: return lines now say the hurt that sent them home; the
diag's complaint (clock return celebrated as haul/stories/scar
with no mention of hurt) is answered descriptively by the
reverted fix's lines, pending the event-judged re-apply.

## Village assessment (plain words)

The village in these runs is a place where the small logistics
already work: armor left in the haven's stash now reliably finds
its way onto the person heading out, day after day, without
costing the village its life. And hurt travelers mostly do come
home — on this band, 14 of 15 hurt trips already ended at home
before any fix, which is why the fix had almost no room to show
an improvement. The fix itself works as a mechanism (hurt people
cut their trips short and say so plainly when they return), but
the measuring tool counted only dawn snapshots and missed the
same-day returns, so the run honestly refuses to call it a win.
Nothing at the top moved: no national, no table, no wins, no
wave-5 kills in either arm's corpus — this run's blanks were
mid-chain logistics, not the top of the chain, and the wall
numbers below are the honest per-arm figures, never pooled
across different anchors.

## Wall numbers (per arm — anchors differ, never pooled)

- stasharmor (16 legs, 60d): wins not read, national/table not
  read; village-lost 2/16, median 60d capped, max wave 4 (6/16).
- hurthome-fix (32 legs, 100d): wins 0, national 0, table 0,
  wave-5 0; median survival 86d baseline / 79d armed; wave 4
  both cells.

## Metric review

- stasharmor: bar judged strictly (2/3 WORN exactly, 16109
  no-spawn counted as untestable, not a miss); no re-scoring.
  Balanced panel not run (confirm of a landed mechanism on a
  dedicated driver; comparison rests on the pre-registered
  per-seed table + analyzer aggregates, never a fabricated
  panel) — same stated limitation as the 0820Z run's panel
  note, carried not hidden.
- hurthome-fix: §14 honored in full — the ≥16-episodes-per-cell
  bar failed in both cells and the verdict stayed
  INSUFFICIENT-DATA; the descriptive +0.067 lift was NOT
  re-scored against a friendlier metric. The metric itself is
  reviewed for the NEXT run: dawn-episode counts cannot judge
  an intra-day return rule; the next prereg must use
  event-based latency/count metrics (see named next arm).
- Telemetry deviation check: LOUD national/table/wins
  baseline -> 0 on the hurthome corpus (n=34 files) — EXPLAINED,
  not a deviation: the current files are a 100d hurt-episode
  diag corpus (wave max 4, no scale panel), and this run landed
  zero net game-code change (stasharmor confirm only, hurthome
  fix reverted), so no scale outcome could have moved.
  Baseline NOT rolled forward. No LOUD line on exiled.

## Findings appended to sim-findings.md (7)

Stasharmor: (1) test-armorfetch-b.js Part C acceptance map is
stale (hard-coded swat_vest/16103, farstrider_boots/16109 no
longer spawn) — refresh or make item-agnostic before the next
confirm; (2) spawn-generation drift — future arms depending on
specific spawn items should re-probe spawns first
(scripts/probe-armorfetch-spawn.js exists); (3) armorfetch-b's
panel tier-3+ watch (0.5 → 0.3125, regression_watch, interval
includes 0) still un-rechecked — needs a future panel;
(4) fast exit-1, no-output verdict-driver batch invocation —
worth one retry observation if it recurs; per-seed runs are
the workaround.
Hurthome-fix: (5) dawn census is blind to intra-day hurt
returns (39 hurt-return lines vs 6 armed dawn episodes) — any
return-timing arm must instrument from hurt events, not dawn
samples; (6) single hurt returns cascade through the RNG future
(97514: died d21 → survived 100d; 97511: survived → died d69)
— matched-seed medians, never individual seeds, are the
comparison unit for behavior changes; (7) re-confirmation (not
new): the expedHurt disconnect fired again on this band (Aki,
97507: expedDuration 2 vs awayDuration 14; 3 hurt dawns, clock
return celebrated as haul/stories/scar with no mention of
hurt).

## Infrastructure

- Arm pivot before any sims: deployfrac dropped — Loop A
  sim-vfrac-a already returned INSUFFICIENT-DATA on the
  (v**) deploy-fraction question and Loop B sim-fracchoice-b
  (0130Z) is in-flight/orphaned on the same question; the
  hurthome-fix named next arm replaced it. Claim updated
  before workers spawned. Loop B's fracchoice tree was never
  touched; its orphaned uncommitted work is B's to adopt, not
  A's to duplicate.
- Registration congestion all run (register ~5–9 min per tree;
  one registration killed mid-checkout by SIGTERM left a
  partial dir, cleared and re-registered clean; one
  registration failed at checkout end with write errors and
  no tree left behind, re-registered clean on retry).
- Sibling landings moved master during the run (Loop B 0930Z
  winnability round: tend NO-GO split + zombie NO-GO; journey
  r95): each worker branch rebased clean onto the new tip
  before its ff-only merge (stasharmor proof re-run 38/38
  green post-rebase); the second merge needed a second rebase
  after the first merge moved master — handled, no force,
  no conflict.
- safe-commit index clobber hit worker commits (repaired via
  HEAD-blob cacheinfo, commits verified correct, trees clean).
- Both trees released done-merged, branches deleted, main
  tree clean at closeout. No push, no bump, no live
  verification.

food-economy stays converging (NOT converged): the stash-armor
blank is now confirmed fixed, but the hurt-traveler turn-home
behavior is still unjudged (fix prototyped, firing, reverted
pending an event-based re-judgment), and the (v**) deploy
fraction remains undecided across two insufficient runs.
Claim deleted; lock deleted.
Merged locally, pending ship (stasharmor ba0dbb4d3 +
394d30224; hurthome-fix 22b81154d + 1416a6cfc + 023de1d89 +
aae58f520 + 93823af9f; coordinator evidence this file).
