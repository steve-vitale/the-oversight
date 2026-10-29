# sim-woodcarry2-b — INSUFFICIENT-DATA (min-n missed by one episode): 7/7 rescued, n=7 < 8

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261029T1530Z,
arm sim-woodcarry2-b, axis food-economy. Worktree
sim-woodcarry2-b. POLICY-SIDE LEVER ONLY: zero src/js changes,
zero default flips. This worker does NOT merge to master —
coordinator merges.

Prereg: evidence/2026-10-29/sim-woodcarry2-b-prereg.md
(committed 5d622ffc4, before any judged leg). Judge (prereg,
unchanged): GO requires OFF-leg episodes >= 8 AND episode
rescue rate >= 0.50 AND unclassified == 0 AND errs == 0 AND
determinism byte-identical AND divergence audit ok AND
player-death guard AND honesty guard (vacuous allowed, reported
as vacuous). A miss is never re-scored. No post-hoc seeds were
added to the judged band.

## Verdict: INSUFFICIENT-DATA — the lever never failed, the band came up one episode short

| Check | Result | Bar |
|---|---|---|
| OFF-leg episodes (pooled, 4 seeds) | 7 | >= 8 |
| Episode rescue rate (PRIMARY) | 7 / 7 = 1.000 (Wilson 95%: 0.785–1.000) | >= 0.50 |
| Unclassified (both legs) | 0 / 0 | == 0 |
| Classifier errs (both legs) | 0 / 0 | == 0 |
| Determinism re-run (seed 13067, ON) | byte-identical | identical |
| Divergence audit (all 4 seeds) | ok — first difference day 2, first lever action day 2 | ok |
| Player deaths (pooled) | OFF 6, ON 1 | ON <= OFF + 1 |
| Carry-attributable ON deaths | 0 (sole ON death is wild, day 24, same lineage as an OFF wild death day 20) | none |
| Honesty guard | 0 fails — VACUOUS (see below) | 0 fails |
| Wrapper/driver rescue agreement | 0 disagreements | 0 |
| Proof | scripts/test-woodcarry2-b.js: T4 FAILS (min-n), T5–T12 PASS | — |

This is NOT a NO-GO: no rescue failed, no bridge failed, no
guard failed on game grounds, and the episode rate is 7/7. It
is INSUFFICIENT-DATA on the prereg's own min-n rule: the census
band promised 8 episodes and the judged OFF leg delivered 7.
Per the prereg, the lever is NOT landed and the policy file +
driver are REVERTED (killed arms leave no trace). The next run
must re-derive its band under the judged driver family (see
"Why the band came up short" below) — it must not simply add a
seed to this band.

## The lever (as built, then reverted)

scripts/policies/woodcarry.js (REVERTED — not in this commit;
the spec below is the record, the corpora are the runnable
proof):

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
   needsBridge true and bridged false, call Game.buildBridge;
   if bridged, retry one Game.travelTo(haven); if arrived,
   delegate to insideevening's eveningStep. If still refused,
   say ONE honest line naming what is lacking.
3. OFF leg (WOODCARRY=0): no carry, no bridge, no line — but
   still classifies refused evenings (pure reads), so OFF/ON
   record shapes match.

Carry behavior on the pooled ON legs (10 acted carries):
skips were pile-floor 4 (the 8-log hearth floor worked — no
take when the pile would drop below 8; minimum pile left after
an acted carry was 11), already-carrying 106 (the habit is idle
once the pack holds 4, as designed), not-at-haven 0 in this
band's ON legs (every counted morning started at haven; the
106 already-carrying count dominates because the pack is
topped up most mornings). Kcal-floor skips: 0 — the 60-kcal
morning floor never bound. CanCarry skips: 0. Bridge skips: 0
— every classified ON creek evening attempted and built.
Bridge outcomes: 5 completed entries, all inside.

## Per-seed legs (OFF episodes / rescued / inside OFF -> ON)

| Seed | Creek OFF | OFF episodes | Rescued | Creek ON | Inside OFF -> ON | End OFF -> ON |
|---|---|---|---|---|---|---|
| 13025 | 3 | 2 (16; 18-19) | 2 | 1 (day 16) | 26 -> 30 | survived / survived |
| 13067 | 2 | 1 (4-5) | 1 | 1 (day 4) | 28 -> 30 | survived / survived |
| 13268 | 20 | 3 (5-11; 13-16; 18-26) | 3 | 2 (days 5, 28) | 10 -> 30 | survived / survived |
| 13276 | 6 | 1 (4-9) | 1 | 1 (day 4) | 24 -> 30 | village-lost / survived |
| Pooled | 31 | 7 | 7 | 5 | 88 -> 120 (+32) | — |

Pooled inside evenings: OFF 88, ON 120 (+32) — on the ON leg
every seed spends all 30 evenings inside. The evening share
(SECONDARY, not the judge): 5/5 = 1.000 on the ON leg, against
31 OFF creek evenings — the collapse the new primary was
written to stop rewarding/punishing: each rescued episode
contributes only its first evening to the ON denominator.

Two ON-leg creek evenings deserve a note because they are NOT
OFF episodes: 13268 day 28 is a second creek refusal on the ON
leg only (the day-5 bridge was gone by then — bridges are
storm-breakable — and the lever bridged again, rescued). It
counts in the 5/5 evening share but, correctly per the prereg,
not in the 7/7 episode rate: episodes are counted on the OFF
leg and the denominator never shrinks because the lever
worked, nor grows because it worked twice.

## Why the band came up short (diagnosed, not speculated)

The census promised 8 episodes (13025: 3, 13067: 1, 13268: 3,
13276: 1). The judged OFF leg delivered 7, and the shortfall
is traceable to a driver-family mismatch, proven by a
diagnostic re-run (scratch only, deleted after, never judged
data):

- The blockscreen2 census legs used the blocktype driver: no
  thief ability granted, no thief taps. The woodcarry driver
  family (creekremedy-trace shape, retained here for substrate
  identity with the prior arm) grants the player a thief ability
  at setup and taps it on the last 5 loop-days.
- Diagnostic: the judged driver with ONLY the thief grant
  disabled, seed 13025, reproduces the census EXACTLY —
  refused days 14, 15, 16, 20, 21, 24, 25, 26, 27, 28, 29, 30
  and 18 inside evenings. The judged OFF leg for 13025 shows
  refused days 16, 18, 19 and 26 inside evenings. The grant is
  therefore the proven perturber for 13025: a granted ability
  changes competent.daily's choices (and RNG consumption) from
  day 1 on some seeds, shifting whole trajectories.
- 13067 reproduces exactly under both families (days 4-5, 28
  inside), so the perturbation is seed-dependent, not uniform
  — which is why a 4-seed band can lose exactly one episode
  to it (13025's three census episodes collapse into two
  judged episodes; 13268's and 13276's episodes shift days but
  keep their counts).
- The prereg's stated caveat covered only the tap-day
  difference (loop-days 26-30). It missed the grant. That is
  this run's design flaw, recorded here so the next run does
  not repeat it: creek-band legs must be banked under the
  judged driver family, or the driver must drop the thief
  grant (and, prudently, the taps — substrate identity only,
  never judged) and re-verify reproduction against the census
  before judging.

## Harm audit (reported, not hidden)

- Player deaths pooled: OFF 6, ON 1 — the guard passes with
  margin, and the direction favors the lever. OFF deaths: wild
  (13025 day 20, 13067 day 6, 13268 days 12 and 17), contest
  (13268 day 27), starvation (13276 day 9). The sole ON death
  is wild on 13025 day 24, same villager lineage
  (gen_c4izvnr) as the OFF day-20 wild death — a later death
  on a rescued trajectory, not a carry-caused death: the carry
  costs 0 kcal, the pile floor held (minimum pile after an
  acted carry 11, never below the 8 floor), and no ON death is
  starvation or overload.
- 13276 flips end-state: village-lost OFF, survived ON — the
  day-4 bridge keeps the player (who starved on day 9 OFF
  after six creek-stranded evenings) home and alive.
- One cost, honestly recorded from the prior run and not
  re-observed here: carry-tick divergence can cost an evening
  on a tap day (prior run: 1 lost vs 20 gained). This run's
  net is +32 inside evenings with no seed losing an evening
  ON vs OFF — but the mechanism (2-tick morning shifts) is
  real and a future run should keep watching it.

## Sense-testing (read end to end, judged for meaning)

- 13268 day 2 (first carry morning): the tail opens "You take
  4 logs from the woodpile for the road home. (12 left for the
  hearth.)" — a person preparing, in the engine's own takeWood
  voice, with the hearth reserve named. It reads as packing
  for the road, not a teleporting inventory trick: the logs
  come from a named pile, the remainder is stated, and the
  weight (8 kg) is a real pack cost the engine enforces.
- 13268 day 5 (rescued episode, first evening): the day
  forages, and the engine's refusal line appears three times
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
- 13025 day 18 (already-bridged episode): no refusal strands
  the evening at all — the creek is noted once in passing and
  the villager walks home ("Travel 1 tile to Haven"). This is
  the prereg's "(or a bridge is already built spanning that
  creek by then)" case, played: the day-16 bridge quietly does
  its job on day 18.
- Still-refused evenings: NONE exist on the ON legs (all 5 ON
  creek evenings rescued), so the lever's lacking-line was
  NEVER exercised in a played tail for the second consecutive
  run. The honesty guard passes vacuously (0 fails out of 0
  owed lines). The line text itself is unit-proven (proof T3:
  wood line names 4 logs, kcal line names 60, ticks line names
  96), but the narration gap creekremedy documented is NOT yet
  proven closed in play. That proof needs a still-refused
  evening — e.g. a kcal-starved creek seed where the bridge is
  skipped — and is a named follow-up, not a claim made here.

Judgment: the carried-log evenings read as people preparing
and solving a named problem. The narration fix is written but
still unplayed.

## Village assessment (plain words)

Four villages, thirty days in. On the OFF leg, three survive
the month and one (13276) loses its village; on the ON leg all
four survive and every single evening — 120 of 120 — is spent
inside at haven. The story of this run is 13268: on the OFF leg
its player spent twenty evenings camped on a creek bank (three
long episodes, 10 inside evenings out of 30, two wild deaths
across successions), and with four logs packed on the morning
of day 2 the first refused evening ends with a lashed bridge
and a walk home, and the village never sleeps out again. On
13276 the same small thing — four logs in the pack on day 2 —
is the difference between a player starving on day 9 after six
stranded evenings and a village that survives the month. What
was missing on every refused night was the same small thing
creekremedy measured — four logs in the pack — and when the
pack holds them, the engine's own bridge does the rest. The
blank this run fills is the proof that the precondition works
end to end at the episode level (carry -> bridge -> home, 7/7
episodes, 5/5 evenings); the blank it documents but does not
fill is the powered confirmation (n = 8 episodes under the
judged driver family, not the census family) and the unplayed
narration line.

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
  both legs by daysAlive; 13276 is village-lost OFF despite
  30 recorded evenings, survived ON).

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

- EPISODE PRIMARY, VALIDATED: the episode rate behaved as
  designed — 7/7 episodes rescued while the evening share
  (5/5 on 5 ON evenings vs 31 OFF) shows the collapse the
  supersession was written to avoid. Keep the episode rate as
  primary for the next run; do not revert to evening share.
- BAND-SELECTION FLAW (this run's lesson, stated plainly):
  a band banked under one driver family (blocktype: no thief
  grant, no taps) was judged under another (woodcarry: thief
  grant + taps). The next prereg must bank the band under the
  judged driver — or strip the judged driver of the thief
  grant and taps (neither is judged; both are substrate
  identity) and re-verify census reproduction seed by seed
  before judging. Budget: at the judged family's episode rate
  (7 episodes / 4 seeds = 1.75 per seed), a 6-seed band clears
  min-n 8 with margin; a 5-seed band is the floor, not the
  plan. Extension candidates for the next run's note only
  (NOT added to this band): the remaining blockscreen2 banked
  creek-adjacent seeds are exhausted for creek (only 4 creek
  seeds were banked); the next run needs a fresh creek band
  banked under its own driver, or a re-bank of 13025/13067/
  13268/13276 plus 2+ new creek seeds under the stripped
  driver.
- TAP-DAY DIVERGENCE, STILL OPEN: the diagnostic proved the
  grant perturbs 13025; it did not isolate taps (taps ran in
  the diagnostic and reproduction still held on that seed).
  Tap effects on other seeds' days 26-30 remain unisolated —
  another reason to strip taps from creek-band drivers.
- Kcal floor on a free action: the 60-kcal morning floor
  never bound again (0 skips in 4 seeds, second run running).
  It costs nothing to keep, but the NEXT prereg may drop it
  to 0 without changing any observed outcome.
- Ticks gate: the 96-tick evening gate never skipped a bridge
  again (0 skips) — all five ON creek evenings held 96+
  ticks. The gate remains untested under pressure.
- Honesty vacuity, second run running: two consecutive runs
  with zero still-refused ON evenings. The lacking-line proof
  now needs a deliberately staged still-refused evening (e.g.
  a kcal-starved creek seed) as its own measurement, not a
  third hope that a judged band produces one by accident.
- If the metric proves wrong, write it under "metric review"
  in the evidence file and propose the revision for the NEXT
  run — never re-score mid-run.

## Evidence files

- Prereg: evidence/2026-10-29/sim-woodcarry2-b-prereg.md
  (commit 5d622ffc4, before any judged leg)
- This file: evidence/2026-10-29/sim-woodcarry2-b.md
- Analysis: evidence/2026-10-29/sim-woodcarry2-b-analysis.json
  (pure JSON)
- Corpora: evidence/2026-10-29/sim-woodcarry2-b-corpus-off/
  (4 seeds, lever OFF),
  sim-woodcarry2-b-corpus-on/ (4 seeds, lever ON)
- Instruments (landed as the measurement record):
  scripts/analyze-woodcarry2-b.js,
  scripts/test-woodcarry2-b.js (T1–T3 unit tests ran green
  before the revert; T4–T12 judge the corpora via the analyzer
  and remain runnable — the proof script skips T1–T3
  gracefully when the policy is absent)
- REVERTED, NOT in this commit (killed arms leave no trace):
  scripts/policies/woodcarry.js (the lever) and
  scripts/woodcarry2-trace-b.js (its driver, which requires the
  lever). To re-run this arm, a future worker rebuilds the
  lever from the spec in the prereg + this file — the algorithm
  is fully specified there — and re-derives the corpora, under
  a driver without the thief grant (see metric review).

## Landing note for the coordinator

INSUFFICIENT-DATA (min-n 7 < 8, episode rate 7/7, all other
guards pass), measurement-record landing: prereg + this evidence
file + analysis + 2 corpora + analyzer + proof. NO src/js
change, NO policy lever, NO default flip. Backlog disposition
(reported, NOT edited — goal hidden_files are the
coordinator's): #1423 claimed by this arm, still open — the
lever is unproven-at-power, not disproven, and needs a
re-banked band under the judged driver family; #1425 satisfied
in method (player deaths counted from the start); #1424 still
open (honesty guard vacuous for a second run). This worker
does NOT merge to master — coordinator merges. Report:
'committed, pending coordinator merge'.
