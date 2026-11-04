# Standing-accumulation diag — PRE-REGISTRATION (arm sim-standaccum-b)

Run: fleshout-loop-b-20261104T1830Z. Loop B re-point queue item 3
(standing accumulation on gear-ready seeds, the 99107 pattern).
Committed BEFORE any judged sim. DIAG ONLY, zero src/js — a
recorder/instrument, no game change. Gates and prices stay UNTOUCHED.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock" — the standing gate
  IS canon-covered there; no canon invented here.
- `src/js/standing.js` (grounding, verified in code, not assumed):
  `villageStanding()` = war + diplomacy + plenty, where war =
  `waveLedgerPoints(3)+waveLedgerPoints(4)+waveLedgerPoints(5)` × 25,
  diplomacy = seasoned REGIONAL+ links × 34, plenty = qualifying
  feasts (`state.feastLog`, quality >= 1) × 20. `villageStandingTotal()`
  is the GATED number: plenty counts at most 100 toward the T5 bar,
  and while any readiness-5 bar is short the total holds at t5-1
  (199) / t4-1 (99). Thresholds: t4 = 100, t5 = 200.
- Seasoned link (`src/js/hierarchy.js` `_linkSeasoned`): active,
  30+ days old, trust 40+ (conquered links: season only). Regional+
  (`standing.js` `_linkRegionalPlus`): LEAD (Haven-primary link inside
  a `polityOf('haven')` realm), BELONG (Haven-subordinate link inside
  the primary's polity), or LEAGUE (seasoned covenant/trade peer link
  inside its league polity). A seasoned bond with a splinter village
  scores 0.
- Prior evidence read: `evidence/2026-11-03/sim-gearbar-a.md`,
  especially "Next blanks" #2 and the 99107 passage: seed 99107 met
  ALL FOUR readiness-5 bars (armored 4, armed 7, tricks 20,
  veterans 2) on days 76–80 and still did not release, because
  standing was 150, not the 199/200 the door needs. Standing opens
  the door; readiness decides walking through.

## Primary question

On gear-ready days, what is standing, what moved it in the prior
30 days, and what standing income is missing — with counts, not
vibes?

## DIAG-GO bar (binding — judge only against this)

DIAG-GO iff ALL of:
1. The recorder classifies the standing trajectory on ALL 8 seeds
   (per-seed: peak raw standing, peak gated standing, end standing,
   component split at peak, and the trajectory class below).
2. The analyzer names the top missing standing-income source with
   counts on >= 6/8 seeds (missing = the component whose headroom
   to its next increment is largest AND whose near-miss pool —
   unseasoned / non-regional+ links, sub-quality feasts, ledger
   points below cap — is counted, not guessed).
3. Gear-ready days identified on >= 1 seed, OR gear-ready absence
   reported as a finding with that band's gear bars (armored/armed/
   tricks/veterans maxima) stated per seed.
A miss on any clause is NO-GO, never re-scored against a friendlier
metric mid-run. Metric problems go under "metric review" for the
NEXT run.

## Trajectory classes (assigned per seed by the analyzer)

- `bread-capped`: plenty at/near the 100 cap while war+diplomacy
  short of 100 (bread alone cannot buy wave 5 — by design).
- `diplomacy-starved`: diplomacy < 34 at peak (zero counting
  links) while a near-miss link pool exists (active links that are
  unseasoned, under-trust, or non-regional+).
- `war-starved`: war < 50 at peak with no ledger growth in the
  prior 30 days.
- `mixed-shortfall`: no single component dominates the gap.
- `released`: gated standing reached 200 with wave-4 faced
  (wave-5 unlock observed).

## Method

- Policy: `scripts/policies/competent.js` `{competent}` verbatim,
  default env. No policy variants — this is a diag, not a lever.
- Seeds: 99101–99108, the gearbar band re-run on CURRENT master.
  Trajectories WILL drift with base moves since 2026-11-03; cite
  only this run's numbers. Band-level pairing with gearbar, not
  trajectory-identical pairing.
- Horizon: 150 days, death-aware (dead villages stop simulating;
  +10d tail max via the harness's runDays death handling). Pilot
  scale: this diag IS the 8-seed pilot-scale run; no confirm follows
  in this run (per brief).
- Instrument (`scripts/standaccum-instrument-20261104.js`,
  `scripts/standaccum-driver-20261104.js`,
  `scripts/standaccum-analyze-20261104.js`): DAILY snapshots of
  raw standing + gated total + war/diplomacy/plenty split +
  warPts + ledger points per wave (3/4/5) + counting-link count +
  FULL link roll (each active link: far end, kind, primary/
  subordinate, age days, trust, seasoned?, regional+?, and the
  reason it does NOT count, if any) + feast-log count and quality
  split + `waveCombatReadiness(5)` bars + ready days + veteran
  counts + roster size + living count. Standing-gain/loss events
  are derived from consecutive-snapshot transitions (component
  deltas attributed to ledger-point change / link-roll change /
  feast-log change; a link dissolving or un-seasoning is a loss
  event with its prior state recorded). The engine records no
  separate standing-event log — this derivation is stated, not
  hidden.
- Sense-test: standing-related say-lines (standing|link|bond|
  realm|feast|diplomacy filter, capped) sampled for coherence
  against the numbers.
- Scale-wall numbers every run: national / table / wins, wave 4–5
  unlocks and facings, median survival (scaleRank, unlockedWave,
  runDays result, won/over flags).
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate (this
  8-seed run), death-aware horizons, pre-registration (this file),
  metric binding (§14), balanced panel (§15 — no before/after
  comparison exists for a diag, so none is fabricated and none is
  attached; stated, not omitted silently).

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether daily snapshots, the
  transition-derived events, and the trajectory classes held up.
