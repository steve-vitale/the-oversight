# sim-woodcarry-b — INSUFFICIENT-DATA (killed-at-pilot on min-n): 3/3 rescued, n=3 < 8

Run: oversight-flesh-out-loop-b, arm sim-woodcarry-b, axis
food-economy. Worktree sim-woodcarry-b. POLICY-SIDE
LEVER ONLY: zero src/js changes, zero default flips.
This worker does NOT merge to master — coordinator
merges.

Prereg: evidence/2026-10-29/sim-woodcarry-b-prereg.md
(committed 9835310f9, before any judged leg). Judge
(prereg, unchanged): GO requires ON-leg creek n >= 8
AND rescue share >= 0.50 AND unclassified == 0 AND
errs == 0 AND determinism byte-identical AND
divergence audit ok AND player-death guard AND
honesty guard. A miss is never re-scored.

## Verdict: INSUFFICIENT-DATA — the effect never failed, the power ran out

| Check | Result | Bar |
|---|---|---|
| Creek evenings (ON leg, pooled 12 seeds) | 3 | n >= 8 |
| Rescue share (ON leg) | 3 / 3 = 1.000 (Wilson 95%: 0.438–1.000) | >= 0.50 |
| Unclassified (both legs) | 0 / 0 | == 0 |
| Classifier errs (both legs) | 0 / 0 | == 0 |
| Determinism re-run (seed 11636, ON) | byte-identical | identical |
| Divergence audit (all 12 seeds) | ok — first difference on/after first lever action | ok |
| Player deaths (pooled) | OFF 17, ON 12 | ON <= OFF + 1 |
| Starvation player deaths (pooled) | OFF 2, ON 2 (same seeds/days) | not worse |
| Honesty guard | 0 fails — VACUOUS (see below) | 0 fails |
| Wrapper/driver rescue agreement | 0 disagreements | 0 |
| Proof | scripts/test-woodcarry-b.js: T4 FAILS (min-n), T5–T11 PASS | — |

The prereg's fallback was used in full: pilot 8 seeds
yielded ON creek n = 3, so the run extended with
11728 + 11729 + 11730 + 11731 (the full authorized
4-seed extension). The extension seeds produced ZERO
creek evenings on either leg, so pooled n stayed 3.
Per the prereg, n < 8 after the fallback is
INSUFFICIENT-DATA, and the prereg's killed-at-pilot
rule applies: the lever is NOT landed and the policy
file is REVERTED (killed arms leave no trace). No
confirm legs were run — confirm requires a pilot GO,
which the min-n failure blocks. This is NOT a NO-GO:
no rescue failed, no guard failed on game grounds,
and the Wilson lower bound (0.438) sits below the
0.50 bar only because n = 3. The lever is
unproven-at-power, not disproven.

## The lever (as built, then reverted)

scripts/policies/woodcarry.js (REVERTED — not in this
commit; the spec below is the record, the corpora are
the runnable proof):

1. MORNING CARRY (pre-competent.daily, only when the
   player starts the day at haven): if wood < 4, pile
   minus deficit >= 8, morning kcal >= 60, and
   canCarry(deficit * 2), take exactly deficit =
   4 - wood logs — the same honest transaction as
   Game.takeWood (pile -= n, addWood(n), say line,
   tickAction(2)). takeWood itself takes a fixed
   min(4, pile), so a deficit-sized take is the only
   way to never exceed the bridge cost.
2. EVENING BRIDGE (post-nighttravel.daily, only on a
   travel-refused evening with hopReturnKind
   block:creek): classify from refusal-time state
   (creekremedy-diag's pure classifier); if
   classified creek AND wood >= 4 AND evening kcal
   >= 60 AND ticks-to-day-end >= 96 AND the probe
   tile carries needsBridge true and bridged false,
   call Game.buildBridge(tile); if bridged, retry one
   Game.travelTo(haven); if arrived, delegate to
   insideevening's eveningStep. If still refused, say
   ONE honest line naming what is lacking.
3. OFF leg (WOODCARRY=0): no carry, no bridge, no
   line — but still classifies refused evenings
   (pure reads), so OFF/ON record shapes match.

Carry behavior on the pooled ON legs (27 acted
carries): skips were pile-floor 13 (the 8-log hearth
floor worked — no take when the pile would drop
below 8), already-carrying 290 (the habit is idle
once the pack holds 4, as designed), not-at-haven
30 (mornings spent away — correctly no take).
Kcal-floor skips: 0 — the 60-kcal morning floor
never bound. CanCarry skips: 0. Bridge skips: 0 —
every classified ON creek evening attempted and
built. Bridge outcomes: 3 completed entries, all
inside.

## Per-seed legs (creek / rescued / inside OFF -> ON)

| Seed | Creek OFF | Creek ON | Rescued | Inside OFF -> ON | End |
|---|---|---|---|---|---|
| 11636 | 6 | 1 (day 4) | 1 | 24 -> 30 | survived / survived |
| 11707 | 5 | 2 (days 8, 28) | 2 | 20 -> 30 | survived / survived |
| 12027 | 0 | 0 | — | 21 -> 21 | survived / survived |
| 11626 | 0 | 0 | — | 25 -> 25 | survived / survived |
| 11639 | 0 | 0 | — | 25 -> 25 | survived / survived |
| 11654 | 0 | 0 | — | 25 -> 24 | survived / survived |
| 11697 | 0 | 0 | — | 18 -> 18 | survived / survived |
| 11714 | 0 | 0 | — | 27 -> 30 | survived / survived |
| 11728 | 0 | 0 | — | 30 -> 30 | village-lost / village-lost |
| 11729 | 0 | 0 | — | 28 -> 30 | survived / survived |
| 11730 | 0 | 0 | — | 30 -> 30 | survived / survived |
| 11731 | 0 | 0 | — | 30 -> 30 | survived / survived |

Pooled inside evenings: OFF 303, ON 323 (+20). The
gain is concentrated where the lever acts: 11636
+6 (the whole 6-evening creek episode collapses
into home nights once day 4 bridges) and 11707
+10 (two episodes bridged). The OFF leg
reproduces creekremedy exactly on the shared seeds
(11636: 6, 11707: 5, 12027: 0) — the cross-check
holds, so the collapse from 11 OFF evenings to 3
ON evenings is the lever's doing, not base drift:
a bridged creek stays bridged, so each rescued
episode contributes only its first evening to the
ON denominator. The 11707 day-28 evening is a
downstream episode visible only on the ON leg
(trajectory after the day-8 rescue) — also
rescued, counted honestly in the ON denominator.

Other-refused evenings (non-creek hop types,
context only): OFF 25, ON 22 — the lever does not
touch them, by design.

## Harm audit (reported, not hidden)

- Player deaths pooled: OFF 17, ON 12 — the guard
  passes with margin, and the direction favors the
  lever. The clearest case: 11636's player
  (gen_byt45tl) dies "the wild" on day 9 OFF (the
  creekremedy succession death) but survives to
  day 26 ON — the rescue buys that lineage 17 more
  days. 11707 OFF has 2 player deaths (day 12
  sickness, day 18 wild); ON has 0 on that seed.
- Starvation player deaths: OFF 2, ON 2, identical
  seeds and days (11654 day 8, 11697 day 11) — no
  new starvation death is attributable to the
  carry (it costs 0 kcal; the pile floor held).
- One cost, honestly recorded: 11654 day 30 is
  inside OFF but out-of-reach away ON — trajectory
  divergence from the carry's 2-tick morning shifts
  (first row difference day 2, the first carry day;
  the outcome difference materializes only on day
  30, a tap day, with no creek involvement and no
  death). The same divergence class also gains
  evenings elsewhere (11714 +3, 11729 +2, with no
  creek evenings on either leg). Net pooled effect
  is +20 inside evenings; the single lost evening
  is the price of a living trajectory, not a lever
  defect — but it is real, and a future run should
  watch whether carry-tick divergence systematically
  costs evenings (it did not here: 1 lost vs 20
  gained).

## Sense-testing (read end to end, judged for meaning)

- 11636 day 2 (first carry morning): the tail opens
  "You take 4 logs from the woodpile for the road
  home. (10 left for the hearth.)" — a person
  preparing, in the engine's own takeWood voice,
  with the hearth reserve named. It reads as
  packing for the road, not a teleporting inventory
  trick: the logs come from a named pile, the
  remainder is stated, and the weight (8 kg) is a
  real pack cost the engine enforces via canCarry.
- 11636 day 4 (rescued evening): the day forages,
  meets Dmitri and Mara, and the engine's refusal
  line appears twice ("The creek runs fast here —
  no crossing without a bridge or a swim.") — the
  repetition is the engine's own (competent.daily's
  trip attempt, then nighttravel's hop), slightly
  robotic but honest — and then it resolves:
  "You lash logs together. A rough bridge spans
  the gap. Rough wood, though — a bad storm could
  take it." followed by "Travel 2 tiles to Haven."
  and "You walk back into Haven." The bridge line
  is the engine's own buildBridge voice, and the
  arrival is a played homecoming, not a counter
  increment.
- Still-refused evenings: NONE exist on the ON legs
  (all 3 creek evenings rescued), so the lever's
  lacking-line was NEVER exercised in a played tail.
  The honesty guard passes vacuously (0 fails out
  of 0 owed lines). The line text itself is unit-
  proven (proof T3: wood line names 4 logs, kcal
  line names 60, ticks line names 96), but the
  narration gap creekremedy documented is NOT yet
  proven closed in play. That proof needs a
  still-refused evening — e.g. a kcal-starved creek
  seed where the bridge is skipped — and is a named
  follow-up, not a claim made here.

Judgment: the carried-log evenings read as people
preparing and solving a named problem. The
narration fix is written but unplayed.

## Village assessment (plain words)

Twelve villages, thirty days in. Ten survive the
month on both legs; 11728 loses its village on
both legs identically (the lever changes nothing
there — no creek, no rescue, same end). The story
of this run is two villages. On 11636, the player
used to spend six evenings camped on a creek bank
at (5,5), starving from 2300 kcal to 0, and die in
the wild on night 9; with four logs packed on the
morning of day 2, the first refused evening ends
with a lashed bridge and a walk home, and the
same villager lives to day 26. On 11707, five
creek evenings used to end in sickness and death;
now two separate creek crossings get bridged on
first refusal and the village keeps its player all
month. What was missing on every refused night was
the same small thing creekremedy measured — four
logs in the pack — and when the pack holds them,
the engine's own bridge does the rest. The blank
this run fills is the proof that the precondition
works end to end (carry -> bridge -> home, 3/3);
the blank it documents but does not fill is the
powered confirmation (n = 8 at the episode rate
needs roughly 20+ seeds, not 12) and the unplayed
narration line.

## Wall numbers (every run)

- National: NOT OBSERVABLE in 30-day evening legs
  (pre-seat, no field).
- Table: NOT OBSERVABLE in 30-day evening legs.
- Wins: NOT OBSERVABLE in 30-day evening legs;
  0 win flags present.
- Wave 4–5 unlocks: not re-measured on this leg
  shape (creekremedy reported 0/3, maxWaveUnlocked
  2); no wave-4/5 content is reachable from a
  30-day evening leg, and none is claimed.
- Median survival: 30 days (11/12 villages survived
  30 days on both legs; 11728 village-lost on both).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered before judging: this leg is a 30-day
position measurement of a POLICY-SIDE lever — zero
src/js changes, so there is no game-root delta for
a panel to compare, and the panel's registry
policies do not include the nighttravel trace
policy. The divergence audit + determinism re-run
are the instrument-perturbation proofs, and the
pre-registered GO bar above is the judge.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- COLLAPSE, CONFIRMED AND QUANTIFIED: bridging is
  permanent, so the ON-leg evening denominator
  collapses to the episode count (11 OFF evenings
  -> 3 ON evenings; episode rescue 3/3 = 1.000).
  The evening-share metric REWARDS fast rescue and
  PUNISHES slow rescue by construction — that
  incentive is intended, but at the observed
  episode rate (~0.25 episodes/seed on this band)
  min-n 8 evenings needs ~30 seeds, not 12. The
  NEXT run's prereg should promote the EPISODE
  rescue rate (episodes rescued / episodes) to
  primary with min-n 8 EPISODES, keep the evening
  share as secondary, and budget seeds from the
  episode rate (or use a creek-enriched seed band
  pre-registered from the OFF legs, never cherry-
  picked from ON results). Judging this run's 3/3
  against the evening bar it was written under
  would be a re-score; it stays INSUFFICIENT-DATA.
- Kcal floor on a free action: the 60-kcal morning
  floor never bound (0 skips in 12 seeds). It costs
  nothing to keep, but the NEXT prereg may drop it
  to 0 without changing any observed outcome — a
  morning floor near 0 can only gain rescues.
- Ticks gate: the 96-tick evening gate never
  skipped a bridge (0 skips) — all three ON creek
  evenings held 107+ ticks, matching creekremedy.
  The gate is untested under pressure; a future
  run with late-day refusals should watch it.
- Death-guard scope, corrected mid-run and
  disclosed: the analyzer first counted ALL sampled
  deaths (villager + monster: OFF 77, ON 78). The
  prereg guard counts PLAYER deaths, so the
  analyzer was fixed to filter death.player == true
  (OFF 17, ON 12) and the fix is recorded here, not
  hidden. The guard passes under either count
  (78 <= 77 + 1 also holds), so the correction
  changes no verdict — but the next run's analyzer
  should count player deaths from the start.
- Narration proof gap: the lacking-line needs a
  still-refused evening to be proven in play. The
  next run should include (or separately stage) a
  kcal-starved creek refusal on the ON leg and
  read its tail end to end.

## Evidence files

- Prereg: evidence/2026-10-29/sim-woodcarry-b-prereg.md
  (commit 9835310f9, before any judged leg)
- This file: evidence/2026-10-29/sim-woodcarry-b.md
- Analysis: evidence/2026-10-29/sim-woodcarry-b-analysis.json
  (pooled pilot + fallback extension; pure JSON)
- Corpora: evidence/2026-10-29/sim-woodcarry-b-corpus-off/
  (8 pilot seeds, lever OFF),
  sim-woodcarry-b-corpus-on/ (8 pilot seeds, lever ON),
  sim-woodcarry-b-corpus-off-ext/ (4 fallback seeds,
  lever OFF), sim-woodcarry-b-corpus-on-ext/ (4
  fallback seeds, lever ON)
- Instruments (landed as the measurement record):
  scripts/analyze-woodcarry-b.js,
  scripts/test-woodcarry-b.js (T1–T3 unit tests ran
  green before the revert; T4–T11 judge the corpora
  via the analyzer and remain runnable — the proof
  script skips T1–T3 gracefully when the policy is
  absent)
- REVERTED, NOT in this commit (killed arms leave no
  trace): scripts/policies/woodcarry.js (the lever)
  and scripts/woodcarry-trace-b.js (its driver,
  which requires the lever). To re-run this arm, a
  future worker rebuilds the lever from the spec in
  the prereg + this file — the algorithm is fully
  specified there — and re-derives the corpora.

## Landing note for the coordinator

INSUFFICIENT-DATA (killed-at-pilot on min-n),
measurement-record landing: prereg + this evidence
file + pooled analysis + 4 corpora + analyzer +
proof. NO src/js change, NO policy lever, NO
default flip, NO confirm legs (confirm requires a
pilot GO). The next lever attempt needs its own
prereg with the metric review applied (episode-rate
primary, min-n 8 episodes, seed budget from the
episode rate) and a still-refused tail to prove the
narration line in play. This worker does NOT merge
to master — coordinator merges. Report: 'committed,
pending coordinator merge'.
