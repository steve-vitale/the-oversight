# sim-transplant16-prereg — family 16 (js=0 merges, last family) (Loop A, fleshout-20261114T2115Z)

Run: fleshout-20261114T2115Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant16-a, branch `sim-transplant16-a`, worktree
`~/workspace/worktrees/sim-transplant16-a`.

## Authority

Family definition: evidence/2026-11-13/sim-scale-onramp-round-2115.md
§3, family 16 — "js=0 merges, last: #121, #119, #50, #49, #27, #24,
#23, #21, #19, #17, #15, #31 — evidence/proof/data-only; test only
if no carrier explains the collapse". Binding prereg: 2115 §3 (H1
transplant program definition + thresholds + conflict rule), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
hidden_files/family15-grouping-prereg-2026-11-14.md (family 15
grouping; its closing note names family 16 as the last unmeasured
family, "test only if no carrier explains the collapse"), plus
evidence/2026-11-14/sim-transplant15f.md and its prereg (model for
merge-tree pre-checks, the tooling-resolution rule, and the STOP
clause — 15F stopped at pick 7 on a modify/delete shape its
pre-check had predicted).

Note on the grouping prereg's "test only if no carrier explains the
collapse": the carrier (OVE-52, family 15C) IS identified, but the
2015Z round kept family 16 as next blank #3 — the program measures
every family to exonerate or implicate it, and js=0 needs
verification, not assumption. This arm measures family 16 as one
unit; the live question, as with 15F, is whether the subject can
even be built (pick 1 conflicts — see §Merge-tree pre-check).

## COORDINATOR TOOLING-RESOLUTION RULE (binding for this run's family-15/16 arms, decided 2026-11-14 ~10:00Z)

Pick in origin order, via `git cherry-pick -m 1 <merge>` (merge
families). If a pick conflicts ONLY on zero-src-reader tooling files
(scripts/green-list.txt, scripts/balance-proof.json,
scripts/phone-frame-proof.json), resolve EACH such file with
`git checkout --ours` (keep the far-end version byte-identical) and
continue the cherry-pick — do NOT hand-edit. If ANY other file
conflicts (any src/js, data, policy, docs, evidence, or test file),
STOP immediately, report the exact conflict list, do NOT
hand-resolve, do NOT decide a narrowed re-run. The proof MUST
assert: (1) the subject's game-code diff equals the picks' diff
exactly, and (2) each resolved tooling file is byte-identical to the
far end. Record every resolution (file, pick, method) in prereg +
evidence.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 16 diff, built on scratch branch
  `transplant-16-subject` (far end + `git cherry-pick -m 1` of the
  twelve merges in origin order, oldest first). NEVER committed to
  the arm branch. Branch LEFT in place, hash recorded in evidence,
  so the verdict is reproducible.
- Family 16: twelve merges (see §Family identity). All js=0, all
  pol=0, none an ancestor of the far end (verified — see §Family
  identity). No standalone commit, no second-parent-only content
  beyond each merge's own side branch.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the 16 GROUP as
  one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh
  STEP id (2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER
  for ordering but kept on the suspect list); ≥3/8 NOT-CARRIER. If
  the group reads CARRIER, the next arm splits it merge-by-merge
  (same rule as 2115 §3 (c) for families 4 and 13).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: per the tooling-resolution rule above — a tooling-only
  conflict resolves with `git checkout --ours` and the pick
  continues; ANY other conflicted file (any src/js, data, policy,
  docs, evidence, or test file) STOPS the arm immediately, with the
  exact conflict list reported, no hand-resolution, no narrowed
  re-run decided by this arm. If the subject cannot be built, the
  outcome is UNMEASURED-BY-CONFLICT and no judged sim runs.
- STEP id: t16-merges (fresh — the brief's suggestion; no earlier
  arm has used it).

## Seed-band freshness note (per local_seed_band_freshness skill)

Band 190391–190398 is the program-mandated MATCHED band per 2115
§3, reused by design across transplant arms — no new band assigned.
Check performed at run start: grep over every dated prereg
(`evidence/*/sim-*-prereg.md`) for `190391` returns 64+ files naming
the band (vetphantom, bisect, masterregress, culpritbisect,
transplant arms 2–16, and others) — the band is thoroughly "used"
by the skill's naming rule, and that reuse is EXACTLY what the
binding prereg mandates ("Seeds: the same 8, 190391–190398") so
survival counts stay comparable across arms. No forbidden-band or
contaminated-band list reserves this band against reuse; the
2026-11-10 preregs that mention forbidden/contaminated bands do not
name 190391–190398. This is a matched-band reuse, not a freshness
violation — same standing as the bisect prereg's own note.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md (wave law;
nothing in family 16 touches waves) and docs/CONTESTS.md (contests
played not RNG; nothing here touches contests). No canon doc covers
evidence/proof/test-only merge landings — these are measurement
artifacts (phone-frame receipts, neutral-panel baselines, probe and
test scripts, evidence notes), not game systems. Nothing here
invents canon. The one game-adjacent file any pick touches is a
test file (scripts/test-capable-bot-20261014.js, pick 12) — a test
is never read by the game.

## Family content (read before the picks)

- Pick 1, #15 holdout-tradeoff-007e: accepts the prove-out holdout
  `review_required` tradeoff in writing (+20/-10 to the evidence
  note). Evidence note only — but written on top of a file the far
  end never had (see §Pick-1 mechanism).
- Pick 2, #17 phone-fun-proof-master: phone-frame receipts (736/844)
  after the fun reverify; phone-frame-proof.json moves 96/82 lines.
  Receipt refresh only.
- Pick 3, #19 phone-fun-r2-master: second phone-frame receipt set;
  phone-frame-proof.json moves 6/6 lines. Receipt refresh only.
- Pick 4, #21 living-garden-deed-master: deed-attainment panel +
  test for the living-garden deed (evidence + a godpath test).
  Measurement artifact only.
- Pick 5, #23 bonds-goal-pick-probe-9cfc: one probe script (460
  lines). Measurement artifact only.
- Pick 6, #24 heard-raid-danger-3a06: raid-danger-heard evidence
  note (+4/-1) + test (+46). Test + evidence only — but written on
  top of files the far end never had (see §Informational reads).
- Pick 7, #27 dawn-scoring-entry-7449: dawn-pick-conflict probe +
  panel (evidence + probe script). Measurement artifact only.
- Pick 8, #31 one_person_army attainment: deed-attainment panel +
  test for the one-person-army deed (evidence + a godpath test),
  merged from origin/master into the OVE-37 port branch.
  Measurement artifact only.
- Pick 9, #49 phase6-role-census-01bc: role-census panel + analyzer
  + probe (38 files, all additions, 2943 insertions). Measurement
  artifact only.
- Pick 10, #50 improvements-verify-evidence-f8e3: improvements
  verification panel (8 files, 7744 insertions, one binary .gz).
  Measurement artifact only.
- Pick 11, #119 ove-159-phone-refresh-01a5: phone-frame receipts
  (736/844); phone-frame-proof.json moves 5/5 lines. Receipt
  refresh only.
- Pick 12, #121 ove-161-capable-seed-65: one line in the capable-bot
  test (1 insertion, 1 deletion). Test only.

Mechanism expectation: the group changes NO game code (js=0 for all
twelve merges), no kcal cost, no damage, no armor, no spawn, no food
yield, no spoilage, no wave or table gate number, no policy file. A
survival effect, if any, would have to come through a test or probe
script — but test/probe scripts are never read by the game. The
group is expected NOT-CARRIER if it measures at all; the live
question is whether the subject can even be built (pick 1).

## Merge-tree pre-check (read-only, before the subject)

Cherry-pick predictions use each pick's FIRST PARENT as the base
(the base `git cherry-pick -m 1` itself uses; the transplant12-14
and 15F arms used the same convention) and the TRUE preceding tree
as ours (the 15A-narrowed lesson: each pick's prediction is built
on the predicted-resolved tree of the previous pick, not the bare
far end). Run with
`git merge-tree --write-tree --merge-base=<first-parent> <ours> <theirs>`
(git 2.43: --write-tree prints one tree OID + conflicted-file info
+ messages; conflicted files are the `100644 <oid> <stage>\t<path>`
lines, stages 1/2/3). All commands below use FULL SHAs — the
written tree OID is sensitive to the argument spelling (conflict
labels embed the given refs), so the proof reproduces these exact
spellings.

- PICK 1 (#15 onto the far end):
  `git merge-tree --write-tree --merge-base=e44b0206e5cf0c63c3603fb0580592564e72f676 203a327750a223e0a1465dc51f5409787efdfaae b9f64660c73d6ec9c026415fb78dc51bd59055e8`
  → rc=1, tree 7c338f19a15d8ee0430560227bbc97b5a08e4498, conflicted
  files: EXACTLY ONE — evidence/2026-11-08/prove-out-holdout.md
  (stages 1 + 3 only: base blob aff0d5ec…, theirs blob d1b27ea5…,
  no stage 2). CONFLICT (modify/delete): "evidence/2026-11-08/
  prove-out-holdout.md deleted in 203a32775… and modified in
  b9f64660c…". PREDICTION: CONFLICT, NON-TOOLING → per the
  tooling-resolution rule the live pick 1 is expected to STOP the
  arm. No resolved tree and no prediction commit exist for pick 1
  (nothing to build on — the chain stops here).
- PICKS 2–12: NO chained prediction exists, because the chain stops
  at pick 1 — there is no pick-1-resolved tree to build pick 2's
  prediction on. The far-end-based reads below are INFORMATIONAL
  ONLY (each pick merged against the bare far end, same
  --merge-base=<first-parent> convention). They are NOT
  predictions: a pick's chained conflict set can differ from its
  bare-far-end set (e.g. pick 3's phone-fun-frame-r1.md conflict
  exists only because pick 2 adds that file — on a chained tree
  with pick 2 applied the file would be present). They are recorded
  so the coordinator can see which later picks carry the same
  missing-file shape and which are clean against the far end.
  - Pick 2 (#17 vs bare far end): rc=0, tree
    155a799b8ea1f57089ad76948f92274b7686654f, conflicted: NONE.
    CLEAN against the far end.
  - Pick 3 (#19 vs bare far end): rc=1, tree
    d39ff096f581fc10e84605e71505afd9c8b27084, conflicted: EXACTLY
    TWO — evidence/2026-11-08/phone-fun-frame-r1.md (modify/delete:
    deleted in the far end, modified in eb975a8a2 — the file was
    added on the origin line by pick 2's side branch) AND
    scripts/phone-frame-proof.json (content conflict, tooling).
  - Pick 4 (#21 vs bare far end): rc=0, tree
    bb446d104611ddc6bd19b5503567e417de984453, conflicted: NONE.
    CLEAN against the far end.
  - Pick 5 (#23 vs bare far end): rc=0, tree
    f59e24b8854a90b75414f6c8e9f209d5ad9bfc22, conflicted: NONE.
    CLEAN against the far end.
  - Pick 6 (#24 vs bare far end): rc=1, tree
    c7002fea20b552844527e3d7d3eff0e3a36a21f1, conflicted: EXACTLY
    TWO — evidence/2026-11-08/raid-danger-heard.md AND
    scripts/test-raid-danger-heard.js (both modify/delete: deleted
    in the far end, modified in aa5d9ef92 — both files were added
    on the origin line and never existed on the far-end line).
  - Pick 7 (#27 vs bare far end): rc=0, tree
    5a37af9e89b215a09b33e631cf3355b254d70e19, conflicted: NONE.
    CLEAN against the far end.
  - Pick 8 (#31 vs bare far end): rc=0, tree
    1ba44f8c153923b770161e9a480c76ac0f6f9c67, conflicted: NONE.
    CLEAN against the far end.
  - Pick 9 (#49 vs bare far end): rc=0, tree
    b091cab8e91f93ba776874fad214aa91ac3f49ae, conflicted: NONE.
    CLEAN against the far end.
  - Pick 10 (#50 vs bare far end): rc=0, tree
    5b91fd6c5fb985f771f6325b9c1facce308afb10, conflicted: NONE.
    CLEAN against the far end.
  - Pick 11 (#119 vs bare far end): rc=1, tree
    0ae869e3e5904092a3547c8498e8d5268e012a22, conflicted: EXACTLY
    ONE — scripts/phone-frame-proof.json (content conflict,
    tooling-only → would resolve --ours and continue, if reached).
  - Pick 12 (#121 vs bare far end): rc=1, tree
    7ad7801f68aaffc6833a59797cb7ec34970d52f2, conflicted: EXACTLY
    ONE — scripts/test-capable-bot-20261014.js (content conflict,
    NON-TOOLING test file → would STOP the arm if reached on a
    chained tree — but the chained set may differ; informational
    only).

## Pick-1 mechanism (verified, not guessed)

- The conflicted file exists at pick 1's base (e44b0206e, blob
  aff0d5ec…) and is ABSENT from ours (the far end):
  `git ls-tree e44b0206e` shows prove-out-holdout.md blob
  aff0d5ec…; `git cat-file -e 203a32775:evidence/2026-11-08/
  prove-out-holdout.md` fails; `git diff --name-status
  e44b0206e 203a32775 -- evidence/2026-11-08/prove-out-holdout.md`
  reports `D`.
- The file was added on the origin line by side-branch commit
  0ee7b3a39 "evidence: prove-out 64-seed holdout on 816404356"
  (NOT first-parent — a PR side-branch commit) and modified by
  side-branch commit ef7383bc0 "evidence: accept prove-out holdout
  review_required tradeoff" (+20/-10 — the same numstat as the
  merge's first-parent diff, i.e. the merge's diff vs its first
  parent IS the side-branch change). ef7383bc0 is pick 1's second
  parent. Neither commit is on the first-parent chain
  d229b58f5..a628aeaf3.
- The merge-tree reports the file as CONFLICT (modify/delete):
  "deleted in 203a32775… and modified in b9f64660c…", stages 1
  (base) + 3 (theirs) only, theirs version left in the merged
  tree. The far end never had the prove-out holdout note, so pick
  1's accepted-tradeoff write-up has no base to land on.
- Consequence recorded honestly: the same missing-file dependency
  shape as 15F pick 7 (person-trust), one pick earlier — family 16
  cannot be transplanted as a unit onto the far end in origin order
  without that file landing first. No resolution of
  balance-proof.json or phone-frame-proof.json would help. If the
  live pick 1 reproduces the modify/delete conflict, family 16 as a
  group is UNMEASURED-BY-CONFLICT at pick 1, and the coordinator's
  next decision is whether to drop pick 1 / measure picks 2–12 /
  land the file first — this arm decides none of that.

## Family identity (verified at run start, before any sim)

- Pick 1: b9f64660c73d6ec9c026415fb78dc51bd59055e8 "Merge pull request
  #15 from steve-vitale/cursor/holdout-tradeoff-007e". First parent
  e44b0206e5cf0c63c3603fb0580592564e72f676 (PR #14 merge); second
  parent ef7383bc0d052580f54369800f8529f1c10da117. Diff vs first
  parent, 1 file: evidence/2026-11-08/prove-out-holdout.md
  20/10. js=0, pol=0. NOT an ancestor of the far end.
- Pick 2: b74db6460dd1de9a0e081cfa0517a2e4b798cabd "Merge pull request
  #17 from steve-vitale/cursor/phone-fun-proof-master". First
  parent b9f64660c73d6ec9c026415fb78dc51bd59055e8; second parent
  07e3e3624a0a9cb03f3f8917b8451ea44e1da65d. Diff vs first parent,
  4 files: evidence/2026-11-08/phone-fun-frame-736-r1.json +2624,
  phone-fun-frame-844-r1.json +2696, phone-fun-frame-r1.md +5,
  scripts/phone-frame-proof.json 96/82. js=0, pol=0. NOT an
  ancestor of the far end.
- Pick 3: eb975a8a2e4e495904aa88fa04dc64908d6f398b "Merge pull request
  #19 from steve-vitale/cursor/phone-fun-r2-master". First parent
  b74db6460dd1de9a0e081cfa0517a2e4b798cabd; second parent
  9e7d61b93897ebb2441b7321a5e4113457c6e5e0. Diff vs first parent,
  4 files: evidence/2026-11-08/phone-fun-frame-736-r2.json +2704,
  phone-fun-frame-844-r2.json +2620, phone-fun-frame-r1.md 6/2,
  scripts/phone-frame-proof.json 6/6. js=0, pol=0. NOT an ancestor
  of the far end.
- Pick 4: 9f388a524a534d922f90a76a8f04d0d3bbb31e70 "Merge pull request
  #21 from steve-vitale/cursor/living-garden-deed-master". First
  parent eb975a8a2e4e495904aa88fa04dc64908d6f398b; second parent
  9095b34421543cfd178f36d63708b3802e90b6a9. Diff vs first parent,
  4 files: evidence/2026-11-08/living-garden-deed-attainment-panel.json
  +1262, living-garden-deed-attainment-panel.log +16,
  living-garden-deed-attainment.md +54,
  scripts/godpath/test-living-garden-deed-attainment.js +389.
  js=0, pol=0. NOT an ancestor of the far end.
- Pick 5: cd535096fbe19656cec3322d28679839a1a91bc3 "Merge pull request
  #23 from steve-vitale/cursor/bonds-goal-pick-probe-9cfc". First
  parent 713eb754524458be067c79fbfd3c89ee814dde80 (PR #22 merge);
  second parent 49fb2770d59c29aa653b5273e56bb3b756ea1932. Diff vs
  first parent, 1 file: scripts/probe-bonds-goal-pick-20261108.js
  +460. js=0, pol=0. NOT an ancestor of the far end.
- Pick 6: aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0 "Merge pull request
  #24 from steve-vitale/cursor/heard-raid-danger-3a06". First
  parent cd535096fbe19656cec3322d28679839a1a91bc3; second parent
  5599559cb65a375ca886ccfd9d894b5adbed8e8e. Diff vs first parent,
  2 files: evidence/2026-11-08/raid-danger-heard.md 4/1,
  scripts/test-raid-danger-heard.js +46. js=0, pol=0. NOT an
  ancestor of the far end.
- Pick 7: b41bd630012cba1f160870a20fe925c273b020ce "Merge pull request
  #27 from steve-vitale/cursor/dawn-scoring-entry-7449". First
  parent 0f55a928c162ff0e7c46cd5f17d239b293614d92 (PR #26 merge);
  second parent f2a6d79f30f0e4ca30a488188bfbe153e8b386a3. Diff vs
  first parent, 3 files: evidence/2026-11-08/dawn-pick-conflict.json
  +114, dawn-pick-conflict.md +49,
  scripts/probe-dawn-pick-conflict-20261108.js +320. js=0, pol=0.
  NOT an ancestor of the far end.
- Pick 8: 230dba21979bec1fb933cf646ba982de3c60ee33 "Merge
  origin/master (#31 one_person_army attainment) into OVE-37 port
  Co-authored-by: stevenvitale123 <stevenvitale123@gmail.com>".
  First parent 055c48f62a3a9902f66d9fea88e57390fa1954ad (15F pick 1);
  second parent 652caa69c2f063d261fa6bc01ae1d1f694f20d9c. Diff vs
  first parent, 4 files:
  evidence/2026-11-08/one-person-army-deed-attainment-panel.json
  +1048, one-person-army-deed-attainment-panel.log +16,
  one-person-army-deed-attainment.md +55,
  scripts/godpath/test-one-person-army-deed-attainment.js +331.
  js=0, pol=0. NOT an ancestor of the far end. (Note: #31 is a
  branch merge, not a PR merge — cherry-pick -m 1 still applies;
  its first parent is a 15F pick, so the pick sits between other
  families' picks on the origin line, but its own diff touches
  only evidence + one godpath test.)
- Pick 9: 18ed96788cc507bda6434750051062c2b1afb893 "Merge pull request
  #49 from steve-vitale/cursor/phase6-role-census-01bc". First
  parent 206fe4931e2e46c86fe22dc2071046ed0ba683ca (15D pick 2);
  second parent c019457b1a838b165ce0a5f5521fa2f4432f42ed. Diff vs
  first parent, 38 files, all additions, 2943 insertions:
  evidence/2026-11-08/phase6-role-census/analysis.json +1000,
  analysis.log +50, panel.json +961, panel.log +34, 32
  rolecensus-p6-{capable,competent}-seed*.json +1 each,
  scripts/analyze-phase6-role-census-20261108.js +395,
  scripts/probe-phase6-role-census-20261108.js +471. js=0, pol=0.
  NOT an ancestor of the far end.
- Pick 10: 3339c0195d2aceb202826ec95da92ff2f0c03fa7 "Merge pull request
  #50 from steve-vitale/cursor/improvements-verify-evidence-f8e3".
  First parent 18ed96788cc507bda6434750051062c2b1afb893; second
  parent 1b061300e21375b491bdca3379981c5e07b85552. Diff vs first
  parent, 8 files, 7744 insertions:
  evidence/2026-11-08/improvements-verify-cmp.json +3636,
  improvements-verify-cmp.log +1, improvements-verify-cmp.md +158,
  improvements-verify-features.json +2861,
  improvements-verify-features.log 0/0,
  improvements-verify-features.md +1086,
  improvements-verify-panel.log +2,
  improvements-verify-panel/panel.json.gz (binary, new). js=0,
  pol=0. NOT an ancestor of the far end.
- Pick 11: da153118c36741465e7630a7078f907ef6236952 "Merge pull request
  #119 from steve-vitale/cursor/ove-159-phone-refresh-01a5". First
  parent 1ec04e16715b5693293df8f84a51e59cd02aaf56 (family 1, PR #118
  merge); second parent be5620e7bbc25a20bdf831c98f6ee3477ebf57c5.
  Diff vs first parent, 4 files:
  evidence/2026-11-09/phone-ove159-frame-736-r1.json +2583,
  phone-ove159-frame-844-r1.json +2592,
  phone-ove159-frame-r1.md +12, scripts/phone-frame-proof.json
  5/5. js=0, pol=0. NOT an ancestor of the far end.
- Pick 12: a628aeaf3b7c3f2b0bca1a5f4baf58cef1c100e4 "Merge pull request
  #121 from steve-vitale/cursor/ove-161-capable-seed-65". First
  parent abb3c2db25ef2234f9a4b82adaf1f1b2191195e4 (family 5, PR #120
  merge); second parent 9a085609fd5460e560c3f3841e4079e67b73166e.
  Diff vs first parent, 1 file:
  scripts/test-capable-bot-20261014.js 1/1. js=0, pol=0. NOT an
  ancestor of the far end. (Note: a628aeaf3 is also the origin tip
  — the second parent of the merge e4dbe581b. Its one-line test
  change is the last origin-side content before the merge.)
- Pick order is origin order (oldest first), verified on the
  first-parent chain: `git log --first-parent --reverse
  d229b58f5..a628aeaf3` lists b9f64660c → b74db6460 → eb975a8a2 →
  9f388a524 → cd535096f → aa5d9ef92 → b41bd6300 → 230dba219 →
  18ed96788 → 3339c0195 → da153118c → a628aeaf3 in that order
  (positions 13, 14, 15, 16, 18, 19, 22, 27, 46, 47, 49, 51 of 51).
- No pick touches src/js/standing.js, scripts/policies, or
  scripts/green-list.txt (empty diff on all three paths for all
  twelve picks).
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0.

## Ordering note (recorded, not hidden)

The merge-tree pre-check and the pick-1 mechanism verification ran
as part of prereg preparation, before this file was committed — the
12-14, 15A-narrowed and 15F arms' preregs likewise record their
pre-check results. The binding requirement is met: this prereg is
committed BEFORE the subject is cut or any judged sim runs. No
subject branch exists yet; no STEP t16-merges corpus, summary, or
driver log exists. The pick-1 merge tree
(7c338f19a15d8ee0430560227bbc97b5a08e4498) is an unreferenced
prediction object, not a branch and not the subject.
