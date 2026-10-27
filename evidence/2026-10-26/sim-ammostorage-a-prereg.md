# sim-ammostorage-a — PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

Run: flesh-out loop, run fleshout-20261026T2317Z, arm sim-ammostorage-a,
axis scale-onramp. DIAG / MEASUREMENT ONLY — zero src/js changes, no
default flips, no combat/volley/party code changes, no lever proposal.
A measurement that answers the question is a complete result.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft). No design is invented here.

## QUESTION (blank from sim-volley-a, run fleshout-20261026T2141Z)

Volley-a headline: carried ammo 0/1179 at fight time; world fights get
opts allies 0. The open blank, in the 2141Z run's words: no fighter in
1179 field fights carries a single ammo unit at fight time, but the
recorder sees only the fighter — whether arrows, bolts, and stones sit
in village storage and never reach a fighter's pack was NOT measured.
Do NOT claim a supply failure until storage is measured — measuring
storage IS this arm.

## CODE-GROUNDED STORAGE LANDSCAPE (read from src/js before sweeping)

- The volley counts ammo ONLY from the fighter's own items
  (src/js/fieldFights.js volley section: entries matching ammoId by
  itemId OR material, units summed; each shot spends 1 real ammo).
- Village pantry (state.village.pantry) is food only by construction
  (game.js:2311 "list of food items"; food.js pantryAdd takes finished
  food, enforces a kcal cap). It is still censused for ammo-class
  entries (expect 0; a nonzero count would be a finding, not an
  assumption).
- Village stash (state.village.stash, storage.js stashState): communal
  materials {wood, branch, stone, fiber, ...} + sections tools,
  weapons, medicine, armor, ledger. There is NO ammo section:
  isStashableWeapon requires def.class === 'weapon'; ammo-class items
  cannot be deposited into any section. The one storage reservoir
  that doubles as ammo is materials.stone — stone is both a communal
  material AND sling ammo (sling/phase_sling ammo = "stone").
- Individual ownership (Steve 2026-10-09, game.js): no village armory;
  each villager's own carried items + personal stashed (person.stashed)
  are theirs, never communal. Gear-up pulls weapons from the stash
  weapons section and armor from own stash — no code path pulls AMMO
  from any reservoir into a fighter's pack. Crafting recipes exist
  (arrow: 2 stick + stone + fiber, makes 5; bolt: 2 stick + stone,
  makes 5) and starting pools carry zero ammo (checked: villagers.json
  0 entries, background_survivors.json 100 entries, 0 ammo entries).
- Census buckets per fight (all pure reads; the recorder NEVER calls
  stashState(), which would initialize defaults — it reads raw
  state.village.stash, defaulting missing sections to 0/[]):
  (a) communal stash: materials by id (stone flagged as sling ammo),
  sections tools/weapons/medicine/armor scanned for ammo-class entries;
  (b) pantry scanned for ammo-class entries;
  (c) fighter carried ammo by type (volley mirror) + fighter stashed
  ammo by type + fighter carried-but-unequipped ranged items +
  equipped ranged weapon;
  (d) all OTHER persons' carried + stashed ammo by type (persons =
  Game.data.villagers + background_survivors, deduped by id — the
  volley person lists; rosterChars folded in if present);
  (e) scholar inventory (player pack) ammo by type, reported as its
  own bucket (the player is a villager too, but their pack is a
  separate structure from person.items; if the fighter IS the scholar,
  the proof notes the possible overlap rather than double-counting).
- Ammo types tracked: arrow, bolt, stone, heartseeker_arrows,
  fusion_cell. Stone is counted twice by nature (material units in
  the stash pile; item/material entries on persons) and is reported
  in both buckets separately, never merged into one "stone" number.

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
  (scripts/policies/ammostorage-diag.js, AMMOSTORAGE=1, distinct name,
  never editing existing recorders): at every field-fight moment the
  buckets above, plus the volley gate class for that fight (reuse
  the volley-a gate definitions G0–G8 so counts cross-check: this
  arm's G7-fires total must be 0 and its total field-fight count
  must be 1179 with wave-4 12, matching volley-a's published band).
  Also a light daily storage snapshot (day, storage ammo by type:
  communal materials + section ammo + village-wide person totals)
  so a fight-time zero can be split into "storage also zero that
  day" vs "storage stocked, pack empty".
- Recorders never write game state, draw no RNG, never throw into
  the engine (errors counted). They never call villageStandingTotal()
  or unlockedWave() mid-run.
- Cost bar: armed starvation total <= baseline starvation total + 2
  AND armed median days >= 0.8 x baseline median days. G2 identity
  preferred: armed == baseline exactly on days/gameDays/ts/starvation.
- Det-gate: recorders unset == unwrapped on one seed (days/gameDays/ts
  identical, no recorder surface, no installed wraps).
- Cross-checks (a seed is fully censused only if all hold):
  (a) this arm's field-fight count == volley-a's published per-seed
  count (recomputed from evidence/2026-10-26/perseed-volley-a/
  s<seed>-armed.json, same substrate/seeds, deterministic);
  (b) wave-4 counts agree per seed; (c) every row carries exactly one
  gate class; (d) recorder errors zero, overflow zero;
  (e) G7-fires == 0 band-wide, matching volley-a's 0/1179.
- BALANCED PANEL (§15): balance-panel.js has no corpus-ingest mode
  (standing limitation from prior arms) — for this no-lever DIAG arm,
  leg-exact determinism is the comparison: baseline vs armed G2
  identity on identical seeds, plus the volley-a cross-check above.
  No panel file is produced or faked. scripts/telemetry-check.js is
  NOT run on recorder rows (its counts are wrong on recorder rows).

## DIAG-GO THRESHOLD (binding)

DIAG-GO iff fight-time census rows exist for >= 95% of field fights
AND 100% of wave-4 fights, with the storage / carried / equipped
split quantified per ammo type, AND a verdict naming which of these
the counts support: (a) ammo sits in storage and never reaches
packs, (b) ammo is never acquired/crafted at all, (c) ammo is carried
but not equipped, (d) no storage concept exists for ammo. A verdict
that cannot be split this way is DIAG-NO-GO — say so plainly.
Note: (a) and (d) may split BY AMMO TYPE (e.g. stone sits in the
communal pile while arrows/bolts are never acquired) — a per-type
verdict is a verdict, not a hedge, provided each type is assigned.

## SENSE-TESTING

Read a small sample of fight narrations/transcripts from the corpus
(including any "but no arrows" lines) and judge whether the ammo
story reads sensibly to a player; flag anything robotic, static, or
repeated. One NON-MEASURED narration-on replay of the seed with the
most wave-4 fights (73672 expected, 5 fights); judge in plain words.
Do not chase the separate "wave-4 defeats mourned, never taught"
blank — note it only if transcripts touch it.

## WALL NUMBERS (report for this corpus, for band comparison)

national-ever/final, table, entered, wins, wave-4, wave-5, wave-4
kills, median survival, death-cause shares.

## PROOF

scripts/test-ammostorage-a.js re-derives every summary number from
the corpus files deterministically (band table, gate cross-check vs
volley-a, storage/carried/equipped split per ammo type, G2 identity,
det-gate, daily-snapshot coverage). Run it; keep its output.

## NO [needs-eyes] EXPECTED

Measurement only (re-check at close: flag only if something
genuinely changed that Steve should play).
