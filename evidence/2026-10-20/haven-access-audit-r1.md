# Haven entrance milestone — verification in progress

Baseline: shared3f09b84a1. Candidate build3f09b84a1-20261020-235403.
No candidate publication yet. Keep the rolling goal active.

## Problem and behavior

The south doorstep was cleared before seeded tent placement, which could
overwrite it. Step outside also placed the bearer at(4,2), north of the
centered hall and on the garden rows. New grounds reserve(4,5), moving any
tent there to the same west spot(2,5) without extra RNG draws or shelters.
Existing saved grounds and player constructions are adopted unchanged.

Door exit now uses a connected exterior approach, preferring(4,5), avoiding
the hall and northern garden. A completely sealed saved exterior refuses
honestly and leaves the character inside. Failed combat door transitions no
longer grant flight; successful flight keeps pursuer ownership and saves the
finished state. Normal entry/exit also persist immediately before unload.
Entry confirmation no longer invents a constant twelve-person headcount.
No walking price, door-time price, food/HP, skill or reward value was changed.

## Mechanic and browser evidence

- Shared-kit test-haven-access.js:35 checks pass, including256 private terrain
  seeds, actual paid movement/construction, real camp/fuel ledger preservation,
  followers/residents, legacy-cache adoption, Continue, disconnected pockets,
  refusal and real combat door flight. Retain red-r1 and green-r8 logs.
- Independent same-driver census in separate baseline/candidate harness
  processes:115/256 old doorsteps blocked,0/256 afterward. Every distinct tent,
  fire, lodge and teaching garden count matches; changed cells are only(4,5)
  and(2,5). Raw grids and identities retained compressed. This is not256
  campaigns or an estimate of natural new-run prevalence.
- Existing three-seed combat-door guard proof:87 assertions pass. An unlisted
  historical partial-loader test-interior.js fails five assertions because its
  havenXY fallback puts the character on obsolete(3,3). Its assertions were not
  loosened and it was not added to or removed from the green list. The new
  shared-harness proof checks real Haven identity and its follower/side rules.
- Final source-bound actual-touch Haven journeys:17 checkpoints each at390×736
  and390×844, fresh and declared legacy yards, paid walking, repeat entry/exit,
  serialized save inspected BEFORE unload, real Continue, zero outer scrolling
  or page errors. Inspected fresh south landing and preserved legacy tents/fire.
- Final ordinary/Deer frame journeys:16 checkpoints per height, actual source
  hashes, Wait with zero moves and escape. Refreshed canonical phone proof.
- Changed combat door branch also has ordinary-health actual-touch receipts:
  seven checkpoints per height, successful flight/pursuer persistence, refused
  sealed-yard exit, paid move consumption, real Wait/round advancement and
  Continue retaining position/turn. Final r4 uses ordinary100 HP. The preliminary
  r1 fixture used1000 fighter HP and is superseded; neither proves a natural
  indoor encounter, victory difficulty or physical-device clearance.
- Full native water trip rerun against this source:16 checkpoints each at both
  heights, actual travel, companion, filling, delivery, Journal and Continue.
- Actual old installed worker update and cold offline Continue preserve the
  save; old982cb3c40-20261020-221451 → candidate. Emulation, not physical device.

## Balanced investigation (pending decision)

Retained before/after64-case panels:16 matched capable/maker/merchant/caregiver
campaigns,150-day cap, same current observer/harness/policies, neutral controls
and stable sources. All23 measures and feature/NPC eligibility census retained.
Wins16→15,9→8,13→12,8→7 alone do not establish a regression. Maker class access
14→7/16 and caregiver first-bearer day30 survival13→9/16 require investigation.
Community losses rise in capable/maker; some death measures improve. Read all
domains and coverage_changed denominators, including the early maker ending.

Thirty predeclared exact replay pairs cover every binary win change plus worst
adverse deaths, hunger, earned gear, class, community loss and day30 survival
per policy (ties by seed; unknown survival excluded). Every pair reproduces
full state, outcome and all metrics without warnings. Coarse daily differences
do not prove the cause of later endings.

Fixed seed1 (first sorted maker lost-class and caregiver day30-loss case) was
then replayed in disposable source roots with one lever reversed at a time.
Unmodified cloned controls match the retained candidate full state/outcomes/all
metrics. Removing only new door saves or restoring only the old landing keeps
candidate metrics. Restoring old tent placement restores BOTH complete original
outcomes and all23 metrics. This identifies a layout dependency in these two
cases, not a general class/survival effect. Never swap the active source.

Independent follow-up predeclared BEFORE viewing results:seeds10000–10063,
maker/caregiver,150 days, unchanged observer/policies/harness and frozen roots,
all23 metrics.128 campaigns per arm plus neutral controls, stable sources and
no collector warnings. Maker class access53→51/64; caregiver day30 survival
47→50/64 and class access51→60/64 do not replicate the large screen drops.
Maker paired day30 survival48→48/62 has changed eligibility coverage: do not
impute the other two as known survivors. Read the complete holdout scorecard.

Caregiver Table invitations42→30/64 and wins40→30/64 remain review signals;
maker wins33→32/64. More class access does not cancel the Table warning.
Fifty-six exact holdout replay pairs reproduce every binary win change plus
the predeclared adverse-domain selection. Together with the screen,86 unique
matched pairs are diagnostic replays, not additional independent observations.

Four repeated caregiver probes (first two sorted lost/gained wins) call the
canonical Table eligibility helpers AFTER exact state/outcome/metric checks
and final-state capture. Every query leaves the final state unchanged. Lost
seats at10003/10004 lack wave-three breadth(1/2 against required3), despite
adequate earlier waves, contests, crises, scale, integration and food deeds.
The gained cases10001/10008 reverse that same shortage: old w3=2, new w3=4/3.
This explains those endpoints, not all56 cases. Several non-wins are alive at
the150-day cap, not proven permanently blocked from late progression.

Decision: publish the bounded entrance and persistence correctness repair
after required checks, retaining review_required and the caregiver Table-pace
warning. Do not adjust food/HP/rewards or lower Table requirements to regain
wins. This does not clear all-playstyle/public-release viability. Next bounded
goal: four fixed caregiver journeys through terminal outcomes, with faithful
continuation/prefix proof and naturally earned later-game phone evidence.

## Remaining before push

Finish required quick/full with all proof freshness checks green; reconcile
new Muse changes; stage only this milestone (preserve sweep-B.log); ordinary
fast-forward publication and full deployed-source readback. One checked push
must include evidence/docs rather than relying on an evidence-only exception.

Final fallback revision (build3f09b84a1-20261020-235403): a camp with nine tents erected through actual paid actions blocked every preferred landing while leaving connected exterior open. The final helper searches all connected non-garden exterior cells before refusing; it preserves every structure. The frozen first candidate fails the same reproduction, the final candidate exits successfully. Shared-kit coverage is35 checks including128 saved obstruction layouts. Final phone-r2 has17 trusted-touch checkpoints at each height, including the paid nine-tent yard, walking out to the world and Continue; combat-r4 has7, frame-r3 and water haven-final-r2 have16 each. Lifecycle-r2 proves old installed-worker update and cold offline Continue. Prepared fixtures do not establish naturally earned campaigns or physical-device clearance.

Fresh final-source screen/holdout after-r2 panels contain192 campaigns and match EVERY retained first-candidate row field, canonical state hash, outcome and all23 metrics (equivalence-r1.json). Earlier replays, ablations and eligibility queries retain their original first-candidate source identities; they were not rerun on the final source. Their sampled endpoints match the new actual runs, not a universal equivalence claim. Both final scorecards remain review_required. The lost caregiver Table pace stays open for the next bounded terminal-campaign milestone.
## Final pre-publication check

Final build3f09b84a1-20261020-235403: quick269/0 (quick-r6), full1041/0 in328 seconds with four workers (full-r3). The previous full-r2 passed the intermediate candidate but did not clear the later paid-camp trap. Its old movement test required(4,2); the corrected test now strictly requires walkable non-garden(4,5), preserving price/time checks. No failed test was quarantined or weakened. Final whitespace check is clean; foreign sweep-B.log stays unstaged. Vercel read-only target receipt confirms the-oversight production/main on the shared3f parent. Publication/readback follow these checks.
