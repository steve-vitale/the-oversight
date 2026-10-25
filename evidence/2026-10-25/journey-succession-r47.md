# Journey succession r47 — SCRIPTED DAY-5 REGIME + BEARER-OWN DELTA + EVENT-VS-DEED SPLIT (lane B, 2026-10-25)

Leg 7 (succession). Rotation-b 7 → 4 (endgame next). Seeds 26021–26025
(fresh band), competent policy, 5 phase-A days + scripted kill via the
REAL playerDeath ('a hushwolf') + 30d successor life. Instrument only,
zero src/js changes. Base master@2d1d35df2 at run start; a sibling landed
b283d4929 mid-run, so this branch was rebased onto it before merging
(proof test re-run after rebase; see Infrastructure).

Pre-registration: evidence/2026-10-25/journey-succession-r47-prereg.md
(instrument: scripts/journey-succession-r47-20261025.js + analyzer +
proof test, all new files in this commit).

## HEADLINE

The day-5 scripted regime works: all 5 kills staged (day 6 — five
phase-A calls from day 1), all 5 successors lived the full 30 days, and
the machinery held (funeral, machinery, meal gate, echo all green). But
two r46 questions did NOT narrow the way hoped:

1. The call census has a blind spot: one office move (26021, day 21,
   0 → 8) happened in the driven-convo window BETWEEN snapshots, so C1
   misses on the letter (26/27 moves matched). The move is explained,
   not a game bug — but the bar stays NO-GO until the instrument covers
   convo windows.
2. The event-vs-deed split does NOT separate diffuse from concentrated
   moves: every trust-move call on this band carries BOTH crisis and
   gift lines (26 of 26 trust moves are 'both' except 3 deed-only
   singles and 2 event-only calls on 26024). Whole-call presence is too
   coarse a classifier — a 90–130-line call contains everything. The
   trap stays open; the next step must classify finer than the call.

## Verdicts (binding, §14 — a miss is NO-GO, never re-scored)

- SCRIPT (staging): GO — 5/5 scripted, all day 6. No organic pre-emption
  before day 6. The arena band (r46's days 8–28) never got a chance to
  pre-empt, as designed.
- V1 (vouch snapshot): GO on the letter, VACUOUS in substance — 5/5
  n/a-none-eligible. A day-5 village has no trust>=60 villager, so the
  vouch contract went untested this run. That vacuity is the finding:
  the day-5 regime cannot test V1. Died-between still empty (third
  consecutive run).
- C1 (call attribution): NO-GO on the letter — 26/27 daily moves have a
  matching callMove; 26021 day 21 (0 → 8) has none. Investigation (see
  below) shows the move landed in the driven-convo window: the d20
  officeDaily snapshot (0) is pushed BEFORE the d+14 checkpoint convos
  run, and the next runDays call starts at 8 and ends at 8, so no
  callMove is recorded. Instrument coverage gap, not a game bug — but
  the 100% bar is missed and reported as missed.
- S1 (bearer-own delta, completeness): GO — 26/26 same-bearer callMoves
  carry a numeric bearerDeltaExact; 0 chain handoffs (no chains this
  run, so the null branch stays unexercised in the wild). Solo-office
  calls: only 2 in the whole run, both on 26024, deltas +2/−2 with
  bearerDeltaExact equal — the solo-office class closes as a
  sub-threshold drift artifact (movers threshold is 3), not a hidden
  mechanism. No solo call exceeded ±2 (0 instrument contradictions).
- S1b (single-mover split): 9 single-mover calls, ALL bearer-movers, 0
  other-movers. The "concentrated single-mover" pattern from r46 is, on
  this band, the bearer's own entry moving alone — trivially, since the
  office entry IS the bearer's trust. Other-mover singles do not occur.
- E1 (event-vs-deed, completeness): GO on completeness (26/26 trust
  moves classified), NO SEPARATION in substance — diffuse moves (6)
  are all 'both'; concentrated+single moves (20) are 15 'both', 3
  'deed-only', 2 'event-only'. The classification does not discriminate,
  so it cannot narrow the trap. See Metric review.
- M3v2b (echo, second run under the bar): GO — 4, 3, 2, 3, 3 (all >= 2,
  5/5). Loot exclusions 0 on all seeds this run (v2 == v2b everywhere).
  Two consecutive v2b GO runs (r46, r47); the bar stands.
- M1 (funeral arc): GO — 5/5. M4 (machinery): GO — 5/5 mantles clean
  (linOk + moOk). MG2 (meal gate): GO — 0 violations, 150 meal-days.
  M5 (people check): GO — 0 identity failures (driver) + sense-reads
  pass (below).
- Chain deaths: none this run (0 chains, all successors survived 30d),
  so chain cause-known is vacuous here; r45/r46 already exercised it
  (all arena, all cause-known).

## Village assessment in plain words

- 26021: Jorge → Vincent on day 6. Vincent's office crashed 23 → 4 →
  0 in the first five days, then crept back to 10 — while the village
  warmed from 13.7 to 80.9 (10 villagers over 60 by day 36). Pantry
  24,986. The office-lags / village-warms split from r43/r46, at its
  starkest: the new bearer is personally distrusted while the village
  itself becomes warm and fed.
- 26022: Giuseppe → Aki on day 6. The exception that proves the split
  is not a law: Aki's office climbed 18 → 46 while the village warmed
  to 55.2. Pantry 54,928, the richest village of the run. Aki's late
  run is a metronome: +6 office on five straight move calls (d31–d36),
  each a single-mover bearer call.
- 26023: Ruth → Domingo on day 6. The quiet village: only ONE office
  move in 30 days (18 → 20), pantry thin at 6,832, 9 alive. Nothing
  broke; nothing much happened. Echo exactly at the bar (2).
- 26024: Tyler → Emilio on day 6. The drift village: office wobbles
  18 → 16 → 13 → 15 → 17 → 15, with the run's only two solo-office
  calls (+2, −2). Pantry 15,252, 10 alive.
- 26025: Mario → Axel on day 6. The busy village: 11 office moves,
  Axel's office 19 → 30 via repeated +6/+7 single-mover bearer calls,
  one −35 crash on day 28 (44 → 9) then recovery to 30. Pantry 35,714,
  10 alive.

All five villages are alive, fed, and warming at day 36. Nobody
scattered, nobody starved. A day-5 death does not doom a village — the
mantle passing works when the village is barely a week old.

## People check (sense-reads, SENSE-TESTING LAW)

Read in full: 26021 d+14 Gloria (chosen-family trust beat — "You're
family now. Chosen family — the kind that actually counts") and Catalina
(Spanish-only language-learning exchange, coherent); 26025 d+3 Blanca
(real want: a foraging partner, grief thread about Mario's owed favor —
but the outing itself is unplayable, see Blanks); 26022 d+30 Vincent
(secret/confession arc, driver confront-pick repetition is a driver
artifact, same class as r46's Jude note); 26024 d+7 Arjun (pantry-run
want + the village's Lockpick-naming debate — living texture, warm
ending). No fabricated shared history, no filler loops. Driver identity
trips 0/5 seeds. PASS with the Blanca blank noted, not hidden.

## Blanks filled or documented

- FILLED (instrument bug, caught by this run's own evidence): the r47
  tele fields for soloOffice/eventOnly initially read rec.e7, but tele
  is written BEFORE finish() computes e7 — so they shipped as 0 (26024
  showed solo=0 against the analyzer's 2). Fixed in the driver (tele
  now computes both fields directly from officeCallMoves), proof test
  extended with a tele==e7 check, all 5 seeds re-run with the fixed
  driver (analyzer results identical; tele now matches: 26024 solo=2,
  eventOnly=2). Proof: test-journey-succession-r47 (RED r46 lacks all
  r47 fields → GREEN, 19/19 checks incl. the new tele==e7 check).
- DOCUMENTED (not fixed — needs a design/system call, not an
  instrument tweak): Blanca's d+3 want — "Forage with me tomorrow? I
  know the east treeline" — fires with no playable joint-foraging
  outing; the dialogue says so honestly ("There is no playable joint
  foraging outing yet"). The want system promises outings the game
  cannot play. That is a content gap for a future build, not something
  an instrument run should paper over.
- DOCUMENTED (instrument gap for the next run): C1's convo window
  (26021 day 21). Fix direction: snapshot the office entry after the
  driven-convo checkpoint block too, and record convo-window moves
  alongside callMoves — or move the officeDaily push to after the
  checkpoint work. Either way the cross-check must cover convo windows
  before C1 can pass at 100% again.
- Canon note: no dedicated succession/mantle canon doc exists in docs/
  (CANON.md's table does not cover the lineage/mantle machinery). This
  run invented no canon; it measured the machinery r38–r47 exercised,
  under Steve's 2026-10-23 meal-gate ruling.

## Telemetry deviation check

`node scripts/telemetry-check.js` vs telemetry-baselines/succession.json
(metrics: deaths.bearer, census.fallen, census.alive,
week2.deadBearerMentions, succession.echoV2b,
succession.callMovesSoloOffice): exactly ONE LOUD line —
"succession.echoV2b newly appeared: baseline 0 → current 15 (n=5)".
Verdict: EXPLAINED, not a bug. The baseline predates the echoV2b key
(added r46); current total 15 = 4+3+2+3+3, exactly the analyzer's M3v2b
sum. Baseline NOT rolled (same call as r46: the baseline's week2 value
also disagrees with this band, and rolling on a regime-changed band
would launder the regime effect into the baseline).

## Regression

`node scripts/check.js --only succession --cacheDirectory=/tmp/jest-cache-playtest2`:
11 passed, 0 failed (same as r44/r45/r46; slowest: grief 64s, coalesce 40s).

## Metric review (for the NEXT run, never re-scored here)

- C1: the 100% bar stands, but the instrument must cover convo windows
  (26021 day 21) before the bar is testable at 100%. Proposed: add a
  convo-window capture (office before/after the driven-convo block) and
  count convo-window moves in the cross-check. Until then, a C1 miss
  with a convo-window explanation is an instrument gap, not a game
  verdict — but it is still reported as a miss.
- E1: whole-call presence classification is dead as a discriminator
  (26/26 trust moves carry both line kinds except a handful). Proposed
  replacement: classify by the lines in the call that name a mover, or
  by the FIRST crisis/gift line's position relative to the move — or
  drop E1 and trap deed writers directly (the deed ledger already
  records deed calls; the open question is which deeds move trust).
- V1: the day-5 regime cannot test the vouch contract (no trust>=60
  villager exists at day 6). Proposed: the next succession run mixes
  regimes (2 day-5 + 3 mature, r45's mix) so V1 gets real coverage, or
  V1 is explicitly marked regime-vacuous whenever the band is young.
- M3v2b: two GO runs in a row (r46, r47). Bar stands; no revision.
- Died-between: empty for a third run. It cannot be forced honestly;
  keep the branch and keep watching, but stop listing it as an open
  question that blocks anything — it is a rare-branch watch, not a gap.
- Next for succession (r48): mixed-regime seeds (2 day-5 + 3 mature);
  convo-window capture for C1; a finer E1 replacement (mover-naming
  lines); re-test whether the office-lags/village-warms split holds on
  mature seeds after the day-5 band confirmed it young.

## Infrastructure

- Heartbeat loop kept journey2-succession fresh throughout (registry
  heartbeat verified after the sibling lock contention at run start: a
  sibling's worktree-register held the registry lock during its slow
  worktree add; my loop's heartbeat landed once it freed, 21:10 UTC).
- Safe-commit index clobber: checked after commit per the standing
  lesson (see commit record); repaired if struck.
- Master moved mid-run (2d1d35df2 → b283d4929, sibling scale-onramp
  landing); branch rebased onto b283d4929, proof test re-run GREEN
  after rebase, then merged --ff-only. No bump/push/live check (ship
  loop owns those). Lock deleted; rotation-b written 7 → 4.
