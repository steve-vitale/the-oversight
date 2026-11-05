# ENCOUNTERPROD — wave-4 encounter production, upstream of the trigger (Loop B verdict, run fleshout-loop-b-20261105T0330Z, arm sim-encounterprod2-b)

Axis: winnability chain, scale-onramp. DIAGNOSTIC + ONE POLICY-SIDE
PROBE, zero src/js. No gate/price/deed/readyDemand/VETSHAPE change.
If the probe had GOed, the game-code build would be a NEXT run's arm,
not a silent addition here.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-05/sim-encounterprod-b-prereg.md`
(commit 03213fe0b). In short: fresh band 99141–99148, competent
policy verbatim (baseline) vs competent + seek sorties on the SAME
seeds, 150d death-aware horizon, encounterprod instrument (spawn/
cast/fight wrappers after trigger-instrument's proven pattern; daily
snapshots carry the wave-4 unlock components w2pts/bar2/dayFloor/
gated/t4 so the unlock day is DERIVED offline and unlockedWave() is
never called mid-run). PRIMARY metric = mechanism census with one
sub-cause per unmet/never-unlocked seed. GO (for a BUILD candidate)
iff BOTH: (A) one sub-cause accounts for >= 50% of the
unmet/never-unlocked seeds, AND (B) seek faced-seeds >= baseline
faced-seeds + 2. Balanced panel (§15): INAPPLICABLE for a pure
diagnostic + policy-side probe with no Game-root change — stated,
not fabricated.

## Verdict — DIAG-NO-CANDIDATE (judged strictly against the prereg)

- Clause A: met ON THE LETTER ONLY, and tied — the 2 baseline
  problem seeds split 1 STANDING / 1 LEDGER, so each sits at exactly
  50% and NO single mechanism dominates. There is no dominant
  opportunity mechanism to build on.
- Clause B: FAILED decisively — seek faced 0/8 vs baseline 6/8
  (needed >= 8/8). The seek probe did not move facing at all; it
  moved villages into early graves instead (seek median survival
  43d vs baseline 89.5d; every seek village died by day 62, none
  unlocked wave 4).
- The census itself is the deliverable, and it reframes the arm's
  question: on this fresh band there are ZERO unlocked-but-unmet
  seeds. Every seed that unlocked wave 4 also faced it (6/6), and
  every faced seed did so through ample post-unlock spawns (3–12
  post-unlock w4 spawns, 2–10 of them on the player's tile). The
  99102/99106 shape from the old band — unlocked but never met —
  did not reproduce here at all. Encounter OPPORTUNITY is not the
  binding problem on this band; the two never-unlocked seeds failed
  on the unlock rungs themselves (standing, ledger), not on meeting
  a monster afterwards.
- Instrument errors 0 on all 16 judged runs. Derived unlock days
  matched finalize unlockedWave on all 8 baseline seeds (no
  unlockMismatch anywhere) — the derivation is validated.
- Proof: `scripts/test-encounterprod-20261105.js` — 15/15 PASS
  (analyzer fixtures for every class + sub-cause, seek cleanliness
  leg, live smoke, determinism, instrument neutrality, seek
  hook-preservation + engagement legs). No balanced-panel comparison
  exists for a diag + policy probe, so none is fabricated and none
  is attached (per §15, stated not omitted silently).

## THE ANSWER (plain words)

Villages that reach wave 4 meet wave 4. On this band, six villages
unlocked the fourth wave and all six fought its monsters — seven to
fifteen wave-4 fights each, within days to weeks of unlocking. None
of them sat unlocked-but-unmet. The two villages that never got
there didn't fail to find a monster; they failed to earn the
unlock. One fought constantly for 68 days — 75 fights, 35 kills,
monster announcements from day 3 — and its standing never got past
20, so the door never opened. The other died at day 36 with only
one wave-2 ledger point, before it had killed enough of the second
wave to qualify. Sending the player out hunting for remembered
monster tiles made everything worse: those villages died around
day 43 instead of day 90, and none lived long enough to unlock
anything. The opportunity problem, on this band, is not opportunity
at all — it is standing that will not accumulate, and villages
that die before they qualify.

## Baseline per-seed table (competent verbatim, 99141–99148)

days = run days; end = village-lost except 99143 (survived to the
150d horizon, censored); un = derived unlock day (— = never);
gPeak = gated peak; rPeak = raw peak; finW2 = final wave-2 ledger
points; w4f = wave-4 fights (wild in parens); w4k = wave-4 kills;
spPost = post-unlock w4 spawns; spTile = of those, on the player's
tile; f/d = post-unlock w4 fights per unlocked day.

| seed | days | end | un | gPeak | rPeak | finW2 | w4f (wild) | w4k | spPost | spTile | f/d | class / sub-cause |
|------|------|-----|----|-------|-------|-------|------------|-----|--------|--------|-----|-------------------|
| 99141 | 90 | lost | 54 | 199 | 200 | 16 | 7 (6) | 1 | 6 | 4 | 0.19 | UNLOCKED-FACED |
| 99142 | 89 | lost | 74 | 150 | 150 | 15 | 7 (7) | 0 | 9 | 3 | 0.44 | UNLOCKED-FACED |
| 99143 | 150 | surv | 75 | 199 | 240 | 16 | 7 (7) | 1 | 12 | 10 | 0.09 | UNLOCKED-FACED |
| 99144 | 100 | lost | 72 | 150 | 150 | 10 | 13 (12) | 0 | 10 | 9 | 0.45 | UNLOCKED-FACED |
| 99145 | 68 | lost | — | 20 | 20 | 9 | 0 | 0 | 0 | 0 | — | NEVER-UNLOCKED / STANDING |
| 99146 | 118 | lost | 73 | 199 | 225 | 10 | 15 (15) | 2 | 9 | 3 | 0.33 | UNLOCKED-FACED |
| 99147 | 36 | lost | — | 0* | 0* | 1 | 0 | 0 | 0 | 0 | — | NEVER-UNLOCKED / LEDGER |
| 99148 | 60 | lost | 46 | 125 | 125 | 16 | 10 (9) | 0 | 3 | 2 | 0.67 | UNLOCKED-FACED |

(* 99147's gated/raw peaks are 0 on every snapshot; the analyzer's
peak reduce (init null, `>` comparison) displays a 0-peak as null.
Classification is unaffected — final w2pts 1 < 5 hits LEDGER first.
See metric review.)

Baseline totals: 69 wave-4 fights (62 wild), 4 wave-4 kills, 49
post-unlock w4 spawns, 31 of them on the player's tile. Unlock-day
distribution: 46, 54, 72, 73, 74, 75 (median 72.5). No seed shows
NO-SPAWN, SPAWN-NO-TILE, or TILE-NO-FIGHT — the unmet sub-causes
are all empty on this band.

## Seek per-seed table (same seeds, competent + encseek probe)

Seek calls = pre-step sorties toward announcement-remembered tiles
(arrived / fightStarted in parens). Every seek village died early;
none unlocked wave 4, none faced it.

| seed | days | end | gPeak | finW2 | w4f | seek calls (arr / fight) | class / sub-cause |
|------|------|-----|-------|-------|-----|--------------------------|-------------------|
| 99141 | 39 | lost | 0 | 13 | 0 | 7 (6 / 0) | NEVER-UNLOCKED / STANDING† |
| 99142 | 43 | lost | 0 | 10 | 0 | 11 (7 / 1) | NEVER-UNLOCKED / STANDING† |
| 99143 | 43 | lost | 25 | 12 | 0 | 14 (13 / 0) | NEVER-UNLOCKED / STANDING |
| 99144 | 46 | lost | 0 | 7 | 0 | 10 (8 / 0) | NEVER-UNLOCKED / STANDING† |
| 99145 | 22 | lost | 0 | 2 | 0 | 3 (3 / 0) | NEVER-UNLOCKED / DIED-EARLY |
| 99146 | 47 | lost | 50 | 12 | 0 | 12 (10 / 0) | NEVER-UNLOCKED / STANDING |
| 99147 | 43 | lost | 0 | 7 | 0 | 10 (10 / 0) | NEVER-UNLOCKED / STANDING† |
| 99148 | 62 | lost | 50 | 13 | 0 | 15 (12 / 0) | NEVER-UNLOCKED / STANDING |

(† Analyzer prints these four as ANOMALY because the 0-peak reads
null and the STANDING branch requires a non-null peak; verified
against raw snapshots — gated is 0 on every snapshot day, final
w2pts >= 5 — so the true sub-cause is STANDING. Corrected seek
census: STANDING 7, DIED-EARLY 1. See metric review.)

Seek totals: 82 seek calls, 69 arrived, only 1 started a fight.
The remembered tile almost never still holds the monster the next
day (monsters wander; memories go stale), and the daily pre-step
sortie itself displaces the competent day's home routine — the
probe's villages died at a median 43 days instead of building
toward unlock. A future seek probe, if any, should bias the forage trip's
destination from inside the competent day, not prepend a sortie
before it — and should only seek when the party can actually fight
what it finds (competent's own fight-assess decline exists for
exactly this reason and the probe bypassed it).

## Wall numbers

Baseline (8 seeds): wins 0/8, national 0/8, table 0/8 (scaleRank
"village" on all 8; no seed leaves village scale), wave-4 unlocks
6/8, wave-4 faced 6/8, wave-4 kills 4, wave-5 unlocks 0/8, wave-5
faced 0/8, median run-days 89.5 (sorted: 36 / 60 / 68 / 89 / 90 /
100 / 118 / 150; 1 seed censored at the horizon).
Seek (8 seeds): wins 0/8, national 0/8, table 0/8, wave-4 unlocks
0/8, wave-4 faced 0/8, wave-4 kills 0, wave-5 unlocks 0/8, wave-5
faced 0/8, median run-days 43 (sorted: 22 / 39 / 43 / 43 / 43 / 46 /
47 / 62; middle pair 43/43).

## Reachability verdict

Waves 1–4 are reached and faced (6/8 seeds face wave 4, 4 kills);
wave 5 is unlocked on no seed, faced on no seed, killed on no seed.
Regional → national, the table, and the win flag are unreached on
all 16 judged runs. The wall has not moved on this band — and this
arm tightens the diagnosis: the encounter-opportunity link is NOT
where the chain breaks here. Unlocked villages meet wave 4
reliably; the breaks are (a) standing that will not accumulate to
100 on a fighting village (99145), and (b) villages dying before
the wave-2 ledger fills (99147). The trigger build (held arm) and
the killer-retention arm remain the live upstream/downstream work;
no new encounter-opportunity build is warranted from this census.

## Sense-read — seed 99145 baseline (NEVER-UNLOCKED / STANDING)

SENSE-TESTING LAW: read, don't just count. The village knew
monsters were near — it could hardly miss them. Spawn announcements
start day 3 ("Something big is moving in the woods. The birds went
quiet."), tile-entry lines name beasts nearly every day ("a crow
that watches too long", "Ugly-Eyes", "Murkcap", "The Static
Kite"), and the village fought 75 times (41 wave-1, 16 wave-2, 18
wave-3) for 35 kills, each cheered in the transcript ("Word travels
fast. The village cheers."). Yet the standing line is flat: 0
until about day 38, then exactly 20 for the last 30 days while the
roster bled 12 → 4 living (15 fallen). The narration is coherent
and the kills are celebrated — but the celebrated blood never
becomes standing. That flat-20-while-dying shape is the finding to
carry forward: on this seed, standing is not gated by monster
knowledge or fighting at all, and whatever does move it was absent
while the village fought and died. (Standing's other sources —
feasts, links, bonds — were not instrumented here; the claim is
only the observed flatness, not which source failed.)

## Metric review

- Derived unlock day: VALIDATED. It matched finalize unlockedWave
  on all 8 baseline seeds (unlockMismatch empty) and all 8 seek
  seeds. The no-mid-run-unlockedWave-call rule cost nothing.
- Null-peak quirk: the analyzer's peak reduce (init null) displays
  a true 0-peak as null, and the STANDING branch's non-null guard
  then mislabels 0-peak, ledger-met seeds as ANOMALY. It did not
  touch the baseline verdict (99147 classifies LEDGER before the
  peak branch; 99145's peak is 20, non-null), but it did mislabel
  4/8 seek seeds. Correction applied in the table above from raw
  snapshots (gated 0 on every snapshot day, final w2pts >= 5 ⇒
  STANDING). Proposed revision for the NEXT run: initialize peaks
  to 0, not null, and drop the non-null guard in favor of an
  explicit missing-data flag.
- Clause A tie: with only 2 baseline problem seeds, the >= 50%
  bar is met by both sub-causes at once (1–1). The prereg's letter
  is satisfied; its intent (a dominant mechanism) is not. Reported
  as letter-met / intent-not-met so the next run does not cite
  this as a concentration finding.
- Seek probe placement: the pre-step design (sortie before
  competent.daily) confounds the probe — it displaces the dawn/home
  routine and the villages die before any facing comparison can be
  read. The faced-seed comparison (Clause B) is still judged as
  preregistered (0 vs 6, fail), but a future probe must bias
  destinations inside the competent day, not prepend a sortie.
- Medians rechecked by hand: baseline sorted days 36, 60, 68, 89,
  90, 100, 118, 150 → middle pair 89/90 → 89.5. Seek sorted days
  22, 39, 43, 43, 43, 46, 47, 62 → middle pair 43/43 → 43. Both
  analyzer medians stand.
- No metric was re-scored mid-run. The TILE-NO-FIGHT sub-cause was
  never populated, so trigger-b's player-left-the-tile result was
  cited, not re-derived — exactly as preregistered.
