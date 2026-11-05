# journey-scale r99 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-05T0445CST (scheduled 04:45 CST 2026-11-05).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@3f14110d1 at worktree creation.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — all instruments read-only;
pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** this run does NOT re-prove r97's
or r98's verdicts (pilgrimage reset mover = COMPETENT thirst walk;
overnight drain separates on pack water / tile water; national 0/4;
people check real). It answers r98's single carried micro-question
with the instrument r98 named.

## Standing context (read before scoring)
- r98 (2026-11-05 morning, seeds 85501–85504, same band): the overnight
  hydration drain separates cleanly on **pack water carried into the
  night OR fillable tile water at dawn** across all 48 pilgrimage nights.
  Loop nights (28): packW 0 + dry forest_floor + 0 drinks → drain 50–64
  ≈ sleep burn. Retry nights (2): packW 3→2 / 2→1 + 1 morning drink →
  drain 14 both, same tile. Haven/creek nights drink 1–2× at dawn even
  with packW 0 (fill then drink). Tent 0 on all 900 morntrace2 rows —
  shelter ruled out. Burn model holds for no-drink nights.
- r98's carried micro-question, this run's Q1: **why 0 bottles at first
  walk-out vs 2–3 at retry walk-out.** 85503 leaves Haven with packW 0
  on the first walk-out day (d36 postCourt) but packW 3 on the retry
  walk-out day (d55 postCourt); 85504 leaves with 0 (d34) vs 2 (d49).
  Same tile, same scholar, same road. r98 named the instrument: pack
  weight (canCarry) + cistern clean liters at postCourt on walk-out days.
- Code facts (read, not assumed — they shape the instrument, not the
  verdict):
  - `competent.upkeep` runs `drinkSafe` before each morning wait, i.e.
    inside the overnight window between sleep and daily(), and once in
    daily itself. drinkSafe fills ONE bottle per call when the tile
    offers water or the scholar is at Haven and pack < 3L, then drinks
    (+50 hydration, ctx.drank +1) when hydration < 70 and pack water
    exists.
  - `fillWater()` at Haven draws from the shared cistern
    (`state.village.water.clean`); if clean < 1 it refuses aloud ("The
    cistern is dry. Haul from a creek (risky water), or put someone on
    water duty."). It also refuses if `!canCarry(1)` ("Your pack is
    full — water is heavy (1L = 1kg)."). Hauling costs 10 kcal/L.
  - `carryCapacity()` = 20kg base (+5 pack_rat, +10 hoarder, backpack
    carryBonus, +2/kg per STR above 5). `packWeight()` sums the pack.
    `addWater` (storm/rain/event water) clamps to `floor(cap - wt)`.
  - The entry snapshot is taken AFTER sleep + morning waits, so overnight
    fills (morning-wait upkeep) already show at entry; postCompetent
    shows the daily-upkeep fill. A walk-out day whose entry AND
    postCompetent both read packW 0 at Haven means every fill attempt
    that day failed or never ran.
  - One unexplained instance carried from r98: 85501 d28 packW 3→5 on a
    dry tile in rain — possibly rain-water addWater (game.js storm/rain
    addWater paths). Q1b below.
- Band: 85501–85504 is the r97/r98 MATCHED band, reused deliberately
  for comparability; no freshness claim is made for it (the 2026-11-05
  freshness correction governs NEW bands claimed fresh, not a matched
  follow-up on the same band).
- Canon (read): docs/CANON.md (no-silent-actions law), docs/SCALE.md
  (national = one primary with ≥3 seasoned subordinates, or
  BELONG/COVENANT/TRADE/CONQUEST/REFUSE roads; one rung per season).

## Tooling (new instrument only; zero src/js)
- **mornTrace3 (Q1):** policy clone
  scripts/policies/scalecourt-nogate-morntrace3.js = r98 morntrace2
  clone PLUS logging-only fields in `_mornSnap` (no behavior line
  changed): `packKg` = `Game.packWeight()` (1 decimal),
  `carryCap` = `Game.carryCapacity()`, `cistClean` =
  `(Game.state.village.water||{}).clean`, `cistDirty` =
  `(Game.state.village.water||{}).dirty`, `packTop` = the 3 heaviest
  scholar-inventory stacks as `id:kg` (so a pack-full verdict can name
  what the weight is). Snapshots at entry / postCompetent / postCourt
  exactly as r98. Diff vs the r98 clone must contain ONLY added
  logging fields + the export name. The standing scalecourt-nogate.js,
  postrace clone, and r97/r98 morntrace clones are untouched; this
  clone is this run's instrument only.
- Driver: scripts/journey-scale-r99-20261105.js = r98 driver,
  labels/seeds/EVIDIR only (85501–85504, DAYCAP 180), PLUS copying
  ctx.mornTrace daily and writing journey-scale-r99-morntrace3-<seed>.txt
  at end (new fields in the row format). The r98 postrace output is
  kept (same file stem, r99 label) so Q1 can cross-check mornTrace3
  against postrace eval/walk/drop rows.
- Analyzer: scripts/analyze-journey-scale-r99-20261105.js = r98
  analyzer, labels only, PLUS a walk-out classifier (Q1) and a
  rain-catch check (Q1b); Q1b/Q1c from r98 carried unchanged for the
  mover/drain regression check.

## Q1 — WALK-OUT WATER (binding; closes r98's micro-question)
**Question:** on the r97/r98 band, why does the scholar leave Haven
with packW 0 on first walk-out days but 2–3 on retry walk-out days?
**Walk-out day (operational):** a day D whose entry snapshot is at
Haven (4,4) and whose postCourt snapshot is away from Haven with a
pilgrim set (pilgrim != null). First vs retry: a walk-out to vid V is
a RETRY if any earlier postrace trip to V ended without study (drop,
any reason) before day D; else FIRST.
**FINDING clause (pre-registered, not re-scored):** the mechanism is
identified if walk-out days separate cleanly on ONE candidate —
cistern clean liters at entry, pack room at entry
(`floor(carryCap - packKg)`), or the refusal line in that day's
capture ("The cistern is dry" / "Your pack is full") — with ≥2
walk-out days on each side (the band is known to hold 2 first +
2 retry; the analyzer enumerates ALL walk-out days across all 4
seeds, so the count may grow) and the separating value matching the
packW gap (0 on all first walk-outs, ≥2 on all retries). If walk-out
days split across candidates, or <2 days occur on either side, the
verdict is INCONCLUSIVE on count with the traced instances reported
as-is — no re-scoring against a friendlier threshold.
**What would count as interesting:** cistern 0 on all first
walk-outs and ≥1 on all retries — that names a concrete fix (the
shared cistern runs dry before the first pilgrimage and nobody
refills it; the next question is what drains it and what refills
it). A pack-room separation is equally interesting (the scholar
leaves heavy and cannot carry water — the fix is what the pack
holds). A refusal-line separation corroborates either.
**Pilot gate:** seed 85503 runs first; if its mornTrace3 shows no
pilgrimage trip at all, OR the new fields (packKg, carryCap,
cistClean, cistDirty) read null/empty on all rows, STOP and report
(instrument failure, not a game finding). A field that never
populates is a broken instrument, not a game finding.

## Q1b — RAIN CATCH (report-only; r98's unexplained instance)
Enumerate overnight packW increases (entry packW > previous
postCourt packW) with tile/weather; check whether they coincide
with rain (the addWater 'rain' event path) vs Haven/creek fills.
No threshold, no verdict — the instance is either explained or
carried again with its count.

## Q1c — MOVER + DRAIN REGRESSION (report-only; r97/r98 checks rerun)
The r98 Q1b/Q1c classifications run unchanged on the r99 output:
resets by segment (SLEEP-WAITS vs COMPETENT) and the drain table
(first vs retry nights, burn prediction, drankNight). A change from
r98's numbers on the same band would mean the instrument (not the
game) drifted — report any drift, do not re-score r97/r98.

## Q2 — CENSUS CONTINUITY (report-only; r93–r98 metric unchanged)
Seasoned-peer count AND scatter-day gap per seed; national count
reported alongside, not the judge. No threshold, no verdict.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96/r97/r98)
One full sitting read in full from a surviving seed at day 90 if one
exists (85503/85504 pattern from r96/r97/r98); no day substitution
if none survives to day 90. Corpus size is reported, not padded.
Verdict: real vs filler/faked-history, with quoted lines.

## Metric review (carried)
- Q1's FINDING clause is new for this run; the ≥2-per-side count is
  set from what the band is known to hold (2 first + 2 retry named
  walk-outs), NOT from a statistical-power claim — this is a
  mechanism identification on a small-n matched band, and the note
  must say so. r98's ≥3 gate failed on count; r99 does not repeat a
  gate the band cannot meet.
- Burn-prediction tolerance (r98 metric review): the entry snapshot
  is already post-sleep, so no new snapshot point is needed; the ±10
  band stands, and any outside-±10 drink-night case is reported as
  timing noise, not re-scored.
- Telemetry baseline: scripts/telemetry-check.js step 14 runs at
  closeout against telemetry-baselines/scale.json; baseline NOT
  rolled forward without a LOUD-line investigation.

## Fix gate (clause (a) discipline, as r96/r97/r98)
A src/ change lands only if this run's trace identifies a concrete
mechanism AND the fix is a policy-instrument-proven or shipped-study
mechanic change — a trace alone does not meet the gate. Otherwise
the change set stays tooling + evidence + run note. In particular:
a cistern-dry separator names the NEXT instrument (what drains /
refills the cistern), not a same-run game fix; a pack-full
separator names the pack contents, not a capacity change.
