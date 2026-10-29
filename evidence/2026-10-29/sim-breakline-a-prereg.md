# sim-breakline-a — PREREGISTRATION (binding, committed BEFORE any judged run)

Run: fleshout loop, run fleshout-20261029T1615Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-breakline-a.
Assignment: WHICH BREAK LINE ACTUALLY ENDS WILD FIELD FIGHTS —
measurement only, zero src/js, zero game-behavior changes, zero
default flips, zero roster/list feed into any decision (PERCEPTION
LAW, Steve 2026-10-28: villagers know who's around only through
their own senses — never feed a roster, snapshot, or "who is
around" list into a decision). This arm records only; the new
recorder reads fight results after the engine decides them and
writes nothing to game state.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4
bands damage 35–95, HP 850–1500, pierce 0.2–0.5; wave-4 gate
standing >= 100 plus combat-readiness bars; waves 1–3 gates
day/ledger). No CANON-registered doc covers field-fight break
lines — the mechanism below is derived from code, stated
exactly so it can be checked (src/js/fieldFights.js, fieldFight,
round cap MAX_ROUNDS = 15):

- Round-end morale, in code order per round (round >= 2
  trajectory first): hopeless = rounds-to-drop-villager <
  rounds-to-kill-lead x 0.85; winning = kill-lead-first or
  trade. Learn-intent villagers withdraw at round >= 3 when
  not winning ("has seen enough" line, fleeLearn). Hopeless
  with help near and intent not learn -> shout, ally joins,
  fight continues. Hopeless and alone (or help spent) ->
  flee ("sees how this ends" line, fleeHopeless). THEN the
  floor check: vHp/vHpMax < fleeAt (vBreak, lowered to
  0.05 when winning, lowered 0.15 by war cry, raised by
  rally in effect) -> flee with fleeHopeless = the round's
  hopeless value and fleeLearn when intent learn. So a
  vFlee carrying fleeHopeless=true may come from EITHER
  the hopeless branch OR the floor branch with a hopeless
  trajectory — the flags alone cannot tell them apart;
  the log lines can (hopeless branch logs its line, floor
  branch logs none). This arm therefore classifies by
  ENGINE BRANCH (log lines read at record time), and
  cross-tabs the w4dpr flag classes for comparability.
- Monster break line: lead HP fraction < mBreak (0.25 wave 1,
  0.15 waves 2+) -> mFlee. Round cap with no outcome ->
  the worse-off side disengages ("Neither gives after 15
  rounds" line), vFlee or mFlee by HP fraction. Trick
  exits set fleeWise (e.g. suburb leave).
- Context built on, not redone: sim-staying-a (round-0002
  evidence) found 5 of 9 judged wild flees were
  WOUND-FLOOR breaks (fleeHopeless false), not trajectory
  flees, so morale was never consulted; sim-w4dpr2 (16
  seeds) recorded break reasons for 42 wave-4 field
  fights, all ending by round 2, 0 kills, 0 ally joins,
  0 bow volleys, median DPR 6.5/round vs median 900 HP.
- KNOWN-STALE WARNING (do not quote as current):
  funnel-a / departlag-a lag values are KNOWN-STALE on
  current master after the build-armor seed-bark +
  fix-all armor change (day-6 meeting armor 4 -> 7).
  This arm quotes no lag values at all.

## Fresh band (this arm's own sweep, base code)

- Base commit: ca9a7569e0fae7ff2b62f50f952edc5a69e495ce
  (worktree HEAD at prereg time).
- Seeds 75101–75108 (8, the pilot band; the w4dpr2 /
  staying-a 8-seed subset verbatim, so wall numbers are
  comparable), scripts/policies/tableseat-nowait.js
  VERBATIM, LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
  FIELDPARTY=1 (fieldparty-form-diag recorder, reused
  VERBATIM, never edited), W4DPR=1 (w4dpr-diag recorder,
  reused VERBATIM, never edited), PLUS the new breakline
  recorder (scripts/policies/breakline-diag.js,
  BREAKLINE=1; observational only, pure pre-reads, no
  game writes, no RNG draws, never throws into the
  engine). 180d death-aware (runDays stops on death/win,
  as in the predecessor sweeps), competent policy
  (tableseat-nowait wraps leanlinkrescue courtship).
- WHY 8 SEEDS: the assignment fixes the pilot band
  (pilot gate: 8 seeds before any confirm spend). Seeds
  are nearly free, but the pilot gate binds: no 12–16
  seed confirm is spent on an invisible effect, and the
  band is NOT widened silently if it yields no
  classifiable wild fights.

## Universe and classification (fixed before judging)

- UNIVERSE U: every meeting with wave in 1..4, channel
  == 'field', caller in {resolve, patrol, aid}, leader
  NOT the scholar — the judgedA shape verbatim from
  chainkill/returns/w4dpr2, extended to waves 1–4.
  FOUGHT = rounds >= 1 (the break census); UNFOUGHT =
  rounds < 1 (evade / alreadyDead / round-0 volley-only
  outcomes), counted separately, never averaged into
  break shares. SUPPLEMENTAL (reported, never pooled
  into U): scholar-led fights, other callers, raid /
  sortie channels, waves 5+.
- PARTY SPLIT (tile-present allies ONLY, the
  tileparty/staying tile-mate rule): party-present =
  the fieldparty record's `tile` list at fight start,
  excluding entries with deadKnown === true, has
  length >= 1. Solo-tile = empty list. This is a
  pure nodePos co-location read the recorder already
  makes; it is NOT a roster feed (no decision reads
  it — the analyzer splits the census after the fact).
  Also reported: fought size (joinedAllyVid ? 2 : 1)
  and whether the joined ally was tile-present, as a
  cross-tab. If zero tile-present wild fights occur,
  that IS the finding — no parties are manufactured
  and the definition is NOT widened mid-run.
- BREAK LINES (branch-based, exactly one per fought
  fight, first match wins — the recorder computes
  capLine / hopelessLine / learnLine booleans from
  rec.log at record time, so all waves classify
  without storing full logs):
  1. KILL (outcome vKill).
  2. CAP (rounds >= 15 AND cap line "Neither gives
     after 15 rounds" present — reported with its
     vFlee / mFlee sub-outcome, never pooled).
  3. DRIVE-OFF (outcome mFlee, no cap line).
  4. PARTY-DEATH (outcome vDie).
  5. HOPELESS-BRANCH (outcome vFlee AND hopeless
     line "sees how this ends" present).
  6. LEARN-BRANCH (outcome vFlee AND learn line
     "has seen enough" present).
  7. TRICK-EXIT (outcome vFlee AND fleeWise true).
  8. FLOOR-BRANCH (outcome vFlee AND none of the
     above — the fleeAt floor check) with sub-rows:
     floor-hopeless-false (staying-a's "wound-floor"
     class) and floor-hopeless-true.
  9. OTHER (none of the above — must be 0 for a GO;
     any OTHER fight is listed by seed/day/mid).
  Mapping to the assignment's labels: hopeless-
  trajectory flee = HOPELESS-BRANCH; wound-floor break
  = FLOOR-BRANCH with fleeHopeless false; HP-floor
  retreat = FLOOR-BRANCH total (the fleeAt floor
  check, fieldFights.js:1625); round-cap end = CAP;
  death = PARTY-DEATH; kill = KILL; drive-off =
  DRIVE-OFF. LEARN-BRANCH and TRICK-EXIT are
  additional engine branches, reported, never pooled
  into hopeless or floor.
- CROSS-TAB (comparability, not the headline): the
  w4dpr2-lib classifyBreak flag classes
  (HOPELESS / LEARN-WITHDRAWAL / WOUND-FLOOR /
  TRICK-EXIT / CAP / DRIVE-OFF / PARTY-DEATH / KILL /
  OTHER) for the vFlee pool, computed by the
  analyzer from the w4dpr record's flags on waves
  3–4 (where the log is stored) and from the
  breakline record's flags on waves 1–2. A fixture
  proves the branch classifier agrees with
  classifyBreak's flag classes on every wave-3/4
  fought fight where the two taxonomies must agree
  (KILL / CAP / DRIVE-OFF / PARTY-DEATH identical;
  vFlee split differs by design and is reported as
  the split, not a mismatch).
- SENSE LOGS: per seed, the recorder stores the full
  rec.log (capped 500 lines, as w4dpr does) for the
  FIRST floor-branch fight, the FIRST hopeless-branch
  fight, and the FIRST learn-branch fight only.
  Nothing else stores a log; the census itself needs
  only the booleans.

## Questions and metrics (fixed before judging)

- PRIMARY Q: on current master, which break line
  actually ends wild field fights? Census by break
  line, split by wave (1–4) and by party-present vs
  solo-tile.
- SECONDARY: wall numbers for the band (national
  ever/final, table invited/entered, wins lesser/full,
  wave 1–5 reach, median survival, death-cause shares
  if the recorder yields them) and the wave-4 subset
  census for direct comparison with w4dpr2.
- GUARDS (reported, not judged): death-cause shares.
  This arm makes NO game change, so no guard can move.

## Sense-testing law (transcripts read + quoted)

- S1 (corpus-derived, floor-branch): at least ONE full
  wild fight trace from the sense logs quoted VERBATIM
  (every round line, volley to break), judged as a
  played fight: does it read as people fighting, or
  as numbers without a fight?
- S2 (corpus-derived, hopeless-branch): the same for
  a hopeless-branch fight, IF one occurs in U. If no
  hopeless-branch fight occurs, S2 quotes the next
  most frequent vFlee branch present and the absence
  is stated as a finding, not papered over.
- At least TWO transcripts quoted in total, covering
  at least two distinct break lines, one being
  floor-branch if any floor-branch fight exists.

## Bars (judge against this header; a miss is DIAG-NO-GO)

- COVERAGE: 8/8 valid seeds AND all three recorders
  errs 0 with overflow empty AND join errors 0 across
  all meetings AND at least 50 fought wild fights in
  U each carrying a break reason AND OTHER = 0.
- DETERMINISM GATE: re-run seed 75106 into a scratch
  dir; its row JSON must be byte-identical to the
  corpus row. Scratch dir removed after the diff.
- NEUTRALITY (recorder draws no RNG, writes no game
  state — exact bar from the w4dpr2 subset corpus,
  seeds 75101–75108): fieldparty meetings total 1272;
  deaths 286; won 3; nationalEver 7; wave-4 judgedA
  per-seed 75106:15, 75108:9, all other seeds 0.
  PLUS OFF/ON: one seed run with BREAKLINE unset must
  match the corpus row on every field except the
  breakline store itself (fieldparty + w4dpr stores
  and wall fields byte-identical after stripping the
  breakline key). Any deviation is an instrument
  failure to report, not a re-score.
- SENSE BAR: >= 2 corpus fight traces quoted verbatim
  covering >= 2 distinct break lines (S1 + S2 above).
- DIAG-GO BAR: coverage AND determinism AND
  neutrality exact AND sense legs AND one ranked next
  step named with numbers. Any leg missed ->
  DIAG-NO-GO. PILOT GATE: if U yields no classifiable
  wild fights, that is a NO-GO / INSUFFICIENT-DATA
  verdict, NOT a reason to widen the band silently.
  No re-scoring against a friendlier metric mid-run;
  metric doubts go under "metric review" in the
  evidence file.

## What this arm does NOT do

No src/js change, no policy change, no default flip,
no fight routing, no feed, no roster read into any
decision, no narration fix, no push, no bump, no live
verification. No re-judgment of predecessor verdicts
(chainkill DIAG-GO, returns DIAG-GO, w4dpr2 DIAG-GO,
staying PILOT NO-GO all stand). No wall movement
claimed from re-analysis. No panel artifact (standing
exception: the panel has no census-ingest mode;
identical-seed corpora are the §15 substitute, as in
prior rounds). Instruments: scripts/policies/
breakline-diag.js (new recorder, diag only), scripts/
test-breakline-a-sweep.js (pilot band), scripts/
test-breakline-a.js (analyzer + judge), scripts/
test-breakline-a-fixtures.js (classifier correctness
+ equivalence on the w4dpr2 corpus), scripts/
test-breakline-a-sense.js (corpus trace reading).
Each must pass `node --check`; analyzer + fixtures +
sense must print green. Never run concurrent jest;
cache dir /tmp/jest-cache-sim-breakline-a (no jest
expected — node scripts only; the rule is recorded,
not waived). Never touch docs/ONTOLOGY.md. Never
touch any other worktree, registry entry, loop-B
tree, or build lane (build-returns, build-geartier,
build-staying). Never touch the main tree.

## Metric review (filled at judging time)

- (to be filled when the analyzer runs)
