# Journey endgame r50 — FIGHT-OUTCOME CENSUS + FIGHT-DON'T-TALK (lane B, pre-registration 2026-10-25)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
This run takes r49's two named next steps, in order, on r49's substrate exactly.
No src/js changes. No game-balance change is proposed or expected; the only
behavior change is the env-gated, default-off Walk In decline (policy side).

## The two gaps (from r49's run note, 2026-10-24)

1. FIGHT-OUTCOME CENSUS. r49 counted committed wave-4 fight DECISIONS
   (23/41/2 turns) but not fight OUTCOMES: a 0-kill result could not say
   whether fights end in monster flight, party retreat, talk-down, or
   death. r50 records, for every COMMITTED wave-4 fight (vetcommit's
   commit flags set, monster wave >= 4), one primary outcome plus flags:
   - vKill: a wave-4+ waveKillLog entry lands during the fight.
   - vDie: a roster member dies during the fight.
   - talkDown: the capture slice contains the Walk In stand-down line
     ("they listen. They stand down." / "Walk In: the fight ends.").
   - vFlee: the last fighter snapshot before the fight ends shows the
     player or a villager fled.
   - mFlee: the last fighter snapshot shows a monster fled, or the
     capture slice contains "It got away".
   - otherEnd: none of the above (includes dissolved/timeout/encounter
     ends with no named line — reported as otherEnd, never renamed).
   Precedence for the PRIMARY outcome (flags are all recorded, so the
   precedence hides nothing): vKill > vDie > talkDown > vFlee > mFlee >
   otherEnd. A fight that both kills and loses a villager is primary
   vKill with dieFlag set — bravery's price stays visible.
   Non-committed wave-4 fights (commitLive false, e.g. scholar under 50%
   HP) are tallied separately as nonCommittedW4, never silently dropped
   and never counted as census fights.
2. FIGHT-DON'T-TALK. r49's upstream finding: wave-4 encounters on 88043
   resolved by TALK (Walk In on The Algorithm, The Congregation, The
   Reunion), and companion damage is single digits vs 850–1500 HP pools.
   r50's single variable vs Arm A: CAPABLE_NOWALKIN_W4=1 declines
   peacemaker.walk_in ONLY when a wave-4+ monster is in the fight
   (capable.js ACTION_PLAN entry, env-gated, default off; other stall
   verbs — scream, bellow, sand, stare — still fire, and Walk In still
   fires on wave <= 3). Vetguard stays in the substrate on both arms:
   the day a kill lands, it is the rule that defends it.

## Arms (same substrate, one variable)

Substrate on every waves seed (r49 exactly): capable base + deedhunt
(deedPatrol + surgeUpkeep) + vetcommit + greedy deferral (defaults
MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag +
vetguard. FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1 (waves only), TELEMETRY_FULL=1. 180d, death-aware.
- Arm A (census road): seeds 88051, 88052, 88053 (waves).
- Control: seed 88054 (forcedrift, capable + relaygrey FORCEDRIFT=1,
  greedy OFF, armory OFF, vetguard OFF — r49's canonical control).
- Arm B (fight-don't-talk): seeds 88055, 88056, 88057 (wavesnw =
  waves substrate + CAPABLE_NOWALKIN_W4=1 on waves seeds only).
Seeds verified fresh: no 88051–88057 in prior endgame notes or probes
(targeted grep over r45/r49 notes and probes; the r49 seed block is
88041–88044). Baseline: r49's waves seeds (0/3 living veterans, 0/3
wave-5, 0/3 full seats, 0 wave-4+ kills, talk-downs on 88043).

## Leg question

On the r49 road, HOW do committed wave-4 fights end — and does refusing
to talk them down convert encounters into kills, and at what cost?

## What counts as an interesting finding

- A census distribution (talkDown dominating → the talk lever is the
  blocker; mFlee dominating → flight tuning; vDie dominating → bravery
  is priced in blood; otherEnd dominating → the instrument still misses
  the real end-state, named as its next gap).
- Arm B kills where Arm A has none, with the cost counted (vDie fights,
  fallen count, sat/win, pantry, full-seat blockers).
- Arm B kills at zero (same as Arm A) with a census that says why —
  also a finding, not a null: the conversion problem is then NOT the
  talk-down.
- A living veteran on either arm (the r46–r49 0/3 streak breaking).

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD (carried): >=5/7 seeds reach the window (announceDay != null)
  OR resolve via a voiced non-table path (r49's restatement).
- M2 CENSUS COMPLETE (THE instrument question): every committed wave-4
  fight on waves seeds carries a primary outcome (coverage 100%), AND
  >=2/3 Arm A waves seeds record >=1 committed wave-4 fight. If the
  census records nothing, the instrument — not the game — failed, and
  the run says so.
- M3 FIGHT-DON'T-TALK CONVERSION: Arm B total wave-4+ kills >
  Arm A total wave-4+ kills. (Kills first; veterans second — see M3b.)
- M3b LIVING VETERAN (carried): >=1/6 waves seeds ends with >=1 LIVING
  veteran. Expected NO-GO unless a kill both lands and survives — still
  binding as written, not softened.
- M4 WAVE-5 OPEN / FULL-SEAT REACH (carried): >=1/6 waves seeds unlocks
  wave 5 OR earns the FULL seat. Expected NO-GO on a one-veteran road
  (demand 2) — still binding.
- M5 VOICING CANONICAL (carried): 88054 (forcedrift, capable substrate,
  sit-promptly, greedy OFF, armory OFF, vetguard OFF) — bandCrossings
  >= 1 AND noticedCount >= 1.
- M6 GUARD NAMED (r48 metric-review scope, carried): every sat waves
  seed with deferDays >= 1 records a named window-end guard (not
  'unknown'). Same-day sits reported as fix verification, not scored.
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

## Instrument

- scripts/probe-endgame-r50-20261025.js (r49 probe + fight-outcome
  census wrapper on policy.fight + wavesnw plan + NOWALKIN env handling).
- scripts/analyze-endgame-r50-20261025.js (M1–M7 + REG + census table +
  Arm A vs Arm B comparison).
- scripts/policies/capable.js (NOWALKIN_W4 rule, env-gated, default off).
- scripts/test-nowalkin-20261025.js (proof: ACTION_PLAN walk_in under
  env on/off × wave 4/2 × outmatched).
- Gates: PILOT (88051 census arm + 88055 nowalkin arm, 180d sweep mode
  on one seed each — the census must show a recorded fight before the
  sweep expands); DET (instrument-on twice, 2x120d, seed 88051);
  FID (env unset: wrapped == pure capable+deedhunt, mini
  gameDays/won/alive/pantry).

## Metric review (standing, carried)

- M2's second clause (>=2/3 Arm A seeds with a committed fight) is a
  guard against a vacuous census: 100% coverage of zero fights proves
  nothing. If Arm A records fights but Arm B records none, that asymmetry
  is itself a finding (the variant changed encounter selection), not an
  instrument pass.
- Telemetry baseline (hidden_files/telemetry-baselines/endgame.json:
  maxTier 16, satPenalty 91) still describes long-deferral sits (r37),
  not guard-ended windows — r48/r49 both reported it EXPLAINED and did
  not roll it. Same rule here: LOUD lines are investigated, not
  auto-rolled.
- Balanced panel (§15): no panel comparison applies — zero src/js
  changes, no lever moved on the default path (NOWALKIN default off,
  census is read-only instrumentation). The comparison is r49→r50 via
  identical substrate plus the census, and Arm A→Arm B on one variable.
