# sim-applystatus-a — applyStatus freeze-line dedup

Run: fleshout-20261113T1115Z (Loop A), arm sim-applystatus-a
Axis: scale-onramp (tracker blank #2; sim-findings.md #2294)
Branch: sim-applystatus-a — worktree ~/workspace/worktrees/sim-applystatus-a
Base: master 6a16152d5 (prereg anchor 77d468d8b); local master tip
a1288c5c4 is a version-bump-only commit, so 6a16152d5 IS current master
for every src file this arm touches.
Date: 2026-11-13
Coordinator: adoption (worker done; evidence file, diagnostic replay,
gate, rebase and merge are the adoption coordinator's).

## Verdict: GO

The applyStatus freeze line ("X is frozen — War Cry. (stunned: no
movement)") repeated ~10x per fight on current master, and the fix cuts
it to once per monster per fight with survival/wave numbers byte-identical
on all 9 seeds. All three pre-registered GO bars PASS (below).

## Check leg: REPRODUCES

Driver scripts/applystatus-check-driver-20261113.js, competent verbatim,
150d death-aware, seeds 190391–190398 + targeted 190407 (9 seeds).
Anchor-guarded (HEAD must equal the prereg commit 77d468d8b).

| seed | days | end | maxWave | standing | apply | max/day | worst group |
|------|------|-----|---------|----------|-------|---------|-------------|
| 190391 | 65 | village-lost | 4 | 145 | 1 | 1 d63 | 1 d63 The Algorithm |
| 190392 | 143 | village-lost | 4 | 199 | 0 | 0 | 0 |
| 190393 | 126 | village-lost | 4 | 199 | 4 | 4 d61 | 4 d61 The Reunion |
| 190394 | 128 | village-lost | 4 | 199 | 0 | 0 | 0 |
| 190395 | 150 | survived | 4 | 199 | 0 | 0 | 0 |
| 190396 | 140 | village-lost | 4 | 199 | 14 | 9 d130 | 9 d130 The Congregation |
| 190397 | 135 | village-lost | 4 | 199 | 0 | 0 | 0 |
| 190398 | 139 | village-lost | 5 | 370 | 6 | 5 d138 | 5 d138 The Influencer |
| 190407 | 133 | village-lost | 4 | 199 | 6 | 6 d123 | 6 d123 The Algorithm |
| TOTAL | | | | | **31** | | worst group 9 (190396 d130) |

Freezeline control 21 (matches the freezeline-a after-leg total, as the
prereg requires). Bellows 51. Verdict REPRODUCES — the old-base shape
(same day, same line, repeated) is still present on current master.

## Fix

`src/js/statusEffects.js`, applyStatus only (commit 1c3d4a2f7,
[needs-eyes]): once-per-monster-per-fight dedup via a flag on the live
fight object (`f._seApplyAnnounced[key + ':' + effectId]`, keyed by
fighter key + effect, only when the target is actually a fighter in the
live fight). The stun MECHANIC is untouched — entry refresh, turnsLeft,
legacy bridge (m.stunned), resistance/immunity all behave exactly as
before; only the say() dedups. Out-of-combat / scholar applications (no
live tbfight) narrate every time, unchanged (never_silent holds outside
fights). Fail-open: any error announces, never silences. The tbMonsterTurn
site fixed by freezeline-a is untouched, and no file the sibling
combatdedup-b arm owns (game.js) is touched. Per-application dedup could
not fix this: every stun source is 1 turn, so each bellow IS a fresh
application — the dedup has to be per monster per fight, as built.

## After leg: 31 → 10

Same driver, same 9 seeds, run on the fix commit (anchor override via
EXPECTED_ANCHOR env — the guard still refuses any other HEAD; the
per-seed JSONs record anchor 1c3d4a2f7 and fixPresent=true, so a
mislabeled leg is impossible).

| seed | apply before → after | worst group after |
|------|---------------------|-------------------|
| 190391 | 1 → 1 | 1 d63 The Algorithm |
| 190392 | 0 → 0 | 0 |
| 190393 | 4 → 3 | 3 d61 The Reunion |
| 190394 | 0 → 0 | 0 |
| 190395 | 0 → 0 | 0 |
| 190396 | 14 → 2 | 1 d89 Big Loud |
| 190397 | 0 → 0 | 0 |
| 190398 | 6 → 3 | 2 d138 The Influencer |
| 190407 | 6 → 1 | 1 d123 The Algorithm |
| TOTAL | **31 → 10** | worst group 9 → 3 |

Freezeline control 21 → 21 (untouched). Bellows 51 → 51 (the bellow
still announces each fresh stun, as designed).

## GO bars (pre-registered)

- (a) Apply total never rises on any seed: PASS (every seed falls or
  holds: 1→1, 0→0, 4→3, 0→0, 0→0, 14→2, 0→0, 6→3, 6→1).
- (b) Every (day, line-text) group's size equals its distinct (fight,
  monster) count — verified by diagnostic replay for the two groups > 1:
  PASS. Diagnostic replay scripts/applystatus-diag-replay-20261113.js
  (seeds 190393 + 190398, same harness shape; replay reproduces the
  after-leg totals exactly: 3 and 3 lines, same days/endReasons):
  - 190393 d61 "The Reunion" ×3 = 3 distinct fighters (m_1 "The Reunion
    2", m_2 "The Reunion 3", m_0 "The Reunion 1") in ONE fight — three
    Reunion monsters, each announcing once. A 4th application (m_1
    again) was correctly suppressed.
  - 190398 d138 "The Influencer" ×2 = 2 distinct fighters (m_0,
    m_crew_1, both "RERUN ×2 The Influencer") in fight 4. (Fight 3's
    two silent applications never announce and never touch the flag.)
  - Model self-checks pass on both seeds (predicted announced count ==
    observed line count, per-day counts agree).
  - Method note: the replay's first version correlated each say() line
    to its applyStatus call with a per-call flag and came back all-false
    (0 announced apps against 3 real lines) — the say is not observably
    synchronous inside the applyStatus call from a wrapper, so per-call
    flagging cannot be trusted here. The landed version models the fix's
    dedup from the application stream (first non-silent application per
    (fight, key, effect) announces) and joins lines to applications by
    order within the day. Names are NOT string-matched: the line renders
    a display name ("The Reunion" for targets "The Reunion 1/2/3"),
    so string equality cannot join them.
- (c) Survival/wave numbers BYTE-IDENTICAL on all 9 seeds: PASS.
  Verified by the adoption coordinator from the per-seed JSONs (days,
  gameDays, endReason, won, over, villageLost, scaleRank, maxWave,
  unlockedWave, standing, endPantryKcal, FULL deaths arrays — all
  identical check vs after on 9/9 seeds).

## Proof

`node scripts/test-applystatus-a.js` — **23 passed, 0 failed**
(instrument legs: regexes, grouping/judge boundaries, anchor checks).
`node scripts/test-applystatus-a.js --game` — **19 passed, 0 failed**
(game-level legs: G1 three bellows → one line + mechanic intact (stun
entry 1 turn, legacy bridge, turn consumed, scholar unhurt, monster
still); G2 two bellowed monsters → two lines, once each; G2b re-stun
after expiry → still one line total, re-stun still applies; G3 second
fight re-announces once; G4 scholar stun outside combat narrated twice,
You-form). Both re-run by the adoption coordinator on the fix commit.
(The fix commit message's "23/23 + 19/19 RED->GREEN" is these two modes.)

## Sense-testing carried findings (worker-filed, out of arm scope)

The worker's sense replay of the after-leg corpus (seed 190396 d89/d130,
260 kept fight-family lines) filed four new sim-findings.md entries —
same repetition class as the fixed freeze lines, different emit sites;
each needs its own arm before any fix claim:
- UNLEASH RAGE LINE REPEATS 17X IN ONE FIGHT (190396 d130,
  Congregation fight).
- STEEPLE RINGS LINE REPEATS 57X IN ONE FIGHT (190396 d130).
- STRIKE-AFTER-FALL ORDERING, second observation (d130 Congregation,
  d89 Static Kite).
- SQUARE SCREAMS LINE TWICE IDENTICALLY, second observation (d89).
The adoption coordinator did not independently re-verify these four;
they are recorded as filed.

## Metric review

The analyzer (scripts/applystatus-check-analyze-20261113.js) prints
"VERDICT: REPRODUCES" on the AFTER corpus too — that is the check-leg
label hardcoded in the analyzer, not the GO verdict. The GO verdict is
the prereg's bars (a)/(b)/(c), judged above; all three pass. A future
analyzer pass could print the GO-bar judgment for the after leg
directly instead of reusing the check label.

## Files

- src/js/statusEffects.js — the fix (commit 1c3d4a2f7).
- scripts/applystatus-check-driver-20261113.js — check/after driver
  (anchor override for the after leg: EXPECTED_ANCHOR env).
- scripts/applystatus-check-analyze-20261113.js — analyzer (check +
  after corpora).
- scripts/test-applystatus-a.js — proof test (23 instrument + 19 game).
- scripts/applystatus-diag-replay-20261113.js — bar-(b) diagnostic
  replay (model + order-pairing; method note in header).
- evidence/2026-11-13/perseed-applystatus-a-check/ — 9 check-leg JSONs.
- evidence/2026-11-13/perseed-applystatus-a-after/ — 9 after-leg JSONs.
- evidence/2026-11-13/applystatus-diag-replay.json +
  applystatus-diag-replay.log — replay output.
- evidence/2026-11-13/sim-applystatus-a-prereg.md — prereg.
- evidence/2026-11-13/sim-applystatus-a.md — this file.

## Finding

sim-findings.md #2294 marked [fixed 2026-11-13 by Loop A arm
sim-applystatus-a, run fleshout-20261113T1115Z: CHECK reproduces on
current master (31 lines, worst group 9 on 190396 d130); fix is a
once-per-monster-per-fight dedup at the applyStatus emit site
(src/js/statusEffects.js, f._seApplyAnnounced); after-leg on identical
seeds 31 -> 10 lines (worst group 9 -> 3; remaining groups are distinct
(fight, monster) pairs, diagnostic-proven); survival/wave numbers
byte-identical 9/9; freezeline control 21 -> 21. Proof
scripts/test-applystatus-a.js 23/23 + 19/19 game-level, RED->GREEN.
Evidence evidence/2026-11-13/sim-applystatus-a.md.]
