# sim-doorwalk-confirm-b — prereg (the door arm, 12-seed confirm on fresh band)

**Arm:** sim-doorwalk-confirm-b (run fleshout-loop-b-20261107T1530Z,
axis scale-onramp / winnability chain) · **Policy-side only, zero
src/js, zero default flips, no changes to any existing policy file.**
Adopts the HELD branch `sim-doorwalk-b` (1430Z run: 5/5 doors
entered, 5/5 wins, NO-GO on a defective median-survival cost bar —
the lever was NOT killed, the branch was HELD for exactly this
metric revision + fresh-band confirm). **Base:** master 4ce3c0c1f
(the finishing-instrument landing; the held branch was rebased
onto that explicit SHA by the replacement worker this run — new
tip 85d3d18cd, all 3 picks applied clean, no stop-at-pick quirk;
predecessor tip 0840d1f06 on base b667f5a4f superseded). **Band:** 53201–53212, FRESH.
**Horizon:** 150d death-aware. **Policies:** baseline = takeseat
substrate (`scripts/policies/competent-linkfeast-b.js`, unmodified,
with `TAKESEAT_B=1`) with `DOORWALK_B` unset; armed = the same
substrate with `DOORWALK_B=1`. The door drive, drain rule, and
rotation are UNCHANGED from the pilot prereg
(`evidence/2026-11-07/sim-doorwalk-b-prereg.md`) — this run revises
only the metric, per the 1430Z metric review.

## Canon

READ first: `docs/CANON.md`, then `docs/TABLE.md` (the endgame
Table — the seat, the seven doors, sanctity, the day-90 floor, the
sticky offer). **No canon is invented here.** Every mechanism claim
is read from `src/js/table.js` and cited in the pilot prereg.

## The blank

The pilot (band 53001–53008, base 62ca38845) produced the first
wins in the game's history — 5/8 doors entered, 5/5 won — and
was judged NO-GO only because the frozen cost bar computed
median survival over NON-WON seeds per leg: the five winners
left the armed set, leaving only the three no-seat seeds that
die early in both legs (86 vs the 120 floor). Per-seed, no
village died earlier; starvation unchanged; guard 8/8. The
1430Z metric review established the WHY (the metric, not the
lever) and proposed this revision. This run judges the SAME
lever under the REVISED metric on a FRESH band, to show the
5/5 is not a band fluke — and to land the branch if it
passes.

## Band freshness (checked this run, before any judged sim)

Band 53201–53212 is named in NO `sim-*-prereg.md` (grep over
`evidence/*/sim-*-prereg.md`, 2026-11-07). In all of
`evidence/*.md` it is named ONLY in
`evidence/2026-11-07/sim-winnability-round-1430.md`, which
reserves it for exactly this confirm and records it never
judged. The convergence tracker and `sim-findings.md` echo
that same reservation. No forbidden/contaminated-band list
names it. Independent re-check by this worker agrees with the
coordinator's 2026-11-07T16:00Z verification recorded in the
1530Z claim file. The band is fresh: never judged on any
substrate.

## Proof status on the rebased tip (85d3d18cd, base 4ce3c0c1f)

`scripts/test-doorwalk-b-20261107.js`: **re-run by the replacement
worker on the new tip — see result below; the predecessor's
29/30 on 0840d1f06 (base b667f5a4f) is superseded.** The single
failure then was the LIVE SMOKE leg (`seatTaken` 0 vs 1 on seed
53003) — expected and recorded honestly, NOT forced green:
the frozen band 53001–53008 collapsed on the new master
(0/8 sit on cf22937b8, villages dying 54–92d; the 1430Z
coordinator's re-baseline, /tmp, not committed). The smoke leg
pins an absolute trajectory value on that band and cannot
re-pin there. All other 29 legs pass, including the
trajectory-neutrality leg (53001 armed reproduces baseline
EXACTLY on the new master). The smoke leg is RE-PINNED on
this confirm: a sat seed on the fresh band must walk its
assigned door and win in the armed leg (see secondaries).
check.js --quick NOT required: zero src/js in this arm.

## Door rotation on the confirm band (unchanged rule)

ROTATION = `['defiant', 'assimilated', 'beloved', 'relay']`,
ASSIGNED = ROTATION[(seed − 53001) % 4]:

| Seed | Assigned | Seed | Assigned | Seed | Assigned |
|---|---|---|---|---|---|
| 53201 | defiant | 53205 | defiant | 53209 | defiant |
| 53202 | assimilated | 53206 | assimilated | 53210 | assimilated |
| 53203 | beloved | 53207 | beloved | 53211 | beloved |
| 53204 | relay | 53208 | relay | 53212 | relay |

Each door is assigned 3×. Fallback/drain rules unchanged from
the pilot prereg (first offered non-feared, else feared;
first-option beats, trial never taken, conscript refused,
downgrade re-applies the door rule).

## BAND RE-CHECK FIRST (gate, before judging anything)

The baseline leg on 53201–53212 runs first and is read before
the armed leg is judged. If the substrate is dead on this band
too (0/12 sit, villages dying ~70d like the collapsed frozen
band), STOP and report that the substrate moved — the lever is
UNJUDGED on a dead band, and no verdict is recorded. The
substrate-sanity bar below is the formal form of this gate.

## Primary metric (REVISED — from the 1430Z metric review)

**Wins at horizon: seats won / 12. GO bar: wins ≥ 4/12 armed
AND ≥ 3 more wins than baseline on identical seeds.** Wins are
the prize the pilot proved possible; the confirm judges the
lever on wins, not on door entry alone (doors entered is a
recorded secondary). The baseline leg is expected to win 0/12
(the gate is off — the RED pin, live); a baseline win would
itself be a finding and is counted honestly in the ≥3-margin
bar.

## Substrate sanity (unjudgeable-if-failed)

The baseline leg must earn lesser seats on ≥ 4/12 seeds AND
sit on ≥ 4/12 seeds (the door drive needs sittings to walk).
If either fails, the run is NO-GO on substrate and the door
drive is UNJUDGED — the substrate moved under the arm, not
the drive. (This is the formal form of the band re-check.)

## Substrate guard (REVISED — 12/12)

Per-seed exact reproduction, the pilot's guard adapted to
12 seeds, bar raised to **12/12**: seeds where no door is
ever entered reproduce the baseline EXACTLY whole-run
(days, endReason, standing, maxWave, wave-4+ kills, final
seat); seeds where a door is entered reproduce the baseline
EXACTLY on every daily row BEFORE the entry day (the pilot
prereg's field list). The guard is computed by the confirm
analyzer from the two corpora and printed in the evidence
file. A guard miss names the seed and the first differing
field — it is an instrument/substrate signal, not a lever
verdict by itself, but the run is NO-GO if the guard is not
12/12 (the instrument must be exact before the lever is
judged).

## Cost bar (REVISED — replaces the defective median bar)

The pilot's median-survival bar is RETIRED: it computed the
median over NON-WON seeds per leg, so a lever that wins
removes its best seeds from its own cost set. In its place:

- **Per-seed survival non-inferiority:** no seed dies earlier
  in the armed leg than its own baseline day. A won seed
  counts at the horizon (150d) — a win is a success, not a
  truncated life. Measured on `days` (harness days), like
  for like per seed. Any armed seed with days < baseline days
  (and not won) fails the bar and is named.
- **Starvation ≤ baseline + 1 total** (tighter than the
  pilot's +2, per the task brief — the pilot ran 1 → 1).
  Arm-only starvation is reported per seed.
- Pair days recorded (not gated — a win truncates pair
  accumulation by design, as the pilot showed: 65 → 9).

A primary hit that breaches the cost bar is NO-GO. A win can
never breach the cost bar.

## Secondaries (frozen from the pilot)

Doors entered per seed (door, branch, day, assigned vs
fallback, rule) / doors offered per sat seed (names) /
finals reached / downgrades taken / conscript refusals /
trial-only skips / challenge beats answered / wins per leg,
national, wave 4–5 unlocks, median survival (all seeds, and
non-won, both reported for the record — NEITHER is a gate
now), pair days, starvation deaths per seed, feast surge +
foodDeeds per seed, links formed per seed, days the run
continues after an entry (modal-stall check), per-seed entry
lag (sit day → entry day, 0 by construction — verify it).
**Smoke re-pin:** the first sat seed in the armed leg must
walk its assigned door and win (the live smoke leg the
collapsed band took away). Scale-wall numbers (national /
table-sat / wins, wave 4–5 unlocks, full seat, median
survival) reported every run.

## Judge

The run is judged against this header. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If a metric
proves wrong, write it under "metric review" and propose the
revision for the NEXT run. Every evidence file carries a
"metric review" section.

## Panel (§15)

Before/after through `scripts/balance-panel.js` — the
doorwalk panel-builder pattern, confirm variant
(`scripts/build-doorwalk-confirm-panels-20261107.js`, seeds
53201–53212, corpora `perseed-doorwalk-confirm-b-*`, pseudo-
policy `'doorwalk'`): panels built from the two per-seed
corpora (paired seeds), scorecard compare, the compare `.md`
attached to the evidence file. The panel is the instrument,
the pre-registered threshold is the judge. The panel measures
the neutral before/after (survival, wins, rank, arc); the
door metrics come from this arm's own driver corpora.
Telemetry deviation check: `scripts/telemetry-check.js`
REFUSES recorder-corpus input by design (same refusal as
sitstep2/feastdrive/takeseat/doorwalk pilot) — record the
refusal, no LOUD line expected; zero src/js changed, so no
Game-telemetry baseline exists to deviate from.

## Convergence state reported

converging | converged | parked | killed-at-pilot, per axis
scale-onramp.

## Tooling (new this run, committed before any judged sim)

- `scripts/doorwalk-confirm-b-analyze-20261107.js` — the
  confirm analyzer: reuses the pilot analyzer's per-seed
  analysis (`analyzeSeed`, `preEntryMatch`, `medianOf`,
  `starvation`) and judges the REVISED bars above (wins
  ≥4/12 AND margin ≥3; guard 12/12; per-seed
  non-inferiority; starvation ≤ baseline+1). Writes
  `/tmp/doorwalk-confirm-b-analysis.json` (working copy; the
  evidence file is the record).
- `scripts/build-doorwalk-confirm-panels-20261107.js` — the
  confirm panel builder: the pilot builder with seeds
  53201–53212, corpora `perseed-doorwalk-confirm-b-*`, run
  names `doorwalk-confirm-baseline/armed`, out prefix
  `doorwalk-confirm-panel`.
- Driver: the pilot driver (`scripts/doorwalk-b-driver-
  20261107.js`), unchanged, run with `OUTDIR` +
  `RUN=doorwalk-confirm-baseline/armed` + `SEEDS=53201..53212`
  + `DAYS=150`. Corpora:
  `evidence/2026-11-07/perseed-doorwalk-confirm-b-baseline/`
  and `perseed-doorwalk-confirm-b-armed/`.

## Proof (before any judged sim)

`scripts/test-doorwalk-b-20261107.js` 29/30 on rebased tip
0840d1f06 (base b667f5a4f) — smoke leg failed as documented
above (collapsed frozen band), all other legs green. **Re-run
on the new tip 85d3d18cd (base 4ce3c0c1f) by the replacement
worker before any judged sim; result recorded in the confirm
evidence file.** The confirm analyzer + panel builder are
exercised against the pilot corpora before the judged run (analyzer must reproduce
the pilot's per-seed rows and report the pilot verdict under
the REVISED bars as a dry run — the pilot passes the revised
bars: wins 5/8 ≥4/12-equivalent, margin 5, guard 8/8,
non-inferiority holds, starvation 1→1).
