# journey-scale r55 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261029T2045Z (scheduled 20:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 done at run start.
**Base:** master@d6723d3f3 at worktree creation.
**No src/js change planned at pre-register time:** measurement first
(r51–r54 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**TACKLE ALL context:** the seven villager-rationality items are pursued
elsewhere (fixall arms live); this run does not claim them.
**Perception law (2026-10-28):** no list-fed decision work in this run;
the driver reads only engine-exposed state, as before.

## Standing context (read before scoring)
- r54 (base 30aeceb36): QUAD parity vs r52/r53 (raid-naming lines the
  only capture delta); WANT-OPEN-THREAD OPENING-ONLY (displaced want
  never surfaces later in the same talk); SEED-CARRY-PROBE
  PHANTOM-RULE CONFIRMED + NOT-RE-PICKED (surfaced wants carry with
  tightening deadlines; unestablished wants evaporate at close).
  Quad counts: national 1/4 (85004 at day 179, the wire), global 0/4,
  full seat 0/4, lesser seat waiting on 3/4 (85002 no seat).
  Pellet confound, panel-wide: ALL four seeds took the fusion pellet
  under the control policy, and the table prices the run out of feast
  deeds ("NO HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE FIRE
  SHOULD BE").
- Base drift r54→r55 in src/js (measured, not assumed): 11 files,
  +383/−68. Named landings in range: gaps2-knower (per-knower
  villageLore ledger + peer knowledge gate — peer proposals now gated
  on actually knowing the village, one of the standing open calls),
  Lane B social r67 (party-name/role picks offered by menu and spoken
  into transcript), sim-raidguard-b (unreachable raid-aftermath guard
  removed, neutrality 16/16), sim-shoutrec-a, sim-joinendlines-a,
  plus hierarchy.js (+198/−large) and party-formal.js rework inside
  those landings, and version bumps. No scale-threshold change is
  claimed by any of those commit messages; whether the knower gate
  moves scale outcomes (fewer/unknown peer proposals, courtship,
  national timing) is exactly what Q1 measures — it is NOT assumed.

## Leg questions (binding)
1. **QUAD-CURRENT-R55 (descriptive continuity):** the same 4 seeds
   (85001–85004), control picker, policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop. Driver = r54 driver, labels/EVIDIR
   only, PLUS the census additions below (fusion/ability fields) and
   the EVIDIR env override (r54 probe-overwrite lesson: a probe or
   variant arm NEVER shares the quad EVIDIR).
   PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages
   == 0, STOP.
   Verdict rule, decided BEFORE reading results: report census
   scalars (day, over, pop, pantry, rank, nationalDay, globalDay,
   firstCourt, seat, arc, deaths, covenant trusts, maxWave,
   pilgrimages) per seed vs r54. EXPECTATION (falsifiable): scalars
   IDENTICAL to r54 would mean the knower gate + hierarchy/party
   rework did not move these four scale fates; ANY scalar difference
   triggers r52's first-divergence audit (capture diff, first
   differing line class) before any attribution — do NOT call it
   noise and do NOT attribute it to the knower gate without that
   audit.
2. **PELLET-DECLINE-R55 (policy arm, NOT a game change):** same 4
   seeds, same policy, same DAYCAP, PLUS driver env PELLET_DECLINE=1:
   the driver wrapper hides ONLY the fusion_reactor offer from
   competent's take step each day (other ability offers, if any,
   pass through untouched) and restores the pending offer afterwards
   — the player passes on the pellet, day after day, exactly as a
   player who refuses the surgery would. Separate EVIDIR
   (journey-scale-r55-nopellet) via the EVIDIR env override.
   KNOWN ARM PROPERTY, stated before running: while the fusion offer
   stays pending, the engine's offer pattern (no offer while one is
   pending) means later ability offers are blocked in this arm —
   that is part of the arm, not a bug, and is reported with the
   arm's ability counts, not hidden.
   Verdict rule, decided BEFORE reading results: compare per-seed
   scalars + feast-deed/table lines + hunger-window rows vs the Q1
   control on the SAME base. PELLET-RESTORES-HUNGER if the decline
   arm shows hungryDays > 0 windows AND feast-deed lines (or a
   different table price) that the control lacks on the same seed.
   PELLET-IRRELEVANT if scalars and table voicing match the control
   on all 4 seeds. MIXED if only some seeds move — report per seed,
   no panel-wide claim. If the wrapper fails to keep the reactor
   uninstalled on any seed (fusionInstalled true), that seed is an
   INSTRUMENT FAILURE, not a verdict vote.
3. **PEOPLE CHECK (sense law — full transcripts read, not counted):**
   all control-quad transcripts (days 90/120 × 4 seeds, as the driver
   produces them), judged on meaning: the NPC wants something,
   options engage or deflect it, endings resolve/plant/owe. No
   fabricated shared history, no filler loops, no static menus.
   Report per transcript, plain words.
4. **TABLE-APPROACH (standing, report-only):** seat/arc/waiting per
   seed from the want files, continuity with r54 Q5. No verdict bar.
5. **BARRIER PIN (standing instrument, re-confirmed):** sayOncePerFight
   calls per seed; the pin overturns ONLY on a logged barrier call.

## Instruments (all driver-only, read-only except the Q2 wrapper)
- r54 driver verbatim otherwise: census, trust/beat/gov/hunger/table
  watches, barrier instrument, armor dump, open-thread logging.
- NEW census fields (read-only reads at seed end): fusionInstalled
  (scholar.fusionReactor.installed), fusionHolder (state
  .fusionReactorHolder), abilities held (scholar abilities ids),
  choseAbility count (ctx), hasFusionPellet (pack check if exposed).
- NEW env: EVIDIR override; PELLET_DECLINE=1 (Q2 wrapper only).
- NEW analyzer scripts/analyze-journey-scale-r55-20261029.js: r54
  analyzer, labels/EVIDIR only, PLUS the fusion/ability columns in
  the census table. Deterministic read of evidence files only.
- Comparison of Q1 vs Q2 scalars is done by a small deterministic
  reader over the two trust-JSON sets (no engine load, no RNG).

## Metric review (pre-registered, not mid-run)
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the new fusion/ability columns (reads, not scores).
- r54's QUAD parity claim, OPENING-ONLY, PHANTOM-RULE CONFIRMED and
  NOT-RE-PICKED stand unless this run's fixed rules overturn them
  with evidence (the barrier pin overturns only on a logged barrier
  call; Q1 overturns a parity expectation only via a first-divergence
  audit, not by eyeballing a scalar).
- No metric will be re-scored mid-run. If the pellet-decline wrapper
  proves inert or leaky, that goes here as an instrument finding,
  not a verdict change.
