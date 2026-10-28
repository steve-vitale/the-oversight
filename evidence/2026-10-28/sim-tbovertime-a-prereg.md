# sim-tbovertime-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T0634Z. Axis: scale-onramp
(the blocking axis). Worker: sim-tbovertime-a. Tracker blank 3 —
separate PRE-FIGHT overtime scaling from IN-FIGHT TB growth on
the w4convert reading.

Worktree: `~/workspace/worktrees/sim-tbovertime-a` (branch
sim-tbovertime-a). Base: master 3cb5f8b82 (already contains the
world-HP TB rule from sim-w4tbkill-a).

MEASUREMENT ONLY — zero src/js changes, zero policy changes to
game behavior, no game lever, no balance change proposed or
landed, no re-score of the w4convert 0-kill verdict (that
verdict stands untouched; this arm only corrects the
mechanism reading). Documentation IS the deliverable: the
construction -> start -> end decomposition table and the
corrected sentence for the w4convert "TB scales the monster
up" reading. If a lever suggests itself, it is named as a
future arm, not implemented.

Do NOT touch gating code or deed bars (Steve 2026-10-27
gating freeze stands). Do NOT write or delete any claim
file or lock file (coordinator owns them). Do NOT touch
any sibling worktree. Do NOT attempt the balanced panel
(no corpus-ingest mode — standing exception, stated here
explicitly, not attempted and no panel artifact faked).

## The flagged reading (why this arm exists)

evidence/2026-10-28/sim-fighterconstruct-a.md flagged this:
the 75103 d178 suburb fight's START was already 3688/3688
on construction 1475 x2.5 overtime, so part of w4convert's
"TB scales the monster up" reading (e.g. 75103 seq 64 suburb:
tile 975 -> TB end 3688/3688; seq 60 suburb: 954 -> 2554;
seq 59 algorithm: 750 -> 2374) was pre-fight overtime
scaling already present at start, not growth inside the
fight. The w4convert census verdict (0 kills) and its
tile-to-end comparison AS MEASURED are untouched; this arm
decomposes the tile-to-end gap into its parts so the
mechanism sentence can be corrected.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 = the
  Mirror Draft, bands anchored: damage 35-95, HP 850-1500,
  pierce 0.2-0.5; gate village standing >= 100).
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, metric binding,
  balanced panels).
- No canon invented. Where code and canon wording differ,
  the code reading governs and the difference is reported.

## Code read before this prereg (overtime, src/js/overtime.js)

- Overtime ticks daily once the Table exists for the player
  (announced, day 90+, seat not none, not seated): every 7
  unseated days raises a tier, cap 6 (titans.json
  _overtime: daysPerTier 7, maxTier 6, hpPerTier 0.25,
  dmgPerTier 0.12, packEveryTiers 2, minWave 4).
- overtimeScaleFight(mid) runs as a wrapper AFTER
  startCombat returns (so AFTER the fighter-construction
  snapshot and AFTER opening turns inside startCombat):
  it sets f.otTier = t, injects floor(t/2) packmates via
  campaignInjectMonster (named m_crew_* in the census),
  then for every monster fighter multiplies hp and maxHp
  by hpM = 1 + 0.25*t (rounded), and says aloud:
  "RERUN x{t} — you have seen this episode. It has seen
  you too. (Overtime: +{100*(hpM-1)}% HP, +{12*t}% damage
  [, +{extra} in the pack].)" It skips titans, campaign
  nodes, waves below 4, and active-table fights.
- Predicted consequences, all tested by the join below:
  (a) construction maxHp is the fresh def roll, unscaled;
  (b) start maxHp = round(construction maxHp * (1+0.25*t))
  for the tier t recorded at fight time (exact, because
  overtime scales hp and maxHp together and opening
  damage moves hp only, never maxHp);
  (c) in-fight maxHp growth is NOT an overtime mechanism
  at all — overtime runs once, at start, never mid-fight;
  any endMax != startMax would need a different named
  mechanism, cited, never assumed;
  (d) the RERUN line is the game's own narration of the
  scaling — the sense read tests whether that line
  actually reaches the player in a scaled fight's trace.

## Definitions (binding — the analyzer implements exactly these)

- UNIT: one world-origin wave-4 TB fight = a nonworldkill
  start with wave == 4, origin == 'world-origin', not
  refused (pre.liveFight false), not a table trial.
  Expected count on this band from the predecessor
  corpora: 25 (75102: 9, 75103: 6, 75106: 8, 75108: 2;
  75101/75104/75105/75107: 0). A different count is
  reported and diagnosed, never silently re-based.
- PRIMARY FIGHTER: m_0 (the w4tbhp / fighterconstruct
  vocabulary). Crew fighters (m_crew_*, overtime packmates
  and any network-campaign injections) are reported as a
  secondary pool (counts, start/end HP) but never folded
  into the m_0 decomposition.
- CONSTRUCTION: fighterconstruct construction snapshot
  for the same fightId (first tbAdvance entry inside that
  startCombat call): m_0 hp/maxHp. By the fighterconstruct
  finding, construction hp == maxHp always; a construction
  below max is cited as its own row, never averaged away.
- START: nonworldkill post-startCombat snapshot for the
  same fightId: m_0 hp/maxHp (post-opening-turns AND
  post-overtime-scaling, by wrap order). Opening damage
  for m_0 = startMax - startHp, cross-checked against
  the fighterconstruct openingDamage sum for m_0 on that
  fightId (must agree exactly; a disagreement is an
  unexplained recorder gap).
- END: tbdmg tbEnds snapshot for the same fightId
  (pre-tbEnd): m_0 hp/maxHp, plus the tbEnd result and
  round. A fight with no tbEnd row, or with two, is
  UNJOINED, never estimated.
- TILE: nonworldkill start.tileMonster hp/maxHp (the world
  monster on the player tile at lift). World-origin fights
  must carry one; a missing tileMonster is an unexplained
  recorder gap.
- OVERTIME TIER AT FIGHT TIME: the NEW tbovertime-diag
  record (see Instruments): Game.overtimeTier() read at
  startCombat pre, at startCombat post, and at tbEnd pre,
  plus f.otTier and each fighter's otTier flag at post.
  INFERRED tier t_inf = round((startMax/constrMax - 1)
  / 0.25). The direct record and the inferred tier must
  agree (t_rec == t_inf) AND startMax must equal
  round(constrMax * (1 + 0.25*t_rec)) exactly. Any
  disagreement is an unexplained recorder gap, cited
  per fight.

## Decomposition (binding — additive, signed, sum-checked)

For each unit fight, with C = construction m_0 HP
(= constrMax), S = start m_0 HP, Smax = start m_0 maxHp,
E = end m_0 HP, Emax = end m_0 maxHp, T = tile HP:

- tile -> construction: C - T (fresh def roll vs the
  wounded world monster; NOT scaling, NOT damage).
- pre-fight scaling (maxHp): Smax - C (overtime at start;
  predicted 0 when t_rec == 0, round(C*0.25*t_rec)
  otherwise).
- opening damage: Smax - S (predicted == fighterconstruct
  opening sum for m_0; 0 except when a faster villager
  struck in the opening turns).
- pre-fight net HP movement: S - C = (Smax - C) - (Smax - S).
- in-fight change: E - S (negative = net damage dealt in
  the fight; positive would be net healing/growth and
  must be named per fight, never assumed).
- in-fight maxHp growth: Emax - Smax (predicted 0 on every
  fight; any nonzero row is cited with its mechanism or
  as unexplained).
- tile -> end (the w4convert comparison, decomposed):
  E - T = (C - T) + (S - C) + (E - S). The analyzer
  asserts this identity per fight; a failed identity is
  a hard analyzer failure, not a rounding note.
- construction -> end (this arm's focus):
  E - C = (Smax - C) - (Smax - S) + (E - S).
  Aggregate shares are reported on the fights where
  E > C (the "scales up" set) AND on all fights: total
  pre-fight scaling HP, total opening damage, total
  in-fight net damage, total in-fight maxHp growth.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, MEASUREMENT: scripts/policies/tableseat-nowait.js
  VERBATIM (never edited), env LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1 (TABLEDEFIANT unset), PLUS recorder
  on-switches RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1,
  DEFWOUND=1, NONWORLDKILL=1, TBDMG=1, W4DMG=1,
  FIGHTERCONSTRUCT=1, TBOVERTIME=1 (the new recorder only).
- NEVER edited: tableseat-nowait.js, any existing recorder
  file, or any src/js file. New instruments only (one
  sweep copy, one new recorder, one analyzer, one sense
  script copy).
- Recorders reused verbatim, policy-side only:
  raftdraft-diag, spawnsrc-diag, oldcore-diag, w5births-diag,
  defwound-diag, nonworldkill-diag, tbdmg-rebase-diag,
  w4damage-diag, fighterconstruct-diag, plus the w4convert
  sweep-side read-only scholar-history capture. No recorder
  draws RNG, throws into the engine, or returns anything
  but the original value. The new recorder records pure
  reads only (overtimeTier(), f.otTier, fighter otTier
  flags, fighter HP snapshots), writes nothing to game
  state (store arrays only, plus the same installed-flag
  class the other recorders use), and returns the original
  value untouched.

## Instruments (COPIES ONLY, originals untouched, plus one new)

- scripts/test-tbovertime-sweep.js (copy of
  test-fighterconstruct-sweep.js), differing ONLY in:
  default corpus dir
  (evidence/2026-10-28/perseed-tbovertime-a), labels, the
  loadGame mode label, require-path renames, and the
  addition of the tbovertime recorder to the composition
  + detgate. Verified by diff before the judged sweep:
  every changed line is one of those renames/additions;
  no logic, channel rule, gate, or recorder wiring changed.
- scripts/policies/tbovertime-diag.js (NEW, policy-side
  only): wraps startCombat (pre: overtimeTier(),
  overtimeActive(); post: tier, f.otTier, fighter
  key/kind/monsterId/hp/maxHp/otTier; refused calls
  flagged, post fighters not recorded as a new fight)
  and tbEnd (pre: tier, fightId, fighter snapshot).
  On-switch TBOVERTIME=1; unset it delegates
  byte-identically: no wraps installed, no ctx surface,
  no record.
- scripts/test-tbovertime.js (NEW analyzer, proof
  validator): reads the corpus rows, builds the
  construction -> start -> end join for world-origin
  wave-4 TB fights exactly per the Definitions above,
  runs unit checks on its own decomposition arithmetic,
  checks parity vs the fighterconstruct corpus, and
  prints the decomposition table + aggregate shares +
  verdict legs. Exit 1 on any hard gate failure (corpus
  incomplete, any recorder errs > 0 or overflow > 0,
  any unit fight unjoined, any tier disagreement, any
  opening-sum disagreement, any failed sum identity).
  The analyzer never re-scores a verdict: it prints the
  tables; the evidence judges them against this prereg.
- scripts/test-tbovertime-sense.js (copy of the
  fighterconstruct sense script, labels + beat filter
  only): NON-MEASURED narration replay only, seed 75103,
  window d168-d180 (the d178 scaled suburb fight +/- 10,
  capped at the seed's end day 180), beat filter extended
  with rerun/overtime terms. Sense is a supporting note,
  not a verdict leg.

## Corpus

- evidence/2026-10-28/perseed-tbovertime-a/
  s<seed>-armed.json (8 rows), plus summary.json from the
  sweep's --summary mode, plus analysis.json from the
  analyzer's --out mode, plus sense-75103.txt (NON-MEASURED).
- The sweep runs on the worktree base with the instruments
  above. Wall numbers are reported for THIS band only,
  never pooled with any other band.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the construction -> start -> end decomposition
for world-origin wave-4 TB fights.

GO RULE (MEASUREMENT, judged ONLY against this prereg):
  GO = 8/8 seeds complete with clean recorders (row per
  seed, days > 0, every recorder clean: errs 0, no
  overflow) AND the join complete for >= 95% of
  world-origin wave-4 TB fights on the band (construction
  + start + end + direct tier record all present) with
  0 unexplained recorder gaps (every unjoined fight, tier
  disagreement, opening-sum disagreement, or failed sum
  identity counted and cited — a counted-and-cited gap
  still fails the 0-gap leg; the evidence then judges
  NO-GO with the gap named, never re-scores it away)
  AND a decomposition table quantifying, per fight and in
  aggregate, how much of the construction-to-end change
  is pre-fight overtime scaling vs in-fight change
  AND a corrected sentence for the w4convert "TB scales
  up" reading stating which share is overtime-at-start
  and which is in-fight (or a verdict that the two
  cannot be separated with these instruments, with the
  exact blocker named).
  NO-GO = join < 95%, or any unexplained recorder gap,
  or no decomposition table, or no corrected sentence /
  separation verdict. A complete join showing zero
  in-fight maxHp growth is a GO with that finding stated
  plainly — it is the correction, not a failure.
  No re-scoring mid-run; metric doubts go under a
  mandatory "metric review" section, and any revision
  applies to the NEXT run, never this one.

DETGATE (pre-sweep STOP gate): seed 75101, baseline (plain
tableseat-nowait, no recorders) vs wrapped (ALL recorders
composed, every on-switch UNSET, including TBOVERTIME):
days, gameDays, and tsNationalDay must be equal, with no
diag ctx surface and no wraps installed (including no
_tbovertimeDiagInstalled flag). The prior-base numbers
were 132/132 days, tsNationalDay 77. If base drift moved
them, prove same-base neutrality the way
sim-fighterconstruct-a did and disclose old vs new
numbers loudly; never force old numbers. A detgate FAIL
(baseline != recorders-OFF on this base) stops the
judged sweep.

PARITY RULE (binding, do not soften): judge parity ONLY
against evidence/2026-10-28/perseed-fighterconstruct-a/
(the immediate predecessor, same substrate + the
fighterconstruct layer, plus the new tier recorder).
Per-seed days, gameDays, won, waveReach, nationalEver/
Final, table, entered, deathTotal, courtship combined,
AND wave-4 nonworldkill starts must match, or the
divergence must be diagnosed with a detgate PASS proving
recorder neutrality (base drift is then the diagnosis,
stated with the per-seed diffs — never hidden, never
re-scored against a retired corpus). NEVER re-score the
w4tbhp, w4damage, w4convert, or fighterconstruct verdicts
or corpora.

SUBSTRATE-ACTIVATION GATE (binding, same as predecessors):
band courtship combined > 0 AND >= 6/8 seeds with non-zero
combined courtship. If the gate FAILS, the sweep is
INVALID (not NO-GO): no verdict is judged, the failure is
reported loudly, and the run stops for an env fix.
Expected from the fighterconstruct band: combined 121,
8/8 active.

SENSE RULE (binding): read the 75103 d178 scaled suburb
fight's window in plain words (NON-MEASURED replay; the
replay trajectory shift is stated, not hidden) and judge
whether the scaling reads coherently in narration — does
the game ever tell the player WHY this monster is at
3688? The RERUN line from overtimeScaleFight is the
candidate telling; the sense note reports whether it
fires in the trace, verbatim or not at all. Sense text
never enters any count.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
pilot for a census. If its completeness gates pass, it is
the judged band. If parity fails, that is a diagnosis to
report, not a reason to re-sweep fresh seeds silently.
If the gap is a pure instrument bug that can be fixed
and re-proved, the fix, the re-proof, and the re-sweep
are all disclosed, and the original failed pilot rows
are kept, never overwritten silently.

## Balanced panel (§15) and telemetry

BALANCED PANEL: NOT attempted, per the task's standing
exception — scripts/balance-panel.js has NO corpus-ingest
mode for a single-arm census corpus (the tool builds
panels from live roots, not census rows). No panel
artifact will be faked; the paired sweep-compare tables
(this analyzer's output, analysis.json, parity vs the
fighterconstruct corpus) are the section-15 substitute,
as in the predecessor rounds.

TELEMETRY DEVIATION CHECK (loop body step 10): run AFTER
writing evidence (telemetry-check.js vs scale-wall
baseline, metrics national,table,wins,exiled, current glob
evidence/2026-10-28/perseed-tbovertime-a/*.json), report
LOUD lines with verdict, do NOT roll the baseline on an
unexplained LOUD line.

## No confirm band unless needed

No confirm band is pre-registered. If the verdict needs
one (e.g. a borderline join that a second seed band
would settle), pre-register it in a prereg amendment
BEFORE running it, with its own GO threshold — never run
it first and justify later.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
