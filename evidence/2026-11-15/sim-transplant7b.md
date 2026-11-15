# H1 transplant — narrowed family 7b: the objectives-side half of PR #30 alone (arm sim-transplant7b-a)

Run: fleshout-20261115T0115Z (Loop A), axis scale-onramp (survival collapse).
Prereg: evidence/2026-11-15/sim-transplant7b-prereg.md (committed BEFORE
cutting the subject or running any judged sim; one correction recorded
pre-step — see §Prereg correction).
Arm branch: `sim-transplant7b-a` (worktree `~/workspace/worktrees/sim-transplant7b-a`).
Subject branch: `transplant-7b-subject`, commit
2a9d936548c3ace6b86fcc0b7fd86accab141332 (left in place, one commit on
the far end 203a32775).
Canon: docs/CANON.md read first; docs/VILLAGER-BRAIN.md §4/§5 read (the
family's area). No canon invented or rewritten.

## Verdict: NOT-CARRIER — subject identical to baseline, count AND per-seed days

The narrowed family 7b — the villager-objectives.js hunks of PR #30 alone
(+19/−7, 5 hunks, byte-identical to the merge's hunks) + the honesty test
file + the green-list union line — reads survived **4/8** on the matched
band, the exact expected NOT-CARRIER form: the subject corpus is
byte-identical to the baseline corpus on every judged field (per-seed days
86/144/150/43/150/87/150/150, wall, death-cause shares, standing, tribute).
The objectives-side wiring is inert without the brain module, exactly as
the prereg's mechanism analysis predicted: `finishLottery` calls
`vbrainAlignObjective` only when loaded, and the align function does not
exist on far-end substrate. The collapse's carrier is NOT the
objectives-side half of PR #30. The brain-side half (villager-brain.js,
the align function itself) remains unmeasured — it cannot be transplanted
onto the far end at all (missing-substrate wall, family 7).

## The question

Does the objectives-side half of PR #30 alone collapse the far end
`203a32775` (GOOD 4/8 on the matched band) toward the merge's 1/8? Full
family 7 (merge `23245d5d6`, PR #30 dawn honesty, OVE-37 port, OVE-36
Candidate A) is UNMEASURED: its cherry-pick stopped on four unmerged
paths (ONTOLOGY.md UU, green-list.txt UU, villager-brain.js DU,
test-villager-brain-dawn.js DU). This arm measures ONLY the narrowed
family 7b defined in the prereg. Nothing the full-family arm already
measured (nothing — it measured no survival number), nothing else from
the merge.

## Prereg correction (pre-step — the one factual error in the first draft)

The prereg's first draft claimed the green-list union line goes "after the
`test-villager-brain-dawn.js quick` line, which already exists at the first
parent and at the far end". That is WRONG for the far end: the brain-dawn
line exists at the first parent and at the merge but is ABSENT at the far
end (the far-end green list goes `test-village-smoke-20261011.js` →
`test-villager-gear-20261009.js` directly — verified live). The union
therefore inserts the honesty line after `test-village-smoke-20261011.js`
— the merge's preceding SURVIVING line, the same position relative to the
neighbors that exist at the far end. The brain-dawn line itself is NOT
added (it names the excluded brain test file, which does not exist on the
subject). The correction was committed (e28467624) BEFORE any judged sim
ran and BEFORE the subject was committed; the family definition is
unchanged (one line, union); only the anchor description was wrong. The
proof carries anchor legs for the corrected position (§5, 91/91 at
prereg stage, now extended — see §Proof).

## Baseline leg ep-far-7b (far end, fix standing swapped in)

Gate: reproduce far-end health at ≥3/8 on the matched band or stop.
PASSED — the settled read reproduces exactly.

- Survived 4/8. Per-seed days: 86/144/150/43/150/87/150/150 —
  identical to the settled matched-band read (masterregress, then 8b).
- Per-seed: 190391 86d lost (wave4, standing 199, deaths 88);
  190392 144d lost (wave4, 199, 77); 190393 150d SURVIVED (wave5, 325,
  66); 190394 43d lost (wave4, 150, 52); 190395 150d SURVIVED (wave4,
  199, 96); 190396 87d lost (wave4, 199, 80); 190397 150d SURVIVED
  (wave5, 275, 74); 190398 150d SURVIVED (wave4, 199, 96).
- Rank: REGIONAL_INTACT (regional 7/8, village 1/8). Wall: wins 0,
  national 0, table 0, wave5 2/8, wave4 8/8, median 150d, deaths 629,
  standing 150–325, blooded 4.
- Death causes (629): villager combat 267, combat 130, expedition 126,
  the wild 74, monster 13, contest 3, ambush 3, a wound that wouldn't
  close 3, Spool 2, a stranger 2, the arena 2, the night 1, Big-Eyes 1,
  alien 1, starvation 1.
- Instrument errors 0. Analyzer verdict GOOD. Summary:
  evidence/2026-11-13/culpritbisect-a-ep-far-7b-summary.json; corpus
  evidence/2026-11-13/perseed-culpritbisect-a-ep-far-7b/ (8 per-seed
  JSONs); driver log evidence/2026-11-13/culpritbisect-a-ep-far-7b-driver.log.
- Fix standing f8fda4295a99 verified swapped in; far-end policy
  a7ff5c51; seeds exactly 190391–190398. Leg wall time ~3 min.

## Subject leg t7b-23245d5d6 (7b subject, fix standing swapped in)

- Survived 4/8. Per-seed days: 86/144/150/43/150/87/150/150 —
  IDENTICAL to the baseline leg, seed for seed.
- Per-seed fields identical to baseline on every seed: days, endReason,
  won, villageLost, scaleRank, maxWave, unlockedWave, standing, deaths,
  endPantryKcal, blooded, ready4, ready5, ladderVets4, errors,
  snapshotCount, finalSnapDay, and the full tribute object. Wall
  identical (wins 0, national 0, table 0, regional 7, village 1, wave5
  2/8, wave4 8/8, median 150d, deaths 629, standing 150–325, blooded 4).
  Death-cause shares identical to the count (629: villager combat 267,
  combat 130, expedition 126, the wild 74, monster 13, the rest
  singletons as in the baseline).
- Instrument errors 0. Analyzer verdict GOOD. Summary:
  evidence/2026-11-13/culpritbisect-a-t7b-23245d5d6-summary.json; corpus
  evidence/2026-11-13/perseed-culpritbisect-a-t7b-23245d5d6/ (8 per-seed
  JSONs); driver log evidence/2026-11-13/culpritbisect-a-t7b-23245d5d6-driver.log.
- Subject per-seed anchorCommit 2a9d936548c3, standingFix true,
  standingSha f8fda4295a99, policySha a7ff5c516440; native standing
  75762cb2 (== far end) verified at the step.
- Verdict mapping: 4/8 → NOT-CARRIER. No re-run (2/8 AMBIGUOUS rule not
  triggered). No divergence to report — the mechanism prediction
  (identity) held exactly.

## What it means

The objectives-side wiring of PR #30 does nothing at all on far-end
substrate — not "too small to measure", but literally identical
trajectories on all eight seeds, every judged field. The `finishLottery`
guard works as written: without the brain module the call is inert, and
the EXPEDITION-hold narration branch never fires either (nothing at the
far end produces an EXPEDITION objective carrying purpose=chore — the
far-end objectives file contains no "EXPEDITION" string at all). The
survival-relevant half of the dawn-honesty change is therefore the
brain-side align function, not the objectives-side wiring — and that half
cannot be transplanted onto the far end by any mechanical route (the
module the far end never had). Family 7's carrier question now rests
entirely on the brain module, which the transplant program cannot isolate
this way; that is the coordinator's call, not this arm's. This arm does
NOT re-judge family 7 (UNMEASURED stands), 8b (NOT-CARRIER stands), 8c
(UNMEASURED-on-gate stands), or any prior verdict.

## The family's own test on the subject

`scripts/test-dawn-materialize-honesty.js` run against the subject tree
(pathspec extract to /tmp, since the full-tree extract fills /tmp):

- Far-end control (pathspec extract of 203a32775): exit 2, skip
  `villager-brain align API missing` — as pre-registered.
- Subject (pathspec extract of 2a9d93654): exit 2, skip
  `villager-brain align API missing` — identical, as pre-registered.
  The honesty test cannot run whole on a 7b-only subject: its setup gate
  requires `Game.vbrainScorePick` / `Game.vbrainAlignObjective` /
  `Game.vbrainOwnsDawn()`, all of them in the EXCLUDED brain module.
  The skip is a pre-existing far-end substrate gap for the 7b-only
  subject, NOT a regression and NOT a pass — same class as 8c's #4
  finding.

## The 7b behavior, proven directly (scripts/test-transplant7b-finishlottery.js)

Seeded objPick staging (seed 20261108, three living villagers at the
haven), before/after on identical staging:

- Far end (control): exit 0, `alignType: "undefined"`, picks
  SEEK/seek/indoor, HAVEN_CHORE/chore/sweep, SEEK/seek/indoor
  (vids gen_wco817u, gen_gem39ua, gen_1ye3jfq).
- Subject: exit 0, `alignType: "undefined"`, picks IDENTICAL (same vids,
  same kinds/purposes/chores).
- The script exits 0 on BOTH trees by design (identity polarity — the
  opposite of 8c's dlgmore script): the 7b mechanism predicts inertness,
  and the picks prove it at the objective level, not just in the survival
  aggregates. Green/not-green is reported SEPARATELY from the survival
  verdict, per the task brief. (The `fatal: not a git repository` lines
  on stderr during both runs are the sim harness probing git from /tmp —
  harmless; both runs exited 0 with full JSON output.)

## Sense-testing (SENSE-TESTING LAW)

Census of both corpora (225 vetSays lines each, 8 seeds):

- The two corpora's vetSays arrays are IDENTICAL (225/225, same lines in
  the same order) — the strongest form of the identity verdict, in the
  narration itself, not just the counts.
- "EXPEDITION" 0, "dawn hold" 0, "hold chore" 0 — the 7b hold-narration
  path never fires in the survival corpus, as the mechanism note
  predicted. The survival leg cannot speak to the hold narration's
  behavior; only the merge's own test (which skips here) does.
- What the villagers do read as: door fights are named group efforts
  ("Lulwa, Leo, Raj, Meera and Ingrid met them at the door — 4 put down,
  1 driven off." — 41 such lines across the band), veteran kills are
  named on camera ("Kurt just put down Ad Break... on CAMERA. That's a
  veteran kill, folks. REMEMBER the name."), the audience-notes flavor
  lands ("Oh, you survived the AUDIENCE NOTES? Cute. We've stopped
  pretending these are animals now."). 173 distinct lines out of 225 —
  varied narration, not a repeated template. Nothing robotic in the
  narration; nothing repeated verbatim across seeds beyond the shared
  event grammar.
- Corpus limitation, carried forward (8b/8c's note): the per-seed JSONs
  retain no conversation transcript text (sayCount is a bare count;
  vetSays is event narration), so a dialogue family's live behavior
  cannot be censused from the sim corpus at all — only from its own
  test. Here the family's own test skips on missing substrate, so the
  hold narration is unexercised anywhere in this run except by code
  reading.

## Village assessment (plain words)

Four of eight villages live to day 150 and survive; the rest die at the
door or on the road between days 43 and 144. The ones that live reach
the region (7/8 regional) but none reach national, the table, or a win
— the scale wall stands exactly where the far end left it. Two villages
unlock wave 5; all eight unlock wave 4. People die fighting (267
villager-combat deaths, 130 combat, 126 expedition) and almost never of
hunger (1 starvation death in 629). The village that dies on day 43 never
gets past village standing; the day-150 survivors sit at standing 199–
325, regional, one of them tribute-ready (190397, veterans 2/2) and still
nowhere near national. Nothing in this run changes any of that — the
subject is the far end, to the line, and the far end is what it is on
this band.

## Reachability

Waves 1–5: wave 4 reached 8/8, wave 5 reached 2/8. Regional 7/8.
National 0/8, table 0/8, wins 0/8. Arc II/III/IV and the win flag
remain unreached on this band. Identical on both legs.

## Blanks filled / documented

- FILLED (measured): narrowed family 7b is NOT-CARRIER — 4/8, identical
  to baseline on every judged field. The objectives-side half of PR #30
  does not collapse the far end.
- FILLED (measured): the 7b wiring's inertness is PROVEN at the objective
  level — finishlottery exits 0 with identical picks on far end and
  subject (alignType undefined on both).
- FILLED (measured): the honesty test SKIPS (exit 2) on both the far end
  and the 7b subject — the test cannot run whole without the excluded
  brain module; recorded, not a regression.
- DOCUMENTED: the prereg's green-list union anchor was wrong as first
  written (brain-dawn line absent at the far end) — corrected pre-step
  (e28467624), union inserted after the smoke line instead. Future
  narrowed arms: verify union anchors against the FAR END's list, not
  the first parent's.
- DOCUMENTED: the far-end objectives file contains no "EXPEDITION"
  string at all — the hold-narration branch's condition can only be fed
  by the missing align function. The branch is dead code on this
  substrate by construction.
- DOCUMENTED: safe-commit.sh index clobber struck 3× this run (prereg
  commit, subject commit, correction commit) — all repaired with the
  documented `ls-tree | update-index --add --index-info` recipe; every
  affected commit verified byte-identical (worktree hash == HEAD blob)
  before continuing.
- DOCUMENTED: the honesty-test blob is the git blob `77f50489…`, not the
  sha256 `9104f237…` the prereg first recorded — the first draft
  conflated content-sha256 with the git blob id. Corrected in the prereg
  and proof before the subject commit; the subject's test file
  hash-matches the merge blob.

## Telemetry deviation check

Attempted per the loop body (telemetry-check.js, baseline
scale-wall.json, current the t7b-23245d5d6 per-seed corpus, metrics
national,table,wins,exiled): REFUSED — "recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep recorder
rows, not runs" (exit 2, refusal message on stdout). Recorded, not
waived; baseline NOT rolled. Same refusal class as all prior bisect /
transplant arms.

## Proof

- `scripts/test-transplant7b.js` — stage 1 green at prereg (87/87);
  §5 anchor legs added with the prereg correction (91/91); §9 (live
  subject state) + §10 (step corpora) added after the steps: final
  re-run **126 passed, 0 failed** (125/126 pre-commit, dirty-tree leg
  only — the evidence file itself was uncommitted).
- `scripts/test-transplant7b-finishlottery.js` — far-end control exit 0
  (inert, picks recorded) before the subject; subject exit 0 with
  IDENTICAL picks after.
- `scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm
  branch as the reused-tooling check: 116 passed, 0 failed.
- No game-code change is committed by this arm on the arm branch (the
  subject lives on its own branch `transplant-7b-subject`, left in
  place); no `[needs-eyes]` applies. Committed on the arm branch:
  prereg (+ correction), proof scripts, this evidence file, both step
  corpora + summaries + driver logs. The /tmp pathspec extracts
  (far7b, subj7b) were DELETED after the family-test leg, never
  committed.

## Metric review (§14 — filled after the run, never re-scored)

- The primary metric (survived/8, ≤1 CARRIER / 2 AMBIGUOUS /
  ≥3 NOT-CARRIER) held cleanly: the baseline gate (≥3/8) passed at 4/8
  with the settled per-seed days reproduced exactly, and the subject
  read 4/8 — NOT-CARRIER, with the identity form the prereg predicted.
  No re-scoring: the 4/8 was judged by the count thresholds, and the
  identity is reported as the mechanism prediction confirmed, not as a
  friendlier re-score.
- The baseline gate itself proved its worth in the negative on the 8c
  run and its worth in the positive here: on the matched band it passes
  with the settled read reproduced to the day, which is exactly the
  precondition a subject leg needs. No gate revision proposed.
- The family-test metric (finishlottery exit 0 + identical picks on
  both trees) held cleanly with the identity polarity pre-registered —
  the opposite polarity from 8c's dlgmore script, and the prereg said so
  up front, so no mid-run re-interpretation was needed. The honesty
  test's exit-2 skip on both trees is the pre-registered substrate-gap
  outcome, not a metric failure.
- No metric revision proposed for the next run. One standing note
  carried forward (8c's): a fresh band needs its own baseline
  expectation stated as a range — the matched band's settled read is
  what made this run's gate crisp, and a fresh band would not have
  that anchor.
