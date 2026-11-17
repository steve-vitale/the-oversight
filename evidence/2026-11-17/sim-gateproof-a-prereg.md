# sim-gateproof-a — prereg (fresh full gate + measurement-proof refresh)

## Run

- **Run:** fleshout-20261117T1015Z, axis food-economy, arm sim-gateproof-a
  (tracker blanks #1 + #2: fresh full gate + measurement-proof refresh).
  Zero game-code change expected — tooling/measurement only.
- **Base SHA:** `9be3676d8` (main-tree master at run start; the worktree
  branch sim-gateproof-a was registered at this tip, tree clean). If
  master moves during the run, rebase onto the explicit master SHA at
  closeout and re-verify leg (a) on the rebased tip; the panel stays
  valid only if the move touches NO manifest file.
- **Primary metric (Part A — gate):** `node scripts/check.js --quick`
  run ONCE on this tree: 0 attributable failures beyond the standing
  profile. Standing profile from recent runs: 330/10, 333/7, 280/7 —
  all with a pre-existing parity-gear assertion and a
  measurement-proof staleness pair.
- **Primary metric (Part B — proof):** `node
  scripts/godpath/test-measurement-proof-update.js` pass/fail on the
  tip. GO = exit 0, all legs pass, after the refresh.
- **Panel spec:** seeds [7], policies [capable, risk-aware, socialite,
  winseek], days 150, origin Columbus, Ohio — via
  `node scripts/balance-panel.js --out .proofrefresh-gateproof-a-panel --n 1`
  (4 rows). This is EXACTLY the command/spec that produced the panel
  currently pointed at (neutral-r211-rebased.json.gz, 4 cases, 199s,
  journey-endgame-r211.md:324).
- **Horizon:** N/A for the gate (check.js --quick carries its own list);
  the panel carries its own 150d spec.
- **GO bar (pre-registered):** (a) test-measurement-proof-update 9/9
  exit 0 on the final tip; (b) measurement-workflow 9/9; (c)
  cache-flags 4/4 outright (2026-11-12 load-artifact lesson: if it
  fails under load, run the discriminating A/B on a quiet box before
  blaming the change); (d) neutrality reproduces the prior panel on
  every proof case, warnings 0; (e) test-gateproof-a.js 12/12 incl.
  stale-input negatives (the retained r211-rebased panel AND the b20
  panel FAIL validate() on the new tip); (f) ontology exit 0; (g) the
  gate runs once with 0 attributable failures beyond the standing
  profile — the measurement-proof staleness pair must be ABSENT after
  the refresh (its presence would be a refresh failure, not a gate
  attribution question), and the parity-gear assertion is expected to
  remain as pre-existing. Any leg miss = NO-GO, no re-scoring.

## Spec decision (brief deviation, recorded before running)

The brief names the ede1a2796 precedent (capable/seed 7/30d) and the
current proof as 01ab3e346. Both are stale: the proof was re-pointed
twice since — b20 (64-row, 2c4bf282f, Nov 15) and then r211
(`--n 1`, 4-row, seed 7 x 4 policies x 150d, panel c015d348…,
journey-endgame-r211.md:324), which is what
scripts/balance-proof.json points at on this tip. Regenerating at
capable-only/30d would SHRINK the maintained proof from 4 cohorts to
1 and 150d to 30d — a coverage regression, not a refresh. This round
regenerates at the CURRENT proof's spec (`--n 1`, seed 7, 4 policies,
150d), preserving coverage exactly; the ede1a2796 lineage (seed 7,
minimal panel) is honored. The brief's core requirements — fresh
neutral panel, do NOT re-point to 598e21bdb (its scorecard source hash
no longer matches master), proof test green after — are honored
exactly. Coordinator can overrule the spec (a re-run at the other spec
is ~1 min of panel + a re-point).

## Owed-check (run before the panel, on base 9be3676d8)

- Before: `node scripts/godpath/test-measurement-proof-update.js`
  FAILS on 9be3676d8 with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the
  worktree before the panel run, matching the coordinator's baseline.
  `test-measurement-workflow.js` standalone: **8 passed, 1 failed** —
  the failing leg is exactly "retained neutrality proof covers the
  current Game/controller/harness inputs" (the staleness failure; the
  same leg the b11/b12/b13/b19/b20 adoptions recorded as 8/9 on their
  stale landing tips).
- `B.manifest('.')` vs the retained r211 panel's `sources`
  (`evidence/2026-11-15/neutral-r211-rebased.json.gz`, sha256
  `c015d3481741a1f268d176fe5c5431b36433d600b728f29530b64d5281f3414e`):
  tip 532 keys, panel 532 keys — **0 keys only in the tip + 14 keys
  differ**:

  - `src/js/build.js` — batch-ship version bump (panel `5397ae4e941f…`,
    tip `9818c3223fd5…`)
  - `src/js/conversation.js` — r213 deepening (panel `30a19d552f8c…`,
    tip `5ed57d8ab1a9…`)
  - `src/js/convo-dialogue.js` — (panel `568099b225b1…`, tip
    `7c2df8a88b42…`)
  - `src/js/convo-scene.js` — (panel `d2c6e5d9b6b9…`, tip
    `0dfb2f9af0b3…`)
  - `src/js/convo-wants.js` — (panel `6123031b43d0…`, tip
    `8d59db4d4e81…`)
  - `src/js/game.js` — planignite-fix + r213 (panel `3d0f6c65f246…`,
    tip `b66172d369aa…`)
  - `src/js/hierarchy.js` — (panel `446b7141eb83…`, tip
    `fff8f427c4b2…`)
  - `src/js/titans.js` — (panel `ecd240b2ad53…`, tip `8b8065b1eaa2…`)
  - `src/js/villager-agency.js` — planignite-fix (panel
    `bf2397a34ca3…`, tip `2f283ecac9d9…`)
  - `src/js/villager-brain.js` — planignite-fix (panel
    `260bf980836c…`, tip `989a95594234…`)
  - `src/js/win-plan.js` — (panel `6572ca7296a6…`, tip
    `5350a15e378a…`)
  - `scripts/policies/competent-courtship-b.js` — (panel
    `2f067a525782…`, tip `09329adc2b62…`)
  - `scripts/policies/competent.js` — (panel `74a890f0844e…`, tip
    `df9b7dff4de4…`)
  - `index.html` — batch-ship version bump (panel `181b87b0047d…`,
    tip `a9c532772deb…`)

  Observer and contract digests still match the r211 panel. The
  staleness is the source manifest only. NOTE: the coordinator's
  7-file list (build.js, feastBuff.js, game.js, havenGrowth.js,
  storage.js, villager-build.js, index.html) was measured against the
  Oct 29 01ab3e346 panel; against the CURRENT r211 panel the movers
  are the 14 above, and feastBuff.js / havenGrowth.js / storage.js /
  villager-build.js have NOT moved since r211.
- `B.manifest('.')` vs the retained b20 panel's `sources`
  (`evidence/2026-11-15/neutral-proofrefresh-b20.json.gz`): tip 532
  keys, panel 529 keys — 3 new policy files (competent-courtship-b,
  competent-covenant-b, competent-successorcaution-b) + **16 keys
  differ** (adds alienPlayers.js, convo-mood.js, sigW3c.js to the
  r211 list). Vs the b19 panel: same 3 new policy files + 16 differ.
  Vs the b18 panel: 6 new policy files + 17 differ (adds
  betrayal.js). Vs b13 and b12 panels: 6 new policy files + 17 differ
  each. Observer and contract digests match all five.
- Stale-input negatives verified on this tip (validate() FAILS with
  "Proof source inputs are not current" on all six): r211, b20, b19,
  b18, b13, b12. The brief's r211/b20 negatives hold, and so do
  b19/b18/b13/b12.
- Cache-flags anomaly in the owed-check: `test-measurement-cache-
  flags.js` scored **0/4** on this tip (all four legs FAIL), where
  round 20 scored 4/4 on a quiet box. Discriminating probe, same tip,
  same hour: a single 1-day zero-policy panel build via the real CLI
  completes fine (exit 0, 1 case) but takes **58.7s wall for ~3.9s
  CPU** — over the test's 30s spawn timeout. Box load average was
  5.30 at the time (sibling loops running in other trees). This is the
  2026-11-12 load artifact, not a code failure: no panel/cache code
  changed in this arm (only evidence + test files committed so far;
  the base did not touch balance-panel.js or the cache logic). Leg (c)
  is re-run at closeout on a quiet box; if the box is still loaded it
  is judged by the A/B (same-tip quiet-box rerun), per the prereg.
- Pre-regeneration `test-gateproof-a.js`: exit 1, legs (a) FAIL
  ENOENT, proof-update FAIL exit 1, workflow 8/9, cache-flags 0/4,
  ontology ok — then crashes at leg (d) with ENOENT —
  `evidence/2026-11-17/neutral-gateproof-a.json.gz` does not exist yet
  (the panel has not been generated or re-pointed).
- `validate-ontology.js` standalone: exit 0, "All 138 systems
  validated", ONTOLOGY.md 2198 lines.
- **Verdict of the owed-check: OWED.** Panels at r211 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel (filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-gateproof-a-panel --n 1`
- (PENDING: timing, cases, sha, sourceHeadStart/End, staleness counts,
  neutrality reproduction, row movement vs r211 panel.)
- Copy the regenerated panel to
  `evidence/2026-11-17/neutral-gateproof-a.json.gz` (NEW file — do NOT
  overwrite r211/b20/b19/b18), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-17/neutral-gateproof-a.json.gz` — exit 0 expected.
  No hand-edited hashes; re-point to the NEW panel only.

## Telemetry

- `scripts/telemetry-check.js` cannot parse retained `.gz` panels
  (same limitation b11/b12/b13/b19/b20 recorded) — record that, no
  lever played so no deviation to check; the neutrality reproduction
  (leg d) is the instrument check. Baseline NOT rolled.
