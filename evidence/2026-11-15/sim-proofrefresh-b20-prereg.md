# sim-proofrefresh-b20 — prereg (measurement proof regeneration, round 20)

## Run

- **Run:** fleshout-loop-b-20261115T0621Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b20 (tracker blank: "proof
  refresh round 20 on the next manifest change (regenerate + re-point,
  do not hand-edit)"). Round 19 was GO 12/12 on panel 8ea3a8bd
  (branch sim-proofrefresh-b19), merged. Round 20 is owed NOW: the
  funeral-mend landing (master b9b226430) changed src/js/hierarchy.js,
  which the proof manifest hashes, re-staling the b19 panel; the batch
  ship's index.html version stamp also moves the manifest. Round 20
  follows the proven round-13/18/19 pattern exactly (regen + re-point
  + 6 GO legs), on the current tip. Full prereg committed first:
  `evidence/2026-11-15/sim-proofrefresh-b20-prereg.md`.
- **Base SHA:** `b9b226430` (main-tree master at run start; the
  worktree branch sim-proofrefresh-b20 was registered at this tip,
  tree clean). If master moves during the run, rebase onto the
  explicit master SHA at closeout and re-verify leg (a) on the
  rebased tip; the panel stays valid only if the move touches NO
  manifest file.
- **Primary metric:** `node scripts/godpath/test-measurement-proof-update.js`
  pass/fail on the tip. GO = exit 0, all legs pass.
- **Panel spec:** seeds [7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9],
  policies [capable, risk-aware, socialite, winseek], days 150, origin
  Columbus, Ohio — via `scripts/balance-panel.js` (64 rows).
- **Horizon:** N/A (infrastructure — the panel carries its own 150d spec).
- **GO bar (pre-registered):** (a) test-measurement-proof-update 9/9
  exit 0 on the final tip; (b) measurement-workflow 9/9; (c)
  cache-flags 4/4 outright (2026-11-12 load-artifact lesson: if it
  fails under load, run the discriminating A/B on a quiet box before
  blaming the change); (d) neutrality reproduces the prior panel on
  every proof case, warnings 0; (e) test-proofrefresh-b20.js 12/12
  incl. stale-input negatives (the retained b19 panel AND the b18
  panel FAIL validate() on the new tip); (f) ontology exit 0. Any leg
  miss = NO-GO, no re-scoring.
- **Negative-panel note (brief vs pattern):** this round's brief names
  the b19 and b18 panels as the leg-(e) negatives — the two most
  recent prior panels, as b13 used b12/b11 and b19 used b18/b17. The
  b20 test checks b19/b18; the b13/b12 negatives are ALSO verified
  (validate() must fail on both) in the owed-check and recorded in
  the evidence file, matching the round-19 practice.

## Owed-check (run before the panel, on base b9b226430)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  b9b226430 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the worktree
  before the panel run.
  `test-measurement-workflow.js` standalone: **8 passed, 1 failed** —
  the failing leg is exactly "retained neutrality proof covers the
  current Game/controller/harness inputs" (the staleness failure; the
  same leg the b11/b12/b13/b19 adoptions recorded as 8/9 on their stale
  landing tips).
- `B.manifest('.')` vs the retained b19 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b19.json.gz`, sha256
  `8ea3a8bdcb8b72d6988a2fb7bf181623480eecca1f104f9c6241439fa5266e8e`):
  tip 529 keys, panel 529 keys — **0 keys only in the tip + 6 keys
  differ**:

  - `src/js/build.js` — batch-ship version bump (panel `002759da082a…`,
    tip `cf40fec40e13…`)
  - `src/js/conversation.js` — funeral-mend landing (panel
    `7bf28860b363…`, tip `af4d10c25eee…`)
  - `src/js/convo-scene.js` — funeral-mend landing (panel
    `039e3737f4e9…`, tip `d2c6e5d9b6b9…`)
  - `src/js/game.js` — funeral-mend landing (panel `f3d10e7bece6…`,
    tip `e0d7dee980e1…`)
  - `src/js/hierarchy.js` — funeral-mend landing (panel
    `03cd67034447…`, tip `446b7141eb83…`)
  - `index.html` — batch-ship version bump (panel `e35cc1619c6a…`,
    tip `6e54b11025a4…`)

  Observer and contract digests still match the b19 panel (observer
  f37e5ce0…, contract 37bbb0fa…). The staleness is the source manifest
  only: 5 funeral-mend game-code changes + 2 version stamps (build.js
  + index.html).
- `B.manifest('.')` vs the retained b18 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b18.json.gz`): tip 529
  keys, panel 526 keys — the same 3 new policy files (competent-
  answercourt-b, competent-scaleclimb-b, competent-succpolity-b, from
  the 0155Z merges, already in b19) + **7 keys differ** (betrayal.js,
  build.js, conversation.js, convo-scene.js, game.js, hierarchy.js,
  index.html). Observer and contract digests still match the b18 panel.
- `B.manifest('.')` vs the retained b17 panel: 3 new policy files +
  **8 keys differ** (adds partyTactics.js). Vs b13 and b12 panels
  (`evidence/2026-11-13/neutral-proofrefresh-b13.json.gz`,
  `evidence/2026-11-12/neutral-proofrefresh-b12.json.gz`): 3 new
  policy files + **10 keys differ** each (adds abilityActions.js,
  contests.js). Observer and contract digests match all four.
- Stale-input negatives verified on this tip (validate() FAILS with
  "Proof source inputs are not current" on all five): b19, b18, b17,
  b13, b12. The brief's b19/b18 negatives hold, and so do b13/b12.
- Cache-flags anomaly in the owed-check: `test-measurement-cache-
  flags.js` scored **0/4** on this tip (all four legs FAIL), where
  round 19 scored 4/4. Discriminating probe, same tip, same minute:
  a single 1-day zero-policy panel build via the real CLI completes
  fine (exit 0, 1 case) but takes **35.4s wall for ~3s CPU** — over
  the test's 30s spawn timeout. Box load average was 25.47 at the
  time (a parallel test sweep running in other trees: garden/relay
  suites + journey-landing-r135). This is the 2026-11-12 load
  artifact, not a code failure: no panel/cache code changed in this
  arm (only evidence + test files committed so far; the funeral-mend
  base did not touch balance-panel.js or the cache logic). Leg (c)
  is re-run at closeout; if the box is still loaded it is judged by
  the A/B (same-tip quiet-box rerun), per the prereg.
- Pre-regeneration `test-proofrefresh-b20.js`: crashes at leg (d)
  with ENOENT — `evidence/2026-11-15/neutral-proofrefresh-b20.json.gz`
  does not exist yet (the panel has not been generated or re-pointed).
  Legs before the crash: validate FAIL (ENOENT on the new panel),
  proof-update FAIL exit 1, workflow 8/9, cache-flags 3/4 (one leg
  failed — the load artifact again: 0/4 standalone minutes earlier,
  3/4 inside this run as the parallel sweep wound down; scores move
  with box load, not with any code change), ontology exit 0
  ("All 138 systems validated", ONTOLOGY.md 2198 lines).
- `validate-ontology.js` standalone: exit 0, "All 138 systems
  validated", ONTOLOGY.md 2198 lines.
- **Verdict of the owed-check: OWED.** Panels at b19 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel (filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b20-panel --n 16 --days 150`
- Single attempt, started 06:44:04Z, finished 07:13:08Z:
  `Saved .proofrefresh-b20-panel; 64 cases, 0 cached jobs. PANEL_EXIT=0`.
  ~29 min wall (faster than round 19's 41 min — box quieter).
- The `cases/` cache in `.proofrefresh-b20-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == sourceHeadEnd == 72c4dda8629a05210ed2d8124f431708f3a55f8b`
  (prereg/owed-check commit, on base b9b226430).
- Panel sha256
  `d58537cde306ebc9720adccc707a57fda9828fd1a0d9bb594db64164bcce5a4b`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b19 panel AND the b18 panel (regeneration
  moved no NEUTRALITY verdict). Observer/contract digests match the tip
  and the b19 panel. 0 rows with warnings/observer/gear problems (read on
  the OUTER panel rows).
- ROW MOVEMENT (brief expectation NOT met — see the evidence file):
  headline-field rows differ **64/64** vs b19 (and vs b18; b18/b19 rows
  were identical to each other). Per-field: days 60/64, waveReach 21/64,
  maxRank 13/64, vests 16/64, national 6/64, table 6/64, maxArc 6/64,
  won 2/64, entered 2/64, endReason 8/64, vestsVillager 7/64.
  Aggregates b20 vs b19: won 14 vs 16, entered 14 vs 16, national 13
  vs 11, table 54 vs 56, waveReach>=5 13 vs 13, waveReach>=4 62 vs 63,
  vests 22 vs 23, vestsVillager 44 vs 39, median days 90 vs 90,
  survived 4 vs 2, village-lost 46 vs 46. Determinism proven on this
  tip (capable/seed 7 run twice → byte-identical rows; the single-case
  re-run row == the full-panel row), so the movement is the
  funeral-mend game-code change shifting behavior and RNG streams,
  not panel noise. The neutrality tuple — the proof's binding check —
  reproduces exactly.
- Staleness on the tip (measured, `B.manifest` vs panel `sources`):
  **b20-new 0 stale**; **b19 6 stale** (the 6 differing keys);
  **b18 10 stale**.
- Copy the regenerated panel to
  `evidence/2026-11-15/neutral-proofrefresh-b20.json.gz` (NEW file — do
  NOT overwrite b19/b18/b13/b12), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-15/neutral-proofrefresh-b20.json.gz` — exit 0.
  No hand-edited hashes; re-point to the NEW panel only.

## Telemetry

- `scripts/telemetry-check.js` cannot parse the retained .gz panel
  (same limitation b11/b12/b13/b19 recorded) — record that, no lever
  played so no deviation to check; the neutrality reproduction
  (leg d) is the instrument check. Baseline NOT rolled.
