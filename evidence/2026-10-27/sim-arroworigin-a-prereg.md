# sim-arroworigin-a — PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

Run: flesh-out loop, run fleshout-20261027T0105Z, arm sim-arroworigin-a,
axis scale-onramp. DIAG / MEASUREMENT ONLY — zero src/js changes, no
default flips, no combat/craft/loot code changes, no lever proposal.
A trace that answers the question is a complete result.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft). No design is invented here.

## QUESTION (open micro-blank from sim-ammostorage-a, run fleshout-20261026T2317Z)

The entire village arrow economy on seeds 73672 (arrow present from
day 40) and 73676 (from day 1) is exactly one arrow in one person's
personal stash, never carried, never spent, never joined by a second
arrow; the other 6 seeds never hold an arrow on any of 1206 daily
snapshots. How does that single arrow arrive — starting stash vs
early craft vs loot vs trade? Answer it with a trace, do not propose
a lever.

## CODE-GROUNDED ARROW-ARRIVAL PATHS (read from src/js / src/data before sweeping)

Each path below is checked, not assumed. The recorder is built to
distinguish them; a path the trace cannot distinguish is reported as
unattributable, never guessed.

1. STARTING STASH (opening gamble → choose-5 overflow). The only
   starting-pool route in code:
   - genItemCandidates (src/js/game.js, "genItemCandidates: 8 personal
     items per character from class pools"): tool x2, weapon x1
     (lootTier <= 2, origin != alien), clothing x2, sentimental x2,
     wild card x1 from class != 'food', lootTier <= 2, origin != alien.
   - Arrow is class 'ammo' (src/data/items.json id 'arrow': no
     lootTier, no origin) — so it can enter a starting pool ONLY via
     the single wild-card slot, never via the tool/weapon/clothing/
     sentimental takes.
   - choosePersonalFive (game.js): sentimental +1000, weapon bonus
     x10, tool +50, armor protection x5, plus Math.random()*10.
     Ammo scores only the 0–10 idiosyncrasy roll — so a wild-card
     arrow is the weakest-scoring pool member in most pools and
     lands in the unchosen 3, i.e. ch.stashed (game.js:1931:
     "scored.slice(5)"). A starting arrow therefore predicts:
     holder's fullPool contains 'arrow', holder's stashed contains
     'arrow', holder's carried does not, from the holder's first
     roster day.
   - Scholar variant: the player's own fullPool works the same way
     (game.js:2684: unpicked fullPool -> villager.stashed); the
     scholar's inventory is a separate structure
     (state.scholar.inventory) and is recorded as its own bucket.
   - Static starting files carry zero ammo, verified: villagers.json
     is an empty list (0 entries, 0 'arrow' mentions);
     background_survivors.json has 100 entries, 0 'arrow' mentions.
     So "starting" here means procedurally generated at game start
     (genCharacter / hydrateSeed), not a JSON file entry.
   - LATE-JOINER VARIANT of the same path: a person generated
     mid-run (ensureRosterPerson / visitor invite → genCharacter
     without origin) gets a fresh opening pool the same way. A
     day-40 arrow with a holder who first appears on the roster on
     day 40, whose fullPool contains 'arrow', is still STARTING
     STASH — of a joiner, not a founder. The recorder distinguishes
     founder vs joiner by first-roster-day.
2. CRAFT. Player-only in code: Game.craft (game.js:3400) writes to
   state.scholar.inventory only, knowledge-gated (L1 35% / L2+ 85%),
   recipe 'arrow' (src/data/recipes.json: 2 stick + stone + fiber,
   makesUnits 5). A craft therefore predicts: scholar inventory
   gains 5 arrows on one day (not 1), and only the scholar's bucket
   moves. NPC armor crafting (villager-build.js villagerArmorCraftDay)
   crafts armor recipes only, never ammo. No NPC arrow-craft path
   was found in code. A single stashed arrow with zero scholar
   arrows on every day rules craft out as the direct source; a
   craft-then-gift chain would still have to pass through the
   scholar's 5-unit gain, which the daily scholar bucket would show.
3. LOOT. rollAlienLoot (game.js:43276) pools items with
   origin === 'alien' (or rewardEconomy extraItems) at the rolled
   tier — arrow has no origin field, so it is not in the alien loot
   pool; the field-fight loot path (game.js:7511, killer's pack)
   inherits the same pool. A loot arrival predicts: carried (not
   stashed) gain on the killer on a kill day, from the alien pool —
   inconsistent with a stashed-only single unit. The recorder's
   day-over-day diff plus holder identity tests this; the code
   reading already makes loot an unlikely source, and the trace
   must confirm or refute, not repeat the reading.
4. TRADE / GIFT / GEAR-UP. Deliberate transfers exist (owner equips
   from own stash, gives/trades deliberately, discards, or dies
   with it — game.js choosePersonalFive comment; villager-build.js
   gear-up moves weapon/armor only, never ammo: the gear-up code
   filters d.weapon || d.armor). A trade/gift arrival predicts: a
   donor's arrow count falls on the same day the holder's rises
   (donor + holder both visible in the per-person map), and/or the
   holder's carried count moves first. Corpse loot (corpses.js
   generatePossessions: carried + stashed become the death pack)
   predicts: a death of a prior arrow holder precedes the gain.
   The recorder's per-person daily map + change events capture
   donor, death, and carried-first patterns if present.
5. NO PATH / UNATTRIBUTABLE. If the arrow appears with no
   fullPool trace, no donor fall, no scholar 5-unit gain, and no
   new-person arrival on that day, the verdict is UNATTRIBUTABLE
   with counts — a reported finding, not a guessed source.

## SUBSTRATE, SEEDS, HORIZON

- Substrate: tableseat-nowait (scripts/policies/tableseat-nowait.js,
  which wraps leanlinkrescue; compose upon it, never edit it),
  seeds 73671–73678, 180d death-aware horizon (runDays stops on
  Game.over).
- Re-baseline FIRST: plain tableseat-nowait, 8 seeds, compared
  field-by-field against the 1920Z band table (wins 2/8,
  national-ever 6/8, national-final 5/8, table 4/8, entered 2/8,
  wave-4 6/8, wave-5 0/8, median 152d, deaths 307, starvation 1).
  Report any base delta field-by-field, never silently absorb it.
  Baseline is this arm's OWN replication (8 seeds), NOT another
  arm's corpus.
- Armed: tableseat-nowait wrapped with ONE new observational recorder
  (scripts/policies/arroworigin-diag.js, ARROWORIGIN=1, distinct name,
  never editing existing recorders): per-day, BEFORE the day's
  actions (same convention as the ammostorage daily snapshot, so
  day 1 = post-setup starting state), a per-person arrow map over
  ALL persons (villagers + background_survivors + rosterChars,
  deduped by id, same person lists as ammostorage-diag): carried
  arrow count + stashed arrow count per person, holder detail
  (full items list, full stashed list, fullPool when present,
  equipped ranged) for every holder, scholar inventory arrow count
  + scholar fullPool, roster size, plus change events (any person's
  carried/stashed arrow count moved vs the previous day, with
  previous and current items/stashed lists) and new-person events
  (first roster day, with fullPool + items + stashed).
- Recorders never write game state, draw no RNG, never throw into
  the engine (errors counted). They never call villageStandingTotal()
  or unlockedWave() mid-run. They never call stashState() (a write);
  person reads are raw person.items / person.stashed.
- Cost bar: armed starvation total <= baseline starvation total + 2
  AND armed median days >= 0.8 x baseline median days. G2 identity
  preferred: armed == baseline exactly on days/gameDays/ts/starvation.
- Det-gate: recorders unset == unwrapped on one seed (days/gameDays/ts
  identical, no recorder surface, no installed wraps).
- Cross-checks (an arrow verdict is valid only if all hold):
  (a) this arm's first-arrow day per seed == ammostorage's published
  per-seed first-arrow snapshot day (73672: day 40, 73676: day 1,
  other 6 seeds: none) — recomputed from
  evidence/2026-10-26/perseed-ammostorage-a/s<seed>-armed.json daily
  snapshots, same substrate/seeds, deterministic;
  (b) village-wide arrow totals per day agree with ammostorage's
  daily otherPersonsStashed arrow totals on the arrow seeds;
  (c) recorder errors zero, overflow zero;
  (d) armed == baseline on days/gameDays/ts/starvation per seed (G2).
- BALANCED PANEL (§15): balance-panel.js has no corpus-ingest mode
  (standing limitation from prior arms) — for this no-lever DIAG arm,
  leg-exact determinism is the comparison: baseline vs armed G2
  identity on identical seeds, plus the ammostorage cross-check above.
  No panel file is produced or faked. scripts/telemetry-check.js is
  NOT run on recorder rows (its counts are wrong on recorder rows).

## DIAG-GO THRESHOLD (binding)

DIAG-GO iff an arrival event is identified with a NAMED source from
the code-grounded list above (starting stash / craft event with
crafter + day / loot event / trade event) on BOTH arrow seeds 73672
and 73676, PLUS zero-arrow confirmation across the other 6 seeds
(every daily per-person map totals zero), PLUS recorder neutrality
(days/gameDays/ts/starvation identical recorder on/off, at least a
det-gate seed). A miss is DIAG-NO-GO, never re-scored against a
friendlier metric mid-run; metric doubts go under "metric review"
in the evidence file. Note: "starting stash" counts as a named
source only when the holder's fullPool contains 'arrow' (founder)
or the holder is a first-roster-day joiner whose fullPool contains
'arrow' — a day-1-or-join-day presence without a fullPool trace is
reported as unattributable, not as starting stash.

## SENSE-TESTING

Read a small sample of narrations touching the arrow holder (if
any) from one NON-MEASURED narration-on replay of an arrow seed,
and judge in plain words what a player would and would not see
about the arrow. Starting-stash arrival predicts silence: no line
announces it. Do not chase other blanks.

## WALL NUMBERS (report for this corpus, for band comparison)

national-ever/final, table, entered, wins, wave-4, wave-5, wave-4
kills, median survival, death-cause shares.

## PROOF

scripts/test-arroworigin-a.js re-derives every summary number from
the corpus files deterministically (band table, G2 identity,
det-gate, per-seed first-arrow day + holder + fullPool trace,
zero-arrow confirmation on 6 seeds, ammostorage cross-check
recomputed from both corpora). Run it; keep its output.

## NO [needs-eyes] EXPECTED

Measurement only (re-check at close: flag only if something
genuinely changed that Steve should play).
