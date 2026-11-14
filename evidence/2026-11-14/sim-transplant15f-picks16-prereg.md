# sim-transplant15f-picks16-prereg — family 15F picks 1–6 ALONE (Loop A, fleshout-20261114T1355Z)

Run: fleshout-20261114T1355Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15f-picks16-a, branch
`sim-transplant15f-picks16-a`, worktree
`~/workspace/worktrees/sim-transplant15f-picks16-a`.

## Authority

Coordinator decision: evidence/2026-11-14/sim-transplant-round-1215.md
(next blank #4, route (a)) — measure picks 1–6 alone as their own
transplant, the subject branch already holding them at 4eca36017.
Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
§15F (family 15F = proof refreshes, likely inert, 7 standalone
first-parent OVE commits, all js=0, pick order oldest first:
055c48f62 → 97a67d4f8 → 49341fd78 → 6e53adc62 → a1567198c →
be39a0a4e → 74a16306c). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds + conflict rule), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-14/sim-transplant15f-prereg.md and
evidence/2026-11-14/sim-transplant15f.md (the 15F group arm: picks
1–6 landed live, pick 7 STOPPED, subject left in place at
4eca36017 — this arm's subject, pre-built and pre-verified).

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
evidence. (For THIS arm the picks are already landed — the rule is
recorded because the subject's validity rests on it; the live
resolutions are in the 15F evidence, seven entries, all
`git checkout --ours` + `git add`.)

## 15F WARNING (grouping prereg)

These commits touch scripts/balance-proof.json,
scripts/phone-frame-proof.json and scripts/green-list.txt — files
regenerated per tip. Cherry-picks may conflict in tooling-only
files. Verified by the 15F arm live: picks 1–4 and 6 conflicted
ONLY on the two proof JSONs (never green-list.txt); pick 5 applied
cleanly; pick 7 conflicted on NON-tooling files (see §Pick-7
exclusion) and STOPPED that arm.

## Prereg (binding, committed BEFORE any judged sim)

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 15F picks 1–6, ALREADY BUILT by the 15F
  group arm on scratch branch `transplant-15f-subject` (far end +
  `git cherry-pick` of the six picks in origin order — standalone
  commits, no `-m 1`). NEVER committed to the arm branch. Branch
  LEFT in place, hash recorded in evidence, so the verdict is
  reproducible. This arm does NOT re-pick: the subject is verified
  from the branch before any sim (see §Subject verification). If
  the subject does not verify, FAIL LOUDLY and stop — do not
  rebuild it.
- Family 15F picks 1–6: six standalone first-parent commits (see
  §Family identity). No merge, no second-parent side. Pick 7 is
  EXCLUDED from this transplant (see §Pick-7 exclusion).
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging the picks-1–6
  transplant as one unit. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once
  with a fresh STEP id (2/8 again → recorded AMBIGUOUS, treated as
  NOT-CARRIER for ordering but kept on the suspect list); ≥3/8
  NOT-CARRIER. If the six picks read CARRIER, the next arm splits
  them commit-by-commit (same rule as 2115 §3 (c) for families 4
  and 13).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: (a) subject verification failure → FAIL LOUDLY,
  stop, no judged sim runs; (b) a 2/8 read re-runs once with a
  fresh STEP id per the bisect rule; (c) any step-tooling failure
  (driver fail, standing-restore mismatch, missing per-seed file)
  → the step is INCOMPLETE, not a verdict — re-run the missing
  part only, never re-score.
- STEP id: t15f-picks16 (fresh — no earlier arm has used it).

## Subject verification (verified at run start, before any sim)

Run in the arm worktree against branch `transplant-15f-subject`:

- `git log --oneline 203a32775..4eca36017` shows exactly six
  commits, in origin order, subjects identical to the origin picks:
  c833d182d OVE-37 → 1654a4f67 OVE-47 → e59dfa262 OVE-53 →
  bc5fbf752 OVE-56 → 952d4cf04 OVE-55 → 4eca36017 OVE-57.
- Tip tree OID is 7bee7b39eb98ce201163aaf86528d7aed220ce5b — exactly
  the predicted pick-6-resolved tree from the 15F prereg.
- `git diff 203a32775..4eca36017 --stat`: 20 files, all additions,
  30547 insertions, 0 deletions — exactly picks 1–6 minus tooling.
- All three tooling files byte-identical to the far end at the
  subject tip (blob OIDs: balance-proof.json
  d0c6a42ff2395a49672f235f0218a3f969619dee, phone-frame-proof.json
  b06910148b2bb567ca3941b2ac3245872f74f632, green-list.txt
  410eccee8b091c9c5cc16b1931d98822f81fa601 — identical on both
  sides).
- No OVE-61 commit exists on the subject (`git log
  203a32775..transplant-15f-subject` contains no OVE-61 subject).
- neutral-ove57-tip-6e53adc62.json.gz is ABSENT from the subject tip
  (both-sides-deleted, clean); neutral-ove57-tip-134a3d0ab.json.gz is
  PRESENT (the replacement panel).
- Each live pick commit's tree equals its merge-tree predicted
  resolved tree (67eb5c37…, 875ce641…, 62931b19…, f8d9ce88…,
  043917f5…, 7bee7b39…) — live-validated by the 15F arm; the proof
  re-asserts all six.

## Seed-band freshness note (per local_seed_band_freshness skill)

Band 190391–190398 is the program-mandated MATCHED band per 2115
§3, reused by design across transplant arms — no new band assigned.
Check performed at run start: grep over every dated prereg
(`evidence/*/sim-*-prereg.md`) for `190391` returns 68 files naming
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
or a social-rates measurement screen — these are measurement
artifacts (phone-frame receipts, neutral-panel baselines, a probe
script, a panel JSON), not game systems. Nothing here invents canon.

## Family content (picks 1–6; read before the step)

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

Mechanism expectation: the six picks change NO game code (js=0 for
all six), no kcal cost, no damage, no armor, no spawn, no food
yield, no spoilage, no wave or table gate number. A survival effect,
if any, would have to come through files the game never reads
(evidence JSONs, a probe script) — the group is expected
NOT-CARRIER; the live question is the measurement itself, closing
the 15F completeness check the group arm could not finish.

## Merge-tree pre-check (recorded from the 15F prereg; live-validated there)

Cherry-pick predictions use each pick's FIRST PARENT as the base
and the TRUE preceding tree as ours (each pick's prediction built
on the predicted-resolved tree of the previous pick). The 15F arm
ran all seven predictions and then validated picks 1–6 LIVE: each
live pick's tree equalled its predicted resolved tree exactly.
This arm re-asserts the six predictions in its proof (no new
merge-tree run is needed to trust them — the live picks are ground
truth and are re-checked by tree OID).

- PICK 1 (OVE-37 onto the far end):
  `git merge-tree --write-tree --merge-base=23245d5d6d91b4b5284e2f503345dcfd1621ff0c 203a327750a223e0a1465dc51f5409787efdfaae 055c48f62a3a9902f66d9fea88e57390fa1954ad`
  → rc=1, tree 1a2a7a47cb3e9c406200b0b442a0b6c23f0c80e1, conflicted
  files: EXACTLY TWO — scripts/balance-proof.json AND
  scripts/phone-frame-proof.json. PREDICTION: CONFLICT,
  tooling-only → resolve EACH with `git checkout --ours`,
  continue. Resolved tree
  67eb5c3763a9122a2063917c4f81bfc4e0088bfb, prediction commit
  54ee8f9dc967595700ea9b768455147b9e9f149e. Live pick commit
  c833d182d, tree 67eb5c37… — EXACT.
- PICK 2 (OVE-47 onto the pick-1-resolved tree):
  `git merge-tree --write-tree --merge-base=c937de65f32d26e064d8935dd984490b2ee50a6c 54ee8f9dc967595700ea9b768455147b9e9f149e 97a67d4f8eedbe44296f045d6e7ea0990dbb7d36`
  → rc=1, tree 85563e78dafece7d8b389702d3ff508866d47d74, conflicted
  files: EXACTLY ONE — scripts/phone-frame-proof.json.
  PREDICTION: CONFLICT, tooling-only → resolve --ours, continue.
  Resolved tree 875ce641821a1d07fd13123b567ed08a684d9993,
  prediction commit 6c0e62869bfd31fd2e62a7b47f445f2dba790579. Live
  pick commit 1654a4f67, tree 875ce641… — EXACT.
- PICK 3 (OVE-53 onto the pick-2-resolved tree):
  `git merge-tree --write-tree --merge-base=4594de6b528e40872c356f1d465762581ce06cd1 6c0e62869bfd31fd2e62a7b47f445f2dba790579 49341fd7824023543b13dca40831d704d49e4637`
  → rc=1, tree 249dc673425f2d195dde6b5fc2ce1dd4e96aae1e, conflicted
  files: EXACTLY ONE — scripts/phone-frame-proof.json.
  PREDICTION: CONFLICT, tooling-only → resolve --ours, continue.
  Resolved tree 62931b19ce3e3745968d4a6a288ab6a3924c26a7,
  prediction commit 3f61a00fc721e7dabeaa76830f83d988dec9cc01. Live
  pick commit e59dfa262, tree 62931b19… — EXACT.
- PICK 4 (OVE-56 onto the pick-3-resolved tree):
  `git merge-tree --write-tree --merge-base=1c1b23482a11581047af8a82cca0040ef7b162a1 3f61a00fc721e7dabeaa76830f83d988dec9cc01 6e53adc62e1570a9fdf3a80e1c20bee05004e709`
  → rc=1, tree a647e5e0a1a1c884b648adc8c2d70e9d16a9c1d7, conflicted
  files: EXACTLY ONE — scripts/phone-frame-proof.json.
  PREDICTION: CONFLICT, tooling-only → resolve --ours, continue.
  Resolved tree f8d9ce88b8d0c835b452a06de16b8e484696fabe,
  prediction commit 97104ebe4f817bfc4d310835c10fb9a44dffc297. Live
  pick commit bc5fbf752, tree f8d9ce88… — EXACT.
- PICK 5 (OVE-55 onto the pick-4-resolved tree):
  `git merge-tree --write-tree --merge-base=6e53adc62e1570a9fdf3a80e1c20bee05004e709 97104ebe4f817bfc4d310835c10fb9a44dffc297 a1567198c125a3649b8a8bd5de8bf160c8a51c6b`
  → rc=0, tree 043917f554d59a316b57bd34a010d2e97b49b6e3, conflicted
  files: NONE. PREDICTION: CLEAN apply (adds 4 files only).
  Resolved tree = merge tree, prediction commit
  0352381b7b46dc9e265ae88c7fcb4e9833e60604. Live pick commit
  952d4cf04, tree 043917f5… — EXACT.
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
  0dd7267b1953938815e7c992fd8adc2dcfc579b4. Live pick commit
  4eca36017, tree 7bee7b39… — EXACT.

## Pick-7 exclusion (why pick 7 is NOT in this transplant)

Pick 7, 74a16306c "OVE-61: refresh person-trust non-aimed errand
mix baseline", refreshes the baseline of the person-trust test and
appends 42 lines to the feature's prereg. Both files it touches
(evidence/2026-11-08/person-trust-prereg.md,
scripts/test-person-trust-20261108.js) were added on the origin
line by side-branch commit 458811411 "Write per-villager trust map
from lived events" (2026-11-08, NOT first-parent — family 10's PR
#4 side content), which also added src/js/person-trust.js (+233).
The far end never had any of it. The 15F arm's live pick 7
conflicted modify/delete on both files (DU/DU, stages 1+3 only)
and STOPPED per the tooling-resolution rule; the coordinator
decided route (a) — measure picks 1–6 alone. Pick 7 stays blocked
on the person-trust feature; it is not measured here and no
verdict is claimed for it. (A test file is never read by the game
anyway, so even a successful landing would be expected to read
NOT-CARRIER — but that expectation is not a measurement, and this
arm measures only picks 1–6.)

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
- Pick order is origin order (oldest first), verified on the
  first-parent chain: `git log --first-parent --reverse
  d229b58f5..a628aeaf3` lists 055c48f62 → 97a67d4f8 → 49341fd78 →
  6e53adc62 → a1567198c → be39a0a4e → 74a16306c in that order (the
  first six are this transplant; the seventh is excluded per §Pick-7
  exclusion).
- No pick touches src/js/standing.js, scripts/policies, or
  scripts/green-list.txt (empty diff on all three paths for all six
  picks).
- Far-end native standing.js sha256 is 75762cb2…; fix standing.js
  (5157782a4) sha256 is f8fda4295a99…; far-end policy sha256 is
  a7ff5c51… (same substrate as the bisect prereg).
- Wall numbers carried in (collapse band, 8 seeds 190391–190398,
  150d): far end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0,
  table 0, wins 0.

## Ordering note (recorded, not hidden)

The merge-tree pre-check ran as part of the 15F group arm's prereg
preparation and its predictions were live-validated by that arm's
picks — this arm records them, it does not re-run them as new
work. The subject branch pre-existed this arm (built by the 15F
arm, left in place per the transplant program) and was VERIFIED
from the branch at this run's start (§Subject verification). The
binding requirement is met: this prereg is committed BEFORE any
judged sim runs. No STEP t15f-picks16 corpus, summary, or driver
log exists. The temp-index prediction commits (54ee8f9d,
6c0e6286, 3f61a00f, 97104ebe, 0352381b, 0dd7267b) are
unreferenced prediction objects, not branches and not the subject.
