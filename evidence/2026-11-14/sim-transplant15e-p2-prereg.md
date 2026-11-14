# sim-transplant15e-p2-prereg — family 15E pick 2 ALONE on the 14+12 base (Loop A, fleshout-20261114T2015Z)

Run: fleshout-20261114T2015Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-p2-a, branch `sim-transplant15e-p2-a`,
worktree `~/workspace/worktrees/sim-transplant15e-p2-a`.

## Authority

Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
§15E (family 15E = resume / conversation repair, 3 standalone
first-parent commits, pick order oldest first: bb6a301cf →
7041e1bfb → 4a1c77cf1). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program definition + thresholds + conflict rule), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-14/sim-transplant15e-prereg.md (pick identities,
first parents, tooling-resolution rule, pick-2 mechanism: its quote
check sits inside `convoSnippetIsStageDirection`, a function family
14 introduced that the far end never had — proven by the 15E-alone
arm, which STOPped at pick 2), plus
evidence/2026-11-14/sim-transplant15e-1412-prereg.md (the 14+12
route, pick numbering 0–4) + evidence/2026-11-14/sim-transplant15e-p12-prereg.md
(picks 1+2 on the 14+12 base; its pick 2 is THIS arm's pick, applied
on top of pick 1 — this arm isolates it WITHOUT pick 1).

## What remains unmeasured, and why this arm exists

Family 15E is now measured NOT-CARRIER 4/8 in every combination
tried: pick 1 alone (sim-transplant15e-p1, subject f541e4cd1),
picks 1+2 on the 14+12 base (sim-transplant15e-p12, subject
312647db0), narrowed pick-3 conversation.js-only
(sim-transplant15e-p3conv, subject 740c9ab96). What remains
unmeasured is pick 2 ALONE. It cannot land on the bare far end
(its quote check sits inside `convoSnippetIsStageDirection`,
which the far end never had — proven by the 15E-alone arm's STOP
at pick 2). On the 14+12 base the function exists, so pick 2
alone is buildable there: the 1412 arm already applied 7041e1bfb
on the 14+12 base (its pick 3, at 312647db0 — on top of pick 1).
This arm isolates it — pick 2 alone on 14+12, no pick 1 — and
judges it. If it reads CARRIER where picks 1+2 read NOT-CARRIER,
that would be a genuine interaction finding (pick 1 masking pick
2); the expected read is NOT-CARRIER 4/8, seed-for-seed identical
to the far end, like every other 15E unit.

## COORDINATOR TOOLING-RESOLUTION RULE (binding for this run's family-15 arms, decided 2026-11-14 ~10:00Z)

Pick in origin order. If a pick conflicts ONLY on zero-src-reader
tooling files (scripts/green-list.txt, scripts/balance-proof.json,
scripts/phone-frame-proof.json), resolve EACH such file with
`git checkout --ours` (keep the 14+12-base version byte-identical)
and continue the cherry-pick — do NOT hand-edit. If ANY other file
conflicts (any src/js, data, policy, docs, or test file), STOP
immediately, report the exact conflict list, do NOT hand-resolve,
do NOT decide a narrowed re-run. The proof MUST assert: (1) the
subject's game-code diff equals the pick's diff exactly, and (2)
each resolved tooling file is byte-identical to the 14+12 base.
Record every resolution (file, pick, method) in prereg + evidence.

## Prereg (binding, committed BEFORE cutting the subject or running any judged sim)

- Base: the 14+12 subject `transplant-12-14-subject` at
  c8655548f4be892c7722f2bbb46910c3c7262d5c (tree
  e78fac42d89e811f6bfce981b7274e5ee3c5c014) — far end 203a32775
  (GOOD 4/8) + family 14 (merge 7688cb7a4) + family 12 (merge
  ac119e4ed). Both base families are already exonerated (see
  §Base exoneration). The far-end baseline for comparison is 4/8,
  per-seed days 86/144/150/43/150/87/150/150. Every step swaps in
  the roster-check standing fix exactly as the bisect prereg
  specifies (fix file sha f8fda4295a99, from commit 5157782a4;
  native restored byte-identical afterwards, sha-verified).
- Subject: far end + family 14 + family 12 + ONLY pick 2
  (7041e1bfb), built on scratch branch
  `transplant-15e-p2-subject` by cutting at c8655548f and running
  `git cherry-pick 7041e1bfb`, resolving the two predicted
  tooling conflicts with `git checkout --ours` and continuing.
  NEVER committed to the arm branch. Branch LEFT in place, hash
  recorded in evidence, so the verdict is reproducible.
  Predicted subject tree (constructed during prereg preparation
  via a temp index from the merge-tree output):
  35857b15ff5a61750b9dccf9ab1f21bb8c3d705f; prediction commit
  c7e82c9774871ca6596264a30a1b0fdae25528b6 (commit-tree of that
  tree, parent = c8655548f). Its diff vs the 14+12 base is
  EXACTLY pick 2 MINUS the two tooling files (10 files — see
  §Predicted subject diff).
- Family 15E pick 2: one standalone first-parent commit (see
  §Family identity). No merge, no second-parent side. Picks 1
  and 3 are NOT part of this arm's subject — this arm isolates
  pick 2 alone on 14+12.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as
  the bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8 on the band, judging pick 2 ALONE.
  ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh STEP id
  (2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
  ordering but kept on the suspect list — per round-1355 metric
  review, a deterministic re-run is vacuous, so if the re-run is
  per-seed identical, record AMBIGUOUS and note the determinism;
  the honest resolver is a fresh seed band, not a third run of
  this band); ≥3/8 NOT-CARRIER.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: per the tooling-resolution rule above — the pick
  may conflict ONLY on the two predicted tooling files
  (scripts/balance-proof.json, scripts/phone-frame-proof.json,
  each resolved --ours). If ANY other file conflicts (any
  src/js, data, policy, docs, or test file — including
  src/js/conversation.js and
  scripts/test-snippet-stage-direction.js), STOP as
  UNMEASURED-BY-CONFLICT: report the exact conflict list,
  commit the prereg + pre-check evidence, and finish — no
  hand-resolution, no narrowed re-run decided by this arm. If the
  subject cannot be built, the outcome is UNMEASURED-BY-CONFLICT
  and no judged sim runs.
- STEP id: t15e-p2 (fresh — no prior STEP id exists for pick 2
  alone; t15e-p12 judged picks 1+2 as a unit, t15e-resume never
  ran).

## Base exoneration (why this subject measures pick 2 alone)

- Family 14 alone is MEASURED NOT-CARRIER 4/8
  (evidence/2026-11-14/sim-transplant14.md, arm
  sim-transplant14-a, STEP t14-7688cb7a4): survived 4/8,
  per-seed days 86/144/150/43/150/87/150/150, BYTE-IDENTICAL to
  the far-end endpoint days.
- The 12+14 pair is MEASURED NOT-CARRIER 4/8, seed-for-seed
  identical to the far end
  (evidence/2026-11-14/sim-transplant12-14.md, arm
  sim-transplant12-14-a, STEP t12-14-combined, subject
  transplant-12-14-subject at c8655548f, tree e78fac42… — the
  same tree this arm cuts its subject from): survived 4/8,
  per-seed days 86/144/150/43/150/87/150/150, IDENTICAL to the
  far-end baseline on all 8 seeds.
- 15E picks 1+2 on this same base are MEASURED NOT-CARRIER 4/8,
  seed-for-seed identical
  (evidence/2026-11-14/sim-transplant15e-p12.md, STEP t15e-p12,
  subject 312647db0).
- Any collapse in this subject is therefore attributable to 15E
  pick 2 alone (the only content the subject adds on top of the
  exonerated 12+14 base).

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers resume /
conversation repair: conversation threads develop over multiple
exchanges ("Tell me more" goes deeper until honestly exhausted);
unfinished business is a real beat; resume openers are structural
grammar; a resume opener that asks whether to hear / pick up the
unfinished thread must deliver that thread; resume openers must
quote real spoken memory, never stage direction or meta
scaffolding. No standalone canon doc covers the OVE-33 pick
itself — the pick is a coherence repair inside the documented
conversation contract (stage-direction quotes stay out of resume
openers), not a new system. Nothing here invents canon.

## Family content (read before the pick)

- Pick 2, 7041e1bfb "OVE-33: refresh stale quick proofs and fix
  outside-Muse fails": mostly a proof refresh (phone-frame
  receipts, balance-proof refresh, godpath test fixes). Its ONE
  game-code hunk is in src/js/conversation.js (+4/-0): inside
  `convoSnippetIsStageDirection`, a quoted beat ("They go still.
  \"So it's not just me…\"") is real memory, not stage direction —
  only pure mood/silence narration counts as stage direction. In
  plain words: a line that is mostly narration but wraps a real
  spoken sentence in quotes still counts as something the
  villager really said, so the guard doesn't throw away real
  speech. The pick's other files are evidence receipts (.json/.gz),
  tooling proof files (scripts/balance-proof.json 2/2,
  scripts/phone-frame-proof.json 6/6), godpath test fixes, the
  snippet test's OVE-33 assertions (+4), and sw.js +1 (adds the
  villager-brain.js asset line).

## Family identity (verified at run start, before any sim)

- Pick 2: 7041e1bfb7e8b69387bd3203a58eed00115ec8d7 "OVE-33:
  refresh stale quick proofs and fix outside-Muse fails". First
  parent c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212 (Merge pull
  request #28, dialog-recap-teach-35a9 — family 3). Single parent
  (standalone, not a merge). Diff: 12 files —
  evidence/2026-11-08/neutral-ove33-master-quick.json.gz (binary,
  new), evidence/2026-11-08/phone-ove33-frame-736-r1.json +2585/-0,
  evidence/2026-11-08/phone-ove33-frame-844-r1.json +2686/-0,
  scripts/balance-proof.json +2/-2,
  scripts/godpath/test-mobile-combat-cadence.js +4/-0,
  scripts/godpath/test-occupation-panels.js +1/-1,
  scripts/godpath/test-time-save-crashes.js +3/-2,
  scripts/phone-frame-proof.json +6/-6,
  scripts/test-establishment-r20-fixes-20261020.js +3/-0,
  scripts/test-snippet-stage-direction.js +4/-0,
  src/js/conversation.js +4/-0, sw.js +1/-0.
- Pick order context: pick 2 is the second of family 15E's three
  picks on the first-parent chain d229b58f5..a628aeaf3
  (bb6a301cf → 7041e1bfb → 4a1c77cf1). Picks 1 and 3 are NOT part
  of this arm's subject — this arm isolates pick 2 alone on
  14+12.
- Sequence dependencies: pick 1 IS an ancestor of pick 2's first
  parent c32ff6fa8; pick 2 IS an ancestor of pick 3's first parent
  134a3d0ab. Family 14 IS an ancestor of pick 2's first parent
  (pick 1's first parent 7688cb7a4 is family 14, and family 14 is
  an ancestor of c32ff6fa8); family 12 IS an ancestor of pick 2's
  first parent. Family 14 and family 12 are NOT ancestors of the
  far end — that is why the base is the 14+12 subject, not the
  bare far end.
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg). The 14+12 base's standing.js is the far-end
  native (families 14/12 do not touch it); its policy is the
  far-end own policy (a7ff5c51…).

## Merge-tree pre-check (run during prereg preparation, subject NOT yet cut)

`git merge-tree --write-tree --merge-base=c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212
c8655548f4be892c7722f2bbb46910c3c7262d5c
7041e1bfb7e8b69387bd3203a58eed00115ec8d7` (base = pick's first
parent, ours = 14+12 subject, theirs = pick 2, full 40-char
hashes throughout — the merge-tree OID depends on the refs AS
SPELLED).

- rc=1, merged tree 4111ed85351a31a1ebc0da371da74c5b9d5315b0.
- Conflicted files EXACTLY TWO — scripts/balance-proof.json
  (tooling) and scripts/phone-frame-proof.json (tooling). BOTH
  zero-src-reader tooling files → resolve EACH with
  `git checkout --ours` and continue (the coordinator
  tooling-resolution rule).
- src/js/conversation.js AUTO-MERGED CLEAN (no CONFLICT line for
  it; merged blob 6e095015446e86912f68ef40fcb226a95ff739f0 —
  exactly the pick's resulting conversation.js blob).
- scripts/test-snippet-stage-direction.js AUTO-MERGED CLEAN (it
  exists on the 14+12 base — family 14 created it — so no
  modify/delete; merged blob 92e4b9fe882dd3422bbfea71980638a2b80131cf
  — exactly the pick's resulting test blob).
- sw.js AUTO-MERGED CLEAN (the +1 villager-brain asset line
  applies onto the 14+12 base's sw.js; merged blob 13304fb4…
  differs from the pick's resulting blob 43f0bef8… only because
  the two bases' sw.js differ elsewhere — the added LINE is
  identical).
- Conflict markers in the merged tree: balance-proof.json lines
  3/6/9; phone-frame-proof.json lines 7/15/23 and 81/91/101 —
  EXACTLY the same files and marker lines the p12 arm's pick-2
  prediction named (its merged tree 9f0ee83b…; the tree OID
  differs because ITS ours was the pick-1-resolved tree
  45f64b03…, not the bare 14+12 base — the conflict set and
  markers are identical).
- BOTH section kinds read: the `changed in both` entries (the
  two conflicted files, stages 1/2/3) AND the `Auto-merging`
  messages (balance-proof.json, phone-frame-proof.json,
  conversation.js, sw.js — the merge-tree parser tracks both,
  per the sim-findings.md lesson).
- PREDICTION: the cherry-pick will conflict on exactly the two
  predicted tooling files; conversation.js, the snippet test,
  sw.js, the godpath tests, the establishment test, and the
  evidence receipts all apply cleanly. The subject is buildable
  by the method in §Prereg, with predicted tree 35857b15…
  (diff vs the 14+12 base exactly pick 2 minus the two tooling
  files — see §Predicted subject diff).

## Predicted subject diff (predicted tree 35857b15… vs the 14+12 base c8655548f)

10 files, 5291 insertions / 3 deletions:

- evidence/2026-11-08/neutral-ove33-master-quick.json.gz (binary, new, blob 326b65e8… — exactly the pick's blob)
- evidence/2026-11-08/phone-ove33-frame-736-r1.json +2585 (blob 88149239… — exactly the pick's blob)
- evidence/2026-11-08/phone-ove33-frame-844-r1.json +2686 (blob 2f53f176… — exactly the pick's blob)
- scripts/godpath/test-mobile-combat-cadence.js +4 (blob 6f979297… — exactly the pick's blob)
- scripts/godpath/test-occupation-panels.js +1/-1 (blob c9c24bb1… — exactly the pick's blob)
- scripts/godpath/test-time-save-crashes.js +3/-2 (blob ada6b518… — exactly the pick's blob)
- scripts/test-establishment-r20-fixes-20261020.js +3 (blob 6d24449f… — exactly the pick's blob)
- scripts/test-snippet-stage-direction.js +4 (blob 92e4b9fe… — exactly the pick's blob)
- src/js/conversation.js +4/-0 (blob 6e095015… — exactly the pick's blob)
- sw.js +1 (blob 13304fb4… — same +1 line as the pick; blob differs from the pick's 43f0bef8… only by base sw.js drift elsewhere)
- scripts/balance-proof.json and scripts/phone-frame-proof.json:
  byte-identical to the 14+12 base (blobs d0c6a42f… and
  b0691014… — the same blobs as on the far end, per the p12
  prereg).

## Pick-2 mechanism (why the quote check lands clean on 14+12)

Pick 2's only game-code hunk inserts 4 lines (a 3-line comment +
the quote check `if (/"/.test(s)) return false;`) inside
`convoSnippetIsStageDirection`, anchoring on the family-12-widened
`.replace(...)` quote-strip line. On the bare far end the function
does not exist at all (proven by the 15E-alone arm: `git grep -c
convoSnippetIsStageDirection 203a32775` = 0; the conflict markers
sat at conversation.js lines 1730/1731/1754 with an EMPTY ours
side). On the 14+12 base the function EXISTS: defined at
conversation.js line 1745 (`convoSnippetIsStageDirection(sn) {`),
called at line 1732, carrying the family-12-widened anchor
(`const s = String(sn).trim().replace(/^[\"'“”]+|[\"'“”]+$/g, '');`)
and the widened return checks. The quote check itself has 0 hits
on the 14+12 base and 1 hit in the pick. The test file carries
family 12's OVE-29 assertions (74 lines at pick 2's base AND 74
lines on the 14+12 base — the insertion context matches), and the
OVE-33 assertions ('They go still.') have 0 hits on the base and
1 hit in the pick. The merge-tree confirms it: pick 2's game-code
and test hunks merge clean, and only the two proof-refresh
tooling files conflict (their contents drifted on both lines
since pick 2's base — the same cumulative-line drift class as the
brief-base artifact, not a family conflict).

## Seed-band freshness note (per local_seed_band_freshness skill)

- Band: 190391–190398, the program-mandated matched band per 2115
  §3, reused BY DESIGN across transplant arms — no new band
  assigned. This is a matched-band reuse, not a fresh-band claim.
- Check run at run start: `grep -rl '190391'
  evidence/*/sim-*-prereg.md` — 78 preregs name the band (the
  p3conv prereg counted 75; the count has grown as more transplant
  arms ran — the band is named everywhere because it IS the
  program's matched band).
- Forbidden/contaminated lists: no forbidden or contaminated list
  names this band (per the 15E prereg's check of the goal
  hidden_files lists; the current run's claim names it only as
  the program's matched band in the run claim). No fresh band is
  claimed; the reuse is the program design, recorded here so a
  later reader does not mistake the hits for contamination.

## Ordering note

The merge-tree pre-check ran during prereg preparation; the
subject branch does NOT exist yet and no judged sim has run. This
prereg is committed BEFORE the subject is cut or any judged sim
runs. The proof script scripts/test-transplant15e-p2-a.js is
committed with it (stage 1: pick identity, base exoneration,
pre-check, mechanism, content, verdict mapping, prereg record,
base state; stage 2 appended after the live pick + judged step).

## Resolutions recorded (file, pick, method)

None yet — no pick has been applied live. (Predicted: pick 2 —
scripts/balance-proof.json, `git checkout --ours` (14+12-base
version kept byte-identical); pick 2 —
scripts/phone-frame-proof.json, `git checkout --ours` (14+12-base
version kept byte-identical).)
