# Culprit bisect — inside-the-merge survival drop (arm sim-culpritbisect-a)

Run fleshout-20261113T1615Z, Loop A, axis scale-onramp.
Written and committed BEFORE any judged sim. Base: branch
`sim-culpritbisect-a`, rebased onto master `48ed1ffd7` at run
start (clean fast-forward; HEAD was already an ancestor of
master, 0 unique commits). Instrument-only arm unless the
conditional fix in §Fix policy triggers — ZERO `src/js` changes
committed otherwise.

## The question

The masterregress arm (evidence/2026-11-13/sim-masterregress-a.md)
reproduced the split at the boundary with ONE driver: far end
`203a32775` survives 4/8, merge `e4dbe581b` survives 1/8, near
end `f7352f946` survives 1/8, merge + far-end policy survives 1/8
— CULPRIT_MERGE, POLICY_EXONERATED_AT_MERGE. The drop lives
inside the merge. This arm bisects the merge to isolate the
commit(s) where survival drops from ≥3/8 to ≤1/8.

## Range correction (verified at run start, before any sim)

The task brief says "the 205 local commits between 203a32775
and e4dbe581b". That count is WRONG for this range, and the
correction matters — it is recorded here, not silently fixed:

- `git rev-list --count 203a32775..e4dbe581b` = **157**
  (156 origin-side commits + the merge itself).
- `git rev-list --count --first-parent 203a32775..e4dbe581b` = **1**
  (the merge itself — its first parent IS the far end).
- The "205" is `git rev-list --count 203a32775..5157782a4` =
  **205** — the H2 local line (far end → healthy pole
  `5157782a4`, 6/8). Its endpoints are BOTH healthy (4/8 and
  6/8), so no drop-bisect can run on it: there is no bad
  endpoint to bisect toward. The H2 range is NOT bisected by
  this arm; the well-defined bisect is good=`203a32775`,
  bad=`e4dbe581b` over the 157-commit range. If the coordinator
  meant the H2 range, this arm's DIAG outcome (see §Verdicts)
  says which of H1/H2 the evidence supports, and the H2
  transplant program is the follow-up.

Range shape (all verified at run start):

- Merge-base of the two parents:
  `d229b58f5` — ancestor of the far end; settled collapsed
  (mergebase-a: 1/8).
- Origin range `d229b58f5..a628aeaf3` = 156 commits, 33 of them
  merges (Cursor PRs #118–#121 and friends) — a DAG, not a
  line. `git bisect` handles it; a first-bad commit may be a
  PR merge, in which case the arm reports the PR and its
  contents.
- Origin endpoints are BOTH collapsed (merge-base 1/8, origin
  tip `a628aeaf3` 2/8) — so the bisect may converge to the
  merge-base edge with no good→bad transition inside the
  origin line. That is a pre-registered DIAG outcome, not a
  failure of the bisect (see §Verdicts).
- `standing.js` is UNCHANGED across the whole origin range
  (`git log d229b58f5..a628aeaf3 -- src/js/standing.js` = empty):
  sha `98c8bfad…` everywhere, no ROSTER CHECK marker.
- `scripts/policies/competent.js` changes ONCE on the origin
  range: `91cb6fa20` (OVE-160 garden caretaker restore). Early
  origin commits carry the far-end policy (`a7ff5c51…`), later
  ones the merge policy (`26a87e49…`). Own-policy per step;
  the garden hunk is already exonerated at the merge by
  mergeps, so a policy flip mid-range is not expected to move
  survival — policy sha is recorded per step either way.

## Substrate — what the bisect steps run on (verified, not assumed)

- **Harness.** `scripts/sim-harness.js` at the origin
  endpoints (`d229b58f5`, `a628aeaf3`) is sha `341d2e6f…`,
  vs `d0447d02…` at the far end and the merge. The ONLY
  difference (`git diff d229b58f5 203a32775`) is the
  sim-roundcap-b `sourcePatch` hook (one hunk, test-only,
  identity by default). The bisect driver passes no
  `sourcePatch`, so the harness is BEHAVIORALLY IDENTICAL
  across every bisect step. Steps run each commit's OWN
  harness (no swap).
- **Standing fix swap.** Every bisect step swaps in the fix
  `standing.js` (`git show 5157782a4:src/js/standing.js`,
  sha256 `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`)
  uncommitted, exactly as the masterregress swap legs did,
  and restores the commit's native `standing.js`
  byte-identical afterwards (sha-verified: `98c8bfad…` on
  origin commits, `75762cb2…` on the far-end/merge endpoints).
  The fix file vs origin `standing.js` differs by EXACTLY
  TWO insertions (56 diff lines): the ROSTER CHECK hunk and
  the BLOODED block. BLOODED has ZERO callers on origin
  trees (`git grep villageBlooded|bloodedCfg` at `d229b58f5`
  and `a628aeaf3` returns nothing; at the far end it returns
  fieldFights.js, game.js, standing.js) — so on origin
  commits the swapped-in BLOODED block is INERT and the
  swap's only live delta is the roster check, exactly as on
  the far/merge bases. The driver refuses to run unless the
  on-disk `standing.js` carries the ROSTER CHECK marker.
- **Policy.** Each step runs its commit's OWN `competent.js`
  (own-policy convention, same as masterregress legs). The
  driver records the policy sha per seed and refuses only if
  the policy file cannot be read. The garden-hunk confound
  is closed by mergeps, not re-litigated here.
- **Instrument.** `scripts/vetfirst-instrument-20261111.js`
  (sha256 `311f105bc15f…`, byte-identical to master) + the
  live shadow old-rule count, exactly as masterregress.
  Restored as UNTRACKED scratch at each bisect commit via
  `git show sim-culpritbisect-a:<path>` (it does not exist in
  the old trees) and deleted before checking the branch back
  out. Same for the bisect driver/analyzer (they exist only
  on this branch).
- **Mode.** `fix` only (the fix is swapped in at every step).
  `loadGame({seed, mode: 'competent-vetphantom'})`,
  competent verbatim, 150d death-aware, seeds 190391–190398.

## Method — manual git bisect, one step at a time

1. **Endpoint verification FIRST** (with the BISECT driver,
   not the masterregress driver — this validates the bisect
   driver's relaxed guards and swap mechanics on both
   standing variants before any step trusts them):
   - far end `203a32775` → expect 4/8, per-seed days
     86/144/150/43/150/87/150/150 (masterregress far leg).
   - merge `e4dbe581b` → expect 1/8, per-seed days
     103/150/115/140/76/126/115/136 (masterregress merge leg).
   - Either endpoint mismatching (far ≤2/8, merge ≥3/8, or
     per-seed days differing by more than a re-run wobble)
     → NO-GO, STOP, report loudly. The settled localization
     would be in question; no bisect step is cut.
2. `git bisect start e4dbe581b 203a32775` on this worktree
   (detached HEADs; the branch is restored at the end).
3. Per step (expected ~7–8 steps for 157 commits):
   - Record the candidate commit (sha, subject, first-parent
     vs side-branch, PR if any).
   - Restore tooling scratch (driver, analyzer, instrument)
     from the branch; swap in the fix `standing.js`;
     verify marker + exact fix sha.
   - Run `STEP=sNN-<sha9> SEEDS=190391,…,190398 DAYS=150
     RUN=culpritbisect-pilot node
     scripts/culpritbisect-driver-20261113.js`, logging to
     `evidence/2026-11-13/culpritbisect-a-<step>-driver.log`.
   - Run the analyzer for the step (survived /8, per-seed
     days, rank, wall numbers, death causes, instrument
     errors) → `evidence/2026-11-13/culpritbisect-a-<step>-summary.json`.
   - Restore native `standing.js` byte-identical (sha
     verify + `git status` shows no `src/js` modification);
     delete tooling scratch; verify the tree is clean apart
     from the untracked step corpus.
   - Classify the step (see §Bisect rule) and run
     `git bisect good|bad`. Append the step to the step
     ledger `evidence/2026-11-13/culpritbisect-a-steps.log`.
4. When `git bisect` reports the first bad commit, run the
   **boundary-pair confirmation**: re-run BOTH the first-bad
   commit and its good parent with the bisect driver
   (fresh STEP ids) and require the split to reproduce
   (parent ≥3/8, culprit ≤1/8).
5. `git bisect reset`, check the branch back out, commit
   evidence + step corpora + summaries, write the evidence
   file.

## Bisect rule (per step, pre-registered)

| Step survived | Classification | Bisect move |
|---|---|---|
| ≥3/8 | GOOD | `git bisect good` |
| ≤1/8 | BAD | `git bisect bad` |
| 2/8 | AMBIGUOUS | Re-run the step once (fresh STEP id, same commit). If the re-run reads ≤1/8 → BAD. If it reads ≥3/8 → GOOD. If it reads 2/8 again → recorded AMBIGUOUS, bisect proceeds treating it as BAD, and the boundary pair gets a second confirmation run. The ambiguity is reported, never hidden. |

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: matched-band survival count /8 per step.**

| Outcome | Verdict |
|---|---|
| Bisect returns a first-bad commit C whose parent P reads ≥3/8, C reads ≤1/8, AND the boundary-pair re-run reproduces the split (P ≥3/8, C ≤1/8) | **GO-CULPRIT-COMMIT** — the commit(s) where survival drops are isolated: C (plus whatever it changed — the evidence file names the files/hunks and the mechanism, from the diff and the per-seed corpora). |
| All tested origin commits read ≥3/8 and the merge reads 1/8 — `git bisect` reports the merge itself as first-bad | **GO-MERGE-RESOLUTION** — the drop is in the merge's conflict resolution, not in either parent's content. The evidence file names the resolution hunks (merge tree vs both parents). |
| The bisect converges to the merge-base edge: the earliest origin commit(s) already read ≤1/8, and no good→bad transition exists inside the origin line (the first origin commit's parent, the merge-base, is settled 1/8) | **DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE** — no single culprit commit inside the merge: the origin line was already collapsed when it diverged, and the drop is a property of the origin content as a whole (H1 needs the transplant program: land origin-side families onto the far end one at a time). The bisect is COMPLETE and definitive; it is not a failed bisect. |
| A commit on the good side of the boundary reads ≤1/8 on re-run, or a commit on the bad side reads ≥3/8 — the single-transition assumption fails | **DIAG-NONMONOTONIC** — the bisect result is provisional; the evidence file reports the non-monotonic commits and the boundary is not trusted. |
| Endpoint verification fails (far ≤2/8 or merge ≥3/8), or the boundary-pair re-run does NOT reproduce the split | **NO-GO** — STOP and report loudly. |

**Rank read (pre-registered alongside survival, same bands
as r10/masterregress):** regional reach on the same band —
≥5/8 REGIONAL_INTACT; ≤2/8 RANK_STALL; 3–4/8
RANK_INCONCLUSIVE. Reported per step, never a bisect input.

**Secondary (reported, not judged):** median survival;
death-cause shares vs the combat-heavy profile; wave-4/5
unlocks; national / table / wins; standing range;
tribute-ready; blooded count. **Wave-5 choke:** peak living
wave-4+ veterans per seed vs the bar of 2.

**Deep-identity read (pre-registered):** for the boundary
pair only — per-day 4-field signature + full daily-snapshot
deep-diff (snapshots paired INDEX-ALIGNED, never day-keyed),
parent corpus vs culprit corpus, to show WHERE the
trajectories diverge (which day, which field moves first).
Attempted with the goal-hidden_files deep-diff script; if
it cannot run, recorded, not waived. A divergence is an
instrument finding — reported, investigated, never a
verdict input.

**Sense-testing (SENSE-TESTING LAW):** read the boundary
pair's transcripts (vetSays) — do the villagers still act
like people on both sides, and what changes in what they
do/say around the divergence day? Reported in the evidence
file in plain words.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical
  to all prior bands, so survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds)** — deliberately the SAME
  band as vetphantom, firstparent, merge, reconciled, anchor,
  survivalcontrol, burnoffsets-b0, masterregress, and every
  bisect cut. A bisect step re-runs the same seeds on old
  code; that is the point, not a freshness violation.
- **Policy: competent verbatim, own-policy per step**
  (recorded per seed; the driver refuses only an unreadable
  policy file). Policy confound notes (all verified by diff
  before any sim, not assumed):
  - Far vs merge policy diff = garden reorder ONLY (2
    hunks) — exonerated at the merge by mergeps.
  - Origin-range policy flip is the same garden hunk
    (`91cb6fa20`); it flips once, mid-range.
  - `scripts/sim-harness.js` differs between origin
    endpoints and the far end by the inert `sourcePatch`
    hook only (see §Substrate).
- **Instrument:** `scripts/culpritbisect-driver-20261113.js`
  (clone of the masterregress driver with the leg guards
  relaxed for bisect steps: no anchor pin, standing =
  marker-required with the sha recorded + swapped-flag,
  policy = record-only) + analyzer
  `scripts/culpritbisect-analyze-20261113.js` (per-step
  classification GOOD/BAD/AMBIGUOUS + wall numbers) +
  proof `scripts/test-culpritbisect-a.js`.
- **Corpora:** `evidence/2026-11-13/perseed-culpritbisect-a-<step>/`
  — 8 per-seed JSONs per step; driver logs
  `evidence/2026-11-13/culpritbisect-a-<step>-driver.log`;
  per-step summaries
  `evidence/2026-11-13/culpritbisect-a-<step>-summary.json`;
  step ledger
  `evidence/2026-11-13/culpritbisect-a-steps.log`.

## Fix policy (conditional, pre-registered)

If the bisect lands on a culprit commit whose change is a
DEFECT (not a design trade-off), the fix may land in this
arm ONLY if it is small (a revert of the culprit hunk, or a
one-hunk correction), carries its own proof test
(`scripts/test-*.js`, before/after on identical seeds), and
restores ≥3/8 on the same band. Otherwise — design question,
large fix, or anything needing Steve's ruling — the arm
documents the culprit commit + what it changed + why it
breaks survival, and files the fix as the next arm. No
`[needs-eyes]` applies unless a fix lands (feel/combat/UI
change).

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design
call #4 (veteran bar: readiness reads living roster members
with a recorded wave-(w-1)+ kill in `state.waveKillLog`) and
docs/TABLE.md (the table prices the run, never gates on
godhood; reachable by competent non-god play — Steve
2026-10-11) and Steve's 2026-11-10 scholar-counts ruling.
No canon doc covers survival-collapse attribution; nothing
here invents canon.

## Balanced panel (§15) — N/A

Diagnostic bisect, no code change, no before/after pair to
compare on one base. The before/after comparison IS the
boundary pair (parent vs culprit) on identical seeds, judged
by the analyzer's decision rule. Same standing as
masterregress §7, survivalcontrol-b §7, anchor-a §7, and the
r5–r10 cut arms §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the step
  is INCOMPLETE, not a verdict — re-run the missing seed(s)
  only.
- If instrument errors > 0 on any seed, record them; the
  verdict stands only if the errors cannot touch the survival
  read (the survival read comes from the harness end state,
  not the instrument).
- The fix swap is the ONLY permitted uncommitted change
  during a step (plus the untracked tooling scratch). After
  each step, the original `standing.js` is restored
  byte-identical (sha256 `98c8bfad…` on origin commits,
  `75762cb2…` on the endpoints) before the next step or any
  evidence commit. If a restore fails, FAIL LOUDLY and do
  not commit evidence.
- This arm does NOT re-judge any prior verdict (masterregress
  CULPRIT_MERGE / POLICY_EXONERATED_AT_MERGE, vetphantom GO,
  merge-a COLLAPSE_INSIDE_MERGE, reconciled-a
  COLLAPSE_CONFIRMED, origin-a ORIGIN_COLLAPSED, mergebase-a
  MERGEBASE_COLLAPSED, policyswap-a POLICY_EXONERATED,
  r9/r10-cut INCONCLUSIVE, gap-candidates GAP-NOT-DICE,
  burnoffsets NO-STREAM-SAVES) — it bisects inside the merge
  the masterregress arm localized.
- Do NOT cut at the range midpoint (ordinal 302 / FP-ordinal
  117 of the old 603-commit range) — settled-collapsed
  territory, stated in the masterregress prereg. Do not touch
  the stall window (commits 58–65 of the old window) — the
  stallcut61 arm owns it. Do not touch Loop B's trees/branches
  — different questions.
- No game-code change is made by this arm unless the §Fix
  policy triggers, so no `[needs-eyes]` applies otherwise.
- Telemetry deviation check (Loop A body step 10): attempted;
  prior bisect arms were REFUSED by the tool
  (recorder-corpus class). If refused again, recorded, not
  waived, baseline NOT rolled.
- Ancestry notes (all verified at run start): `203a32775`
  is the FIRST parent of `e4dbe581b`; `a628aeaf3` is its
  second parent; `d229b58f5` is their merge-base and an
  ancestor of `203a32775`; `5157782a4` is an ancestor of
  master and carries the fix natively; `5d16916f4` (r131 fix)
  is NOT an ancestor of `203a32775`, `e4dbe581b`,
  `d229b58f5`, or `a628aeaf3`.
- Flap note: the flap-watch log read ALL-OK at run start
  (2026-11-13 ~16:55Z); the prereg + tooling are written and
  committed only after a probe succeeds. If the flap returns
  mid-run, wait for it to clear rather than bypassing
  safe-commit; never route around a denial. The driver's
  writeRobust carries the reconciled-a Atomics.wait hardening
  so a burst cannot silently lose a seed.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the steps: did the metric set hold, or does a
  metric need revision for the NEXT run?)
