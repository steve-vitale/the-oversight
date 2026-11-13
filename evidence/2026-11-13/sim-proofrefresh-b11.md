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

[TO BE COMPLETED: regen command, log, wall time, sha256, sourcesStable,
observer/contract digest match, staleness 0 keys on tip.]

## Panel's own wall rows (scale-wall numbers, as the panel carries them)

[TO BE COMPLETED: 64 rows, 150d — national / wins / entered / table /
wave-5 / wave-4 / median survival / end reasons / vests / per-policy.]

## Master move (during the run)

[TO BE COMPLETED: re-read master at rebase/regen time; if it moved onto
a manifest file, rebase onto the explicit new SHA and regenerate once
on the new tip per the prereg master-move rule.]

## Host write flap

[TO BE COMPLETED: probe results, any episode, ONTOLOGY.md line count.]

## Pre-regeneration verification

Measured on the branch tip before any regeneration:

- `test-measurement-proof-update.js`: FAILS, exit 1, "Proof source
  inputs are not current" — the expected stale state; the exact
  stale-key list is the 18 keys above.
- `scripts/test-proofrefresh-b11.js`: [TO BE COMPLETED — expected to
  fail pre-regen on the missing new panel leg.]
- `test-measurement-workflow.js` standalone: [TO BE COMPLETED]
- `validate-ontology.js` standalone: [TO BE COMPLETED]

## Proof update

[TO BE COMPLETED: copy regenerated panel to
`evidence/2026-11-12/neutral-proofrefresh-b11.json.gz` (new file — the
b10/b9/b8 panels are NOT overwritten), then `node
scripts/balance-proof-update.js
evidence/2026-11-12/neutral-proofrefresh-b11.json.gz` (exit 0;
`scripts/balance-proof.json` re-points at the new panel only).]

## GO legs (judged only on the final tip)

- (a) `test-measurement-proof-update.js` exits 0.
- (b) `test-measurement-workflow.js` is 9/9.
- (c) `test-measurement-cache-flags.js` is 4/4 (prereg-adjudicated load
  artifact: if it fails only on spawn timeout, replicate all four legs
  manually with generous time; a manual 4/4 stands, recorded as such.
  Do NOT change the 30s cap).
- (d) Neutrality reproduction vs the b10 panel (match on every proof case,
  warnings 0, tuple identical; b9 panel as second reference).
- (e) `scripts/test-proofrefresh-b11.js` 12/12 (including the stale-input
  negative checks — the retained b10 panel and the b9 panel must FAIL
  `validate()` on the new tip).
- (f) `scripts/validate-ontology.js` exits 0.

## Verdict

[TO BE COMPLETED]

## Metric review

[TO BE COMPLETED]

## Commits (branch sim-proofrefresh-b11, base 340c6679a)

- [prereg commit]
- [proof test commit]
- [pending] — fresh real neutral panel (REGENERATED on <tip>) +
  proof re-point + evidence
