# sim-proofrefresh-b11 — measurement proof regenerated (round 11)

## Prereg

- **Run:** fleshout-loop-b-20261113T2030Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b11 (tracker blank #2:
  "proof refresh round 11 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 10 landed 2026-11-13 0530Z
  (commit 7b0abd464, panel regen5c on dc95859a8); round 11 follows the
  proven round-10 pattern exactly (regen + re-point + 6 GO legs).
- **Base SHA:** `340c6679a` (read in the main tree immediately before
  the panel run; culpritbisect round 12 s04 tip). Branch rebased clean
  onto explicit master `89b9030f9` (sim-mirrorcap-geared evidence)
  before the panel run — the move `340c6679a` → `89b9030f9` touches NO
  manifest file (only evidence + 2 journey-scale r195 driver scripts),
  so the 18-key staleness measured on `340c6679a` carries unchanged to
  the rebase tip and the regenerated panel is current on it.
- **Primary metric:** `node scripts/godpath/test-measurement-proof-update.js`
  pass/fail on the tip. GO = exit 0, all legs pass.
- **Panel spec:** seeds [7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9],
  policies [capable, risk-aware, socialite, winseek], days 150, origin
  Columbus, Ohio — via `scripts/balance-panel.js` (64 rows).
- **Horizon:** N/A (infrastructure — the panel carries its own 150d spec).
- **GO bar (pre-registered):** (a) test-measurement-proof-update 9/9
  exit 0 on the rebased tip; (b) measurement-workflow 9/9; (c)
  cache-flags 4/4 outright (2026-11-12 load-artifact lesson: if it
  fails under load, run the discriminating A/B on a quiet box before
  blaming the change); (d) neutrality reproduces the prior panel on
  every proof case, warnings 0; (e) test-proofrefresh-b11.js 12/12
  incl. stale-input negatives (prior panels fail validate on the new
  tip); (f) ontology exit 0. Any leg miss = NO-GO, no re-scoring.

## Owed-check (pre-registered decision, run before the panel)

- Before: `node scripts/godpath/test-measurement-proof-update.js` FAILS on
  340c6679a with `Error: Proof source inputs are not current`
  (`scripts/balance-proof-update.js:8`), exit 1 — confirmed in the main
  tree before the panel run, matching the coordinator's baseline.
- `B.manifest('.')` vs the retained b10 panel's `sources`
  (`evidence/2026-11-12/neutral-proofrefresh-b10.json.gz`, sha256
  `3f974193335fbbbf3b35bcd3b86989b5a4ae72f67f09802713aef4413ab7f926`):
  exactly **18 manifest keys differ** (of 526 total on the tip; 526 in
  the b10 panel):

  - `src/js/abilityActions.js` — sim-steeple-a (6daaafae4): rage +
    steeple narration dedup
  - `src/js/build.js` — batch ship version bumps (de4a749d0, a1288c5c4)
  - `src/js/conversation.js` — journey crisis r192 (27ce36ecd) +
    journey-establishment r85 (9893267d9) + journey-scale r134 (1decd5bee)
  - `src/js/convo-beats.js` — journey-scale r134 (1decd5bee)
  - `src/js/convo-dialogue.js` — journey crisis r192 (27ce36ecd)
  - `src/js/game.js` — sim-strikefall-a (12d263736) +
    sim-combatdedup-b (873a8b7a7) + journey crisis r192 (27ce36ecd)
  - `src/js/sigW4.js` — sim-steeple-a (6daaafae4)
  - `src/js/statusEffects.js` — sim-applystatus-a (c0fc52cfd)
  - `src/js/truth.js` — journey crisis r192 (27ce36ecd)
  - `src/js/villageAgency.js` — sim-namelessadm-b (6c4a95602)
  - `src/js/villager-agency.js` — journey succession r193 (1f257d01f) +
    journey-establishment r135 (a717031ce)
  - `scripts/policies/capable.js` — journey endgame r194 (7fa48db5b)
  - `scripts/policies/deed-seeking.js` — journey endgame r194 (7fa48db5b)
  - `scripts/policies/feastscale.js` — journey endgame r194 (7fa48db5b)
  - `scripts/policies/leadcourt.js` — journey endgame r194 (7fa48db5b)
  - `scripts/policies/risk-aware.js` — journey endgame r194 (7fa48db5b)
  - `scripts/policies/scalecourt.js` — journey endgame r194 (7fa48db5b)
  - `index.html` — batch ship version bumps (de4a749d0, a1288c5c4)

  Observer and contract digests still match (verified below); the
  staleness is purely the source manifest. **Verdict of the owed-check:
  OWED.** Panels at b10 and earlier are superseded; the re-point
  target is the NEW panel only.

## Panel

- Command: `node scripts/balance-panel.js --out .proofrefresh-b11-panel --n 16 --days 150`
- Log `.proofrefresh-b11-panel-regen.log`: `Saved .proofrefresh-b11-panel;
  64 cases, 0 cached jobs. PANEL_EXIT=0`. Started 20:44:24Z, finished
  21:19:28Z, ~35 min wall, 68 dots, no flap kill, no resume needed.
- The `cases/` cache in `.proofrefresh-b11-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- `sourceHeadStart == sourceHeadEnd == ae3d6531c` (prereg/proof-test
  commit, on explicit master 89b9030f9).
- Panel sha256
  `2da0e215acb37614a3aced8bc7c4e479cde72edad30a26cd3a0e922ba4e77b1e`.
- Verification (read-only): the generated panel's `sources` vs the
  branch-tip manifest: **0 keys differ**;
  `validity.sourcesStable` true; 64 rows; neutrality 4/4 match, warnings
  0, tuple identical to the b10 panel AND the b9 panel (regeneration moved
  no verdict). Observer/contract digests match the tip and the b10/b9
  panels. 0 rows with warnings/observer/gear problems (read on the OUTER
  panel rows).
- Staleness on the tip (measured, `B.manifest` vs panel `sources`, 526
  keys): **b11-new 0 stale**; **b10 18 stale**; **b9 25 stale**.
  Before/after: the refresh takes the proof from 18 stale keys (b10)
  to 0 (b11-new) on this tip.

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

64 rows, 150d, 16 seeds × 4 policies (regenerated panel, tip 89b9030f9):

- national 13/64, wins 16/64, entered 16/64 — all 16 wins from the
  capable policy (16/16 capable rows won; risk-aware, socialite, winseek
  0/16 each).
- `row.table` 56/64 — the table field as the panel carries it tracks
  Arc-IV reach (maxArc IV is also 56/64); it is NOT the entered/won count
  (entered 16/64 is the like-for-like number against b10's 16/64).
  maxRank: global 13, regional 44, village 7.
- Wave reach: 6/64 reached wave 5, 63/64 reached wave 4 (the single
  miss: winseek seed 42, village-lost at d30 on wave 3 — same seed/row as
  b8, b9, and b10).
- Max Arc: 56/64 Arc IV, 8/64 Arc III.
- Median survival 90 game-days, max 150.
- End reasons: village-lost 47, over-other 16, survived 1.
- Vests 25 total; vestsVillager 41.
- Per-policy median days: capable 90, risk-aware 106, socialite 88,
  winseek 74.
- Per-policy wave-5 reach: capable 2, risk-aware 3, socialite 1,
  winseek 0.
- Per-policy vests: capable 1, risk-aware 7, socialite 9, winseek 8.

Against b10's rows (same spec; the game-code changes between are the
r192/r194/r195 journey landings, the steeple/strikefall/combatdedup/
applystatus narration dedups, nameless-admission fix, and two version
bumps): won 16→16, entered 16→16, national 15→13, table 56→56, wave-5
13→6, wave-4 63→63, median 90→90, vests 26→25, vestsVillager 43→41,
survived 1→1, village-lost 47→47. Row-by-row, **27 of 64 rows differ**
between the b10 panel and this regenerated panel (days, waveReach, end
reasons). The wave-5 move is concentrated: capable wave-5 6→2 and
socialite 4→1 — five capable rows that reached wave 5 in b10 now win at
wave 4 instead (capable/4, /7, /9, /99, /2026; capable/1234 is the one
row that moved the other way, wave 4→5), and three socialite rows that
reached wave 5 now end at wave 4 with shorter runs (socialite/2 d97→d46,
socialite/3 d134→d96, socialite/9 d121→d122). 14 of the 16 capable wins
now happen WITHOUT reaching wave 5 — wins through the table/bundle path
at wave 4, not the wave-5 finale — and 3 capable wins happen without
national standing (seeds 2, 5, 42; b10 had 1, seed 7, which now wins
WITH national). These are the instrument's own rows on the new tip,
reported as carried, not a balance verdict (this arm re-proves the
instrument; no lever was played, and no compare run was done). The
national step stays the binding constraint on the win rows that lack
it, and wave-5 facing is now rarer than in b10 even among winners —
both filed here for the winnability chain, not chased.

## Master move (during the run)

Master moved DURING the panel run: `git rev-parse master` in the main
tree reads `5c2a5866f` at 21:08Z (was 89b9030f9 at panel start). The move
is a single commit (journey-scale r195 adoption addendum, coordinator
evidence + run-note merge line) touching exactly TWO files, both
evidence files — NO manifest file. The regenerated panel (base
89b9030f9) is therefore current on the new tip too: the tip manifest
is identical, 0 stale keys either way. At closeout the branch is
rebased onto the explicit new SHA 5c2a5866f (evidence-only move, no
manifest change, panel validity unaffected) and leg (a) re-verified
before the coordinator's `--ff-only` merge.

## Host write flap

- CLEAR the whole run. Probe `git update-ref refs/heads/probe HEAD`
  passes at run start (20:4xZ, ref deleted after). No EPERM anywhere:
  the 35-minute panel regeneration wrote clean throughout
  (20:44–21:19Z, 68 dots). `docs/ONTOLOGY.md` intact at 2198 lines,
  no diff vs HEAD after the ontology leg — the 2026-11-12 truncation
  mode did not recur. Flap-watch log not re-checked (no symptom); the
  run's own writes are the evidence.

## Pre-regeneration verification

Measured on the branch tip ae3d6531c before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact stale-key
  list is the 18 keys above.
- `scripts/test-proofrefresh-b11.js`: crashes at leg (d) with ENOENT —
  `evidence/2026-11-12/neutral-proofrefresh-b11.json.gz` does not exist
  yet (the panel has not been copied into evidence/ or re-pointed; that
  happens on the regenerated panel). Legs before the crash: validate
  FAIL (ENOENT on the new panel), proof-update FAIL exit 1.
- `test-measurement-workflow.js` standalone: **8 passed, 1 failed** —
  the failing leg is exactly "retained neutrality proof covers the
  current Game/controller/harness inputs" (the staleness failure; the
  same leg the b10 adoption recorded as 8/9 on its stale landing tip).
  All other legs pass.
- `validate-ontology.js` standalone: exit 0, "All 138 systems validated",
  ONTOLOGY.md 2198 lines, no diff vs HEAD.

## Proof update

Copied the regenerated panel to
`evidence/2026-11-12/neutral-proofrefresh-b11.json.gz` (new file — the
b10/b9/b8 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-12/neutral-proofrefresh-b11.json.gz` — exit 0;
`scripts/balance-proof.json` re-points at the new panel only
(panelDigest `2da0e215…`). No hand-edited hashes; no re-point to an
old panel.

## GO legs (judged only on the final tip)

- (a) `test-measurement-proof-update.js`: exit 0, 9 passed.
- (b) `test-measurement-workflow.js`: 9/9.
- (c) `test-measurement-cache-flags.js`: 4/4 — passed OUTRIGHT this
  time; the spawn-timeout load artifact did not bite, so no manual
  replication was needed. The 30s cap is unchanged.
- (d) Neutrality reproduction: match on every proof case, warnings 0,
  tuple identical to the b10 panel AND the b9 panel — regeneration
  moved no verdict. (Covered by proof-test legs 6, 8, 9.)
- (e) `scripts/test-proofrefresh-b11.js`: 12/12 — including the
  stale-input negative checks: the retained b10 panel AND the b9 panel
  FAIL `validate()` on the new tip with "Proof source inputs are not
  current", proving the green result is not vacuous. (One fix during
  the run: the proof test's leg labels still said "(b9)"/"(b8)" from
  the b10 original after the sed — labels corrected to "(b10)"/"(b9)",
  checks unchanged, re-run still 12/12.)
- (f) `scripts/validate-ontology.js`: exit 0, "All 138 systems
  validated". ONTOLOGY.md re-verified 2198 lines after the run, no
  diff vs HEAD — the validator's rewrite landed clean; the 2026-11-12
  truncation mode did not recur.
- A miss on any leg would have been NO-GO; none missed. Judged only
  against the prereg, never re-scored.
- Telemetry deviation check: `scripts/telemetry-check.js` cannot parse
  the retained `.gz` panel ("Unexpected token" — it expects per-seed
  JSON evidence, not a panel archive), the same limitation the b10
  adoption recorded. No lever was played, so there is no before/after
  deviation to check; the neutrality reproduction (leg d) is the
  instrument check that stands in its place. No LOUD line to
  investigate. Baseline NOT rolled.

## Verdict

**GO.** The measurement proof is refreshed on the tip: the new panel
is current (0 stale keys), every prereg GO leg passes, and the proof
re-points at the new panel only. Commit: fresh real neutral panel
(`evidence/2026-11-12/neutral-proofrefresh-b11.json.gz`) + proof
re-point (`scripts/balance-proof.json`) + this evidence file, on branch
`sim-proofrefresh-b11`. Ready for the coordinator's `--ff-only` merge
("merged locally, pending ship" is the coordinator's call — this worker
does not push, bump, or verify live).

Round 12 (stretch goal) NOT attempted: round 11 closed at ~21:25Z and
the next Loop B run is 22:30Z — a second ~35 min panel plus legs would
overrun the window and strand mid-flight, the same call round 10 made
for its conditional arm. Round 12 stays owed for the next B run.

## Metric review

- The primary metric judged what it claimed: the proof test failed on
  the stale tip with exactly the expected manifest-mismatch error (18
  keys, named) and passes on the refreshed tip with 0 stale keys; the
  stale-input negative checks (b10 and b9 both fail validate on the new
  tip) prove the green result is not vacuous. No re-scoring at any point.
- The cache-flags leg passed outright this run (4/4, no spawn timeout),
  so the prereg (c) manual-replication branch was not needed. The 30s
  cap stays untouched. The load artifact remains a known hazard for
  future runs on loaded boxes, not a finding about this arm.
- The neutrality reproduction (leg d) held exactly: regeneration moved
  no verdict vs b10 or b9, even though 27/64 rows differ on days/waves
  and wave-5 reach fell 13→6 — the observer-neutrality proof is
  insensitive to the row movement, as designed. The row movement itself
  (14/16 capable wins now at wave 4 without facing wave 5; national
  15→13 with 3 wins lacking national) is a scale-wall observation, not
  a defect in the instrument: wins are increasingly coming through the
  table/bundle path before the wave-5 finale, and the standing ladder's
  national step is the binding constraint on the rows that lack it.
  Filed here for the winnability chain, not chased — this arm's scope
  is the instrument.
- The ontology validator's unconditional regeneration write of
  `docs/ONTOLOGY.md` (filed in the b10 review) did not bite this run —
  the flap stayed clear and the file verified 2198 lines after. The
  fragility stands as filed: the validator should write atomically or
  skip the rewrite when the table is unchanged. Still a tooling-arm
  item, not this refresh.
- The safe-commit index clobber struck the prereg commit (files
  staged-as-deleted + untracked after a correct commit ae3d6531c) —
  repaired with the ls-tree -r pipe per the repo lesson, verified
  `git status --short` empty + `git diff HEAD` empty before the panel
  run. No work lost.
- No metric revision proposed for the next run. The prereg held.

## Commits (branch sim-proofrefresh-b11, base 89b9030f9)

- ae3d6531c — prereg + proof test (12 legs modeled on b10)
- [pending] — fresh real neutral panel (REGENERATED on 89b9030f9) +
  proof re-point + evidence
