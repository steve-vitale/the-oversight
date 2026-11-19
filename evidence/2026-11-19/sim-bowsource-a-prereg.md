# sim-bowsource-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-bowsource-a · **Loop A run:** fleshout-20261119T1215Z
**Type:** DIAG — the bow SOURCE question (finding #2592).
**Frozen:** 2026-11-19 ~06:45 UTC, before any new sim.
**Branch:** `sim-bowsource-a` (worktree
`~/workspace/worktrees/sim-bowsource-a`). **Base:** master ebea87dfb
(the 1115Z round's speargate + bowopen landing, default-OFF).
**Builds on:** `evidence/2026-11-19/sim-bowopen-a.md` (§§5, 10, 12)
and finding #2592 (`hidden_files/sim-findings.md`).

## The question

The bowopen arm (1115Z) staged a bow at launch gear-up 400 times
and staged zero: 0 stashed bows, 0 armory bows across 400 departures
on 8 seeds. Bows are held personal gear, never stored. Any arm that
stages bows from stock is staging from an empty shelf — the source
must be crafting or loot, not the pile. This DIAG quantifies the bow
supply chain so the next arm knows which source to build on:

(a) bow acquisitions by source — crafted vs looted vs starting gear
    vs spawned (new arrivals carrying bows) vs redistribution
    (gifts / armory takes move an existing bow, they do not create
    one) vs unexplained (a bow appears on a villager with no
    captured event — named, counted, never hidden);
(b) departures where the departing fighter lacks any volley-capable
    ranged weapon, and how often a bow could have been sourced at
    that departure (own stash / armory pile / craftable from known
    recipe + reachable materials);
(c) stash / armory bow counts over time (the pile the bowopen arm
    found empty — does it ever fill?);
(d) who crafts bows, with what materials, how often the craft fires
    — the home duty `villagerWeaponCraftDay` (weaponless only,
    knowledge-gated, ≤1 attempt / 3d, L1 35% / L2+ 85%) and the
    departure craft leg (BOWOPEN, off in this diag).

## Code facts read before any sim (frozen, not a sim)

- Ranged weapons in `src/data/items.json` (8): sling (bonus 8,
  ammo stone), crude_bow (18, arrow), bow (22, arrow, origin
  crafted), crossbow (28, bolt, origin crafted), phase_sling (35,
  stone, alien T2), starfall_bow (50, arrow, alien T3), searcaster
  (120, fusion_cell, alien T4), apex_bow (95, arrow, T4).
- Starting gear: `genOpeningPool` (game.js) — 1 weapon (lootTier
  ≤ 2, non-alien) + wild card (lootTier ≤ 2, non-alien); villagers
  `choosePersonalFive` (5 chosen, 3 unchosen go to their personal
  stash). Earth bows (sling / crude_bow / bow / crossbow) can all
  be starting gear.
- Kill loot: `villagerKillLoot` (game.js) rolls `rollAlienLoot`
  into the killer's pack — the alien table, so it can only drop
  alien bows (phase_sling / starfall_bow / searcaster), never an
  earth bow. Patrol loot (game.js ~8440) is the same table.
- Home craft: `villagerWeaponCraftDay` (villager-build.js) — ladder
  hunting_spear → fire_hardened_spear → bow → crude_bow; serves
  WEAPONLESS villagers only; knowledge `v.weaponCraft[vid]` seeded
  ONLY by handling the finished weapon (wearing / carrying /
  stashing it); recipes bow = wood 1 + vine 2, crude_bow =
  branch 1 + vine 1 (recipes.json). A melee-armed villager never
  handles a bow, so they never learn one — the departure craft
  can never fire for them (bowopen §5, source 2).
- Redistribution (moves, never creates): `villagerGearDay`
  (villager-build.js, daily) — own stash equip, spares gifted to
  whoever gains most (`tele('villager_gear', via 'gift')`),
  armory pile to the biggest gain, one per villager per day
  (`tele('villager_gear', via 'armory')`). `tele('weapon_craft')`
  fires from exactly two places: the home duty and the stageBow
  craft leg (game.js, BOWOPEN-gated — off here, so every
  `weapon_craft` event in this diag is the home duty).
- Ownership law (Steve 2026-10-09): no communal armory — the
  stash `weapons` pile holds DEPOSITED weapons only (deposit is
  consent). The bowopen arm's "armory" leg reads that pile.
- The volley needs ammo: a spear in the ranged slot (melee,
  range 2, no ammo) is not a volley-capable weapon
  (`volleyWeaponOf`, equipment.js; speargate finding #2590).
  Departure rows therefore record volley-capability, not the slot.

## Primary metric (BINDING, §14)

**Bow-supply attribution completeness + the bowless-departure
answer, on the single observation leg.** The diag has no
intervention leg, so there is no before/after — the panel (§15)
is a null compare (before == after == this leg), the instrument
recording wall numbers; the frozen bars below are the judge.

- **Attribution:** every bow first-appearance in a villager's
  personal union (held + stashed) over the run is attributed to
  exactly one of: starting (present in the day-1 baseline),
  crafted (`weapon_craft` ok, item in the bow set, same day),
  looted (`villagerKillLoot` drop in the bow set, same day),
  spawned (arrives on a villager new to the roster), moved
  (gift / armory take — another villager's union loses the same
  id the same day, or the stash pile loses it), or unexplained.
  **Attribution completeness = attributed / all appearances.**
- **Bowless departures:** every `startExpedition` departure row
  carries the fighter's volley status + the source check at that
  moment (ownStashBow / armoryBow / craftableBow from known
  recipe + reachable materials, read live from recipes.json).
  **Bowless share = departures with no volley-capable ranged
  weapon / all departures. Sourced share = of the bowless, the
  share with at least one source true.**
- **Craft-fire denominator:** eligible-villager-days = sum over
  daily census rows of weaponless villagers who know a bow recipe
  (the only villagers the home duty can serve). Attempts and
  successes come from `weapon_craft` tele events.

**GO threshold (DIAG-GO):** attribution completeness ≥ 0.90
**AND** departures observed ≥ 100 (pool floor — the bowopen band
saw 400 departures on 8 seeds) **AND** the craft question is
measured on a non-zero denominator (eligible-villager-days > 0
with attempts counted, or eligible-villager-days = 0 stated as
the finding itself: nobody is ever eligible) **AND** a named
next arm is filed (a fixable lever named precisely, or the
source question answered as "no fixable lever — the source is
X, and the next arm is Y").
**DIAG-NO-GO:** attribution < 0.90, or departures < 100, or the
craft denominator is unmeasured (instrument failure), or the
decomposition does not name a next arm.

**Expectations (not binding — the diag may overturn them):**
crafted ≈ 0 (weaponless-only duty + knowledge gate); looted
alien bows rare (a handful across 8 seeds); starting gear the
dominant source; stash/armory bow counts ≈ 0 throughout;
bowless departures a large share, mostly with NO source
available (which would name the next arm: a source, not a
staging tweak).

## Secondary metrics (supporting, not binding)

- Bow stock over time: village bow total (held + stashed +
  pile) at days 1 / 30 / 60 / 90 / 120 / 150, by id; stash /
  armory bow counts over time (max ever, end).
- Craft detail: who crafts bows (vid, count, ok/fail), materials
  spent per recipe, attempts per eligible-villager-day, success
  rate at L1 vs L2+ (from the knowledge record at attempt time).
- Knowledge spread: villagers who know a bow recipe over time
  (armed vs weaponless); how knowledge is ever seeded (handling
  events — a villager must first HOLD a bow to learn to make one).
- Departure detail: bowless share by party role (holder vs
  companion), spear-in-slot share among the bowless, mean
  volley-capable share at wave-4+ fight entry (from the
  encounter rows' rangedId, as in bowopen).
- Wall numbers (reported every run): national / table / wins,
  wave-4 and wave-5 unlocks, median survival.
- Table: not instrumented by this driver — reported as null,
  never faked.

## What this diag does NOT judge

- Whether a ranged opening wins fights (bowopen NO-GO stands;
  this diag measures the supply that staging would need).
- No game-code fix lands in this DIAG arm. If the diag finds a
  fixable lever (e.g. a crafting verb that never fires), it is
  named precisely and filed as the next arm — not built here.
- The Rage/carrier half (Loop B's work). The 4th seat
  (engine-blocked). No 12–16 seed confirm — pilot-scale diag
  only; the coordinator decides the follow-up.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the bowopen band, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed band): 107001, 107002, 107003, 107004,
  107005, 107006, 107007, 107008.** Freshness check (skill
  local_seed_band_freshness): `grep -rl
  "107001|...|107008"` over `evidence/ --include="*.md"` —
  **0 hits**; over goal `hidden_files/ --include="*.md"` —
  **0 hits**; over `~/memory/*.md` — **0 hits**. Neighbouring
  used bands avoided: 105701–105708 (bowopen-a), 104501–104508
  (fightcap-a), 104601–104608 (fightcap-dmg-a). A broader
  recursive grep over all of evidence/ (incl. JSON corpora)
  was also started; if it reports a hit the evidence file
  reconciles it — the .md check above is the freshness rule the
  task names (preregs + dated .md files).
- **Policies:** competent verbatim. **Substrate (same as the
  bowopen ctl leg):** `VETREENGAGE=1 + PARTYSIZE4=1 +
  FLEEREPAIR2=1 + FIGHTALLY2=1`, `LAUNCHPARTY=1`. **BOWOPEN
  unset, SPEARGATE unset** — the diag measures the world as-is;
  the staging mechanism never fires (corpus files carry
  `bowopenOn: false`; `v.bowOpen` stays null). One leg only
  (MODE=obs) — no intervention, no before/after.
- **Instrument:** `scripts/bowsource-driver-a.js` (copy of
  `scripts/bowopen-driver-a.js` — the launch-funnel recorder is
  unchanged — PLUS the bow-supply recorder: `tele` wrap for
  `weapon_craft` / `villager_gear` / `ammo_craft` events,
  `villagerKillLoot` wrap, daily bow census (holdings / stash /
  pile / materials / knowledge / eligibility), day-1 baseline,
  and an all-departures `startExpedition` wrap carrying the
  volley + source check); analyzer
  `scripts/analyze-bowsource-a.js` (`--selftest` incl. the
  attribution join, the departure source check, and all judge
  shapes); per-seed JSONs under
  `evidence/2026-11-19/perseed-bowsource-a-obs/`.
  **§15 panel:** `scripts/build-bowsource-panels-a.js` (adapted
  copy of the bowopen panel builder, same schema) + `node
  scripts/balance-panel.js compare` with before == after ==
  this leg (null compare — the panel records wall numbers, the
  deltas are zero by construction); the compare `.md` is
  attached to the evidence file. The panel is the instrument,
  the frozen bars above are the judge.
- **DIAG ONLY.** No lever lands; the coordinator decides the
  follow-up arm from the verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The fixture is the encounter itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The corpora carry the encounter
averages (party size, gear, ranged-at-entry) beside the verdict
in the evidence file. The nearest measured point is the bowopen
band (launched parties geared by the launch gear-up); the diag
does not re-derive gear — the competent policy plays it, and
the corpora record what it played.

## Pre-run substrate checklist (§14b)

1. **Contact:** departures occur on the substrate — bowopen-a
   saw 400 departures / 82 launched meetings on 8 seeds; the
   pool floor (≥ 100 departures) is sized to that known rate.
2. **Pool sizing:** see (1). The attribution denominator is
   bow appearances, not departures — it is counted, not assumed.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-bowsource-a.js`, GREEN before the sweep)
   proves the attribution join (craft / loot / gift / armory /
   spawn / unexplained), the departure source replica (knows +
   materials, live recipes), and the census shape on fixtures,
   plus a short live smoke (1 seed, 5 days) asserting the
   recorder writes baseline + census rows with 0 instrument
   errors. The analyzer `--selftest` covers the attribution
   join, the departure stats, the craft stats, and all judge
   shapes incl. the DIAG-GO / DIAG-NO-GO paths.

## Canon note

`docs/CANON.md` (manifest) was read for this arm. No canon doc
covers the bow supply chain, villager crafting, or launch
gear-up — said here rather than inventing canon. The bow is
canon-adjacent: `src/data/items.json` carries the 8 ranged
weapons and their bonuses/ammo; `src/data/recipes.json`
carries the bow / crude_bow / crossbow recipes; the ownership
law (no communal armory, deposit-is-consent) is Steve's
2026-10-09 ruling, cited from `src/js/game.js`
`villagerGearUp` / `villager-build.js` `villagerGearDay`.
All supply-chain claims are cited from code (`game.js`
`genOpeningPool` / `villagerKillLoot` / `rollAlienLoot`,
`villager-build.js` `villagerWeaponCraftDay` /
`villagerGearDay`, `equipment.js` `volleyWeaponOf`), not from
canon.

## ADDENDUM (2026-11-19 ~07:10 UTC — BEFORE any sim ran)

**Substrate correction.** The first sweep invocation STOPPED
before any seed (driver gate): `LAUNCHPARTY` appears NOWHERE
in `src/js` on master ebea87dfb — the bowopen band's sense fix
is a HELD substrate (branch `sim-launchparty-sense-a` tip
d01eaf0a5, cherry-picked as HELD into bowopen / fightcap-dmg /
allyslot3-b, never landed on master). Its LANDED successor is
on master: `sim-senseexped-b` (finding #2583, commit
97e78670d, GO) — `SENSEEXPED=1` in `src/js/party-wiring.js`,
the same job ("the party that set out together answers
first") read from the LIVE expedition (`agencyState().exped`
entries sharing the target) instead of `winPlan[vid].party`.
The other substrate gates (VETREENGAGE, PARTYSIZE4,
FLEEREPAIR2, FIGHTALLY2) are all present in `src/js` on this
master — verified by grep, not assumed.

**The sweep therefore runs `SENSEEXPED=1` in place of
`LAUNCHPARTY=1`; LAUNCHPARTY must be unset (the driver
asserts both).** No HELD cherry-pick is ported: the diag
measures the current landed world, which is what the next arm
will build on. The substitution touches ONLY the meeting-sense
secondary metric (encounter ranged-at-entry share); the
primary metrics (attribution, bowless departures, craft-fire
denominator) do not depend on meeting sense at all —
departures are driven by winPlan / dawn decisions, and the
supply chain is a village-economy question. The pool floor
(≥ 100 departures) is unchanged: bowopen's 400 departures
were departures, not sense-gated meetings. Corpus files
self-describe the substitution (`senseexpedOn: true`,
`senseexpedPresent: true`, `launchpartyOn: false`).

No sim ran under the old substrate line (the STOP fired
before the first seed), so no measurement is re-scored and no
frozen bar changes. The proof test was re-run green with
`SENSEEXPED=1` before the sweep.
