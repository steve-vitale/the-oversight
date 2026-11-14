# sim-transplant15f-prereg — family 15F (proof refreshes, likely inert) (Loop A, fleshout-20261114T1215Z)

Run: fleshout-20261114T1215Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15f-a, branch `sim-transplant15f-a`, worktree
`~/workspace/worktrees/sim-transplant15f-a`.

## Authority

Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
§15F (family 15F = proof refreshes, likely inert, 7 standalone
first-parent OVE commits, all js=0, pick order oldest first:
055c48f62 → 97a67d4f8 → 49341fd78 → 6e53adc62 → a1567198c →
be39a0a4e → 74a16306c). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds + conflict rule), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-14/sim-transplant12-14-prereg.md (method + proof
template: merge-tree pre-check with each pick's FIRST PARENT as
base, branch-identity legs worktree-only, prereg ancestry by
message/subject not hash).

Family 15F was never spawned by the dead 0936Z run. This is a fresh
arm in a fresh tree. The group is proof/evidence/green-list only
(all js=0) and likely inert — a STOP outcome is a legitimate,
landable result, not a failure.

## COORDINATOR TOOLING-RESOLUTION RULE (binding for this run's family-15 arms, decided 2026-11-14 ~10:00Z)

Pick in origin order. If a pick conflicts ONLY on zero-src-reader
tooling files (scripts/green-list.txt, scripts/balance-proof.json,
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

## 15F WARNING (grouping prereg)

These commits touch scripts/balance-proof.json,
scripts/phone-frame-proof.json and scripts/green-list.txt — files
regenerated per tip. Cherry-picks may conflict in tooling-only
files. Verified in the pre-check below: picks 1–4 and 6 conflict
ONLY on the two proof JSONs (never green-list.txt); pick 5 applies
cleanly; pick 7 conflicts on NON-tooling files (see §Pick-7
mechanism) and is expected to STOP the arm.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 15F diff, built on scratch branch
  `transplant-15f-subject` (far end + `git cherry-pick` of the
  seven picks in origin order — standalone commits, no `-m 1`).
  NEVER committed to the arm branch. Branch LEFT in place, hash
  recorded in evidence, so the verdict is reproducible.
- Family 15F: seven standalone first-parent commits (see §Family
  identity). No merge, no second-parent side.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the 15F GROUP as
  one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh
  STEP id (2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER
  for ordering but kept on the suspect list); ≥3/8 NOT-CARRIER. If
  the group reads CARRIER, the next arm splits it commit-by-commit
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
- STEP id: t15f-proofs (fresh — the grouping prereg's suggestion;
  no earlier arm has used it).

## Seed-band freshness note (per local_seed_band_freshness skill)

Band 190391–190398 is the program-mandated MATCHED band per 2115
§3, reused by design across transplant arms — no new band assigned.
Check performed at run start: grep over every dated prereg
(`evidence/*/sim-*-prereg.md`) for `190391` returns 64 files naming
the band (vetphantom, bisect, masterregress, culpritbisect,
transplant arms 2–15, and others) — the band is thoroughly "used"
by the skill's naming rule, and that reuse is EXACTLY what the
binding prereg mandates ("Seeds: the same 8, 190391–190398") so
survival counts stay comparable across arms. No forbidden-band or
contaminated-band list reserves this band against reuse; the
2026-11-10 preregs that mention forbidden/contaminated bands do not
name 190391–190398. This is a matched-band reuse, not a freshness
violation — same standing as the bisect prereg's own note.

## Canon

docs/CANON.md read first. No canon doc covers proof-refresh commits
or a person-trust errand-mix baseline refresh — these are
measurement artifacts (phone-frame receipts, neutral-panel
baselines, a probe script, a test-file tolerance), not game systems.
The pick-7 files belong to the person-trust writer feature
(docs/VILLAGER-BRAIN.md phase 2 writer slice, named in the pick-7
prereg itself), whose game code (src/js/person-trust.js, 233 lines,
side-branch commit 458811411) the far end never had — see §Pick-7
mechanism. Nothing here invents canon.

## Family content (read before the picks)

- Pick 1, 055c48f62 "OVE-37: refresh phone/balance proofs on master
  tip": regenerates the phone-frame receipts (736/844) and the
  neutral balance panel on the master tip; balance-proof.json and
  phone-frame-proof.json move by 4 and 18 lines. No game code, no
  policy, no test logic — a receipt refresh.
- Pick 2, 97a67d4f8 "OVE-47: refresh phone-frame proof on master
  tip": phone-frame receipts after the fun-reverify run;
  phone-frame-proof.json moves 16 lines. Receipt refresh only.
- Pick 3, 49341fd78 "OVE-53: refresh phone-frame proof after favor
  thresholds": phone-frame receipts after the favor-threshold
  change; phone-frame-proof.json moves 10 lines. Receipt refresh
  only.
- Pick 4, 6e53adc62 "OVE-56: refresh phone-frame proof after bond
  dawn": phone-frame receipts after bond dawn;
  phone-frame-proof.json moves 20 lines. Receipt refresh only.
- Pick 5, a1567198c "OVE-55: Phase 4 social rates screen on tip
  748cce3b8": a measurement screen (probe script + panel JSON +
  analysis) run on the 15A tip; adds files only, touches no proof
  JSON. Measurement artifact only.
- Pick 6, be39a0a4e "OVE-57: refresh proofs on tip 134a3d0ab after
  rebase": phone/balance proof refresh after the 15E rebase;
  balance-proof.json and phone-frame-proof.json move by 4 and 12
  lines; swaps one neutral-panel .gz (tip-6e53adc62 out,
  tip-134a3d0ab in). Receipt refresh only.
- Pick 7, 74a16306c "OVE-61: refresh person-trust non-aimed errand
  mix baseline": re-baselines the non-aimed errand tolerance in the
  person-trust test (+8/-7) and appends 42 lines to the person-trust
  prereg (pre-#41 drift vs the original d229b58f5 prereg; honest
  rebaseline, not a Game retune — per the test file's own comment).
  A test tolerance + evidence note only — but written on top of the
  person-trust writer feature the far end lacks (see §Pick-7
  mechanism).

Mechanism expectation: the group changes NO game code (js=0 for all
seven picks), no kcal cost, no damage, no armor, no spawn, no food
yield, no spoilage, no wave or table gate number. A survival effect,
if any, would have to come through the one test file pick 7 touches
— but a test file is never read by the game. The group is expected
NOT-CARRIER if it measures at all; the live question is whether the
subject can even be built (pick 7).

## Merge-tree pre-check (read-only, before the subject)

Cherry-pick predictions use each pick's FIRST PARENT as the base
(the base `git cherry-pick` itself uses; the transplant12-14 arm
used the same convention) and the TRUE preceding tree as ours (the
15A-narrowed lesson: each pick's prediction is built on the
predicted-resolved tree of the previous pick, not the bare far
end). Run with
`git merge-tree --write-tree --merge-base=<first-parent> <ours> <theirs>`
(git 2.43: --write-tree prints one tree OID + conflicted-file info
+ messages; conflicted files are the `100644 <oid> <stage>\t<path>`
lines, stages 1/2/3). All commands below use FULL SHAs — the
written tree OID is sensitive to the argument spelling (conflict
labels embed the given refs), so the proof reproduces these exact
spellings.

- PICK 1 (OVE-37 onto the far end):
  `git merge-tree --write-tree --merge-base=23245d5d6d91b4b5284e2f503345dcfd1621ff0c 203a327750a223e0a1465dc51f5409787efdfaae 055c48f62a3a9902f66d9fea88e57390fa1954ad`
  → rc=1, tree 1a2a7a47cb3e9c406200b0b442a0b6c23f0c80e1, conflicted
  files: EXACTLY TWO — scripts/balance-proof.json AND
  scripts/phone-frame-proof.json. No src/js conflict, no docs
  conflict, no green-list.txt conflict. PREDICTION: CONFLICT,
  tooling-only → resolve EACH with `git checkout --ours`,
  continue.
- PICK-1-RESOLVED TREE (predicted, temp-index build): merge tree
  1a2a7a47… with both conflicted files forced to the far-end
  version → 67eb5c3763a9122a2063917c4f81bfc4e0088bfb. Diff vs the
  far end is exactly the pick-1 diff minus the two proof JSONs: 3
  files, all additions (neutral-ove37-master-port.json.gz binary,
  phone-ove37-master-frame-736-r1.json +2613,
  phone-ove37-master-frame-844-r1.json +2609). Prediction commit
  54ee8f9dc967595700ea9b768455147b9e9f149e (tree 67eb5c37…,
  parent 203a32775). The live pick-1 commit's tree MUST equal
  67eb5c37… after the --ours resolutions (proof §7 asserts this);
  if it does not, the pick-2 prediction below is suspect and is
  re-run against the true tree.
- PICK 2 (OVE-47 onto the pick-1-resolved tree):
  `git merge-tree --write-tree --merge-base=c937de65f32d26e064d8935dd984490b2ee50a6c 54ee8f9dc967595700ea9b768455147b9e9f149e 97a67d4f8eedbe44296f045d6e7ea0990dbb7d36`
  → rc=1, tree 85563e78dafece7d8b389702d3ff508866d47d74, conflicted
  files: EXACTLY ONE — scripts/phone-frame-proof.json.
  PREDICTION: CONFLICT, tooling-only → resolve --ours, continue.
  Resolved tree 875ce641821a1d07fd13123b567ed08a684d9993,
  prediction commit 6c0e62869bfd31fd2e62a7b47f445f2dba790579.
- PICK 3 (OVE-53 onto the pick-2-resolved tree):
  `git merge-tree --write-tree --merge-base=4594de6b528e40872c356f1d465762581ce06cd1 6c0e62869bfd31fd2e62a7b47f445f2dba790579 49341fd7824023543b13dca40831d704d49e4637`
  → rc=1, tree 249dc673425f2d195dde6b5fc2ce1dd4e96aae1e, conflicted
  files: EXACTLY ONE — scripts/phone-frame-proof.json.
  PREDICTION: CONFLICT, tooling-only → resolve --ours, continue.
  Resolved tree 62931b19ce3e3745968d4a6a288ab6a3924c26a7,
  prediction commit 3f61a00fc721e7dabeaa76830f83d988dec9cc01.
- PICK 4 (OVE-56 onto the pick-3-resolved tree):
  `git merge-tree --write-tree --merge-base=1c1b23482a11581047af8a82cca0040ef7b162a1 3f61a00fc721e7dabeaa76830f83d988dec9cc01 6e53adc62e1570a9fdf3a80e1c20bee05004e709`
  → rc=1, tree a647e5e0a1a1c884b648adc8c2d70e9d16a9c1d7, conflicted
  files: EXACTLY ONE — scripts/phone-frame-proof.json.
  PREDICTION: CONFLICT, tooling-only → resolve --ours, continue.
  Resolved tree f8d9ce88b8d0c835b452a06de16b8e484696fabe,
  prediction commit 97104ebe4f817bfc4d310835c10fb9a44dffc297.
- PICK 5 (OVE-55 onto the pick-4-resolved tree):
  `git merge-tree --write-tree --merge-base=6e53adc62e1570a9fdf3a80e1c20bee05004e709 97104ebe4f817bfc4d310835c10fb9a44dffc297 a1567198c125a3649b8a8bd5de8bf160c8a51c6b`
  → rc=0, tree 043917f554d59a316b57bd34a010d2e97b49b6e3, conflicted
  files: NONE. PREDICTION: CLEAN apply (adds 4 files only).
  Resolved tree = merge tree, prediction commit
  0352381b7b46dc9e265ae88c7fcb4e9833e60604.
- PICK 6 (OVE-57 onto the pick-5-resolved tree):
  `git merge-tree --write-tree --merge-base=4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24 0352381b7b46dc9e265ae88c7fcb4e9833e60604 be39a0a4e0e7eeb93dda2dccdc4189a399ceb9bc`
  → rc=1, tree c4ee41198c86ece805c2712019b2e92676a52e00, conflicted
  files: EXACTLY TWO — scripts/balance-proof.json AND
  scripts/phone-frame-proof.json. PREDICTION: CONFLICT,
  tooling-only → resolve EACH with `git checkout --ours`,
  continue. The pick's .gz deletion (neutral-ove57-tip-6e53adc62)
  is CLEAN: the file is absent from ours (it was added on the
  origin line by 4a1c77cf1, after the far end diverged) and deleted
  by theirs — both sides deleted, so it stays absent. Resolved
  tree 7bee7b39eb98ce201163aaf86528d7aed220ce5b, prediction commit
  0dd7267b1953938815e7c992fd8adc2dcfc579b4.
- PICK 7 (OVE-61 onto the pick-6-resolved tree):
  `git merge-tree --write-tree --merge-base=be39a0a4e0e7eeb93dda2dccdc4189a399ceb9bc 0dd7267b1953938815e7c992fd8adc2dcfc579b4 74a16306c2879e58d4c6e0037657d63876e92088`
  → rc=1, tree 13f1049ef9b229ca9d70a6486f38f093d45004d6, conflicted
  files: EXACTLY TWO — evidence/2026-11-08/person-trust-prereg.md
  AND scripts/test-person-trust-20261108.js. PREDICTION: CONFLICT,
  NON-TOOLING → per the tooling-resolution rule the live pick 7 is
  expected to STOP the arm. Live picks are ground truth: if the
  live pick 7 conflicts on any non-tooling file, STOP, no
  hand-resolution. No resolved tree and no prediction commit exist
  for pick 7.

## Pick-7 mechanism (verified, not guessed)

- Both conflicted files exist at pick 7's base (be39a0a4e) and are
  ABSENT from ours (the pick-6-resolved tree, and the far end):
  `git ls-tree be39a0a4e` shows person-trust-prereg.md blob
  cadcb6e4… and test-person-trust-20261108.js blob 1e5037c2…;
  `git ls-tree 0dd7267b` shows neither; `git cat-file -e
  203a32775:<path>` fails for both.
- Both files were added on the origin line by side-branch commit
  458811411 "Write per-villager trust map from lived events"
  (2026-11-08, NOT first-parent — a PR side-branch commit):
  person-trust-prereg.md +48, test-person-trust-20261108.js +162,
  src/js/person-trust.js +233 (new), src/js/bond-initiation.js
  +13/-…, index.html +1, sw.js +1, scripts/person-trust-panel-20261108.js
  +49, evidence/2026-11-08/person-trust.md +75,
  neutral-person-trust.json.gz (new). That commit is family 10's
  PR #4 (person-trust-map-41aa) side content, not family 15F.
- Pick 7 modifies both files on top of that content (+42/-0 to the
  prereg, +8/-7 to the test). The merge-tree reports both as
  CONFLICT (modify/delete): "deleted in 0dd7267b… and modified in
  74a16306c…", stages 1 (base) + 3 (theirs) only, theirs version
  left in the merged tree. The far end never had the person-trust
  writer feature, so pick 7's refresh has no base to land on.
- Consequence recorded honestly: the grouping prereg's 15F WARNING
  named only the three tooling files, but pick 7's conflict is a
  genuine missing-feature dependency, not a tooling adjacency — the
  tooling-resolution rule correctly stops the arm, and no
  resolution of balance-proof.json or phone-frame-proof.json would
  help. If the live pick 7 reproduces the two modify/delete
  conflicts, family 15F as a group is UNMEASURED-BY-CONFLICT at
  pick 7, and the coordinator's next decision is whether the
  person-trust feature (family 10 side content) must land first /
  the group must be split so picks 1–6 are measured alone — this
  arm decides none of that.

## Family identity (verified at run start, before any sim)

- Pick 1: 055c48f62a3a9902f66d9fea88e57390fa1954ad "OVE-37: refresh
  phone/balance proofs on master tip" (2026-11-08). First parent
  23245d5d6d91b4b5284e2f503345dcfd1621ff0c (a merge — "Merge
  origin/master (#30 dawn honesty) into OVE-37 port Co-a"; the pick
  itself has exactly 1 parent — standalone commit, no merge).
  Diff vs first parent, 5 files:
  evidence/2026-11-08/neutral-ove37-master-port.json.gz (Bin 0 ->
  80499), evidence/2026-11-08/phone-ove37-master-frame-736-r1.json
  +2613/-0, evidence/2026-11-08/phone-ove37-master-frame-844-r1.json
  +2609/-0, scripts/balance-proof.json (4 lines changed),
  scripts/phone-frame-proof.json (18 lines changed). js=0, pol=0.
- Pick 2: 97a67d4f8eedbe44296f045d6e7ea0990dbb7d36 "OVE-47: refresh
  phone-frame proof on master tip" (2026-11-08). First parent
  c937de65f32d26e064d8935dd984490b2ee50a6c (single parent). Diff vs
  first parent, 4 files:
  evidence/2026-11-08/phone-fun-reverify-frame-736-r2.json +2660/-0,
  evidence/2026-11-08/phone-fun-reverify-frame-844-r2.json +2727/-0,
  evidence/2026-11-08/phone-fun-reverify-r1.md +9/-0,
  scripts/phone-frame-proof.json (16 lines changed). js=0, pol=0.
- Pick 3: 49341fd7824023543b13dca40831d704d49e4637 "OVE-53: refresh
  phone-frame proof after favor thresholds" (2026-11-08). First
  parent 4594de6b528e40872c356f1d465762581ce06cd1 (single parent).
  Diff vs first parent, 4 files:
  evidence/2026-11-08/phone-favor-frame-736-r1.json +2561/-0,
  evidence/2026-11-08/phone-favor-frame-844-r1.json +2653/-0,
  evidence/2026-11-08/phone-favor-frame-r1.md +10/-0,
  scripts/phone-frame-proof.json (10 lines changed). js=0, pol=0.
- Pick 4: 6e53adc62e1570a9fdf3a80e1c20bee05004e709 "OVE-56: refresh
  phone-frame proof after bond dawn" (2026-11-08). First parent
  1c1b23482a11581047af8a82cca0040ef7b162a1 (single parent). Diff vs
  first parent, 4 files:
  evidence/2026-11-08/phone-bond-frame-736-r1.json +2729/-0,
  evidence/2026-11-08/phone-bond-frame-844-r1.json +2725/-0,
  evidence/2026-11-08/phone-bond-frame-r1.md +11/-0,
  scripts/phone-frame-proof.json (20 lines changed). js=0, pol=0.
- Pick 5: a1567198c125a3649b8a8bd5de8bf160c8a51c6b "OVE-55: Phase 4
  social rates screen on tip 748cce3b8" (2026-11-08). First parent
  6e53adc62e1570a9fdf3a80e1c20bee05004e709 (single parent). Diff vs
  first parent, 4 files:
  evidence/2026-11-08/phase4-social-rates-analysis.json +207/-0,
  evidence/2026-11-08/phase4-social-rates-analysis.md +66/-0,
  evidence/2026-11-08/phase4-social-rates-panel.json +3008/-0,
  scripts/probe-phase4-social-rates-20261108.js +606/-0 (new).
  js=0, pol=0.
- Pick 6: be39a0a4e0e7eeb93dda2dccdc4189a399ceb9bc "OVE-57: refresh
  proofs on tip 134a3d0ab after rebase" (2026-11-08). First parent
  4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24 (single parent). Diff vs
  first parent, 7 files:
  evidence/2026-11-08/neutral-ove57-tip-134a3d0ab.json.gz (Bin 0 ->
  84846), evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz
  (Bin 93043 -> 0, DELETED),
  evidence/2026-11-08/phone-ove57-frame-736-r1.json +2633/-0,
  evidence/2026-11-08/phone-ove57-frame-844-r1.json +2712/-0,
  evidence/2026-11-08/phone-ove57-frame-r1.md +8/-0,
  scripts/balance-proof.json (4 lines changed),
  scripts/phone-frame-proof.json (12 lines changed). js=0, pol=0.
- Pick 7: 74a16306c2879e58d4c6e0037657d63876e92088 "OVE-61: refresh
  person-trust non-aimed errand mix baseline" (2026-11-08). First
  parent be39a0a4e0e7eeb93dda2dccdc4189a399ceb9bc (single parent).
  Diff vs first parent, 2 files:
  evidence/2026-11-08/person-trust-prereg.md +42/-0,
  scripts/test-person-trust-20261108.js +8/-7. js=0, pol=0.
- Pick order is origin order (oldest first), verified on the
  first-parent chain: `git log --first-parent --reverse
  d229b58f5..a628aeaf3` lists 055c48f62 → 97a67d4f8 → 49341fd78 →
  6e53adc62 → a1567198c → be39a0a4e → 74a16306c in that order.
  (Interleaving note: pick 2's first parent is 15A pick 1
  c937de65f; pick 3's first parent is 15A pick 2 4594de6b5; pick 4's
  first parent is 15C pick 2 1c1b23482; pick 6's first parent is 15E
  pick 3 4a1c77cf1 — the 15F picks sit between other families'
  picks on the origin line, but each pick's own diff touches only
  proof/evidence files, so no game-code dependency rides along
  except pick 7's person-trust dependency, which is a side-branch
  feature, not another family's pick.)
- No pick touches src/js/standing.js, scripts/policies, or
  scripts/green-list.txt (empty diff on all three paths for all
  seven picks).
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0.

## Ordering note (recorded, not hidden)

The merge-tree pre-check and the pick-7 mechanism verification ran
as part of prereg preparation, before this file was committed — the
12-14 and 15A-narrowed arms' preregs likewise record their
pre-check results. The binding requirement is met: this prereg is
committed BEFORE the subject is cut or any judged sim runs. No
subject branch exists yet; no STEP t15f-proofs corpus, summary, or
driver log exists. The temp-index predicted trees (67eb5c37…,
875ce641…, 62931b19…, f8d9ce88…, 043917f5…, 7bee7b39…) and their
prediction commits (54ee8f9d, 6c0e6286, 3f61a00f, 97104ebe,
0352381b, 0dd7267b) are unreferenced prediction objects, not
branches and not the subject.
