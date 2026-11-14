# sim-retribution-offer-b — prereg (ability-offer DIAGNOSTIC)

Run: fleshout-loop-b-20261114T0330Z (Loop B), arm sim-retribution-offer-b
Axis: winnability chain (backlog open item #2318 RETRIBUTION NEVER
EXERCISED BY COMPETENT PLAY, filed by Loop B arm sim-retribution-b;
see evidence/2026-11-13/sim-retribution-b.md §Check leg)
Branch: sim-retribution-offer-b — worktree
~/workspace/worktrees/sim-retribution-offer-b
Base: master 6a74c1522 (6a74c1522b9a72bac2615e428457a2640eeb6f06)
Date: 2026-11-14
Anchor commit (judged leg): the prereg commit on this branch
(recorded in each per-seed JSON as anchorCommit; driver refuses any
other HEAD via EXPECTED_ANCHOR).

## Finding under check

The scholar never holds the retribution ability in 16 long sims
(steeple band 190391–190398 + fresh band 190441–190448, 150d
death-aware, competent verbatim) — zero RETRIBUTION lines of any
kind, so the battery never charges and unleash is never pressed.
Three diagnostic seeds confirm end-state scholars hold other
abilities (including the fellow build-around trophy_room on 190444)
but never retribution. Open question: is the System ever offering
it to the scholar, or offering it and competent declining?

This arm is a DIAGNOSTIC arm: no game fix lands here. It answers the
question with an instrument that logs every ability-offer event.

## Code gate (read before the run — the gates the instrument tests)

Retribution's data (src/data/abilities.json:3500): tier
"overpowered", pool "system", unlock {type: "system_offer",
buildaround: true}, path "shieldbearer", subclass "bulwark".
It is combat-kit entry #11 of 18 (src/data/tracks.json:19):
adrenaline_surge, rage, war_cry, adrenaline_control,
phoenix_clause, survivor, cornered_rat, trade_of_blows,
unbreakable, blood_frenzy, **retribution**, trophy_room, ...
Every offer route for the scholar, and what gates retribution on
each:

1. LEVEL-UP SHEET (the main route) — tracks.js levelUpOffers
   (tracks.js:400) draws ONLY from the track's kit, unheld, in kit
   order; godpath.js kitSheet (godpath.js:769) draws offerSize (3)
   offers from the next `window` (6, godpaths.json rules.offers)
   unheld entries, weighted toward earlier ones (windowDecay 0.7),
   deterministic per holder/track/level; shapeOffers
   (godpath.js:805) then leans. Consequence: retribution enters a
   combat sheet's window only once the scholar already holds >=5 of
   the first 10 combat-kit abilities (else >5 unheld entries precede
   it). On a non-combat track's sheet it can appear ONLY via the
   payoff lean below.
2. PAYOFF LEAN — shapeOffers (godpath.js:805-840): a recognised
   class's payoff is swapped into any level-up sheet; if the payoff
   is not in the pool at all, the payoffAnyTrack branch
   (godpath.js:828; godpaths.json rules.offers.payoffAnyTrack: true)
   inserts it from the def. Retribution is the Bulwark payoff
   (godpaths.json:149, shieldbearer/bulwark). Recognition needs
   >=3 magic abilities of one path, strictly more than any other
   (godpaths.json rules.recognize.minAbilities: 3). Consequence:
   a scholar recognised as Bulwark can be offered retribution on
   ANY track's level-up sheet; a scholar never recognised as
   Bulwark can only meet it deep in the combat kit. (This is how
   190444's scholar holds trophy_room — the Stalker payoff,
   godpaths.json:236 — without holding retribution: Stalker was
   recognised, Bulwark was not.)
3. FIRST ABILITY (arrival) — game.js firstAbilityChoices
   (game.js:25355): utility tier by week-1 action + a wild slot
   from wacky/underpowered tiers only (game.js:25378, 25393).
   Retribution (overpowered) can never appear.
4. CONTEST PRIZE — contests.js _cxPrizeAbilityOffer
   (contests.js:5043): the gift bag filters tiers to utility /
   wacky / underpowered / uncommon / rare / combat / social
   (contests.js:5052); overpowered is explicitly excluded
   (contests.js:5050-5051, "the pact tier (overpowered) [is] NOT
   [a] prize"). Retribution can never appear.
5. REACTIVE OFFERS — maybeOfferPurify (game.js:25428, fixed id
   purify + utility/wacky fillers) and maybeOfferFusionReactor
   (game.js:25883, fixed id fusion_reactor). Retribution can never
   appear.
6. AID-QUEST REWARD — safetynets.js _completeAidQuest
   (safetynets.js:584): fixed pools (scrounger/tracker/swimmer,
   triage/field_medicine, green_thumb/translator/night_eyes).
   Retribution can never appear.

Competent's side (scripts/policies/competent.js:3576-3583): it
takes ch[0] — the FIRST offer on the sheet — every evening, and
never calls keepAbilities, never passes a replaceId. Consequences
the instrument must attribute: (a) a retribution offer at
position 2 or 3 is declined-by-position (competent takes ch[0]
and the sheet clears); (b) when slots are full, chooseAbility
(game.js:25708-25722) REFUSES without clearing the sheet — a
non-level-up offer says "No free ability slots", a level-up offer
says "Choose which ability X replaces" — and pumpLevelUps
(tracks.js:438) then waits behind the pending sheet until a slot
opens (integration growth) or a replace is chosen (competent
never replaces), so later level-ups queue behind it and are not
offered meanwhile. A sheet pending at end of run is therefore a
classified outcome, not a missing observation. Slots: abilitySlots() (game.js:26139) opens 2-6 by
System integration (20/35/50/65/80).

NPC side: villagers resolve queued sheets by buildScore
(villager-build.js villagerResolveLevelUps, villager-build.js:349;
villagerLevelUpOffers, villager-build.js:305 — the same kitSheet).
The instrument scans every villager's end-state abilities for
retribution (metric (d)).

## Instrument

Driver scripts/retribution-offer-driver-20261114.js, competent
verbatim, 150d death-aware, steeple band 190391–190398. The driver
wraps (in the driver only — no game-code change) the offer-setting
functions and the resolution functions, and records every event
with day + scholar state at that moment:

- Offer sources wrapped: pumpLevelUps (level_up:<track>),
  checkSystemArrival (arrival), maybeOfferPurify, maybeOfferFusionReactor,
  _cxPrizeAbilityOffer (prize), _completeAidQuest (aid-quest).
  Each offer event records: source, track/level where applicable,
  the offered ids IN ORDER, slots held/max, held-ability count,
  combat-kit-held count, combat track level/XP, recognised class
  (godpathClass('player')) at that moment.
- Resolutions wrapped: chooseAbility (accept = sheet cleared AND
  the chosen id newly held; stall = sheet still pending after the
  call, classified full-slots-no-replace vs full-slots-non-levelup),
  keepAbilities (keep-all).
- Every offer must resolve to exactly one of: accepted (id +
  position), declined-by-position (a different id at position 0
  taken), stalled-full-slots, kept, or pending-at-end. An offer
  with no resolution class is an instrument failure, not a datum.
- End-state per seed: scholar held abilities, track levels/XP per
  track, recognised class, pending sheet (if any), levelUpQueue
  depth, trackStats (offered/picked/replaced/kept), and a scan of
  EVERY villager's npcAbilities for retribution (plus each
  villager's held-ability count and level-up sheets resolved, if
  readable without new game code).
- Direct-grant check: any ability held at end-state that was never
  recorded as offered is listed as held-but-never-offered
  (expected class: spawn knacks, unlock.type latent_knack, granted
  directly — NOT an instrument failure, but it must be named).

## Band

Steeple band 190391–190398 (the finding's observation band;
comparability with sim-retribution-b). 8 seeds, competent
verbatim, 150d death-aware. No fresh band is pre-registered:
the question is about the offer mechanism on the band where the
zero was observed; the instrument, not the band, is the
variable under test.

## GO bar (pre-registered — instrument validity)

DIAG verdict is GO iff ALL of:
- (a) every offer event on all 8 seeds is attributable: offered
      ids, source, day, and a resolution class (accepted /
      declined-by-position / stalled-full-slots / kept /
      pending-at-end). Zero unattributed offers.
- (b) retribution offer rate is counted per scholar level-up AND
      per grant opportunity, with the contrast rates for other
      abilities from the same sheets (which abilities ARE offered,
      how often).
- (c) the code gate is confirmed or corrected by the counts:
      retribution appears only via the routes §Code gate allows
      (combat-kit window / Bulwark payoff lean), or the evidence
      names the route that actually delivered it.
- (d) NPC scan complete: retribution holders among villagers
      counted (0 is a counted answer, with the denominator =
      villagers scanned).
- (e) proof test scripts/test-retribution-offer-b.js GREEN
      (instrument legs + game-level legs: staged offers captured
      end-to-end; accept/decline attribution correct; a staged
      retribution offer is seen and classified).
- (f) instrument errors: 0 in every per-seed JSON
      (instrumentErrors empty).

If (a) fails — an offer the instrument cannot attribute — that is
an instrument NO-GO: report it, do not guess the mechanism.

## Verdict

DIAG: name the mechanism with counts — one of: never offered /
offered-and-declined-by-position / offered-but-stalled-full-slots
/ gated-by-kit-depth (window never reached) / gated-by-class
(Bulwark never recognised) / offered-but-unaffordable (no such
gate exists on this route — say so if the counts show it) / other
(named from the counts). The verdict names the counts behind it:
retribution offers per seed, retribution's sheet position when
offered, combat level-ups per seed, combat-kit-held at each
combat offer, Bulwark recognitions per seed.

## Scale-wall numbers (every run)

National / table / wins, wave 4-5 unlocks, median survival — from
the same 8 per-seed JSONs.

## Metric review

If a metric proves wrong (e.g. a wrapped function never fires and
a route is observed only through a different setter), write it
under "metric review" in the evidence file and propose the
revision for the NEXT run; never re-score mid-run.

## Files

- scripts/retribution-offer-driver-20261114.js — offer instrument driver.
- scripts/test-retribution-offer-b.js — proof test (instrument + game legs).
- evidence/2026-11-14/perseed-retribution-offer-b/ — 8 per-seed JSONs.
- evidence/2026-11-14/sim-retribution-offer-b-prereg.md — this file.
- evidence/2026-11-14/sim-retribution-offer-b.md — evidence (written at end).
