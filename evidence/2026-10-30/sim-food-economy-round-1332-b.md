# Loop B round 1332 — food-economy: stash-fetch fix GO + contest-death tele gap named
Coordinator evidence, run fleshout-loop-b-20261030T1332Z. Merged locally, pending ship.

Loop A live on scale-onramp at run start (1315Z claim: dissolveprobe +
fleepolicy + leantrade, NOT touched; A landed mid-run as 58744e365, its
claim retired) -> B worked food-economy (converging), taking the 1230Z
run's next blank (3) stashed-hatchet stash-fetch equip fix, plus the
older open item #1514 (sickness death-tele gap). The two Steve-call
items (competent courtship drive, earnable vests) were NOT taken — they
need Steve's ruling first.

## Pre-registration (per arm, in each arm's evidence header)

- sim-stashfetch-b: primary metric = stashed-hatchet equip rate on the
  hatchequip acceptance seeds (16103/16106/16110) + cost bar on the
  16101–16116 recorder band (60d). GO = equipped on >= 2/3 acceptance
  seeds AND village-lost <= before+1 AND median >= 0.8x before.
  Judged against its header; no re-scoring.
- sim-sicktele-b: DIAG arm. Primary metric = living-count-delta deaths
  vs tele-list deaths on seed 9983 (reproduction) + pilot 10201–10208
  (competent, 180d death-aware). DIAG bar: fidelity reproduction, elif
  classified with firing records, coverage >= 90%, gap reproduced OR
  refuted on a fresh seed. No confirm spend without >= 1 pilot gap or
  coverage < 90% (per its prereg).

## Arm 1 — sim-stashfetch-b (GO, LANDED 21efcdcb2)

Fix: `Game.vesselStashFetch()` in src/js/villager-build.js, called from
`villagerBuildDay()` (endDay sleep path — runs in live play and sims,
no policy change). Once a day, at haven (playerAtHaven gate — no
teleport-fetching from distant tiles), the vessel fetches their own
best stashed WEAPON into the pack when it beats what they wield in its
slot (empty counts as beaten). Own stash only, one fetch/day, narrated
+ tele-recorded. Equipping stays on the normal path (policy gearUp /
player UI) — the fix offers the choice, it does not force the wield.
No hatchet grants, no generation changes; villagerGearUp gates, acquire
sites, spawn pools, drop tables, vest, courtship, warmth all untouched
(proven by test Part A).

Before/after, identical seeds, recorder band 16101–16116, 60d:

| seed | before | after |
|---|---|---|
| 16103 | stash never lost, kit never | fetch narration d1, "Equipped Hatchet (melee)." d2, tier none->fell, Hatchet strikes (tiger 25, eel 35, wolf 54) -> EQUIPPED |
| 16106 | never / never | same d1/d2 pattern, tanuki/wolf Hatchet strikes -> EQUIPPED |
| 16110 | never / never | same d1/d2 pattern, tier fell/canFell true from d2 -> EQUIPPED |

3/3 acceptance seeds EQUIPPED (bar was >= 2/3). Cost bar holds:
village-lost 1/16 before and after (16103's loss day moved 50 -> 37 —
expected RNG-stream shift from a game-code arm; the count is the bar
and it holds); median daysAlive 60 both; wrapErrors 0; max wave 3
both. Determinism: seed 16103 re-run reproduces the after-corpus
byte-identically. Proof: scripts/test-stashfetch-b.js 32/32 GREEN
post-rebase and on merged master.

Balanced panel (§15, supporting instrument): before/after panels (16
seeds, competent, 60d), compare decision review_required with NO
regression_signal on any metric. Day-30 first-bearer survival
0.4375 -> 0.6875, player deaths 1.56 -> 1.44, village deaths
15.31 -> 14.63, community loss flat, food/hunger flat. One watch item:
earned tier-3+ weapon/armor access 0.5625 -> 0.5, regression_watch
(interval includes 0, no seed-level displacement evidence) — flagged
for the next run, does not override the prereg GO.

Sense-test PASS: the fetch moment reads as a person remembering their
own axe ("You remember the Hatchet at your space in the haven and
fetch it — it rides in your pack now."), followed by normal equip
narration — the 60-day forgotten-axe absurdity is gone on all three
seeds.

check.js --quick attribution, completed by the worker: 284 passed / 6
failed on the fix tree -> 2 failures were this arm mechanically
(retained measurement proof digest stale after any src change) —
fixed per repo rule via balance-proof-update.js on the after-panel,
both tests now 9/9, pointer committed. The other 4 failures
(mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20) reproduce identically with this arm stashed —
pre-existing, unrelated. Net: this arm introduces zero new failures.

Evidence: evidence/2026-10-30/sim-stashfetch-b.md (+ prereg),
scripts/test-stashfetch-b.js, scripts/analyze-stashfetch-b.js,
scripts/probe-stashfetch-haven.js, corpus sim-stashfetch-b-corpus/
(16 seeds), panels sim-stashfetch-b-panel-before/after/compare.

## Arm 2 — sim-sicktele-b (DIAG-NO-GO on bar calibration, mechanism FOUND, LANDED e3491697c)

Verdict is DIAG-NO-GO only because the prereg's clause (d) — gap
reproduced OR refuted on a fresh seed — cannot be met either way on
this band (details below). The gap itself is real, named, and
fix-specified. Do NOT re-score this into a GO without a new
pre-registration.

Plain-words answer: Elif did not die of sickness. She died in a
contest, on camera, and the village said so out loud — but the death
was never written into any death record: no death tele, no corpse, no
fallen entry. Same for Marcus Webb nine days earlier on the same seed.
The parent's "sickness hurt row, died = true" was a post-mortem tick:
Elif was already contest-dead when the day's sickness tick ran, and
the tick dealt a 3-point hit (health 52 -> 49) to her stale sick
record because vpOf().dead was already true from the contest removal.

Named mechanism: `_cxKillContestant` (src/js/contests.js ~6049) — the
choke point for EVERY villager contest death (watch path, multi-take
path, duel partner) — calls `removeVillager(pid, 'killed')` and
ledgers `state.contestDeathsById`, but NEVER calls `registerDeath`.
A grep finds zero `registerDeath` calls anywhere in contests.js.
Every other death path registers; the villager contest path doesn't.
Scholar contest deaths DO register (via `playerDeath`), which is why
all pilot contest teles are player:true. Fix proposal (documented,
NOT landed — this arm's prereg excludes src/js landings): call
`registerDeath` in `_cxKillContestant` before the removal, with two
open questions for the follow-up arm — where the corpse should sit
(contest was on camera, not a field tile) and whether grief/gossip
double-fires with the existing `_cxGossip('died')` + blood-on-air
crisis. Also documented, not chased: the sickness tick hurts stale
sick records of off-roster villagers (`removeVillager` doesn't clear
`v.sick[vid]`).

Numbers:
- 9983 reproduction (fidelity PASS): 39 days, village-lost, harness
  deaths identical to the parent starveplenty trace (14 teles). 7
  roster exits, 7 named (coverage 1.0), 7 delta-deaths, 2 gaps (28.6%
  of villager deaths) — elif_demir day 32 and marcus_webb day 23,
  both REMOVAL-NO-REGISTER via `_cxKillContestant`. The other 5 exits
  all have tele + register + fallen + corpse. Sense test: "Elif is
  gone" (day 32) and "Marcus is gone" (day 23) are said out loud; the
  story remembers them, the books don't.
- Pilot 10201–10208 (competent, 180d death-aware): 81 exits, 81
  named, 81 delta-deaths, 0 gaps. Pooled with 9983: 88 exits, 88
  named, 2 gaps (2.3%). Zero UNEXPLAINED-DELTA anywhere; every
  registerDeath fired exactly one tele on every seed.
- Why clause (d) fails: the pilot has 0 villager-watch contest
  deaths in ~1,300 days (vs 2 in 9983's 39 days — rate tension flagged
  in metric review, unresolved), and the refutation branch as written
  required elif to be a non-death exit, which she is not. Clauses (a)
  fidelity, (b) elif classified with firing records, (c) coverage
  >= 90% all pass. No confirm was spent (prereg allows it only on
  >= 1 pilot gap or coverage < 90%).

#1514 disposition: answered as far as measurement goes —
reclassified from "sickness tele gap" to "contest-death record gap,"
fix specified but not landed. Proposed next-run revision: a
contest-enriched band (pre-screened for villager-watch contest
deaths), not another blind band.

Proof: scripts/test-sicktele-b.js 22/22 GREEN post-rebase and on
merged master. Zero src/js diff vs HEAD (diag-only guard in the
proof). Evidence: evidence/2026-10-30/sim-sicktele-b.md (+ prereg),
scripts/trace-sicktele-b.js, scripts/analyze-sicktele-b.js,
traces sim-sicktele-b-trace-9983.json + -10201..-10208.json.

## Wall numbers (this run's judged corpora)

- Stashfetch recorder band (60d, 16 seeds): wins 0/16,
  village-lost 1/16, median survival 60d (capped), max wave 3, never
  4+. National / table reach not re-read in this driver (endState
  records won/villageLost only); the panel on the same band reads
  table win 0, national 0, community loss 1/16. Same wall as
  hatchequip: this arm fills a tool-access blank, it does not move
  the scale on-ramp.
- Sicktele corpora are DIAG instruments (death-record completeness),
  not scale runs: no national/table/wins claim is made from them.
  The stashfetch arm is the only game-code change in this run.

## Telemetry deviation check

On the stashfetch corpus (16 files): 3 LOUD lines (national 12 -> 0,
table 16 -> 0, wins 16 -> 0), exiled clean. All three are the KNOWN
regime artifact class (60d pre-seat recorder corpus whose endState
carries won/villageLost only, vs the WINSEAT baseline) — baseline NOT
rolled, no investigation item. Sicktele traces are death-record
traces, not sweep rows, so no telemetry-check run applies to them.

## Metric review

- Stashfetch: prereg GO bar met with margin (3/3 vs >= 2/3) and the
  cost bar held on counts; the loss-day shift (50 -> 37) on 16103 is
  an expected RNG-stream consequence of a game-code arm and is
  judged on counts, not days. The panel tier-3+ regression_watch is
  carried as a watch item, not a verdict change.
- Sicktele: the prereg's clause (d) proved unmeetable in both
  directions on a blind band — reproduction on a fresh seed needs a
  rare event (0 villager-watch contest deaths in ~1,300 pilot days),
  and refutation as written required elif to be a non-death, which
  she is not. Proposed revision for the NEXT run (not applied here):
  pre-screen a contest-enriched band, and split clause (d) into
  "gap reproduced on an enriched band" vs "mechanism refuted by code
  path" — the code-path evidence (zero registerDeath in contests.js)
  already answers the mechanism question independently of rates.

## Infrastructure

- Worktree registration slow (~9.5 min for two trees, matching prior
  runs) but clean; no EPERM flap this run.
- Safe-commit index clobber hit both workers' commits (repaired via
  HEAD-blob cacheinfo, commits verified correct, worktrees clean).
- Master moved twice under the run (sibling journey landing
  ed521d634, loop A 1315Z round 58744e365); both branches rebased
  clean in their own worktrees with proofs re-run green after every
  rebase (sicktele 22/22, stashfetch 32/32) and on merged master.
  Merges ff-only; no conflicts.
- check.js --quick NOT re-run by the coordinator: zero new src/js
  beyond the stashfetch fix (already attributed by the worker, net
  zero new failures), and sibling loop A is live.
- Main tree clean at closeout. No push, no version bump — ship loop
  owns deploys.

## Next food-economy blanks, in order

1. Steve-call: competent court or winseek-only courtship? (still OPEN)
2. Steve-call: generation-dealt vests or earnable? (still OPEN)
3. Contest-death registerDeath fix (sicktele fix proposal: call
   registerDeath in _cxKillContestant; corpse placement + grief/gossip
   double-fire questions open) — needs its own prereg + a
   contest-enriched band.
4. Vessel armor fetch from own stash (stashfetch follow-up blank;
   the swat_vest next to the hatchet still never moves).
5. Warmthrestraint disposition (stranded sim-stranded-warmth-b branch
   vs master's R1/R2 gate — still HELD, untouched by this run).
6. Older open items carried: wake-tile forage knowledge (#1513),
   panel tier-3+ watch item (stashfetch).

food-economy stays converging (NOT converged): a real tool-access
fix landed and a death-record gap is named with a fix proposal, but
no food-economy default flipped, no balance change landed, and both
Steve-call items stay OPEN. scale-onramp stays converging (untouched;
sibling loop A lane). Claim retired to .DEAD; lock deleted.
