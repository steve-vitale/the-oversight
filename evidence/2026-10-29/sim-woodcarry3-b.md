# sim-woodcarry3-b — GO: 8/8 episodes rescued on a properly-banked band

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261029T1630Z,
arm sim-woodcarry3-b, axis food-economy. Worktree
sim-woodcarry3-b. POLICY-SIDE LEVER ONLY: zero src/js changes,
zero default flips. This worker does NOT merge to master —
coordinator merges.

Prereg: evidence/2026-10-29/sim-woodcarry3-b-prereg.md
(committed ee3c5004, before any judged leg). Judge (prereg,
unchanged): GO requires OFF-leg episodes >= 8 AND episode
rescue rate >= 0.50 AND unclassified == 0 AND errs == 0 AND
determinism byte-identical AND divergence audit ok AND
player-death guard AND honesty guard (vacuous allowed, reported
as vacuous). A miss is never re-scored. No post-hoc seeds were
added to the judged band; the fallback rule was not triggered.

## Verdict: GO — the lever lands default-OFF

| Check | Result | Bar |
|---|---|---|
| OFF-leg episodes (pooled, 4 seeds) | 8 | >= 8 |
| Episode rescue rate (PRIMARY) | 8 / 8 = 1.000 (Wilson 95%: 0.806–1.000) | >= 0.50 |
| Banking verification gate (census counts 3/1/3/1) | 3/1/3/1, day ranges EXACT on all 4 seeds | counts match |
| Unclassified (both legs) | 0 / 0 | == 0 |
| Classifier errs (both legs) | 0 / 0 | == 0 |
| Determinism re-run (seed 13268, ON) | byte-identical | identical |
| Divergence audit (all 4 seeds) | ok — first difference day 2, first lever action day 2 | ok |
| Player deaths (pooled) | OFF 6, ON 2 | ON <= OFF + 1 |
| Carry-attributable ON deaths | 0 (ON deaths: sickness, wild — neither starvation nor overload) | none |
| Honesty guard | 0 fails — VACUOUS (see below) | 0 fails |
| Wrapper/driver rescue agreement | 0 disagreements | 0 |
| Proof | scripts/test-woodcarry3-b.js: T1–T12 ALL PASS | — |

This is the confirmation the two prior runs could not give:
the 1441Z run was killed at pilot on INSUFFICIENT-DATA, the
1530Z run rescued 7/7 but missed min-n by one episode because
its band was banked under the wrong driver family. This run
fixes the banking (no thief grant, no taps in the judged
driver), the OFF leg reproduces the blockscreen2 census
EXACTLY — same episode counts AND same day ranges on all four
seeds — and the lever rescues all 8 episodes. Per the prereg,
the policy lever LANDS default-OFF (WOODCARRY=1 to enable; no
driver adopts it by default; no default flip).

## The lever (as built, landing)

scripts/policies/woodcarry.js (default-OFF, WOODCARRY=1):

1. MORNING CARRY (pre-competent.daily, only when the player
   starts the day at haven): if wood < 4, pile minus deficit
   >= 8, morning kcal >= 60, and canCarry(deficit * 2), take
   exactly deficit = 4 - wood logs — the same honest
   transaction as Game.takeWood (pile -= n, addWood(n), say
   line, tickAction(2)).
2. EVENING BRIDGE (post-nighttravel.daily, only on a
   travel-refused evening with hopReturnKind block:creek):
   classify from refusal-time state (creekremedy-diag's pure
   classifier); if classified creek AND wood >= 4 AND evening
   kcal >= 60 AND ticks-to-day-end >= 96 AND probe tile
   needsBridge true and bridged not-true, call
   Game.buildBridge(probe tile); if bridged, retry one
   Game.travelTo(haven); if arrived, delegate to
   insideevening's eveningStep. If still refused, say ONE
   honest line naming what is lacking.
3. OFF leg (WOODCARRY=0): no carry, no bridge, no line — but
   still classifies refused evenings (pure reads), so OFF/ON
   record shapes match.

Carry behavior on the pooled ON legs (11 acted carries):
skips were pile-floor 4 (the 8-log hearth floor worked — no
take when the pile would drop below 8; minimum pile left after
an acted carry was 11), already-carrying 105 (the habit is idle
once the pack holds 4, as designed), kcal-floor 0, cannot-carry
0, not-at-haven 0. Bridge skips: 0 — every classified ON creek
evening attempted and built. Bridge outcomes: 5 completed
entries, all inside.

## Per-seed legs (OFF episodes / rescued / inside OFF -> ON)

| Seed | Creek OFF | OFF episodes | Rescued | Creek ON | Inside OFF -> ON | End OFF -> ON |
|---|---|---|---|---|---|---|
| 13025 | 12 | 3 (14-16; 20-21; 24-30) | 3 | 1 (day 14) | 18 -> 30 | survived / survived |
| 13067 | 2 | 1 (4-5) | 1 | 1 (day 4) | 28 -> 30 | survived / survived |
| 13268 | 23 | 3 (5-10; 12-20; 23-30) | 3 | 2 (days 5, 28) | 7 -> 30 | survived / survived |
| 13276 | 10 | 1 (4-13) | 1 | 1 (day 4) | 20 -> 30 | survived / survived |
| Pooled | 47 | 8 | 8 | 5 | 73 -> 120 (+47) | — |

Pooled inside evenings: OFF 73, ON 120 (+47) — on the ON leg
every seed spends all 30 evenings inside. The evening share
(SECONDARY, not the judge): 5/5 = 1.000 on the ON leg, against
47 OFF creek evenings — the collapse the episode primary was
written to stop rewarding/punishing: each rescued episode
contributes only its first evening to the ON denominator.

Two ON-leg creek evenings deserve a note because they are NOT
OFF episodes: 13268 day 28 is a second creek refusal on the ON
leg only (the day-5 bridge was gone by then — bridges are
storm-breakable — and the lever bridged again, rescued). It
counts in the 5/5 evening share but, correctly per the prereg,
not in the 8/8 episode rate: episodes are counted on the OFF
leg and the denominator never shrinks because the lever
worked, nor grows because it worked twice. This is the second
consecutive run showing the re-bridge behavior, which is the
engine's own storm rule playing honestly through the lever.

## Why the banking fix worked (proven, not asserted)

The 1530Z run's diagnostic proved the thief grant perturbs
seed 13025. This run strips the grant AND the taps from the
judged driver, and the OFF leg reproduces the blockscreen2
census exactly on every seed — counts and day ranges:

- 13025: census 14-16, 20-21, 24-30 → judged OFF 14-16, 20-21,
  24-30 (12 refused evenings, 18 inside).
- 13067: census 4-5 → judged OFF 4-5 (2 refused, 28 inside).
- 13268: census 5-10, 12-20, 23-30 → judged OFF 5-10, 12-20,
  23-30 (23 refused, 7 inside).
- 13276: census 4-13 → judged OFF 4-13 (10 refused, 20 inside).

The 1530Z judged OFF leg had shown 13025 collapsed to 2
episodes (16; 18-19) and 13268/13276 day-shifted. Under the
stripped driver all of that reverts to census. The grant was
the perturber; the taps, neutralized with the grant (a tap
without the ability is button-refused and moves nothing),
needed no separate isolation. The fallback rule was not
triggered. Lesson for the next creek-band run, kept: bank
under the judged driver family, period — census bands from
another driver family are a hypothesis to verify, never a
denominator to assume.

## Harm audit (reported, not hidden)

- Player deaths pooled: OFF 6, ON 2 — the guard passes with
  margin, and the direction favors the lever. OFF deaths: wild
  (13025 days 17, 22; 13067 day 6), sickness (13268 day 10,
  13276 day 13), contest (13268 day 21). ON deaths: sickness
  (13067 day 13), wild (13268 day 18). Neither ON death is starvation or overload:
  the carry costs 0 kcal, the pile floor held (minimum pile
  after an acted carry 11, never below the 8 floor), and no ON
  death is carry-caused on any causal reading — a sickness
  death and a wild death on rescued trajectories, not a
  kcal-diverted or pile-starved death.
- No seed loses an evening ON vs OFF; the net is +47 inside
  evenings. The prior runs' noted cost (a carry-tick shift
  costing one tap-day evening) does not re-appear here: with
  no taps in the driver there is no tap day to lose.
- All 8 villages (4 seeds x 2 legs) survive 30 days by
  daysAlive; median survival 30 / 30. The 1530Z end-state flip
  (13276 village-lost OFF) does not re-appear because the
  stripped-driver OFF trajectory for 13276 survives — the
  census trajectory, not the grant-perturbed one.

## Sense-testing (read end to end, judged for meaning)

- 13268 day 2 (first carry morning, in the day-2 tail): "You
  take 4 logs from the woodpile for the road home. (12 left for
  the hearth.)" — a person preparing, in the engine's own
  takeWood voice, with the hearth reserve named. It reads as
  packing for the road, not a teleporting inventory trick: the
  logs come from a named pile, the remainder is stated, and the
  weight (8 kg) is a real pack cost the engine enforces.
- 13268 day 5 (rescued episode, first evening, full tail read):
  the day forages ("Travel 1 tile to grove", unknown nuts into
  the bag), the engine's refusal line appears three times
  ("The creek runs fast here — no crossing without a bridge or
  a swim.") — the repetition is the engine's own (competent
  trip attempt, creek survey, nighttravel hop), slightly
  robotic but honest — and then it resolves: "You lash logs
  together. A rough bridge spans the gap. Rough wood, though
  — a bad storm could take it." followed by "Travel 2 tiles
  to Haven." and "You walk back into Haven. 6 Codex entries.
  The village is glad to see you." The bridge line is the
  engine's own buildBridge voice, and the arrival is a played
  homecoming, not a counter increment.
- 13025 day 14 (rescued episode, tail read): the same arc, and
  the homecoming lands in a living village — "While you were
  gone — one thing you missed: Wei stared down the Flashbulb
  Moth and it backed off" and Prakash leaning over a thorny
  bush trying to teach the haul's identity ("gestures, dirt
  drawings, growing frustration. The words aren't there. Maybe
  with patience. Maybe never."). The night home is not just a
  position flag; the village kept living while the player was
  out, and the return rejoins it.
- Still-refused evenings: NONE exist on the ON legs (all 5 ON
  creek evenings rescued), so the lever's lacking-line was
  NEVER exercised in a played tail for the third consecutive
  run. The honesty guard passes vacuously (0 fails out of 0
  owed lines). The line text itself is unit-proven (proof T3:
  wood line names 4 logs, kcal line names 60, ticks line names
  96), but the narration gap creekremedy documented is NOT yet
  proven closed in play. That proof needs a still-refused
  evening — e.g. a kcal-starved creek seed staged separately —
  and is a named follow-up, not a claim made here.

Judgment: the carried-log evenings read as people preparing
and solving a named problem, and the homecomings read as
returns to a living village. The narration fix is written but
still unplayed — three runs running.

## Village assessment (plain words)

Four villages, thirty days in. On the OFF leg they spend
nearly half their nights camped on creek banks — 47 refused
evenings, worst on 13268 with only 7 nights home out of 30 —
and on the ON leg every single evening, 120 of 120, is spent
inside at haven. The story of this run is 13268: on the OFF leg
its player spent twenty-three evenings on the wrong side of a
creek across three long episodes, and with four logs packed on
the morning of day 2 the first refused evening ends with a
lashed bridge and a walk home, and the village never sleeps
out again (a storm takes that bridge once, and the lever
lashes another on day 28). What was missing on every refused
night was the same small thing creekremedy measured — four
logs in the pack — and when the pack holds them, the engine's
own bridge does the rest. The blank this run fills is the
powered proof the two prior runs could not give: the
precondition works end to end at the episode level
(carry -> bridge -> home, 8/8 episodes) on a band banked under
the driver that judged it. The blank it documents but does
not fill is the unplayed narration line — the lacking-line
still awaits its first played still-refused evening.

## Wall numbers (every run)

- National: NOT OBSERVABLE in 30-day evening legs
  (pre-seat, no field).
- Table: NOT OBSERVABLE in 30-day evening legs.
- Wins: NOT OBSERVABLE in 30-day evening legs;
  0 win flags present.
- Wave 4–5 unlocks: not re-measured on this leg shape; no
  wave-4/5 content is reachable from a 30-day evening leg, and
  none is claimed.
- Median survival: 30 days (all 4 villages reach day 30 on
  both legs by daysAlive).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as pre-registered
before judging: this leg is a 30-day position measurement of
a POLICY-SIDE lever — zero src/js changes, so there is no
game-root delta for a panel to compare, and the panel's
registry policies do not include the nighttravel trace policy.
The divergence audit + determinism re-run are the
instrument-perturbation proofs, and the pre-registered GO bar
above is the judge.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- EPISODE PRIMARY, VALIDATED AT POWER: 8/8 episodes rescued
  with min-n met exactly. The episode rate behaved as designed
  across all three runs (3/3, 7/7, 8/8); keep it as primary
  for any future creek-band work.
- BANKING RULE, NOW PROVEN: strip-then-verify works — the
  stripped driver reproduced the census exactly, counts and
  ranges. Any future creek-band run banks under its judged
  driver or re-verifies the same way; a census band from
  another driver family is never assumed.
- Kcal floor on a free action: the 60-kcal morning floor
  never bound in a third consecutive run (0 skips). It costs
  nothing to keep, and the lever lands with it as written.
- Ticks gate: the 96-tick evening gate never skipped a bridge
  in a third consecutive run (0 skips) — all five ON creek
  evenings held 96+ ticks. The gate remains untested under
  pressure; a future run with late-day refusals should watch
  it.
- Honesty vacuity, third run running: three consecutive runs
  with zero still-refused ON evenings. The lacking-line proof
  now needs a deliberately staged still-refused evening (e.g.
  a kcal-starved creek seed) as its own measurement, not a
  fourth hope that a judged band produces one by accident.
  That staged measurement is the recommended next step for
  #1424, and it does not block this landing: the line is
  unit-proven, the lever's played behavior is proven, and the
  unplayed-line gap is named, not hidden.
- If the metric proves wrong, write it under "metric review"
  in the evidence file and propose the revision for the NEXT
  run — never re-score mid-run.

## Evidence files

- Prereg: evidence/2026-10-29/sim-woodcarry3-b-prereg.md
  (commit ee3c5004, before any judged leg)
- This file: evidence/2026-10-29/sim-woodcarry3-b.md
- Analysis: evidence/2026-10-29/sim-woodcarry3-b-analysis.json
  (pure JSON)
- Corpora: evidence/2026-10-29/sim-woodcarry3-b-corpus-off/
  (4 seeds, lever OFF),
  sim-woodcarry3-b-corpus-on/ (4 seeds, lever ON)
- Instruments (LANDING, default-OFF):
  scripts/policies/woodcarry.js (the lever, WOODCARRY=1 to
  enable; no driver adopts it by default),
  scripts/woodcarry3-trace-b.js (its driver: no thief grant,
  no taps), scripts/analyze-woodcarry3-b.js,
  scripts/test-woodcarry3-b.js (T1–T12 ALL PASS, determinism
  included)
- NO src/js change, NO default flip.

## Landing note for the coordinator

GO (episode rate 8/8, min-n 8 met, all guards pass),
measurement + lever landing: prereg + this evidence file +
analysis + 2 corpora + policy + driver + analyzer + proof.
Backlog disposition (reported, NOT edited — goal hidden_files
are the coordinator's): #1423 claimed by this arm, now
CLOSABLE — the lever is proven at power (8/8 episodes on a
properly-banked band) and lands default-OFF; #1425 satisfied
in method (player deaths counted from the start); #1424 still
open (honesty guard vacuous for a third run — the staged
still-refused measurement is the recommended next step).
This worker does NOT merge to master — coordinator merges.
Report: 'committed, pending coordinator merge'.
