# sim-huntstaff-b2 — hunt-duty staffing lever, corrected re-run (ARM sim-huntstaff-b2)

Lever arm, loop B food-economy axis, run fleshout-b-20261017T2130Z.
The §14 escape-hatch re-run of sim-huntstaff-b (killed at pilot
2026-10-17 on a METRIC-BROKEN median gate — evidence/2026-10-17/
sim-huntstaff-b.md). The original NO-GO stands; this run re-tests the
mechanism with a corrected pre-registration, per Steve's approved escape
hatch ("metric-broken kills re-run as new runs; the original NO-GO stands").

The b pilot's mechanism PROVED ITSELF: 48 assignments fired (bar ≥8),
5/8 seeds engaged (bar ≥4), 41 kills, 177,065 kcal of real meat, zero
engine refusals escaping the gate pre-filter, zero hunt-attributable
deaths, starvation deaths 3→2, wall metrics unmoved. The only gate miss
was the ±10d n=16 median-survival sanity gate (150.5d vs 163d control,
miss −2.5d) on paired deltas spanning −69..+81d (mean −0.25d) — the
tolerance sat an order of magnitude below the substrate's combat-noise
band and false-fired on noise. The layer was deleted zero-trace; this
run REBUILDS it byte-for-spec-byte from sim-huntstaff-b.md §"The layer
(built per the corrected spec)" — identical layer spec, corrected
pre-registration, fresh seeds.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §§9–12, 14)

- **PRIMARY (engagement):** hunt-duty assignments fired by the layer:
  `armed >= 8 across the 16 armed runs AND >= 4 of 8 seeds engage
  (>=1 assignment)`, vs `control == 0` (expected: no policy assigns hunt).
  GO requires BOTH the count bar and the seed bar — the mechanism must
  engage broadly, not on one lucky seed. (Carried over unchanged from b.)
- **GUARDRAILS (every-gate; a miss is NO-GO, never re-scored):**
  - starvation deaths armed <= control + 2 (unchanged)
  - villager deaths armed <= control (unchanged)
  - no new death mode (armed death-cause set ⊆ control death-cause set;
    judged at the MODE level, as in b)
  - det-gate: gate-OFF (HUNTSTAFF unset) trajectories byte-identical to
    pristine (no wrapper) — neutrality pinned before the sweep (unchanged)
  - national armed >= control - 2 (unchanged)
  - **survival (CORRECTED): |mean paired survival delta| <= 20d** —
    paired per seed×policy: armed−control gameDays. The b pilot measured
    paired deltas −69..+81d with mean −0.25d on pure combat-noise; a
    ±20d band on the MEAN is ~4x the observed noise floor of the median
    statistic and cannot false-fire on the band that killed b. Judged on
    the mean, not the median — the median gate was the metric-broken part.
- **HORIZON + why:** 180d death-aware (engine tail, no fixed 200d) — the
  hunt-duty blank is a mid-run staffing question and the wall metrics
  (national/table/Arc/wave reach, survival distribution) need full-run
  reachability; dead villages stop simulating (+10d tail max).
- **SEEDS:** 7811-7818 — fresh; verified zero overlap with every used
  list (grep of evidence/2026-10-10..17 for 781[1-8]: only coincidence
  matches — ms timings, pantryKcal values — plus the suggestion text in
  sim-huntstaff-b.md itself; no seed-use anywhere).
- **POLICIES:** leadfeast, belongfeast × {armed (HUNTSTAFF=1), control}
  = 32 runs. Own in-sweep control, identical seeds. FEASTSCALE_R13=1 and
  SEATDRIVE=0 set EXPLICITLY (pre-seat r13 substrate, matches the
  huntduty/huntroster/huntstaff audits).
- **HUNTER-FATE instrument (findings #508/#509):** every death records
  the dead villager's occupation + hunter-substrate flag (corrected word
  list); armed runs record the full hunt-duty assignment log; compare
  hunter-occupation death rates armed vs control (exposure vs
  layer-pulling-defenders) and classify every assigned hunter's death
  (hunt-attributable vs ordinary combat). The instrument answers whether
  hunters die faster and why — it is NOT a gate, it is evidence.
- **EVERY-GATE RULE:** all gates must pass for GO. A miss is NO-GO —
  killed arms leave no trace (layer deleted, zero-trace per kill
  protocol; evidence + instruments kept). Kill fast at pilot if the
  mechanism cannot engage.
- **§15 balanced panel:** per-seed panel-schema JSONs (schema
  'huntstaff-wall/2') for the wall metrics alongside the sweep output;
  run scripts/balance-panel.js compare (via scripts/build-huntstaff-
  panels-b2.js) --before <control> --after <armed> --out <prefix> and
  attach the compare .md. The panel is the instrument, the pre-registered
  threshold is the judge.
- **Sense-testing (law):** read at least one transcript day — does the
  village's hunting talk have an actor? Is the fiction coherent?
- **COMPLETION GATES:** 32/32 runs complete, schema-clean output, 0
  instrument errors, det-gate green, proof test RED/GREEN/det-gate green.

## Canon read

- docs/CANON.md: read (this run). Hunting is human-skill lane — the layer
  assigns LABOR, never an alien ability; never invented from scratch.
- docs/PRESERVATION.md: read. Hunt returns 'Game meat' (cleaned, ~2d
  shelf, risky) — first rung of the preservation ladder; the layer only
  puts meat in the pipeline, never invents processing.
- docs/TIME-ECONOMY.md: read. assignTask is a 2-tick social move; the
  staffing pass fires in the policy's upkeep+daily hooks.
- docs/BEAR.md: read (b run). The safety argument for gates (b)/(c) —
  only hunter-substrate, HP≥40, trust≥40, one hunter at a time; the
  engine's HP/in-person/obedience gates stay as the last word.
- No canon doc mandates hunter rarity or forbids village-organized hunts
  (huntroster canon read: VISION.md's "12 random people" is the only
  roster canon; the fiction EXPECTS hunters).

## The layer (rebuilt per sim-huntstaff-b.md §"The layer")

- scripts/policies/huntstaff.js — HUNTSTAFF=1 gate (default OFF; unset =
  pure delegation to the base policy). Zero src/js changes.
- Staffing handle (CORRECTED, from huntroster-b named fix spec §3):
  `assignBest(Game,'hunt',['hunting guide','fishing guide','trail crew',
  'rancher','forager','bush pilot','exterminator','soldier'])` — hunter-
  substrate villagers only, best villagerCompetence first.
- Gates:
  (a) lean/starvation day: pantryFreshDays() < 4 (the engine's own
      PRODTHROTTLE threshold) OR scholar kcal < 50% cap OR < 500.
  (b) hunter-substrate: free (roster, alive, unassigned), formerOccupation
      matches the corrected word list, HP≥40, trust≥40.
  (c) one hunter at a time: no existing 'hunt' assignment; once per day
      (ctx-day key).
- Fires in the wrapper's upkeep + daily hooks (once per day) when the
  scholar is at Haven (in-person is the honest line).
- Telemetry: ctx._hsAssignments + ctx._hsAssignLog (hunter-fate instrument
  reads the log) — only written when the layer fires; gate-off: zero
  writes.
- Instrument additions vs b: hunter-fate tags on every death (occ,
  hunterOcc, assignedHunter); sweep fixes the b sweep's missing imports
  (loadGame/setupGame/runDays/quietLog/leadfeast/belongfeast were bare
  globals in sweep-huntstaff-b.js — a real bug, now fixed).

## Results

(TO BE FILLED — pre-registration above binds; results below the line.)

---
