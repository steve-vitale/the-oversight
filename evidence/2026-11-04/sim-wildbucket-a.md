# sim-wildbucket-a — VERDICT: GO (THE BUCKET SPLITS, COMPLETELY)

Run: oversight-flesh-out-loop, run fleshout-20261104T2230Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-wildbucket-a. Axis: food-economy.
Arm: WILDBUCKET — decompose the death-cause bucket "the wild"
(exphurt-24-a out-of-scope finding 3: 41.0% of 283 deaths bucketed
as "the wild", not a cause; future death-share reporting should
split it before citing shares).
Binding prereg: evidence/2026-11-04/sim-wildbucket-a-prereg.md
(committed BEFORE any judged sim, 9e2e21f0; this verdict is judged
against it, §14).
Canon read first: docs/CANON.md; MONSTER-WAVES.md and DISEASES.md
skimmed for death-cause conventions. No canon doc covers
death-cause attribution — that still holds; the mechanism is
code-read, not invented canon. No game-code change in this arm:
MEASUREMENT ONLY. No [needs-eyes] commit: nothing player-facing
changed.

## THE QUESTION, IN ONE SENTENCE

Is "the wild" a mixture of many hidden causes, or one cause
wearing a bucket label — and can records the engine already
writes split it?

## VERDICT — GO, BY THE PREREG'S OWN RULES

- Pilot sniff test (>= 5 wild deaths): 52 wild deaths on the
  8-seed pilot — PASS by 10x. Confirm run, as pre-registered.
- Instrument health: all 24 seeds complete, instrument errors
  0, malformed death records 0 — PASS.
- PRIMARY (judged set = pooled pilot + confirm, pre-registered):
  132/132 = 1.000 assigned a specific proximate cause, GO
  threshold >= 0.80 — PASS.
- Largest single residual reason: none — residual is 0, so no
  residual reason above 0.10 — PASS.
- Certain-only share: 132/132 = 1.000 (every assignment is
  rule 1, TB-MONSTER, certain — the probable rule never fired).
- Verdict rules applied verbatim: GO threshold met → GO (the
  bucket splits; future death-share reporting must use the
  split, and the analyzer + rules land as the reporting
  instrument). No DIAG verdict: no field is missing, so no
  missing-field census is needed (the analyzer's residual
  census is 0 across the board, as expected with no residual).

## THE ANSWER, IN PLAIN WORDS

"The wild" is not a mixture. On this band it is ONE thing, every
time: the village's scholar (the player character) losing a
turn-based fight against a monster out in the world, and the
mantle passing to a successor. All 132 bucketed deaths are
player-flagged, scholar-flagged deaths with a live turn-based
fight at death time whose fighters include a monster and no
hostile human/alien fighter — exactly the shape game.js
tbFightDeathCause labels 'the wild' before passing it to
ledger.js playerDeath. It is not starvation, not exposure, not
disease, not drowning, not a contest, not an NPC dying
unseen: no villager (non-scholar) death in 333 person-kind
deaths on this band carries the bucket at all. The bucket
label hides the killer's name, not the kind of death: the
fight record at death time names the monster in every case.

## THE NUMBERS (24 seeds, judged set pooled as pre-registered)

- Seeds: pilot 99957–99964 (8), confirm 99965–99980 (16).
  Policy competent, 100d death-aware cap, PLENTYDEPRI=1,
  DEPOSITGATE=1. All seeds complete, errors 0.
- All registerDeath records: 1303 (pilot 405, confirm 898).
  Person-kind deaths (villager + person, the exphurt-24-a
  denominator): 333 (pilot 95, confirm 238). Monster-kind
  deaths (corpses of beasts, a different population): 970.
- Wild-bucket deaths: 132 (pilot 52, confirm 80).
  Wild share of person-kind deaths: 132/333 = 39.6%
  (pilot 54.7%, confirm 33.6%) — comparable to exphurt-24-a's
  41.0% on its person-kind denominator. The analyzer's
  headline wildShare (132/1303 = 10.1%) counts monster
  corpses too and is NOT comparable to exphurt's share; the
  39.6% person-kind figure is the comparable one. Future
  reports must state their denominator — this confusion is
  exactly why the split matters.
- Split table (counts + shares of the 132 bucketed deaths):
  - TB-MONSTER (certain): 132 (100.0%) — "monster kill,
    turn-based wild fight", monster named from the live
    fight record in every case.
  - CORPSE-MONSTER (certain): 0 (0.0%) — never needed; the
    live fight record already names the killer.
  - LAST-HURT-MONSTER (probable): 0 (0.0%) — never needed.
  - RESIDUAL: 0 (0.0%), all residual reasons 0.
- Per-seed wild counts: pilot 9, 8, 13, 9, 5, 6, 2, 0;
  confirm 6, 3, 2, 3, 0, 6, 4, 9, 1, 1, 10, 5, 2, 7, 13, 8.
  Two seeds (99964, 99969) record zero wild deaths — both
  are short runs (16d, 38d), not instrument gaps: their
  person-kind deaths carry other causes.
- Killer monsters (pooled top, as recorded — note "The
  Reunion 1" vs "The Reunion" are recorded as distinct
  fighter names, presumably an instance suffix; reported as
  recorded, not merged): The Reunion 1: 14, The Reunion: 14,
  The Eulogy: 16, The Algorithm: 11, Buffering: 9, Big Loud:
  7, The Eater: 7, The Callback: 6, The Redactor: 3+,
  Highbeam Deer: 2, plus singletons and other wave-2+
  entertainment predators. The wave-1 benchmark deer kills
  the scholar only twice in 132; the bucket is dominated by
  wave-2+ monsters (The Eulogy, The Reunion, The Algorithm,
  Buffering) — the scholar dies to the entertainment
  predators, not to calibration fauna. (Full per-band counts
  in the analysis output under
  evidence/2026-11-04/sim-wildbucket-a-pooled-analysis.txt
  and the per-seed JSONs.)
- Producer check (code-read, confirmed empirically): the
  only producer that fired is tbFightDeathCause's wild
  branch via tbEnd('lost') → playerDeath('the wild'). The
  ledger.js default `cause || 'the wild'` never fired on
  this band — no bare playerDeath() caller exists in src/,
  and every bucketed death has a live monster fight. The
  default is a dormant fallback, not a live producer here.

## SENSE TEST — DEATH LINES FROM THE BUCKET, QUOTED

The death line itself is spoken by ledger.js playerDeath AFTER
registerDeath runs, so it is not inside the death-time
transcript window (the window ends at the killing blow) —
that ordering is stated plainly, not hidden. The line template
is code-read (ledger.js:733): "🕯️ <Name> is dead — the wild.
The village stops. Somebody screams. Somebody else starts
digging." Two death windows, quoted:

1. Ray Brooks, s99965 day 34, killed by The Focus Group:
   "...Focus group's Deliberation hits you for 14." then
   "You go down." — and then the village is told only that
   he "is dead — the wild." The fight narration names the
   killer and the blow; the death line forgets both. A
   player reading the death line alone learns nothing about
   what killed their scholar; a player who watched the fight
   knows exactly.
2. Ines Duarte, s99972 day 98, killed by The Eulogy:
   "📖 "...they ended." The last line lands like a lid.
   (The story finishes — you die as narrated.)" then
   "Armor absorbs 6978." then "You go down." — again, the
   fight tells the story and the death line does not. (The
   "absorbs 6978" figure is the fight's own narration, quoted
   as recorded; whether that armor figure is honest is out
   of this arm's scope — flagged as an observation below,
   not chased.)

Judgment: the bucket label is a narration blank, not a data
blank. The engine knows the killer at death time (the fight
record is live), but the line the village remembers says
only "the wild." The fix — if a future arm wants it — is a
label change at the death line (name the monster from the
fight record), not new telemetry: the telemetry already
exists. This arm lands no such change; it proves the label
is the only gap.

## REACHABILITY + VILLAGE ASSESSMENT (plain words, diag window)

Window honestly stated: competent policy, 100d death-aware cap,
seeds 99957–99980 — an early/mid window, not a full-arc run,
and a death-record corpus, not a scale panel. Nothing here
claims scale verdicts.
- Survived to 100d (capped): 10/24; median daysAlive 91
  (sorted: 16, 38, 54, 60, 61, 65, 67, 70, 72, 80, 81, 89, 93,
  96, 100 x10). Max 100 (capped).
- Wave reach: wave 4 on 18/24, wave 3 on 5/24, wave 2 on 1/24,
  wave 5 on 0/24. National / table / wins: 0/24, rank village
  on all 24 — the scale wall is untouched by this measurement
  arm, as expected.
- Who thrived / died and why: the village does not die to
  the wild in general — it dies, scholar by scholar, to
  turn-based monster fights the competent policy takes and
  loses, roughly 5–6 scholar deaths per 100-day run
  (132 wild deaths / 24 seeds). The mantle passes each time
  and the village continues; the bucket counts successions,
  not village extinctions. That is the sense in which "the
  wild" dominates death shares: it is the recurring price of
  fighting monsters as the scholar, not a background hazard
  picking villagers off unseen.

## §15 BALANCED PANEL — DECLARED INAPPLICABLE (prereg-bound)

No panel compare file is attached, deliberately, for the
reason declared in the prereg before the sims:
scripts/balance-panel.js measures scale/cohort metrics, not
death-record text, and cannot ingest death records. The
applicable before/after comparison (matched-seed re-run)
belongs to a future arm that changes death reporting, which
this measurement-only arm does not become.

## WHAT LANDS, WHAT DOES NOT

- LANDS ON THIS BRANCH (coordinator merges; worker does not
  push, bump, or verify live): prereg (9e2e21f0); the sweep +
  analyzer + proof test (same commit); the pilot corpus (8
  per-seed JSONs + sweep summary + sweep log + analysis
  output); the confirm corpus (16 per-seed JSONs + sweep
  summary + sweep log); the pooled analysis output; this
  evidence file.
- DOES NOT LAND: no game-code change; no cause-string change;
  no death-mechanic change; no gate/price/deed change; no
  sibling files; no hidden_files files. No [needs-eyes]
  commit: nothing player-facing changed.
- Instrument note, stated plainly: the first confirm attempt
  was cut off by a turn interruption after seed 99965 only
  (no process survived it); the full pre-registered confirm
  band was then re-run from the start in the background.
  Seed 99965's numbers are identical across both attempts
  (72d, 40 deaths, 6 wild) — the re-run is deterministic,
  not a re-pick. No seed was added, dropped, or replaced.
- Index-clobber note (workspace lesson, third-sighting class):
  after the safe-commit of the prereg + instrument, the main
  index showed all 4 committed files staged-as-deleted plus
  untracked. Repaired the same way (HEAD-blob cacheinfo per
  file, --add); commit 9e2e21f0 verified with git show
  --stat; git status clean and git diff HEAD empty after
  repair. The commit itself was always correct.

## PROOF

- scripts/test-wildbucket-a.js: 19/19 green (classification
  fixtures for every rule branch including priority order and
  the hostile-contaminated defensive branch; sweep refusal of
  every wrong band/STAGE/DAYS/env-gate via VALIDATE_ONLY;
  GO-threshold arithmetic).
- Instrument errors: 0 across all 24 judged seeds. No
  malformed death records. Every wild death carries a live
  tbfight snapshot with a monster fighter.
- Analyzer note: one defensive residual reason exists beyond
  the prereg's three listed reasons — "tbfight has monster +
  hostile fighters" (a fight the tbFightDeathCause rule would
  label 'a stranger', not 'the wild'). It never fired on real
  data (0 cases); it exists so a hostile-contaminated wild
  record could not silently fall into the wrong reason. It
  changes no judged number: residual is 0 with or without it.

## METRIC REVIEW (for the NEXT run, not a revision of this one)

- The primary (rules 1–3 share) saturated at 1.000 with rule
  1 alone — the probable rule and the corpse rule never
  fired. Future wildbucket-style arms should keep the rule
  order but expect rule 1 to dominate whenever the bucket
  comes from tbEnd losses; rules 2–3 are insurance, not
  load-bearing.
- The denominator warning is the durable lesson: the
  analyzer's all-records wildShare (10.1%) and the
  person-kind wild share (39.6%) describe the same deaths.
  Any future death-share report must name its denominator
  (person-kind only, exphurt-style) or it will mislead by
  4x. The analyzer should gain a person-kind denominator
  flag in a future arm rather than hand-computed post-hoc
  shares as done here.
- The death line is spoken after registerDeath, so a
  death-time transcript window cannot quote it. Future
  sense-test instruments that want the death line itself
  must capture post-death lines (a trailing window), not a
  pre-death window.
- Convergence state for this axis (food-economy, wild-bucket
  blank): BUCKET DECOMPOSED (this arm: 132/132 certain).
  The next step is a REPORTING arm (use the split in
  death-share reporting; optionally name the monster in the
  death line from the live fight record), not another
  measurement band.

## OUT-OF-SCOPE FINDINGS (for the coordinator — not chased)

1. Death-line narration blank (the finding itself, now
   proven): the playerDeath line says "the wild" while the
   live fight record names the killer monster. A future arm
   could pass the monster name into the death line. No
   telemetry is missing — this is a label fix, not a data
   fix.
2. Armor-absorb figure oddity (observation, not a claim):
   one Eulogy kill window shows "Armor absorbs 6978" before
   "You go down." Quoted as recorded; whether that figure is
   honest (a scripted kill's gross damage vs absorbed) was
   not investigated here.
3. Ledger default dormant, not dead: playerDeath's
   `cause || 'the wild'` fallback never fired on this band
   (no bare caller exists), but it remains the fallback for
   any future caller that passes no cause. A future hygiene
   arm could audit that default — it did not mislabel
   anything here.
