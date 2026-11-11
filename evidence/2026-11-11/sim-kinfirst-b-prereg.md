# Kin / naming / childbirth / keepsakes — first numbers: pre-registration (arm sim-kinfirst-b)

Run fleshout-loop-b-20261111T1131Z, Loop B. Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written BEFORE any judged sim.
Base commit b09cf584e. No judged sim has run on this base yet; the pilot
runs on b09cf584e, recorded in the evidence.

## Canon

- docs/CANON.md read first. **docs/KIN.md EXISTS and covers kin/the
  Taking**: half of adults taken at the Scattering (day zero, never
  later); the taken half's kids in stasis; the System never confirms the
  taken dead or alive; kids' return is a WEIGHT (intrusions, promises as
  debts, social memory, the Jackpot, the table), never a meter, quest or
  prize. The canon doc is about the Taking and the stasis kids — it says
  nothing about births in the village, about naming newborns, or about
  keepsakes as a growth system.
- **Keepsakes**: no dedicated canon doc, but docs/COHERENCE-SPINE.md
  §"Keepsakes: the growth model" (Steve 2026-10-14) is the design source
  keepsakes.js cites: sentimental items worn in acc1–acc4, bond +1/day
  worn (+3 at story moments), dormant in the pack, L1 ≥10 passive, L2
  ≥25 combat action, L3 ≥50 evolution offer; "Keepsakes belong to your
  real relatives"; a Taken relative turns the keepsake's place/name
  reveal into a clue (the thread home); in THE HOSTS the people bonded
  keepsakes belong to come home by name.
- **Naming rite**: NO canon doc. src/js/naming-rite.js cites only the
  "rogue P0-8, Vermilion/Nuzlocke talk" audit (Steve 2026-10-22):
  permadeath + naming is the genre's attachment engine; newborns get
  true names, trusted villagers get use-names; a name is only ever set
  by an explicit player action, never automatically; calledName ADDS
  identity, the true name stays on the record.
- **Childbirth**: NO canon doc. The only source is the code comment in
  game.js simVillageDay (Steve 2026-10-07): births are RARE, human
  gestation is 9 months — a birth only happens after the village has
  existed 270+ days, 0.5%/day, "most playthroughs see zero births.
  That's realistic."
- **Succession / the mantle**: measured by the journey-succession
  program (r91–r170) and sim-scholardrain-b; the operative law is in
  code (ledger.js playerDeath, villager-build.js mantleBecome) and in
  Steve's 2026-10-14 ruling quoted in villager-build.js: "No I don't
  think you should take your XP or the abilities. You become that
  villager." No cross-run inheritance (ledger.js lineage header).
- Nothing is invented here; the code citations below are the source of
  truth. Canon gaps, recorded in the evidence: naming and childbirth
  need canon docs the way the Taking has docs/KIN.md; keepsakes have a
  design section in COHERENCE-SPINE.md but no standalone doc.

## The systems as coded (with file/function citations)

### Births — distant villages only, day ≥270 (game.js simVillageDay)
- `simVillageDay(village)` (game.js:10325) is "ONE lived day for a
  distant village" — called from catchUpSim and from endDay for joined
  villages. The birth block (game.js:10428–10460): `village.day >= 270
  && Math.random() < 0.005`, needs ≥2 living coupled adults age 18–40;
  the baby is born UNNAMED (`name: null, unnamed: true, birthDay:
  village.day, age: 0, parents: [parent.id, parent.partner]`),
  pushed to the village roster, population++, a news line
  ("👶 A baby was born to X on day N — still unnamed. They say
  they're holding the name."), drama 'villageBirth'.
- **No birth code exists for the HOME village** (grep: the only
  birthDay/unnamed creation site in src/js is simVillageDay). Home
  roster growth comes only from arrivals/joins, never births.
- Structural consequence for this pilot: at a 150d horizon, births
  are UNREACHABLE by design (day < 270 on every seed). Births = 0 is
  a structural zero, not a failed measurement — recorded as such.
- Babies can die: the same simVillageDay hunger block kills "the old
  and the very young first" (age < 5 vulnerability 2); old-age deaths
  at age > 75, 0.5%/day. Aging is fractional (+1/365 per day).

### Naming — naming-rite.js (player-initiated only)
- `babyNamingPending(villageId)`: the village card's gate — an unnamed
  baby whose parents asked the bearer, still waiting.
- `nameBaby(villageId, babyId, name)`: the player names the newborn;
  baby.name set, unnamed=false, namedBy='bearer', namedDay; parents
  repeat it; village trust +2; news line; journalNote. Refuses
  honestly when the baby is gone, already named, or no name comes.
- `bestowUseName(vid, name)`: use-name for a trusted villager —
  gate `useNameThreshold()` = 75 ('loyal' trust band), adult (age ≥15),
  alive, not the player, no use-name yet, name known. Sets
  calledName/calledNameDay/calledNameBy='bearer'; true name stays;
  reaction voiced from temperament; remember 'usename' (sticky) +
  journalNote + socialTick.
- `nameUnnamedBabies(village)`: the parents' right — if the bearer
  never comes, the village names the child at 30 days (genNameForOrigin),
  namedBy='parents'; clears pendingBabyNaming; news line. Called from
  simVillageDay.
- `distantShortName(p)`: unnamed newborns print as "the baby", never
  "null". `sanitizeGivenName`: 24-char cap, null on empty.
- **Competent policy never calls any of these** (0 occurrences of
  villageTalk/nameBaby/bestowUseName/equipAccessory in
  scripts/policies/competent.js). Player-initiated naming is expected
  to be 0 under competent — itself a first number (the rite is
  player-only and the driver never plays it).

### Keepsakes — keepsakes.js + game.js accrueRelicBond
- Identity: `keepsakeLane(item)` (resolve/anchor/quiet_luck, authored
  LANE_BY_ID; unlisted default resolve), `keepsakeLevel(item)` 0–3 by
  bond [0,10,25,50], `keepsakeIsWorn` (acc1–acc4), `wornKeepsakes()`,
  `keepsakePassive(lane)`, `keepsakeMine` (owner-lock: a stranger's
  keepsake is just stuff).
- Grants: keepsakes enter at character creation via
  `genPersonalPool` (lifeseed.js:445–538) — 1–2 kin keepsakes among the
  8-item personal pool, the player picks 5; villagers carry keepsakes
  in their own items (npcKeepsakeLine: "visible to the observant — and
  lootable from corpses"); a dead villager's keepsake carries
  `memoryOf` (progression.js playFlashback: "You carry X with you").
  There is NO mid-run keepsake grant verb — the only "new" keepsakes
  in play arrive with a new bearer (mantle) or off a corpse.
- Growth: `accrueRelicBond()` (game.js:25467, daily, day resolution)
  calls `keepsakeGrow(r, 1, 'day')` for worn, owned sentimentals.
  `keepsakeGrow(r, gain, why)`: worn + mine or nothing (dormant in
  pack); bond += gain (MOURNER'S BOND bond_mult); level beats via
  `keepsakeLevelBeat` (L1: flashback once + thread check + say line;
  L2: combat action unlocked); `keepsakeMaybeOffer` → L3
  `offerRelicEnhancement(r, 50)` (relicOfferThresholds: keepsakes
  [50] only; the 10/25 offers are retired for keepsakes).
- Thread home: `keepsakeThreadCheck(r)` — if the keepsake's kin
  person was Taken (keepsakeKinPerson via lifeseed + def.kin;
  keepsakeKinTaken via takenKinOf), records takenKin on the item and,
  on a place/name reveal, a clue in state.keepsakeThread.clues with a
  "🧵 THE THREAD HOME" say line. `keepsakeTrailCheck(r)`: L2+ worn
  keepsake names the kin's region (nomadScenes.sharpenTrail).
  `keepsakeTakenKin()` / `keepsakeClues()` are the endgame read-outs
  (THE HOSTS / the Table: bonded keepsakes' people come home by name).
- Powers: L1 passives — `keepsakeLuckyBreak` (L2 Lucky Break / L1 1-in-5
  miss→hit), `keepsakeHoldsGround` (L2 Hold), `keepsakeAnchorPursuit`
  (anchor chaser stamina), resolve trauma cut in the addTrauma wrap
  (−25%, ≥1). L2 actions — steady / hold / lucky_break via
  `useAbility('keepsake', id)`, once per fight (tbfight.ksUsed),
  40 kcal + the turn. `keepsakeActivatables()` lists them in combat.
- Slots: `equipAccessory(idx, slot)` — keepsakes and accessory gear
  share the same four acc slots; full set refuses with an explanation,
  never silently swaps. `migrateKeepsakes()`: new runs start with
  keepsakes worn (highest bond first); load migrates old saves.
- Burial: `playerDeath` (ledger.js, KEEPSAKE BURIAL r100 2026-11-01)
  buries the dead bearer's keepsakes with the body — "keepsakes are
  buried, never taken from the body" — and SAYS so when any were
  carried. Keepsakes are never inherited.

### Kin as lived — lifeseed.js + bond-initiation.js + ledger.js
- `genCharacter` attaches a lifeseed: region anchor, named PEOPLE
  (kin relations from lifeseeds.json templates), places, events, skill
  origins, a wound, a want. `lifeseedKin(char, rel)` resolves a
  relation to a name; `takenKinOf(vid)` lists lifeseed kin whose fate
  mentions the Taking; `resolveKeepsakeText` fills {kin}/{place}/
  {first} in item memories from the seed. Backstories, keepsakes,
  flashbacks and motives all read from the SAME seed (coherence).
- Kin-link formation IN play: births create parents links (above);
  villagers initiate bonds on their own (bond-initiation.js, Steve
  2026-11-04 — measured by convfirst/trustfirst, NOT re-measured
  here); roster persons carry partner/children fields.
  `death_in_family` is a strange-track deed (tracks.json) — abilityfirst
  counted 746 events band-wide; this arm counts it narrowly via a
  deed-only wrap (see instrument) as the kin-death signal.
- Succession: `playerDeath(cause)` (ledger.js:658) — the village
  mourns, the corpse is registered (village.fallen memorial roll),
  the dead bearer's keepsakes are buried, `lineage()` gains an entry
  (name, epithet, day, cause, playstyle), then a successor is chosen
  and `mantleBecome(oldId, newId)` (villager-build.js:551) runs: the
  successor brings THEIR OWN abilities/tracks/level-up queue/deed
  caps/godhood/inventory/equipped/languages/knack — the predecessor's
  die with them; the OFFICE keeps integration (and so slots), arc,
  ledger, Codex, trust. Tele 'mantle_become' fires (villager-build.
  js:705). The only game overs: the table, or the village dies out.

## What the existing tests prove — and what they do NOT

Existing coverage (journey-succession r91–r170, sim-scholardrain-b,
sim-childbirth-b 2026-10-28 seeds 10410–10417, keepsake/channeling
tests) proves the verbs work when CALLED: births fire after day 270,
naming sets names, keepsakes grow when worn, the mantle passes and the
successor starts over. None of them measures whether kin / naming /
birth / keepsake life ever HAPPENS in a lived village under default
competent play: no birth counts by village, no naming outcomes, no
keepsake bond/level distribution in the wild, no thread-home clues,
no keepsake powers fired, no mantle keepsake-burial counts, no
lifeseed-kin-as-lived census. This arm measures exactly that, on a
plain competent band.

## Backlog claim

No sim-findings.md line is claimed by this arm. (Checked 2026-11-11:
no open line names kin/naming/childbirth/keepsakes first numbers; the
closest lines are about specific levers, not this census.) Any kin gap
this arm surfaces is APPENDED as [open] in the evidence file's
findings section and in sim-findings.md, not claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: the keepsake verbs are wired and driven — accrueRelicBond
   runs daily, competent channels keepsakes (channelDevotion in
   competent.js ~3293), migrateKeepsakes wears them at new game. The
   naming verbs are player-initiated only and competent never calls
   them — expected 0, proven live in the fixture by direct calls and
   marked dead-under-competent if the pilot never fires them. Births
   are structurally unreachable at 150d (day ≥ 270 gate) — proven by
   code reading, not by a zero count; the pilot confirms the zero.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar ratio
   to size. The addressable pool is every keepsakeGrow call, every
   level beat, every thread check, every naming call, every birth
   (expected 0), every mantle transition, every lifeseed-kin record
   per bearer. The engagement floor (GO table) is set from the pool's
   nature: keepsake growth is daily and unconditional for worn
   keepsakes, so if the band produces <5 keepsakeGrow events the
   census is uninterpretable, not a GO.
3. **Verb existence**: nameBaby, bestowUseName, nameUnnamedBabies,
   babyNamingPending, keepsakeGrow, keepsakeLevelBeat,
   keepsakeThreadCheck, keepsakeTrailCheck, keepsakeMaybeOffer,
   offerRelicEnhancement, accrueRelicBond, keepsakeLuckyBreak,
   keepsakeHoldsGround, keepsakeAnchorPursuit, equipAccessory,
   migrateKeepsakes, playFlashback, playerDeath, mantleBecome,
   lineage, takenKinOf, lifeseedKin, keepsakeTakenKin,
   keepsakeClues, useAbility ('keepsake' actions), creditDeed
   (death_in_family only) all exist in the engine (citations above).
4. **Horizon fit**: 150d covers the full village life (sibling pilots'
   median survival 116–140d); keepsakes need ~50 worn days to reach
   L3, the mantle turns over many times in 150d, naming/births are
   whole-life questions. Same horizon as the siblings for
   comparability. Births stay structurally out of reach at 150d — a
   270d+ horizon would be needed to see even one, and is a NEXT-run
   question, not this pilot's.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of kin / naming /
childbirth / keepsakes in a lived village** — every kin event
classified by kind + outcome, none 'other'; every birth/naming/
keepsake/mantle event attributed; every wrapped method verified live
or marked dead; neutrality exact; complete per-seed tables + sense
scenes quoted.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every kin event classified by kind + outcome, none 'other' | 0 unclassified kin events across the pilot (birth, naming, keepsake-grow, keepsake-power, thread-clue, mantle, death_in_family — each with a known kind and a known outcome) |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted |
| Engagement floor | ≥5 keepsakeGrow events band-wide, else the pilot is uninterpretable, not GO (births are structurally 0 at 150d and do not count toward the floor) |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 10)

1. Births: count by village (home vs distant — home expected 0 by
   code, distant expected 0 by the day-270 gate at 150d); day,
   parents, named-by-bearer vs named-by-parents vs still-unnamed at
   end; baby deaths (hunger/old-age in simVillageDay); roster
   presence of unnamed babies at end. A birth on any seed is a
   prereg SURPRISE to report, not a re-score.
2. Naming: nameBaby calls/outcomes (granted / already-named /
   empty / gone); bestowUseName calls/outcomes (granted / trust-gate
   / dead / empty); nameUnnamedBabies auto-names (count, namedBy);
   babyNamingPending offers seen; use-names held at end (calledName
   per villager); sanitize rejections.
3. Keepsakes held: starting keepsakes per bearer (id, kin relation,
   lane, bond at mantle start); keepsakes arriving with a new bearer
   (their person.items/equipped); keepsakes looted from corpses
   (memoryOf items entering inventory); keepsakes buried at each
   mantle; keepsakes held at end per bearer (worn vs pack).
4. Keepsake growth: keepsakeGrow events by why (day / story);
   bond totals per keepsake; level crossings L1/L2/L3 (when, which
   lane); flashbacks played (playFlashback keepsake-classified);
   L3 offers (offerRelicEnhancement on keepsakes: options offered,
   threshold); accrueRelicBond calls vs keepsakeGrow calls
   (worn-only discipline — pack keepsakes must show 0 growth).
5. Keepsake powers in play: L1 passives firing (keepsakeLuckyBreak
   true/false + why, keepsakeHoldsGround, keepsakeAnchorPursuit
   values, resolve trauma cuts via addTrauma wrap — count only);
   L2 actions pressed (useAbility 'keepsake' calls: steady/hold/
   lucky_break, returned, kcal paid, once-per-fight respected);
   keepsakeActivatables offered vs pressed.
6. Thread home: keepsakeThreadCheck outcomes (taken-kin found or
   not, clue recorded or not, kind place/name); keepsakeTrailCheck
   outcomes; keepsakeThread clues at end (kind, kin, relation,
   region named or not); keepsakeTakenKin at end (item, kin, bond,
   level, clue?).
7. Kin as lived: lifeseed kin per bearer (people count, relations,
   taken kin via takenKinOf); keepsakeKinPerson links (keepsake →
   lifeseed person); death_in_family deed events (count, who);
   partner/children links on the live roster at end; village.fallen
   memorial entries.
8. Succession / inheritance: playerDeath events (cause, day, old
   bearer, successor id); mantleBecome events (old→new, abilities/
   tracks/gear the successor brings); lineage entries (count, causes);
   keepsakes buried per mantle; what the successor inherits (their
   own keepsakes worn at mantle — snapshot diff); scholar deaths
   band-wide; mantle churn vs keepsake bond survival (bond resets
   to the successor's own keepsakes — the predecessor's bond dies
   with them).
9. Say-line coherence: every kin/naming/birth/keepsake/mantle say
   line in the corpus classified (birth line vs roster birth,
   naming line vs namedBy, thread-home line vs clue recorded,
   burial line vs buried count, mantle line vs lineage entry,
   L1/L2 beat line vs level reached); any line whose number or
   name contradicts the live state it describes.
10. Wall numbers: national / table / wins, wave 4–5 unlocks,
    median survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: keepsakes need ~50 worn days to L3, the mantle turns
  over many times, naming/births are whole-life questions; sibling
  first-numbers pilots ran 150d with median survival 116–140d, so
  150d captures the full village life without ticking dead villages.
  Same horizon as the siblings for comparability. Births are
  structurally out of reach (day-270 gate) — noted, not chased.
- **Seeds: 190341–190348 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 190341–190348:
    zero hits.
  - Searched ALL dated evidence `.md` (full evidence/ tree,
    ripgrep word-boundary, all eight seeds at once): zero hits.
  - Searched ALL goal hidden_files `.md`: zero hits.
  - No perseed directory names any seed 190341–190348 (listing of
    evidence/ checked).
  - Known used 19xxxx bands: 190211–190218 (trustfirst-a),
    190221–190228 (abilityfirst-a), 190301–190308 (vetfirst-b),
    191702, 199585 — none overlap. Prior kin work sim-childbirth-b
    used seeds 10410–10417 (2026-10-28) — no overlap.
  - No standalone forbidden/contaminated band list exists in the
    goal hidden_files (listing checked).
  - NOT completed: word-boundary grep over multi-MB per-seed JSON
    contents (the first attempt matched pantry-value false
    positives like `"53": 19034` and was killed before it could
    finish cleanly) — the .md scan + prereg scan + perseed-directory
    scan cover the naming surface. Recorded honestly: a stray
    numeric coincidence inside a per-seed JSON cannot be excluded
    by this search — the band is fresh as a SEED naming, which is
    what the skill guards.
  - Search scope recorded so a later reader can retrace it.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg). No COMPETENT_TALK, no other env gate — default
    competent is the measurement substrate.
  - **neutral:** control policy, instrument OFF (no wraps, no
    snapshots; end-of-run wall numbers + days + end pantry kcal +
    deaths only), same seeds — must match the instrumented control
    leg exactly on days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/kinfirst-instrument-20261111.js — wraps (record-only,
never alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game).
- nameBaby: every call — village, baby, name, ok/already/empty/gone.
- bestowUseName: every call — vid, name, ok/empty, trust at call,
  gate outcome.
- nameUnnamedBabies: every call — village, babies auto-named
  (id, name, namedBy) from roster diff.
- babyNamingPending: every call — village, pending or null.
- keepsakeGrow: every call — item id, gain, why, bond/level
  before/after, worn?, mine?, lane.
- keepsakeLevelBeat: every call — item, before/after level.
- keepsakeThreadCheck: every call — item, taken-kin found or not,
  clue recorded or not, kind.
- keepsakeTrailCheck: every call — item, ok.
- keepsakeMaybeOffer: every call — item, offered or not.
- offerRelicEnhancement: every call — item id, class, threshold,
  options offered (ids), secret option or not.
- accrueRelicBond: every call — day (count only; the per-item
  discipline is proven by keepsakeGrow records).
- keepsakeLuckyBreak: every call — where, returned.
- keepsakeHoldsGround: every call — fighter kind, returned.
- keepsakeAnchorPursuit: every call — returned.
- addTrauma: every call — n in, amt out, resolve-cut applied or
  not (count only; the wrap forwards the original's return).
- equipAccessory: every call — idx, slot, target or refusal.
- migrateKeepsakes: every call — returned, keepsakes worn after.
- playFlashback: every call — item id, memoryOf or not,
  keepsake-classified or not.
- useAbility: every call, recorded ONLY when abilityId ===
  'keepsake' — action, returned, kcal before/after, inTb.
- creditDeed: every call, recorded ONLY when deedId ===
  'death_in_family' — who, granted.
- playerDeath: every call — cause, old bearer id/name, villagerId
  before/after, lineage/fallen lengths before/after, keepsakes
  buried (inventory sentimental count before, after).
- mantleBecome: every call — oldId, newId, abilities/tracks/gear
  the successor brings (counts), tele 'mantle_become' cross-check.
- tele cross-check: 'mantle_become' events only.
- Births: NO Game method exists — detected by daily snapshot diffs
  of every otherVillage roster (new person with birthDay, unnamed)
  + village.news 👶 lines; home roster diffs likewise (expected 0).
- Daily snapshot: scholar keepsakes (inventory + equipped: id, kin,
  lane, bond, level, worn, owner, memoryOf, takenKin), keepsakeThread
  clues, keepsakeTakenKin list, bearer id + lifeseed people + taken
  kin (takenKinOf), home roster (id, age, partner, children,
  calledName, unnamed), otherVillages roster summary (count, unnamed
  babies, named babies, pendingBabyNaming), lineage entries, fallen
  entries, pantry kcal, roster size, standing, scaleRank,
  nationalLive, wave.
Driver: scripts/kinfirst-driver-20261111.js (mirrors
abilityfirst-driver; Game.say wrap with a kin/naming/birth/keepsake/
mantle regex for the sense corpus, 200 lines/seed cap — same
early-game-only caveat as the siblings). Analyzer:
scripts/kinfirst-analyze-20261111.js (classifiers for kin events by
kind + outcome; snapshot reconciliation for births, namings,
mantles, keepsake burials). Proof:
scripts/test-kinfirst-b.js (each wrap proven live on a fixture or
miniature; RED checks on the pre-fix instrument where a wrap is dead
by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-trustfirst-a,
sim-abilityfirst-a, sim-fishstaff-b, cookfirst-a, preserve-a,
fishfirst-a, travelfirst-a, tradefirst-a). The control/neutral legs
are the neutrality proof, not a panel. Panel context: **no panel
metric** for kin / naming / childbirth / keepsakes (coverage audit
§4: "Kin / taking, naming, childbirth, keepsakes — Partial: Barely —
keepsakes via sootheTrauma/channelDevotion; no panel metric") — this
arm supplies its first-numbers analogue (Metrics 1–9); succession /
mantle is already Measured (audit §4).

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (abilityfirst-a: median survival 116d, 1/8 survived,
630 deaths over 851 village-days; 88 scholar deaths, 74 mantle
transitions). If the instrument changes any numeric field vs the
recorder-free baseline, the arm is NO-GO on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
