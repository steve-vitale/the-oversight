# sim-mootgate-a — verdict GO (Loop A, 2026-11-06)

Worker: sim-mootgate-a (Loop A, food-economy / narration).
Run: fleshout-20261106T1115Z, axis food-economy, arm sim-mootgate-a.
Assignment: BUILD the named moot-convening gate (follow-up to arm
sim-mootsummon-a, run fleshout-20261106T0821Z) and prove it
before/after on identical seeds. Prereg:
evidence/2026-11-06/sim-mootgate-a-prereg.md (committed BEFORE any
judged sim). Before leg on unfixed code (e4b0ecd13); fix committed
ce961ecd3 [needs-eyes]; after leg run 2026-11-06 by the main session
(the 1115Z coordinator timed out at 7200s; closeout finished
end-to-end in the main session). Seeds 48001–48040, 60 loop-days,
death-aware, policies bankfood(warmed(woodcarry(nighttravel))) over
competent, env COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
STRANDNARR=1.

## Verdict — GO (all three prereg bars hold)

| bar | before | after | threshold | pass |
|---|---|---|---|---|
| (a) stranded-loop-day summons | 1 (of 22 stranded loop-days) | **0** (of 22) | = 0 | YES |
| (b) non-stranded summons windows | 54 | 57 (1.06x) | >= 50% of before (= 27) | YES |
| (c) median daysAlive | 60 | 60 | >= before − 10 (= 50) | YES |

Sleep-window rate alongside: stranded sleep summons 1/22 windows
before → 0/22 after; non-stranded sleep summons 43/2184 → 44/2165.
Trial events 56 → 58; still-open at end 0 → 0; petition-kind
stranded events 0 → 0 (must stay 0).

## The fix (plain words)

Trial moots used to call the village together whenever the case was
ready — even while the scholar was sleeping in the forest miles
from home, with no way to hear the call or cast the vote the moot
demands. Now the call waits: the moot does not convene until the
scholar is standing at Haven. The two-day backstop is untouched (it
covers silence AFTER the summons, which can now only happen at the
fire, where silence is a choice). Cases where the scholar was exiled
are exempt — an exiled scholar has no vote to protect and may never
return. A moot the player calls themself in conversation is not
gated — that is a deliberate act by someone already at the fire.

## What the numbers say

- The defect fired exactly once in 40 seeds before the fix: seed
  48006, loop-day 9, a trial summons while the scholar slept
  stranded in the forest ("The moot turns to you. Your vote
  matters here — and everyone will remember it."). After the fix
  the scholar is still stranded on loop-days 7–10 on that seed,
  but no summons fires on any stranded day. The same case
  (NIKOLAI, DANTE and PAUL accused) convenes on loop-day 12
  instead of 10, at Haven, in the harness phase, with the
  identical summons line, and resolves by backstop + verdict
  count + verdict. The gate delays the moot; it does not lose it.
- Convening is preserved, not just above the bar: 58 trial events
  after vs 56 before; non-stranded sleep summons 44 vs 43. Moots
  still convene at Haven.
- Stall (held-open case duration): max held days 3 after (2
  before), median 1 both legs; max stranded-days-during-hold 2
  both legs. No case held > 14 days — the flag never fires. The
  longest hold is the 48006 case itself (eligible day 9, convened
  day 12 — 3 days, 2 of them stranded).
- Resolutions keep the same shape: backstop + verdictCount +
  verdict 51 → 54; dead-case-only 4 → 3; both 1 → 1. No event
  still open at end in either leg. The dead-case classifier works
  in both legs.
- The two never-resolved mootsummon cases are answered: 48006
  loop-day 19 and 48039 loop-day 13 both resolve via the dead-case
  line in the BEFORE leg — closed by accused death, not stuck at
  awaitingPlayerVote. In the after leg 48039 ld13 again resolves
  dead-case; 48006 ld19 never fires (different trajectory — that
  seed's case set diverges after the gate).
- One seed flipped survival: 48006 survived 60 days before, died
  day 41 after, in a monster-heavy collapse (deaths days 32–40).
  The gate delays that seed's moot by 2 days and the trajectories
  diverge after it; the prereg's survival bar is median-based and
  passes 60 vs 60 (mean 55.2 → 54.8). Noted, not hidden; not a
  verdict-changer — but it is the one seed where the fix's timing
  change is visible in the survival column, and the per-seed table
  below keeps it visible.

Per-seed (stranded loop-days / stranded-with-summons /
non-stranded-with-summons | daysAlive, before → after):

| seed | before | after | days |
|---|---|---|---|
| 48001 | 0/0/4 | 0/0/4 | 60/60 |
| 48002 | 0/0/0 | 0/0/0 | 55/55 |
| 48003 | 0/0/4 | 0/0/4 | 40/40 |
| 48004 | 0/0/0 | 0/0/0 | 60/60 |
| 48005 | 0/0/4 | 0/0/4 | 60/60 |
| 48006 | 4/1/2 | 4/0/5 | 60/41 |
| 48007 | 0/0/0 | 0/0/0 | 31/31 |
| 48008 | 0/0/0 | 0/0/0 | 60/60 |
| 48009 | 0/0/0 | 0/0/0 | 60/60 |
| 48010 | 0/0/0 | 0/0/0 | 52/52 |
| 48011 | 0/0/0 | 0/0/0 | 59/59 |
| 48012 | 0/0/1 | 0/0/1 | 17/17 |
| 48013 | 0/0/0 | 0/0/0 | 60/60 |
| 48014 | 0/0/3 | 0/0/3 | 38/38 |
| 48015 | 0/0/0 | 0/0/0 | 60/60 |
| 48016 | 0/0/4 | 0/0/4 | 60/60 |
| 48017 | 0/0/0 | 0/0/0 | 60/60 |
| 48018 | 1/0/0 | 1/0/0 | 60/60 |
| 48019 | 0/0/0 | 0/0/0 | 60/60 |
| 48020 | 0/0/3 | 0/0/3 | 60/60 |
| 48021 | 1/0/4 | 1/0/4 | 60/60 |
| 48022 | 0/0/0 | 0/0/0 | 60/60 |
| 48023 | 0/0/5 | 0/0/5 | 60/60 |
| 48024 | 0/0/2 | 0/0/2 | 60/60 |
| 48025 | 0/0/2 | 0/0/2 | 60/60 |
| 48026 | 0/0/2 | 0/0/2 | 60/60 |
| 48027 | 0/0/1 | 0/0/1 | 60/60 |
| 48028 | 0/0/0 | 0/0/0 | 60/60 |
| 48029 | 5/0/3 | 5/0/3 | 60/60 |
| 48030 | 0/0/1 | 0/0/1 | 60/60 |
| 48031 | 0/0/2 | 0/0/2 | 60/60 |
| 48032 | 3/0/0 | 3/0/0 | 60/60 |
| 48033 | 0/0/1 | 0/0/1 | 34/34 |
| 48034 | 0/0/0 | 0/0/0 | 60/60 |
| 48035 | 0/0/0 | 0/0/0 | 26/26 |
| 48036 | 0/0/0 | 0/0/0 | 60/60 |
| 48037 | 0/0/0 | 0/0/0 | 57/57 |
| 48038 | 0/0/5 | 0/0/5 | 60/60 |
| 48039 | 0/0/1 | 0/0/1 | 60/60 |
| 48040 | 8/0/0 | 8/0/0 | 60/60 |

Every seed except 48006 is byte-identical on daysAlive between legs;
48006 is the only survival flip. Stranded loop-days are identical
per seed between legs (22 total both) — the gate changes moot
timing, not travel. Non-stranded loop-days differ slightly in total
(2184 → 2165) because trajectories diverge after moot timing
changes; the convening bar uses counts, which is the right shape.

## Sense verdicts

- The held moot reads sensibly: same accused, same summons line,
  convened three days later at Haven instead of in the forest, and
  resolved normally. Nothing in the delayed moot's transcript
  references the scholar being away — the hold burns no "first
  time" convening line while the scholar is away, as designed.
- The fix's one visible cost is timing, not content: cases wait up
  to 3 days for the scholar to come home. No case waited longer
  than 3 days on this band; the 14-day flag exists for wider bands.
- The 48006 death is the honest caveat: delaying justice by 2
  days on that seed coincides with a village that then dies to
  monsters. The transcript gives no line tying the death to the
  moot — the collapse is combat deaths, not an unheld trial — but
  a 2-day delay is a real timing change on a live system, and the
  evidence keeps the seed visible rather than averaging it away.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The defect fired once in 40 seeds (1/22 stranded loop-days).
  Bar (a) — "after = 0" — is a weak instrument at this rarity: a
  single-event bar can pass by luck on a band where the defect
  barely fires. The next gate arm of this shape should
  pre-register a larger seed band, or a second defect seed, if the
  defect is this rare. The bar held as written; this is a review
  note, not a re-score.
- Non-stranded loop-days are not a stable denominator across legs
  (2184 → 2165 on identical seeds) — trajectories diverge after
  the gate changes moot timing. Bar (b) uses counts, which is the
  right shape; future arms should not treat the non-stranded day
  count as fixed.
- Judging survival on a median hides single-seed flips (48006:
  60 → 41). For a feel change like justice timing, the per-seed
  survival table belongs in the evidence even when the bar passes
  — included above.

## Wall numbers (carried, NOT re-measured)

Carried from the prereg (0915Z round, 24 distinct seeds): wins
0/24, national 0/24, table 0/24, wave-5 0/24, readiness-5-ready
days 0/24. Consistent with the 0028Z round: wins lesser-only, full
seat 0, wave-5 kills 0.

## Commits (this worktree branch sim-mootgate-a)

- ee416c188 instrument: dead-case classifier + LIVE accused-set +
  mootgate driver (5-day follow-up, case identity, loop-day
  primary, stall snapshots) + proof 27/27.
- 5ce7fb03e stall-fix: resolved-without-trial cases stop counting
  on their resolution day (was 49d overstatement on 48040 case_2)
  + regression check.
- e4b0ecd13 before leg: 40 seeds 48001–48040 on unfixed code —
  stranded loop-day summons 1/22, 56 events all trial, 48006 ld9
  hit reproduces.
- ce961ecd3 fix [needs-eyes]: mootConveneHeld() gate in
  src/js/betrayal.js (+34 lines): trial-moot convening (both
  npcMootTick and playerCaseTick) holds until the scholar is at
  Haven; exile exception; fail-open on missing reader; 2-day
  backstop untouched. Proof 60/60 with substrate env set
  (COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
  STRANDNARR=1) — without the env only 45/45 run and 15 seed-leg
  checks SKIP.
- After leg run 2026-11-06 by the main session (40/40 seeds, exit 0)
  + this evidence file.
