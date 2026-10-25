# sim-scale-onramp-round-1146 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261025T1146Z, loop A (oversight-flesh-out-loop).
Axis: scale-onramp (converging, standing directive: villages never scale
past village in sims; wall numbers reported every run).
Outcome: 1 arm ADOPTED and KILLED at pilot, measurement record merged
locally pending ship. 1 arm DEFERRED (registration blocked by flap).
No game code landed. No push, no version bump, no live verification.

## Concurrency and pre-flight

- No lock file at run start (1027Z run had deleted its lock); lock
  created 2026-10-25T11:46:27Z. Live sibling claim at start:
  fleshout-loop-b-20261025T1029Z (food-economy, arms
  sim-packtail-adopt-b + sim-awayvoice-adopt-b) — NOT touched, nor
  any other lane's tree. This run worked scale-onramp (topmost,
  converging, unclaimed).
- Pre-flight: main tree clean (0 status lines), disk 25%,
  worktree-reap ran clean (9/16 active, uncommitted trees left alone).
- Claim filed at run start:
  hidden_files/lever-claims/fleshout-20261025T1146Z.json (axis
  scale-onramp, arm sim-postflee-adopt-a); retired to .DEAD at end.

## Arm 1 — sim-postflee-a, ADOPTED from held tree, KILLED at pilot

Adoption: the 1027Z run's held tree ~/workspace/worktrees/sim-postflee-a
(branch sim-postflee-a, base a0d23ef83) was adopted per the tracker
instruction — NO fresh tree registered for this arm. Held state at
adoption: uncommitted pre-registration, 4 control rows (73671–73674),
sweep script with WRITER_WAIT support, src/js diff empty.
Coordinator heartbeat refreshed on the tree at adoption.

Worker path (verified by coordinator, not taken on trust):
- Base check: master moved since the held controls only in version
  stamps + w123death diag + journey r50 instrument work — no
  functional src/js change. Held 4 controls stand; no full control
  re-run needed.
- Flap struck again mid-resume: seed 73675's sim finished but its
  corpus row sat in process memory and the first sweep process died
  with the row unlanded. Deterministic re-run landed byte-identical
  (164,264 bytes); 73676–73678 followed cleanly.
- Control replication gate: PASS, exact on every published number
  (days 93/106/134/180/180/174/98/150; national-ever 8/8, final 7/8;
  table invited 5 / entered 4; wins 4/8 lesser seat only; wave-4 5/8;
  wave-5 0/8; kind-filtered deaths 27 = field 12 / other 12 / raid 1 /
  arena 1 / tb 1; wins-excluded median 180d; all-runs median 150d).
- PRIMARY bar set from control class count: 5 routed same-day
  post-flee field deaths (3 same-entity), bar 0. Armed result: 0
  (0 same-entity, direct-stream 0). Mechanism eliminated.
- Pilot verdict (identical seeds, control → armed): PRIMARY 5→0
  PASS; field deaths 12→11 (reported only); survival wins-excluded
  median 180d→180d PASS (all-8 mean 139.4→139.0d; early deaths 2→2);
  national-ever 8/8→7/8 PASS; wave-4-or-win 6/8→7/8 PASS; raid deaths
  1→0 PASS; directed probe PASS (8/8 legs); starvation+sickness
  6→9 vs bar ≤8 — FAIL by 1. Per §14 the miss is NO-GO, never
  re-scored: confirm NOT run (confirm is pilot-GO-only). Game code
  fully reverted; measurement record only.
- Coordinator verification (post-worker, read-only + rebase checks):
  `node scripts/test-postflee-sweep.js --summarize` on the merged
  corpus reproduces every binding leg exactly (control postFlee 5 /
  starvSick 6; armed postFlee 0 / starvSick 9; recorder errors 0 both;
  field deaths 12→11; national-ever 8→7; wave-4-or-win 6→7; raid 1→0;
  wins-excluded median 180→180). No src/js in the commit.
- COORDINATOR CORRECTION (non-binding, verdict unaffected): the
  worker evidence's pilot table and village assessment say field
  vKill rose "40→73". The worker's own summarize tool reports
  fieldVKill 71→73 (routed-only recount: 51→54; neither is 40).
  The armed 73 matches; the control 40 does not match any recount.
  Treat 71→73 as the number; the "village fights more" reading
  survives (73 > 71, wounded flees 23→32, field fights 985→825).
  This note, not an edit to the worker's committed evidence, is the
  correction record.

Landing: branch rebased clean onto ef4270cd3 in its own worktree
(rebased commit fdb823d25; tree diff vs worker commit 9b3f54f5b is
exactly the intervening master commits — decision pack, w123death,
journey r50, version stamps — worker files byte-identical);
merged --ff-only to master; worktree released, branch deleted.
Commit: fdb823d25 (19 files, 94,691 insertions: evidence +
proof script + 16 corpus rows + reverted patch). Merged locally,
pending ship.

## Arm 2 — belltoad 0-damage pair, DEFERRED (registration blocked)

Next-blank #2 (73677 d67/d68, 0 dealt / 105/76 taken, same 40%-HP
belltoad) was NOT run: worktree registration failed 4 times under
the active container EPERM flap on .git ref writes
(packed-refs.new EPERM). The first attempt created orphan branch
sim-belltoad-a (= master c737198d7, zero unique commits) with no
worktree; branch deletion was blocked by the same flap, and per the
standing rule no ref surgery was forced during the flap. The
orphan branch still exists at run end (harmless, equals its base);
the next run may delete it once .git writes clear and re-register,
or re-use the name after verifying it still equals master.
Context gathered for that run: w123death evidence lines 200–201,
228–236. This deferral is infrastructure, not a kill: the blank
stays open at #2.

## Wall numbers (this run's pilot band, control → armed)

National-ever 8/8 → 7/8; national-final 7/8 → 6/8; table invited
5 → 6, entered 4 → 4; wins 4/8 → 4/8 (lesser seat only); wave-4
5/8 → 5/8; wave-5 0/8 → 0/8; full seat 0/8 → 0/8; median survival
150d → 145d (wins-excluded 180d → 180d). The scale wall above
national/table is untouched: villages can reach national, sit at
the table, and win — the full seat and wave 5 stay unreached
(0/16 this run).

## Telemetry deviation check: SKIPPED on purpose

Per the 1027Z review's standing instruction, telemetry-check is
NOT re-run on per-seed recorder rows without a counting fix: the
checker reads 0 wins/national on rows whose analyzer-proven counts
are 4/8 and 8/8, and the scale-wall baseline itself warns against
comparing courtship substrates to its winseat regime. Baseline NOT
rolled. This is the known artifact class, not a new deviation.

## Village assessment (plain words)

Half the villages win in both versions; all reach national except
armed 73673. The arm reshuffles fates rather than uniformly
helping: 73672 flips loss→win (144d, table entered), 73675 flips
loss→win (145d), 73673 flips win→loss (national never reached),
73677/73678 win identically. Survivors keep fighting — the
village doesn't go quiet, it fights more (field vKill 71→73,
wounded flees 23→32). The five same-day re-meet deaths are gone,
but the village still loses people to the same old mix, and two
longer-lived villages pick up extra sickness/starvation deaths —
the exposure question the next run's metric must answer up front.

## Metric review (required, §14 — no re-scoring in this run)

- The starvation+sickness leg bound exactly as written (≤ control
  recount + 2 = 8; armed 9 = miss). It is recorded as a miss.
- Metric-review hypothesis for the NEXT run (not a re-score):
  starvation+sickness as a raw count punishes longer-lived
  villages (the excess sits in 73672, lived 106→144d and won, and
  73676, 174→180d; 73678's pair is identical in both versions).
  A re-test must pre-register an exposure-aware form (per 100
  village-days, or a wider tolerance argued up front) on 12–16
  seeds — mechanism proven, only the cost metric missed.
- The control field-vKill "40" in the worker evidence is corrected
  to 71 above (own-tool recount); non-binding, verdict unaffected.

## Infrastructure notes

- EPERM flap: active on .git ref writes at run start (blocked
  belltoad registration + branch delete, 4 attempts ~12:00–12:05Z);
  cleared enough by ~12:19Z for the worker's safe-commit, the
  coordinator rebase, and the --ff-only merge to succeed. Goal
  hidden_files writes via exec succeeded throughout; .git writes
  were the flap's surface this run. No ref surgery forced.
- Safe-commit index clobber hit the worker commit (repaired via
  cacheinfo, verified clean); the coordinator merge and evidence
  steps were checked for the same (main tree clean at end).
- Balanced panel (§15): none attached, for the established reason
  — per-seed recorder corpora are not panel pairs; the
  sweep-compare table on identical seeds IS the comparison.

## Next blanks, in order

1. Post-flee re-test with a PRE-REGISTERED exposure-aware
   starvation+sickness metric (per 100 village-days, or a wider
   tolerance argued up front) on 12–16 seeds — mechanism proven
   (5→0), only the cost metric missed. (Also: leadership-divergence
   diagnostic — how often a saved villager changes who leads, per
   the 73673 flip — appended to the findings backlog.)
2. Belltoad 0-damage pair row-level trace (DEFERRED this run by
   flap, not killed): why healthy villagers deal 0 over multiple
   rounds against a wounded toad — needs gear-at-entry state, not
   a lever. Clean up orphan branch sim-belltoad-a first (verify it
   still equals its base before deleting).
3. Pool-presence lever for raid draft (0644Z blank 2, still
   untested).
4. Defender-fight wound manufacture (0644Z blank 3, still
   undecided).
5. Field-kill / field-save narration beat + bought-flee awayNews
   tap gap (carried tooling sub-blank).

scale-onramp stays converging (NOT converged): a real death class
is eliminated but no fix landed, wins still only via courtship +
seat instruments on the lesser seat, full seat still unreached,
wave 5 still 0. food-economy stays converging (untouched; sibling
B loop's adoption work pending). Rotation left at 3 (convergence
work does not cycle it). Claim retired; lock deleted at end.
Evidence: this file (coordinator) + evidence/2026-10-25/
sim-postflee-a.md + perseed-sim-postflee-a/ (commit fdb823d25,
merged locally pending ship).
