# sim-allycap-a — PREREGISTRATION (written BEFORE any judged sims)

Run: Loop A, oversight-flesh-out-loop, run fleshout-20261031T1415Z,
axis scale-onramp, arm sim-allycap-a (second-ally engine-cap census).
Worktree branch: sim-allycap-a. Base anchors: worktree HEAD after the
mandated fast-forward is 19b3e1ae0 (merge of lootabilities-w3); the
instrument records anchorCommit as the last commit touching src/ (the
spearxbow-a lesson: a HEAD anchor can never satisfy the byte-exact
determinism gate once the corpus itself is committed).
Lineage (read first, reused where valid, not re-derived blindly):
evidence/2026-10-31/sim-partyvolley-b.md (P2 == P3 identity on all 4
pilot streams; shoutJoined 0/24 from-start fights),
evidence/2026-10-31/sim-spearxbow-a.md (from-start join 176/176,
shout join 0/176; ally gear null at identity level),
evidence/2026-10-31/sim-scale-onramp-round-1315-a.md (this arm
deferred, not killed, from run 1315Z by the EPERM flap).
Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 band:
damage 35-95, HP 850-1500, pierce 0.2-0.5; the Mirror Draft).

## Question

Field fights field at most leader + 1 ally. allyFromStart sets
helpCalled = true and the hopeless-shout branch requires !helpCalled,
so a second staged ally never enters (shoutJoined 0/24 in
partyvolley-b, 0/176 in spearxbow-a). Is the 2-ally yardstick
component unfieldable through fieldFight as wired, and what exactly
caps it — helpCalled gating? shout gating? caller staging caps?

## Instrument

scripts/allycap-fixture-20261031.js — forced-meeting fixture band
through the real Game.fieldFight (spearxbow-a lineage: same harness,
same leader boris_kowalski + first other roster NPCs, age 35 /
steady / 100 HP, FULL Game.state restored before every fight, fresh
beast entity per fight, no awareness). No game code changed, no
policy, no policy-default flips. Leader tier fixed: machete +
crude_bow + 8 arrows + hide_armor (the spearxbow-a P2-BOW shape).
Beast: congregation (1000 HP, speed 2) unless the SH pilot fallback
below selects the eater (1050 HP, speed 4).

Variants (allies = opts.allies count; vids = opts.allyVids):
- FS-C1: fromStart, allies=1, vids=[A] — one-ally baseline.
- FS-C2: fromStart, allies=2, vids=[A] — COUNT control: same single
  vid, count 2. Isolates the morale-count channel (fieldFights.js
  holdBonus uses opts.allies, capped 0.12) from the second vid.
- FS-V2: fromStart, allies=2, vids=[A,B] — the second-ally test.
- FS-V3: fromStart, allies=3, vids=[A,B] — count exceeds vids:
  engine slices vids to 2 (fieldFights.js ~967); tests whether the
  count channel moves anything once vids are exhausted.
- SH-C1: shout path (no fromStart), allies=1, vids=[A].
- SH-V2: shout path (no fromStart), allies=2, vids=[A,B].
- CORN-V2: cornered sortie shape (no fromStart), allies=2,
  vids=[A,B] — rear-guard naming check (fieldFights.js rear-guard
  block names leftover vids at close in cornered fights only).

Per fight recorded: outcome, rounds, total/volley/ally damage,
rec.allyVid, charges-in lines parsed from the log (who "charges
in", count), shout count (occurrences of "shouts for help"),
strikes naming B (any log line starting with B's first name +
" strikes"), rearGuard field + log line, ally-B village.health
before/after (a never-entered ally takes no wounds, settles
nothing), leader/ally-A HP left.

## Pilot gate (8 seeds-equivalent: 4 streams x 2 entry paths)

Pilot streams 101-104. GATE: FS-V2 from-start join 4/4 (first ally
joins — mechanism sanity; if this fails the fixture is broken, not
the claim). SH pilot runs on congregation AND eater (4 streams
each). SH confirm beast = congregation if congregation pilot
shouted at least once, else eater if eater pilot shouted at
least once, else the SH arm is reported UNOBSERVED (no SH
confirm) with the reason — the FS verdict does not wait on it.
FS confirm proceeds on the FS gate alone.

## Confirm (12 streams 201-212 per variant, never below 8)

Primary metric C1 — second-ally combat entry rate: number of
confirm fights (FS-V2 + SH-V2, SH only if observed) in which a
second distinct allyVid enters the blows, evidenced by ANY of:
a "charges in" line naming B, rec.allyVid == B, or a strike line
naming B. CLAIM-CONFIRMED iff C1 = 0 AND C2 AND C3 all hold:
- C2 (identity): FS-V2 identical to FS-C2 on all 12 confirm
  streams — every recorded field AND the full log text. This is
  the count-controlled version of partyvolley's P2 == P3: the
  second vid adds nothing once the count is held fixed.
- C3 (shout-once): max "shouts for help" occurrences per SH
  fight <= 1 across all SH confirm fights, AND second-shout 0
  in the ally-down subset (SH fights where allyHpLeft == 0 and
  at least one round follows the ally's fall — the only fights
  that could even in principle re-shout).
If any second ally enters (C1 > 0), the claim is REFUTED and
that fight is reported as the finding — no re-score, no
reinterpretation of "enters".
Secondary (reported, never judged): FS-C2 vs FS-C1 differences
(the morale-count channel price); FS-V3 vs FS-V2 differences
(count past vids); CORN-V2 rear-guard presence (expect B named
as rear guard while never striking — narration, not combat);
ally-B health unchanged across FS-V2/SH-V2 fights.

## Horizon, wall numbers, panel

Horizon: fixture band, no sim days — death-aware horizons do not
apply (no village trajectory, no deaths over time; fights are
single meetings). Wall numbers (national / table / wins, wave
reach) are NOT OBSERVABLE on this substrate, stated structurally,
never as 0s: a fixture band has no village trajectory, no scale
ladder, no win flag. Panel (§15): NOT APPLICABLE, none
fabricated — scripts/balance-panel.js is a policy-comparison
driver on one frozen root; it cannot express a forced-meeting
fixture band with a party-size/entry-path ladder and has no
fixture mechanism (same rationale class as volleyfix-b /
partyvolley-b / spearxbow-a / sighit-a). Judge is this prereg +
the determinism gate below.

## Determinism gate (proof test)

scripts/test-allycap-20261031.js must pass 100%: two fresh
fixture runs byte-identical to each other AND to the committed
corpus; independent re-derivation of the pilot gate, C1/C2/C3,
count-channel and rear-guard secondaries, and the static-census
invariants (allyVids.shift sites, helpCalled write sites).

## Static census (code reading, judged as attribution, not as fights)

Recorded alongside the fixture (same evidence file): every
allyVids.shift site in fieldFights.js (expect exactly 2:
fromStart ~1033, shout ~1887); every helpCalled write (expect
declaration false + 2 sets, no reset); the single-scalar fighter
state (one allyVid/allyHp/allyIn/allyName; one flat [3,6] ally
strike per round; one 0.4 ally-share target roll); the engine
vid truncation (slice(0, 2) ~967); caller staging caps
(party-wiring.js slice(0, 2); patrol/wild first-2 vids; aidFight
unbounded present list; muster leader + up to 2; alienPlayers
brave.slice(1) unbounded). If the static census finds a third
entry path, the verdict is QUALIFIED, not CONFIRMED, and the
path is named.

## This arm is DIAG ONLY

No engine-cap fix is built here: the findings backlog says that
needs an engine-cap design decision first. If the census shows a
fixable, safe, small lever, it is documented as a next arm, not
landed. No [needs-eyes] (measurement only; nothing player-facing
ships).

## Metric review (for the NEXT run — filled at closeout, never a re-score)

- (To be filled from the run: whether the count-controlled
  identity held, whether the SH path was observable on
  congregation, whether bond-average or rear-guard channels
  moved anything, and whether the pilot's 4 streams were
  enough for the shout mechanism.)
