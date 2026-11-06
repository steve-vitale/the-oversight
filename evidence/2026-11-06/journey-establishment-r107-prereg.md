# Journey leg ESTABLISHMENT — r107 pre-registration (2026-11-06, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105/r106 precedent). Death-aware: stop after 10 consecutive
all-dead daily checks; never tick a dead village to fill the leg.

## Leg question (fresh — named by r106's metric review, not re-proven)
r106 (n=4, seeds 1501–1504) returned HUNT-HURTS: staffing hunts via the
landed default-OFF huntstaff layer fed real meat (17 assignments, 14 kills,
37,379 kcal, first field_dressing fires in-window) but survival fell 2/4
and pantry collapsed on 2/4 — AND the mechanism section showed the verdict
cannot separate lever from luck: the FIRST hunt resolve draws Math.random()
and re-rolls the village's whole trajectory (forage yields, fights,
contests, lessons all re-roll from that day). 2 of 3 firing seeds landed
worse; the panel cannot say whether the harm is the lever or the re-roll.
r106's metric review named the discriminating test: **a bigger matched
panel (8+ seeds) to average out re-roll luck**. This run is that test, at
the MEASUREMENT §9 Stage-1 pilot size (8 seeds — "the old 4-seed pilot was
sized for expensive sims that no longer exist"). Same lever, same window,
same competent policy, 8 seeds: 1501–1504 (matched, deliberate reuse) +
1601–1604 (fresh, see freshness check).

Why this is not a re-proof of a proven constraint (Steve 2026-11-01 rebuke;
2026-11-04 standing rule): the b-series proved the layer at 180-day scale;
r106 measured it in the establishment window on an under-powered panel and
returned a CONFOUNDED verdict (HUNT-HURTS with an explicit re-roll
confound). r107 decides whether that verdict replicates at pilot size —
the decision is whether the layer stays default-OFF, gets turned ON, or
gets killed/parked. No src/js change: the arm is the policy-side wrapper
only (HUNTSTAFF=1), exactly as b4 landed it. The separate-RNG-stream
discriminator (r106 metric review option b) is a src/js change and a
Steve-call; it is NOT built here — if the 8-seed panel still cannot
separate lever from luck, the next step is that call, not a bigger panel.

## The arm (substrate, built and committed BEFORE any scored seed)
1. Driver `scripts/journey-establishment-r107-20261106.js` — r106 driver
   clone (same competent policy base, same 42-iteration horizon, same
   people check, same census, same telemetry dump, same holdings census,
   same five duty-use wraps). The ONLY driver changes: run tag / seed file
   names / EVID default (evidence/2026-11-06), the policy line (unchanged
   shape), arm-only capture, and the two r106 metric-review fixes:
   - Policy is ALWAYS `withHuntStaff(competent, 'competent-hunt')` —
     the wrapper is constructed in both legs; `HUNTSTAFF` (env) decides
     whether the layer fires. Gate-off (unset) must reproduce the control
     exactly — that is M0, the b4 det-gate pattern on this policy/window.
   - `ctx` capture into each seed JSON: `huntStaff` = { assignments,
     assignLog, refusalLog, woundLog } and `huntEligEnd` (end snapshot),
     as r106.
   - FIX 1 (r106 metric review): the driver writes `guardrails` +
     `c3` summary keys NATIVELY in each seed JSON — the same derivation
     r106 verified post-hoc (guardrails.deaths = len(deaths),
     guardrails.popAlive = aliveEnd, guardrails.pantryKcal =
     pantryKcalEnd; c3.starvationDeaths = deaths whose cause matches
     'starvat'|'hunger'|'thirst'|'dehydrat'), so step 14 works without
     post-processing. The derivation is asserted equal to the post-hoc
     values by proof P3 on the pilot seed.
   - FIX 2 (r106 metric review): per-dawn ever-substrate capture
     `huntEligEver` — names of villagers EVER hunter-substrate while
     alive, via `isHunterSubstrate` (pure read: getPerson + occupation
     word match, no RNG, no Game writes), accumulated once per dawn into
     driver-local state. The end snapshot masks dead hunters
     (isHunterSubstrate returns false for the dead); the ever-capture
     plus the analyzer's assignLog/woundLog name-join keeps Ethan/Pavel-
     style hunters visible. Read-only; cannot change trajectory.
2. Analyzer `scripts/analyze-journey-establishment-r107-20261106.py` —
   r106 analyzer clone, re-pointed at r107 arm files + the r107 control
   dir, SEEDS = 1501–1504 + 1601–1604, the M1 verdict ladder below
   (8-seed thresholds; HUNT-MOVED-ONE-SEED pre-registered; new
   HUNT-MIXED label for split panels), the ever-substrate join, and
   M3/M4 bars at 6/8.
3. Proof test `scripts/test-journey-establishment-r107-huntwire.js`:
   r106 huntwire proof (P1 fixture + P2 harness det-gate) carried over
   with run-tag updates, PLUS P3: the r107 driver on a short harness
   run (seed 1501, 5 days, gate-off) writes `guardrails`/`c3` keys
   equal to the r106 post-hoc derivation from the same JSON, and
   `huntEligEver` is present and well-formed (a list; empty is honest
   on a 5-day gate-off run with no lean day — the field's presence and
   shape are what P3 pins, not a count).

## Seed-band freshness check (recorded; skill local_seed_band_freshness)
Searched `evidence/*/sim-*-prereg.md` and
`evidence/*/journey-*-prereg.md` for the candidate bands (2026-11-06):
- 1501–1504: NOT fresh and NOT claimed fresh — deliberate matched reuse
  (r102/r103/r104/r105/r106). COLLISION NOTE (found by this run's
  full-scope check, missed by r102–r106): seeds 15001–15004 fall inside
  the range 15000–15059 named as a JUDGED SEARCH LEG in
  evidence/2026-10-31/sim-corpsehome-b-prereg.md (which explicitly notes
  "15003 and 15009 already fall in 15000–15059"). r102–r106 grepped for
  the string "1501", which cannot match "15000–15059", so the range was
  never seen. The reuse is still the design (identical-seed matched
  panel; arm-vs-control is within-seed, so the verdicts' internal
  validity is unaffected), but the band is NOT fresh. Recorded here so
  the next worker does not repeat the miss; no correction commit is
  owed to r102–r106 (their verdicts stand on within-seed comparison),
  but their preregs' freshness claims are superseded by this note.
- 1505–1508: REJECTED — inside corpsehome's named 15000–15059 range.
  Collision recorded; not used.
- 1601–1604: FRESH. The prereg-scoped search for
  "1601|1602|1603|1604|16000" returned only substring/line-number hits:
  41601–41604 (journey-social-life-r132 prereg — different seeds),
  game.js ~16043 (sim-caughtlift-b prereg — a line number),
  convo-wants.js:1603 (journey-landing-r107 prereg — a line number).
  No prereg names seeds 1601–1604; no forbidden/contaminated band list
  names them. (A full-tree grep for the literal range string was killed
  mid-crawl by filesystem slowness after the prereg-scoped search
  completed; scope recorded honestly — preregs + named lists is the
  skill's scope.)

## Method
- Seeds: **1501, 1502, 1503, 1504, 1601, 1602, 1603, 1604.**
- Policy: control = `competent` (r105 driver, unmodified, re-run on the
  current base as the same-base control — r105's standing M0 rule);
  arm = `competent-hunt` (wrapped, HUNTSTAFF=1).
- Control dir: goal hidden_files `evidence-2026-11-06-control-r107/`
  (EVID override; the r105 driver writes r105-named files there so the
  committed r105/r106 evidence is never overwritten).
- Pilot: seed 1501 runs first, three legs — control, gate-off (r107
  driver, HUNTSTAFF unset), arm (HUNTSTAFF=1). The pilot must show M0
  (gate-off reproduces control exactly) AND the arm's capture fields
  populated (assign/refusal/wound logs present and well-formed; the
  assign log may be empty if no lean day opens — an empty assign log
  with zero lean days is a finding, not a broken instrument, but the
  eligibility snapshot + ever-capture must explain which gate held).
  If M0 fails, fix the instrument before scoring the rest.
- Then seeds 1502–1504 + 1601–1604, control + arm (gate-off check is
  pilot-only; b4's det-gate + the pilot M0 cover wrapper neutrality).
- §14b substrate checklist (before the sweep): contact — the hunt duty
  resolves through villagerHuntResolve (game.js:6905) and r106 proved
  17 assignments / 14 kills in-panel; the b4 panel proved the layer
  staffs on lean days (110 assignments, 0 on full pantries); pool — the
  hunter-substrate pool per seed is measured by the pilot's eligibility
  snapshot + ever-capture (bar is comparative arm-vs-control, not an
  absolute count, so no pool-sized bar can break); verb — assignTask
  ('hunt') exists and the engine's obedience/Haven gates stay the last
  word; horizon — 42d contains lean days on ≥1 seed (r106: 3/4 seeds
  fired; the pilot verifies lean days open in-window on 1501).
- §14c roster rule: villager (non-scholar) combat deaths are a
  co-primary in M3/M4 reporting (deaths list carries who/cause/player).
- §15 panel note: the journey driver IS this leg's balanced-panel
  instrument (identical seeds, matched options, same-base control,
  r71–r106 precedent); the pre-registered ladder below is the judge.
  scripts/balance-panel.js is the shared generic instrument; it does
  not produce the leg's people check, census, or duty-use evidence,
  so the journey driver carries the panel here.

## Binding metrics
- M0 INSTRUMENT-NEUTRALITY (gate, judged BEFORE M1): the r107 driver
  with HUNTSTAFF unset reproduces the same-base control exactly on the
  pilot seed (endDay, aliveEnd, pantryKcalEnd + lesson sets identical
  modulo the r104 wall-clock-id correction). A divergence stops the run
  for investigation — the wrapper must not change gameplay when off.
  The control-vs-r105-committed comparison is printed for the record
  only (master moved since r105/r106 — divergences there are base-move
  accounting, not instrument failure). For seeds 1601–1604 there is no
  committed panel; the control is the only reference.
- M1 HUNT-STAFFING (the leg question): per seed, arm vs control —
  hunt assignments (count + named hunters + days), huntLog calls /
  kills / kcal, field_dressing fires (hunt kills by a holder), pantry
  trajectory + pantryKcalEnd, survival (endDay/aliveEnd). Per-seed
  movement: pantryUp = pantry_arm > pantry_ctl; survUp = alive_arm >
  alive_ctl OR (not over_arm AND over_ctl); survDown = alive_arm <
  alive_ctl OR (over_arm AND not over_ctl). Verdict ladder, fixed now,
  evaluated in this order (guardrail first):
  1. HUNT-HURTS if any hunter dies of a hunting wound in-panel, OR
     survival is worse on ≥4/8 seeds (survDown ≥ 4).
  2. HUNT-CHANGES-FUNNEL if survival is up on ≥4/8 seeds (survUp ≥ 4)
     AND field_dressing fires ≥1 time in-panel. (Survival moved on half
     the panel — the funnel changed, not just the pantry.)
  3. HUNT-FEEDS-ONLY if pantryUp ≥ 4 with survival flat (survDown = 0,
     survUp < 4) and field_dressing firing ≥1. (Pantry moved, survival
     did not reach the funnel bar — the lever feeds but does not carry.)
  4. HUNT-MOVED-ONE-SEED if exactly 1 seed moves on pantry or survival
     (pantryUp + survUp + survDown counts distinct seeds = 1) and
     field_dressing fires ≥1. (Pre-registered here per r106's metric
     review; direction-neutral — one seed better or worse.)
  5. HUNT-NO-CHANGE if no seed moves on pantry or survival and
     field_dressing fires 0 — with the eligibility snapshot + ever-
     capture naming which gate held (substrate / trust / HP / lean-day
     / Haven).
  6. HUNT-MIXED otherwise (split panel, e.g. 2 up + 2 down) — a new
     label, pre-registered here, not invented mid-run.
  Any verdict is reported with the per-seed table, never re-scored.
  The lever's fate follows the verdict: CHANGES-FUNNEL or FEEDS-ONLY
  → candidate to turn ON by default (Steve-call, not this run);
  HURTS → park/kill per §14a taxonomy (mechanism section decides
  CONCEPT-DEAD vs re-roll-confound); MIXED / MOVED-ONE-SEED /
  NO-CHANGE → the panel cannot separate lever from luck; the next
  step is the separate-RNG-stream Steve-call, not a bigger panel.
- M2 CARE-VISIBILITY (descriptive, r105/r106 continuity): tends,
  healer rounds, treat ticks, with actors; triage reach-2 uses.
- M3 SURVIVAL-42: GO if ≥6/8 arm seeds alive at 42 (no scatter);
  reported alongside control per seed + villager combat deaths.
- M4 PANTRY-GUARDRAIL: GO if starvation/thirst/dehydration deaths are
  zero on ≥6/8 arm seeds. Keywords: 'starvat', 'hunger', 'thirst',
  'dehydrat' (r105 correction).
- M5 PEOPLE: PASS if the 2 held convos per seed, read in full, are
  coherent (NPC wants something, options engage/deflect, endings
  resolve/plant/owe; no fabricated shared history, no filler loops).
  Driver hygiene (r105, carried): the people-check driver picks
  goon-first and may accept betrayal verdicts while sampling; held-convo
  drivers should avoid story verdicts — noted, not fixed in this run
  (driver parity with r106 is what M0 needs).

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
  eligibility snapshot is end-of-run too — the EVER-capture (new this
  run) covers mid-window substrate-ness, but a hunter eligible
  mid-window and dead by the end is still visible only via the
  assign/wound logs + ever-capture, not via the end snapshot.
- Scholar-day labels skip/repeat (r101 metric review); census
  `equipped` first-row duplication (r99); player codex start snapshot
  missing (r103); armor lessons are not skill_lesson rows (r105).
- `ability_used` double-emission (pre-existing, r104): composite
  `activateAbility('purify.cleanse')` emits TWO rows; analyzer counts
  first evidence only.
- The diplomat "incident" half remains unimplemented (r105); out of
  scope for this run.
- Convergence (§12): the huntstaff lever in the establishment window
  is at round 2 of 3 without passing the pilot gate (r106: HUNT-HURTS,
  confounded). If r107 also fails to pass the gate, the lever is
  parked per the §12 budget — the next step is the separate-RNG-stream
  Steve-call, not a round 3 panel.

## Canon
- docs/CANON.md (human skills ≠ alien abilities): hunt staffing assigns
  LABOR via hunter-substrate occupations — no System slot, no magic.
  The layer's own header states this; the run does not re-decide it.
- docs/BEAR.md: the bear, the fight, butchering, fat, knowledge gating
  — the duty path's flat cleaning is the known b5 deviation, above.
- docs/PRESERVATION.md: the food ladder — hunt kcal enters the pantry
  as meat; rack/preservation behavior is measured by the r105 cook wrap,
  unchanged here.
- docs/CONTESTS.md: contests unlock ~day 14–21, 2/week shared budget,
  played not RNG — the establishment window is where the show arrives;
  contest counts are reported per seed (r101 rule: exclude fired within
  2 days of run end from the stuck count).
- docs/MONSTER-WAVES.md: wave 1 = Calibration Fauna (day 1+); wave 2
  unlocks day 8 + 5 wave-1 ledger points. The establishment window is
  wave 1 into wave 2.

## Metric review (for the NEXT run, not this one)
- To be written after scoring.
