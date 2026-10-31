# journey-scale r60 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261031T0243Z (scheduled 21:45 CDT 2026-10-30; lock created 02:43:32Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(r57/r58/r59 discipline: a failed run does not advance the rotation).
Note on the repeated leg: r57, r58 and r59 all ran scale, and the
rotation file still reads 3 at this run's start. Staying on scale is
queue-correct, not a silent repeat: r59 left two scale questions
explicitly open — (a) a wider-band nofetch re-test plus a mechanism
trace for the day-1 gear fetch, and (b) the w5-field vs maxWave
definition. Both are answered here.
**Base:** master@7a2974684 at worktree creation.
**No src/js change planned at pre-register time, and no src/js landing
is planned:** Q2's nofetch patch is temporary worktree-only,
reverted before any commit (see Q2). Measurement first (r51–r59
discipline).
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
the driver reads only engine-exposed state, as before.

## Standing context (read before scoring)
- r59 (base 359a384cc): QUAD-CURRENT full parity vs r58 — 4/4 seeds
  scalar-identical (85001 d135 died 0/0 GLOBAL nat77 glob92 court76
  lesser arc4 deaths44 cov34/40/32 pilg4 fusion T abil iron_stomach;
  85002 d132 died 0/0 REGIONAL lesser arc4 deaths62 cov 2 pilg54
  fusion T; 85003 d134 died 1/1 regional lesser arc4 deaths44
  cov30/34/34 pilg6 fusion F; 85004 d178 died 0/0 regional nat94
  glob117 court93 seat NONE arc3 deaths47 cov58/31/22 pilg5
  fusion F). Descriptive quad: alive 0/4, global-final 1/4, lesser
  waiting 3/4, full seat 0/4, wave 5 reached 0/4 (maxWave 4 on all four).
- r59 Q2 (nofetch, same 4 seeds): alive 0/4 → 3/4, global-final 1/4 →
  2/4, lesser 3/4 → 3/4, full 0/4 → 0/4, wave 5 0/4 → 0/4.
  Fetches implicated as harming the long climb ON THIS QUAD; the
  mechanism (which fetched item / fight / pantry chain) NOT
  established; removal NOT proposed as a landing.
- r59 metric observation, DECIDED HERE BEFORE SCORING: "wave 5
  reached" counts ONLY census maxWave >= 5. The table detail's w5
  field is reported separately and never scored as wave-5-reached
  (r59 nofetch 85001 carried w5=1 with maxWave=4 — that seed does
  NOT count as wave-5-reached under this rule).
- Range since r59's measurement base (359a384cc..HEAD -- src/js/):
  exactly one landing — 52df7e732 journey-endgame r74 (pellet-quote
  variant + return-ghost guard; narration-only per its commit
  message, with RED->GREEN proof tests). Everything else in the
  range is evidence/tooling only.

## Leg questions (binding)
1. **QUAD-CURRENT-R60 (descriptive continuity):** same 4 seeds
   (85001–85004), control picker, policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop. Driver = r59 driver, labels/EVIDIR
   only (scripts/journey-scale-r60-20261030.js).
   PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages
   == 0, STOP.
   Verdict rule, decided BEFORE reading results: report census
   scalars per seed vs r59. ANY scalar difference triggers r52's
   first-divergence audit (capture diff, first differing line class)
   before any attribution — do NOT call it noise and do NOT
   attribute it to a single landing without that audit. The r74
   landing is narration-only on its face, so a scalar move would
   be surprising and must be audited, not assumed.
2. **WIDE NOFETCH (r59 open item a, wider band):** fresh seeds
   85101–85108, current vs nofetch, same policy, DAYCAP 180.
   Nofetch arm = driver identical except labels/EVIDIR, PLUS a
   temporary worktree-only patch neutralising the two daily fetch
   calls in villagerBuildDay (vesselStashFetch + vesselArmorFetch),
   applied only for this arm and reverted with
   `git checkout -- src/js/villager-build.js` immediately after,
   verified: `git diff -- src/js/` 0 lines, no R60-NOFETCH marker
   remains. The patch is never committed and never lands; it is
   an instrument, not a fix.
   PILOT GATE: seed 85101 current runs first; if it crashes or
   pilgrimages == 0, STOP the wide band (Q1 still stands).
   Verdict rule, decided BEFORE reading results: count, per arm,
   alive-at-cap, global-final, lesser-waiting, full seat, and
   wave-5-reached (maxWave >= 5 ONLY, per the definition above).
   Corroboration bar: nofetch alive-count exceeds current by >= 2
   on these 8 seeds → r59's fetch-harm finding is corroborated on
   a wider band. Difference <= 1 in either direction → NOT
   corroborated (quad result does not generalise on this band).
   Current exceeding nofetch by >= 2 → direction REVERSED on this
   band. Counts are descriptive; 8 seeds cannot convict a mechanic
   in general, and no removal is proposed from this arm alone.
3. **MECHANISM TRACE (r59 open item a, descriptive pilot):** on up
   to 2 wide-band seeds where current vs nofetch fates diverge,
   extract from the captures: the day-1 fetch item(s) + Equipped
   lines, the vessel's fights in days 1–40, pantry trajectory
   days 1–40, and any attachment/enhancement line naming a fetched
   item. Report the chain if one is legible; report "no legible
   chain" if none is. NO fix landing follows from the trace
   alone — any fix needs its own proof design in a later run.
4. **PEOPLE CHECK (sense law):** read the Q1 quad transcripts in
   full (driver's d90/d120 talks). Judge meaning, coherence,
   relevance, consequences — never just exchange counts. Known
   blemish classes to check for recurrence (not re-scored as new):
   Irving one-sitting displacement, Thabo withdrawal-only talk,
   Meera gossip tail, Boris nod-loop (untested since r58).

## Census scalars (unchanged from r51)
day, over, popAlive/popTotal, pantryKcal, scaleRank, nationalDay,
globalDay, firstCourtDay, tableSeat, arcNow, deaths, covenant trusts,
maxWave, pilgrimages, fusionInstalled, abilitiesHeld.

## Telemetry
After writing evidence, run telemetry-check against
hidden_files/telemetry-baselines/scale-census.json with the r60
current-quad trust JSONs. Baseline NOT rolled on this run's numbers
(prereg decision; r59 seeded it from r58 and did not roll either).
Any LOUD line is a same-run investigation item before closeout.
