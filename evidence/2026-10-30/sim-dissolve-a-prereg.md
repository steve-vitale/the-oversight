# sim-dissolve-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1122Z, worker
sim-dissolve-a. Axis: scale-onramp (blocking axis, converging,
NOT converged). Ranked-next #4 from the 1107Z run; backlog item:
DISSOLVED MEETINGS NEED A DISSOLVE-PATH RECORDER.

DIAG ONLY, measurement only, zero src/js game changes, no
default flip, no gate move, no deed-bar move. No [needs-eyes]:
this arm changes no feel, combat, or UI — it only analyzes an
already-recorded corpus. No new sweep, no new sims.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; the
dissolved population is wave-4 herald titans). NO CANON-registered
doc covers a scholar-fight dissolve specifically — the mechanism
below is read from code and carried from the scholarmelt prereg
(game.js startCombat/tbEnd; scholarmelt correction #2), stated
exactly so it can be checked, and is NOT canon.

## Reconciliation (pre-analysis; the basis for the path choice)

The task's first job was to reconcile, NOT to build a redundant
recorder. Reconciliation result, from reading both evidences and
both corpora before this prereg (no judged count was produced
by this arm before it):

- Same band, same substrate, same policy: seeds 75101-75116,
  180d death-aware horizon, tableseat-nowait policy, env
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1,
  BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, JOINENDLINES=1 — in
  both the scholarmelt arm (0738Z) and the draftflag arm
  (1015Z, whose corpus blockedrestore censused).
- The scholarmelt recorder field is VALUE-IDENTICAL between
  the two corpora on all 16 seeds (parsed-JSON equality of
  the whole `scholarmelt` field, meetings + diag, per seed).
  The dissolved population is therefore the SAME population
  in both corpora, row for row, not merely the same size:
  per-seed dissolved counts agree exactly (75102: 32,
  75104: 45, 75105: 43, all other seeds 0; band total 120),
  and the underlying meeting rows are identical values.
- Scholarmelt-a already classified this exact population
  with the post-end identity-check method (finding #1491 in
  its evidence: 120 dissolved rows, all herald — 75
  SCHOLAR-RESTORED by identity at flush, 45 SPAWN-ENDED, 0
  dissolved melts; "never read a dissolved result as a melt
  without a post-end identity check"). Those are
  scholarmelt-a's published numbers, carried here as the
  reconciliation basis — NOT this arm's judged result.
  This arm's judged result is its own independent analyzer
  run over the DRAFTFLAG corpus, cross-checked row by row
  against scholarmelt-a's fates (see GO bars).
- Blockedrestore's "UNMEASURED" label for the same 120 was
  true for ITS instrument (tbend events, which dissolved
  meetings never produce) and is NOT true for the corpus as
  a whole: the scholarmelt field in that same corpus
  already carries the post-end identity check for every
  dissolved row. The gap that remains after reconciliation
  is dissolve CAUSE (which code path dissolved each fight
  — no call-site field exists in the recorder), not
  dissolve FATE. Cause is a different, narrower question
  and is ranked-next, not built here (see below).

## Path choice: PATH A (with reason)

PATH A: apply scholarmelt-a's post-end identity-check
method to the blockedrestore dissolved 120 in the draftflag
corpus (read-only), and judge the three assigned questions.
Reason: the reconciliation proves the identity-check method
already covers this population — same rows, same fields,
same classifier inputs — so a new recorder + fresh sweep
would re-measure a fate that is already recorded, which is
exactly the redundancy the task forbids building. PATH B is
NOT taken because its trigger (a genuine gap in the
assigned questions) does not hold for fate: the only gap
that survives reconciliation is dissolve cause, which none
of this arm's three judged questions asks, and which a
Path B sweep on the same substrate would not answer
without a new call-site hook — a follow-up arm's build,
named in ranked-next, not a reason to re-run this arm as
a sweep.

## Mechanism, read from code and carried (never assumed true)

- A scholar fight dissolves silently (game.js: tbfight
  over=true, result='dissolved', tbfight=null — no tbEnd
  call). The scholarmelt recorder flushes such a start as
  result 'dissolved-no-tbend' when a later non-refused
  start, or sweep-end finalize with no live fight, proves
  no fight is live. dayEnd on a flushed row is the FLUSH
  day, not the dissolve day; chain matching (not used
  here) uses startDay, never dayEnd.
- tbEnd is the only restore path, so a lifted object
  absent by identity after a dissolve has melted — but a
  dissolved row's lift flag is set by the correction-#2
  post-start presence test (present at post-start =>
  lifted=false, "never removed by this fight"; absent =>
  lifted=true). The classification order is therefore
  RESTORED-FIRST, verbatim from scholarmelt-a's
  classifyFight dissolved branch: restoredIdentity true
  => SCHOLAR-RESTORED; else restoredEntry true =>
  SCHOLAR-RESTORED (entry subflag); else lifted true =>
  DISSOLVED-MELT; else lifted false and no lift =>
  SPAWN-ENDED; else lifted false with a lift =>
  BYSTANDER-OR-NONMONSTER (never-lifted); else
  UNCLASSIFIED (a classifier failure, never a fate).
- "Restore fate" for a dissolved row means SCHOLAR-RESTORED
  under that identity check (the object is back/present in
  the world by identity at flush), NOT a tbEnd restore —
  no tbEnd ever ran for these rows, so no tbEnd restore
  exists to count. This distinction is stated in the
  evidence, not blurred: where the classifier says
  restored and lifted=false, the plain-words reading is
  "the tile object never left", with SCHOLAR-RESTORED as
  the classifier's label. A future arm may rename the
  dissolved-restored subflag to never-left; that is
  nomenclature, not a finding change, and is not done
  here.
- Lingerer-origin, for dissolved rows, CANNOT mean
  "worldOrigin.lingering": worldOrigin is set only for a
  lifted fighter that is a titan or lingering AT tbEnd,
  and dissolved rows never reach tbEnd (worldOrigin is
  null on every dissolved row by construction). The
  measurable lingerer-origin population is therefore
  defined here as: dissolved rows whose pre-start lift
  snapshot exists AND lift.lingering is true (a lingering
  tile monster at fight start). A dissolved row in that
  population "lacks a restore fate" iff it classifies as
  DISSOLVED-MELT or UNCLASSIFIED. SPAWN-ENDED rows have
  no lift by definition and are never lingerer-origin.
- The fled half of lingerer-keeps is a tbEnd population
  (result 'fled' with a lingerer origin). Dissolved rows
  carry result 'dissolved-no-tbend', never 'fled', so
  they can add ZERO fled observations by construction;
  the fled question is judged on the draftflag corpus's
  tbend events (fled count re-verified by this arm's
  analyzer, carried from blockedrestore's census, never
  re-scored under a different window).

## Corpus and substrate (binding)

- Corpus: evidence/2026-10-30/perseed-draftflag-a/ as
  committed by sim-draftflag-a (16 seeds 75101-75116,
  180d death-aware horizon, tableseat-nowait substrate).
  READ-ONLY — this arm writes nothing into it. The
  scholarmelt corpus (perseed-scholarmelt-a/) is read
  ONLY for the per-(seed,fightSeq) fate cross-check.
- This arm runs NO new sweep and NO new sims: the
  analyzer reads the committed corpus read-only and
  writes only evidence/2026-10-30/sim-dissolve-a-analysis.json
  (plus this prereg and the evidence file).
- Analyzer: scripts/analyze-dissolve-a.js (pure: reads
  corpus JSON, never touches game state, never writes
  into either corpus). Fixtures:
  scripts/test-dissolve-a.js.

## Populations and classification rules (binding)

DISSOLVED POPULATION — every scholarmelt meeting in the
draftflag corpus with result 'dissolved-no-tbend'. Each
is classified exactly one way by the restored-first rule
above: SCHOLAR-RESTORED (identity or entry subflag),
DISSOLVED-MELT, SPAWN-ENDED, BYSTANDER-OR-NONMONSTER,
or UNCLASSIFIED. The analyzer also reports, for every
dissolved row: seed, fightSeq, dayStart, dayEnd(flush),
intendedMid, lift presence + lift.lingering/lift.titan,
lifted flag, restoredIdentity, restoredEntry,
restoredHp, tile, and the identity-vs-entry mismatch
rows (restoredIdentity true but restoredEntry false)
as a sense note, not a separate fate.

LINGERER-ORIGIN SUB-POPULATION — dissolved rows with
lift != null AND lift.lingering == true. Reported as
its own fate split, plus the count lacking a restore
fate (DISSOLVED-MELT + UNCLASSIFIED within it).

FLED POPULATION — every tbend event in the draftflag
corpus with result 'fled' (counted from the draftflag
field's tbend events; expected to reconcile to
blockedrestore's fled count of 0 — a mismatch is
investigated, never forced). Dissolved rows are
reported separately as adding 0 fled observations.

CROSS-CHECK — for every dissolved row, this arm's fate
must equal scholarmelt-a's published fate for the same
(seed,fightSeq) (from sim-scholarmelt-a-analysis.json).
Any mismatch is investigated before judging; the
cross-check is a consistency proof on identical inputs,
not a second judgment of scholarmelt-a's verdict.

## GO thresholds (binding)

- Prereg committed BEFORE any judged analysis: PASS
  required. (Reconciliation reads of field vocabulary,
  per-seed counts, and prior published fates preceded
  this prereg; this arm's analyzer counts are the
  judged numbers.)
- Pilot gate (before the full-corpus classification is
  judged): fixtures green + analyzer run on seed 75102
  alone + corpus integrity (git status clean for
  perseed-draftflag-a and perseed-scholarmelt-a; both
  corpora untouched) + instrument firing evidenced from
  the corpus diag (pilot seed scholarmelt errs 0,
  overflow empty, dissolved count on the pilot seed
  reproduced). A failed pilot gate stops the run.
- Seeds: 16/16 valid (row days > 0, scholarmelt diag
  errs 0, overflow empty, census present/sorted/within-1
  — the validity criteria carried from the scholarmelt
  arm).
- Classification completeness: 120/120 dissolved rows
  classified (exactly one fate each), 0 UNCLASSIFIED.
  A DISSOLVED-MELT count above 0 is a FINDING (it
  changes the answer to question 1), not a leg failure
  — the leg fails only on unclassified rows or on a
  cross-check mismatch left uninvestigated.
- Cross-check: 120/120 per-(seed,fightSeq) fates agree
  with scholarmelt-a's published fates, or every
  mismatch is investigated and explained in the
  evidence before judging.
- Lingerer-origin completeness: the sub-population's
  fate split is reported in full, and the count lacking
  a restore fate is stated explicitly (including zero).
- Fled: the tbend fled count is re-verified and the
  dissolved contribution (0 by construction) is stated.
- Determinism: analyzer run twice into separate outputs
  (second into a worktree scratch dir, never /tmp for a
  final output) produces byte-identical analysis JSON;
  scratch removed after the diff.
- Sense: at least 2 dissolved chains read end to end
  for meaning (a same-seed day-cluster of dissolved rows
  plus the census snapshots bracketing it: does the
  tile herald persist across the dissolved days, does
  the scholar-HP path cohere, does anything in the
  cluster read as a melt). Node-sim stubs Game.say to
  no-op, so there is no say transcript; sense evidence
  is the structured trace + census, stated as such.
- Fixtures: scripts/test-dissolve-a.js green before
  the judged classification is analyzed: the dissolved
  branch in priority order on synthetic rows (identity
  restored beats lifted-melt; entry restored; melt on
  lifted+absent; spawn-ended on no lift; never-lifted
  bystander; ambiguous => UNCLASSIFIED), the
  lingerer-origin population rule (worldOrigin-null
  rows still count via lift.lingering; spawn-ended rows
  never count), the per-(seed,fightSeq) cross-check
  comparator, and the corpus-integrity leg.
- Wall numbers: Path A carries wall numbers (verified,
  not re-claimed as before/after): recomputed from the
  same draftflag corpus rows and checked against
  blockedrestore's carried numbers; any divergence is
  reported, never smoothed.

## Verdict rule

- DIAG-GO iff prereg PASS + pilot gate PASS + 16/16
  seeds + classification completeness PASS + cross-check
  PASS + lingerer-origin completeness PASS + fled PASS +
  determinism PASS + sense PASS + fixtures PASS.
- DIAG-NO-GO on any failed leg. A miss is NO-GO, never
  re-scored against a friendlier metric mid-run; metric
  doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.
- The verdict answers the three assigned questions; it
  is NOT a verdict on dissolve cause, which is ranked
  next. NO lever verdict: this arm proposes no damage
  buff, gate move, deed-bar move, or any game change.
- Scholarmelt's, blockedrestore's, and draftflag's
  verdicts are carried, never re-judged: this arm
  classifies the draftflag corpus's dissolved rows; it
  does not re-score scholarmelt's melts, blockedrestore's
  blocks, or draftflag's drafts.

## The three assigned questions (judged in the evidence)

1. Do dissolved lingerers get a restore fate, or do they
   melt? (Answered from the lingerer-origin fate split
   + the band dissolved fate split.)
2. Is the fled half of lingerer-keeps still unobserved?
   (Answered from the tbend fled count + the dissolved
   contribution of 0 by construction.)
3. What, if anything, still needs a recorder? (Answered
   in ranked-next: dissolve cause is the surviving gap;
   fate needs no recorder. A dissolve call-site hook is
   the named missing instrument, with the known
   barrier-death dissolve site in game.js as a lead to
   check, NOT a finding — whether herald dissolved rows
   come from that site is unmeasured by this corpus.)

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Analyzer (scripts/analyze-dissolve-a.js) + fixtures
   (scripts/test-dissolve-a.js), committed before the
   judged classification is analyzed (fixture bar green
   first).
3. Pilot: seed 75102 — fixtures + per-seed reproduction
   + corpus integrity + instrument firing — before the
   full classification is judged.
4. Full classification (16 seeds), determinism gate
   (second run to scratch, diff, scratch removed),
   sense reads per the bar above.
5. Evidence evidence/2026-10-30/sim-dissolve-a.md with
   a prereg-legs table, the dissolved fate counts, the
   lingerer-origin fate split, the fled answer, the
   three assigned questions answered plainly, wall
   numbers (carried, verified), plain-words village
   assessment, metric review, and ranked next.
6. No src/js change, no push, no bump, no live
   verification, no merge to master by this worker (the
   coordinator merges; sibling loop B may move master
   under this branch — rebase cleanly at the end and
   re-run the proof; rebase conflict = FAIL LOUDLY, no
   force, no merge).

## Node harness

No harness is run by this arm: the analyzer and the test
script are plain node scripts over committed JSON (the
draftflag corpus). No jest is run by this arm; the
--cacheDirectory rule is therefore vacuous here and is
recorded as such rather than claimed.
