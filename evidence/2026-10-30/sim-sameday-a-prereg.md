# sim-sameday-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1015Z (coordinator-assigned
worker sim-sameday-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). Ranked-next #1 from run fleshout-20261030T0855Z
(evidence/2026-10-30/sim-scale-onramp-round-0855.md) and scholarmelt
ranked-next #2 (evidence/2026-10-30/sim-scholarmelt-a.md).
DIAG ONLY, measurement only, zero src/js game changes, no default flip,
no gate move, no deed-bar move. No [needs-eyes] (diag only, nothing
for Steve to playtest).

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft;
standing >= 100 gate; bands damage 35-95, HP 850-1500). NO CANON-registered
doc covers a same-day scholar-fight matching window — the window below
is measurement-defined from code-read engine behavior, stated exactly
so it can be checked, and is NOT canon. Governing canon rules: CANON.md
"Monster encounters are fought, not rolled" and the perception law
(Steve 2026-10-28): tile-mate presence is REPORTED from recorded state
only, never fed into any decision.

## Target case (verbatim from prior arms, never re-worded into a verdict)

s75102 algorithm 959 — removal seq 47, d71, startCombat, fightSeq 21,
d71, lift 959, lost, no restore; removal day equals the chain's last
meeting day, so scholarmelt judged it INSUFFICIENT-DATA under a
strictly-after window, while removal-a classified it SCHOLAR-MELT
(EDGE). This arm decides, under the NEW window below, whether that
chain promotes to primary SCHOLAR-MELT or honestly stays
INSUFFICIENT-DATA, with the ordering proof stated. Scholarmelt's own
verdict is NOT re-scored here: it stands under its prereg; this arm's
verdict is a NEW judgment under a NEW prereg, and the evidence file
says which prereg each verdict belongs to.

## Band and substrate (binding)

- Seeds 75101-75116 (16, the chainclose/recurrence/scholarmelt/removal
  band), 180d death-aware horizon (dead villages stop simulating;
  +10d tail max per MEASUREMENT.md §10).
- Policy: scripts/policies/tableseat-nowait.js VERBATIM.
- Game substrate env (verbatim from chainclose/scholarmelt/removal):
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1,
  BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, JOINENDLINES=1, plus the
  record-only switches SCHOLARMELT=1, REMOVAL=1, SAMEDAY=1 (new
  recorder only; no game behavior reads any of the three — proven
  non-perturbing by the prior arms' substrate legs, and re-proven
  here by the row byte-identity leg).
- Recorder stack, reused VERBATIM (never edited — the final worktree
  diff must show zero changes to these files): fieldparty-form-diag,
  w4dpr-diag, breakline-diag, tilejoin-diag, shoutrec-diag,
  joinendlines-diag (the chainclose six), plus scholarmelt-diag and
  removal-diag (both reused verbatim, so this corpus carries the
  scholar-fight census and the removal rows in the SAME run instead
  of cross-referencing a different run's corpus — cross-references
  to the committed scholarmelt/removal corpora are still reported
  as a consistency check, never as the judged evidence).
- This arm's ONLY new code: scripts/policies/sameday-diag.js (the
  part/sequence-stamp recorder below), scripts/sweep-sameday-a.js
  (a verbatim copy of scripts/sweep-removal-a.js with exactly the
  deltas disclosed below), scripts/analyze-sameday-a.js (a pure
  analyzer: reads corpus JSON, never touches game state; chains via
  the REQUIRED buildChains from scripts/analyze-chainclose-a.js —
  never re-implemented, never edited there; fates via the REQUIRED
  censusMatch/classifyFate from scripts/analyze-recurrence-a.js —
  never re-implemented; scholar-fight classification via the
  REQUIRED classifyFight from scripts/analyze-scholarmelt-a.js —
  never re-implemented, never edited there), and
  scripts/test-sameday-a.js (fixtures + determinism check).
- Sweep deltas vs sweep-removal-a.js (all else identical):
  (a) default EVID dir perseed-sameday-a; (b) scholarmelt recorder
  installed at setup + daily hook (AFTER the other recorders, so
  its startCombat wrap sits inside the sameday wrap — see below),
  serialized as the additive `scholarmelt` row field, with the
  sweep-end finalize from the scholarmelt sweep (dissolved-flush
  after runDays); (c) removal recorder installed as in the
  removal sweep, serialized as the additive `removal` row field,
  with the removal sweep's enriched census (uid, wave, maxHp,
  veteran, lingering, titan, stance, lostSight, mx, my) written
  to census-s<seed>.json beside (never inside) the row; (d)
  sameday recorder installed at setup + daily hook AFTER
  scholarmelt (so for startCombat the sameday wrap is outermost:
  its pre-record runs before scholarmelt's pre-record, its
  post-record after — the stamp is taken at fight-start entry,
  before any fight state changes; for fieldFight the sameday
  wrap is outermost over the w4dpr/fieldparty wraps for the
  same reason), serialized as the additive `sameday` row field.
  The row minus the three additive fields (`sameday`,
  `scholarmelt`, `removal`) must be byte-identical to
  chainclose's row per seed.

## The sameday recorder (what it observes, read from code)

The engine DOES record a day-part: Game.dayPart is 0 dawn, 1 midday,
2 dusk, 3 night (game.js advancePart comment and the 0/1/2/3
dayPart clock; advancePart is called ONLY from tickAction's
boundary crossing, 4 parts per day). This arm does NOT fabricate a
day-part: the stamp carries the engine's own Game.dayPart value
(numeric, primary) plus its name from that same 0-3 clock
(dawn/midday/dusk/night). Because two events can share one part,
the stamp ALSO carries a global event sequence number assigned by
this recorder at observation time: a per-seed counter incremented
on every stamped event, in the order the recorder's pre-records
execute. Node sims are single-threaded, so pre-record execution
order IS engine event-entry order for the two wrapped entry
points. Sequence order within a day is therefore the stamp when
day-parts tie, and the day-part is the human-readable phase when
they differ. Both are recorded on every event; neither is
inferred after the fact.

Wraps (record-only: reads state, draws no RNG, writes no game
state — store arrays + a module-side counter only — never throws
into the engine, returns the original value untouched):

- fieldFight (vid, mdef, m, opts): pre-record assigns seq and
  stamps (day = scholar day, dayPart = Game.dayPart, partCounter
  = this recorder's own advancePart count at that moment, vid,
  mid, mHpStart); post-record fills mHpLeft, outcome, rounds,
  mDealt from the returned rec (same fields w4dpr reads). A
  thrown call is recorded with threw=true and rethrown unchanged.
- startCombat (args): pre-record assigns seq and stamps (day,
  dayPart, partCounter, intendedMid = arg or pendingMonsterId or
  'bulldozer', tile monster snapshot via monsterAt(map.px, map.py)
  with scholar mx/my fallback — the same pure scan scholarmelt
  uses, never playerMonster()); refused calls (a fight already
  live) are stamped as kind 'scholar-fight-refused' and lift
  nothing. Post-record adds nothing ordering-relevant (the stamp
  is the pre-record; a fight's start moment is its entry).
- advancePart: post-call increment of this recorder's
  partCounter only (same pattern as w4dpr's advancePart wrap;
  the counter is an auxiliary monotonic clock, never a claim
  about w4dpr's counter — the two counters start at different
  install moments and are never equated).

Store shape: { events: [...], errs, errors, overflow, installed,
partCounter }. One events array, in seq order, so the ordering
proof is readable off the array itself: event kinds are
'field-meeting', 'scholar-fight-start', 'scholar-fight-refused'.

Join rules (asserted by the analyzer, never assumed):
- Meeting join: sameday field-meeting events, in order, join to
  w4dpr meetings, in order, by index AND (day, vid, mid,
  mHpStart) at every index. Any mismatch is a join error.
- Fight join: sameday scholar-fight-start/refused events, in
  order, join to scholarmelt meetings filtered to non-orphan
  kinds (start/refused), in order, by index AND (dayStart,
  intendedMid, lift id/hp where a lift snapshot exists) at
  every index. Orphan-end rows have no start and are excluded
  from this join by construction (they are tbEnd-only rows).
- A join error on the judged chain's meeting or fight is a
  leg failure (ORDER-UNPROVEN, see below). Band-wide join
  errors are reported; the leg bar is 0 band-wide (the pilot
  must catch a systematic join bug before the judged sweep).

## Universe and definitions (binding, fixed here)

- CHAINS / CHAIN ENDS: exactly as scholarmelt/removal (wild
  field-channel wave-4 chains, buildChains + censusMatch +
  classifyFate, required modules). Judged universe for the
  new-window question is the BEAST-VANISHED set, expected to
  be the same 4 pairs as scholarmelt/recurrence; a different
  set is a substrate divergence, reported before judging.
- SCHOLAR-FIGHT FATES: exactly as scholarmelt (classifyFight,
  required module, priority order incl. dissolved-restored-first).
- NEW MATCHING WINDOW (this arm only, never back-applied to
  scholarmelt's verdict): a scholar fight matches a vanished
  chain iff ALL hold: same seed AND same mid; lifted == true;
  lift.hp == chain remainingHp; dayStart in [lastDay,
  firstAbsentDay] inclusive (lastDay = chain's last meeting
  day; firstAbsentDay = first post-lastDay census snapshot day
  NOT containing the (mid,hp) instance; if firstAbsentDay is
  null, the upper bound is the final snapshot day); the
  primary fighter is not a veteran (veteran hp is a fresh
  roll, never matched); AND, when dayStart == lastDay
  (the same-day case), the STAMPED-ORDER rule below holds.
  Fights with dayStart > lastDay match exactly as under the
  old window (day order already proves meeting-before-fight);
  their stamps are still reported as corroboration when both
  stamps exist.
- STAMPED-ORDER RULE (same-day only): let M be the sameday
  field-meeting event joined to the chain's LAST meeting
  (same day, same vid/mid/mHpStart as the w4dpr meeting) and
  F be the sameday scholar-fight-start event joined to the
  candidate fight. Promotion requires: M.day == F.day ==
  lastDay AND M.seq < F.seq AND M.dayPart <= F.dayPart.
  If either stamp is missing: ORDER-UNPROVEN (no promotion).
  If M.seq > F.seq, or M.dayPart > F.dayPart: ORDER-CONTRADICTION
  (no promotion; the contradiction is reported, never smoothed).
  If M.seq < F.seq and M.dayPart <= F.dayPart: ORDER-PROVEN.
- A matched fight's fate IS the chain's new-window verdict:
  SCHOLAR-FLEE-MELT or DISSOLVED-MELT => SCHOLAR-MELT
  (primary, same-day stamped when dayStart == lastDay, else
  primary as under the old window); SCHOLAR-KILL =>
  scholar-kill; any other fate => OTHER with the fate named.
  No matched fight => INSUFFICIENT-DATA under the new window,
  with the reason named (no candidate / hp-mismatch /
  ORDER-UNPROVEN / ORDER-CONTRADICTION).
- NEAR-MISS reporting (never matched, always disclosed):
  scholar fights on the same seed+mid with dayStart in
  [lastDay, firstAbsentDay] that fail exactly one match rule,
  each with the failed rule named — including same-day
  fights that fail ONLY the stamped-order rule.
- REMOVAL CROSS-REFERENCE (corroboration only, never the
  verdict): the removal row for the algorithm chain (prior
  arms: seq 47, d71, startCombat) is re-found in THIS
  corpus's own removal events and quoted. The verdict rests
  on the scholarmelt fight + the stamp order, not on the
  removal row: a removal row alone does not promote a chain
  (removal already classified it EDGE under its own window).

## Primary metric (binding)

SAME-DAY WINDOW DECISION FOR THE ALGORITHM CHAIN: under the new
window above, does s75102 algorithm (remaining HP 959, last
meeting d71, firstAbsentDay 72) promote to primary SCHOLAR-MELT
or honestly stay INSUFFICIENT-DATA? The decision must cite:
the candidate fight (fightSeq, dayStart, result, fate, lift hp,
fighter hp path, restore check), the meeting stamp (seq, day,
dayPart + name, partCounter, vid, mHpStart/mHpLeft), the fight
stamp (seq, day, dayPart + name, partCounter), and the
ORDER-PROVEN / ORDER-UNPROVEN / ORDER-CONTRADICTION judgment
with the comparison stated numerically (M.seq vs F.seq,
M.dayPart vs F.dayPart). A same-day fight counts as a melt
ONLY when the meeting log provably precedes the fight start
in the stamped order; a fight with no provable preceding
meeting on that day does NOT promote the chain — it is
reported as such, never force-matched.

## GO bars (binding — judge against this header)

- PREREG: this file committed before any judged analysis.
- PILOT GATE (before the full 16-seed sweep): fixtures green +
  1-seed determinism (seed 75102 row + census byte-identical
  on re-run, scratch removed) + substrate byte-identity vs
  the chainclose corpus on the pilot seed (row minus the
  three additive fields). Kill fast if the sameday instrument
  cannot observe both event kinds on the pilot seed, or if
  either join has an error on the pilot seed.
- SEEDS: 16/16 valid (row days > 0, all recorder errs 0,
  no overflow, census present/sorted/within-1 of row days).
- SUBSTRATE: every row minus `sameday`, `scholarmelt`,
  `removal` byte-identical to chainclose's row for the same
  seed (16/16). Census stripped to (id,tx,ty,hp) equals
  recurrence's census per seed is reported as a diagnostic
  (the enriched census carries a superset of fields in the
  same snapshot order); a stripped-census difference is
  investigated, but the blocking substrate leg is the row
  byte-identity, as in the removal arm.
- SAMEDAY JOINS: meeting join errors 0 band-wide AND fight
  join errors 0 band-wide (see join rules above).
- ALGORITHM DECISION: the algorithm chain gets either a
  primary SCHOLAR-MELT verdict (with ORDER-PROVEN stamps)
  or an INSUFFICIENT-DATA verdict with the missing
  instrument / failed rule honestly named (ORDER-UNPROVEN,
  ORDER-CONTRADICTION, or no candidate). A verdict with no
  stamp evidence cited is a leg failure, not a verdict.
- OTHER-CHAINS RE-JUDGMENT: all 4 vanished chains are
  re-judged under the NEW window only (old-window verdicts
  quoted from the committed scholarmelt analysis, never
  recomputed as if they were this arm's); every verdict
  change vs scholarmelt is listed explicitly, and a
  no-change chain is listed as no-change with its reason
  (e.g. suburb still fails hp-exact: lift 960 vs chain
  1285 — its uid/toll identity proof belongs to removal,
  not to this window, and is NOT imported as a promotion).
- DETERMINISM: 1 seed (75102) scratch re-run, row + census
  byte-identical, scratch removed in a finally block
  (never /tmp for sweep outputs — scratch under
  evidence/2026-10-30/ and removed).
- SENSE: the judged chain's villager logs (w4dpr rec.log,
  all 4 algorithm meetings, with the d71 meeting read in
  full) + the matched scholar trace row read end to end,
  judged for meaning and coherence, never counts alone.
  Node-sim stubs Game.say to no-op, so scholar-trace
  evidence is the structured trace, stated here.
- FIXTURES: scripts/test-sameday-a.js green — covering:
  the new-window match function (strict-after match,
  same-day match with ORDER-PROVEN stamps, same-day
  ORDER-UNPROVEN (missing stamp), same-day
  ORDER-CONTRADICTION (seq reversed and dayPart reversed),
  hp-mismatch, veteran non-match, out-of-window),
  the stamp join comparators (meeting and fight joins,
  including orphan exclusion), the byte-identity comparator
  (row minus three additive fields), and chain grouping
  through the REQUIRED buildChains (cross-seed separation).
- VERDICT: DIAG-GO iff ALL bars above are met, else
  DIAG-NO-GO reported honestly, never softened. A miss is
  NO-GO, never re-scored against a friendlier metric
  mid-run (MEASUREMENT.md §14); metric doubts go under
  "metric review" for the NEXT run.
- NO lever verdict: this arm does not propose a melt fix,
  gate move, or any game change. Its verdict is about the
  measurement (the same-day decision, proved per chain),
  not about building to it.

## Wall numbers (report-only, if computable)

Same convention as the prior arms from this corpus's own
rows: wins (lesser/full), national ever/final, table
reached/entered, wave reach, median survival, death total.
Report-only: no lever is judged on them here.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (recorder + sweep + analyzer + fixtures),
   committed before the judged sweep is analyzed (fixture
   bar green first).
3. Pilot gate (seed 75102), then sweep (16 seeds),
   determinism gate (one seed, scratch dir, removed after
   diff), sense logs read per the bar above.
4. Evidence evidence/2026-10-30/sim-sameday-a.md with a
   prereg-legs table, the algorithm decision with stamps
   stated numerically, the other-chains re-judgment table,
   band scholar tb-combat census (reused classifyFight
   counts, for context only — the sink size is scholarmelt's
   number re-derived on this corpus, never a new claim),
   substrate equivalence report, determinism + sense
   results, wall numbers (report-only, same upper-middle
   median convention as chainclose), plain-words village
   assessment, ranked next, and a metric-review section.
5. No src/js change, no push, no bump, no live verification.
   Report 'committed on branch, pending coordinator merge'
   (coordinator merges; sibling loop B may move master under
   this branch — rebase cleanly at the end and re-run the
   proof; rebase conflict = FAIL LOUDLY, no force, no merge).

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js) via the shared
sim-harness (loadGame seeds Math.random BEFORE eval). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-sameday-a (no jest is run by
this arm — the sweep/analyzer are plain node scripts).
