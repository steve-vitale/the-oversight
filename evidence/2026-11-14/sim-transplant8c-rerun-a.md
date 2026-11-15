# H1 transplant — narrowed family 8c RERUN: matched-band rerun of the excluded second dlg:more hunk of PR #22 (arm sim-transplant8c-rerun-a)

Run: fleshout-20261115T0427Z (Loop A), axis scale-onramp (survival collapse).
Prereg: evidence/2026-11-14/sim-transplant8c-rerun-prereg.md (committed
BEFORE running any judged sim in this run; proof stage 1 green 117/117
at prereg stage). Prior arm: evidence/2026-11-14/sim-transplant8c.md
(0215Z: UNMEASURED on the fresh band — baseline gate failed at 1/8, no
subject leg cut; the fresh-band 1/8 stays on the record and is NOT
re-judged here).
Arm branch: `sim-transplant8c-rerun-a` (worktree
`~/workspace/worktrees/sim-transplant8c-rerun-a`, base master at run
start — HEAD 7ba58d326, the 0215Z coordinator evidence commit).
Subject branch: `transplant-8c-subject`, commit
2cd6720b00faf728dae8818ade87961b3839d059 (cut by the 0215Z arm, left in
place, READ-ONLY in this run — never committed onto, never rebuilt).
Canon: docs/CANON.md read first; docs/CONVERSATIONS.md read (dialogue,
talk, gossip — the family's area). No canon invented or rewritten.

## Prereg header (§14 binding)

- Primary metric: survived/8 on the subject leg.
- GO threshold (carried VERBATIM from the 8c prereg, no re-scoring):
  ≤1/8 CARRIER (with baseline ≥3/8); 2/8 AMBIGUOUS → re-run once with
  a fresh STEP id (2/8 again → recorded AMBIGUOUS, treated as
  NOT-CARRIER for ordering, kept on the suspect list); ≥3/8
  NOT-CARRIER. Expected NOT-CARRIER form: subject identical to the
  baseline leg (count AND per-seed days identical).
- Baseline gate (precondition): the far-end leg must read ≥3/8 on the
  matched band or the run STOPS, no subject leg cut.
- Horizon: 150d death-aware (never a fixed 200d; the far end's settled
  distribution on this band has median 150d with 4/8 surviving to the
  horizon — 150d is where the far end's health is measured).
- Seeds: MATCHED band 190391–190398 (8 seeds), named explicitly before
  any judged sim. Band-health pre-check: the far end's settled 4/8 on
  this exact band was reproduced twice (masterregress, then 8b with
  identical per-seed days 86/144/150/43/150/87/150/150).
- Policies: competent verbatim own-policy, sha `a7ff5c51…` (far end and
  subject identical — the family touches no policy). Fix standing
  `f8fda4295a99` swapped in every step, native `75762cb2…` restored
  byte-identical afterwards, sha-verified.

## Verdict: NOT-CARRIER — the subject reads 4/8 on bit-identical trajectories

The subject leg reads survived **4/8** — and not merely the same count:
every per-seed day, every death total, every death-cause count, every
standing figure, and every wave reach is byte-identical to the baseline
leg. The per-seed corpora differ ONLY in the `step` id and the
`anchorCommit` fields (56 diff lines across 8 files, all of those two
fields). The 8c hunk is survival-inert on the matched band: it changes
no trajectory the competent policy can reach. This is the expected
NOT-CARRIER form from the prereg, in its strongest reading.

## The question

Does the remaining unmeasured piece of the dialog-coherence audit #4
repair — narrowed family 8c, the second dlg:more hunk of merge
`713eb7545` (PR #22 live-thread-dry-engage), which narrowed family 8b
EXCLUDED — alone collapse the far end `203a32775` (GOOD 4/8 on the
matched band) toward the merge's 1/8? Family 8b measured NOT-CARRIER on
the three clean hunks of PR #22. Answer, now measured: NO — 4/8,
identical trajectories. The 8c question is CLOSED for survival: the
hunk does not carry the collapse. (The collapse's carrier is elsewhere
in the merge or in the interaction of its hunks — not this arm's
question, and not re-judged here.)

## Baseline leg ep-far-8c-rerun (far end, fix standing swapped in)

Gate: reproduce far-end health at ≥3/8 on the matched band or stop. PASSED.

- survived 4/8. Per-seed days: 86/144/150/43/150/87/150/150 — BIT-IDENTICAL
  to the settled baseline (masterregress, then 8b). This is the THIRD
  read of the matched band at 4/8 with identical per-seed days.
  Median 150d.
- Per-seed: 190391 86d lost (wave4, standing 199, deaths 88, regional);
  190392 144d lost (wave4, 199, 77, regional); 190393 150d SURVIVED
  (wave5, 325, 66, regional); 190394 43d lost (wave4, 150, 52, village);
  190395 150d SURVIVED (wave4, 199, 96, regional); 190396 87d lost
  (wave4, 199, 80, regional); 190397 150d SURVIVED (wave5, 275, 74,
  regional); 190398 150d SURVIVED (wave4, 199, 96, regional).
- Rank: REGIONAL_INTACT (regional 7/8, village 1/8). Wall: wins 0,
  national 0, table 0, wave5 2/8, wave4 8/8, median 150d, deaths 629,
  standing 150–325, blooded 4.
- Death causes (629): villager combat 267, combat 130, expedition 126,
  the wild 74, monster 13, ambush 3, contest 3, a wound that wouldn't
  close 3, Spool 2, a stranger 2, the arena 2, starvation 1, the night 1,
  Big-Eyes 1, alien 1.
- Instrument errors 0. Analyzer exit 0 (verdict GOOD). Summary:
  evidence/2026-11-13/culpritbisect-a-ep-far-8c-rerun-summary.json;
  corpus evidence/2026-11-13/perseed-culpritbisect-a-ep-far-8c-rerun/
  (8 per-seed JSONs); driver log
  evidence/2026-11-13/culpritbisect-a-ep-far-8c-rerun-driver.log.
- Fix standing f8fda4295a99 verified swapped in; far-end policy
  a7ff5c51; seeds exactly 190391–190398.
- Leg wall time ~2 min (box quiet this run — the 0215Z leg took ~27 min
  under load; sims are seeded/deterministic, load costs time only,
  never outcomes).

## Subject leg t8c-rerun (transplant-8c-subject @ 2cd6720b0, fix standing swapped in)

- survived 4/8. Per-seed days: 86/144/150/43/150/87/150/150 — identical
  to the baseline leg, seed for seed.
- Per-seed: identical to baseline on every field (days, end reason,
  max wave, standing, deaths, scale rank, blooded, tribute, ready4/5).
- Rank: REGIONAL_INTACT (regional 7/8, village 1/8). Wall: wins 0,
  national 0, table 0, wave5 2/8, wave4 8/8, median 150d, deaths 629,
  standing 150–325, blooded 4 — every wall number identical to baseline.
- Death causes (629): identical counts to baseline in every category
  (villager combat 267, combat 130, expedition 126, the wild 74,
  monster 13, ambush 3, contest 3, wound 3, Spool 2, stranger 2, arena 2,
  starvation 1, night 1, Big-Eyes 1, alien 1).
- Instrument errors 0. Analyzer exit 0 (verdict GOOD). Summary:
  evidence/2026-11-13/culpritbisect-a-t8c-rerun-summary.json;
  corpus evidence/2026-11-13/perseed-culpritbisect-a-t8c-rerun/
  (8 per-seed JSONs); driver log
  evidence/2026-11-13/culpritbisect-a-t8c-rerun-driver.log.
- Fix standing f8fda4295a99 verified swapped in; subject policy
  a7ff5c51 (== far-end policy); seeds exactly 190391–190398.
- Leg wall time ~5 min.
- Trajectory identity (verified by this arm): `diff -r` of the two
  per-seed corpora shows ONLY the `step` id (ep-far-8c-rerun vs
  t8c-rerun) and `anchorCommit` (203a32775 vs 2cd6720b0) differing —
  no content line in either corpus differs on any other field.

## What it means

Three independent reads of the far end on the matched band now agree
exactly (masterregress, 8b, this rerun's baseline leg: 4/8,
86/144/150/43/150/87/150/150), and the subject reproduces that read
seed-for-seed. The 8c hunk cannot be the collapse carrier: on the band
where the far end is healthy, adding the hunk changes nothing at all —
not one death, not one day, not one standing point. Combined with 8b's
NOT-CARRIER on the three clean hunks, four of PR #22's five
convo-dialogue/conversation hunks are now measured non-carriers on
their own (the four conflicted hunks remain unmeasured as a family,
and were never this arm's question).

The fresh-band 1/8 (0215Z) stays on the record as a band-health fact:
the far end reads 1/8 on 190541–190548 and 4/8 on 190391–190398 with
the same code, standing fix, and policy. Far-end health is
band-sensitive; the matched band is a favorable draw or the fresh band
a hard one, and an 8-seed read on one band cannot carry a verdict to
another band. That caveat attaches to this NOT-CARRIER too: it is
measured on the matched band, where the question was licensed to be
asked.

## The family's own test on the subject (judged separately from survival)

`scripts/test-transplant8c-dlgmore.js` re-run in THIS run (pathspec
extracts to /tmp, script copied in from the arm branch — the script
exists on neither the far end nor the subject tree):

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
  exactly as the prereg's mechanism analysis predicted. Same outcome
  as the 0215Z arm recorded on this exact subject commit — reproduced,
  not assumed.

The #4 proof whole was NOT re-run in this run (prereg): its outcome on
this substrate is already on the record from the 0215Z arm (Dale goon
SETUP FAILURE on the missing 8b method; Dale-honest 2 FAILS on missing
8b goon delivery; plant-lesson resume GREEN through the 8c handler;
#14 fails on the missing file at the far end). Nothing in this rerun
changes the substrate, so nothing in that record changes. All #4
failures are missing-8b-content / missing-substrate, none of them
touches the 8c hunk.

## Sense-testing (SENSE-TESTING LAW)

Census of the rerun corpora (225 vetSays lines each, 8 seeds — identical
in both corpora, since the trajectories are identical):

- "lost my train of thought" 0, "Still on" 0, dry-mentions 0 — same as
  8b and the 0215Z 8c arm (which had 440 lines on the fresh band). The
  competent bot never drives a dlg:more beat into a ledger block in sim,
  so the 8c paths never fire in the survival corpus. The survival leg
  cannot speak to the hunk's dialogue behavior; only the dlgmore script
  above does. The rerun corpus says nothing different from the 0215Z
  corpus on this point — stated plainly, as the task requires.
- What the villagers do read as: teaching spreads person to person
  ("Maksat taught everyone about European Elder. The Codex grows without
  you lifting a finger."; "Priya showed Oliver the Ground Elder —
  'remember it.' Word gets around."), door fights are named group efforts
  (41 lines: "Lulwa, Leo, Raj, Meera and Ingrid met them at the door — 4
  put down, 1 driven off."), veteran kills get a System broadcast ("Oh —
  OH. Everybody saw that, right? Kurt just put down Ad Break... on
  CAMERA. That's a veteran kill, folks. REMEMBER the name." — 55
  veteran lines). 173 distinct lines after the emoji prefix across 225 —
  narration varies; nothing robotic, nothing repeated verbatim across
  seeds beyond the shared event grammar.
- Corpus limitation, carried forward (8b's note): the per-seed JSONs
  retain no conversation transcript text (sayCount is a bare count;
  vetSays is event narration), so a dialogue family's live behavior
  cannot be censused from the sim corpus at all — only from its own test.

## Village assessment (plain words)

Four of eight villages live to day 150 and survive; the rest die at the
door or on the road between days 43 and 144. The ones that live reach
the region (7/8 regional) but none reach national, the table, or a win —
the scale wall stands exactly where the far end left it. Two villages
unlock wave 5; all eight unlock wave 4. People die fighting (267
villager-combat deaths, 130 combat, 126 expedition) and almost never of
hunger (1 starvation death in 629). The village that dies on day 43 never
gets past village standing; the day-150 survivors sit at standing 199–325,
regional, wave 4–5 — the strongest villages on the band, and still nowhere
near national. The subject leg changes none of that — the two villages
are the same village, seed for seed.

## Reachability

Waves 1–5: wave 4 reached 8/8, wave 5 reached 2/8. Regional 7/8.
National 0/8, table 0/8, wins 0/8. Arc II/III/IV and the win flag
remain unreached on this band, on both legs.

## Blanks filled / documented

- FILLED (measured): narrowed family 8c is NOT-CARRIER for survival —
  the subject reads 4/8 on the matched band with bit-identical
  trajectories to the far-end baseline. The 8c question is CLOSED for
  survival (on this band).
- FILLED (measured): the far end's matched-band 4/8 is now a THREE-WAY
  reproduction (masterregress, 8b, this rerun's baseline leg — identical
  per-seed days 86/144/150/43/150/87/150/150 all three times).
- FILLED (measured): the 8c hunk's dialogue behavior is PROVEN again in
  this run's own record — both live paths behave as designed on the
  subject and fail on the far-end control (dlgmore script exit 0 vs 1),
  reproducing the 0215Z arm's result on the identical subject commit.
- DOCUMENTED: the fresh-band 1/8 vs matched-band 4/8 contrast stands —
  far-end health is band-sensitive; this NOT-CARRIER is a matched-band
  verdict and does not transfer to the fresh band by itself.
- DOCUMENTED: the #4 proof cannot run whole on an 8c-only subject
  (Dale goon setup needs the 8b method; Dale-honest needs the 8b goon
  delivery) — future narrowed arms on old bases should expect the #4
  proof to fail on missing 8b content, not on their own hunk (8b's
  finding, reproduced by the 0215Z arm, adopted here without re-running).
- DOCUMENTED: safe-commit.sh index clobber struck 1× this run (prereg
  commit — both files staged-as-deleted in the index while present on
  disk) — repaired with the documented `ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` recipe; the commit verified
  byte-identical (worktree hash == HEAD blob) before continuing.
- DOCUMENTED: the step script + analyzer hardcode the matched band —
  this run's band, so the /tmp step-script copy needed NO band edit
  (byte-identical to the committed script, verified with diff); the
  copy exists only so the detached checkout cannot unlink the running
  script. The committed tooling is unedited.
- DOCUMENTED: the dlgmore script exists on neither the far end nor the
  subject tree — the family-test runs need the script copied into the
  /tmp pathspec extracts from the arm branch (the 0215Z arm's evidence
  does not state this step explicitly).

## Telemetry deviation check

Attempted per the loop body (telemetry-check.js, baseline
scale-wall.json, current the t8c-rerun per-seed corpus, metrics
national,table,wins,exiled): REFUSED — "recorder-corpus input:
all 8 --current rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs" (exit 0, refusal message on stdout).
Recorded, not waived; baseline NOT rolled. Same refusal class as all
prior bisect / transplant arms.

## Proof

- `scripts/test-transplant8c-rerun.js` — stage 1 green at prereg
  (117/117); §8 (live subject state) green before the legs (12/12:
  parent is the far end, diff exactly +17/−1 one file,
  byte-identical to the family 8c hunk, test file absent, no 8b-only
  strings, policy + standing match the far end); §9 takes the
  subject-leg branch after the legs (settled anchor 4/8 with fixed
  days, rerun baseline 4/8 on the matched band, subject summary 4/8
  on the same seeds, evidence records NOT-CARRIER + both survived
  counts + the dlgmore leg). Final re-run after the evidence commit:
  117 passed, 0 failed.
- `scripts/test-transplant8c-dlgmore.js` — far-end control FAIL
  (both cases, exit 1); subject PASS (both cases, exit 0). Re-run in
  this run, same staging as the 0215Z arm.
- `scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm
  branch as the reused-tooling check: 116 passed, 0 failed.
- No game-code change is committed by this arm on the arm branch
  (the subject lives on its own branch `transplant-8c-subject`, left
  in place, READ-ONLY); no `[needs-eyes]` applies. Committed on the
  arm branch: prereg, rerun proof script, this evidence file, both
  step corpora + summaries + driver logs. The /tmp step-script copy
  (byte-identical to the committed script) was never committed.

## Metric review (§14 — filled after the run, never re-scored)

- The primary metric (survived/8, ≤1 CARRIER / 2 AMBIGUOUS / ≥3
  NOT-CARRIER) held cleanly: the baseline gate passed at 4/8 (third
  identical read), the subject read 4/8, and the verdict maps to
  NOT-CARRIER without any re-scoring — the strongest form, with
  byte-identical trajectories. No metric revision needed.
- The band-health pre-check (new in this rerun's prereg, answering the
  0215Z arm's metric lesson) worked as designed: it stated the expected
  baseline (settled 4/8, reproduced twice) BEFORE running, and the leg
  reproduced it exactly a third time. The pre-check is worth keeping
  as standard prereg practice for transplant reruns.
- The family-test metric (dlgmore script exit 0/1) held cleanly again:
  control FAIL on the far end, PASS on the subject, both cases,
  reproducing the 0215Z result on the identical subject commit.
- No metric revision proposed for the next run. The open measurement
  question is now elsewhere: the four conflicted hunks of PR #22
  (lesson-outcome/diegetic-act, favor settlement, favor-line sayLine,
  blocked-repeat) remain unmeasured as a family, and the merge's 1/8
  against the far end's 4/8 still needs its carrier found — but that
  is the coordinator's next blank, not this arm's.
