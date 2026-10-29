# sim-tbovertime2-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261029T1615Z. Axis: scale-onramp
(the blocking axis, converging, NOT converged). Worker:
sim-tbovertime2-a. This arm answers the verdict tbovertime-a
left explicitly open: TIER-2+ OVERTIME UNMEASURED.

Worktree: `~/workspace/worktrees/sim-tbovertime2-a` (branch
sim-tbovertime2-a). Base: pinned HEAD
ca9a7569e0fae7ff2b62f50f952edc5a69e495ce (worktree HEAD at
prereg time; contains the world-HP TB rule from
sim-w4tbkill-a). NOTE the known hazard stated in the task:
funnel-a / departlag-a lag values are KNOWN-STALE on
current master after the build-armor seed-bark + fix-all
armor change — this arm does NOT quote them as current,
and does not judge any corpus whose base it has not
pinned. This corpus's base is the pinned commit above.

MEASUREMENT ONLY — zero src/js changes, zero game-behavior
changes, zero default flips, zero roster/list feed into
any decision (PERCEPTION LAW, Steve 2026-10-28: this arm
records only, it never feeds a roster or list into a
decision). No game lever, no balance change proposed or
landed. Documentation IS the deliverable: the tier-2+
construction -> start -> end decomposition table, split by
tier, and the extension (or correction) of tbovertime-a's
sentence to tier 2+. If a lever suggests itself, it is
named as a future arm, not implemented.

Do NOT touch gating code or deed bars (Steve 2026-10-27
gating freeze stands). Do NOT touch any sibling
worktree, registry entry, loop-B tree, or build lane
(build-returns, build-geartier, build-staying). Do NOT
write or delete any claim file or lock file (coordinator
owns them). Do NOT append to sim-findings.md (findings
go in this arm's report to the coordinator).

## The question (why this arm exists)

sim-tbovertime-a (evidence/2026-10-28/sim-tbovertime-a.md,
base 3cb5f8b82) proved on 24/24 fights that a turn-based
fight NEVER grows a monster's health ceiling in-fight —
the only construction -> end increases were 2 TIER-1
pre-fight overtime fights (+463 maxHp, +345 HP, 0 crew).
Its verdict explicitly leaves TIER-2+ OVERTIME UNMEASURED:
0 tier-2+ fights, 0 crew packmates on its band, so the
packmate injection (floor(t/2) extra fighters) and the
tier 4/6 scaling the old base showed have no
current-master measurement. This arm measures them.

## Why the substrate changes (and why that is not a re-score)

tbovertime-a used tableseat-nowait, which SITS when the
seat is ready — so the overtime clock (which runs only
while the table exists, the seat is not none, and the
village has NOT sat) almost never survives past tier 1:
only 75106, which never got a table preview, reached
tier 1 at all. To reach tier 2+, the village must stay
unseated after the table exists. This arm therefore uses
the leanlinkrescue courtship with NO seat drive:
tableseat-nowait with TABLESEATNOWAIT UNSET, whose daily
delegates to leanlinkrescue with no seat behavior at
all. That is a POLICY-SIDE measurement substrate only
(env unset in normal play, zero src/js): the village
reaches the table and waits, so the overtime clock runs.
Trajectories WILL diverge from tbovertime-a after the
seat point — expected, disclosed, never hidden, and
never treated as a parity failure (see Parity below).
Wall numbers on this band are substrate artifacts by
construction (wins require sitting, so wins = 0 is the
substrate, not a regression; table entered = 0 likewise)
and are reported with that caveat, never pooled with
seated bands.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
  the Mirror Draft, bands damage 35-95, HP 850-1500,
  pierce 0.2-0.5; wave 5 = the Producers, HP 1000-2200;
  gate village standing >= 100 / >= 200 + wave-4
  faced). Overtime canon from code (src/js/overtime.js,
  titans.json _overtime: daysPerTier 7, maxTier 6,
  hpPerTier 0.25, dmgPerTier 0.12, packEveryTiers 2,
  minWave 4): every 7 unseated days raises a tier, cap
  6; overtimeScaleFight runs as a wrapper AFTER
  startCombat returns (so AFTER the fighter-construction
  snapshot and AFTER opening turns inside startCombat):
  it sets f.otTier = t, injects floor(t/2) packmates
  via campaignInjectMonster, then for every monster
  fighter multiplies hp and maxHp by hpM = 1 + 0.25*t
  (rounded), and says the RERUN line. It skips titans,
  campaign nodes, waves below 4, and active-table
  fights.
- docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot
  gate, death-aware horizons, pre-registration, metric
  binding, balanced panels).
- No canon invented. Where code and canon wording
  differ, the code reading governs and the difference
  is reported.

## Corrected identity discipline (MANDATORY, from tbovertime-a)

Opening turns run BEFORE the overtime wrapper scales
post-opening HP, so construction-HP == maxHp was
FALSIFIED by the world-HP rule. This analyzer re-derives
fight identity EXACTLY as tbovertime-a's corrected
analyzer does, and fails loudly if its identity
derivation disagrees with tbovertime-a's on the tier-1
control cases before judging any tier-2+ fight (see
Control leg below). The binding identities, per fight
(C = construction m_0 HP, Cmax = construction m_0
maxHp, S = start m_0 HP, Smax = start m_0 maxHp,
E = end m_0 HP, Emax = end m_0 maxHp, T = tile HP,
t = direct tier record, opening = fighterconstruct
opening tbDamage sum for m_0):

- predicted Smax = round(Cmax * (1 + 0.25*t)) exactly.
- predicted S = round((C - opening) * (1 + 0.25*t))
  exactly (opening damage first, THEN scaling).
- inferred tier t_inf = round((Smax/Cmax - 1) / 0.25);
  must equal t_rec, and tier pre == post == end.
- overtimeHpGain = S - (C - opening) (scaling applied
  to post-opening HP).
- preFightScalingMax = Smax - Cmax.
- inFightChange = E - S; inFightMaxGrowth = Emax - Smax
  (predicted 0 on every fight; any nonzero row is
  cited with its mechanism or as unexplained).
- tile -> end: E - T = (C - T) + (S - C) + (E - S).
- construction -> end: E - C = overtimeHpGain -
  opening + inFightChange.
- A failed identity on any judged fight is a hard
  analyzer failure, not a rounding note.

## Definitions (binding — the analyzer implements exactly these)

- UNIT (judged set): one world-origin TB fight, wave 4
  OR 5 (overtime's minWave is 4, so both waves scale;
  the old corpus carries 0 wave-5 world-origin TB
  fights, verified 2026-10-29, so the wave>=4 unit
  reproduces the tbovertime-a wave-4 table exactly on
  the old corpus), origin == 'world-origin', not
  refused (pre.liveFight false), not a table trial,
  with direct tier record t_rec >= 2.
- CONTROL SET (tier-1 reproduction): the tbovertime-a
  corpus fights (wave 4 only, as published) re-analyzed
  by THIS analyzer — see Control leg.
- PRIMARY FIGHTER: m_0 (the w4tbhp / fighterconstruct
  vocabulary). Crew fighters (m_crew_*, overtime
  packmates and any network-campaign injections) are
  reported as a secondary pool (counts, start/end HP,
  start->end change) but never folded into the m_0
  decomposition. Crew have NO construction row (they
  are injected by the wrapper AFTER startCombat, so
  after the construction snapshot) — crew are reported
  start -> end only, and that limitation is stated,
  never papered over with an inferred construction.
- CONSTRUCTION: fighterconstruct construction snapshot
  for the same fightId (first tbAdvance entry inside
  that startCombat call): m_0 hp/maxHp, read
  separately (never assumed hp == maxHp).
- START: nonworldkill post-startCombat snapshot for
  the same fightId: m_0 hp/maxHp (post-opening-turns
  AND post-overtime-scaling, by wrap order).
- END: tbdmg tbEnds snapshot for the same fightId
  (pre-tbEnd): m_0 hp/maxHp, plus the tbEnd result and
  round. A fight with no tbEnd row, or with two, is
  UNJOINED, never estimated.
- TILE: nonworldkill start.tileMonster hp/maxHp (the
  world monster on the player tile at lift).
- OVERTIME TIER AT FIGHT TIME: the tbovertime-diag
  record, reused verbatim: Game.overtimeTier() read at
  startCombat pre, at startCombat post, and at tbEnd
  pre, plus f.otTier and each fighter's otTier flag at
  post. Direct record and inferred tier must agree
  (t_rec == t_inf) AND startMax must equal
  round(Cmax * (1 + 0.25*t_rec)) exactly.
- TIER SCOPE (decided here, not expanded mid-run):
  judged tiers are 2, 3, 4, 5, 6 — tier 4/6 scaling IS
  in scope because the prereg says so and the
  instrument supports it (direct tier record to cap 6,
  ratio check at any tier, crew reporting). A tier-4/6
  sub-claim is judged ONLY if a tier-4+ fight is
  observed; if none is observed, tier 4/6 stays
  documented-unmeasured, never claimed from tier-2/3
  fights. Tier 0/1 fights on this band are reported
  as context (counts + aggregates) but are NOT the
  judged set.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, MEASUREMENT: leanlinkrescue courtship
  via tableseat-nowait with TABLESEATNOWAIT UNSET
  (daily delegates to leanlinkrescue, no seat
  behavior), env LEANLINKRESCUE=1, PLUS recorder
  on-switches RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1,
  W5BIRTHS=1, DEFWOUND=1, NONWORLDKILL=1, TBDMG=1,
  W4DMG=1, FIGHTERCONSTRUCT=1, TBOVERTIME=1.
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js,
  any existing recorder file, or any src/js file. New
  instruments only (one sweep copy, one analyzer copy,
  one sense script copy; the tbovertime-diag recorder
  is reused verbatim, not copied).
- Recorders reused verbatim, policy-side only:
  raftdraft-diag, spawnsrc-diag, oldcore-diag,
  w5births-diag, defwound-diag, nonworldkill-diag,
  tbdmg-rebase-diag, w4damage-diag,
  fighterconstruct-diag, tbovertime-diag. No recorder
  draws RNG, throws into the engine, or returns
  anything but the original value.

## Instruments (COPIES ONLY, originals untouched)

- scripts/test-tbovertime2-sweep.js (copy of
  test-tbovertime-sweep.js), differing ONLY in:
  corpus dir
  (evidence/2026-10-29/perseed-tbovertime2-a), labels,
  the loadGame mode label, require-path renames, and
  the substrate env (TABLESEATNOWAIT never set, so
  the seat legs stay off; LEANLINKRESCUE=1). Verified
  by diff before the judged sweep: every changed line
  is one of those renames/additions/substrate-env;
  no logic, channel rule, gate, or recorder wiring
  changed.
- scripts/test-tbovertime2.js (copy of
  test-tbovertime.js, corrected identity logic carried
  over verbatim), differing ONLY in: corpus dir,
  labels, SEEDS default (same band), unit wave filter
  (4 or 5, vs 4 only — see Definitions), tier-split
  aggregates (per-tier rows for tiers 0-6, judged
  tier>=2 set reported separately), crew start->end
  reporting, and a --control mode that runs the
  analyzer against the tbovertime-a corpus with the
  wave-4 filter and prints the control comparison
  against the published aggregates. Unit checks
  extended with a synthetic tier-2 case (constr 1000,
  tier 2 -> startMax 1500, crew 1) alongside the
  existing synthetic tier-6 case (1475 -> 3688).
- scripts/test-tbovertime2-sense.js (copy of the
  tbovertime sense script, labels + beat filter only):
  NON-MEASURED narration replay only, seed + window
  set AFTER the corpus exists to the band's first
  tier>=2 scaled fight (+/- 10 days, capped at the
  seed's end day); if no tier>=2 fight exists, the
  sense leg is vacated and the sense script is not
  run as a judged leg (a tier-1 replay would prove
  nothing this arm has not already got from
  tbovertime-a). Sense is a supporting note, not a
  verdict leg, except for the existence condition in
  leg (f) below.

## Corpus

- evidence/2026-10-29/perseed-tbovertime2-a/
  s<seed>-armed.json (8 rows), plus summary.json from
  the sweep's --summary mode, plus analysis.json from
  the analyzer's --out mode, plus sense-<seed>.txt
  (NON-MEASURED, only if a tier>=2 fight exists).
- The sweep runs on the pinned base with the
  instruments above. Wall numbers are reported for
  THIS band only, never pooled with any other band,
  and with the substrate caveat (wins/table-entered
  are 0 by construction).

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the construction -> start -> end decomposition
for world-origin wave-4/5 TB fights at overtime tier
>= 2, split by tier, with crew start -> end reported.

DIAG-GO RULE (MEASUREMENT, judged ONLY against this
prereg):
  DIAG-GO = (a) 8/8 seeds complete with clean recorders
  (row per seed, days > 0, every recorder clean: errs
  0, no overflow) AND substrate gate passes (courtship
  combined > 0 AND >= 6/8 seeds with non-zero combined
  courtship; a substrate-gate FAIL makes the sweep
  INVALID, not NO-GO: no verdict judged, failure
  reported loudly, run stops for an env fix)
  AND (b) CONTROL REPRODUCTION EXACT: this analyzer,
  in --control mode on the tbovertime-a corpus
  (evidence/2026-10-28/perseed-tbovertime-a, seeds
  75101-75108, wave-4 filter), reproduces tbovertime-a's
  published result exactly: 24/24 joined, tier counts
  0x22 / 1x2, preFightScalingMax 463, overtimeHpGain
  345, openingDamage 71, inFightChange -3187,
  inFightMaxGrowth 0, scaled fights 2, scales-up set 2
  with constrToEnd +288, crew 0, 0 tier disagreements,
  0 opening disagreements, 0 identity failures. ANY
  disagreement is a FAIL-LOUDLY stop: no tier-2+
  verdict is judged until the identity derivation is
  fixed and the control re-proved (fix + re-proof +
  re-sweep all disclosed; the original failed run's
  output is kept, never overwritten silently)
  AND (c) DETGATE PASS on this base (seed 75101,
  baseline plain tableseat-nowait with LEANLINKRESCUE=1
  and TABLESEATNOWAIT unset vs wrapped with ALL
  recorders composed and every on-switch UNSET:
  days, gameDays, and ts* equal, no diag ctx surface,
  no wraps installed). A detgate FAIL stops the judged
  sweep.
  AND (d) TIER>=2 JOIN: the judged set has n >= 3
  joined fights AND join >= 95% of all tier>=2
  world-origin wave-4/5 TB fights on the band AND 0
  unexplained recorder gaps (every unjoined fight,
  tier disagreement, opening-sum disagreement, or
  failed sum identity counted and cited — a
  counted-and-cited gap still fails the 0-gap leg;
  the evidence then judges DIAG-NO-GO with the gap
  named, never re-scores it away)
  AND (e) a decomposition table by tier (per fight and
  in aggregate for tiers 2-6, plus crew start->end)
  AND a sentence stating whether tier-2+ scaling
  behaves the same as tier 1 (pre-fight scaling only,
  in-fight maxHp growth 0, packmates scaled like m_0)
  or how it differs, per tier where observed (or a
  verdict that the two cannot be separated with these
  instruments, with the exact blocker named)
  AND (f) a sense read of at least one tier>=2
  overtime fight transcript end to end, judging
  whether the scaling reads coherently in-world.
  DIAG-NO-GO = (d) join < 95% or any unexplained gap
  with n >= 3, or no decomposition table, or no
  sentence / separation verdict.
  INSUFFICIENT-DATA = n = 0 tier>=2 fights on the band
  (rarity itself is the measured result — NOT a reason
  to silently widen tiers, bands, horizons, or
  substrates mid-run), or 1 <= n < 3 (mechanism note
  only: the observed fights are tabulated and the
  sentence is qualified as n-fight evidence, never a
  general claim), provided (a), (b), (c) pass. A
  complete join showing zero in-fight maxHp growth on
  >= 3 tier>=2 fights is a DIAG-GO with that finding
  stated plainly — it is the extension, not a failure.
  No re-scoring mid-run; metric doubts go under a
  mandatory "metric review" section, and any revision
  applies to the NEXT run, never this one.

PARITY RULE (binding, diagnostic only): parity vs the
tbovertime-a corpus is EXPECTED TO DIVERGE after the
seat point because the substrate changed (no-seat vs
seat-when-ready) — it is printed, never gated, and
never re-scored against a retired corpus. Recorder
neutrality on THIS base is proved by the detgate (c)
plus a same-base determinism re-run (one seed
re-run into a scratch dir, byte-identical row diff,
scratch removed after — see Proofs), not by parity
with the old corpus.

SUBSTRATE-ACTIVATION GATE (binding, same as
predecessors): band courtship combined > 0 AND >= 6/8
seeds with non-zero combined courtship. If the gate
FAILS, the sweep is INVALID (not NO-GO): no verdict
is judged, the failure is reported loudly, and the
run stops for an env fix. Expected from the
tbovertime-a band: combined 110, 8/8 active (seated
substrate — this band's numbers will differ; only
the > 0 / >= 6/8 gate binds, not the old totals).

SENSE RULE (binding): if a tier>=2 fight exists, read
its window end to end in plain words (NON-MEASURED
replay; the replay trajectory shift is stated, not
hidden) and judge whether the scaling reads
coherently in narration — does the game tell the
player WHY this monster is at its scaled HP, does
the RERUN line fire, does the pack read as a pack?
Sense text never enters any count.

PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band
IS the pilot. If its completeness gates pass, it is
the judged band. If tier>=2 fights are too rare on
this band to judge, that is an INSUFFICIENT-DATA
verdict per (d) above — not a reason to silently
widen tiers or bands. A second band, if ever needed,
is pre-registered in a prereg amendment BEFORE
running it, with its own GO threshold — never run
first and justified later.

## Balanced panel (§15) and telemetry

BALANCED PANEL: NOT attempted, per the task's standing
exception — scripts/balance-panel.js has NO
corpus-ingest mode for a single-arm census corpus (the
tool builds panels from live roots, not census rows).
No panel artifact will be faked; the paired
sweep-compare tables (this analyzer's output,
analysis.json, control comparison vs the tbovertime-a
corpus) are the section-15 substitute, as in the
predecessor rounds.

TELEMETRY DEVIATION CHECK (loop body step 10): run
AFTER writing evidence (telemetry-check.js vs
scale-wall baseline, metrics national,table,wins,
exiled, current glob
evidence/2026-10-29/perseed-tbovertime2-a/*.json),
report LOUD lines with verdict, do NOT roll the
baseline on an unexplained LOUD line. (Expectation,
stated in advance: wins/table LOUD lines are
substrate artifacts — this band never sits by
construction — and the tbovertime-a precedent shows
the field-shape artifact (per-seed rows carry
nationalEver/entered/won, not top-level paths;
summary.json + analysis.json inflate n). A LOUD line
is investigated against those two known causes
before any other conclusion.)

## Proofs (as tbovertime-a did)

- Analyzer + fixtures (synthetic tier-2 and tier-6
  unit checks inside the analyzer; exit 1 on any
  unit-check failure).
- Sense (above, NON-MEASURED, only if a tier>=2
  fight exists).
- Determinism: byte-identical re-run of one seed
  into a scratch dir (inside the worktree, NOT /tmp
  — sibling cleanup wipes /tmp), row diffed against
  the corpus row ignoring only stack-trace audit
  lines if any (tbovertime-a precedent: the detcheck
  differed ONLY in stack audit lines, never a game
  field; a game-field diff is a FAIL), scratch
  removed after the diff is recorded.
- Parity/detgate: wrapped-all-OFF identical
  (detgate leg (c)); no new surfaces when recorders
  are off (detgate checks diag ctx surface + wraps
  installed flags, including _tbovertimeDiagInstalled).

## No confirm band unless needed

No confirm band is pre-registered. If the verdict
needs one (e.g. a borderline join that a second seed
band would settle), pre-register it in a prereg
amendment BEFORE running it, with its own GO
threshold — never run it first and justify later.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
