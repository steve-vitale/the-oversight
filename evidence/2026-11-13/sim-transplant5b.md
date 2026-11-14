# H1 transplant — narrowed family 5b: PR #120 garden-measurement-0315, FIRST POLICY family (arm sim-transplant5b-a)

Run: fleshout-20261114T0215Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, narrowed family 5b (coordinator decision,
evidence/2026-11-13/sim-transplant-round-0015.md §Method decision).
Arm branch: `sim-transplant5b-a` (worktree `~/workspace/worktrees/sim-transplant5b-a`,
base master 62c19318e).
Prereg: evidence/2026-11-13/sim-transplant5b-prereg.md — written and
committed BEFORE cutting the subject or running any judged sim
(commit 13f9605a4, proof 60/60 at prereg stage).
Canon: docs/CANON.md read first; docs/GARDENS.md read. This arm
measures a POLICY family; no game code is touched by the family
itself (js=0), so no canon invention is involved.

## The question

Narrowed family 5b is a NEW family definition, never a re-judgment
of family 5 (which read UNMEASURED on a cherry-pick conflict
confined to `scripts/balance-proof.json`). Does the garden-keeper
appointment reorder alone — appoint the standing caretaker BEFORE
making beds, while residents are still at Haven — collapse the far
end (GOOD 4/8) toward the merge's 1/8?

## Family identity (verified by THIS arm at run start, before any sim)

- Merge `abb3c2db2` "Merge pull request #120 from
  steve-vitale/cursor/ove-160-garden-measurement-0315". First parent
  `da153118c` (PR #119 merge, phone-refresh); second parent
  `91cb6fa20` ("OVE-160: restore garden caretaker appointment;
  refresh measurement proofs"). Second-parent side is 1 commit.
- `git diff --stat abb3c2db2^1 abb3c2db2`: 6 files, +35/−12.
  `src/js`: 0 files — js=0. `scripts/policies`: 3 files — pol=3.
  Table reading (js=0, pol=3) CONFIRMED by this arm — matches
  round-2115 §3, the family-5 arm, and the brief.
- Policy diff (read from the diff, not assumed): in each of the
  three files (`scripts/policies/competent.js`,
  `scripts/policies/competent-nofallback.js`,
  `scripts/policies/competent-nofallback-socialD.js`) the SAME
  11-line change inside `workGarden` (+8/−3 per file): the
  garden-keeper appointment block moves BEFORE the `makePlot` loop.
  The moved block is byte-identical in all three files, including
  the 4-line comment ("Appoint while residents are still at Haven.
  makePlot ticks move the rest of the roster off-tile;
  gardenKeeperReady then empties and the standing caretaker is never
  reserved. DUTY already honors an appointed gardenKeeper, so
  appointing first keeps them present through bed prep.").
- Other family files: the OVE-160 panel corpus (.gz, added, 103,076
  bytes); `scripts/balance-proof.json` (+2/−2, panel + panelDigest
  re-pointed OVE-84 → OVE-160); `scripts/godpath/occupation-fixtures.json`
  (+9/−1, seeds refreshed for OVE-160).
- `standing.js` NOT in the family diff: the subject's native
  standing.js is the far-end one (sha256 `75762cb2…`), so the
  standing-fix swap mechanics are exactly as in the bisect prereg.
- Far-end policy sha `a7ff5c516440`; merge policy sha `26a87e493578`;
  first-parent policy == far-end policy (no far-end policy drift).
  Nofallback shas: far `6919e8d36a9b` → merge `a27d7396f09a`;
  socialD far `01d931a76205` → merge `2ad0f2bce389`.

## Narrowed 5b definition (authorized by the coordinator)

NARROWED-TOOLING RULE (0015Z run, now the standard route):
conflicts confined ENTIRELY to files with zero readers in src/ may
be re-run as a narrowed family; scripts/balance-proof.json by
taking the far-end (ours) pointer — the driver never reads it and
the measured family diff is byte-identical either way.

NARROWED 5b DEFINITION: balance-proof.json ours (far-end pointer:
panel `evidence/2026-11-10/neutral-r167-adopt.json.gz`). Nothing
else resolved by hand. Any conflict outside balance-proof.json, or
any src/js conflict/DU, would have STOPPED the run as UNMEASURED —
none appeared.

Grep justification (re-verified by THIS arm, `git grep -l
balance-proof` on the HEAD tree): the file is named only by
measurement/proof tooling — `scripts/balance-proof-update.js`,
`scripts/godpath/test-measurement-*.js`,
`scripts/godpath/test-panel-contract-rulings.js`,
`scripts/test-proofrefresh-*.js`, `scripts/test-gateclassify-parse-20261112.js`,
evidence JSONs, and the transplant proof tests. ZERO readers in
`src/` (`git grep -l balance-proof -- src/` returns nothing). The
driver never reads it.

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree da153118c 203a32775 abb3c2db2` (base = first parent)
predicted EXACTLY ONE content-conflicted file —
`scripts/balance-proof.json`, 3 markers — and the other family
files merging cleanly (4 merged sections: occupation-fixtures +
3 policy files, results == theirs; .gz corpus added in remote; no
DU, no src/js section). The live pick reproduced the prediction
exactly (see §Cherry-pick below) — the fourth consecutive exact
prediction in this program (families 2, 2b, 5, 5b).

## Policy-mechanics check (re-verified by THIS arm from driver source)

CONFIRMED by reading the driver source (same as the family-5 arm;
re-checked in this tree, legs in scripts/test-transplant5b.js):
the driver loads `competent.js` REPO-relative from the checked-out
tree; the step script restores only the 4 tooling scratch files
from master (no policy file); the leg guard is record-only for
policy (`policySha: null`, sha recorded per seed). The on-subject
half is now RUN, not void: every per-seed JSON records
`policySha: 26a87e493578` — the SUBJECT's policy sha, matching the
merge policy sha — and the step log records "own policy sha
26a87e493578". The driver loaded the subject's reordered policy.
The two nofallback variants ride along as part of the family even
though the driver loads only `competent.js` — recorded explicitly;
they were NOT measured and no claim is made about them.

## Cherry-pick (live)

- Subject branch `transplant-5b-subject` cut at the far end
  `203a32775`; `git cherry-pick -m 1 abb3c2db2` conflicted in
  exactly ONE file, as predicted: UU `scripts/balance-proof.json`
  (one hunk, lines 4–5, the panel/panelDigest pair). The other 5
  family files staged cleanly (3 policy files, .gz corpus,
  occupation-fixtures.json). No src/js conflict, no DU.
- Resolution per the narrowed definition: `git checkout --ours --
  scripts/balance-proof.json` (far-end r167-adopt pointer),
  `git add`, `git cherry-pick --continue`. Subject commit:
  **`c3e2970e85d51d117c94cf97bd0d14933c2b650f`** (on top of the far
  end; branch LEFT in place).
- Verification (recorded, legs in scripts/test-transplant5b.js):
  - `git diff 203a32775 c3e2970e8 -- scripts/policies/` is
    BYTE-IDENTICAL (`cmp` clean) to the family diff
    `git diff abb3c2db2^1 abb3c2db2 -- scripts/policies/`.
  - Subject `competent.js` sha256 == merge policy sha
    `26a87e493578`.
  - Subject `balance-proof.json` blob == far-end blob
    (`d0c6a42ff2395a49672f235f0218a3f969619dee`), panel =
    `evidence/2026-11-10/neutral-r167-adopt.json.gz` (ours).
  - Subject occupation-fixtures blob == merge blob
    (`78031deb0ce23c6e17566c63dc602c528f742dcb`); subject .gz corpus
    blob == merge blob (`29fcf4921488e42fa159ff80a5968ea8a0940bba`).
  - Subject standing.js blob == far-end native blob.
  - Subject diff stat vs far end: 5 files, +33/−10 (family +35/−12
    minus the +2/−2 balance-proof pointer, exactly as expected).

## Step result — STEP t5b-abb3c2db2

Driver + analyzer via `scripts/culpritbisect-step.sh` run from a
/tmp copy with REPO passed in (the script is absent at the far end;
the first attempt failed because the copy was taken from the
subject checkout itself — recovered by copying from the arm branch
`sim-transplant5b-a` via `git show`). Step log:
`step t5b-abb3c2db2: HEAD c3e2970e85d5`, native standing sha
`75762cb2259d`, fix swapped in (`f8fda4295a99`), own policy sha
`26a87e493578`, classification **GOOD (survived 4/8, rank
REGIONAL_INTACT, median 150d, errors 0)**.

Per-seed (subject; far-end endpoint days from the bisect summary
in parentheses):

| seed | days | end | wave | standing | deaths |
|------|------|-----|------|----------|--------|
| 190391 | 86 (86) | village-lost | 4 | 199 | 88 |
| 190392 | 150 (144) | survived | 4 | 199 | 53 |
| 190393 | 150 (150) | survived | 5 | 525 | 94 |
| 190394 | 43 (43) | village-lost | 4 | 150 | 52 |
| 190395 | 150 (150) | survived | 4 | 199 | 96 |
| 190396 | 82 (87) | village-lost | 4 | 170 | 88 |
| 190397 | 123 (150) | village-lost | 5 | 200 | 80 |
| 190398 | 150 (150) | survived | 4 | 199 | 96 |

**VERDICT: NOT-CARRIER.** Survived 4/8 — exactly the far end's
4/8. The garden-keeper appointment reorder alone does not collapse
the far end toward the merge's 1/8.

Diagnostic (secondary, not a re-score): the count is identical but
the seeds are not — three seeds moved against the far-end
endpoint: 190392 went 144d lost → 150d survived, 190396 went 87d →
82d lost, 190397 went 150d survived → 123d lost. The reorder is
NOT inert per-seed (it shuffles individual fates both ways); it
just nets to zero on the band. That churn is consistent with a
policy change that touches daily garden work without touching the
collapse mechanism.

## Wall numbers

This run's judged corpus: STEP t5b-abb3c2db2 on subject
c3e2970e8, seeds 190391–190398, 150d, competent verbatim
own-policy, fix swapped in.

- survived **4/8** (far end 4/8, merge 1/8)
- wave-5 unlocks **2/8** (190393 survived, 190397 lost at 123d);
  wave-4 **8/8**
- wins **0**, national **0**, table **0**; regional 7/8, village 1/8
- median 150d (analyzer wall.medianDays; raw days
  43/82/86/123/150/150/150/150)
- deaths 647 total; standing range 150–525 (190393 at 525, all
  others ≤200); blooded 2/8 (190391, 190398); end pantry kcal 0
  on 6/8 seeds (190392: 3134, 190393: 2938)
- tribute: all 8 seeds military_tribute, ready false,
  veterans 0/2, reason `veterans-short` on every seed — the
  veteran bar is still the binding constraint (wave-4 veteran
  count 0 on all 8; wave-3 veterans 2 on the best seed, 190393)
- death-cause shares (647): villager combat 254 (39%), expedition
  154 (24%), combat 123 (19%), the wild 81 (13%), monster 13,
  arena 5, wound that wouldn't close 3, ambush 3, starvation 2,
  Spool 2, a stranger 2, contest 2, lockjaw 1, the night 1, alien 1
- instrument errors 0

## What this means for the H1 transplant program

Family 5b is the FIRST transplant family to be MEASURED after four
consecutive unmeasured attempts (families 1, 2, 3, 4, 5, 6 — with
2b measured only via the narrowed union as AMBIGUOUS 2/8 twice).
The narrowed-tooling rule works as designed: a two-line
proof-pointer conflict with zero game readers resolved ours, the
measured policy diff verified byte-identical, and the step ran
clean. The garden-keeper reorder is EXONERATED as a carrier — it
does not explain the collapse. The collapse still has no
identified carrier: families 2b (AMBIGUOUS, partial) and 5b
(NOT-CARRIER) are the only measured families so far. Next in
table order: family 7 (23245d5d6 dawn honesty, js=2), then 8–16.

## Sense-testing (SENSE-TESTING LAW)

Read the seed-190393 corpus (the wave-5 survivor, standing 525,
the strongest village on the band) — vetSays, deaths, daily
snapshots:

- The show narration hangs together: door defenses name the same
  fighters repeatedly (Farid, Aroha, Tikhon, Sreyashi, Hayden),
  hurt lists track the fighters, SYSTEM calls out veteran kills on
  camera ("Farid just put down The Terms of Service... on CAMERA.
  That's a veteran kill, folks. REMEMBER the name."), Arc IV
  announces at day 56, and the village goes Blooded (days 131,
  141, 142 — the same Blooded line three times; a milestone
  re-announcement, slightly repetitive but coherent).
- Scholar succession is visible in the daily snapshots (Marco
  Ocampo → Jesse Cortez → Aroha Ngata); wave kills come via wild,
  contest, and agency routes; 24 distinct roster names appear.
  Nothing robotic in the sampled transcript.
- LIMITATION (recorded honestly): the bisect corpus does NOT
  instrument the garden-caretaker mechanism. `gardenKeeper` and
  `caretaker` appear 0 times in all 8 per-seed files; "garden"
  appears only 4 times total, all as `"occ": "gardener"` (a
  villager's occupation) in seeds 190393 and 190397. Whether the
  standing caretaker was actually reserved on any day is
  unobservable in this corpus — the verdict rests on the survival
  count alone, and the mechanism (appoint-first keeps the caretaker
  present) is neither confirmed nor refuted by these runs. A future
  garden-focused arm would need a garden-work instrument to see it.

## Metric review (§14)

The primary metric (survived/8) was measured and judged against
the prereg thresholds with no re-score: 4/8 → NOT-CARRIER. No
re-run leg triggered (4/8 is not 2/8). The per-seed churn vs the
far-end endpoint (3 seeds moved, net zero) is a diagnostic
observation, not a metric revision — the metric is the count, and
the count is unambiguous. The analyzer's medianDays (150) is
reported as the step's median; raw per-seed days are listed above
for anyone recomputing. No threshold change proposed.

## Telemetry

Deviation check REFUSED as expected for this corpus class:
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-13/perseed-culpritbisect-a-t5b-abb3c2db2/*.json'
--metrics national,table,wins,exiled` → "telemetry-check: refusing
recorder-corpus input: all 8 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run
baseline here." Baseline NOT rolled. No LOUD lines (refusal, not a
deviation).

## Proof results

- `node scripts/test-transplant5b.js`: **89 passed, 0 failed** (family
  identity, narrowed-tooling grep justification, merge-tree pre-check
  with BOTH changed-in-both and merged sections tracked,
  policy-mechanics re-verification, narrowed subject state incl.
  byte-identical policy diff, step corpus with per-seed subject
  policySha, verdict mapping, base restored).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).
- Host write flap: no EPERM failure struck this arm's git or file
  writes directly. Safe-commit index clobber struck the prereg
  commit (13f9605a4): both files showed staged-as-deleted after a
  correct commit; repaired with the documented `git ls-tree -r
  HEAD | git update-index --add --index-info` pipe and verified
  (status empty, diff HEAD empty, hash-object matches ls-tree).
- Closeout: arm branch `sim-transplant5b-a` tip (this commit);
  subject branch `transplant-5b-subject` LEFT at
  `c3e2970e85d51d117c94cf97bd0d14933c2b650f`; worktree verified clean
  at closeout (tracked tree empty, standing.js == HEAD, no swap
  residue — the step script restored the subject's native
  standing.js byte-identical, sha-verified, before exiting).

## Canon

docs/GARDENS.md covers the garden area and was read. It documents
the standing-caretaker duty, the four-bed policy target, and the
garden controller's harvest/store/eat loop. No canon doc was
invented or rewritten. The family's reorder (appoint before
makePlot) is a policy ordering change inside `scripts/policies/*`;
it touches no canon rule and no game code.
