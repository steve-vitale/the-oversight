# journey-scale r61 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261031T0643Z (scheduled 01:45 CDT 2026-10-31; lock created 06:43:32Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(r57–r60 discipline: a failed run does not advance the rotation).
Note on the repeated leg: r60's note promised the 3→0 write at its
closeout, but the rotation file still read 3 at this run's start —
so either r60's closeout did not write it or it was reset after.
Staying on scale is queue-correct under the body (play THIS run's
leg as read), not a silent repeat; this run writes 0 on success
and notes the anomaly here rather than assuming r60's write.
**Base:** master@3c03d468b at worktree creation.
**No src/js change planned at pre-register time, and no src/js landing
is planned:** Q2 re-reads existing r60 captures; Q1 is measurement.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
the driver reads only engine-exposed state, as before.

## Standing context (read before scoring)
- r60 (base 7a2974684, merged onto 168db1ea3): QUAD-CURRENT full
  parity vs r59 — 4/4 seeds scalar-identical (85001 d135 died 0/0
  GLOBAL nat77 glob92 court76 lesser arc4 deaths44 cov34/40/32 pilg4
  fusion T abil iron_stomach; 85002 d132 died 0/0 REGIONAL lesser
  arc4 deaths62 cov 2 pilg54 fusion T; 85003 d134 died 1/1 regional
  lesser arc4 deaths44 cov30/34/34 pilg6 fusion F; 85004 d178 died
  0/0 regional nat94 glob117 court93 seat NONE arc3 deaths47
  cov58/31/22 pilg5 fusion F). Capture diffs vs r59: 0 lines.
- r60 wide band (fresh 85101–85108, current vs nofetch): current
  alive-at-cap 6/8, lesser 7/8; nofetch alive-at-cap 4/8, lesser
  2/8 — direction REVERSED vs r59's quad; fetch effect
  seed-dependent; mechanism NOT established. r60 trace verdict:
  fetched gear is actively used (fights from day 9–12, an
  enhancement offer) but fate direction flips by seed; no single
  chain explains both traced seeds. Counting more bands will not
  settle it without a trace naming the deciding break per seed.
- Range since r60's measurement base (7a2974684..HEAD -- src/js/):
  exactly one game landing — 7d5281064 sim-deadfall-b (new
  villager duty "Gather deadfall": sticks + 50% fiber into the
  communal stash, forager/woodworker 1.4 tier, farmer/gardener 1.2,
  no axe gate; plus perceive.js stick plural + hint list). Plus a
  version-bump build.js change. Everything else in the range is
  evidence/tooling only.
- r60 metric observation, DECIDED HERE BEFORE SCORING (applies to
  r61's own arms; r60's verdicts are NOT re-scored): end states
  split three ways — ALIVE (not over at cap), SCATTERED (over with
  popAlive > 0), DEAD (over with popAlive = 0). "Alive-at-cap"
  henceforth means ALIVE only; SCATTERED is its own class, never
  folded into alive or dead silently.
- "Wave 5 reached" counts ONLY census maxWave >= 5 (r60 definition,
  kept). The table detail's w5 field is reported, never scored.

## Leg questions (binding)
1. **QUAD-CURRENT-R61 (descriptive continuity):** same 4 seeds
   (85001–85004), control picker, policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop. Driver = r60 driver, labels/EVIDIR
   only (scripts/journey-scale-r61-20261031.js).
   PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages
   == 0, STOP.
   Verdict rule, decided BEFORE reading results: report census
   scalars per seed vs r60. ANY scalar difference triggers r52's
   first-divergence audit (capture diff vs r60, first differing
   line class, deadfall-line count) before any attribution — do
   NOT call it noise and do NOT attribute it to deadfall without
   that audit. The deadfall landing adds a duty option the engine
   may or may not assign under the competent/scalecourt policy, so
   parity is a genuine question here, not a foregone conclusion.
   Also report deadfall-line counts per seed (capture lines
   matching /deadfall/i) — a zero count with full parity means the
   duty never fired on this leg's policy path.
2. **FETCH-MECHANISM (r60 open item, re-read — NO new seeds):**
   re-read r60's wide-band captures + hungerwatch + trust JSONs
   (evidence/2026-10-30/journey-scale-r60-wide and
   -wide-nofetch, seeds 85101–85108, current vs nofetch). For each
   seed, classify BOTH arms under the new end-state split (ALIVE /
   SCATTERED / DEAD) and extract: the end day and pop, the death
   cluster in the final 20 days (deathLog days/causes), the pantry
   trajectory over the final 30 days (hungerwatch pantry +
   hungryDays), and the vessel's last fights if legible. A
   "deciding break" for a seed = one named event class that
   separates the arms (e.g. a wild-death cluster in one arm's
   final days with none in the other, a pantry-zero + hungryDays
   run, a scatter-type over with survivors vs a wipe).
   Verdict rule, decided BEFORE reading results: the mechanism
   question is ANSWERED if the same deciding-break class appears
   on >= 4 of the 8 seeds; otherwise it STAYS OPEN and the run
   reports the per-seed table without claiming a mechanism. No
   fix landing follows from this re-read alone.
3. **PEOPLE CHECK (sense law):** read the Q1 quad transcripts in
   full (driver's d90/d120 talks). Judge meaning, coherence,
   relevance, consequences — never just exchange counts. Known
   blemish classes to check for recurrence (not re-scored as new):
   Irving one-sitting displacement, Thabo withdrawal-only talk,
   Meera gossip tail, Boris nod-loop (untested since r58).

## Census scalars (unchanged from r51)
day, over, popAlive/popTotal, pantryKcal, scaleRank, nationalDay,
globalDay, firstCourtDay, tableSeat, arcNow, deaths, covenant trusts,
maxWave, pilgrimages, fusionInstalled, abilitiesHeld. Plus the new
end-state class (ALIVE / SCATTERED / DEAD) and deadfall-line count.

## Telemetry
After writing evidence, run telemetry-check against
hidden_files/telemetry-baselines/scale-census.json with the r61
current-quad trust JSONs. Baseline NOT rolled on this run's numbers
(prereg decision). Any LOUD line is a same-run investigation item
before closeout.
