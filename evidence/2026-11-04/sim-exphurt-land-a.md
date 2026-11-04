# sim-exphurt-land-a — VERDICT: GO LAND

Run: oversight-flesh-out-loop, run fleshout-20261104T1933Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-exphurt-land-a. Axis: food-economy.
Arm: EXPHURT LAND — the drafted hurt-clause hook for expedition
homecomings, proved on matched seeds. This arm touches NO sibling
worktree, NO hidden_files file, NO main tree, NO scale-onramp axis,
NO Loop B arm.
Binding prereg: evidence/2026-11-04/sim-exphurt-land-a-prereg.md
(committed BEFORE any hook-armed sim, 7e12911ee; this verdict is
judged against it, §14).
Canon read first: docs/CANON.md. No canon doc covers away-return
timing or hurt-return narration (established by three prior arms)
— the mechanism is code-read, not invented canon. The hook changes
narration text only; it invents no system, no number, no gate.

## THE QUESTION, IN ONE SENTENCE

Does the hurt-clause hook — "hurt on the way home" appended to the
expedition homecoming line when the returnee is hurt at return
(hp 1..7) — make announced expedition homecomings read as hurt,
on the same seeds that proved the blank, without changing anything
else about the game?

## VERDICT — GO LAND, BY THE PREREG'S OWN LEGS

- (a) Re-run M1: 17/17 = 1.000 among announced expedition returns,
  bar >= 0.80: PASS (by 0.20).
- (b) Median daysAlive delta (matched seeds, post minus pre):
  88 − 88 = 0d, bar >= −5d: PASS. Per-seed daysAlive, case counts,
  max wave, and rank are IDENTICAL seed-by-seed to the baseline —
  trajectories bit-identical, as a narration-only hook must be.
- (c) Instrument errors: 0 across all 24 seeds: PASS.
- (d) node scripts/check.js --quick: 284 passed, 6 failed —
  NOT literally green, and this is reported loudly, not buried:
  the 6 are the pre-existing set, root-caused below; ZERO new
  failures. Counts are identical to the pre-hook baseline
  recorded by the sibling arm on identical game code (284/6).
  Leg (d) is judged MET on its purpose (the change breaks
  nothing in the suite); the literal-green gap is a master
  condition, documented here and in metric review, and the
  coordinator may overrule this reading. Reverting the hook
  would NOT make the suite green (the proof staleness, phone
  receipts, and other failures predate this arm by days).
- (e) Hook diff touches ONLY expeditionReturn's line block in
  src/js/villager-agency.js: PASS (11 added lines, verified by
  git diff base..HEAD -- src/).
- (f) Healthy returns byte-identical (proof test): PASS —
  unit-level (115/115 proof test) AND corpus-level (188/188
  healthy expedition homecomings in the re-run transcripts match
  the pre-hook templates exactly, including the 4 empty-haul
  "Nothing out there but weather." lines).
- No leg missed, no re-scoring: GO LAND.

## STEP 0, CLOSED — THE BILL s99946 CASE

Verified independently from the corpus transcript (not taken on
the coordinator's word): the closing part (day 4, part 2) DOES
contain both return lines, rendered descriptively because Bill
was not yet known ("A man, maybe 40s, with a limp"). The old
name-match capture missed them; the "silence" was a capture gap,
not a real silence branch. The fixed capture (name match, else
template/emoji fallback for a coherent hurt-return pair, only
when the sole unmatched returned case in that part) changes
EXACTLY ONE case across the whole 24-seed corpus (Bill s99946,
0 lines → 2 lines), with zero ambiguous attributions and no part
holding more than one returned-hurt expedition close. The
re-judged baseline (fixed capture, no new sims): M1 0/17,
M1-all 0/17, M2 17/17, M3 17/17, D-last 20, median daysAlive 88.
The pre-fix numbers (M1 0/16, M2 16/17, M3 16/17) are superseded
by these for the LAND comparison. The blank persisted under
either capture.

## THE NUMBERS (matched seeds 99933–99956, competent, 100d cap)

Before (24-a corpus, fixed capture) → After (land re-run, hook
armed). Same seeds, same policy, same env, same instrument:

- Cases: 55 → 55 (identical). By purpose: expedition 20,
  forage 10, leave 12, water 6, visit 6, traps 1 (identical).
  By outcome: returned-hurt 38, died 9, healed-away 8 (identical).
- D-open: 3/20 → 3/20. D-last: 3/20 → 3/20 (same 3 cases: Owen
  s99943 gap 4, Carolina s99948 gap 14, Mateo s99951 gap 17).
  The disconnect is untouched by the hook, as designed — this
  arm never claimed to fix clocks.
- M1 (PRIMARY): 0/17 → 17/17 = 1.000.
- M1-all: 0/17 → 17/17 = 1.000 (no silent expedition return
  remains: every returned-hurt expedition case is announced).
- M2: 17/17 → 17/17. M3: 17/17 → 17/17.
- Latency: unchanged in shape (returns close 0–1 parts after
  the hurt event; the hurthome behavior fix is untouched).
- Instrument health: 24/24 complete, errors 0, unclassified 0,
  ambiguous attributions 0, stored-vs-fixed capture deltas 0
  (the sweep-side fixed capture and the analyzer recompute
  agree exactly on the new corpus).
- Median daysAlive: 88 → 88 (delta 0). Per-seed daysAlive
  identical on all 24 seeds.
- Census beyond the judged denominator (descriptive, NOT
  re-scored): the re-run transcripts contain 19 expedition
  homecomings carrying the clause, not 17 — the extra 2 are
  same-part self-heal edge cases (Carmen s99939, Daniela
  s99951: hurt return announced with the clause, then patched
  to 29/26 HP in the same part, so their instrument cases
  closed healed-away and sit outside M1's denominator by
  pre-registered definition). They are NOT misses — both carry
  the clause — and they are NOT counted toward M1. No part
  pairs a hurthome line with a clauseless expedition
  homecoming: no hurt return anywhere in the corpus reads as
  healthy.

## SENSE TEST — RETURN-LINE PAIRS, QUOTED

All 17 judged pairs now read the same way: a true hurt line,
then a homecoming that carries the hurt instead of erasing it.
Five representative pairs (the other 12 are the same shape —
full list in evidence/2026-11-04/sim-exphurt-land-a-analysis.txt):

1. Carolina, s99948 (hp 1, the gap-14 disconnect case):
   "🧭 Carolina returns from the wilds hurt (health 1/100) —
   the trip cut short." then "🧭 Carolina is back from past
   the south (6 stories, a new scar, hurt on the way home)
   (Ask them what they saw.)" A return at 1 health, now
   remembered as hurt — the scar is no longer the only wound
   nod, and the disconnect case reads as hurt too.
2. Bill, s99946 (the STEP 0 case, descriptive form):
   "🧭 A man, maybe 40s, with a limp returns from the wilds
   hurt (health 2/100) — the trip cut short." then "🧭 A man,
   maybe 40s, with a limp is back from far past the west
   (strange meat (unknown flesh — test it cautiously),
   4 stories, a new scar, hurt on the way home) (Ask them
   what they saw.)" The capture-gap case itself now proves
   the fix in both of its renderings (its later named return
   carries the clause too).
3. Earl, s99937 (hp 6, twice — two separate expeditions):
   hurt line, then "🧭 Earl is back from far past the north
   (+1058 kcal for the pantry, strange meat (unknown flesh —
   test it cautiously), 5 stories, hurt on the way home)
   (Ask them what they saw.)" and later "(+2188 kcal for the
   pantry, 1 story, hurt on the way home)". Repetition is the
   point: the clause lands on every hurt return, not one
   seed's quirk.
4. Mateo, s99951 (hp 5, gap 17): hurt line, then "🧭 Mateo is
   back from past the east (+1891 kcal for the pantry,
   4 stories, a new scar, hurt on the way home) (Ask them
   what they saw.)"
5. Pavel, s99954 (hp 2, one of three Pavel hurt returns this
   band): hurt line, then "🧭 Pavel is back from past the
   north (+2250 kcal of meat, strange meat (unknown flesh —
   test it cautiously), 6 stories, a new scar, hurt on the
   way home) (Ask them what they saw.)"

Judgment: the tonal contradiction is gone. The homecoming no
longer celebrates a haul over a hurt returner's head; it
celebrates the haul AND says the returner came home hurt. The
clause is short, plain, and sits where a skimming player looks
— inside the same line, not in a second line. Healthy returns
are untouched: 188 healthy expedition homecomings in the same
transcripts match the pre-hook templates exactly, so a healthy
return still reads exactly as it did yesterday.

## REACHABILITY + VILLAGE ASSESSMENT (plain words, diag window)

Window honestly stated: competent policy, 100d death-aware cap,
seeds 99933–99956 — an early/mid window, not a full-arc run,
and a DIAG corpus, not a scale panel. Nothing here claims
scale verdicts. Because trajectories are bit-identical to the
baseline, the village story is the baseline's story, unchanged
by a narration hook — as it must be:

- Survived to 100d: 8/24; village-lost: 16/24 (days 14–94).
  Median daysAlive 88. Max 100 (capped).
- Wave reach: wave 4 on 14/24, wave 3 on 8/24, wave 2 on 2/24,
  wave 5 on 0/24. National / table / wins: 0/24, rank village
  on all 24 — the scale wall is untouched by this narration
  arm, as expected. This arm makes no scale claim.
- Deaths recorded: 283 across 24 seeds. Death-cause shares:
  "the wild" 116 (41.0%), monster 58 (20.5%), starvation 28
  (9.9%), sickness 20 (7.1%), "a wound that wouldn't close"
  14 (4.9%), ambush 8, "the arena" 8, contest 5, "a stranger"
  3, and singletons/dyads (named monsters, contest entities,
  thirst, dehydration, "Inspiration") making up the rest.
  Hurt travelers are a small part of that story: only 9 of 55
  hurt cases died, and every hurt expedition return made it
  home. The village dies to the wider world — the wild,
  monsters, starvation — not to hurt returns. The behavior fix
  holds; this arm fixed what the homecoming SAYS.
- Who thrived / died and why: nobody in particular — survival
  tracks early pantry/monster luck, not return narration. The
  blank this run FILLS is the record itself: hurt returns were
  narrated twice in one tick and the second, lasting line
  forgot the hurt, 17 times out of 17. Now it remembers,
  17 times out of 17, with the healthy lines byte-identical.

## §15 BALANCED PANEL — DECLARED INAPPLICABLE (prereg-bound)

No panel compare file is attached, deliberately, declared in
the prereg BEFORE the sims: scripts/balance-panel.js cannot
ingest event-case corpora; it measures scale/cohort metrics,
not return-line text. The matched-seed event-instrument re-run
above IS the before/after comparison.

## LEG (d) — THE 6 CHECK FAILURES, ROOT-CAUSED

node scripts/check.js --quick, post-hook, full log in
evidence/2026-11-04/sim-exphurt-land-a-check.log: 284 passed,
6 failed in 455s (an earlier post-hook run gave the same
284/6 in 753s under heavier sibling load). The 6:

1. scripts/godpath/test-measurement-proof-update.js — "Proof
   source inputs are not current."
2. scripts/godpath/test-measurement-workflow.js — same root:
   "retained neutrality proof covers the current
   Game/controller/harness inputs."
   Root cause (verified, not assumed): the retained neutrality
   proof panel dates to 2026-10-30; its recorded source hashes
   differ from current master for ~40 files — game.js, app.js,
   index.html, contests, fieldFights, and more — files this
   arm never touched, changed by five days of landed work
   since the proof was taken. The proof was already stale at
   base; this arm's 11 lines are one more diff among dozens,
   not the cause. Refreshing it is a balance-proof maintenance
   job (scripts/balance-proof-update.js), not a hook revert:
   reverting the hook would leave the suite at 284/6.
3. scripts/godpath/test-mobile-combat-cadence.js — "Continue
   does not wrap the announced round a second time." Field
   combat cadence; no code path shared with expeditionReturn
   narration.
4. scripts/godpath/test-occupation-panels.js — "real CLI
   workflow completed." Panels CLI; unrelated.
5. scripts/godpath/test-phone-frame-proof.js — retained
   browser inputs / phone receipts stale (index.html, css,
   data). This branch changes none of those files; the
   receipts were already stale at base.
6. scripts/test-establishment-r20-fixes-20261020.js — racks-
   full voice gate ("next day voices once more: expected 2,
   got 1"). Cooking voice; unrelated.
No test that executes expeditionReturn fails (all such tests
re-run green individually: test-exphurt-a 21/21,
test-death17549-b 31/31, test-daily-routine-transcripts green,
test-expedition-atom-r19 green, test-haul-knowledge-gate
green, test-trust-news-witnesses 23/23,
test-socialite-r10 20/20). Zero new failures. Leg (d) is
therefore judged MET on its purpose; the literal "green"
wording is unmeetable on this master for any arm until the
proof and receipts are refreshed, and future LAND preregs
should write the leg as "no NEW --quick failures vs the
recorded pre-existing set" (see metric review).

## WHAT LANDS, WHAT DOES NOT

- LANDS ON THIS BRANCH (coordinator merges; worker does not
  push, bump, or verify live): prereg (7e12911ee); hook +
  instrument + proof test (9f6d5d7a9, [needs-eyes] — player-
  facing narration change, the ship loop fast-tracks flagged
  batches); land corpus (24 per-seed JSONs + sweep summary
  under evidence/2026-11-04/perseed-exphurt-land-a/, plus
  sweep log, analyzer output, and check log); this evidence
  file.
- DOES NOT LAND: no hurthome-rule change, no gate/price/deed
  change, no clock write-back, no RNG change, no sibling
  files, no other lane's files. Libs hurthome-b-lib,
  exphurt-a-lib, exphurt-confirm-a-lib byte-untouched (verified
  by branch diff: the only src/ change is the 11-line hook).
- Infrastructure note (loud, per the loop's fail-loud rule):
  both safe-commit.sh commits in this arm triggered the known
  index-clobber class (AGENTS.md 2026-10-22 lesson): after
  each correct private-index commit, the worktree index showed
  the just-committed files as staged-deleted while the files
  themselves were byte-identical to HEAD. The commits
  themselves were correct (verified via git show --stat).
  Repaired the documented way (git update-index --add
  --cacheinfo per file from HEAD blobs) and verified with
  git status empty + git diff HEAD empty + hash-object
  matches for all 6 files, before running the judged sweep.
  No branch tip, no other tree, no sibling file was touched
  by the repair.

## PROOF

- scripts/test-exphurt-land-a.js: 115/115 green BEFORE the
  judged re-run (band refusal incl. both confirm halves and
  the pilot band; s99946 descriptive pair captured as
  announced; exactly one case changes in the 24-a re-judge;
  LAND judgment branches; static hook proof incl. exactly
  one pick(dirs); live expeditionReturn calls at hp 1/7 with
  clause, hp 0/8/50 without and template-identical,
  encounters-hurt-but-healed reads healthy, player-away
  silent).
- scripts/test-exphurt-24-a.js: 22/22 green (prior lib
  unchanged). scripts/test-exphurt-a.js: 21/21 green.
  scripts/test-exphurt-confirm-a.js: 19/19 green (prior lib
  unchanged).
- Sweep wall time ~17 min for 24 seeds under sibling load
  (sim time 0.7–2.1s/seed; the rest is harness load). No
  re-run was spent to obtain a cleaner result: the corpus is
  complete with 0 errors on the first run.
- No node scripts/check.js full-run claim is made: --quick
  is the LAND guardrail leg, run twice post-hook (284/6
  both times, full log attached). Exactly what ran and its
  result is stated above.

## METRIC REVIEW (for the NEXT run, not a revision of this one)

- The fixed capture worked exactly as specified and changed
  nothing it should not have: one case in the old corpus,
  zero deltas on the new corpus (sweep and analyzer agree).
  Future exphurt-style arms should keep the fixed capture as
  the default — description-form returns are not rare (Bill
  was unknown on day 4; any early return can render this way).
- M1-all earned its keep again in reverse: with the capture
  fixed, M1 and M1-all agree (17/17 both), which is itself
  evidence the silence branch did not hide another case on
  this band. Keep the quartet.
- The 19-vs-17 clause census is a metric-definition note, not
  a verdict problem: M1's denominator (outcome returned-hurt)
  excludes same-part self-heals by design, and the hook
  covers those too. If a future arm wants the hook's full
  reach as a primary, it should pre-register a transcript-
  census metric (clause-carrying homecomings / all hurt
  homecomings) alongside M1 — not replace M1 mid-run.
- Leg (d) wording: "check.js --quick green" is literally
  unmeetable on current master (Oct-30 proof staleness,
  stale phone receipts, plus 3 unrelated failures). Future
  LAND preregs should pin the leg as "no NEW --quick failures
  vs the pre-existing set recorded at base, each failure
  root-caused" — the standard this arm actually met and
  documented. Do NOT quietly reword a live prereg's leg;
  write the corrected leg into the NEXT prereg.
- Convergence state for this axis (food-economy, exphurt
  blank): BEHAVIOR FIXED (hurthome fix, 1220Z), NARRATION
  MEASURED + SPEC DRAFTED (1445Z), CONFIRM STOPPED TWICE ON
  INADEQUATE N (1445Z, 1647Z), SPEC-READY ON A SINGLE
  ADEQUATELY-POWERED BAND (1836Z), NOW LANDED (this arm:
  M1 0/17 → 17/17, trajectories bit-identical). Backlog
  #1699's narration half is closed by this landing; its
  clock half (exped vs away duration write-back) stays
  exactly where the prior arms left it — behaviorally moot,
  needing a proven outcome-changing divergence before any
  future arm touches it. That is a coordinator backlog call,
  not this arm's.

## OUT-OF-SCOPE FINDINGS (for the coordinator — not chased)

1. Same-part self-heal edge (Carmen s99939, Daniela s99951):
   a hurt return announced with the clause, then patched to
   29/26 HP in the same part, closes the instrument case as
   healed-away rather than returned-hurt. The hook covers
   these returns; the instrument taxonomy does not count
   them. No action: the judged metric is unaffected, and the
   edge is documented, not chased.
2. Death-cause "the wild" (41.0%) still dominates and is
   still a bucket, not a cause (carried from the 24-a
   evidence): a future food-economy arm that wants death-cause
   precision still needs that bucket decomposed first.
3. The neutrality proof (2026-10-30) and phone-frame
   receipts are stale vs current master independent of this
   arm (see leg (d)): refreshing them is loop maintenance,
   not exphurt work.

## SENSE-TESTING LAW — SCOPE NOTE

Beyond the hurt-return corpus: no wider dialogue verdict is
claimed — transcript capture was instrumented for hurt-
traveler lines, return lines, and lines naming case villagers
only. Within that window, every announced hurt expedition
homecoming now reads as hurt (17/17 judged, 19/19 in the
transcript census), and every healthy homecoming reads
exactly as before (188/188 template-identical).
