# journey-scale r57 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261030T0445Z (scheduled 04:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(r56 wrote at start; this run holds the write so a failed run does not
advance the rotation).
**Base:** master@70ae4c83c at worktree creation (sim-removal-a evidence).
**No src/js change planned at pre-register time:** measurement first
(r51–r56 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
the driver reads only engine-exposed state, as before.

## Standing context (read before scoring)
- r56 (base eef5d6fa6): QUAD PARTIAL PARITY — 85001/85003/85004
  byte-identical to r55; 85002 split late (day ~158, pantry −516,
  day-sample shift at d159), attribution UNRESOLVED. Quad: global-final
  2/4, full seat 0/4, lesser waiting 4/4. PELLET driver bug fixed
  (whole-sheet restore); engine chooseAbility push still unguarded,
  documented as a design call, not patched.
- r56 people check: 5/6 fully real, Irving d90 coherent-but-displaced
  (seeded ask_favor want, stage 2, fromSeed, planted d89, NEVER
  surfaces; turn-0 choices betrayal/leave/silence only), Boris d120
  honest-barrier Polish-only mime with a nod loop (5 near-identical
  exchanges, invitation never resolves).
- Base drift r56→r57 in src/js is NOT assumed; measured at closeout
  from the merge range if the quad diverges.

## Leg questions (binding)
1. **QUAD-CURRENT-R57 (descriptive continuity):** same 4 seeds
   (85001–85004), control picker, policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop. Driver = r56 driver, labels/EVIDIR
   only (scripts/journey-scale-r57-20261030.js).
   PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages
   == 0, STOP.
   Verdict rule, decided BEFORE reading results: report census
   scalars per seed vs r56. EXPECTATION (falsifiable): scalars
   IDENTICAL to r56 would mean the r56→r57 range did not move these
   four scale fates; ANY scalar difference triggers r52's
   first-divergence audit (capture diff, first differing line class)
   before any attribution — do NOT call it noise and do NOT
   attribute it to a single landing without that audit.
   Watch especially 85002: does it reproduce r56's fate (alive 8/8,
   day 178, pantry 18,308) or r55's (alive 2/2, day 181, pantry 0)
   or a third fate?
2. **IRVING OPENING-ONLY AUDIT (r55/r56 open item, code read first):**
   read conversation opening choice generation: why does a seeded
   ask_favor want (stage 2, fromSeed) not appear among turn-0
   choices on the 85001 d90 transcript, while a goal-thread opening
   does? Verdict rule, decided BEFORE reading results: if a
   mechanism is found AND a fix is small, proof-backed, and does not
   touch gating thresholds, fix it in the worktree with a
   before/after proof; otherwise document the mechanism as design
   input and fix nothing. No fix is pre-decided.
3. **BORIS NOD-LOOP AUDIT (r55/r56 open item, code read first):**
   read the mime-invitation / nod exchange path: why does the
   invitation repeat without resolving to going or not going?
   Same verdict rule as Q2: small proof-backed fix only, else
   documented design input.
4. **PEOPLE CHECK (sense law — full transcripts read, not counted):**
   all control-quad transcripts (days 90/120 × 4 seeds, as the driver
   produces them), judged on meaning: the NPC wants something,
   options engage or deflect it, endings resolve/plant/owe. No
   fabricated shared history, no filler loops, no static menus.
   Report per transcript, plain words. Watch specifically whether
   r56's Irving displacement and Boris nod-loop classes recur.
5. **TABLE-APPROACH (standing, report-only):** seat/arc/waiting per
   seed from the want files, continuity with r56 Q4. No verdict bar.
6. **BARRIER PIN (standing instrument, re-confirmed):** sayOncePerFight
   calls per seed; the pin overturns ONLY on a logged barrier call,
   and a logged call with a refusal narration is guard-holds, not
   guard-broken (r55 form).

## Instruments (all driver-only, read-only)
- r56 driver verbatim otherwise: census, trust/beat/gov/hunger/table
  watches, barrier instrument, armor dump, open-thread logging,
  fusion/ability census fields.
- NEW analyzer scripts/analyze-journey-scale-r57-20261030.js: r56
  analyzer, labels/EVIDIR only. Deterministic read of evidence
  files; it does not score, it reports.

## Metrics (binding census scalars, r51 list + fusion/ability)
day, alive pop, pantry, scale rank, nationalDay, globalDay,
firstCourt, seat, arc, deaths, covenant trusts (3), maxWave,
pilgrimages, fusionInstalled, abilitiesHeld (distinct list).
A miss is NO-GO, never re-scored mid-run (MEASUREMENT §14).
Metric doubts go under "metric review" in the run note for the
NEXT run.

## Telemetry deviation check (step 14)
Baseline: goal hidden_files/telemetry-baselines/scale.json.
Current glob: evidence/2026-10-30/journey-scale-r57/journey-scale-r57-trust-*.json.
Metrics: markerCounts.firstCourt, markerCounts.watchers, tableTele,
fightsTotal, fightsByWave.4, maxGameDay.
r42–r56 note: these trust JSONs do not carry those fields, so LOUD
"disappeared" lines are a known vacuous shape mismatch, not a real
deviation — verify the shape before calling any LOUD line real.
Baseline NOT rolled on a shape artifact.
