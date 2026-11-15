# H1 transplant — narrowed family 8c: the excluded second dlg:more hunk of PR #22 (arm sim-transplant8c-a)

Run: fleshout-20261115T0215Z (Loop A), axis scale-onramp (survival collapse).
Prereg: evidence/2026-11-14/sim-transplant8c-prereg.md (committed BEFORE
cutting the subject or running any judged sim).
Arm branch: `sim-transplant8c-a` (worktree
`~/workspace/worktrees/sim-transplant8c-a`, rebased onto master 4c9d3c940
at run end; arm commits bc6567bde + 8438ddd02).
Subject branch: `transplant-8c-subject`, commit
2cd6720b00faf728dae8818ade87961b3839d059 (left in place, one commit on
the far end 203a32775).
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue,
talk, gossip — the family's area). No canon invented or rewritten.

## Verdict: UNMEASURED (baseline gate) — the far end reads survived 1/8 on the fresh band

The fresh-band baseline leg reads survived **1/8** — below the
pre-registered gate (≥3/8 to proceed). Per the committed prereg, the
run STOPPED: no subject leg was cut, and the 8c survival question is
UNMEASURED on this band. A subject leg would have been uninterpretable
— the baseline already sits at the merge's 1/8, so a subject reading
1/8 could not distinguish "the hunk collapses the far end" from "the
band is hard". The 1/8 is a real read, not a harness artifact (0
instrument errors on all 8 seeds; fix standing f8fda4295a99 verified
swapped in; far-end policy a7ff5c51; seeds exactly 190541–190548).

The family-test verdict is reported SEPARATELY, and it is the opposite
story: the hunk works exactly as designed — scripts/test-transplant8c-dlgmore.js
passes both cases on the subject (exit 0) and fails both on the far end
(the pre-fix control, exit 1).

## The question

Does the remaining unmeasured piece of the dialog-coherence audit #4
repair — narrowed family 8c, the second dlg:more hunk of merge
`713eb7545` (PR #22 live-thread-dry-engage), which narrowed family 8b
EXCLUDED — alone collapse the far end `203a32775` (GOOD 4/8 on the
matched band) toward the merge's 1/8? Family 8b measured NOT-CARRIER on
the three clean hunks of PR #22; this arm measures ONLY the excluded
continuation hunk: `src/js/convo-dialogue.js @@ -293,11 +308,27 @@`,
+17/−1 — the `line: said` success return, the `_sayFellBack`
early-return, and the dry-branch unfinished-name block. Nothing 8b
already measured, nothing else from the merge. The subject diff is
verified byte-identical to that hunk (proof §8).

## Baseline leg ep-far-8c (far end, fix standing swapped in)

Gate: reproduce far-end health at ≥3/8 on the fresh band or stop. FAILED.

- Survived 1/8. Per-seed days: 122/134/150/92/67/150/150/114 —
  median 134d.
- Per-seed: 190541 122d lost (wave4, standing 145, deaths 90);
  190542 134d lost (wave4, 175, 75); 190543 150d lost (wave5, 470, 72);
  190544 92d lost (wave4, 199, 76); 190545 67d lost (wave4, 199, 53);
  190546 150d lost (wave4, 199, 82); 190547 150d SURVIVED (wave5, 700,
  133); 190548 114d lost (wave4, 199, 75).
- Rank: REGIONAL_INTACT (regional 6/8, village 2/8). Wall: wins 0,
  national 0, table 0, wave5 2/8, wave4 8/8, median 134d, deaths 656,
  standing 145–700, blooded 1.
- Death causes (656): villager combat 257, expedition 178, combat 103,
  the wild 83, monster 17, contest 3, starvation 2, thirst 2, the arena
  2, singletons 8 (The Static Kite, Gavel, Big Ugly, The Eater, Grief
  Counselor, Big Loud, a wound that wouldn't close, sickness, ambush 1
  each).
- Instrument errors 0. Analyzer exit 0 (verdict BAD, the bisect
  classification for ≤1/8). Summary:
  evidence/2026-11-13/culpritbisect-a-ep-far-8c-summary.json;
  corpus evidence/2026-11-13/perseed-culpritbisect-a-ep-far-8c/
  (8 per-seed JSONs); driver log
  evidence/2026-11-13/culpritbisect-a-ep-far-8c-driver.log.
- Leg wall time ~27 min (box load 21.78 at leg end — sibling loops
  running concurrently; sims are seeded/deterministic, load costs time
  only, never outcomes).

## What it means

The far end's settled 4/8 does NOT generalize to this fresh band: on
190541–190548 the same far-end code with the same fix standing and the
same policy survives 1/8. Two of the eight villages reach day 150 but
only one survives it (190543 and 190546 both read 150d village-lost —
they die at the horizon). The one survivor (190547) is the strongest
village on the band: standing 700, wave 5, pantry notwithstanding.
Deaths are combat-heavy as ever (257 villager-combat, 178 expedition,
103 combat) and almost never hunger (2 starvation, 2 thirst in 656).

This does not re-judge the matched-band baseline — 4/8 on 190391–190398
was reproduced twice (masterregress, then 8b with identical per-seed
days). It says the far end's health is band-sensitive: the matched band
is a favorable draw, or this band is a hard draw, and an 8-seed read on
one band cannot carry the 4/8 as a universal. The 8c question stays
open: the hunk is unmeasured for survival, and the only way to measure
it under the prereg's gate is a band on which the baseline reads ≥3/8.
That is the coordinator's call — a matched-band rerun would make the
question measurable, but switching bands after seeing this baseline
would be outcome-driven band selection, so it needs a fresh coordinator
decision + prereg, NOT this arm's call. This arm does NOT re-judge 8b
(NOT-CARRIER stands) or any prior verdict.

## No subject leg (STOP)

No `t8c` step exists: no subject summary, no subject driver log, no
subject per-seed corpus. The subject branch
`transplant-8c-subject` (2cd6720b0) is left in place for a possible
coordinator-directed rerun on a healthy band.

## The family's own test on the subject

`scripts/test-live-thread-engage-dry-20261108.js` run against the
subject tree (pathspec extract to /tmp, since the full-tree extract
fills /tmp):

- Dale goon shape: SETUP FAILURE — `TypeError:
  Game.convoHasLiveUnfinished is not a function` (test line 60). The
  method is an 8b hunk, absent from the 8c subject by definition.
- Dale-honest shape: 2 FAILS — goon dried to "lost my train of
  thought" while unfinished remained. The goon live-unfinished
  delivery is an 8b hunk, absent from the 8c subject by definition.
- Resume (unfinished plant lesson) engage: GREEN — coherent (non-dry)
  follow-through, opener "Honestly, we never finished talking about
  that plant lesson". This is the one #4 shape that runs through
  dlg:more — the 8c hunk's handler — and it passes.
- The parent runner reports 3 FAILURES total (Dale goon setup + 2×
  Dale-honest) and the #14 favor/debt Help check fails on a missing
  file (`scripts/test-favor-debt-help-coherence-20261108.js` is ABSENT
  at the far end and at the subject — MODULE_NOT_FOUND on spawn, the
  pre-existing far-end substrate gap 8b documented).

So the #4 proof is NOT-GREEN on the 8c subject, and all three failures
are missing-8b-content / missing-substrate, none of them touches the
8c hunk. The hunk's own behavior is proven by the dedicated script
below, reported separately from the survival verdict.

## The 8c behavior, proven directly (scripts/test-transplant8c-dlgmore.js)

Staged ledger-blocked dlg:more beats (whole pastFollow pool poisoned
into the run ledger), before/after on identical staging:

- Case A (blocked beat, dry pool available): far end (control) returns
  the phantom composed beat ("Ask me what I miss and I'll lie. ...")
  while the transcript holds the dry line ("...Sorry, lost my train of
  thought.") — FAIL, as pre-registered. Subject returns what was
  actually spoken (`r.line === lastThem`, the dry line) — PASS.
- Case B (blocked beat, dry pool exhausted, `c.dryLines = 9`): far end
  (control) falls through to the dry branch and speaks "That's the
  whole of it. Sorry." — FAIL, as pre-registered. Subject takes the
  early return: `r.line === null`, `c.threadDryFor === c.thread`, no
  second line emitted, `_sayFellBack` still true post-turn — PASS.
- Script exit 1 on the far end, exit 0 on the subject. The hunk does
  exactly what its comment says, on the only two paths that are live
  without the 8b methods; the dry-branch unfinished-name block stays
  inert on far-end substrate (no `convoHasLiveUnfinished` to call),
  exactly as the prereg's mechanism analysis predicted.

## Sense-testing (SENSE-TESTING LAW)

Census of the baseline corpus (440 vetSays lines, 8 seeds):

- "lost my train of thought" 0, "Still on" 0 — same as 8b. The
  competent bot never drives a dlg:more beat into a ledger block in
  sim, so the 8c paths never fire in the survival corpus. The survival
  leg cannot speak to the hunk's dialogue behavior; only the dlgmore
  script above does.
- What the villagers do read as: teaching spreads person to person
  ("Jorge taught everyone about European Elder. The Codex grows
  without you lifting a finger."; "Aaliyah showed Chloe the European
  Elder — 'remember it.'"), door fights are named group efforts
  ("Aaliyah, Hilda, Javier and Jingjing met them at the door — 3 put
  down, 1 driven off."), knowledge deepens over days ("the foragers
  have handled it 8 days running. They know it now"). Nothing robotic
  in the narration; nothing repeated verbatim across seeds beyond the
  shared event grammar.
- Corpus limitation, carried forward (8b's note): the per-seed JSONs
  retain no conversation transcript text (sayCount is a bare count;
  vetSays is event narration), so a dialogue family's live behavior
  cannot be censused from the sim corpus at all — only from its own
  test.

## Village assessment (plain words)

One of eight villages lives to day 150 and survives; two more reach
day 150 and die there; the rest die at the door or on the road between
days 67 and 134. The ones that live reach the region (6/8 regional)
but none reach national, the table, or a win — the scale wall stands
exactly where the far end left it, on this band too. Two villages
unlock wave 5; all eight unlock wave 4. People die fighting (257
villager-combat deaths, 178 expedition, 103 combat) and almost never
of hunger (2 starvation deaths in 656). The village that dies on day
67 never gets past village standing; the day-150 survivor sits at
standing 700, regional, wave 5 — the strongest village on the band,
and still nowhere near national. Nothing in this run changes any of
that — the baseline leg is the far end itself, on a harder draw.

## Reachability

Waves 1–5: wave 4 reached 8/8, wave 5 reached 2/8. Regional 6/8.
National 0/8, table 0/8, wins 0/8. Arc II/III/IV and the win flag
remain unreached on this band.

## Blanks filled / documented

- FILLED (measured): narrowed family 8c is UNMEASURED for survival —
  the fresh-band baseline (1/8) fails the pre-registered gate, so no
  subject leg was cut. The question is open, not answered.
- FILLED (measured): the 8c hunk's dialogue behavior is PROVEN —
  both live paths behave as designed on the subject and fail on the
  far-end control (dlgmore script exit 0 vs 1).
- DOCUMENTED: the far end reads 1/8 on fresh band 190541–190548 vs
  4/8 on the matched band — far-end health is band-sensitive; a
  matched-band rerun is the coordinator's call (fresh prereg needed).
- DOCUMENTED: the #4 proof cannot run whole on an 8c-only subject
  (Dale goon setup needs the 8b method; Dale-honest needs the 8b goon
  delivery) — future narrowed arms on old bases should expect the
  #4 proof to fail on missing 8b content, not on their own hunk.
- DOCUMENTED: the #14 sub-test file is absent at the far end — the
  family test cannot run whole on far-end substrate (8b's finding,
  reproduced here).
- DOCUMENTED: safe-commit.sh index clobber struck 3× this run (prereg
  commit, subject commit as MM, proof-amendment commit as MM) — all
  repaired with the documented `ls-tree | update-index --add
  --index-info` recipe; every affected commit verified byte-identical
  (worktree hash == HEAD blob) before continuing.
- DOCUMENTED: the step script + analyzer hardcode the matched band —
  this run's fresh band ran through /tmp copies with the band edited in
  the copy only (step script: SEEDS line + analyzer invocation;
  analyzer: SEEDS constant). The committed tooling is unedited.
- DOCUMENTED: prereg/proof section-numbering offset — the prereg says
  "Sections 7 (live subject state) and 8 (step corpora)" but the proof
  implements them as §8 and §9 (a mechanism section was added as §4);
  cosmetic only, no threshold or definition affected.

## Telemetry deviation check

Attempted per the loop body (telemetry-check.js, baseline
scale-wall.json, current the ep-far-8c per-seed corpus, metrics
national,table,wins,exiled): REFUSED — "recorder-corpus input:
all 8 --current rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs" (exit 0, refusal message on stdout).
Recorded, not waived; baseline NOT rolled. Same refusal class as all
prior bisect / transplant arms.

## Proof

- `scripts/test-transplant8c.js` — stage 1 green at prereg
  (107/107); §8 (live subject state) green after the subject cut
  (12/12: parent is the far end, diff exactly +17/−1 one file,
  byte-identical to the family 8c hunk, test file absent, no 8b-only
  strings, policy + standing match the far end); §9 takes the
  GATE-STOP branch after the baseline leg (baseline 1/8 ≤ 2, no
  subject summary/log/corpus, evidence records UNMEASURED). Final
  re-run after the evidence commit: 122 passed, 0 failed.
- `scripts/test-transplant8c-dlgmore.js` — far-end control FAIL
  (both cases, exit 1) before the subject; subject PASS (both cases,
  exit 0) after.
- `scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm
  branch as the reused-tooling check: 116 passed, 0 failed.
- No game-code change is committed by this arm on the arm branch
  (the subject lives on its own branch `transplant-8c-subject`, left
  in place); no `[needs-eyes]` applies. Committed on the arm branch:
  prereg, proof scripts, this evidence file, the baseline step corpus
  + summary + driver log. The `scripts/culpritbisect-analyze-8c.js`
  scratch copy (SEEDS constant edited) was DELETED after the legs,
  never committed.

## Metric review (§14 — filled after the run, never re-scored)

- The primary metric (survived/8, ≤1 CARRIER / 2 AMBIGUOUS /
  ≥3 NOT-CARRIER) never got a subject to judge: the baseline gate
  (≥3/8) is the metric's precondition, and it failed at 1/8. The
  gate held exactly as pre-registered — the run stopped instead of
  producing an uninterpretable subject number. No re-scoring: the
  1/8 was NOT re-judged as a CARRIER signal (the baseline already
  sits at the merge's 1/8; a subject 1/8 would have meant nothing).
- Metric lesson, carried forward: the prereg's gate assumed the
  fresh band would reproduce far-end health (4/8 by analogy with the
  matched band). It did not. A fresh band needs its own baseline
  expectation stated as a RANGE or the gate needs a band-health
  pre-check (e.g. a 4-seed sniff before committing the full leg) —
  propose for the next run: state the expected baseline band
  explicitly and pre-register what happens if the baseline reads
  below it (this run's STOP is that behavior, now proven).
- The family-test metric (dlgmore script exit 0/1) held cleanly:
  control FAIL on the far end, PASS on the subject, both cases.
  The #4 proof's 3 failures are fully explained by missing 8b
  content/substrate — no metric revision needed there, but the next
  narrowed arm should pre-register the #4 proof as EXPECTED-FAIL on
  missing-method grounds rather than discovering it mid-run.
- No metric revision proposed for the next run beyond the
  band-health pre-check note above.
