# Lane B r195 social-life adoption — coordinator evidence

**Run:** journey-social-life r195 (leg 5), scheduled 14:00 CST 2026-11-13,
timed out at its 1h limit. **Adoption:** coordinator (parent-spawned),
completed 2026-11-13 ~22:35Z. **Merged locally, pending ship** — no push,
no version bump, no live claim.

## What the timed-out run left

- Worktree `journey2-social`, branch `journey2-social`, tip `41f6378ea`:
  `476ed3f47` [needs-eyes] (M12 spend-out fix + M11 recap pool fix,
  `src/js/convo-dialogue.js` + `src/js/conversation.js` + 3 new proof
  tests + 3 test repoints) and `41f6378ea` (evidence, panel verdicts
  M1–M12, seeds 44101–44104).
- Panel (not re-run by adoption): 4 seeds, all villages lost, 69 fallen /
  3 alive; M1 GO, M2 ANSWERED, M3 invitations sometimes taken, M4 sense
  GO, M5 report-only (3/4 past d100, median 133d — first social panel
  above the 126d control median), M6 GO, M7 dedupe HOLDS, M8 SETTLED,
  M9 HOLDS, M10/M10b HOLDS, B2 HOLDS, M11 bar met (16 recap-empty
  flags), M12 bar met (107/185 door-req flags, worst sitting 8 serves).
- The run's gate died incomplete at timeout (check.js PID 200449 killed;
  partial log `journey-social-life-r195-gate.log`, 163 bytes — NOT a
  result; left untracked, died with the tree).
- Lock `playtest-loop-2.lock` held (run_id
  `journey2-social-r195-20261113T195543Z`); no orphan hbloop survived
  (verified by ps at adoption — none found).

## Adoption gate (full re-run in the worktree)

`node scripts/check.js --quick`: **332 passed, 8 failed in 1276s**
(log `evidence/2026-11-13/journey-social-life-r195-gate-adoption.log`).
Adjudication — **0 attributable**:

| Failure | Verdict |
|---|---|
| living-garden, occupation-panels, one-person-army, trust-observer-neutrality (all exact-120s timeouts) | Load artifacts — all 4 green standalone |
| measurement-proof-update + measurement-workflow (staleness pair) | Pre-existing — proof stale at base: 18 manifest-covered files changed between b10's tip `dc95859a8` and base `340c6679a`; still stale post-rebase on this branch's 2 src/js changes (re-verified standalone post-rebase, exit 1) |
| phone-frame-proof | Pre-existing stale receipt (standing gate set) |
| measurement-cache-flags (0/4 in-gate) | Write-flap artifact — EPERM in `balance-panel.js:328` worker writes during flap 21:27–22:15Z; re-ran **4/4 standalone** on the clear box (log `evidence/2026-11-13/journey-social-life-r195-cacheflags-standalone.log`) |

## Interruption: write flap + VM replacement

A write flap (EPERM, host-side) ran 21:27:38Z–22:15:07Z (~48 min).
During it the adoption could do no git writes: the cache-flags
standalone re-runs failed with EPERM, and a git update-ref probe
failed rc=128. The parent reported the main tree dirty on one file
(`evidence/2026-11-13/culpritbisect-a-steps.log`, flap-zeroed to 0
bytes at 21:56:17Z); my restore attempt EPERM'd the same way, and no
stale `index.lock` was left behind. The VM was replaced at ~22:15Z
(new boot `e6e16cb5`); the flap ended 22:15:07Z and the steps log was
restored (3,777 bytes) before/during the replacement — main tree
verified clean at resume. No adoption work was lost: the gate log,
adjudication, and telemetry results were all on disk in the worktree.

## Rebases (two — master moved twice during the adoption)

1. Onto `6df2519b9` (proofrefresh-b11 + culpritbisect round 13):
   clean, no stop-at-pick quirk. Proofs 17/17 on the new tip.
2. First ff-only merge refused — master had moved to `2de59ab7f`
   (scale-onramp coordinator evidence, evidence-only). Rebased onto
   `2de59ab7f`: clean. Proofs re-run 17/17 on the final tip.

Final branch: `56655e81e` (fix), `7d4267acd` (evidence), `b6683317b`
(adoption closeout). One safe-commit index clobber struck on the
closeout commit (staged-as-deleted + MM on the 3 files); commit
verified correct by `git show --stat` + hash-object == HEAD blob,
repaired with the `ls-tree -r | update-index --add --index-info`
pipe, verified `git status` clean except the untracked partial gate
log and `git diff HEAD` empty.

## Proof re-runs (rebased tips)

17/17 green after each rebase: r172 ×8 (agree, coach,
coachrepeat, confess, confessguard, confesswrap, narr, r172), r179
faceguard, r180 narrsplit + favorreq-exit, r181 proposelabel +
vendetta, r189 recapempty, r195 doorreq + favorreq-cycle +
recapempty-pool.

## Telemetry

Re-ran on the rebased tip: 5 LOUD lines, all the explained l3.*
schema drift (social driver never emits l3.* fields) — baseline NOT
rolled. Matches the run note.

## Merge + closeout

- Merge ff-only `2de59ab7f..b6683317b`, exit 0; HEAD `b6683317b`
  verified + both ancestors verified in separate commands. Main tree
  clean after merge.
- Worktree released as done-merged, removed, branch deleted.
- Rotation-b: 5 → 6 (crisis next).
- Lock `playtest-loop-2.lock` deleted after run_id verification
  (separate calls).
- No orphan hbloop to kill (already dead at adoption).
- Run-note Closeout section filled in the branch; final SHAs
  corrected by this addendum (the run note's first-rebase SHAs went
  stale on the second rebase).

## Carried forward

- Proof refresh round 12 now owes r195's src/js changes too (b11's
  proof is stale on the merged tip for the same structural reason).
- M12 confirmation bar revised for the next run (see run note Metric
  review): max "three times" serves per sitting ≤ 1, 0 sittings
  with 2+, ≥ 1 exit line served.
- Watch items from the run note stand: re-offer furniture-free max
  11; seed 44101's fourteen-bearer succession chain.
