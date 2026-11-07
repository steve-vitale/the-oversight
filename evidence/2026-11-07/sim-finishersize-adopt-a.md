# sim-finishersize-adopt-a — adoption + re-judge of the committed finish on the ADDRESSABLE-WINDOW metric

- Run: fleshout-20261107T0515Z, Loop A arm sim-finishersize-adopt-a (tracker blank #1, finding #1829)
- Prereg: evidence/2026-11-07/sim-finishersize-adopt-a-prereg.md (binds this run, MEASUREMENT §14)
- Lever: the committed finish from the stranded sim-finishersize-a branch (0221Z run), adopted and rebased onto master 41007b9d4 — no game-code change in this run
- Seeds: 99421–99436 (16 seeds, freshness-verified in the prereg), competent policy, 150d death-aware horizon
- Verdict: **DIAG** — the corrected metric is unjudgeable in the wild a second time: **0 addressable meetings in 16 seeds** (0 below-break meetings at all). The wall-seeded fallback was attempted and its harvest is empty of addressable shapes (1 wall-delivered meeting, non-addressable by clause 3). The conversion rate stays unmeasured; the mechanism evidence remains the 89/89 engine proof.
- Status: branch rebased and verified, **ready to merge** (coordinator merges with --ff-only; no push, no bump, no live verification by this arm)

## Phase A — adoption / landing verification

The stranded branch (tip 2f16d8817, 4 commits) was rebased onto master
41007b9d4 (read in the main tree immediately before rebasing; `git rebase
<sha>`, never `git rebase master`). The rebase hit the known stop-at-pick
quirk: it stopped at the 2nd pick (254682f72) appearing in BOTH the done
and todo lists, worktree clean, the pick's changes unapplied (fsCommit
count 0 in fieldFights.js). Per the recorded recovery, `git rebase
--continue` sailed through the remaining picks. Rebasing done, new tip
aa49a1a34 + prereg commit 9546beb0c on top.

Rebased-tip verification (all on the rebased tip, before any judged sims):
- Proof test `scripts/test-finishersize-20261106.js`: **89 passed, 0 failed**.
- `test-twoblow`: 77/77. `test-contactfinish-confirm`: 9/9. `test-contactbreak`: 40/40.
- `test-contactfinish-20261031.js`: 35 passed, 4 failed — the SAME 4
  pre-existing failures as on pure HEAD (E2, E4, E6, E7, identical numbers),
  unchanged by this work; not chased.
- `src/js/fieldFights.js` change intact: +126/−7 vs master, fsCommit
  present (7 matches). Evidence + pilot corpora intact (8/8 baseline and
  armed pilot seeds present, re-derived by the addressable proof test).
- `node scripts/check.js --quick`: started in this run; see "Check status"
  below (honest status, not a claimed pass).

## Phase B — the re-judge (addressable-window conversion rate)

### What the metric is

Addressable (A): a wave-4+ below-break contact meeting whose contact strike
did not kill, with post-contact HP strictly greater than the contact strike,
intent `engage`, and fighter entry HP ≥ 60%. Convertible (C): A with
post-contact HP ≤ 3× the contact strike. Primary: conversion rate =
FS committed kills / |A|. GO ≥ 0.50 with every C meeting firing a commit;
DIAG if |A| = 0. Full definition in the prereg.

### Before / after on identical seeds (99421–99436, competent, 150d)

Analyzer: `scripts/finishersize-analyze-20261106.js --compare` (extended
this run with `isAddressable` / `isConvertible` / addressable funnel;
proof `scripts/test-finishersize-addressable-20261107.js` 40/40, including
the pilot-corpus re-derivation).

| Primary (addressable funnel) | Baseline | Armed | Delta |
|---|---|---|---|
| Below-break meetings (wave-4 field) | 0 | 0 | 0 |
| Below-break kills | 0 | 0 | 0 |
| Addressable meetings \|A\| | **0** | **0** | — |
| Addressable convertible \|C\| | 0 | 0 | — |
| Addressable above-tail | 0 | 0 | — |
| FS commits on addressable | 0 | 0 | — |
| FS committed kills | 0 | 0 | — |
| Conversion rate | null | null | **unjudgeable** |
| Convertible commit rate | null | null | — |

The wild produced no below-break meeting at all on this band — not a
near-miss on the addressable clauses, but zero meetings entering the
funnel. Wave-4 field fights: 112 per leg, 0 below-break. Even the
near-window is empty: 0 wave-4 field fights entered below 30% HP on
either leg (the pilot had 5 such meetings, including the two below-break
ones). The lever never had a meeting to work on; the armed leg is a
neutrality demonstration again — per-seed days, endReason, standing,
maxWave, wave-4 kills and scholar deaths are IDENTICAL on all 16 seeds,
and the field-fight rows are byte-identical across legs (verified by a
per-seed row comparison, 16/16 identical).

Guards (all hold exactly):

| Guard | Baseline | Armed |
|---|---|---|
| Field-fighter deaths (wave-4+ field vDie) | 17 | 17 |
| Scholar deaths | 157 | 157 |
| Wave-4 kills, all channels | 30 | 30 |

Wall numbers (identical both legs): median survival 122d (range 54–150),
won 0/16, national 0/16 (all village rank), wave-4 unlock 15/16, wave-5
unlock 1/16, wave-4 kills 30, wave-5 kills 1, scholar deaths 157,
instrument errors 0. No win movement either way; nothing to investigate.

Per-seed armed leg (driver lines; baseline identical on every seed):
99421 d150 survived (w4field 12, w4kills 4); 99422 d150 survived, maxWave
5, standing 250 (5, 3); 99423 d77 lost (16, 3); 99424 d109 lost (3, 0);
99425 d121 lost (16, 1); 99426 d123 lost (8, 1); 99427 d149 lost (6, 3);
99428 d150 survived (8, 3); 99429 d98 lost (4, 0); 99430 d54 lost,
maxWave 3 (0, 0); 99431 d133 lost (7, 2); 99432 d128 lost (5, 5);
99433 d103 lost (14, 1); 99434 d133 lost (1, 0); 99435 d96 lost (4, 2);
99436 d81 lost (3, 2).

### The wall-seeded fallback (pre-registered; attempted, not assumed)

The prereg's fallback triggers on |A| = 0: harvest wall-delivered
below-break meetings from the pilot corpus plus the new band's corpus
(same `instId` left at higher HP in an earlier fight, re-entering lower
with no villager damage in between), and re-drive their (meetHp, strike)
shapes through the real engine on both legs, judging the same conversion
rate. Harvest result, run before writing this evidence:

- New band (both legs): **0 below-break meetings — harvest empty.**
- Pilot corpus: 2 below-break meetings. 99667 d109 (Sujinda vs The
  Strike, 34 HP) IS wall-delivered by the rule: same instId w35 left at
  284 HP in the prior meeting, re-entered at 34 HP. 99664 d104 (Devon vs
  The Eulogy, 17 HP) is NOT wall-delivered by the rule: the prior meeting
  left it at 17 HP and it re-entered at 17 HP — the d101 fight softened
  it, not the wall (the 0221Z evidence's "the wall delivers it to 17 HP"
  line was loose; the numbers say the fight did).
- The single harvested shape is (meetHp 34, strike 26): post-contact HP 8,
  which FAILS clause 3 (8 is not > 26) — it is not addressable. Re-driving
  it would re-prove the pilot result (commit fires, kill in round 1 — the
  armed pilot leg already shows exactly that) and leave |A| = 0. It cannot
  judge the conversion rate.

So the fallback was attempted and its harvest is empty of addressable
shapes; no re-drive was built, because it would be theater — it cannot
change |A|. The engine-level proof test already covers this shape class
far more thoroughly (30/30 commits and commit-kills at 41 HP,
herald+ally; 27/30 solo). The conversion rate remains unmeasured in the
wild at every scale tried.

### Verdict, honestly

**DIAG — no verdict on the conversion rate.** |A| = 0, so the prereg's
GO bar cannot be applied and per §14 the metric is not re-scored. This
is the second consecutive band with a 0 addressable pool (pilot: 2
below-break meetings, 0 addressable; this band: 0 below-break meetings,
0 addressable). Combined: **24 seeds, 186 wave-4 field fights, 2
below-break meetings, 0 addressable meetings.** The below-break meeting
itself is the rare event (~1 per 93 wave-4 field fights), and the
addressable subset of it has never appeared in a sim. The lever's field
effect is unmeasurable by sims at this scale — not because the lever is
dead (the engine proof is 89/89 and the one live firing converted), but
because the window it serves barely exists in the wild.

That scarcity is itself the finding for the winnability chain: the
wound-mill ruling's "finish a crippled beast you meet if you can" almost
never gets a meeting to act on, because beasts met in the field are
almost never already below their break line — the wall softens them, but
the softened beast is then met in a turn-based relay or not at all, and
the field meeting that does happen is usually a fresh, full-HP beast.
Any future judgement of this lever needs a corpus that puts softened
beasts in front of field fighters on purpose (a seeded wall-delivery
instrument that constructs the meeting, not one that waits for the wild
to produce it) — or acceptance that the lever is engine-proven and
field-unmeasurable, and the axis moves on.

## Reachability / village assessment

- The content is reachable at engine level (89/89 proof) and fired once
  in live sims (pilot 99667 d109). It did not fire on this band because
  the window never opened.
- Villagers act like people: unchanged from the 0221Z assessment — the
  commit is gated on intent, health, and the beast being small enough to
  actually die. No new dialogue was produced on this band (no commit
  fired), so there is no new narration to sense-test.
- The binding link in the winnability chain is unchanged: wild wave-4
  kills are 0 field kills on this band (all 30 wave-4 kills came through
  other channels), no village banked two living wave-4 killers or sat,
  national 0/16, wins 0/16. The scale wall stands exactly where the
  tracker left it.

## What was NOT touched (guardrails)

- No game-code change in this run at all. The only code touched is the
  analyzer extension (`isAddressable` / `isConvertible` / addressable
  funnel) and the addressable proof test (scripts only).
- No rounds-cap change, no armor-ignoring hits, no Eulogy
  counter-dismissal change, no gate/price/deed/readyDemand change, no
  win-price change.

## Incidents in this run (for the coordinator)

- **VM/runtime restart mid-run (~06:08Z):** the first armed-leg driver
  process vanished after 3 seeds (session record gone, no process, no
  error) — `uptime` showed the box 4 min old afterwards. The 3 completed
  seed files were intact; the leg was resumed for the remaining 13 seeds
  (99424–99436) with the driver's refuse-to-overwrite guard, and all 16
  completed. No seed was run twice; no file was overwritten.
- **Registry lock contention:** `worktree-heartbeat.sh` twice waited
  minutes on `REGISTRY.lock` (sibling loops heartbeating concurrently;
  a journey-landing heartbeat loop has been running 1.5h+). Both
  heartbeats eventually landed. Nothing was lost, but the lock queue is
  slow under a full fleet.
- **safe-commit index clobber (again):** after the prereg commit
  9546beb0c, the main index showed the 3 committed files as deleted /
  modified-stale. Commit verified correct by hash; index repaired from
  HEAD with `git update-index --add --index-info`; `git status` empty
  and `git diff HEAD` empty afterwards. Same clobber class as the 0221Z
  run's three commits.

## Commits (this branch, rebased onto master 41007b9d4)

- c0752a33d — prereg (0221Z run)
- f499708c4 — [needs-eyes] lever in src/js/fieldFights.js (+126/−7) + proof test (0221Z run)
- 480a6f8c2 — [needs-eyes] analyzer: count FS commits by fsCommitMhp (0221Z run)
- aa49a1a34 — [needs-eyes] evidence + pilot corpora, DIAG-GO (0221Z run)
- 9546beb0c — adopt-a prereg: addressable-window metric (fresh band 99421–99436, GO ≥ 0.50, DIAG on 0 addressable); analyzer gains isAddressable/isConvertible + addressable funnel, proof test 40/40 incl. pilot re-derivation
- (this evidence file + corpus, to commit next)

## Corpus

- evidence/2026-11-07/perseed-finishersize-adopt-a/fs-s994{21..36}-finishersize-adopt-a-baseline.json (16 files)
- evidence/2026-11-07/perseed-finishersize-adopt-a/fs-s994{21..36}-finishersize-adopt-a-armed.json (16 files)
- Tooling: scripts/finishersize-analyze-20261106.js (extended), scripts/test-finishersize-addressable-20261107.js; reused scripts/finishersize-instrument-20261106.js, scripts/finishersize-driver-20261106.js, scripts/test-finishersize-20261106.js

## Convergence state

- Finding #1829 (finisher-size): lever built, proven at engine level,
  safe — field effect unmeasurable in the wild at every scale tried
  (0 addressable in 24 seeds / 186 wave-4 field fights). Status: DIAG,
  held for a constructed wall-delivery instrument or accepted as
  engine-proven / field-unmeasurable — not killed, not converged.
- Balance panel (§15): not run. The panel runs its own full panel and
  takes no corpus input (same as grind-a and the 0221Z run); the
  pre-registered primary comparison is the identical-seed FS corpus,
  whose wall numbers are byte-identical on all 16 seeds. A full panel
  re-run cannot change a verdict whose delta is 0.
- Blanks filled: the corrected metric is now built, proven (40/40), and
  judged twice — the field never produces an addressable meeting. Blank
  remaining: a constructed instrument that puts softened beasts in front
  of field fighters on purpose.

## Metric review (§14a, to carry to the next run)

- The corrected metric was the right correction (it excludes exactly the
  meetings the old code already converts), but it is unjudgeable in the
  wild: the addressable window has now produced 0 meetings in 24 seeds.
  The metric is not wrong — the phenomenon is rarer than the sims can
  see. The next run should not re-run a wider wild band hoping for a
  meeting (doubling the band doubles the zeros at ~1 below-break meeting
  per 93 wave-4 field fights); it should build the constructed
  wall-delivery instrument the prereg's fallback named, seeding meetings
  from observed wall-delivered shapes, or close the question as
  engine-proven / field-unmeasurable.
- The fallback's harvest rule needs a correction: "wall-delivered" as
  written (re-enters lower than the prior meeting left it) excludes the
  99664 d104 shape, which the 0221Z evidence narrated as wall-delivered
  but the numbers show was fight-softened (144 → 17 in the d101 fight,
  re-entered at 17). A future harvest should distinguish "softened by
  the wall between meetings" from "softened by a previous fight" with the
  inter-fight damage source recorded, not inferred from entry HP alone.
- The scarcity rule's literal trigger should be pool size (|A|), not
  meeting count — carried over from the 0221Z review; this run's prereg
  already did that (DIAG on |A| = 0).

## Check status

- Targeted suites on the rebased tip: twoblow 77/77,
  contactfinish-confirm 9/9, contactbreak 40/40, finishersize proof
  89/89, addressable proof 40/40, contactfinish-20261031 35/4 (same 4
  pre-existing failures as HEAD).
- `node scripts/check.js --quick`: RAN TO COMPLETION this run (1005s):
  **282 passed, 8 failed** (exit 1). All 8 attributed by re-running each
  failing script standalone on pure master code (`git checkout master --
  src/js/fieldFights.js`, then restore + proof 89/89 re-verified):
  - 7 fail IDENTICALLY on master: `test-measurement-proof-update.js`
    (proof source inputs not current), `test-measurement-workflow.js`
    (retained neutrality proof coverage), `test-mobile-combat-cadence.js`
    (Continue wrap), `test-occupation-panels.js` (real CLI workflow),
    `test-phone-frame-proof.js` (retained browser inputs stale),
    `test-establishment-r20-fixes-20261020.js` (next-day voices 2 vs 1),
    `test-capable-bot-20261014.js` (standalone on master: 39 passed, 1
    failed — food-deed assertion; in check.js it hit the 120s per-script
    timeout instead, which is load, not a different failure). All
    pre-existing on master; none touched by this arm (no game-code change
    in this run, and the 0221Z lever is not in their paths — the
    proof/phone staleness predates the branch).
  - 1 is a timing flake, not a lever effect:
    `test-measurement-cache-flags.js` failed in check.js ("both actual CLI
    configurations complete valid neutral panels"). Standalone it passes
    on master (4/4) and fails on armed (3/1) — but the failure is a
    30s spawnSync timeout (status null), and direct runs of the panel it
    shells out to exit 0 on BOTH legs: armed 22.3s wall, master 27.9s
    wall, against the test's 30s timeout (user time ~2.6s both — the box
    is slow, the panel is not). Armed was faster than master. The
    check.js failure is load/timing, not a panel-logic change from the
    lever (a day-1, seed-7, zero-policy panel cannot reach a wave-3+
    field fight anyway).
