# journey-scale r62 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261031T1443Z (scheduled 09:45 CDT 2026-10-31; lock created 14:43:57Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(r57–r61 discipline: a failed run does not advance the rotation).
Note on the repeated leg: r61's note promised the 3→0 write at its
closeout, but the rotation file still read 3 at this run's start —
the same anomaly r61 recorded about r60. Staying on scale is
queue-correct under the body (play THIS run's leg as read), not a
silent repeat; this run writes 0 on success and records the anomaly
here rather than assuming the earlier write happened.
**Base:** master@47162b801 at worktree creation (worktree slug
journey-scale-r62 — see Infrastructure note: the plain
journey-scale slug could not be registered this run).
**No src/js change planned at pre-register time, and no src/js landing
is planned:** Q1 is measurement, Q2 re-reads existing r60 captures,
Q3 is a read-only instrument re-run with a reproduction gate.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
drivers read only engine-exposed state, as before.

## Infrastructure note (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Main-tree .git EPERM flap (2026-10-23 class, recurred):** ref writes
  in ~/workspace/the-scattering/.git failed with Operation not
  permitted from ~14:47Z to ~14:57Z (packed-refs rewrite, loose-ref
  creation, and direct probe writes into .git all failed, while
  ordinary file writes outside .git worked after ~14:52Z). No ref
  surgery was forced. The plain `journey-scale` branch could not be
  deleted (it is fully merged into master — ancestor check passed —
  but the delete needs a packed-refs rewrite) and the plain slug
  could not be registered. After the flap cleared, the run registered
  under the fresh slug `journey-scale-r62` (new loose branch, no
  packed-ref rewrite needed). The stale `journey-scale` branch
  pointer is left in place for a later quiet moment — it is merged,
  harmless, and deleting it during a flap would risk worse. Merge
  at closeout targets branch journey-scale-r62, not journey-scale.
- **Heartbeat:** manual heartbeat at registration verified landed
  (15:03:11Z) plus a 10-minute background loop with its log in goal
  hidden_files (journey-scale-r62-heartbeat.log).

## Standing context (read before scoring)
- r61 (base 3c03d468b): QUAD-CURRENT full parity vs r60 — 4/4 seeds
  scalar-identical, 0-line capture diffs; deadfall duty fired 0 times
  on the scale policy path (inert on this leg). Fresh-band re-read:
  nofetch arc lag named but not decomposed — arc 3 on 7/8 nofetch
  vs arc 4 on 7/8 current, including surviving nofetch villages
  with equal-or-better pantry.
- Range since r61's measurement base (3c03d468b..HEAD -- src/js/):
  exactly one game landing family — lootabilities w1–w3, incl. Arm 6
  villager self-craft (villagerWeaponCraftDay in villager-build.js:
  a weaponless villager at home who personally knows a weapon recipe
  and can reach the materials crafts up the spear/bow ladder at the
  player's own craft odds and costs, auto-equips, one attempt per
  3 days). Everything else in the range is evidence/tooling only.
- r61 metric observation, DECIDED HERE BEFORE SCORING (applies to
  r62's own arms; r61's verdicts are NOT re-scored): end states
  split three ways — ALIVE (not over at cap), SCATTERED (over with
  popAlive > 0), DEAD (over with popAlive = 0).
- "Wave 5 reached" counts ONLY census maxWave >= 5 (r60 definition,
  kept). The table detail's w5 field is reported, never scored.
- Ordering honesty: while blocked on the .git flap before any r62
  seed ran, this run read r60's wide-band captures and the
  table/progression code to FIX the Q2 scoring rule below (lesser-seat
  bars straight from table.js, food-deed split from code). The Q2
  numbers are reported as the audit result under that fixed rule;
  no r62 seed runs before this prereg is committed.

## Leg questions (binding)
1. **QUAD-CURRENT-R62 (descriptive continuity):** same 4 seeds
   (85001–85004), control picker, policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop. Driver = r61 driver, labels/EVIDIR
   only (scripts/journey-scale-r62-20261031.js).
   PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages
   == 0, STOP.
   Verdict rule, decided BEFORE reading results: report census
   scalars per seed vs r61. ANY scalar difference triggers r52's
   first-divergence audit (capture diff vs r61, first differing
   line class, weapon-craft-line count, deadfall-line count) before
   any attribution — do NOT call it noise and do NOT attribute it
   to self-craft without that audit. The self-craft landing adds a
   duty option the engine may or may not assign under the
   competent/scalecourt policy, so parity is a genuine question
   here, not a foregone conclusion. Also report per seed:
   weapon-craft lines (capture lines matching /spent the afternoon
   at the workbench and made/) and deadfall lines (/deadfall/i, with
   the duty line "gathers deadfall —" split out) — a zero
   weapon-craft count with full parity means the duty never fired
   on this leg's policy path.
2. **ARC-GATE AUDIT (r61 open item, re-read — NO new seeds):**
   re-read r60's wide-band census details + wantwatch + captures
   (evidence/2026-10-30/journey-scale-r60-wide and -wide-nofetch,
   seeds 85101–85108, current vs nofetch). Scoring rule, fixed
   from code (table.js lesser-seat bars): w1 >= 4, w2 >= 4, w3 >= 3,
   contestsN >= 2, crisesN >= 2, rank regional+, stage >= 2,
   foodDeeds (sentimentTaught AND feastSurgeUsed). Score bars at
   CENSUS (tableSeatDetail), not at the last wantwatch sample — the
   census is taken after the final tick and can differ by one tick.
   For each seed, name exactly which bars miss at census in each
   arm. For foodDeeds misses, split sentiment vs feastSurge:
   sentiment counts as fired iff the capture holds a RESONANCE
   HARMONICS line; otherwise the miss is the feastSurge half
   (feastSurgeUsed never marked — no capture line names it, so the
   census flag is the instrument). For pellet arms, classify via
   the capture: pellet-install line present/absent, and the
   day-90+ table beat variant ("NO HUNGER ON THE RECORD" =
   never banked; "FIRE BURNED BEFORE THE PELLET" = banked before
   the pellet). Verdict rule: report the per-seed bar table; a
   "single mechanism" claim requires one bar class covering all
   divergent seeds — otherwise report the decomposition as the
   answer (bars, not a chain). No fix landing follows from this
   re-read alone. Note the measurement-timing class separately:
   an arm whose bars are ALL met at census but whose arc is still
   3 is a promotion-tick lag, not a progression failure.
3. **PELLET-TIMING INSTRUMENT (new, measurement only):** a COPY of
   the r62 driver plus ONE read-only daily instrument
   (scripts/journey-scale-r62-pellet-20261031.js): each day record
   pelletOnline (fusionReactorOnline), feastSurgeUsed
   (state.scholar.prog.feastSurgeUsed), arc, seat. No engine input
   is touched; the instrument reads only. Run on wide-band seeds
   85101–85108, BOTH arms (current; nofetch = r60's temporary
   worktree-only patch neutralising vesselStashFetch +
   vesselArmorFetch in villagerBuildDay, reverted with
   `git checkout -- src/js/villager-build.js` immediately after
   each nofetch seed, verified `git diff -- src/js/` 0 lines).
   REPRODUCTION GATE (decided before running): per seed/arm, the
   instrumented capture must diff 0 lines vs the r60 wide capture
   for that seed/arm. ANY diff → STOP, do not score timing,
   report instrument impurity as the finding. If the gate passes,
   report per seed/arm: pellet-install day (first day pelletOnline
   true), bank day (first day feastSurgeUsed true), order class
   (bank-before-pellet / pellet-before-bank / never-banked /
   no-pellet), and arc at census. Claim "timing predicts arc"
   ONLY if order separates arc4 from arc3 arms with at most the
   two named exceptions (85103 tick-lag, 85105 w3-short); otherwise
   report the contingency table as the answer. No fix landing
   follows from Q3 alone.
4. **PEOPLE CHECK (sense law):** read the Q1 quad transcripts in
   full (driver's d90/d120 talks). Judge meaning, coherence,
   relevance, consequences — never just exchange counts. Known
   blemish classes to check for recurrence (not re-scored as new):
   Irving one-sitting displacement, Thabo withdrawal-only talk,
   Meera gossip tail, Boris nod-loop (untested since r58).

## Census scalars (unchanged from r51)
day, over, popAlive/popTotal, pantryKcal, scaleRank, nationalDay,
globalDay, firstCourtDay, tableSeat, arcNow, deaths, covenant trusts,
maxWave, pilgrimages, fusionInstalled, abilitiesHeld — plus the
r61 end-state class (ALIVE / SCATTERED / DEAD), the weapon-craft-line
count, and the deadfall-duty line count.

## Telemetry
After writing evidence, run telemetry-check against
hidden_files/telemetry-baselines/scale-census.json with the r62
current-quad trust JSONs. Baseline NOT rolled on this run's numbers
(prereg decision; r59 seeded it and no run since has rolled it).
Any LOUD line is a same-run investigation item before closeout.
