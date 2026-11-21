# sim-scale-onramp-round-0715 — Loop A lever round (ADOPTION)

Run `fleshout-20261121T0715Z`, axis scale-onramp. The round timed out
before closeout; this record is the adoption closeout by the coordinator.
Both arms were resumed from where they stopped — nothing was re-run from
scratch. Base `9070aaf70` (the 0437Z round record); master at adoption
closeout `06852bcd4` (the 0430Z round record).

## Arm 1 — sim-shape2-a: DRAFT-ARMED-HOLDER-AS-LEAD (shape 2)

Finding #2628 / #2599. Evidence: `evidence/2026-11-21/sim-shape2-a.md`.

- Prereg `e12b830c6` (+ amendment `0d0541a06`), band 107161-107168
  verified fresh, 150d, competent verbatim. Frozen bars: holder-days
  >= 40; armed leads >= 2 (discriminating); armed volleys >= 1;
  entries >= 3; separated guardrail; starvation guardrail.
- Proof pre-pilot (run by the coordinator): 53/53, analyzer selftest
  101/101. Lever + instrument commit `638205b2c`.
- Pilot: 8 ctl + 8 arm, both legs exit 0, 8/8 corpora each, 0
  instrument errors, coverage complete 8/8.
- **Verdict: NO-GO on participation.** Holder-days arm 162 (PASS);
  armed leads arm 0 (FAIL, bar 2); armed volleys arm 0 (FAIL, bar 1);
  entries arm 1 (FAIL, bar 3, ctl 10); guardrails PASS; starvation
  PASS (3 vs 5).
- The draft works and had nothing to draft: it fired 3 times, all bow
  tier, all expedition router, all reached and volleyed (107161 d82,
  107162 d54, 107168 d42). **0 gun drafts fired** — only 1 gun-tier
  miss ever recorded. Of 78 unarmed arm launches, 66 had NO living
  armed holder at all. Bow leads rose 23 -> 28, bow volleys 18 -> 22,
  but bow-lead kills fell 3 -> 0.
- #2635 sink census: arm 5 rows, 4 unexplained (80%), 0 vanishes;
  ctl 9 rows, 7 unexplained (77.8%), 2 vanishes. #2635 stays OPEN.
- Lever reverted (hash-verified, `2464bf2e9`); post-revert proof
  fatals by design (TypeError: the method is gone) after 10 fixture
  passes; analyzer selftest 101/101 stays green. Evidence
  `c591db4a3` (+ hash-fill `0ab2a5236`). 0 src/js delta at the tip.
- #2628 / #2599 stay OPEN on participation. Next lever is
  supply-side or presence-side, not another draft shape: get a gun +
  cells into a living villager who fights, or get a holder to the
  fight. Shape 2 as a shape is closed — the draft fires correctly.

## Arm 2 — sim-m2step2-a: M2 VOLLEY PRICING (Step 2 on M2)

Finding #2590. Evidence: `evidence/2026-11-21/sim-m2step2-a.md`.

- Prereg `5dfeb76bc` (+ arithmetic correction `dc614732a`), fresh
  band 107171-107178, 150d, competent verbatim. Frozen bars: (a)
  completeness; (b) served pool >= 3; (c) GO rule; (d) guardrails.
- Pilot COMPLETED before the timeout: **NO-GO on participation**
  (served pool 2 < 3; bars a T, b F, c F, d T). 0 fought served
  meetings, 0 volleys fired. Mechanism M1 named: the pre-contact
  awareness check, which takes no bow/ammo input — the volley never
  gets priced because the fight never gets served.
- Substrate revert (`b94b28e58`, --force-delete per coordinator
  approval) + lever revert (`da26f7cfc`), both hash-verified exact
  inverses (game.js `97956402d`, fieldFights.js `30f4a059d`);
  `git diff 9070aaf70 -- src/` empty at the tip.
- Post-revert proof: 33/41 — the 8 failures are exactly the reverted
  legs; analyzer selftest 57/57 green. Substrate proofs post-revert:
  DEPMAT 22/43, ROLL35 14/41, AMMO 24/52 — every failure a
  substrate-presence leg. Evidence `83a01d139` (+ hash-fill
  `da1b16a96`). 0 src/js delta at the tip.
- #2590 stays OPEN on the serve half. The mechanism is unmeasured,
  not falsified: the next lever needs an M1 awareness term first, or
  a band where holders actually fight.
- CORRECTION to the arm evidence draft: its wall line said wave-5 1/8,
  median 147d. The analysis JSON says wave-5 4/8, median 150d
  (per-seed maxWave 5 on 107173, 107174, 107177, 107178). The JSON
  governs.

## Wall (arm legs, 8 seeds each)

| | shape2 arm | m2step2 arm |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National | 0/8 | 0/8 |
| Table | 0/8 | 0/8 |
| Wave-5 reached | 3/8 | 4/8 |
| Wave-4 reached | 8/8 | 8/8 |
| Median survival | 150d | 150d |
| Community-lost | 3/8 | 3/8 (107171, 107172, 107178) |

All 8 seeds regional on both legs. Panel compares: shape2
`review_required`, m2step2 `review_required` — no material signal on
any row; table win 0 -> 0, national 0 -> 0 on both.

## Telemetry

`telemetry-check` was NOT run for this round; no scale-wall baseline
exists for it. Recorded, not invented: there is no telemetry baseline
to compare these panels against.

## Gate

`node scripts/check.js --quick` ran on the merged tip `2b97163b0` in
the sim-shape2-a worktree (344 scripts, 4 parallel, 1194s):
**334 passed, 10 failed.** All 10 failures are adjudicated standing /
not lever-attributable: the measurement-proof staleness family (3 —
test-measurement-proof-update.js "Proof source inputs are not current";
test-measurement-workflow.js "retained neutrality proof covers the
current Game/controller/harness inputs"; test-measurement-cache-flags.js
"both actual CLI configurations complete valid neutral panels", same
root cause — the retained proof is stale vs current inputs) + the
phone-frame stale receipt (1 — test-phone-frame-proof.js, retained
browser inputs do not match current source) + six 120s timeouts under
load (test-living-garden-deed-attainment.js,
test-occupation-panels.js, test-one-person-army-deed-attainment.js,
test-trust-observer-neutrality.js, test-synergy-stall.js,
test-capable-bot-20261014.js — all exit null at ~120.1s, timed out,
never asserted). This round changed 0 src/js and no
collector/contract inputs, so the staleness predates it; the proof
refresh rounds 11 + 12 are owed separately. Arm proofs are green on
the rebased tips per the 1830Z/2015Z precedent — with the qualification
that the post-revert proofs are green-by-design (m2step2 33/41 with
the 8 reverted-leg failures named; shape2 fataling at the removed
method after 10 fixture passes, selftest 101/101). No check.js was
running from the r262, r151 or 0430Z adoptions at closeout (ps
verified, none found).

## Flap

- Earlier window 04:46:04Z–~04:58Z Nov 21: closure already reported
  in the executive update for the shipped cycle (folded in there).
- NEW window: onset ~10:09–10:10Z Nov 21, cleared ~10:13Z (about 4
  minutes — a brief blip). The flap watcher caught it at 10:10:07Z
  (write EPERM, update-ref rc=128, fsync-rename EPERM in python and
  node) and it was still failing at 10:11:11Z; watcher probes passed
  again at 10:13:16Z and the coordinator's own update-ref probe
  passed at 10:13:32Z. It blocked 4 rebase attempts on sim-m2step2-a
  (all `fatal: could not write to .../rebase-merge/head-name:
  Operation not permitted`) and an update-ref probe, while plain
  shell writes to the same paths succeeded — the usual selective
  signature. One rebase attempt left a partial `rebase-merge`
  directory (no commands done, HEAD never moved); it was removed
  before retrying. Both branches were rebased and merged after the
  window cleared (m2step2 `babcf2c9a`, shape2 + round record
  `2b97163b0`).

## Lock / claim

`fleshout-loop.lock` was NOT FOUND at closeout: a find across
~/workspace returned no `fleshout-loop*.lock` file and no `*.claim`
file. The lock (run_id `fleshout-20261121T0715Z`) was verified
present at adoption start. Its removal is unattributed — possibly a
sibling stale-lock recovery (the lock was ~3h old at closeout) or
the reaper. No other Loop A work is live (no live Loop A coordinator
processes; the only live procs were this adoption's hbloop and the
two pilot drivers, both finished). There is nothing to delete, and
the lane is free; this absence is recorded here instead of a delete.

## Closeout mechanics (for the record)

- Index clobber struck on nearly every safe-commit in both arms
  (MM, or staged-D + untracked on the same files). Repaired each
  time via `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`; every commit verified blob-identical to the
  worktree files before proceeding.
- --force-delete used twice, both verified exact-inverse reverts:
  m2step2 substrate revert (coordinator approval held for it) and
  shape2 lever revert (same class; the plain commit was refused as
  the stale-tree signature).
- Analyzer stdout note (shape2): the console summary's arm
  `poolFights` prints 0 — a duplicate-key shadowing
  (`armPool.fights` overwrites `armPres.poolFights` in the printed
  object). The saved JSON's `arm.presence.poolFights` is 101
  (ctl 221). Not a verdict input.
- Heartbeats ran until session end (5-min hbloop, both arm trees).

## Commits

- sim-m2step2-a (base 9070aaf70): prereg `5dfeb76bc`, correction
  `dc614732a`, substrate `d6508a67e`, lever+instrument `17aa0a1fa`,
  analyzer fix `d34e19b9e`, substrate revert `b94b28e58`, lever
  revert `da26f7cfc`, evidence `83a01d139`, hash-fill `da1b16a96`.
  Merge: `babcf2c9a`.
- sim-shape2-a (base 9070aaf70): prereg `e12b830c6`, amendment
  `0d0541a06`, lever+instrument `638205b2c`, lever revert
  `2464bf2e9`, evidence `c591db4a3`, hash-fill `0ab2a5236`.
  Merge: `2b97163b0`.
- Round record: this commit `2b97163b0` (on sim-shape2-a,
  merged with that arm; the hash-update commit that filled these
  placeholders follows it).
