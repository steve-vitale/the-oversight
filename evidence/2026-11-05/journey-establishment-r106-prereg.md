# Journey leg ESTABLISHMENT — r106 pre-registration (2026-11-05, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105 precedent). Death-aware: stop after 10 consecutive
all-dead daily checks; never tick a dead village to fill the leg.

## Leg question (fresh — named by r105's metric review, not re-proven)
r105 proved the hunt duty is never staffed in-window (villagerHuntResolve
called 0 times on all four seeds; the competent policy assigns water, wood,
garden, deadfall, fish, cook — never 'hunt'), so field_dressing — held by 6
villagers, mechanism proven working (P1: 1.300x) — can never fire. r105's
metric review named the next question: **does staffing hunts change the
establishment funnel (pantry, survival, field_dressing fires)?** This run
answers it with the existing, landed, default-OFF hunt-staffing layer
(`scripts/policies/huntstaff.js`: sim-huntstaff-b4 GO + sim-refusestaff-b
repair, person-level HP gate + 2d wound refusal), wrapped around the same
competent policy, on identical seeds 1501–1504.

Why this is not a re-proof of a proven constraint (Steve 2026-11-01 rebuke;
2026-11-04 standing rule): the b-series proved the layer at 180-day scale
on belongfeast seeds (110 assignments, 187k kcal, feeds lean villages,
does not scale them). It never measured the layer in the ESTABLISHMENT
window (days 14–42), where r105 found hunt calls = 0 and where the funnel
risk lives (seed 1501 lost day 24 on an empty pantry). The lever is
existing; the window and the funnel question are new. No src/js change:
the arm is a policy-side wrapper only (HUNTSTAFF=1), exactly as b4
landed it.

## The arm (substrate, built and committed BEFORE any scored seed)
1. Driver `scripts/journey-establishment-r106-20261105.js` — r105 driver
   clone (same competent policy base, same 42-iteration horizon, same
   people check, same census, same telemetry dump, same holdings census,
   same five duty-use wraps). The ONLY driver changes: run tag / seed file
   names, the policy line, and arm-only capture:
   - Policy is ALWAYS `withHuntStaff(competent, 'competent-hunt')` —
     the wrapper is constructed in both legs; `HUNTSTAFF` (env) decides
     whether the layer fires. Gate-off (unset) must reproduce the control
     exactly — that is M0, the b4 det-gate pattern on this policy/window.
   - `ctx` capture into each seed JSON: `huntStaff` = { assignments,
     assignLog, refusalLog, woundLog } (the layer's own ctx fields) and
     `huntEligEnd` = end-of-run eligibility snapshot per roster villager
     { name, occ, isHunterSubstrate, trust, hp, assignedTask } — read-only
     reads, no RNG, no Game writes. Diagnoses a zero-assignment panel
     (which gate blocked: substrate / trust / HP / lean-day / Haven).
2. Analyzer `scripts/analyze-journey-establishment-r106-20261105.py` —
   r105 analyzer clone, re-pointed at r106 arm files + the r106 control
   dir, plus the arm-vs-control hunt/funnel comparison (M1) and the
   'dehydrat' M4 keyword (r105 correction).
3. Proof test `scripts/test-journey-establishment-r106-huntwire.js`:
   - P1 fixture: withHuntStaff wraps a fake base policy — gate-off
     delegates upkeep/daily exactly (spies called, ctx untouched, no
     assignTask attempt); gate-on + lean day + hunter-substrate villager
     staffs 'hunt' once via assignTask (in-person); non-substrate /
     low-trust / wounded / not-at-Haven / non-lean each refuse honestly.
   - P2 harness (short): seed 1501, 5 days, wrapped-competent gate-off
     reproduces unwrapped-competent endDay/pantryKcalEnd/aliveEnd
     exactly (mini M0 on the real policy).
   - The panel M0 (below) is the full det-gate; the b4 proof
     (test-huntstaff-b4.js: 17 pins + 60d det-gate 4/4 + smoke) already
     covers the layer itself and is re-run, not rewritten.

## Seed-band freshness check (recorded; skill local_seed_band_freshness)
Searched `evidence/*/sim-*-prereg.md` and
`evidence/*/journey-establishment-*-prereg.md` for "1501" (2026-11-05):
exact-band hits ONLY in journey-establishment r102/r103/r104/r105
preregs. The sim-* hits are substrings of 5-digit bands (51301, 51501,
61501, 91501, 99209–99216) — not this band. No forbidden/contaminated
band list names 1501–1504. **The band is NOT fresh and is NOT claimed
fresh: seeds 1501–1504 are reused DELIBERATELY as the matched
control/arm panel** (MEASUREMENT §1: before/after on identical seeds;
r105's metric review instructs "on identical seeds 1501–1504"). Reuse
is the design, not an oversight.

## Method
- Seeds: **1501, 1502, 1503, 1504 — IDENTICAL to r102/r103/r104/r105.**
- Policy: control = `competent` (r105 driver, unmodified, re-run on the
  current base as the same-base control — r105's standing M0 rule);
  arm = `competent-hunt` (wrapped, HUNTSTAFF=1).
- Control dir: goal hidden_files `evidence-2026-11-05-control-r106/`
  (EVID override; the r105 driver writes r105-named files there so the
  committed r105 evidence is never overwritten).
- Pilot: seed 1501 runs first, three legs — control, gate-off (r106
  driver, HUNTSTAFF unset), arm (HUNTSTAFF=1). The pilot must show M0
  (gate-off reproduces control exactly) AND the arm's capture fields
  populated (assign/refusal/wound logs present and well-formed; the
  assign log may be empty if no lean day opens — an empty assign log
  with zero lean days is a finding, not a broken instrument, but the
  eligibility snapshot must explain which gate held). If M0 fails, fix
  the instrument before scoring the rest.
- Then seeds 1502–1504, control + arm (gate-off check is pilot-only;
  b4's det-gate + the pilot M0 cover wrapper neutrality).
- §14b substrate checklist (before the sweep): contact — the hunt duty
  resolves through villagerHuntResolve (game.js:6905) and r105 P1 proved
  the 0.78 frac on a real kill; the b4 panel proved the layer staffs on
  lean days (110 assignments, 0 on full pantries); pool — the
  hunter-substrate pool per seed is measured by the pilot's eligibility
  snapshot (bar is comparative arm-vs-control, not an absolute count, so
  no pool-sized bar can break); verb — assignTask('hunt') exists and the
  engine's obedience/Haven gates stay the last word; horizon — 42d
  contains lean days on ≥1 seed (1501 lost d24 on an empty pantry in
  r105; the pilot verifies lean days open in-window).
- §14c roster rule: villager (non-scholar) combat deaths are a
  co-primary in M3/M4 reporting (deaths list carries who/cause/player).

## Binding metrics
- M0 INSTRUMENT-NEUTRALITY (gate, judged BEFORE M1): the r106 driver
  with HUNTSTAFF unset reproduces the same-base control exactly on the
  pilot seed (endDay, aliveEnd, pantryKcalEnd + lesson sets identical
  modulo the r104 wall-clock-id correction). A divergence stops the run
  for investigation — the wrapper must not change gameplay when off.
  The control-vs-r105-committed comparison is printed for the record
  only (master moved since r105: r108 landing, r143 Ruth help-branch
  fix, r102 scale — divergences there are base-move accounting, not
  instrument failure).
- M1 HUNT-STAFFING (the leg question): per seed, arm vs control —
  hunt assignments (count + named hunters + days), huntLog calls /
  kills / kcal, field_dressing fires (hunt kills by a holder), pantry
  trajectory + pantryKcalEnd, survival (endDay/aliveEnd). Verdicts,
  fixed now:
  - HUNT-CHANGES-FUNNEL if arm beats control on pantryKcalEnd or
    survival on ≥2/4 seeds AND field_dressing fires ≥1 time in-panel.
  - HUNT-FEEDS-ONLY if pantryKcalEnd up on ≥2/4 seeds with survival
    flat and field_dressing firing ≥1.
  - HUNT-NO-CHANGE if no seed moves on pantry or survival and
    field_dressing fires 0 — with the eligibility snapshot naming which
    gate held (substrate / trust / HP / lean-day / Haven).
  - HUNT-HURTS if survival is worse on ≥2/4 seeds (villager combat
    deaths up — §14c co-primary) or any hunter dies of a hunting wound
    in-panel. Any verdict is reported with the per-seed table, never
    re-scored.
- M2 CARE-VISIBILITY (descriptive, r105 continuity): tends, healer
  rounds, treat ticks, with actors; triage reach-2 uses.
- M3 SURVIVAL-42: GO if ≥3/4 arm seeds alive at 42 (no scatter);
  reported alongside control per seed + villager combat deaths.
- M4 PANTRY-GUARDRAIL: GO if starvation/thirst/dehydration deaths are
  zero on ≥3/4 arm seeds. Keywords: 'starvat', 'hunger', 'thirst',
  'dehydrat' (r105 correction — 'thirst' already covers 'thirsty').
- M5 PEOPLE: PASS if the 2 held convos per seed, read in full, are
  coherent (NPC wants something, options engage/deflect, endings
  resolve/plant/owe; no fabricated shared history, no filler loops).
  Driver hygiene (r105, carried): the people-check driver picks
  goon-first and may accept betrayal verdicts while sampling; held-convo
  drivers should avoid story verdicts — noted, not fixed in this run
  (driver parity with r105 is what M0 needs).

## Known limits (stated before scoring, not discovered after)
- The layer staffs at most ONE hunter/day, lean days only, hunter-
  substrate only, trust≥40, person-HP≥40, in-person at Haven. A
  zero-assignment panel is a possible honest outcome with a named gate.
- The hunt duty's flat cleaning bypasses the BEAR.md portion/fat law
  (b5 finding: bear 18,000 = 30,000 × 0.6, fat slabs never surface
  distinctly). Not re-litigated here; kcal is compared arm-vs-control
  on the same duty path, so the comparison is fair.
- The layer picks the best-competence eligible hunter repeatedly — a
  "hunt champion" emerges (b4). Rotation is out of scope for this run.
- The census is an end snapshot (r105 limit, unchanged); the
  eligibility snapshot is end-of-run too — a hunter eligible mid-window
  and dead by the end is visible only via the assign/wound logs.
- Scholar-day labels skip/repeat (r101 metric review); census
  `equipped` first-row duplication (r99); player codex start snapshot
  missing (r103); armor lessons are not skill_lesson rows (r105).
- `ability_used` double-emission (pre-existing, r104): composite
  `activateAbility('purify.cleanse')` emits TWO rows; analyzer counts
  first evidence only.
- The diplomat "incident" half remains unimplemented (r105); out of
  scope for this run.

## Canon
- docs/CANON.md (human skills ≠ alien abilities): hunt staffing assigns
  LABOR via hunter-substrate occupations — no System slot, no magic.
  The layer's own header states this; the run does not re-decide it.
- docs/BEAR.md: the bear, the fight, butchering, fat, knowledge gating
  — the duty path's flat cleaning is the known b5 deviation, above.
- docs/PRESERVATION.md: the food ladder — hunt kcal enters the pantry
  as meat; rack/preservation behavior is measured by the r105 cook wrap,
  unchanged here.

## Metric review (for the NEXT run, not this one)
- To be written after scoring.
