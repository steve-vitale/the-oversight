# sim-w4join-a — co-present join lever at wave-4 field fights (KILLED AT PILOT)

Run: Loop A, run fleshout-20261031T0016Z, axis scale-onramp,
follow-up to sim-w4party-a (evidence/2026-10-30/sim-w4party-a.md).
Worktree branch: sim-w4join-a. Base anchor: f52f08600 (w4party's
anchor 359a384cc + one measurement-only commit; no src/js change
between them — verified, not assumed, by the baseline step below).
Pre-registration: evidence/2026-10-31/sim-w4join-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/w4party-instrument-20261030.js (W4PARTY=1,
read-only, reused unchanged) + scripts/w4join-sweep-20261031.js +
scripts/w4join-analyze-20261031.js.
Proof (lever code, BEFORE revert — see §Disposition): a proof
test ran 21/21 green (fixture pool semantics on a fake object
with no npcNode method; real fieldFight round-1 join vs solo
control; 60d det-gate instrument-on/off identical with the lever
present; 1-seed 60d real-sweep gate). The proof test was deleted
with the revert (it tests code that no longer exists); its
result is recorded here, not left as a failing test.
Corpus: evidence/2026-10-31/perseed-w4join/base/leadfeast/
s85101–s85108.json + analysis.json (baseline pilot) and
.../arm/leadfeast/ s85101–s85108.json + analysis.json (arm
pilot). No game code is committed by this arm (killed — see
§Disposition). No [needs-eyes] (nothing player-facing lands).
Panel (§15): NOT APPLICABLE — see the prereg for the stated
reason (the panel driver cannot run the leadfeast stack and its
contract has no join/co-presence metric); no panel compare is
attached and none is fabricated. The comparison here is the
matched instrument: identical seeds, identical policy,
identical instrument.

## Verdict: KILLED AT PILOT (per the prereg — not a re-score)

The join mechanism works completely — and still produces no
kill. That split is the finding, and it is why the kill is
honest rather than a shrug:

| Prereg pilot criterion | Result | Holds? |
|---|---|---|
| 1. Baseline reproduces w4party pilot ff4 exactly (0,0,1,0,0,4,1,0), zero instrument errors | Exact reproduction, 0 errors | YES |
| 2. JOIN RATE >= 50% of co-present meetings | 17/17 = 100% | YES |
| 3. >= 1 wave-4 field kill in the pilot band | 0 kills in 20 meetings | NO |
| 4. Cost bar clean | Starvation 1 <= 1+2 total; per-seed excess max 1 <= 2; median 91d >= 0.8 x 113d = 90.4d (passes by 0.6d) | YES (narrow) |
| 5. Zero instrument errors, non-empty snapshots on the arm | 0 errors, all snapshots present | YES |

Criterion 3 fails, so per the prereg the lever is KILLED AT
PILOT: no confirm spend (seeds 85109–85116 were NOT run), game
code reverted before commit. The mechanism result (100% join,
0 perception violations) is preserved in this evidence and in
the arm corpus for a future combined arm — but the lever as a
standalone kill-producer is dead, and re-landing it alone would
repeat this pilot.

## The numbers (pilot, 8 seeds — NOT a full band)

Policy stack both legs, identical:
withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
200d death-aware cap.

Baseline pilot (lever OFF):
- Meetings: 6 total — wild 2, aid 2, other 2. Outcomes: evade 2,
  vFlee 3, vDie 1, vKill 0. Co-present meetings: 4, joined 0.
  Patterns: NEARBY-NEVER-JOIN 4, SOLO 1, PERIPHERY 1.
- Offered pool: 0 on all 6 (reproduces w4party's dry channel).
- Wall (pilot only): national 5/8, table 7/8, wins 7/8,
  wave4 5/8, wave5 0/8, median survival 113d, max 139d.
- Cost inputs: starvation deaths 1, villager deaths 52.

Arm pilot (lever ON):
- Meetings: 20 total — wild 12, aid 5, other 3. Outcomes:
  vFlee 18, vDie 2, vKill 0. Co-present meetings: 17, joined
  17 (JOIN RATE 100%). Patterns: JOINED-LOST 17, PERIPHERY 2,
  SOLO 1. The 3 'other'-caller meetings are untouched by
  design (contest/ephemeral callers were out of scope) and
  join nobody, as before.
- Offered pool: 31 named allyVids across the 20 meetings, and
  EVERY one stands d <= 1 in the entry snapshot
  (offeredNotCoPresent = 0) — the perception claim holds on
  every meeting. Floor-excluded meetings: 0 (no co-present
  meeting was blocked by the trust-15 floor).
- Joined-fight damage: mDealt totals 0–53 across 1–3 rounds
  against beasts at 277–900+ HP at entry — the same damage
  cliff w4field measured (median damage fraction 0.007). An
  ally adds a body, not damage: ally strikes read 3–6 per
  round in the logs.
- Ally risk is real: an ally goes down in the log in 5 of 17
  joined fights (e.g. s85106 d133: Xavier takes 79 then 77
  and goes down while the fighter flees). The lever trades
  second bodies for no kills yet.
- Wall (pilot only): national 3/8, table 6/8, wins 6/8,
  wave4 4/8, wave5 0/8, median survival 91d, max 200d.
- Cost inputs: starvation deaths 1, villager deaths 61
  (diagnostic only, except through the bar — see above).

## Trajectory divergence (read before quoting the comparison)

The lever is NOT wave-4-scoped: it changes every wild/patrol
fight (waves 1–3 included), so arm trajectories diverge from
baseline from the early game, and the arm's wave-4 corpus is a
different village history, not a ceteris-paribus wave-4 sample:

| Seed | Baseline days / ff4 | Arm days / ff4 |
|---|---|---|
| 85101 | 90 / 0 | 91 / 0 |
| 85102 | 113 / 0 | 90 / 0 |
| 85103 | 132 / 1 | 90 / 4 |
| 85104 | 126 / 0 | 107 / 0 |
| 85105 | 90 / 0 | 90 / 0 |
| 85106 | 139 / 4 | 200 / 16 |
| 85107 | 91 / 1 | 41 / 0 (village lost) |
| 85108 | 102 / 0 | 123 / 0 |

s85106 survives to the 200d cap under the arm (139d baseline)
and meets 16 wave-4 beasts; s85107 dies at day 41 under the
arm (won at day 91 baseline). The join rate is judged WITHIN
each leg's own meetings (100% of the arm's co-present
meetings), so the divergence does not void the mechanism
result — but a future re-landing must decide, as a design
call, whether joining is general villager behaviour (all
waves, judged as a general combat change, with [needs-eyes])
or wave-4-scoped (in which case the pool must be gated on
wave, and the pilot re-run). That decision belongs to the
next arm's prereg, not to a mid-run edit here.

## What the village looked like, in plain words

For the first time in this channel, the neighbours come. A
villager meets a wave-4 beast and the people standing on the
same ground, or just next to it, step in from the first
round — every single time someone is there. And it still
isn't enough: two blades dealing a handful of damage a round
against a beast with near a thousand hit points still run or
die in one or two rounds, and now sometimes the neighbour
falls too. The village finally fights together, and the
fight is still lost on damage before it is lost on numbers.
Joining was never the binding constraint on kills — it was
the binding constraint on the JOIN question, and it is now
answered. The kill question belongs to damage.

## Sense-testing (fight records read in full, not just counted)

- JOINED-LOST, wild (s85103 d54, Nathan vs influencer,
  ally Nikos): "Nikos is already at the door — charges in with
  Nathan!" — Nikos strikes for 5 then 3 against 838 HP while
  Nathan strikes for 12; Nathan binds a wound mid-fight and
  runs "while running still works." Reads as a real,
  outmatched, two-person fight. One narration flaw, flagged
  not hidden: the reused allyFromStart line says "at the
  door" for a WILD meeting, where there is no door. If this
  lever ever re-lands, the line should vary by caller.
- JOINED-LOST, aid (s85106 d133, Bashayer vs reunion, ally
  Xavier): Xavier strikes for 6, takes 79 then 77, "Xavier
  goes down!" — Bashayer strikes for 10, then 8, and flees
  at 35 HP. The ally's death inside a lost fight is the
  honest price of joining: the second body bleeds too.
- JOINED-LOST, death (s85106 d141, Bashayer vs herald, ally
  Adaeze): Adaeze strikes for 3 against 277 HP; the beast
  hits Bashayer for 97 and Bashayer dies in round 1 with the
  ally still standing. A one-round death leaves no round in
  which a second blade could matter — the round-1 join is
  necessary, and still not sufficient.
- PERIPHERY / SOLO (arm, untouched callers): the 3
  'other'-caller meetings join nobody, as designed — the
  lever's scope boundary is visible in the data, not just
  claimed.

## The lever, for reproduction by a future combined arm

(Deleted from the tree with the kill; this section is the
only record, written so a combined damage+join arm can
re-apply it exactly. All of it lived in src/js/game.js; no
other file was touched.)

- New Game.coPresentFightAllies(vid): living roster
  villagers (health map > 0 where present, else vpOf read),
  excluding fighter and scholar; state.village.nodePos read
  DIRECTLY (never npcNode); no-entry villagers excluded,
  fighter-with-no-entry returns []; Chebyshev d <= 1;
  trust default 10, floor 15; trust-descending, vid
  tie-break, capped at 2. No state writes, no RNG draws.
- resolveWildMonsterEncounter + resolvePatrol: the crew-only
  pool computation replaced by coPresentFightAllies(vid);
  when the pool is non-empty, opts.allyFromStart = true is
  passed to aidFight and to fieldFight (aidFight's
  foreign-present overwrite is unchanged).
- fieldFights.js, comms.js, gates, deeds, wave thresholds:
  untouched. The hopeless-shout branch and its learn-intent
  exclusion are untouched; round-1 co-present joining is
  intent-independent by design (presence, not a call — the
  aid-path precedent), as stated in the prereg.

## Metric review (applies to the NEXT run, never a re-score)

1. The kill criterion conflated two mechanisms: the join
   mechanism (which passed at 100%) and the damage cliff
   (which w4field had already measured at 0.7% median
   damage). A join-only arm should be judged on join rate
   and cost alone; a kill criterion belongs to a COMBINED
   join+damage arm, where the kill is the joint product.
   Next run: do not re-run a join-only pilot expecting a
   kill.
2. The cost bar's median leg passed by 0.6 days (91 vs
   90.4). On an 8-seed pilot that is noise, not a margin —
   a future arm should judge median survival on the full
   16-seed band, and report the pilot median as diagnostic
   only.
3. "Arm-only deaths" in the task's cost bar was
   operationalized in the prereg as per-seed starvation
   excess (max 1 here). The sampler's cause labels overlap
   (killconv caveat), so starvation counts are indicative;
   the ally-down log count (5/17 joined fights) is the
   sharper cost lens for a join arm and should be a named
   secondary metric next time.
4. The panel non-applicability statement in the prereg
   held up in practice: the matched-seed instrument
   answered the join question directly, and no panel
   metric could have expressed it.

## Convergence state

killed-at-pilot (join channel): the co-present join
mechanism is proven (100% join, 0 perception violations)
but killed as a standalone lever — it produces no wave-4
field kill without a damage change. The scale-onramp axis
still needs a combined join+damage arm, or a damage arm
whose kills the (re-landed) join can then multiply.

## Coordinator follow-ups (not done here — coordinator owns landing)

- Merge: prereg + evidence + sweep + analyzer + BOTH corpora
  (base + arm pilots) + analysis.json files. NO game code
  (reverted), NO proof test (deleted with the revert; its
  21/21 result is recorded above). Worktree must be clean
  apart from these committed files.
- Findings-backlog suggestion (coordinator to append, not
  appended here): "already at the door" line misfires on
  wild meetings when allyFromStart is used outside aid —
  caller-varying join line needed if the lever re-lands.
- Telemetry deviation check (loop step 10) is left to the
  coordinator after landing: this is a pilot-only arm with
  no landing, and the pilot wall deltas (national 3/8 vs
  5/8, median 91d vs 113d) are trajectory-divergence
  effects of a killed lever, not a new baseline.
