# Loop B adoption round 0230Z — gardening first numbers + fight-play census (STALE-LOCK RECOVERY)

Run: `fleshout-loop-b-20261111T0230Z`, Loop B, axis coverage program Tier 2.
Coordinator evidence. Both arms adopted from the dead 0025Z run and merged locally, pending ship.

## Stale-lock recovery

The 0025Z Loop B lock (created 2026-11-11T00:25:00Z) was ~2h05m old at this
run's start. Its trees' registry heartbeats were 63–72 min stale
(sim-garden-b 01:17:28Z, sim-fightplay-b 01:25:59Z), no file writes in either
tree in 20 min, and both workers' pilot sweeps were complete with committed
instruments/proofs plus uncommitted corpora. Previous run DEAD per the
15-minute heartbeat rule and the 90-minute lock fallback. Lock overwritten
with this run's id at 02:30Z; the 0025Z claim is retired to `.DEAD` at
closeout. Loop A LIVE on its 0215Z claim (sim-fishfirst-a, sim-standing199-a)
— NOT touched.

Pre-flight: main tree clean, disk 37%, worktree-reap ran (12/16 active, no
removals; LOUD lines: garden + fightplay uncommitted = this adoption;
journey-scale + journey2-crisis uncommitted = other owners). Master tip at
claim time: cb7cd6695.

## Arm sim-garden-b — GO (gardening first numbers)

Branch `sim-garden-b`, merged ff-only as 3536e0aea (prereg dcc2adbb9-era
commits rebased; adoption commit 3536e0aea: corpus + summary + evidence).
Proof 77/77, re-run green by the adoption worker after the rebase and by
the coordinator on merged master. Zero src/js.

- Band 180217–180224, 8 seeds, 150d, competent, 949 village-days.
- 487,650 nominal kcal harvested in 126 harvests across 7 crops; garden =
  22.7% of all pantry inflow (ahead of forage 21.4%, behind fish 25.4%);
  village meal drew 206,563 garden kcal.
- **The scholar does the gardening:** 120/126 harvests, 97% of garden kcal
  player-harvest; NPC duty 3%. NPC sowing nearly never works: 2 successes
  in 305 attempts (0.7%), both farmers; only 3 attempts by a green-hands
  occupation — the duty hands the job to dentists, vets, nurses, musicians,
  silently turned away by the gate (no failure reason recorded).
- **Every harvest was cultivate-assisted; zero ordinary harvests.** 282
  cultivate casts, all the scholar's; 338/647 duty resolutions throttled
  (52.2%). Teaching: 108 teachPlant calls, 107 null (ambient plant-ID on
  hauls), 1 taught; 0 guided sows; villager-to-villager garden teaching
  confirmed absent. Practice tops out at step 1; no foodXp gardener task.
- Wall: wins 0/8, national 0/8, table 0/8; regional 7/8, wave 4 on 7/8,
  wave 5 on 2/8; median survival 150d (censored; 4/8 villages lost);
  standing median 199, plateauing at 199 on 5 seeds. Deaths 545,
  combat-dominated; starvation 11.
- Evidence: evidence/2026-11-10/sim-garden-b.md (7 backlog findings appended
  to sim-findings.md).

## Arm sim-fightplay-b — GO (fight-play census, COMBAT-PLAY GATE)

Branch `sim-fightplay-b`, merged ff-only as defeb45bf (adoption commits
1c779e6f2 / 20b365448 / d066871dd; rebased onto explicit cb7cd6695 by the
worker, then onto 3536e0aea by the coordinator after the garden merge —
the evidence file's §Rebase records the first rebase; the second is
recorded here). Proof 32/32, re-run green after each rebase and by the
coordinator on merged master. Zero src/js.

- Band 180225–180232, 8 seeds, 150d, competent.
- **509 grounded wild fights vs 373 agency fights — all 373 conjured**
  (conjurefix not on master); 105 of 473 credited kills come from fights
  against monsters never in the world. Kill-based bars read conjured
  kills as real.
- Outcomes (grounded): vKill 274 / vFlee 145 / mFlee 69 / vDie 21.
  Wave 4: **3 kills in 98 fights**. Party size 3 in 427/509 (84%);
  solo wave-3/4 fights never kill (0/11).
- Abilities: 331 leader uses across 216 fights; ally use unmeasurable
  (no engine record). Knowledge: trick known in 233 fights, executed in
  only 65 — wave 1–2 counters known 150x, executed **2x**; wave 3–5
  signature counterplay executes when known (63/83). Fought-before:
  3/509. Pre-fight evade: 0/509 grounded (241/373 conjured agency);
  win-plan gate null 370/381.
- Ammo: pocketed 587, spent 263; only 106 fights had any ammo at contact
  (250 no ranged weapon, 94 ranged-but-empty, 59 wrong ammo type).
- Wall: national 0/8, table 0/8, wins 0/8, w4 unlocked 8/8, w5 2/8,
  median survival 127d. Readiness-5 ready on 0/8 — veterans bar 0 on 7/8
  seeds while tricks sit at 21–28 vs demand 3. **The veteran bar, not
  standing, is the wave-5 choke.**
- The buggy pre-fix corpus (perseed-fightplay-b-v1-noammo, ammo lookup bug)
  was deleted uncommitted, not landed; reason recorded in the evidence.
- The census verdict UNBLOCKS the queued builds: the arm-2 toggle already
  has its verdict (togglepin-b, MORALE CREDITED, 2026-11-04) and is NOT
  re-run; the flee-repair build and the persistent-party build queue
  behind these numbers. Evidence: evidence/2026-11-10/sim-fightplay-b.md
  (7 backlog findings appended to sim-findings.md).

## Wall (this run's judged corpora, 16 seeds)

National 0, table 0, wins 0; wave-5 unlocks garden 2/8, fightplay 2/8;
median survival garden 150d (censored), fightplay 127d. The scale wall
stands above both first-numbers arms — as expected for measurement arms.

Telemetry deviation check REFUSED both corpora (recorder rows, not runs)
— baseline NOT rolled, no LOUD lines, no investigation item.

## Infrastructure

- safe-commit index clobber hit both workers' commits — repaired via
  `git ls-tree -r HEAD | git update-index --add --index-info` each time,
  commits verified correct. safe-commit.sh does not accept directory
  paths — fightplay corpus committed with an expanded file list.
- Fightplay rebase stopped once at the ammo-fix pick (the known
  stop-at-pick quirk); verified unapplied, continued cleanly. The
  coordinator's second rebase (onto 3536e0aea) ran clean, 6/6 picks.
- Merge 2 ff-only correctly refused after merge 1 moved master; fightplay
  rebased onto the explicit new SHA, proof re-run, merged clean. No pipes
  masked any exit code.
- check.js --quick WAS run by the coordinator on the merged master (this run
  touched no src/js, but the repo rules ask for it after every change):
  **294 passed, 6 failed** (exit 1), stable across two runs (418s, 383s).
  All 6 failures are PRE-EXISTING — none attributable to this run:
  (1) test-measurement-proof-update.js + (2) test-measurement-workflow.js —
  the known stale neutral-proof class ("Proof source inputs are not
  current"; the owed r129 refresh, already in the findings backlog);
  (3) test-phone-frame-proof.js — same staleness class (retained browser
  inputs no longer match current source); (4) test-mobile-combat-cadence.js
  — "Continue does not wrap the announced round a second time" (behavior
  test, last touched 2026-10-19); (5) test-occupation-panels.js — "real CLI
  workflow completed" errors at line 17 (last touched 2026-10-19);
  (6) test-establishment-r20-fixes-20261020.js — racks-full voice gate,
  "next day voices once more" (last touched d6880d7ad, 2026-10-20).
  Verified: no failing file was touched by either merge (both merges
  purely additive — new scripts + evidence only), and neither new proof
  suite appears in the failure list. The check is red on master for
  pre-existing reasons; the stale-proof items are the owed refresh, the
  other three need triage by their owners — recorded as one backlog item.
  The r129 measurement-proof refresh stays owed (tracker tail); this run
  touched no src/js.

## Re-point queue check

(1) arm-2 toggle run DONE (togglepin-b, MORALE CREDITED) — NOT re-run.
(2) flee-repair build — now unblocked by the judged census; held branch
sim-fleerepair-a noted in the tracker, state to be checked before any
fresh build. (3) standing accumulation on gear-ready seeds (99107
pattern) — adjacent to Loop A's live standing-199 read (#2098); not
taken here. Next blanks, in order: (1) flee-repair build/adoption;
(2) standing-accumulation-99107 read; (3) COUNTER_ANSWER default call
(Steve/coordinator); (4) measurement-proof refresh after r129 (owed).

Coverage Tier 2 gardening [x] and fight-play census [x]. scale-onramp
stays converging (NOT converged): wins still 0 everywhere in this run's
corpora, national 0, table 0.

Claim deleted; lock deleted. Evidence:
evidence/2026-11-10/sim-adoption-round-0230.md (this file).
Merged locally, pending ship (garden-b 3536e0aea; fightplay-b defeb45bf).
