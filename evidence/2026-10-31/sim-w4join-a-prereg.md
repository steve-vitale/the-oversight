# sim-w4join-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A, run fleshout-20261031T0016Z, axis scale-onramp, follow-up
to sim-w4party-a (evidence/2026-10-30/sim-w4party-a.md, read first)
and sim-w4field-a (evidence/2026-10-30/sim-w4field-a.md).
Worktree: ~/workspace/worktrees/sim-w4join-a, branch sim-w4join-a.
Anchor at prereg time: f52f08600 (w4party's anchor 359a384cc + one
measurement-only commit, sim-linkgen-a; NO src/js change between
them is expected — verified in the baseline step below, not assumed).
Arm type: GAME-CODE LEVER (one arm, wild/patrol callers only).
The gating freeze (Steve 2026-10-27/28) stands: NO scale-gate
numbers, deed bars, or wave-unlock thresholds are touched. This arm
changes only who is offered to a fight that already happens.
Perception law (Steve 2026-10-28) is HARD: the pool is built from
co-presence at fight time, never from a roster/global list, and the
implementation reads state.village.nodePos DIRECTLY (exactly as the
w4party instrument does) — it NEVER calls Game.npcNode, which would
write a Haven default into state.

## Ground facts (verified against code on THIS base, not quoted)

- w4party band (16 seeds, same policy stack as below): 30 wave-4
  field meetings, 0 kills, 0 joins; offered pool EMPTY on 30/30;
  outdoor crew empty on 30/30; same-node villager present on 21/30,
  same-or-adjacent on 26/30; shout fired 0 times; 26/27 fought
  meetings end by round 2.
- fieldFight (src/js/fieldFights.js) takes opts.allies /
  opts.allyVids (capped at 2 in the engine slice) and admits at
  most ONE ally per fight: allyFromStart joins round 1
  (comms.js aid path), or the hopeless-shout branch joins
  mid-fight when losing AND intent != 'learn' AND round >= 2.
  With 26/27 fought meetings ending by round 2, a shout-latency
  lever has almost no rounds to work in — w4party metric review #4.
- Wild/patrol callers (src/js/game.js resolveWildMonsterEncounter,
  resolvePatrol) feed ONLY the outdoor crew (_outdoorCrew snapshot
  taken at assignment resolution) as the offered pool. That crew
  snapshot is empty at every measured fight.
- A perception-grounded helper ALREADY exists, but is NOT wired to
  wild/patrol: Game.villagerFightAllies (src/js/party-wiring.js)
  serves only expeditionMonster (src/js/villager-agency.js), and
  it calls Game.npcNode (writes Haven defaults) and puts the
  node-blind crew FIRST. This arm does NOT wire that helper in
  as-is (it would violate the direct-read rule and reintroduce a
  node-blind offer). It adds its own fight-time helper with
  direct nodePos reads, same/adjacent only.
- docs/PARTY.md covers the player's formal party, not wild
  villager joining; docs/PERCEPTION.md covers the player's
  perception hints, not villager co-presence. No canon doc
  prescribes this pool — the design below is this arm's call,
  documented for Steve's overrule, not invented canon.

## The lever (exact scope)

New helper Game.coPresentFightAllies(vid) (game.js, next to the
wild/patrol callers), used ONLY by resolveWildMonsterEncounter
and resolvePatrol:

- Candidates: living roster villagers (health map > 0 where
  present, else vpOf read — same rule as the w4party instrument),
  excluding the fighter and the scholar (villagerId).
- Position: read state.village.nodePos DIRECTLY. A villager with
  NO nodePos entry is EXCLUDED (unknown position is not
  co-presence — never defaulted to Haven). If the FIGHTER has no
  nodePos entry, the pool is empty (no fabricated anchor).
  w4party found 0 defaulted meetings, so this rule should not
  bite; if it does, the meeting is reported, not defaulted.
- Distance: Chebyshev d <= 1 from the fighter's node (same node
  = already there; adjacent = earshot, the party-wiring earshot
  rule). d >= 2 neighbours are NOT offered.
- Trust: village trust, default 10, floor 15 (the party-wiring
  answer floor: strangers don't sprint into the treeline).
  Trust-ordered descending, deterministic tie-break by vid,
  capped at 2 named allyVids.
- The wild/patrol callers pass this pool INSTEAD OF the crew-only
  pool (the crew snapshot is no longer the offer; a crew member
  who is also co-present still qualifies through co-presence).
  When the pool is non-empty, opts.allyFromStart = true, so the
  first named ally joins from round 1. Rationale (stated here,
  not smuggled): co-present villagers ARE already there — the
  aid-path precedent (arrived parties join round 1) — and
  w4party proved fights end by round 2, so a shout-latency
  design cannot be judged. The second named allyVid remains in
  the engine's pool but, per existing engine law (at most one
  ally enters; shout gated on !helpCalled), does not enter.
- LEARN-INTENT, stated explicitly: the hopeless-shout branch's
  intent != 'learn' exclusion is UNTOUCHED in fieldFights.js.
  Round-1 co-present joining is not a shout — it is presence,
  not a call — so it is not gated on the fighter's intent,
  exactly as aid parties at the door are not. If this reading is
  wrong, the correction is to gate round-1 joining on intent,
  and that change belongs to the NEXT run, not a mid-run edit.
- NO damage, stat, HP, armor, flee-threshold, or trick change.
  The ally body is the existing fieldFight allyBody (real
  village.health, wound carryover) — an ally who joins risks
  real wounds, which is what the cost bar watches.
- UNTOUCHED: expeditionMonster (still villagerFightAllies,
  shout-only), all other fieldFight callers (contest/ephemeral
  'other' meetings), aidFight's foreign-present overwrite
  (when foreign allies are present they still replace the pool
  and set allyFromStart, as before; when none are present the
  co-present pool + flag pass through aidFight unchanged).

## Primary metric

Per wave-4 FIELD meeting (fieldFight, base wave >= 4, all
callers — wild/patrol/aid/other reported, wild+patrol+aid
judged, 'other' reported only):
- coPresentExists: >= 1 living roster villager on the same or
  an adjacent node at meeting time, per the instrument snapshot
  (non-defaulted entries only). This is the perception
  denominator, INDEPENDENT of the lever's trust floor — a
  meeting where co-present villagers exist but all sit below
  trust 15 counts in the denominator and not in the numerator,
  and is listed separately (floor-excluded).
- joined: rec.calledHelp true AND rec.allyVid set (round-1
  allyFromStart joins count; shout joins would count too).
- JOIN RATE = joined / coPresentExists meetings.
- Also reported: offered pool size per meeting, offered-vs-
  co-present agreement (every offered vid must be d <= 1 in the
  snapshot — a violation voids the arm's perception claim),
  partySize, rounds, outcome, ally damage (allyDealt), and
  wave-4 field kills.

## GO / NO-GO thresholds (judged against this header, never re-scored)

PILOT (8 seeds, 85101-85108), all must hold for a pilot GO:
1. Baseline reproduction: the fresh baseline pilot (lever OFF,
   instrument ON, this anchor) reproduces w4party's pilot ff4
   counts exactly (0,0,1,0,0,4,1,0) and zero instrument errors.
   Any mismatch HALTS the run for investigation (pristine
   control re-run on the divergent seed first) — it is NOT
   scored as an arm result.
2. JOIN RATE >= 50% of co-present meetings in the pilot band.
3. At least 1 wave-4 field kill in the pilot band.
4. Cost bar clean (below) on the pilot band.
5. Zero instrument errors on the arm pilot; every arm meeting
   carries a non-empty entry snapshot.
If any of 2-4 fails, the lever is KILLED AT PILOT: no confirm
spend, game code reverted before commit (or committed only as
a killed-arm record with no game change — the coordinator's
call on landing; the default here is revert, no trace).

CONFIRM (pilot GO only, +8 seeds to 16 total). Final GO needs:
- Cumulative JOIN RATE >= 50% of co-present meetings (16 seeds).
- Cumulative cost bar clean (below).
- >= 1 wave-4 field kill in the full band (the pilot kill
  already satisfies this; a confirm-band kill is reported but
  not additionally required).
Final verdicts: GO (all hold), NO-GO (join rate or cost bar
fails on the full band), killed-at-pilot (pilot failed).

## Cost bar (from sim-scalemetric, binding — operationalized here)

Death counts are diagnostic EXCEPT this bar, computed from the
harness sampler death rows in the per-seed JSONs (same caveat
as killconv: sampler cause labels overlap, so they are
indicative, not a clean partition):
- Starvation deaths = sampler rows with kind villager/person
  and cause matching /starv|hunger/i.
- (a) TOTAL: arm starvation deaths across the band <= baseline
  starvation deaths + 2.
- (b) ARM-ONLY (per-seed excess): on no seed does the arm's
  starvation deaths exceed that seed's baseline by more than 2.
- (c) MEDIAN SURVIVAL: arm median game days >= 0.8 x baseline
  median game days.
All three must hold. Total villager deaths, ally deaths in
joined fights, and wall numbers are reported diagnostically
alongside, not judged, except through (a)-(c).

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over —
identical to w4party/killconv, so meeting counts are directly
comparable. 200d because wave-4 door openings ran as late as
day ~165 in killconv; the death-aware stop keeps cost at
survival, not cap.

## Seeds (exact literals — w4party/killconv band)

- Pilot: 85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108.
- Confirm (pilot GO only): 85109, 85110, 85111, 85112, 85113,
  85114, 85115, 85116 (16 seeds total).

## Policies (identical every seed, both legs)

Competent scale-push stack, policy-side only except the arm's
own game-code change:
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))` with
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 + W4PARTY=1 (the w4party read-only instrument, reused
unchanged — it already records offered pool, allyFromStart,
snapshots, and fight records; no new instrument is needed).

## Panel (§15)

scripts/balance-panel.js is NOT APPLICABLE to this comparison,
and none is fabricated: the panel driver runs its own policy
registry (capable/risk-aware/socialite/winseek) at its own
horizon and scores panel metrics — it cannot run the leadfeast
scale-push stack, and its metric contract contains no wave-4
field-meeting, join-rate, or co-presence metric. The before/
after comparison here is the stronger matched instrument for
this question: identical seeds, identical policy, identical
instrument, day-hash trajectories on the baseline leg. The
panel non-applicability is stated here so the absence of a
compare .md is a documented decision, not an omission.

## Wall numbers reported every run

national / table / wins, wave 4-5 unlocks, median survival
(game days), wave-4 field meetings by outcome, wave-4 field
kills, joined fights, ally deaths in joined fights.

## Sense-testing (§4, SENSE-TESTING LAW)

Read at least one full fight record per outcome class present
among JOINED fights (entry snapshot + offered pool + full
log tail + outcome) and judge whether the join reads as a
real neighbour arriving — who they are, where they stood,
what they did — not just counts. A joined fight whose log
never names the ally, or whose ally stands nowhere near the
fight, fails sense even if the count passes.

## Metric review

(To be filled at end of run. Doubts about the metric go here
and apply to the NEXT run, never to re-score this one.)

## Convergence state

(One line at end of run: GO | NO-GO | killed-at-pilot — for
the scale-onramp axis join channel, not a lever rotation item.)
