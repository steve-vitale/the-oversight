# journey-scale r58 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261030T1820Z (scheduled 12:45 CDT; lock created 18:20:14Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(r57 discipline: a failed run does not advance the rotation).
**Base:** master@1555c5dfa at worktree creation (deepening r71 merge).
**No src/js change planned at pre-register time:** measurement first
(r51–r57 discipline). A game-code fix is decided ONLY after evidence
confirms a mechanism, and only lands with its own proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
the driver reads only engine-exposed state, as before.

## Standing context (read before scoring)
- r57 (base 70ae4c83c): QUAD FULL PARITY — 85001/85002/85003/85004
  scalar-for-scalar identical to r56; only one capture line differed
  (bedroll→you narration honesty, awake night). Quad: global-final 2/4,
  full seat 0/4, lesser seat waiting 4/4, wave 5 reached 0/4.
- r57 Q2 (Irving): mechanism traced, NO fix. Seeded ask_favor want
  (stage 2, fromSeed, planted d89) never surfaces in the d90 sitting
  because the goal-thread opener wins, the pending betrayal invitation
  speaks as a second beat, and the owns-rule filters the turn-0 menu to
  betrayal accept/decline/leave/silence ONLY. The want stays live
  (stage 2) for a later sitting. Open item carried here: repeat
  displacement across consecutive sittings is UNMEASURED.
- r57 Q3 (Boris): mechanism traced, NO fix. The nonverbal menu has no
  accept/decline move for a mime invitation; nodding repeats the same
  shape until the exchange budget winds down. Texture, not a softlock.
  Not re-tested here unless a Boris transcript recurs (Q4 watch).
- r57 people check: 5/6 fully real (Irving coherent-but-displaced),
  1 honest-barrier with a nod loop (Boris). No fabricated shared
  history, no static menus.

## Leg questions (binding)
1. **QUAD-CURRENT-R58 (descriptive continuity):** same 4 seeds
   (85001–85004), control picker, policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop. Driver = r57 driver, labels/EVIDIR
   only (scripts/journey-scale-r58-20261030.js).
   PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages
   == 0, STOP.
   Verdict rule, decided BEFORE reading results: report census
   scalars per seed vs r57. EXPECTATION (falsifiable): scalars
   IDENTICAL to r57 would mean the r57→r58 range did not move these
   four scale fates; ANY scalar difference triggers r52's
   first-divergence audit (capture diff, first differing line class)
   before any attribution — do NOT call it noise and do NOT
   attribute it to a single landing without that audit.
2. **IRVING REPEAT-DISPLACEMENT (r57 open item, NEW):** seed 85001
   only, control picker, DAYCAP 110, PROBE_VID=gen_oqbl010 (Irving),
   PROBE_SEED=85001, PROBE_DAYS=91,93,97,105 — extra sittings after
   the d90 displaced sitting. The d90 regular sitting reproduces
   r57 exactly (state identical until d90: CONVO_DAYS sittings are
   the only talks, and no probe day precedes d90).
   Verdict rule, decided BEFORE reading results: count probe
   sittings where the seeded ask_favor want surfaces as engageable
   (want id ask_favor at open, or alive:want:ask_favor chosen, or
   the favor committed). If >=1 probe sitting surfaces it,
   displacement is ONE-SITTING-ONLY (design call leans "accept
   displacement as the price of invitation honesty"). If 0 probe
   sittings surface it AND the want is still live (stage < 3, not
   cleared) at the last probe, displacement is STICKY across
   sittings (strengthens the re-surface-fix case; the fix itself
   still needs its own proof design and is NOT landed here unless
   small + proof-backed per the r57 rule). If the want clears or
   dies for a traced reason, report that reason instead of scoring
   sticky. If Irving is dead/unavailable on a probe day, that
   sitting scores UNAVAILABLE, not non-surfacing; the denominator
   adjusts and is reported explicitly.
   Pre-stated caveat: probe sittings themselves may move trust and
   wants, so Q2 scalars are NOT parity-compared; only the
   want-surfacing count is scored.
3. **IRVING SUBJECT-RE-ENTRY (NEW):** seed 85001 only,
   WANT_SUBJECT=1 (subject-first picker), DAYCAP 110, same
   PROBE_VID/PROBE_SEED/PROBE_DAYS as Q2, separate EVIDIR.
   Verdict rule, decided BEFORE reading results: at the first
   post-invitation probe sitting (d91), (a) does turn 0 offer
   dlg:subject, and (b) does the subject menu offer
   alive:want:ask_favor that the picker then takes (or that appears
   among the choices)? If the want engages via the subject menu at
   d91, the re-entry path is REAL and reachable for a
   menu-exploring player (design call: document the path; the gap
   is discoverability, not absence). If dlg:subject is absent at
   turn 0 while the invitation still owns the menu, or
   alive:want:ask_favor is absent from the subject menu, the
   re-entry path does NOT exist in that sitting — report which
   step failed. Prediction to check, not assume: the d90 sitting
   in this arm should reproduce r57's transcript (invitation-owns
   -menu predicts dlg:subject is NOT offered at turn 0); verify
   from the transcript, do not assume it.
   Pre-stated caveat: as in Q2, only the engagement steps are
   scored, not scalars.
4. **PEOPLE CHECK (sense law — full transcripts read, not counted):**
   all control-quad transcripts (days 90/120 × seeds, as produced)
   PLUS all Q2/Q3 probe transcripts, judged on meaning: the NPC
   wants something, options engage or deflect it, endings
   resolve/plant/owe. No fabricated shared history, no filler
   loops, no static menus. Watch specifically whether r57's Irving
   displacement and Boris nod-loop classes recur.
5. **TABLE-APPROACH (standing, report-only):** seat/arc/waiting per
   seed from the want files, continuity with r57. No verdict bar.
6. **BARRIER PIN (standing instrument, re-confirmed):** sayOncePerFight
   calls per seed; the pin overturns ONLY on a logged barrier call,
   and a logged call with a refusal narration is guard-holds, not
   guard-broken (r55 form).

## Instruments (all driver-only, read-only)
- r57 driver verbatim otherwise: census, trust/beat/gov/hunger/table
  watches, barrier instrument, armor dump, open-thread logging,
  fusion/ability census fields.
- NEW analyzer scripts/analyze-journey-scale-r58-20261030.js: r57
  analyzer, labels/EVIDIR only. Deterministic read of evidence
  files only (no engine load, no RNG). Takes the EVIDIR as argv.
- EVIDIRs (kept separate so probe arms cannot overwrite quad files):
  evidence/2026-10-30/journey-scale-r58 (quad),
  evidence/2026-10-30/journey-scale-r58-irving-repeat (Q2),
  evidence/2026-10-30/journey-scale-r58-irving-subject (Q3).
- Q2/Q3 arms differ from the quad ONLY by env flags (SEEDS,
  DAYCAP, PROBE_VID, PROBE_SEED, PROBE_DAYS, WANT_SUBJECT) — no
  driver logic change.

## Census scalars (r51 list, unchanged)
day, over, popAlive/popTotal, pantryKcal, scaleRank, nationalDay,
globalDay, firstCourtDay, tableSeat, arcNow, deaths (deathLog
length), covTrusts, maxWave, pilgrimages, fusionInstalled,
abilitiesHeld (reads, not scores).

## Metric review (filled at closeout)
- (to be filled; no metric re-scored mid-run)
