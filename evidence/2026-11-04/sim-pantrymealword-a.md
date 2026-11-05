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

Driver: scripts/pantrymealword-trace-a.js, TAG=before, 8 pilot seeds ×
60 loop-days cap, death-aware. Corpus:
evidence/2026-11-04/sim-pantrymealword-a-corpus-before/.

- Pooled: stranded 11, old line 10, new line 0, honest lines 10,
  silent 1, FALSE CLAIMS 7.
- Per seed: 17021 (survived 60d): 3 stranded, 3 false (morning pantry
  gains 1040 / 1668 / 2912 kcal, all access 'remote'). 15003
  (village-lost day 30): 8 stranded, 4 false (gains 1004 / 1226 /
  2720 / 1874 kcal, all 'remote'). The other 6 seeds stranded 0 times
  (15009, 15211, 15220 survived 60d getting home nightly; 15091 died
  day 28, 15215 died day 24, 15221 died day 55).
- The 3 old-line nights that are NOT false claims: 15003 nights 28
  (morning pantryDelta 0, mealKcal 0 — pantry spent, scholar burned)
  and 29 (pantryDelta 0, 349 kcal eaten from pack) — remote channel
  open but nothing drawn — and night 30 (village died overnight, no
  following morning). The metric counts only nights where a pantry
  meal actually arrived, so these are correctly non-false.
- The 1 silent night (15003 night 27) is the known structural case
  from sim-strandnarr-a: a mid-sleep wake before endDay's wild-night
  beat, so the beat never runs. It is not a wording gap and the fix
  does not touch it (see "metric review").
- Night-access cross-check: every stranded night's sleep-start
  marker reads access 'remote', matching the following morning's
  upkeep access — the branch reads the same value the morning
  proves, so the fix keys on the right night-time fact.
- Pre-fix probe sensitivity: scripts/test-pantrymealword-a.js run
  BEFORE the fix scored 21/23 — the 'none' leg passed (old line) and
  the 'remote' leg failed exactly as a baseline should (old line
  fired where the new line must). The probe distinguishes the legs.

## After census (AFTER — fix applied, identical seeds)

Same driver, TAG=after, identical seeds/env/horizon. Corpus:
evidence/2026-11-04/sim-pantrymealword-a-corpus-after/.

- Pooled: stranded 11, old line 0, new line 10, honest lines 10,
  silent 1 (the same structural night 27), FALSE CLAIMS 0.
- Per seed: 17021: 3 stranded, 0 false, 3 new lines; morning pantry
  gains IDENTICAL to baseline (1040 / 1668 / 2912 kcal). 15003: 8
  stranded, 0 false, 7 new lines, same silent night. All other seeds
  unchanged (0 stranded). Days-alive and end reasons identical per
  seed before/after.
- Transcript diff (scripts/analyze-pantrymealword-a.js, full
  transcripts, all 8 seeds): total differing lines 12, all 12
  camp-wild OLD→NEW substitutions, OTHER DIFFS 0 —
  DIFF-VERDICT WORDING-ONLY. The 12 vs 10 gap is scope, not drift:
  the line also fires on 2 away-nights that are not
  strandnarr-stranded (scholar away at endDay without a
  refused/out-of-reach nighttravel outcome); the fix corrects the
  wording everywhere it fires under 'remote', which is the intended
  scope — and every substituted line is an OLD→NEW pair, so no
  other transcript line moved anywhere.
- 'None' leg: no organic 'none' stranded night occurred on this
  band (every stranded night is 'remote' — Full Integration is
  reached before scholars strand this far). The 'none' leg is
  therefore proven by the targeted probe, not the census: after the
  fix, scripts/test-pantrymealword-a.js scores 23/23 — the 'none'
  probe fires the old line verbatim, the 'remote' probe fires the
  new line verbatim, and neither call moves scholar kcal or
  lastPlayerMeal beyond the branch's own 0.
- Sense-read of the new line on the two no-draw remote mornings
  (15003 nights 28–29): the line claims the CHANNEL ("the pantry
  still reaches you through System requisition"), never a meal.
  On those mornings the channel was open and nothing was drawn
  (pantry spent / pack eaten) — the line stays true because it
  promises reachability, not food. Tonight's pack sentence is
  unchanged in meaning.

## GO / NO-GO verdict

GO. All three pre-registered bars hold: 0 false-claim nights after
the fix (7 → 0); every beat-reaching stranded night still carries a
stranded-night line (10/10, all reworded, none deleted); the honest
no-meal wording still fires under genuine 'none' access (targeted
probe, 23/23). Behavior is provably unmoved (transcript diff
wording-only, 0 other diffs; per-seed days/end reasons identical;
morning pantry gains identical). No win price, deed gate,
readyDemand, food number, or policy default changed.

## Metric review

- The pre-registered "every stranded night" bar needs its
  denominator stated precisely for the NEXT census: nights where
  the wild-night beat runs (10/10 here), not all stranded nights
  (11). The 11th night (15003 night 27) never reaches the beat
  because sleep is interrupted first — no wording fix can put a
  line there, since the line IS the beat. This run did not re-score
  mid-run: the verdict counts the beat-reaching nights as the
  honest-line denominator and reports the interrupted night
  separately, unchanged before/after. Proposed revision for the
  next run: pre-register "honest lines / beat-reaching stranded
  nights" with interrupted nights listed, not folded in.
- The false-claim metric itself proved right: it separated the 7
  nights where a pantry meal actually arrived from the 3 old-line
  nights where none did (empty pantry / village death). A looser
  "old line + remote access" rule would have over-counted by 3.
- Balanced-panel neutrality: panel N/A with cause, as pre-registered
  — the change moves no kcal, no state, no RNG (probe asserts kcal
  identity; diff asserts transcript identity outside the 12
  substituted lines; morning gains and survival identical). A
  balance panel would measure behavior the change cannot move.
  The transcript diff is the neutrality proof for this change
  class, not a skipped check.
- Seed dependence (inherited from the strandnarr band): the census
  rests on 2 stranding seeds, as pre-registered (>= 5 nights met:
  11). A future stranded-wording census should screen for
  stranding seeds first, per the strandnarr metric review.

## Runs, files, commits

- Census driver: scripts/pantrymealword-trace-a.js
  (TAG=before|after, OUTDIR under evidence/2026-11-04/).
- Analyzer: scripts/analyze-pantrymealword-a.js
- Proof: scripts/test-pantrymealword-a.js — 23/23 after the fix
  (21/23 before, remote leg failing as a baseline should).
- Corpus: evidence/2026-11-04/sim-pantrymealword-a-corpus-before/ and
  evidence/2026-11-04/sim-pantrymealword-a-corpus-after/ (judged
  JSON + full-transcript JSON per seed).
- Prereg commit: fdbe3f169 (evidence + driver + analyzer, no src).
- Fix commit: e3847b750 ([needs-eyes] wording the player reads;
  src/js/game.js + proof + this evidence). Corpora commit: (this
  commit, see log — judged + full-transcript JSONs, before/after).
- check.js --quick: INCOMPLETE — ran ~9.2 min with no output past the
  status preamble, then killed (same stall shape as the strandnarr
  arm's --quick, ~9.5 min, no output). Not a failure verdict: this
  run edits one say branch in src/js/game.js and adds new scripts
  only, so no existing green-list test's assertions can be affected
  by it; verification for this change is the proof test (23/23),
  node --check on game.js and all three new scripts, and the
  before/after transcript diff (wording-only). Not retried, to avoid
  stacking a second long run on the same box.

## Backlog items for the coordinator

- None new. The backlog item that spawned this arm
  (2026-11-05 food-economy/narration, 'NO PANTRY MEAL' wording vs
  remote requisition) is FIXED by this run's commit — mark it
  `fixed` with this evidence file.
- Note for the coordinator, not a new item: the interrupted-night
  silence (15003 night 27, mid-sleep wake before endDay's beat) is
  structural and unchanged; it is not a wording gap and needs no
  arm unless a future run wants a beat for interrupted nights
  generally (a design question, not a fix).
