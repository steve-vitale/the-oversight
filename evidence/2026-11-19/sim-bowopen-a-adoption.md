# sim-bowopen-a adoption — closeout note (2026-11-19)

Adoption of Loop A arm 2 from timed-out run fleshout-20261119T0615Z
(scheduled 00:15 CST Nov 19, 2026). Arm 1 sim-partyfunnel-a is NOT
part of this adoption (still live/pending at adoption time — see
§Liveness below). This note covers the bowopen-a arm only.

## Verdict — NO-GO, verified from the files, not the run's word

Finding #2544 (fight capability: damage output) — the ranged-opening
half of the winning launched-party shape. Pilot band 105701–105708,
8 seeds, 150d, competent, substrate VETREENGAGE=1 PARTYSIZE4=1
FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHPARTY=1 on both legs (held sense
fix, merged into the branch as 255682942, HELD — never landed from
this arm).

Verified by re-reading `evidence/2026-11-19/bowopen-a-analysis.json`
directly and by re-aggregating the per-seed corpora:

| Bar | ctl | arm | Requirement | Result |
|---|---|---|---|---|
| Pool floor (pair-inclusive engaged) | 27 | 27 | arm ≥ 10 | PASS |
| Kill share (pair-inclusive) | 0.037 (1/27) | 0.037 (1/27) | arm ≥ 0.25 | FAIL |
| Damage/round (pair-inclusive) | 42.4 | 42.4 | arm ≥ 70 | FAIL |
| Community loss | 5/8 | 5/8 | arm ≤ ctl + 0.125 | PASS |
| Villager starvation | 4 | 4 | arm ≤ ctl + 2 | PASS |
| Median survival | 120.5d | 120.5d | ratio ≥ 0.80 | PASS (1.00) |
| Instrument errors | 0 | 0 | 0 | PASS |
| Mechanism: volley fired | 9/27 | 9/27 | ≥ 0.50 (check) | FAIL — 0.33, identical both legs |

The mechanism diagnosis is the finding: the staging ran 400 times
on the arm leg and staged ZERO bows — re-aggregated from the
per-seed corpora: alreadyHad 237, noSource 163, fromStash 0,
fromArmory 0, crafted 0, craftedFail 0. The legs are bit-identical
on every measured number (same 27 meetings, same outcomes, same
damage, same per-seed days/standing/wave/deaths). The pilot measures
a null, not the opening — the NO-GO stands frozen, and no 12–16
seed confirm was spent (prereg-gated).

## What landed (evidence-only, by cherry-pick)

The branch history is lever → instrument → evidence on top of a
HELD substrate merge, so a plain ff-merge would have dragged the
lever and the substrate in. Landed by cherry-pick onto master
800405556 (deepening r243):

- `3163e4ca6` (from `92a33b576`) — pilot instrument: bowopen
  driver, analyzer, panel builder (scripts only, 3 new files).
- `fa231ddcb` (from `e9e1e6301`) — NO-GO evidence: analysis JSON,
  panel files, 16 per-seed corpora, pilot logs, evidence file
  (evidence only, 26 files).
- `82d5a35ad` — prereg file only, checked out from the lever commit
  `2b29076e7` (the prereg lived inside the lever commit; no src
  changes in this commit).

Verified after cherry-pick: lever commit `2b29076e7` is NOT an
ancestor of the adopt tip; substrate merge `255682942` is NOT an
ancestor; `git diff 800405556..sim-bowopen-adopt -- src/` is empty
(27 evidence files + 3 scripts files only). Analyzer selftest
33/33 re-run on the adopt tip. Proof test `test-bowopen-a.js`
36/36 re-run on the branch tip (it needs the lever code, which
lives only on the branch).

HELD, never on master (verified by ancestry check):
- Lever `2b29076e7` (BOWOPEN=1, game.js `villagerStageBow` +
  villager-agency.js call site + proof test + prereg) — branch
  `sim-bowopen-a` kept.
- Substrate merge `255682942` (sense fix from
  sim-launchparty-sense-a) — HELD, never to land from this arm.

## Gate — 335 passed, 9 failed, 0 attributable

`node scripts/check.js --quick` on the adopt tip, 1382s, full log
`evidence/2026-11-19/check-quick-bowopen-adopt.log`. The 9
failures, each adjudicated:

- 5× 120s timeouts (comfort-arc, living-garden-deed-attainment,
  occupation-panels, one-person-army-deed-attainment,
  trust-observer-neutrality) — slow tests under the cap, not
  assertion failures. living-garden verified GREEN when run
  directly with a 400s budget (162s, exit 0); the others are the
  same standing class sibling adoptions solo-verified green.
  A second check.js gate (another adoption's, started 08:22Z)
  ran concurrently for the first ~half of this gate, adding load.
- Measurement-proof staleness pair (proof-update +
  measurement-workflow, "Proof source inputs are not current") —
  pre-existing master debt.
- Phone-frame stale receipt — pre-existing master debt.
- Cache-flags ("both actual CLI configurations complete valid
  neutral panels") — solo green in 23s, load artifact (same A/B
  as the 0130Z adoption).

**Ladder-bundle control absent from the failure list — cleared**
(0 "ladder" mentions in the gate log).

## Telemetry

The arm's telemetry check refused recorder-corpus input by design
(all rows carry top-level anchorCommit) — same documented refusal
as the 1415Z/1515Z runs. Baseline NOT rolled. No LOUD line to
investigate.

## Wall numbers (this arm's band, both legs identical)

National 0/8, table not instrumented (null), wins 0/8, wave-4
unlock 8/8, wave-5 unlock 3/8, median survival 120.5d. The
scale-onramp axis is still blocked above regional; the
ranged-opening question is still OPEN — the opening was never
staged, because there was nothing to stage with.

## Findings

- #2544 updated in place (line 2547): NO-GO recorded with the
  staging-null numbers; next arm named (gate + source together).
- New findings filed: #2590 (spear-in-ranged-slot blinds the
  staging gate; related #2410), #2591 (bow knowledge unreachable
  for the armed — Steve-call if the fix seeds knowledge at
  departure), #2592 (villages hold no spare bows), #2593 ("no
  arrows" line misnames non-arrow ammo — one-line narration fix),
  #2594 (starfall bow with an empty quiver — arrow supply is a
  separate live gap).

## Liveness — sim-partyfunnel-a (NOT mine)

At adoption start (~08:21Z) the partyfunnel worktree heartbeat
was 08:08:08Z (~13 min old, under the 15-min threshold) with no
matching live process in `ps`. I did NOT touch its worktree,
branch, or evidence, and I did NOT delete the run lock
(`fleshout-loop.lock`, run_id fleshout-20261119T0615Z) or retire
the claim (`fleshout-20261119T0615Z.json`) — both belong to the
run as a whole and the next Loop A occurrence owns that decision.
Re-checked at 08:56:58Z: heartbeat STILL 08:08:08Z (~49 min
stale) and still no matching live process — the worker now looks
dead, but per my brief I still did not delete the lock or retire
the claim. The next Loop A occurrence must verify heartbeat +
processes itself before any stale-lock recovery, then close out
partyfunnel-a (its branch tip is `efbf674d1` instruments +
`b4cda1de2` PARTYFUNNEL lever, both unmerged at last check).

## Infrastructure notes

- AGENTS.md gained two lessons during this adoption (from the
  endgame r246 adoption, not mine): clone-script byte/char size
  check (`len(content.encode('utf-8'))`, not `len(content)`) and
  "VM restart kills detached work silently" (uptime is the tell;
  re-establish heartbeat first, re-run the gate from scratch).
- The gate ran concurrently with another adoption's gate for its
  first half (check.js pid 8358, started 08:22Z) — the box runs
  two gates at once more often than the discipline allows; worth
  a coordinator-side serialization note, not a code change.
- Index clobber did NOT strike in this adoption (cherry-picks +
  one safe-commit; `git status` clean after every step).
- No bump, push, or live verification — ship loop owns that.
