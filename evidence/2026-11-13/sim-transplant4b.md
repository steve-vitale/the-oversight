# H1 transplant — narrowed family 4b: forager-deed merge c0a85b17e, [VERDICT TBD — stage 1 prereg]

Run: fleshout-20261114T0215Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, narrowed family 4b (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 + narrowed-tooling rule, coordinator decision in evidence/2026-11-13/sim-transplant-round-0015.md §Method decision).
Arm branch: `sim-transplant4b-a` (worktree `~/workspace/worktrees/sim-transplant4b-a`, base master 62c19318e).
Prereg written and committed BEFORE any judged sim (stage-1 commit below).

## The question

Narrowed 4b is a NEW family definition under the narrowed-tooling rule,
never a re-judgment of family 4. Family 4 (arm sim-transplant4-a,
evidence/2026-11-13/sim-transplant4.md) was UNMEASURED: its
cherry-pick conflicted on exactly three files, all in `scripts/`
tooling, while all three `src/js` files applied cleanly. The
narrowed-tooling rule (decided 0015Z, now the standard route) authorizes
re-running a family whose conflicts are confined ENTIRELY to files with
zero readers in `src/` — with green-list by union, balance-proof.json by
the far-end pointer, and validator/tooling files by the side that matches
the transplanted code, justified in the prereg. This arm measures the
narrowed family only.

## Family identity (verified at run start, before any sim — re-verified, not taken on claim)

- Merge `c0a85b17e` "Merge origin/master into forager deed branch".
- First parent `c15b8c56c` "Living Garden: lived harvest deed gates
  Forager ascension"; second parent `fbb9c53ed` "Merge pull request #4
  from steve-vitale/cursor/person-trust-map-41aa".
- Second-parent side is 4 commits: `fbb9c53ed` (PR #4 person-trust-map
  merge) + `a76333124` (PR #3 brawler-ascension-deed merge) +
  `458811411` "Write per-villager trust map from lived events" +
  `447085506` "Add lived Brawler ascension deed (outmatched_kill)".
  Two sub-families: person-trust side (PR #4 + 458811411) and
  forager/brawler-deed side (PR #3 + 447085506). Same merge, same
  content as family 4 — the family is unchanged; only the conflict
  handling is narrowed.
- `git diff --stat c0a85b17e^1 c0a85b17e`: 19 files, +875/−10.
  `src/js`: exactly 3 files, +264/−6 — person-trust.js +233/−0 (NEW
  file, whole module), godpath.js +24/−0 (recordOutmatchedKill +
  callers), bond-initiation.js +7/−6 (comment-only rewording of the
  trustedAnyone paragraph). No scripts/policies file (pol=0). Table
  reading (js=3, pol=0) CONFIRMED — matches round-2115 §3, the family-4
  arm, and this arm's brief exactly.
- Content (from the diff, not assumed): person-trust.js is a new
  per-villager trust-map module — `bumpPersonTrust` /
  `personTrustOf` / `personTrustCensus`, written only from lived
  events, never a roster seed; godpath.js adds the lived Brawler deed
  `outmatched_kill` (solo kill of a foe that opened with more HP than
  your whole bar, after taking a real wound; helpers void it) wired
  into tactical + field finish paths, plus the `one_person_army` deed
  entry in src/data/godpaths.json (+6); bond-initiation.js only rewords
  a comment. `standing.js` NOT in the family diff: the subject's native
  standing.js is the far-end one (sha256 `75762cb2…`), so the
  standing-fix swap mechanics are exactly as in the bisect prereg.
- Far-end substrate (checked by `ls-tree` before cutting the step):
  `src/js/bond-initiation.js` present at the far end (blob
  d131970a2 — identical to the family's base blob, so it merges
  cleanly), `src/js/godpath.js` present, `src/js/person-trust.js`
  ABSENT (new file, clean add — zero DU entries for src/js files).
- Subject's policy is the far-end competent.js (family touches no
  policy file); own-policy per step, same as the bisect.

## NARROWED 4b DEFINITION (authorized under the narrowed-tooling rule)

- `scripts/balance-proof.json`: OURS (far end) pointer —
  `evidence/2026-11-10/neutral-r167-adopt.json.gz`,
  `ff87680261d3e717228bbaac1c2551269fb711464364d1cce49e3ccc0fa9975f`.
  Justification: the bisect/transplant driver and analyzer never read
  it (`grep balance-proof` over
  scripts/culpritbisect-driver-20261113.js and
  scripts/culpritbisect-analyze-20261113.js: no match), and zero
  `src/` files reference it — it is a measurement-proof pointer, not
  game code, and the measured family diff is byte-identical either way.
- `scripts/godpath/validate.js`: THEIRS. Justification by grep BEFORE
  resolving (recorded here, verified in scripts/test-transplant4b.js §3):
  - The merge's godpath.js references BOTH events theirs adds:
    `outmatched_kill` (recordOutmatchedKill, lines 286–289) and
    `harvest_fed` (feed-ledger paths, lines 550–633).
  - The TRANSPLANTED godpath.js (far end + family diff) references
    `outmatched_kill` only. The family diff's +24 lines are
    recordOutmatchedKill + its two callers; `harvest_fed` enters the
    merge via the FIRST PARENT (Living Garden), not the family diff:
    first-parent godpath.js contains `harvest_fed` ×5 and
    `outmatched_kill` ×0, while the far-end godpath.js contains
    NEITHER event anywhere in `src/js` (`git grep -l
    'harvest_fed|outmatched_kill' 203a32775 -- src/js`: no match).
  - THEIRS is the side that matches the transplanted code: the subject
    EMITS `outmatched_kill` (`Game.tele('godpath_deed', ... event:
    'outmatched_kill' ...)` in the transplanted recordOutmatchedKill),
    and the OURS validator's 8-event list does NOT contain it — ours
    would reject the subject's own deed emission. Theirs accepts all
    8 ours events PLUS both added events (strict superset), so it
    cannot reject anything ours accepts; its `harvest_fed` acceptance
    and `okDays` check are vacuous in the subject (never emitted, never
    validated). The validator never runs in the sim driver (it runs via
    scripts/check.js), so the choice cannot move the survival number —
    the measured family diff (src/js + policies) is byte-identical
    either way.
  - This is a grep-verified justification, not a guess: the choice is
    justified on the event the family itself adds (`outmatched_kill`),
    and the `harvest_fed` half is explained (first-parent content,
    outside the family diff) rather than assumed. The brief's STOP
    clause guards against picking a side on an unjustified guess; the
    side is justified here, with both readings of "transplanted
    godpath.js" (merge's file: both events; subject's file:
    outmatched_kill only) recorded above so the coordinator can judge.
- `scripts/green-list.txt`: UNION (both sides' added lines, no
  deletions) — ours `scripts/test-pellet-boost-20261108.js quick` +
  `scripts/test-pellet-q4-20261108.js quick` AND theirs
  `scripts/test-person-trust-20261108.js quick`, per the 2b precedent.
  Justification: read only by scripts/check.js (line 59, `readList`),
  zero `src/` readers.
- STOP clause: if ANY conflict appears outside those three files, or
  any src/js conflict/DU appears in the live pick, STOP — write a
  conflict-STOP record (same shape as the family-4 arm), commit it,
  and report UNMEASURED. Do not hand-resolve game code.
- After resolving, VERIFY the narrowed resolutions leave the measured
  family diff byte-identical: diff the subject vs far end for src/js +
  policy files and compare against the family diff; record the
  verification in the evidence (stage-2 legs in
  scripts/test-transplant4b.js §7).

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-step.sh` + `scripts/culpritbisect-driver-20261113.js`
  + analyzer, same as the bisect steps); STEP id `t4b-c0a85b17e`.
- Subject: the transplant commit = far end + narrowed family diff,
  built on scratch branch `transplant-4b-subject` in this worktree and
  LEFT in place (branch kept, hash recorded below). Never committed to
  the arm branch. Apply via `git cherry-pick -m 1 c0a85b17e`, resolving
  the three tooling conflicts per the narrowed definition above.
- Primary metric: survived/8 on the band. Verdict thresholds:
  - ≤1/8 CARRIER — the narrowed family alone collapses the far end to
    the merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list. (A 2/8 re-run on a
    deterministic driver is a stability check, not fresh evidence.)
  - ≥3/8 NOT-CARRIER — narrowed family alone does not collapse (far
    end is 4/8, so 3/8 is within a step of it).
  - Conflict-STOP (any conflict outside the three narrowed files, or
    any src/js conflict/DU) → UNMEASURED — no survival number, no
    subject, no sim.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution. No cost guard —
  measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Proof: `scripts/test-transplant4b.js` (family identity, merge-tree
  pre-check prediction, narrowed-resolution grep justifications,
  subject + byte-identical diff legs, step summary, base restored)
  plus re-run the reused `scripts/test-culpritbisect-a.js` (116 legs).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree c15b8c56c 203a32775 c0a85b17e` (base = first parent,
per the 2215Z method correction — `cherry-pick -m 1` uses the first
parent as its base) predicts EXACTLY THREE content-conflicted files,
3 markers each (transplant118 counting method: `+<<<<<<<`,
`+=======`, `+>>>>>>>`), identical to the family-4 arm's prediction
and to its live pick:

1. `scripts/balance-proof.json` — panel-pointer conflict (one hunk):
   ours (far end): `"panel": "evidence/2026-11-10/neutral-r167-adopt.json.gz"`,
   `"panelDigest": "ff87680261d3e717228bbaac1c2551269fb711464364d1cce49e3ccc0fa9975f"`;
   theirs (family): `"panel": "evidence/2026-11-08/neutral-person-trust.json.gz"`,
   `"panelDigest": "b90b3411685bafd74504a2885cf41dadaaf906fec83413219078a8cf8ff3c44c"`.
   Narrowed resolution: OURS.
2. `scripts/godpath/validate.js` — deed-event validation list (one hunk):
   ours: single-line `T.ok` over the 8-event list
   `[relay_office, market_exchange, field_truth_shared, care_survived,
   outmatched_escape, ward_rescue, apex_hunt, death_refused]`;
   theirs: `okEvent` over the same list PLUS `harvest_fed` and
   `outmatched_kill`, plus an `okDays` check. Narrowed resolution:
   THEIRS (justified above).
3. `scripts/green-list.txt` — test-list append conflict (one hunk,
   `@@ -913,5 +913,9 @@`): ours: `test-pellet-boost-20261108.js
   quick` + `test-pellet-q4-20261108.js quick`; theirs:
   `test-person-trust-20261108.js quick` (one line). Narrowed
   resolution: UNION (all three lines).

The other four 'changed in both' files merge cleanly with ZERO
markers: `docs/ONTOLOGY.md`, `src/data/godpaths.json`,
`src/js/godpath.js`, `sw.js`. The four 'merged' sections merge cleanly
at 0 markers: `index.html`, `scripts/godpath/ladder.js`,
`scripts/proof-godhood-rework-20261013.js`,
`src/js/bond-initiation.js` (our blob d131970a2 == the family's base
blob: the far end did not touch the file). The eight 'added in remote'
files add cleanly at 0 markers, including `src/js/person-trust.js`
(new file — no DU, no substrate wall).

## Conflicted-file readers (verified by grep before the pick — prereg record)

- `scripts/green-list.txt`: read by `scripts/check.js` via `readList`
  (line 59) — the only code reader; it is the check runner, not game
  code. ZERO references under `src/` (`git grep -l 'green-list' HEAD
  -- src/`: no match).
- `scripts/balance-proof.json`: read only by measurement-proof test
  scripts under `scripts/` (balance-proof-update.js,
  test-measurement-*.js, test-proofrefresh-b*.js) — never by `src/`
  (`git grep -l 'balance-proof.json' HEAD -- src/`: no match). The
  bisect/transplant driver and analyzer never mention it (grep over
  both files: no match).
- `scripts/godpath/validate.js`: referenced by `scripts/check.js`
  (green-list runner) and itself only — never by `src/` (`git grep -l
  'godpath/validate' HEAD -- src/`: no match). It is validation
  tooling; the sim driver never invokes it.

None of the three conflicted files is `src/js` game code, and all
three have zero readers in `src/` — the narrowed-tooling rule's
precondition is met exactly.

## Canon

docs/CANON.md read first. No standalone canon doc covers person-trust
(the family's own docs/ONTOLOGY.md addition is the design record for
the module: lived-only writers, directional map, unset reads as 0,
no RNG, no gate changes); godpath deeds are covered by the godpath
docs and the forager/brawler deed design lives in the family's
evidence/2026-11-08/brawler-deed-audit.md. Nothing here invents canon
— this arm changes no game code on the arm branch (the subject is a
measurement-only commit on its scratch branch).

## Results (filled after the cherry-pick + sim)

**VERDICT: [TBD — stage 2]**

[Stage 2 fills: subject branch + hash, live pick record, resolutions
applied, byte-identical diff verification, step summary numbers,
wall numbers, sense-testing, metric review, telemetry refusal note.]

## Metric review (§14)

[Stage 2.]

## Wall numbers

[Stage 2. This run's judged corpus: TBD. Reference: far end
203a32775 4/8 (median 150d, wave-5 2/8), merge e4dbe581b 1/8, on the
same seeds 190391–190398, 150d, competent verbatim own-policy, fix
swapped in. Bisect s05 (this merge, cumulative) 1/8, median 125d,
wave-5 0/8.]

## Proof results

[Stage 2.]
