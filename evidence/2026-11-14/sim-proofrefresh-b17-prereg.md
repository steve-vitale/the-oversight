# sim-proofrefresh-b17 — prereg (measurement proof regeneration, round 17)

## Run

- **Run:** fleshout-loop-b-20261114T1430Z, axis winnability chain —
  measurement hygiene, arm sim-proofrefresh-b17 (tracker blank #2:
  "proof refresh round 17 on the next manifest change (regenerate +
  re-point, do not hand-edit)"). Round 16 was GO 12/12 on its panel tip
  a8562fc68 (panel 49fbcf95, merged; addendum re-verified GO on final
  tip 28a5cacaf). Round 17 is owed NOW: journey-landing r132 +
  journey-crisis r201 changed `src/js/conversation.js`, re-staling the
  b16 panel by 1 manifest key. Round 17 follows the proven
  round-11/12/13/14/15/16 pattern exactly (regen + re-point + 6 GO
  legs), on the current tip. Full prereg committed first:
  `evidence/2026-11-14/sim-proofrefresh-b17-prereg.md`.
- **Base SHA:** `792f4570d` (sim-transplant15f-picks16-a; local master
  at worktree registration, ahead of origin/master 16f05da86 which is
  an ancestor — the local merges since the last batch ship are not yet
  pushed; ship loop owns pushes). The branch was fast-forwarded from
  its registration tip 8491b132b to 792f4570d before this prereg (pure
  fast-forward, branch tip already in master). If master moves during
  the run, rebase onto the explicit master SHA at closeout and
  re-verify leg (a) on the rebased tip; the panel stays valid only if
  the move touches NO manifest file. A version-bump move touches the
  2 version-stamp manifest keys (finding #2316) and would make the
  panel stale on the final tip — in that case do NOT merge a NO-GO;
  report stale-key counts (b16 vs b17) and whether merging still
  improves master; the coordinator decides.
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
  blaming the change — this IS the owed cache-flags quiet-box A/B,
  folded into this arm's legs, not a separate arm); (d) neutrality
  reproduces the prior panel on every proof case, warnings 0; (e)
  test-proofrefresh-b17.js 12/12 incl. stale-input negatives (the
  retained b16 panel AND the b15 panel FAIL validate() on the new
  tip); (f) ontology exit 0. Any leg miss = NO-GO, no re-scoring.

## Owed-check (run before the panel, on base 792f4570d)

- `node scripts/godpath/test-measurement-proof-update.js` FAILS, exit 1,
  "Proof source inputs are not current"
  (`scripts/balance-proof-update.js:8`) — confirmed in the worktree
  before the panel run, matching the coordinator's baseline (coordinator
  verified the same failure on master 4355b9d18; the failure reproduces
  on 792f4570d).
- `B.manifest('.')` vs the retained b16 panel's `sources`
  (`evidence/2026-11-14/neutral-proofrefresh-b16.json.gz`, sha256
  `49fbcf957c7bdd89f07e41677ecb1bffb87e97bb89bf9e3a5be2a94b94d13556`):
  exactly **1 manifest key differs** (of 526 total on the tip; 526 in
  the b16 panel):

  - `src/js/conversation.js` — journey-landing r132 nod-loop fix
    (3bffd4752: repeat nv gesture thins the sitting) + journey-crisis
    r201 favor-want settle gate (f1871e37b)
    (panel `989d6818bcc3…`, tip `7bf28860b363`)

  A real game-code change since the b16 panel (conversation behavior).
  No version-stamp key is stale on this tip. Observer and contract
  digests still match the b16 panel (observer f37e5ce03414…,
  contract 37bbb0fad947…). The staleness is the source manifest only:
  1 real game-code change.
  **Verdict of the owed-check: OWED.** Panels at b16 and earlier are
  superseded; the re-point target is the NEW panel only.

## Panel (to be filled after the run)

- Command: `node scripts/balance-panel.js --out .proofrefresh-b17-panel --n 16 --days 150 --par 4`
- Panel logs written to ~/workspace (NOT /tmp — agent-service restarts
  wipe /tmp; resume from the worktree cases cache if killed).
- The `cases/` cache in `.proofrefresh-b17-panel/` is NOT committed
  (deleted at closeout; the retained .gz is the artifact).
- Copy the regenerated panel to
  `evidence/2026-11-14/neutral-proofrefresh-b17.json.gz` (NEW file — do
  NOT overwrite b16/b15/b14), then `node
  scripts/balance-proof-update.js
  evidence/2026-11-14/neutral-proofrefresh-b17.json.gz` — exit 0.
  No hand-edited hashes; re-point to the NEW panel only.
- Host write flap: a denied window was active at run start (14:43Z:
  validate-ontology.js died EPERM on write; my 127KB gate probe passed
  0/10 while the flap watcher logged ALL-OK — the watcher does NOT see
  the panel's denial bursts, per b15). The window cleared within
  minutes (small + 127KB writes pass again). If the panel dies on
  EPERM, use the b15 gated retry: a 10/10 write-probe gate
  immediately before launch predicts a passing window; resume from the
  worktree cases cache.

## Telemetry

- `scripts/telemetry-check.js` cannot parse the retained .gz panel
  (same limitation b11/b12/b13/b14/b15/b16 recorded) — record that, no
  lever played so no deviation to check; the neutrality reproduction
  (leg d) is the instrument check. Baseline NOT rolled.
