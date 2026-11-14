# sim-fusionoffer-b — prereg (BUILD, findings #2326 + #2327)

Run: fleshout-loop-b-20261114T0730Z (Loop B), arm sim-fusionoffer-b
Axis: winnability chain (findings #2326 + #2327, filed by Loop B arm
sim-retribution-offer-b; see evidence/2026-11-14/sim-retribution-offer-b.md)
Branch: sim-fusionoffer-b — worktree ~/workspace/worktrees/sim-fusionoffer-b
Base: master d3fb7d5fb (one commit behind current master 2de44bad8 — a
playtest-loop landing; do NOT rebase, the coordinator rebases at landing)
Date: 2026-11-14
Anchor commits: prereg commit (before leg) / fix commit (after leg);
the retribution driver refuses any other HEAD via EXPECTED_ANCHOR.

## Findings under fix

#2326 — FUSION OFFER TRAMPLES A PENDING PRIZE SHEET.
`maybeOfferFusionReactor` (src/js/game.js:25883) checks only whether a
fusion_reactor choice is already pending, then overwrites
`s.abilityChoices` wholesale. 2x on the retribution band (190395 day 75:
prize [switcheroo, aegis_link, bird_whisperer] -> fusion [fusion_reactor];
190396 day 91: prize [cornered_rat, bribe, lucky_rock] -> fusion), each
time discarding a 3-choice contest-prize sheet the scholar had not
answered. The existing convention elsewhere is deferral, not overwrite:
`pumpLevelUps` (tracks.js:438) — "a sheet is open: the level-up waits,
never drops" — and `_cxPrizeAbilityOffer` (contests.js:5043) — "don't
trample a pending offer".

#2327 — PRIZE OFFERS FUSION_REACTOR WITH NO PELLET, THEN FIZZLES.
The contest prize bag (`_cxPrizeAbilityOffer`, contests.js:5055)
excludes fusion_reactor only when the world's reactor is already taken
(`fusionReactorHolder`); it offers it regardless of pellet possession.
`abilityOnAcquire('fusion_reactor')` (game.js:25819-25852) then revokes
it when no pellet is found — the offer is a taunt the install dissolves
(seed 190395 day 34: sheet [fusion_reactor, long_table, last_rites]
accepted, sheet cleared, ability not held).

## Design calls (this arm)

- #2326 FIX — defer, don't overwrite: in `maybeOfferFusionReactor`,
  replace the fusion-only pending check with the any-sheet guard
  `if ((s.abilityChoices || []).length) return false;` (same shape as
  pumpLevelUps / _cxPrizeAbilityOffer). Deferral is lossless: the offer
  recurs on the next day-part tick (game.js:28857) and on the next
  pellet arrival (game.js:46758), so no queue state is needed and no
  narration changes — the pending sheet's own lines stand, the fusion
  sysSay fires only when the offer really lands.
- #2327 FIX — gate the prize bag on the same possession condition
  `abilityOnAcquire` uses: in the `_cxPrizeAbilityOffer` bag filter,
  add `&& !(a.id === 'fusion_reactor' && !this.hasFusionPellet())`.
  `hasFusionPellet` (game.js:25865) is the existing pellet-in-pack
  check; the singularity exclusion stays as-is.
- SCOPE CHECK (done before the run): no other player offer path can
  surface fusion_reactor, so these two edits close the defect class.
  `fusion_reactor` is in NO tracks.json kit, so `levelUpOffers`
  (tracks.js:407) can never offer it; the arrival sheet
  (`firstAbilityChoices`, game.js:25351) and the aid-quest reward
  (safetynets.js:632) use fixed small pools that exclude it; villager
  paths already exclude it (villager-build.js:257/295/312).
  `fusion_reactor` data: tier "rare", unlock {type: "system_offer"},
  lane "magic", path "survivalist" — hence in the prize bag's tier
  list (contests.js:5053) but in no kit.

## Fixtures (Steve 2026-11-13: encounter gear, never a fresh un-geared solo scholar)

Staged proof legs use a mid-game scholar: integration 80 (6 slots),
two early-kit abilities held (lucky_rock, green_thumb — the front of
the kit a living scholar actually holds), a machete + bark armor in
the pack (the average gear a player has when contest prizes and
pellets arrive), pellet present/absent per leg. The offer functions
under test do not read party, so the party is staged in the
neutrality leg instead: the 8-seed competent sims run real villages
with real parties. Neutrality leg doubles as the encounter-gear
reality check.

## Primary metric + GO thresholds (per finding, separate proof legs)

- (a) #2326 DEFERRAL: staged — a pending 3-choice prize sheet +
  pellet in pack + `maybeOfferFusionReactor()` call. BEFORE (base):
  returns true and the sheet becomes [fusion_reactor] (defect
  reproduced). AFTER (fix): returns false and the pending sheet is
  byte-identical; a second call after the sheet is answered returns
  true and offers [fusion_reactor] (deferral is not a loss). GO =
  both halves green.
- (b) #2327 PELLET GATE: staged — `_cxPrizeAbilityOffer` draws.
  Deterministic leg (data narrowed to [fusion_reactor, lucky_rock]
  so the draw is forced): WITHOUT pellet the offered sheet is
  [lucky_rock] only; WITH pellet it includes fusion_reactor.
  Statistical leg (full bag, 40 draws): WITHOUT pellet, 0/40 sheets
  contain fusion_reactor. GO = both legs green.
- (c) PROOF TEST GREEN: scripts/test-fusionoffer-b.js, all legs pass
  (RED pre-fix on (a)/(b) legs, GREEN post-fix — the test is written
  against the fixed behaviour and run before the fix to prove RED).
- (d) NEUTRALITY (report leg, not a GO leg unless it moves):
  retribution driver, competent verbatim, 150d death-aware, steeple
  band 190391–190398, BEFORE (prereg anchor) vs AFTER (fix anchor).
  Report per-seed days / standing / maxWave / survived, plus offer
  counts (prize sheets containing fusion_reactor, fusion offers,
  tramples). GO = survived count, maxWave distribution, and median
  survival identical before/after. Any per-seed movement is a
  finding to investigate, not a silent pass.
- (e) `node scripts/check.js --quick` green after the fix.
- (f) SENSE: no silent discard (the deferred-pending sheet's
  narration is untouched; no fusion sysSay fires while deferred)
  and no nonsense line (fusion sysSay fires only on a real offer).
  Checked in the proof test by wrapping sysSay/say during the
  staged legs.

## Horizon + seeds + policies

- Staged legs: single-seed harness (seed 190391), deterministic
  staging, no horizon — the offer functions are called directly.
- Neutrality: 8 seeds 190391–190398 (the retribution observation
  band — the only band where both defects were seen live), competent
  policy verbatim, 150d death-aware (dead villages stop; the
  retribution band's median survival was 137d, so 150d covers the
  band without a fixed-200d tail).
- No confirm spend beyond this: the fix is two guards on rare paths;
  the 8-seed before/after IS the panel (balanced-panel compare
  attached to the evidence file; the driver's per-seed JSONs are the
  panel inputs).

## Metric review (to fill after the run)

- (to fill)
