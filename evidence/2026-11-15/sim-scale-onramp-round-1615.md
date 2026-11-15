# Scale-onramp round 1615 — matched-band reruns (8fam NOT-CARRIER, 7redef UNMEASURED-substrate, both landed)

Run: fleshout-20261115T1615Z (Loop A), axis scale-onramp (survival
collapse). No stale-lock recovery (no lock at run start). Loop B live
on winnability chain throughout (claim
fleshout-loop-b-20261115T1330Z, arms sim-gorgeprice2-b +
sim-courtship-b) — NOT touched. Loop B's gorgeprice2-b CONFIRM GO
(740838f3c) landed before this run started; a sibling lane landed
sim-wave5kill-b mid-run (63b4b3a4e + 41e935787, DIAG GO on wave-5
killing) — noted, not this run's work.

Both arms take the 1415Z tracker's next blanks in order: (1) family 8
matched-band rerun (subject in place); (1b) family 7 redefined
ablation on the matched band (coordinator call + prereg band
correction). Shared band 190391–190398, 150d death-aware, competent
verbatim, fix standing swapped in, native restored byte-identical.

## Arm 1 — sim-transplant8fam-match-a (NOT-CARRIER, bit-identical, landed)

Family 8's four conflicted PR #22 hunks (merge 713eb7545),
theirs-resolved, subject transplant-8fam-subject b6ec3c7d1 adopted
(verified hunk-by-hunk, NOT re-cut). Prereg
evidence/2026-11-15/sim-transplant8fam-match-prereg.md supersedes
the 1425Z prereg on band only, restoring the 1215Z matched-band
design (baseline first, no sniff). Matched-band reuse recorded as
deliberate, authorized by the 1415Z coordinator decision (2).

- Baseline leg ep-far-8fam-match (far end 203a32775): survived
  **4/8**, days 86/144/150/43/150/87/150/150 — exact reproduction
  of the settled baseline, fifth corroboration. Gate ≥3/8 held.
- Subject leg t8fam-match (b6ec3c7d1): survived **4/8**, identical
  per-seed days. All 8 per-seed JSONs identical after stripping
  step/anchorCommit metadata.
- Verdict mapping: ≥3/8 NOT-CARRIER. **Family 8 is now fully
  measured for survival — every piece measured alone is a
  non-carrier** (8b NOT-CARRIER bit-identical, 8c NOT-CARRIER on
  the matched-band rerun, conflicted-four NOT-CARRIER
  bit-identical). This supersedes the 1425Z UNMEASURED-sniff
  verdict.
- Wall (both legs identical): national 0/8, table 0/8, wins 0/8,
  wave-5 2/8, wave-4 8/8, median 150d, deaths 629 (villager combat
  267, combat 130, expedition 126, starvation 1/629). Rank
  REGIONAL_INTACT (7/8 regional, 1/8 village).
- Family-test leg: test-transplant8fam-conflicted.js far-end
  control exit 1 (pre-fix behavior), subject exit 0, all 4 cases
  pass. The hunks are behaviorally live; the competent bot just
  never drives them in survival play. Dialog-audit #4 on the
  subject extract: exit 1, 3 pre-registered failures (missing 8b
  method, missing-8b-content, #14 MODULE_NOT_FOUND); Ruth
  plant-lesson resume ran coherent and non-dry.
- Sense-testing: 225 vetSays lines per corpus, 173 distinct;
  family surface unexercised (0 dry / settled-favor / teach /
  help / favor); 7 "unfinished" hits all the same scripted ARC IV
  beat. Age-fallback narration corroborated once (190394 d7) —
  already-open backlog item.
- Proofs: test-transplant8fam.js 157/157 on the branch, **159/159
  on merged master** (state-aware: the branch run has 1
  worktree-only leg, the master run has 3 master-only legs —
  evidence/proof present at HEAD, subject branch in place;
  157−1+3=159, all green). test-culpritbisect-a.js 116/116.
- Merged ff-only as 8478fc140 (tip; branch commits fc8f8e6cf,
  9a8a8b59b, 8478fc140). Master moved once under the arm
  (journey-establishment r213/r214); clean rebase, proofs re-run
  green. Subject branch transplant-8fam-subject KEPT in place at
  b6ec3c7d1. Evidence:
  evidence/2026-11-15/sim-transplant8fam-match.md (+ prereg).

## Arm 2 — sim-transplant7redef-match-a (UNMEASURED-substrate, baseline 8/8 gate STOP, landed)

Redefined family-7 ablation (remove the align call in
finishLottery, −5/+0, one file) on the matched band. Prereg
evidence/2026-11-15/sim-transplant7redef-match-prereg.md
supersedes the 1215Z prereg on band only (matched band
190391–190398 instead of fresh 190581–190588), per the 1415Z
coordinator decision (1). Ablation set re-verified verbatim at
base b4343ac9d before any leg (align villager-brain.js:892-1006,
single caller finishLottery:682-683, 5 lines at :680-687).

- Sniff (190391–190394): 4/4 survived, all to day 150.
- Baseline leg ep-tip-7redef-match (master tip b4343ac9d):
  survived **8/8** — far above the pre-registered PROCEED range
  (0–2/8). Gate ≥3/8 → **STOP, UNMEASURED-substrate. No subject
  branch was cut and no subject leg ran** (verified:
  transplant-7redef-subject does not exist). Family 7's
  brain-side align step remains UNMEASURED.
- Wall (baseline, 8 seeds): national 0/8, table 0/8, wins 0/8,
  wave-5 4/8, wave-4 8/8, median 150d, 593 villager deaths,
  standing 199–490, regional 8/8 (REGIONAL_INTACT). Death causes:
  villager combat 43%, combat 30%, expedition 15%, starvation
  0.5%. The binding gap moved from survival to veterans — only
  1/8 wave-5 ready, 6/8 short on living veterans; two wave-5
  villages end at 0 kcal pantry.
- Why the floor rose: the merge's collapsed 1/8 on these seeds
  was a pre-guard read. The CASCADE lingerer guard (dc8cbd3f3,
  +16 lines in src/js/game.js) landed after the 1215Z baseline
  and removes a scholar-death path its commit cites at 38/88
  scholar deaths. Coordinator-verified: the ONLY src/js change
  between the 1215Z base (1ca2c257d) and this base (b4343ac9d)
  is that +16-line guard (git diff --stat 1ca2c257d..b4343ac9d
  -- src/js/). Fresh band 3/8 + matched band 8/8, one guard
  apart, jointly say the collapse regime no longer exists on
  master tip by either band's read. The prereg recorded this
  caveat before any leg; the gate still binds as written. The
  guard attribution is a single-diff inference, not a
  controlled A/B — a guard-removal ablation would be the
  deciding test (new arm, own prereg; not decided here).
- Step-script bug fix LANDED and PROVEN: transplant7redef-step.sh
  restore() now checks scratch out from the step commit instead
  of deleting tracked files. Both legs ended with a clean tracked
  tree and native standing (f9359976…) restored, zero manual
  recovery — vs the 1215Z arm, which needed manual recovery after
  every leg. Findings entry #2381 marked fixed.
- Proofs: test-transplant7redef-match.js 110/110 stage 1,
  **114/114 on the final branch** (no adjudication — the 1215Z
  proof's intermediate-state leg gap was fixed in this proof);
  after the first rebase 113/1, on merged master 112/2 — both
  failures adjudicated, not edited: (1) the run-start anchor
  leg ("base b4343ac9d IS the master tip at run start") goes
  stale by design post-rebase, same class as the 1215Z
  adjudication; (2) the branch-identity leg ("HEAD is on the arm
  branch sim-transplant7redef-match-a") passes only inside the
  worktree and fails on merged master by definition. The
  substantive legs (family identity, ablation set, gate STOP,
  corpora, verdict mapping, family-test) all pass; the verdict
  follows from the gate classifier, which reads STOP correctly.
  test-culpritbisect-a.js 116/116. Honesty test baseline exit 0,
  pass:true (byte-identical to expected); all 4 pinned align
  cases fire align-ACTIVE live on the new base.
- Sense-testing: 247 vetSays lines, 183 distinct, coherent;
  age-description fallback recurs on 2 more seeds (logged to
  findings).
- Merged ff-only as 7a4353f68 (tip; branch commits 58ea49da6,
  7a4353f68 after three rebases). Tree released, branch deleted.
  Evidence: evidence/2026-11-15/sim-transplant7redef-match.md
  (+ prereg).

## Wall (this run's judged corpora, 24 configs)

national 0/24, table 0/24, wins 0/24, wave-5 8/24, wave-4 24/24,
median 150d. Telemetry deviation check: REFUSED on both arms
(recorder-corpus class) — baseline NOT rolled, no LOUD lines.

## Coordinator decisions

1. Family 8 CLOSED as a carrier suspect: every piece measured
   alone is a non-carrier, two of them bit-identical. No further
   family-8 survival arm is owed; the subject branch stays in
   place as the instrument.
2. Family 7 brain-side: UNMEASURED stands — BOTH measurement
   routes are now closed (fresh band: baseline 3/8 gate STOP;
   matched band: baseline 8/8 gate STOP). The H1 transplant
   program's founding premise (merge 1/8 vs far end 4/8) no longer
   reproduces on either band on master tip. Next run's call: the
   program needs a coordinator decision on whether the family-7
   brain-side question is still live (guard-removal ablation as
   the deciding test, own prereg) or closed by the guard
   attribution. NOT decided here.
3. The 8fam arm's /tmp finding stands: stale /tmp scratch from
   completed runs filled /tmp to 100% (398M of 1425Z extracts);
   reaper sweep for stale /tmp scratch is owed (logged open in
   sim-findings.md).

## Infrastructure

- REBASES: 7redef rebased three times (journey-establishment
  r213/r214, 8fam merge, sibling sim-wave5kill-b landing) — all
  clean, no stop-at-pick quirk; proofs re-ran green after every
  rebase (with the adjudicated anchor leg noted above). 8fam
  rebased once by its worker. ff-only correctly refused the
  diverged branches twice; no force, no merge commits.
- SAFE-COMMIT CLOBBER: struck 3× on the 8fam arm, 2× on the
  7redef arm — all repaired with the documented `ls-tree -r HEAD
  | git update-index --add --index-info` pipe; every commit
  verified correct (worktree hash == HEAD blob) before
  continuing.
- /tmp: 100% full at 8fam family-test time from the 1425Z run's
  stale extracts (fam8far/fam8subj, 398M, completed merged run,
  no live process using them) — removed by the worker, extracts
  re-run per prereg, logged as an open finding.
- No write flap this run; flap-watch ALL-OK at run start.
  check.js --quick NOT re-run (zero src/js on either landed
  branch except the sibling's own files; loop precedent). Both
  arms' proofs re-ran green on merged master (8fam 159/159,
  7redef 112/2 adjudicated, culpritbisect 116/116).
- REAPER: pre-flight reap 12/16 active, nothing removed; final
  sweep 12/16 active, nothing removed; the LOUD
  uncommitted-changes trees (sim-wideduty-a, sim-sametick-a,
  journey-scale-attr, sim-secondlink-a, sim-redactor-a,
  sim-saycap-a, sim-siegedialog-a, sim-inffight-ab,
  journey2-endgame, sim-gorgeprice2-b, sim-courtship-b,
  journey-deepening) belong to other runs — NOT touched, owners
  must commit or release.

scale-onramp stays converging (NOT converged): family 8 is closed
as a carrier suspect and the collapse regime itself is gone on
master tip (8/8 matched-band baseline), but wins remain 0 on every
judged corpus and the wave-5 veteran gap (6/8 short on living
veterans) is the binding constraint now named. food-economy stays
converging (untouched; parked). winnability chain stays converging
(untouched; sibling Loop B). Next blanks, in order: (1) family 7
brain-side program decision (guard-removal ablation vs close by
attribution — coordinator call, not decided here); (2) family 2b
AMBIGUOUS stays on the suspect list; (3) headcount-ceiling
(Steve-call); (4) Reunion mirror pack in the wild (Steve design
call). Claim deleted; lock deleted.
Evidence: evidence/2026-11-15/sim-scale-onramp-round-1615.md (this
file).
