# sim-pantrymealword-a — stranded-night "no pantry meal" wording vs remote requisition

Worker: sim-pantrymealword-a (Loop A, food-economy / narration).
Run: fleshout-20261105T0515Z. Branch: sim-pantrymealword-a.
Instrument: scripts/pantrymealword-trace-a.js (census driver, reuses the
strandnarr recorder + policy stack) + scripts/analyze-pantrymealword-a.js
(before/after census + transcript diff). Proof:
scripts/test-pantrymealword-a.js (classifiers + targeted villageMeal
probes — an instrument, not a policy claim).

Canon read first: docs/CANON.md, then docs/PRESERVATION.md. PRESERVATION
covers the food ladder (cleaned→cooked→smoked→rendered→pemmican); it does
NOT cover pantry requisition or stranded-night narration, and no other
canon doc does either — so this run invents no canon. The governing text
is the code-canon: game.js havenStoresAccess ("'remote' (Full
Integration: the System manifests the manifest — requisition from
anywhere, the aliens' logistics)") and the app.js STORES GATE ("the
pantry and village stash are physical — inside the hall, or via the
System at Full Integration"). The fix follows that text, not a new rule.

## PRE-REGISTRATION (written BEFORE any game-code change)

Assignment (findings backlog 2026-11-05, food-economy/narration): the
line 'You camp wild tonight — no pantry meal. Eat from your pack.'
(game.js villageMeal, camp-wild branch) fires on stranded nights while
morning remote pantry requisition (havenStoresAccess='remote') still
feeds the scholar — the wording claims no pantry meal where a pantry
meal arrives by requisition. Prior run (sim-strandnarr-a): the line on
10/11 stranded nights; 8 stranded mornings drew 13,771 kcal under
'remote', 0 under 'none'. WORDING fix only: no win prices, no deed
gates, no readyDemand, no food-economy numbers, no policy defaults.

- Primary metric: stranded nights carrying a FALSE no-meal claim =
  nights the OLD line fires AND the following morning's upkeep shows
  havenStoresAccess='remote' with a pantry kcal gain > 0 (pantryDelta
  < 0 across that morning's upkeep window, i.e. the scholar drew from
  the pantry; the prior arm's remote-draw definition, reused verbatim).
- Baseline first: reproduce on current master with a stranded-night
  census (pilot 8 seeds). Seed band: the strandnarr pilot band
  (17021, 15003, 15009, 15091, 15211, 15215, 15220, 15221) — the
  screened band that yielded the 10/11 finding — documented here as
  the equivalent screened band (the task's 17001–17024 band is the
  strand-screened pool this pilot was drawn from; 17021 sits in it,
  and the other seven are the bankfood woodshort-qualifier band that
  produced the stranded events).
- GO threshold: after the fix, 0 false-claim nights on the pilot
  band; every stranded night still carries an honest stranded-night
  line (silence is NOT a fix — bedding/sleep lines are separate); and
  the honest no-meal wording still fires when access is genuinely
  'none' (at least one 'none' case — organic if the census yields
  one, otherwise the targeted villageMeal probe in
  scripts/test-pantrymealword-a.js, documented as an instrument,
  not a policy claim).
- Horizon: stranded-night census, death-aware (dead villages stop,
  +10d tail max), never a fixed 200d. In practice: 60 loop-days cap,
  the strandnarr horizon (the anchor sits at loop-days 51–53).
- Policy: competent-player policy, bankfood(warmed(woodcarry(
  nighttravel))) variant leg, WOODWARM=0, env gates
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 BANKFOOD=1 STRANDNARR=1 — identical
  to the strandnarr census, so baseline and after are comparable.
- Before/after on identical seeds: corpus comparison must show ONLY
  the intended wording change on stranded nights (no other
  transcript drift). The before/after transcript diff is the
  determinism proof: every differing line must be a camp-wild line
  substitution on a remote stranded night.
- Balanced-panel position (see "metric review"): a wording-only
  change must not move behavior. scripts/balance-panel.js measures
  behavior across policies/seeds; running a full panel for a
  one-line say change would measure nothing (the branch moves no
  kcal, no state, no RNG — proven by the transcript diff being
  wording-only plus the probe asserting kcal/state identity). Panel
  therefore N/A with cause stated, not skipped silently: the
  transcript diff IS the neutrality proof for this change class.
- Metric binding: a miss is NO-GO, never re-scored against a
  friendlier metric mid-run. If a metric proves wrong, it goes under
  "metric review" with a revision proposed for the NEXT run.

## Fix (wording only)

In villageMeal's camp-wild branch (`!pantryInReach()`), branch on
havenStoresAccess():

- access 'remote' → 'You camp wild tonight — no hall meal, but the
  pantry still reaches you through System requisition. Eat from your
  pack tonight.' Honest on every clause: no meal is served at the
  hall fire (true — villageMeal draws nothing here); the pantry is
  not closed to the scholar (true — Full Integration manifests it,
  and the ◈ Pantry requisition is available from anywhere); tonight
  the scholar eats from the pack (true — requisition is a morning
  action, not an automatic night meal). The line promises no
  automatic meal.
- access anything else ('none' in practice away from haven —
  'inside' is impossible here, since it requires standing on the
  haven tile, which pantryInReach already excluded) → the old line
  verbatim: 'You camp wild tonight — no pantry meal. Eat from your
  pack.'
- No kcal, no state, no RNG, no gate moves. The branch still sets
  lastPlayerMeal = 0 and returns null on both legs.

## Baseline census (BEFORE — current master, no src change)

(TBD — filled after the baseline run; judged against the prereg above.)

## After census (AFTER — fix applied, identical seeds)

(TBD — filled after the after run + transcript diff.)

## GO / NO-GO verdict

(TBD.)

## Metric review

(TBD — includes the balanced-panel neutrality position stated in the
prereg, confirmed or corrected by the diff.)

## Runs, files, commits

- Census driver: scripts/pantrymealword-trace-a.js
  (TAG=before|after, OUTDIR under evidence/2026-11-04/).
- Analyzer: scripts/analyze-pantrymealword-a.js
- Proof: scripts/test-pantrymealword-a.js
- Corpus: evidence/2026-11-04/sim-pantrymealword-a-corpus-before/ and
  evidence/2026-11-04/sim-pantrymealword-a-corpus-after/
- Commit: (TBD — [needs-eyes], wording the player reads.)

## Backlog items for the coordinator

(TBD.)
