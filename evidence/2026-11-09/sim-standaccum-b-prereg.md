# Standing-accumulation diag, part 2 — PRE-REGISTRATION (arm sim-standaccum-b)

Run: fleshout-loop-b-20261109T2307Z (Loop B). Re-point queue item 3
(standing accumulation on gear-ready seeds, the 99107 pattern).
Committed BEFORE any judged computation. DIAG ONLY, zero src/js — a
recorder/instrument, no game change. Gates, prices, deeds, and
readyDemand stay UNTOUCHED. No win-price/deed-gate change.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock" — the standing gate
  IS canon-covered there; no canon invented here.
- `hidden_files/wave4-standing-spec.md` (Steve 2026-10-13, found in
  the goal workspace — it does NOT live in this worktree's
  hidden_files/): one bar, war +25/pt (per-type cap 2), diplomacy
  +34/seasoned regional+ link, plenty +20/major feast; T4=100,
  T5=200 & wave-4 faced. Thresholds are the spec's, not this arm's.
- `src/js/standing.js` (grounding, verified in code, not assumed;
  UNCHANGED since the 2026-11-04 arm — `git log --since=2026-11-04
  -- src/js/standing.js` is empty): `villageStanding()` = war +
  diplomacy + plenty, war = `waveLedgerPoints(3)+waveLedgerPoints(4)
  +waveLedgerPoints(5)` × 25, diplomacy = seasoned REGIONAL+ links
  × 34, plenty = qualifying feasts (quality >= 1) × 20.
  `villageStandingTotal()` is the GATED number: plenty counts at
  most plentyCapT5 (100) toward the T5 bar, and while any
  readiness-5 bar is short the total holds at t5-1 (199) / t4-1
  (99). Thresholds: t4 = 100, t5 = 200.
- Seasoned link (`src/js/hierarchy.js` `_linkSeasoned`): active,
  30+ days old, trust 40+ (conquered links: season only). Regional+
  (`standing.js` `_linkRegionalPlus`): LEAD / BELONG / LEAGUE
  polity participation. A seasoned bond with a splinter village
  scores 0.
- Base moves since the 2026-11-04 arm (recorded, not judged):
  `scripts/policies/competent.js` fight-policy changes
  (build-smallfixes 2026-11-05: pocket_sand once-per-fight,
  losing-control-first window) and `src/js/hierarchy.js` raid-
  cooldown stamp (env-gated). `src/js/standing.js` untouched.

## The pattern, pinned from cited evidence (what it IS)

The re-point's one-line phrasing ("all four bars were met for days
but standing sat short of release") is the gearbar observation,
true ONCE, not reproduced since. Do NOT assume it is exact:

1. `evidence/2026-11-03/sim-gearbar-a.md` — the ONLY observed
   instance of the bars-met-but-standing-short shape: seed 99107
   met ALL FOUR readiness-5 bars (armored 4, armed 7, tricks 20,
   veterans 2) on days 76–80 and still did not release, because
   standing was 150, not the 199/200 the door needs. "Standing
   opens the door; readiness decides walking through."
2. `evidence/2026-11-04/sim-standaccum-b.md` (same arm name, prior
   run fleshout-loop-b-20261104T1830Z, same band, Nov-4 master) —
   the 99107 pattern did NOT recur: 99107 peaked at gated 50,
   never faced wave 4. Instead 3 seeds (99101/99102/99104) cleared
   200 RAW and held at gated 199 because veterans were 0/2 — "the
   199-hold is a veterans problem wearing a standing costume."
   Diplomacy ABSENT: 0 links ever created on all 8 seeds
   (`linkTotal` 0 on ~860 snapshots) — sim-findings #1732.
   Readiness-5-ready days 0/8.
3. `evidence/2026-11-04/sim-vetprod-b.md` — reframed the same band
   as an exact 4/4 TIE (sim-findings #1734): 4 NEVER-FACED-WAVE4
   vs 4 KILLED-DEAD-KILLER + KILLED-LIVING-SHORT; "peak and kill
   never coincide." Replicated the standaccum numbers exactly.
4. `evidence/2026-11-09/sim-bandfreeze-b.md` — on the frozen
   53011–53018 band the veterans bar is the binding number (0/8
   wave-5-ready, best 1/2 living veterans); "the chain's binding
   link, same as on the lead seed."

What this arm will decide, on CURRENT master, on the same band:
(a) does the gearbar-99107 shape (bars-met-but-standing-short)
reproduce at all; (b) on gear-ready days where they exist — else
on peak-standing days — which standing source is short, with
per-seed day-counts; (c) whether the binding constraint is a
standing source at all, or veterans again.

## Primary question

On seeds where all four readiness bars are met, what is standing
by source (war / diplomacy / plenty) over time, and which source
is the binding short one — with per-seed day-counts, not vibes?

## DIAG-GO bar (binding — judge only against this)

DIAG-GO iff ALL of:
1. All 8 seeds classified into exactly one trajectory class
   (precedence-ordered list below; the analyzer assigns by rule,
   never by hand).
2. The binding constraint is named with per-seed day-counts on
   >= 6/8 seeds: one constraint (war / diplomacy / plenty /
   veterans-hold / none) binds on >= 6/8 seeds, where per-seed
   binding is computed by the mechanical rule below on reference
   days (gear-ready days where they exist, else the peak-gated-
   standing day).
3. Instrument errors 0 on all 8 seeds.
A miss on any clause is NO-GO (a split verdict is reported as
DIAG-NO-CANDIDATE, exactly as vetprod-b's 4/4 tie was — the split
IS the finding), never re-scored against a friendlier metric
mid-run. Metric problems go under "metric review" for the NEXT run.

## Trajectory classes (precedence order — first match wins)

1. `released` — gated >= 200 with wave-4 faced and all four
   readiness-5 bars met on >= 1 day (wave-5 unlock observed).
2. `bars-met-standing-short` — >= 1 gear-ready day (all four
   bars met) AND gated < 200 on EVERY gear-ready day (the
   gearbar-99107 shape).
3. `standing-clears-veterans-hold` — peak raw >= 200 AND gated
   held at 199 with veterans the ONLY short bar at peak (the
   standaccum Nov-4 shape).
4. `standing-short` — peak gated < 200, no gear-ready day.
5. `never-unlocked` — peak gated < 100 (wave 4 never unlocked).

## Binding-constraint rule (mechanical, on reference days)

- Reference days: ALL gear-ready days if >= 1 exists, else the
  first day at peak gated standing.
- For a `standing-clears-veterans-hold` seed, the binding
  constraint is `veterans-hold` (standing already clears 200 raw;
  no standing source is short) — reference days are not used.
- For a `released` seed, the binding constraint is `none`.
- Otherwise, on each reference day compute the shortfall of each
  source against its spec pure-path target: warShort =
  max(0, 200 − war) [8 ledger pts × 25], dipShort = max(0, 204 −
  diplomacy) [6 links × 34], plentyShort = max(0, 100 − plenty)
  [5 feasts × 20, the T5 plenty cap]. The day's binding source is
  the argmax (ties: all tied sources, recorded as shared). The
  seed's binding source is the source binding on the most
  reference days (ties: shared). Day-counts reported per seed:
  gear-ready days, reference days, days each source binds.
- The band-level binding constraint is the constraint binding on
  the most seeds; DIAG-GO clause 2 needs >= 6/8 seeds on one
  constraint.

## Method

- Policy: `scripts/policies/competent.js` `{competent}` verbatim,
  default env. No policy variants — this is a diag, not a lever.
- Seeds: 99101–99108, the gearbar/vetbar/standaccum band re-run on
  CURRENT master (worktree tip 65fef6d7e). RE-USE is recorded here
  and is NOT claimed as freshness: this IS this question's
  measured band (gearbar, vetbar, standaccum, vetprod all measured
  it); trajectories WILL drift with base moves since 2026-11-04
  (competent.js fight tweaks above); cite only this run's numbers.
  Band-level pairing with the Nov-4 corpora, not trajectory-
  identical pairing.
- Horizon: 150 days, death-aware (dead villages stop simulating;
  +10d tail max via the harness's runDays death handling). This
  diag IS the 8-seed pilot-scale run; no confirm follows in this
  run (per brief).
- Instrument: fork of the Nov-4 arm's recorder
  (`scripts/standaccum-instrument-20261109.js`,
  `scripts/standaccum-driver-20261109.js`,
  `scripts/standaccum-analyze-20261109.js`), DAILY snapshots of
  raw standing + gated total + war/diplomacy/plenty split +
  warPts + ledger points per wave (3/4/5) + counting-link count +
  FULL link roll (each active link: far end, kind, primary/
  subordinate, age days, trust, seasoned?, regional+?, and the
  reason it does NOT count, if any) + feast-log count and quality
  split + `waveCombatReadiness(5)` bars + ready days + veteran
  counts + roster size + living count + the engine's own
  `standingLine` per row. One change from the Nov-4 instrument:
  the say-sample filter is tightened per that arm's metric review
  (`/standing \d|held|draft waits|feast/i` — the old filter
  filled the 150-line cap with pantry "leaves the fish nets
  standing" and keepsake "feast was the weapon" noise). The
  filter only records say lines; it cannot perturb trajectories
  (proof includes a determinism leg).
- Analyzer additions (new in the 20261109 fork): trajectory
  classification by the precedence rule above; binding-constraint
  computation with per-seed day-counts; gear-ready-day standing
  splits (war/bonds/bread on every gear-ready day); a band table
  against the Nov-4 corpora (headline numbers only, not a
  balance-panel comparison — see §15 below).
- Sense-test: the engine's own `standingLine` on gear-ready days
  and peak days (read from the daily rows, not the noisy say
  sample) judged for coherence against the numbers; say sample
  read with the tightened filter.
- Scale-wall numbers every run: national / table / wins, wave 4–5
  unlocks and facings, median survival (scaleRank, unlockedWave,
  runDays result, won/over flags).
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate (this
  8-seed run), death-aware horizons, pre-registration (this file),
  metric binding (§14), balanced panel (§15 — no before/after
  LEVER comparison exists for a diag, so none is fabricated and
  none is attached; the Nov-4 band table is a headline comparison
  of two diagnostic corpora, stated as such. `balance-panel.js`
  refuses recorder corpora by design — bandfreeze-b §15; if it
  accepts these corpora, the compare .md is attached, else the
  refusal is recorded, not forced).

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether the trajectory classes,
  the binding-constraint rule, and the reference-day choice held
  up; whether the tightened say filter captured standing lines.
