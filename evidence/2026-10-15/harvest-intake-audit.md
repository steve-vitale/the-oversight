# Actual eating, returned rations and the Living Garden

Runtime commit: `0eb727a495f8b2fac4c1903981005512d2155e63`, including
`ba37cfed`. Baseline: the preceding harvest-source panel, with 124 Table
wins and 229 player deaths in 256 campaigns. This work supplies real intake
receipts for the authored Garden deed. Its seven-day gate remains unfinished.

## What is now wired

`village.harvestIntake[day][person]` retains eight days of physical food,
nourishment, original harvester shares and route totals. A person's own
receipts remain theirs through save/load and succession. Anonymous food
and NPC personal production remain untraced. Reading or transferring food
never invents a former harvester or an eating event.

Actual callers cover pack bites/bulk eating, counter food, Haven and joined-
village meals, probation meals, NPC home/away meals, gifts and communal
feasts. Ration packing keeps the real draw's energy-weighted source shares;
spending or stealing a ration is a transfer. Credit occurs when it is eaten.
Stolen food retains the producer rather than becoming the thief's harvest.
New Genesis crops retain their planter; legacy crops have no invented owner.
Known and unknown rare-herb forage bonuses retain the actual harvester.

Physical consumption and nourishment are separate. A full counter bite can
consume food while adding zero reserve. Player nourishment follows the real
absorption/cap calculation; NPC records use their existing daily need or
hunger relief as the nourishment bound. These accounting bounds do not
change food, hunger, health, abilities, XP, costs or knowledge gates.

The last caller audit found important wrappers: probation can serve a half
meal, and rationing returns half the initial Haven draw. Communal receipts
now settle after those actual adjustments. Returned portions keep the drawn
harvest mix and count only if eaten later. Their snapshot is taken before
restocking can merge into an old stack. Whole inventory units, the original
return rounding and reserve changes are preserved.

Feast receipts divide the consumed communal energy across the host and
attending guests; inventory ingredients are still drawn whole. Fusion cold
seats get no credited serving. This follows the existing communal-meal
fiction and records its limits; it adds no reserve calories or hunger relief.

## Proof and matched campaigns

The shared-harness real-action proof passes **37/37**. Frozen `1ddb2420`
passes 9 and fails 28. Proofs include refused/full/unknown/spoiled food,
reserve overflow, gifts, home/away meals without duplicate ration credit,
stolen and returned rations, full/probation guest shares, cold seats, dead
recipients, supplemental harvests, eight-day bounds, save/load and succession.
The previous source proof remains **26/26**, observer on/off proof **4/4**.
Quick suite **151/151**, 32 seconds; full **923/923**, 171 seconds.

Both final panels pin the runtime commit above. The 16-seed x four-policy
screen has **64/64 identical standard results**; the full 64-seed x four
panel has **256/256 identical standard results**. Every prior observer field
except the raw state hash also matches; warnings are zero. Full results
remain **124 wins and 229 player deaths**. New `intakeDays` is additional
read-only observation, not a baseline outcome that existed before this work.

An independent paired probe runs seeds 7 and 12 across all four policies on
frozen/current sources. All **987 daily snapshots** and eight final states
match after removing only the explicitly named `harvestShares` and
`harvestIntake` fields. The unchanged full-state hash is retained alongside
that comparison. The existing hash excludes only its three wall-clock
pacing diagnostics; all other game state remains compared. The observer
uses plain receipt data and adds no RNG draws or telemetry timestamps.

Raw panels and paired-state reports are losslessly compressed. Raw/gzip
SHA-256 hashes, source hashes and exact counts are in
`harvest-intake-validation.json`.

## What the new usage measurements show

Across **28,843 observed campaign days**, tracked harvests provide about
**8.54 million consumed kcal** and **8.20 million nourishment kcal**.
There are **19,780 harvester-days** with positive nourishment supplied to
someone else, totalling about **1.90 million kcal**. Of 2,201 harvester
person-run records that nourish others, **2,042 never became the bearer**.
234 also sample a Forager subclass during that run; this does not establish
that they held it at the time of every meal.

The largest harvester-day has 11 other physical consumers. That does not
prove 11 full daily diets, seven feeding days, or a whole-village deed.
Anonymous personal production accounts for about **418.49 million kcal**;
it cannot be assigned to another person's harvest. Coverage needs an
explicit day/roster settlement rather than inference from gardening XP,
total meals, a donation or the presence of a feast button. All four policies
use the recorded pantry, personal-work, ration, pack and feast routes; none
uses the gift, counter or guest-pantry route in this panel. Those routes
have real-action proofs, so zero bot usage is not proof they are unusable.

## Actual phone feast: a verified reward gap

Prepared phone play at **390 x 844** starts with 1,000/2,400 reserve kcal and
20,000 pantry kcal. The actual Haven **Host a feast** planner shows 11 guests
plus the host, nominal cost 4,800, and ten whole 500-kcal food portions.
Clicking the real **Light the fire** control spends **5,000 pantry kcal**.
Afterwards the normal HUD still shows **1,000/2,400 kcal** and the pantry
**15.0 Mcal**. The host serving receipt is 416.67 kcal, with **zero
nourishment**. The night-hunger warning remains. The old host path awards
bonds/buffs but never adds reserve food, despite saying the host eats too.

See `harvest-intake-phone.png` and the DOM text in `harvest-intake-browser.txt`.
The fixture supplies the character and food; this proves the actual control
and reserve result, not natural acquisition or affordability. Its generator
is retained as `harvest-intake-phone-fixture.cjs`; run from the repo root,
serve over loopback and open `.git/harvest-intake-phone.html?debug=1`.
The initial fixture needed that debug query for the existing refresh hook;
it was corrected before the actual feast. The temporary viewport was reset,
the owned tab closed and the loopback server stopped.

The next work is to repair that verified host-food gap, then settle and
measure the Garden's seven-day coverage against actual living meal
participants and portions. Day closure must snapshot the required living
mouths and retain successful feeding days per harvester beyond the eight-day
intake window. Player/NPC recognition and the known-class objective must use
the same rule, with class, payoff, build and day gates retained.
The existing feast quality rule's 300 kcal per
head is a useful calibration to examine; no new deed threshold is enabled
here. Nine authored replacements, class dead spots, wider NPC parity and
god-scale reconciliation remain open. No deployment or service-worker bump.
