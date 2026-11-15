# H1 transplant — family 8fam MATCHED-BAND rerun: NOT-CARRIER, bit-identical trajectories (arm sim-transplant8fam-match-a)

Run: fleshout-20261115T1615Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant8fam-match-a` (worktree
`~/workspace/worktrees/sim-transplant8fam-match-a`, base master
`b4343ac9d`).
Binding prereg: evidence/2026-11-15/sim-transplant8fam-match-prereg.md
(committed fc8f8e6cf — rebased from 04ed713d9 after master moved to
84d68a5b5; proof stage 1 green 144/144, BEFORE any judged leg).
Subject: branch `transplant-8fam-subject`, commit
`b6ec3c7d1c700c3cab26c6bd578074588f7901f5` (adopted, verified hunk-by-hunk
at run start — §Subject adoption in the prereg; proof §8 green).
Family: the four CONFLICTED PR #22 hunks, theirs-resolved onto the far
end `203a32775` — (1) conversation.js lesson-outcome/diegetic-act
(plantTeachOutcome); (2) convo-dialogue.js favor settlement
(liveUnfinished); (3) convo-dialogue.js favor-line sayLine
(helpStructural); (4) convo-dialogue.js blocked-repeat (UNFINISHED
HELP BLOCKED).

## Verdict — NOT-CARRIER (bit-identical trajectories)

- Baseline leg `ep-far-8fam-match` (far end 203a32775, matched band
  190391–190398, 150d, competent verbatim own-policy a7ff5c51, fix
  standing f8fda4295a99 swapped in, native restored byte-identical):
  survived 4/8 — per-seed days 86/144/150/43/150/87/150/150, GOOD,
  rank REGIONAL_INTACT, median 150d, instrument errors 0. Gate
  (≥3/8 PROCEED) HELD. The baseline leg reproduces the settled
  far-end baseline EXACTLY (count AND per-seed days) — a fifth
  corroboration (masterregress, 8b, the 0427Z 8c rerun, the recovered
  1215Z leg's log lines, and now this leg).
- Subject leg `t8fam-match` (subject b6ec3c7d1, same band/conditions):
  survived 4/8 — per-seed days 86/144/150/43/150/87/150/150, GOOD,
  rank REGIONAL_INTACT, median 150d, instrument errors 0.
- The subject is BIT-IDENTICAL to the baseline: all 8 per-seed JSONs
  are identical after stripping the `step` / `anchorCommit` metadata
  fields (verified file-by-file; the only diffs in the raw files are
  those two fields). Every wall field matches: wins 0, national 0,
  table 0, regional 7, village 1, wave5 2, wave4 8, median 150d,
  deaths 629, standing 150–325, blooded 4. The four conflicted hunks
  do not move a single sim outcome on this band under the competent
  policy — the repair never fires in survival play, exactly as 8b/8c
  found for their hunks. The survival question for family 8's
  conflicted four is now MEASURED: NOT-CARRIER.
- This closes the family-8 question for survival: 8b (three clean
  hunks) NOT-CARRIER bit-identical, 8c (excluded dlg:more hunk)
  NOT-CARRIER bit-identical, and now the four conflicted hunks
  NOT-CARRIER bit-identical. No piece of origin family 8, measured
  alone, collapses the far end. The 1425Z UNMEASURED-sniff verdict
  for this same family is superseded by this measured verdict (the
  fresh band was the blocker, not the family).

## Legs

- Baseline leg `ep-far-8fam-match`: step script run AS-IS from the
  repo (it hardcodes the matched band — no /tmp copy, no band edit).
  16:30:22–16:39:07Z (~8m45s). Summary:
  evidence/2026-11-13/culpritbisect-a-ep-far-8fam-match-summary.json;
  corpus
  evidence/2026-11-13/perseed-culpritbisect-a-ep-far-8fam-match/
  (8 per-seed JSONs); driver log
  evidence/2026-11-13/culpritbisect-a-ep-far-8fam-match-driver.log.
  Per-seed: 190391 d86 village-lost (wave 4, standing 199, deaths
  88); 190392 d144 village-lost (wave 4, 199, 77); 190393 d150
  survived (wave 5, 325, 66); 190394 d43 village-lost (wave 4, 150,
  52); 190395 d150 survived (wave 4, 199, 96); 190396 d87
  village-lost (wave 4, 199, 80); 190397 d150 survived (wave 5, 275,
  74); 190398 d150 survived (wave 4, 199, 96). Fix standing verified
  swapped in (f8fda4295a99), policy a7ff5c516440, native standing
  restored byte-identical (75762cb2… on the far end).
- Subject leg `t8fam-match`: same script, same conditions, subject
  commit b6ec3c7d1. 16:40:38–16:44:18Z (~3m40s). Summary:
  evidence/2026-11-13/culpritbisect-a-t8fam-match-summary.json;
  corpus evidence/2026-11-13/perseed-culpritbisect-a-t8fam-match/;
  driver log
  evidence/2026-11-13/culpritbisect-a-t8fam-match-driver.log.
  Per-seed days identical to baseline (see verdict). Fix standing
  verified swapped in, policy a7ff5c516440, native standing restored
  byte-identical.
- No sniff leg in this run (matched band is healthy; the sniff was a
  fresh-band tripwire). The 1425Z sniff corpus
  (`ep-far-8fam-sniff`, 0/4) stays on master, untouched.

## Wall (this run's judged corpora — baseline and subject identical)

national 0/8, table 0/8, wins 0/8, wave-5 2/8, wave-4 8/8, median
150d, deaths 629 (villager combat 267, combat 130, expedition 126,
the wild 74, monster 13, starvation 1/629 — villages die fighting,
not hungry). Rank REGIONAL_INTACT (7/8 regional, 1/8 village).
Standing 150–325, blooded 4/8. No village reached national or the
table on either leg; the scale wall stands on the matched band.

## Reachability verdict

Waves 1–4 reached on all 8 seeds; wave 5 unlocked on 2/8 (190393,
190397 — both survived to 150d). Regional reached on 7/8; national,
the table, and the win flag reached on 0/8. The family under test
changes none of it: the subject's reachability is the baseline's,
seed for seed.

## Village assessment (plain words)

Eight villages on the same eight seeds, twice over, lived the same
lives both times — the four conversation hunks changed nothing about
any of them. Four villages survived to day 150 (two of them opening
wave 5); four were lost, the earliest at day 43 (190394, still a
village, never regional) and the latest at day 144 (190392). The
villages that died, died fighting monsters at the door and on
expeditions — 523 of 629 deaths are combat in one of its three
forms, against a single starvation death. Food is not what kills
these villages; monsters are. The survivors banked standing in the
150–325 range and stalled at regional: strong enough to live, never
strong enough to go national. The pantry ran dry only at the very
end of lost villages (endPantryKcal 0 on the four lost seeds), a
symptom of collapse, not its cause. Nothing in either leg suggests
a village on the edge of the table — the gap between regional and
national is the wall, and this family is not a brick in it.

## Family-test leg (dialogue instrument — judged separately, never a verdict input)

- Conflicted script `scripts/test-transplant8fam-conflicted.js`,
  far-end control (pathspec extract of the far end to /tmp, seed 1/7
  staging, script copied in from the arm branch — it does not exist
  at the far end): exit 1 — H-settled PASS (both answer "It's already
  handled"); H-unfinished, B-test, L-test all show pre-fix CONTROL
  behavior (far end answers "already handled" with a live unfinished
  outing; falls through to the dup repeat instead of the fell-back
  early return; delivers the secret react as a diegetic act). Probes
  staged cleanly (B: "Nothing I can name. Company's enough."; L:
  "Thank you. ...I needed someone to know, and I needed it to stop
  there.") — identical probe lines to the 1425Z run.
- Same script on the subject (pathspec extract of `b6ec3c7d1` to
  /tmp): exit 0 — ALL FOUR cases pass (H-settled, H-unfinished,
  B-test, L-test). "TRANSPLANT8FAM CONFLICTED: PASS (8fam behavior
  holds)". The four hunks are behaviorally live and distinct on this
  substrate: the favor-settlement guard, the fell-back early return,
  and the secretOutcome removal each change what the villager says.
  The survival verdict is survival-inertness, not dialogue
  inertness — the hunks work; the competent bot never drives them
  in survival play.
- Dialog-audit #4 proof `scripts/test-live-thread-engage-dry-20261108.js`
  (merge blob `a0161cc9…`) against the subject extract: exit 1,
  RESULT: 3 FAILURES — all pre-registered, none a regression: Dale
  goon setup fails `TypeError: Game.convoHasLiveUnfinished is not a
  function` (an 8b method, reversed out of this subject); Dale-honest
  fails twice on missing-8b-content grounds (goon dried while
  unfinished remained; should name unfinished work structurally);
  the #14 favor/debt check fails MODULE_NOT_FOUND
  (`test-favor-debt-help-coherence-20261108.js` absent at the far end
  and the subject — the pre-existing substrate gap 8b documented).
  The one #4 shape this subject could carry — the Ruth plant-lesson
  resume — RAN and produced a coherent non-dry follow-through
  ("Honestly, we never finished talking about that plant lesson — we
  got cut off. 'The chickweed by the creek — how to tell it from the
  lookalike.'"). Diagnostic only, as pre-registered.
- /tmp tmpfs note: both extracts are 199M (pathspec only, never a
  full-tree extract). The "fatal: not a git repository" lines in both
  extract runs are harness version-detection noise in a non-repo
  extract, not failures. The extracts were deleted after their runs.

## Sense-testing (vetSays census, both corpora — 225 lines each, bit-identical)

Censused every vetSays line in both corpora (per-seed: 190391: 29,
190392: 23, 190393: 18, 190394: 15, 190395: 30, 190396: 14, 190397:
65, 190398: 31; 173 distinct of 225):

- "lost my train of thought" (dry): 0. "Still on" (resume): 0.
  "already handled" (settled favor): 0. Dry-fallback lines: 0.
  `secret:`: 0. Teach / plant lesson: 0. Help: 0. Favor: 0.
- "unfinished" (any): 7 — all seven are the SAME scripted System ARC
  IV beat ("yours, though unfinished, are undeniable"), one per
  regional village, not family dialogue. Same finding as the 1425Z
  run (4 hits, same beat).
- The lines themselves are event-driven, named, and coherent: door
  fights with real outcomes ("Lulwa, Leo, Raj, Meera and Ingrid met
  them at the door — 4 put down, 1 driven off"), veteran-kill
  call-outs ("Kurt just put down Ad Break... on CAMERA. That's a
  veteran kill, folks. REMEMBER the name."), the ARC IV landing.
  Villagers read like people reacting to real fights, not a
  transcript loop. The family's dialogue surface is unexercised in
  the survival sim, same as 8b/8c — the competent bot never opens a
  Help exchange on a live unfinished thread, so the live paths the
  family-test leg proves never fire in play. One corroboration, not
  a new finding: the age-description fallback already open in the
  backlog (sim-transplant7redef-a's "Aria, the person in their 60s";
  sim-transplant7redef-match-a's matched-band instances) recurs here
  once — seed 190394 day 7, "the woman in her 30s, with weathered
  hands" in a door-fight line. No new flag for the findings backlog
  from this census (the ARC IV verbatim repeat across seeds is a
  scripted System beat, already noted in the 1425Z evidence).

## Metric review (§14 — never re-scored mid-run)

- The metric set held: survived/8 with the ≥3/8 baseline gate and
  the ≤1/8 CARRIER / 2/8 AMBIGUOUS / ≥3/8 NOT-CARRIER mapping judged
  the run exactly as pre-registered, and the expected NOT-CARRIER
  form (subject identical to baseline, count AND per-seed days)
  arrived in its strongest form (bit-identical per-seed JSONs).
  No metric revision is proposed for the next run.
- One instrument note for the next run: the proof's §9 "settled
  baseline" legs read the committed `culpritbisect-a-ep-far`
  summary from master — that anchor is now five corroborations
  deep and could be retired to a single-line anchor check, but it
  costs nothing and stays.

## Proofs

- `scripts/test-transplant8fam.js`: stage 1 green 144/144 at prereg
  commit (fc8f8e6cf); re-run after both legs — 157/157 in the
  full-legs state (153 passed + 4 evidence-file legs at the
  intermediate re-run before this file was written; final 157/157
  re-run after this file was written, before its commit).
  Full-legs branch taken (baseline ≥3/8, subject present, verdict
  NOT-CARRIER).
- `scripts/test-culpritbisect-a.js` (116 legs) re-run in place on
  the arm branch as the reused-tooling check: 116 passed, 0 failed.
  (Run in place — its requires are repo-relative, so a /tmp copy
  cannot resolve them; the prereg's "/tmp copy" note was wrong
  about the mechanics, same correction as the 1425Z run recorded.
  The run writes nothing to the repo.)
- `scripts/test-transplant8fam-conflicted.js` — far-end control
  exit 1 (expected), subject exit 0 (all four cases pass); see
  §Family-test leg.

## Telemetry deviation check

Attempted per Loop A body step 10:
`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-13/perseed-culpritbisect-a-ep-far-8fam-match/*.json'
--metrics national,table,wins,exiled` — REFUSED: "refusing
recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs." Recorded,
not waived; baseline NOT rolled. No LOUD lines (the tool refuses
before comparing).

## Infrastructure

- SAFE-COMMIT CLOBBER: struck once, on the prereg commit
  (fc8f8e6cf, pre-rebase 04ed713d9) — the main index showed the prereg staged-deleted
  and the proof MM after a correct commit. Repaired with the
  documented `git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info` pipe; verified worktree hash == HEAD blob
  for both files and `git status` empty before any leg ran.
- /tmp FULL: at family-test time /tmp was 100% (512M used) — the
  1425Z run's extracts `/tmp/fam8far` + `/tmp/fam8subj` (199M
  each) were still sitting there from its completed, merged run,
  plus my own partial extract (78M). No process was using them
  (checked `ps` — only an unrelated journey-establishment check
  was running). Removed the two stale extracts and my partial one
  (476M freed), then ran the pathspec extracts per the prereg
  (199M each, deleted after their runs; /tmp back to 8% after).
  Stale /tmp scratch from completed runs is worth a reaper sweep
  — logged as a finding below.
- WRITE FLAP: no flap window struck this run. Flap-watch log read
  ALL-OK at run start (16:11–16:16Z); all writes and commits went
  through. Disk /home 42% at run start.
- No rebase was needed (master did not move under this arm;
  base b4343ac9d still the tip at the final proof re-run).
- check.js --quick NOT re-run (zero src/js on this branch; loop
  precedent).

## Findings backlog (appended to sim-findings.md)

- [open] 2026-11-15 — infra — /tmp tmpfs fills with stale
  pathspec extracts from completed arms (1425Z 8fam left
  fam8far/fam8subj, 398M, behind after merging; this run's
  family-test leg could not extract until they were removed) —
  a reaper sweep for /tmp scratch older than the owning run
  would prevent the next arm hitting a full tmpfs mid-run
  (this run's evidence).

## Blanks filled

- Tracker next-blank (1) from round-1415: family 8's conflicted
  four, matched-band rerun — MEASURED, NOT-CARRIER, bit-identical.
  The 1425Z UNMEASURED-sniff verdict is superseded. Family 8 is
  now fully measured for survival: every piece measured alone is a
  non-carrier. The collapse, if it is in the merge at all, is not
  in any single piece of family 8 — it is in the merge's
  combination, or elsewhere.
