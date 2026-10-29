# sim-scale-onramp-round-1915 — ADOPTION LANDING RUN (axis scale-onramp)

Run: flesh-out loop, run fleshout-20261029T1915Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). This run landed the dead
1715Z round's two worker arms; it ran NO new sims of its own beyond
landing-gate proof re-runs. Zero src/js in either arm, zero default
flips, zero game-behavior changes shipped. Merged locally, pending ship.

## Plain words first

Two questions from the morning's scale work now have measured answers
on master, because the round that measured them died before landing:

1. Can the villagers standing on the same tile join a fight? YES —
   mechanically proven. In the old band, 92 fought wild fights had tile
   mates standing there and none joined, none even shouted. Hand the
   game only the people on the tile (no roster, no list — the
   perception law holds) and 24 fights get a shout and a join, a named
   villager charging in. But joins do NOT save losing fights: only 2
   of 24 joined fights end in a kill, and the band got worse, not
   better (wins 6→3, deaths 240→311). Wiring tile-feed into the real
   game on this evidence would ship a mechanism that feels right and
   measures worse. The next arm must price what an ally would have to
   deal to flip a hopeless fight, before anyone touches the one-ally
   rule or the shout timing.
2. Can a village that refuses the lesser seat and chases the full seat
   actually reach it? NO — not on this band, not even trying hard.
   The pursuit moved real gates (wave-4 deeds, food deeds, table
   invitations up) and still produced ZERO full-seat offers in 8
   seeds, while costing 5 starvation deaths against 0 on the substrate
   and winning nothing (0 wins vs 2). The wall is not the seat bar:
   it is the wave-5 unlock plus readiness chain (veterans short on
   16/16 rows). The next arm audits what wave-5 readiness actually
   requires before any new pursuit variant is measured.

The village picture is unchanged in shape and sharper in detail:
villages reach national and sit at the table regularly, but only
through the lesser seat. The full seat is now 0 across three
substrate-family rounds, and wave 5 is still 0 everywhere.

## Stale-lock recovery (this run's start)

- Lock fleshout-loop.lock held run_id fleshout-20261029T1715Z,
  created 17:15Z. At this run's start (19:16Z) the lock was 121
  minutes old AND its worktrees' heartbeats were 49 minutes stale
  (sim-tilejoin-a / sim-fullseat-a, last heartbeat 18:27Z).
- Per the guard both conditions mean DEAD (>15 min heartbeat rule,
  >90 min lock fallback). Old lock deleted, new lock
  fleshout-20261029T1915Z written, claim file written before any
  landing work. No live run was touched.
- Loop B's claim (fleshout-loop-b-20261029T1730Z, food-economy)
  was NOT touched: B owns its own lock file, and its trees'
  heartbeats were also stale (48 min) but B's coordinator may still
  be in a slow phase — B's next run owns its stale recovery. This
  run worked only scale-onramp.
- Pre-flight: main tree clean (0 files), disk 20%, reaper removed
  nothing (sibling dirty trees flagged, left alone).

## What was stranded, and what landing took

The dead 1715Z coordinator had died after both workers committed but
before any merge, evidence, or cleanup. Both branches were committed
and clean, based at 84eba8a86 (master had since moved to 4dd1cc079
with journey tooling + ship bumps). Landing per arm:

### Arm 1 — sim-tilejoin-a (backlog #1439, DIAG-NO-GO)

- Worker commits (rebased): prereg + instruments, instrument fixes,
  evidence + corpora. Verdict as written: mechanism works (24 joins
  from a 0 baseline, every addressable-shape fight converted) but
  the prereg kill leg and deaths guard both fail; band wall numbers
  moved DOWN. No re-scoring by this run.
- Rebase onto 4dd1cc079: clean, 3/3 commits. Post-rebase diff vs
  master: purely additive, 26 files (evidence + prereg + 2 corpora
  + recorder/prototype + sweep + analyzer + fixtures + sense +
  neutrality). Zero src/js, zero overlap with master-side changes.
- Proof re-runs on the rebased tree (coordinator, not the worker):
  fixtures 33/33 FIXTURES-PASS; sense SENSE-OK; neutrality
  RE-PROVEN FRESH (seed 75101 re-run with TILEJOIN_SKIP=1 into a
  scratch dir, compared against the committed OFF row:
  NEUTRALITY-PASS, 0 game-content diffs); analyzer reproduces the
  worker verdict exactly (coverage PASS both legs, primary joins
  PASS, joined-kill FAIL, deaths guard FAIL, all other legs PASS,
  MACHINE-LEGS-FAIL by design).
- Merged --ff-only as 5618cb543 (with its 2 parent commits).

### Arm 2 — sim-fullseat-a (backlog #920, NO-GO)

- Worker commits (rebased): prereg, instruments, evidence + corpus
  + pursuit-policy DELETION (killed-arm rule: the pursuit policy
  leaves no trace; re-runs restore it from git history per the
  sweep header note). Verdict as written: pursuit moved gates, 0/8
  full offers, guards 1–2 fail, pilot NO-GO stops the run, no
  confirm seeds. The worker's own correction stands: the first
  summary.json computed starvationTotal from a nonexistent field
  (NaN); the analyzer recomputes from rows (OFF 0, ON 5) and the
  summary was patched — never quote the first summary's NaN.
- Rebase onto master: clean, 3/3 commits; then master moved again
  under this run (tilejoin merge), so a second clean rebase onto
  the new tip, analyzer re-run after each rebase. Post-rebase diff
  vs master: purely additive, 22 files. Pursuit policy verified
  ABSENT from the tree (only fullseat-diag.js remains). Zero src/js.
- Proof re-run on the rebased tree: analyzer recomputes the worker
  verdict exactly (AGG off: won 2, medDays 129, natEver 6, table 2,
  entered 2, fullOffer 0, starv 0; AGG on: won 0, medDays 167,
  natEver 8, table 6, entered 0, fullOffer 0, starv 5;
  VERDICT: NO-GO). Corpus integrity re-checked: 16/16 rows, days >
  0, every row endSnap.dist + top-level diag block present (the
  17th file in the dir is summary.json).
- Merged --ff-only as 5a9f7579e (with its 2 parent commits).

### Landing hygiene

- No merge conflicts anywhere. The one --ff-only refusal (fullseat
  after the tilejoin merge) was a normal base move, resolved by
  rebase, not force.
- No safe-commit index clobber on the coordinator evidence commit
  path (evidence committed via safe-commit.sh; status verified
  empty after). No EPERM flap this run.
- Trees released as merged, worktrees removed, branches deleted.
  Final main-tree state: clean (0 files), HEAD 5a9f7579e.
- check.js --quick NOT re-run at coordinator level (zero src/js in
  both arms; arm proofs are the landing gate — same call as the
  1615Z/1630Z rounds).

## Wall numbers (the landed bands, judged corpora)

Tilejoin band (seeds 75101–75108, 180d, tableseat-nowait):

| | OFF (substrate) | ON (tile-feed prototype) |
|---|---|---|
| wins | 6/8 | 3/8 |
| deaths (total) | 240 | 311 |
| table entered | 6 | 3 |
| tile joins / shouts | 0 / 0 | 24 / 24 |
| joined-fight kills | — | 2/24 (solo 25.1%, selection-biased — see metric review) |
| ally damage dealt / taken | — | 137 / 296 across 24 joins |

Fullseat band (seeds 76001–76008, 180d, tableseat substrate):

| | OFF (substrate) | ON (full-seat pursuit) |
|---|---|---|
| wins | 2 | 0 |
| full offers / entered | 0 / 0 | 0 / 0 |
| national ever / final | 6 / 6 | 8 / 2 |
| table invited / entered | 2 / 2 (both lesser) | 6 / 0 |
| starvation deaths | 0 | 5 |
| median days | 129 | 167 |
| wave-4 / wave-5 reach | 6 / 0 | 6 / 0 |

Scale-onramp overall: full seat 0 across three substrate-family
rounds (per the fullseat arm's convergence note); wave 5 still 0;
national/table/wins continue to arrive only via the lesser seat.

## Village assessment (plain words)

What the village looked like: villages that live long enough climb
to national standing and get invited to the table — the climb works.
What breaks is the last step. A village that holds out for the full
seat instead of taking the lesser one pays for the wait in
starvation (the pursuit's 5 deaths came from refusing seats while
the village still needed to eat) and still never sees a full offer,
because two locks sit behind it: standing-200 and wave-5 readiness,
and readiness is the binding one (veterans short on every row).
Meanwhile the people on the ground do show up for each other — when
the game is handed only the people actually standing on the tile,
mates charge into fights — but charging into a hopeless fight
mostly ends in flight (15 of 24) or death (3 of 24), not a kill.
Missing knowledge/capability, stated as gaps, not fixes: (a) what
wave-5 readiness requires and which component can move; (b) what an
ally would have to deal to flip a hopeless fight (the flip
threshold, not another join mechanism). Blanks filled this run:
none in game code — both arms were measurements. Blanks documented:
both verdicts, both corpora, both ranked next-arm lists, now on
master.

## Sense-testing note

No new transcripts were read by this run (landing run; no new
sims). The workers' sense reads stand: tilejoin's Farid joined-fight
transcript reads like people (SENSE-OK, with one disclosed narration
blank — a drive-off end with no end line); fullseat's sense replay
(seed 76005 ON) is in sim-fullseat-a-sense.txt. Neither sense read
was re-judged here.

## Metric review (carried, nothing re-scored)

- Tilejoin (from the worker, endorsed by the landing re-runs):
  joined-vs-solo kill comparison is selection-biased (joins fire
  only on hopeless trajectories); the next join arm's primary
  should be a fight-level counterfactual (joined outcomes vs the
  OFF addressable pool: 11/11 fled, 0 kills, 0 deaths) plus a
  joined-death-share guard, solo rate as context only. Band-level
  wall guards on a diverging prototype are butterfly-contaminated
  (meetings 1317→1068); for prototype arms, wall numbers are
  report-only context and binding guards are fight-level.
- Fullseat (from the worker): median days is confounded in both
  directions on seat arms (wins end runs early, refusals grind
  longer); judge starvation alone for refusal arms next time, or
  median days among non-winning, non-declining runs. "Full offer"
  vs "gate-full ever" were both 0/8 here so the distinction did not
  matter; on a band where the gate passes but the table never waits
  they will diverge — keep reporting both.
- This run's own metric note: the telemetry-check LOUD lines below
  are the known WINSEAT-baseline regime artifact (see Telemetry),
  not a new finding; the arm verdicts above are judged on their
  preregs, not on telemetry.

## Telemetry deviation check

Command (per run book): telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'<per-seed-evidence-glob>' --metrics national,table,wins,exiled
(--sweep-rows, row-only globs).

- Fullseat corpus (16 rows pooled OFF+ON, 8 distinct seeds):
  nationalEver 14/16, table 8/16, won 2/16. LOUD: wins 16→2.
- Tilejoin OFF (8 rows): nationalEver 7/8, table 6/8, won 6/8.
  LOUD: table 16→6, wins 16→6.
- Tilejoin ON (8 rows): nationalEver 6/8, table 4/8, won 3/8.
  LOUD: table 16→4, wins 16→3.
- Exiled: no LOUD line on any corpus.

Verdict: all LOUD lines are the KNOWN baseline-file regime artifact
(the scale-wall.json baseline is a 16-config WINSEAT count, not a
rate; the 1615Z and 1630Z rounds reported the identical pattern and
also did not roll). Baseline NOT rolled. The fullseat pooled-16
comparison additionally mixes two arms and must never be quoted as
a band result; the judged tables above are authoritative.

## Convergence state

scale-onramp stays converging (NOT converged): the tile-mate join
gap is now closed mechanically and proven not to help, and the full
seat is now measured — not just untested — as 0/8 under active
pursuit, decomposed to standing-200 + wave-5-readiness locks. But no
wave-4 field party kill path is landed, the full seat stays 0, and
wave 5 stays 0. food-economy stays converging (untouched; sibling
loop B lane). Claim deleted; lock deleted.
Evidence: evidence/2026-10-29/sim-scale-onramp-round-1915.md
(coordinator) + sim-tilejoin-a-prereg.md + sim-tilejoin-a.md +
perseed-tilejoin-a/ + sim-fullseat-a-prereg.md + sim-fullseat-a.md
+ sim-fullseat-a-sense.txt + perseed-fullseat-a/ (all on master,
merged locally pending ship).
