# H1 transplant — family 2b FRESH-BAND generalization (arm sim-transplant2b-fresh-a)

Run: fleshout-20261115T1715Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 2b fresh-band generalization
(evidence/2026-11-13/sim-transplant2b.md).
Arm branch: `sim-transplant2b-fresh-a` (worktree
`~/workspace/worktrees/sim-transplant2b-fresh-a`).
Prereg written and committed BEFORE any judged sim.

## The question

Family 2b (evidence/2026-11-13/sim-transplant2b.md, arm
sim-transplant2b-a) read AMBIGUOUS 2/8 twice on the matched band
190391–190398 (far end 4/8 on the same band; the re-run reproduced
the first run EXACTLY — deterministic driver, identical subject).
Per its prereg, 2/8 twice = recorded AMBIGUOUS, treated as
NOT-CARRIER for ordering, kept on the suspect list. This arm asks
whether the 2/8 generalizes to a FRESH band: run the same far end
and the same subject on seeds no earlier run has used, and judge
the subject against the fresh-band baseline.

## Canon (read first)

- docs/CANON.md read. The target area is the raid-danger /
  heard-filtered perception area — VILLAGER-BRAIN seam 4, covered
  by docs/VILLAGER-BRAIN.md (§ "Perception-filtered danger":
  `objDangerBelief(vid)` feeds door, rally and safety; gossip
  counts only if this villager is in its heard list; the raid seed
  arms only villagers at the fire). No canon invented; the family
  changes no canon doc beyond the two docs in its own diff
  (ONTOLOGY.md, VILLAGER-BRAIN.md — both part of the family diff,
  verified below).

## Base (verified at run start)

- Arm base: master tip `f8f6265b9` (Loop B's winnability-round-1630
  landing: courtship adoption + wave5kill DIAG). Verified:
  `git diff --stat 53e7b6a1e f8f6265b9` = 34 files, evidence +
  courtship scripts/policies only; `git diff --name-only
  53e7b6a1e f8f6265b9 -- src/js/` = EMPTY (zero src/js changes).
- Worktree HEAD at run start: `f8f6265b9d91aad02eb23b7c9e038101ec8bad52`,
  `git status --short` empty.

## Subject verification (verified BEFORE any sim; subject stays on its branch)

Branch `transplant-2b-subject` at
`385a9f7b61ad3f0090cffd7eaa113b91f7c1fcac`, message "Merge pull
request #6 from steve-vitale/cursor/raid-danger-heard-c0a3"
(the cherry-pick's carried message). All checks pass:

- Merge `7ddcdfff9` parents: first `21ae2d6968` (PR #5 merge),
  second `dff2cd523` ("Merge origin/master into raid-danger-heard
  branch"). Second-parent side is 2 commits: `dff2cd523` +
  `763456007` "Unify raid danger to one heard-filtered belief read".
- Family diffstat `7ddcdfff9^1 → 7ddcdfff9`: 14 files, +379/−97.
  src/js: 4 files, +71/−62 (game.js +7/−1, npc-triggers.js +3/−1,
  villager-goals.js +4/−11, villager-objectives.js +57/−49).
  No scripts/policies file. No standing.js.
- Subject vs far end `203a32775 → 385a9f7b6`: 14 files, +380/−97 —
  exactly the family file list; the +1 insertion is the green-list
  union (+4 vs the family's +3). Subject parent is the far end
  `203a327750a223e0a1465dc51f5409787efdfaae`.
- src/js content diff is BYTE-IDENTICAL family vs subject:
  content-only hash (diff headers/hunks stripped) `f12795dc…`
  both ways; 133 changed lines each; per-file stats identical.
  (Raw diff hashes differ only by hunk line numbers — the 2b
  evidence's `92023c6d…` note records the same comparison.)
- Green-list union, subject lines 916–921, in order:
  pellet-boost, pellet-q4, person-trust, raid-danger-heard,
  win-rallyguard, retarget-gossip — exactly the 2b record.
- standing.js identical in far end and subject (sha256
  `75762cb2…`); competent.js policy identical (sha256 `a7ff5c51…`).
  The subject's native standing.js is the far-end one, so the
  standing-fix swap mechanics are exactly as in the bisect prereg.

## Fresh band + freshness record (full check, per the seed-band freshness skill)

- Chosen band: **190621–190628** (first choice; fallback
  190631–190638 NOT needed).
- Search scope and results (all run before this prereg was written):
  - `grep -rln "190621" evidence/*/sim-*-prereg.md evidence/*/sim-*.md`
    → NO matches (rc=1). Same for `190631` → NO matches.
    901 dated preregs searched (`ls evidence/*/sim-*-prereg.md |
    wc -l` = 901).
  - Seed-context rg across ALL of evidence/:
    `"seed"\s*:\s*19062[1-8] | seed\s*=\s*19062[1-8] |
    s19062[1-8] | 190621[-–]190628 | 190621,190622 |
    SEEDS="?19062[1-8]` → NO files (rc=1). No earlier run names
    any of 190621–190628 as a seed in any context.
  - Raw substring hits for `190621` (e.g. 7 files per `git grep -l`)
    were investigated and are FALSE POSITIVES: decimal fragments
    inside larger numbers (e.g. `110.11906215362251`, a "drawn"
    kcal value in evidence/2026-11-07/awayconfirm-a-corpus/);
    `rg -w "190621"` on that corpus returns nothing.
  - Dated screens / extension bands: `grep -rln "190621"
    evidence/*/sim-*screen*.md evidence/*/*screen*.md` → NO matches.
  - Forbidden / contaminated band lists: no central list file
    exists; the only "contaminated" path found is
    `evidence/2026-11-06/drive-practice-contaminated-baseline/`
    (seeds 99451–99458, no `19062` anywhere, rc=1) and the goal
    `hidden_files/r53/arm-contaminated-backup` (unrelated backup).
    Neither names the band.
  - NEVER bands avoided: 190391–190398 / 190581–190588 /
    190561–190568 / 100521–100536 / 100601–100608 / 100621–100636
    (sanity: each IS named in preregs — 94 / 4 / 5 / 2 / 1 / 1
    files respectively — so the search itself works).
- The fallback band 190631–190638 was pre-screened the same way
  at prereg level (0 hits); its evidence-wide seed-context rg
  timed out at 100s (rc=124, incomplete) and is NOT relied on —
  the first choice is fresh, so the fallback is not used.

## Legs (both on the fresh band, identical mechanics)

- Horizon: 150d death-aware. Policy: competent verbatim
  own-policy per step (each step runs its commit's OWN
  competent.js; the driver records the sha per seed).
  Standing fix `f8fda4295a99` swapped in for every step exactly as
  the bisect prereg specifies (marker + exact sha verified at
  swap; native restored byte-identical afterwards, sha-verified).
  Driver mechanics reused (`scripts/culpritbisect-driver-20261115.js`
  + `scripts/culpritbisect-analyze-20261115.js`, 20261115 copies of
  the 20261113 tooling differing ONLY in band / evidence date /
  RUN name / per-seed filename prefix; no guard, instrument or
  policy change), via `scripts/culpritbisect-step-fresh-20261115.sh`.
  RUN: `transplant2b-fresh-pilot`.
- (a) BASELINE leg: far end `203a32775`, STEP `t2b-fresh-203a32775`.
- (b) SUBJECT leg: subject `385a9f7b6`, STEP `t2b-fresh-385a9f7b6`.
- No re-run of the baseline: the driver is deterministic (2b
  proved byte-identical reproduction on a re-run), so a baseline
  re-run would add no information.

## Verdict mapping (FROZEN in this prereg, before any leg)

Primary metric: survived/8 on the fresh band. Let B = baseline
survived count, S = subject survived count.

- Branch 1 — if the fresh-band baseline reads B = 4 (the matched-band
  far-end level), use the ORIGINAL mapping:
  - S ≤ 1/8 → CARRIER — the family alone collapses the far end
    to the merge's level.
  - S = 2/8 → AMBIGUOUS → re-run the SUBJECT leg once with a fresh
    STEP id (`t2b-fresh-385a9f7b6r`); 2/8 again → recorded
    AMBIGUOUS, treated as NOT-CARRIER for ordering, kept on the
    suspect list. A re-run reading S ≤ 1 → CARRIER; S ≥ 3 →
    NOT-CARRIER (the re-run's count governs, as in 2b).
  - S ≥ 3/8 → NOT-CARRIER — family alone does not collapse
    (within a step of the far end).
- Branch 2 — if the baseline reads B ≠ 4, judge RELATIVELY:
  - S ≤ B−3 AND S ≤ 1/8 → CARRIER.
  - S ≥ B−1 (within 1 of baseline) → NOT-CARRIER.
  - Otherwise (B−2 ≤ S ≤ B−1 is NOT-CARRIER by the line above;
    the middle band is S = B−2, or S ≤ B−3 but S ≥ 2) →
    AMBIGUOUS → re-run the SUBJECT leg once with a fresh STEP id
    (`t2b-fresh-385a9f7b6r`); the re-run's count is judged by the
    same relative mapping and governs; if the re-run lands in the
    same AMBIGUOUS band again → recorded AMBIGUOUS, treated as
    NOT-CARRIER for ordering, kept on the suspect list.
- The analyzer's raw labels (GOOD ≥ 3 / BAD ≤ 1 / AMBIGUOUS = 2)
  are INSTRUMENT labels only and never decide the fresh verdict.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution, national / table /
  wins. No cost guard — measurement arm; nothing lands on master
  from the subject (the subject branch is never merged).
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora (transplant precedent); record the refusal, never
  roll the baseline.
- Balanced panel (§15): `scripts/balance-panel.js` before/after
  compare on the two legs; attach the compare .md to the evidence.
  The panel is the instrument; this prereg's threshold is the
  judge. Commit panel summary only (panel.json.gz + compare
  .md/.json); NEVER commit the cases/ cache.
- Proof (stage 1 green BEFORE judged sims):
  `scripts/test-transplant2b-fresh.js` (family identity, subject
  verification, band-freshness record, verdict mapping incl. both
  branches + re-run rule) + re-run `scripts/test-culpritbisect-a.js`
  (116/116) + `scripts/test-transplant2b.js` re-run where it still
  applies (its corpus legs are the matched band; adapt, don't
  silently drop). The proof must show the subject actually differs
  from the far end where the family claims (the heard-filtered
  belief read), not just no-throw.
- Sense-testing (SENSE-TESTING LAW): read transcripts/dialogue
  from the corpora — judge meaning, coherence, relevance,
  consequences, never just counts; flag anything robotic, static,
  or repeated.

## Metric review (placeholder — filled after the legs)

- To be written in the evidence file after the legs run.
