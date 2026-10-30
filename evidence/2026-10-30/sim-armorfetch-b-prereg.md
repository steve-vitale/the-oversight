# sim-armorfetch-b — PREREG (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-armorfetch2-b, axis food-economy.
Successor to sim-stashfetch-b (landed 21efcdcb2): that arm fetched the
vessel's own best stashed WEAPON; this arm mirrors it for ARMOR (tracker
next blank 4). Bark armor is craftable and live; up to three villagers
can start wearing it — but the vessel's own stashed armor still never
moves (stashfetch evidence: 16103's swat_vest sat next to the hatchet
and never moved).

## Lever (game-code arm, ONE new method + ONE call site)

`Game.vesselArmorFetch()` in src/js/villager-build.js, called from
`villagerBuildDay()` immediately after `vesselStashFetch()` (the endDay
sleep path, so it runs in live play and in sims with no policy change).
Once a day, at haven (`playerAtHaven()` — same teleport guard as the
weapon fetch), the vessel fetches their own best stashed ARMOR into the
pack when it beats what they wear in its slot (empty counts as beaten).
Own stash only, at most one armor fetch per day, narrated via Game.say +
a `vessel_armor_fetch` tele record. Wearing stays on the normal path
(policy gearUp in sims, player UI in live play): the fix OFFERS the
choice, it does not force the wear. Nothing granted, nothing generated.
The weapon-fetch code path is untouched except for sharing the call
site; the armor fetch carries its OWN day flag (`_armorFetchDay`) so it
cannot block the landed weapon fetch on a night both apply — sharing one
flag would regress stashfetch. "One fetch/day" means one armor fetch
per day, alongside the one weapon fetch per day.

## Armor ordering (from code, not invented)

Per-slot `def.armor.protection`, via `equipment.slotForItem(def)` for
the slot — the same reading the gear path already uses:
`equipment.equipScore` scores a body-slot item at protection*10, and
villager-build `_slotValue` reads `def.armor.protection`. Only items
with `def.armor` qualify (head-slot non-armor curios like pot helmets
are not armor and are excluded). Among stashed armor pieces beating
their slot's worn protection, the fetch picks the LARGEST GAIN
(candidate protection minus worn protection in its slot), tie-broken
by higher protection — the gain reading matches villagerGearDay's
"biggest gains first" armory allocation. A full-set torso is compared
by its set protection (armorOf's fullSet reading); the fetch only
moves the piece to the pack, so no set-breaking decision is made by
this fix — gearUp/UI decides the wear.

## Primary metric (binding)

Armor acceptance on acceptance seeds: a seed counts WORN if the
spawn vessel's stashed armor piece is in the scholar's equipped kit
within the first 7 game days, FETCHED if it is in the scholar's
inventory-or-equipped kit within 7 days (and has left the spawn
vessel's stash). GO iff WORN-or-FETCHED on >= 2/3 acceptance seeds,
mirroring stashfetch's >= 2/3 bar.

## Acceptance seeds (spawn-verified BEFORE this prereg, not judged)

Spawn probe (scripts/probe-armorfetch-spawn.js, spawn-only inspection,
no policy run): on ALL 16 band seeds the spawn vessel wears NO body
armor (scholar equipped holds only acc1–4 keepsakes/tools) and holds
exactly one stashed armor piece beating the empty slot. Acceptance set
(chosen for slot + protection diversity, mirroring stashfetch's 3-seed
set):
- 16103: swat_vest, torso, P35 (flagship; same seed as stashfetch's
  flagship, where the vest sat beside the hatchet and never moved).
- 16101: bark_armor, torso, P10 (craftable tier).
- 16109: farstrider_boots, shoes, P12 (non-torso slot — proves the
  fetch is not torso-only).
Window: first 7 game days. Rationale: the fetch runs nightly from
day 1 (stashfetch narrated day 1, equipped day 2), so 7 days absorbs
away-from-haven nights without letting later loot/succession paths
claim the credit.

## Cost bar (mirroring stashfetch, recorder band 16101–16116, 60d)

Before-leg = the stashfetch after-corpus
(evidence/2026-10-30/sim-stashfetch-b-corpus, 16 seeds, identical
substrate: nighttravel + woodcarry, WOODWARM=0, COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1): it is pre-armor-fetch code
with the weapon fetch on, and its morning snapshots already show
stashed armor never entering the scholar kit. Cost bar: village-lost
<= baseline+1 (baseline 1/16) AND median daysAlive >= 0.8x baseline
median (baseline 60, capped). A miss on either is NO-GO even if
acceptance passes. Wave reach reported, not gated.

## Horizon, seeds, policies

Horizon 60d, death-aware (villages that die stop; +10d tail max via
the recorder's runDays). Recorder band 16101–16116: pilot 16101–16108,
confirm 16109–16116. No judged leg below 8 seeds. Substrate identical
to the hatchequip/stashfetch recorder (scripts/armorfetch-trace-b.js,
a copy of hatchequip-trace-b.js with only the say-line filter extended
to armor lines and the outdir/filenames changed — same wrappers, same
snapshots, same env gates).

## Panel (section 15, supporting instrument, never the judge)

Balanced panel before/after on the standard competent substrate
(scripts/balance-panel.js): before-leg is the branch base (pre-armor
code), after-leg is this branch, both run through the same panel
command. Compare .md attached to the evidence file. Per section 15, a
panel regression_watch does not override the prereg GO; a panel
regression_signal is a same-run investigation item, reported not
hidden.

## Metric review

(To be filled at evidence time. Pre-registered metrics bind this run;
a miss is NO-GO, never re-scored against a friendlier metric mid-run.
If a metric proves wrong, the revision is proposed here for the NEXT
run, not applied to this one.)
