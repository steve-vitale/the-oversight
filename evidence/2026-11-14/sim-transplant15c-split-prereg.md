# H1 transplant — family 15C SPLIT, OVE-52 ALONE (arm sim-transplant15c-split-a)

Run: fleshout-20261114T1355Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant15c-split-a` (worktree
`~/workspace/worktrees/sim-transplant15c-split-a`).

## STATUS OF THIS DOCUMENT — TRUE PRE-REGISTRATION

**This prereg was written and committed BEFORE the subject was cut and
before any judged sim ran.** The merge-tree pre-check below was run
before the live pick, and its prediction is recorded here before the
pick is attempted. Nothing in this document is backdated.

## The question

The group arm (evidence/2026-11-14/sim-transplant15c-narrowed.md) read
**CARRIER 1/8** for OVE-49 + OVE-52 together. OVE-49 (9bc88d85d) is
test-only (green-list + test). The mechanistic suspect is OVE-52's
fighterState wiring — but that must be MEASURED, not assumed. This
arm measures OVE-52 alone on the far end, same band, same STEP
discipline.

## Subject (defined before the pick)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band).
- Pick: origin commit `1c1b23482` ("OVE-52: wire shared fighterState
  into both fight brains"). Single parent: `748cce3b8` (OVE-51).
  Do NOT pick OVE-49 (9bc88d85d).
- Pick stat (`git show 1c1b23482 --stat`): 6 files, +511/−158.
  js=4: `src/js/engine/combat.js` (+26), `src/js/fieldFights.js`
  (+113/−), `src/js/game.js` (+70/−), `src/js/villager-agency.js`
  (+172). Non-game: `docs/ONTOLOGY.md` (2 lines) and the
  fight-brain knowledge-probe test refresh
  (`scripts/test-fight-brain-knowledge-probe.js`, +286/−).
  No policy file, no standing.js change.
- Subject branch: `transplant-15c-split-subject`, built on the far
  end, LEFT in place (hash recorded in evidence), never committed
  to the arm branch. Applied by `git cherry-pick 1c1b23482`.
- `standing.js` NOT in the pick: the subject's native standing.js
  is the far-end one (sha256
  `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
  verified from `git show 203a32775:src/js/standing.js`), so the
  standing-fix swap mechanics are exactly as in the bisect prereg
  (fix `f8fda4295a99`; native restored byte-identical afterwards).
- Subject's policy is the far-end competent.js (the pick touches
  no policy file); own-policy per step, same as the bisect.
  Policy sha `a7ff5c516440`.

## Merge-tree pre-check (run BEFORE the live pick, prediction recorded)

Command: `git merge-tree --write-tree --merge-base=748cce3b8
203a32775 1c1b23482` (base = the pick's first parent, ours = far
end, theirs = the pick — the same three-way merge a cherry-pick
performs). Run 2026-11-14 ~13:58Z, exit 1. Output:

```
4a315a997194d3fb45d0e79aa7c52d1e7e42e53b
100644 602c7a7d32315442ecc1565cc912b7750698bb5b 1  scripts/test-fight-brain-knowledge-probe.js
100644 453520db00be7d254d2e8240ba41bd02d03fd8c2 3  scripts/test-fight-brain-knowledge-probe.js

Auto-merging docs/ONTOLOGY.md
CONFLICT (modify/delete): scripts/test-fight-brain-knowledge-probe.js deleted in 203a32775 and modified in 1c1b23482.  Version 1c1b23482 of scripts/test-fight-brain-knowledge-probe.js left in tree.
Auto-merging src/js/fieldFights.js
Auto-merging src/js/game.js
Auto-merging src/js/villager-agency.js
```

**Prediction: the live pick CONFLICTS on exactly one file —
`scripts/test-fight-brain-knowledge-probe.js`, modify/delete —
and auto-merges everything else** (docs/ONTOLOGY.md and all four
src/js files clean; src/js/engine/combat.js is not even listed,
i.e. it applies without a merge hunk note).

Why the conflict exists (verified, not assumed):

- The probe test file was CREATED on the origin line by OVE-49
  (9bc88d85d, +352 lines; `git log --diff-filter=A
  --first-parent d229b58f5..a628aeaf3` names only that commit).
  It never existed on the master line: ABSENT at the merge-base
  d229b58f5, ABSENT at OVE-49's parent, ABSENT at the far end
  203a32775.
- OVE-49 is an ancestor of OVE-52's parent 748cce3b8, so at the
  pick base the file exists — and OVE-52 modifies it (+286/−).
- Cherry-picking OVE-52 alone onto the far end therefore asks
  the merge to modify a file the far-end side never had:
  modify/delete, structurally, not a content disagreement.

**Classification under the coordinator's tooling-resolution
rule (2026-11-14 ~10:00Z):** the conflicted file is a TEST file.
The rule resolves ONLY zero-src-reader tooling files
(scripts/green-list.txt, scripts/balance-proof.json,
scripts/phone-frame-proof.json) with `git checkout --ours` +
`git add`; ANY other conflicted file (any src/js, data, policy,
docs, or test file) STOPS the arm immediately — abort the
cherry-pick, report the exact conflict list, no hand-resolution,
no narrowed re-run decided by this arm. A test-file conflict is
in the STOP class. **Predicted outcome of the live pick: STOP.**

The live pick is still attempted after this prereg is committed
— the pre-check is a prediction, the pick is the measurement, and
if they disagreed the pick would govern. If the pick confirms the
predicted conflict, the arm STOPS there: the cherry-pick is
aborted, no subject is cut, no STEP runs, no verdict is measured.
The coordinator decides the narrowed route (e.g. pick OVE-52's
js hunks only, dropping the test refresh — that decision is the
coordinator's, not this arm's).

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with
  the roster-check standing fix swapped in for every step exactly
  as the bisect prereg specifies (fix `f8fda4295a99`; native
  restored byte-identical afterwards, sha-verified). Base is the
  far end, never current master.
- Seeds: the same 8, 190391–190398 (190391, 190392, 190393, 190394,
  190395, 190396, 190397, 190398). Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step. Driver
  mechanics reused (`scripts/culpritbisect-driver-20261113.js` +
  `scripts/culpritbisect-step.sh` as in the prior arms);
  STEP id `t15c-split`.
- Primary metric: survived/8 on the band. Verdict thresholds
  (binding, round-2115 §3):
  - ≤1/8 CARRIER — OVE-52 alone collapses the far end to the
    merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect
    rule); 2/8 again → recorded AMBIGUOUS, treated as
    NOT-CARRIER for ordering but kept on the suspect list.
  - ≥3/8 NOT-CARRIER — OVE-52 alone does not collapse (far end
    is 4/8, so 3/8 is within a step of it).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution, rank read (regional
  ≥5/8 REGIONAL_INTACT; ≤2/8 RANK_STALL; 3–4/8
  RANK_INCONCLUSIVE, per the bisect prereg). No cost guard —
  measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check
  REFUSES these corpora; record the refusal, never roll the
  baseline.
- Proof: `scripts/test-transplant15c-split.js` (stage 1 with
  prereg; stage 2 after picks/step: subject identity, pick tree
  equality, verdict, evidence records). Re-run
  `scripts/test-culpritbisect-a.js` (116 legs) after the step.
- Fix policy (bisect prereg §Fix policy): no game-code change
  lands from this measurement arm unless the fix is a defect,
  small, carries its own proof, and restores ≥3/8 on the same
  band — otherwise document only.

## Seed-band freshness note

Band 190391–190398 is the program-mandated matched band per 2115
§3, reused by design across transplant arms for comparability
against the far end; no new band is assigned. This is not a
freshness violation: a transplant step re-runs the same seeds on
different code, so the survival count is comparable seed-for-seed.

## Fixture note (proof-of-effect)

This is a diagnostic transplant step, not an encounter-beatability
verdict: no staged encounter fixture applies. The instrument is
the competent-policy sim itself — 8 matched seeds, 150d
death-aware — and the verdict turns on village survival across
the band, not on whether a staged fight is winnable. No gear/party
fixture was staged and none is claimed.

## Secondary check (from the 15C group arm)

The Blooded beat fires in transcripts yet end-state `blooded`
reads false on all 8 seeds in the group corpus. This arm checks
beat-vs-end-state on its own corpus and reports what it finds;
it does not touch the survival verdict.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md (wave law,
the fight-brain content this family touches: fighterState feeds
TB hopeless/reactive flee and field morale; knows-vs-naive flips
field opening intent and TB hopeless flee — OVE-52's own commit
message). No canon doc covers survival-collapse attribution;
nothing here invents canon.

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change landing, no before/after
pair to compare on one base. The before/after comparison IS the
far end (4/8) vs this subject on identical seeds, judged by the
binding thresholds. Same standing as masterregress §7 and the
bisect §7.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the step: did the metric set hold, or does a
  metric need revision for the NEXT run? If the arm stops on the
  pick conflict, record here that no metric was exercised.)
