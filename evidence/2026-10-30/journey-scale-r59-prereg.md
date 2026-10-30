# journey-scale r59 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261030T2215Z (scheduled 16:45 CDT; lock created 22:15:29Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(r57/r58 discipline: a failed run does not advance the rotation).
Note on the repeated leg: r57 and r58 both ran scale, and the rotation
file still read 3 at this run's start (mtime 22:08Z, after r58's
closeout note). This run therefore takes scale again — and r58 left
a scale question explicitly open (the gear-fetch decomposition below),
so staying on scale is the queue-correct move, not a silent repeat.
**Base:** master@359a384cc at worktree creation.
**No src/js change planned at pre-register time, and no src/js landing
is planned:** the Q2 arm is a temporary worktree-only patch, reverted
before any commit (see Q2). Measurement first (r51–r58 discipline).
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
the driver reads only engine-exposed state, as before.

## Standing context (read before scoring)
- r58 (base 1555c5dfa): QUAD PARITY BROKEN 0/4 vs r57. Same 4 seeds,
  same policy, DAYCAP 180. r58: 85001 d135 died 0/0 GLOBAL nat77
  glob92 court76 lesser arc4 deaths44 cov34/40/32 pilg4 fusion T
  abil iron_stomach; 85002 d132 died 0/0 REGIONAL lesser arc4
  deaths62 cov 2 pilg54 fusion T; 85003 d134 died 1/1 regional
  lesser arc4 deaths44 cov30/34/34 pilg6 fusion F; 85004 d178 died
  0/0 regional nat94 glob117 court93 seat NONE arc3 deaths47
  cov58/31/22 pilg5 fusion F. Descriptive quad: alive 0/4 (was 2/4),
  global-final 1/4 (was 2/4), lesser waiting 3/4 (was 4/4), full seat
  0/4, wave 5 reached 0/4 (maxWave 4 on all four).
- r58 first-divergence audit (4/4 seeds): first differing lines are
  day-1 gear-fetch lines (vessel fetches own stashed weapon/armor at
  haven, from landings 21efcdcb2 stashfetch and 3e94b55cc armorfetch
  in the r57→r58 range, plus hidearmor 15ab6d463 and contestdeath
  06b502d53). Attribution NOT established singly: which landing(s)
  produce the worse endings is r58's stated open item.
- r58 Q2 ANSWERED: Irving displacement is ONE-SITTING-ONLY (favor
  surfaces and commits at the first probe sitting, d91). Q3
  ANSWERED/CORRECTED: the subject menu shelves the want, it does not
  re-enter it. Neither is re-tested here unless a transcript recurs.
- r58→r59 range src/js changes (verified by `git log 1555c5dfa..HEAD
  -- src/js/`): exactly two landings — 72512906f sim-titanexcl-a
  (exclude titans from the castMonster wanderer-cast pool; Herald
  wave 4 / Finale-Nielsen wave 5 had leaked into casts and feast
  draws) and c5ecd7ab8 sim-sickstale-b (clear sick record on roster
  removal; sickness tick skips dead/off-roster records instead of
  hurting a corpse's health entry first). Everything else in the
  range is evidence/tooling only.

## Leg questions (binding)
1. **QUAD-CURRENT-R59 (descriptive continuity):** same 4 seeds
   (85001–85004), control picker, policy scalecourt-nogate UNCHANGED,
   DAYCAP 180, death-aware stop. Driver = r58 driver, labels/EVIDIR
   only (scripts/journey-scale-r59-20261030.js).
   PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages
   == 0, STOP.
   Verdict rule, decided BEFORE reading results: report census
   scalars per seed vs r58. ANY scalar difference triggers r52's
   first-divergence audit (capture diff, first differing line class)
   before any attribution — do NOT call it noise and do NOT
   attribute it to a single landing without that audit. The two
   range landings give the audit two named suspects (titan-cast
   lines, sick-tick lines); a divergence in neither class must be
   reported as unattributed, not forced onto them.
2. **FETCH-DECOMPOSITION (r58 open item, NEW):** same 4 seeds,
   same policy, DAYCAP 180, separate EVIDIR
   (evidence/2026-10-30/journey-scale-r59-nofetch), driver identical
   except labels/EVIDIR — PLUS a temporary, worktree-only patch to
   src/js/villager-build.js that neutralises the two daily fetch
   calls in villagerBuildDay (the vesselStashFetch and
   vesselArmorFetch try-blocks). The patch is applied ONLY for this
   arm, is reverted with `git checkout -- src/js/villager-build.js`
   immediately after the arm finishes, and the revert is verified
   (`git status` shows no src/js change) BEFORE any commit. The
   patch is never committed and never lands; it is an instrument,
   not a fix.
   PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages
   == 0, STOP the arm (quad Q1 still stands on its own).
   Verdict rule, decided BEFORE reading results: compare the
   nofetch quad's descriptive counts (alive-at-end, global-final,
   lesser-waiting, full seat, wave 5 reached) against BOTH the r58
   quad and the r59 quad. Classification:
   - nofetch moves the counts back toward r57 (alive 2/4,
     global-final 2/4, lesser 4/4) relative to current → fetches
     are implicated as harming the long climb on this quad.
   - nofetch ≈ current (same counts, scalars within the r58→r59
     drift) → fetches are NOT the mover on this quad; the
     r57→r58 range's other landings (hidearmor, contestdeath) or
     an interaction stay open.
   - nofetch worse than current → fetches help the climb on this
     quad, and r58's "uniformly worse" direction needs a different
     explanation.
   Also run the first-divergence audit nofetch-vs-current: the
   first differing lines SHOULD be the absent day-1 fetch lines;
   if the first divergence is elsewhere, report it, do not assume
   the patch is the cause.
   Pre-stated caveat: 4 seeds cannot convict or clear a mechanic
   in general — the verdict is about this quad only, and any
   "implicated" finding is a candidate for a wider-band re-test,
   not a landing decision.
3. **PEOPLE CHECK (sense law — full transcripts read, not counted):**
   all control-quad transcripts (days 90/120 × seeds, as produced)
   judged on meaning: the NPC wants something, options engage or
   deflect it, endings resolve/plant/owe. No fabricated shared
   history, no filler loops, no static menus. Watch specifically
   whether r58's react-loop blemish or Thabo withdrawal-only talk
   classes recur.
4. **TABLE-APPROACH (standing, report-only):** seat/arc/waiting per
   seed from the want files, continuity with r58. No verdict bar.
5. **BARRIER PIN (standing instrument, re-confirmed):** sayOncePerFight
   calls per seed; the pin overturns ONLY on a logged barrier call,
   and a logged call with a refusal narration is guard-holds, not
   guard-broken (r55 form).

## Instruments (all driver-only, read-only, except the Q2 patch above)
- r58 driver verbatim otherwise: census, trust/beat/gov/hunger/table
  watches, barrier instrument, armor dump, open-thread logging,
  fusion/ability census fields.
- NEW analyzer scripts/analyze-journey-scale-r59-20261030.js: r58
  analyzer, labels/EVIDIR only. Deterministic read of evidence
  files only (no engine load, no RNG). Takes the EVIDIR as argv.
- EVIDIRs (kept separate so arms cannot overwrite each other's files):
  evidence/2026-10-30/journey-scale-r59 (quad),
  evidence/2026-10-30/journey-scale-r59-nofetch (Q2).
- Q2 arm differs from the quad ONLY by the temporary fetch patch +
  env flags (EVIDIR) — no driver logic change.
- Telemetry baseline (r58 proposal, executed here, NOT mid-run):
  a separate census baseline seeded from r58's quad aggregates
  (hidden_files/telemetry-baselines/scale-census.json:
  census.day=579, census.popAlive=1, census.pantryKcal=0,
  census.maxWave=16, census.pilgrimages=69) is used for the step-14
  check against the r59 quad trust JSONs. scale.json is NOT
  overwritten — its keys belong to a different instrument. LOUD
  lines are investigated before any roll-forward; the baseline is
  NOT rolled on this run's numbers.

## Metric review (carried)
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores).
- No metric is re-scored mid-run. If the nofetch verdict rule's
  count comparison proves too coarse, that goes under "metric
  review" for the next run, not into a re-scored r59 verdict.
