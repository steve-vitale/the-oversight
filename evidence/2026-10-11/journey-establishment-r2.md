# Journey leg: ESTABLISHMENT (days 14–40) r2 — 2026-10-11 (17:30 run)

Second establishment pass today (rotation read 1; previous run wrote 2 but a
landing run later rewrote 1 — played leg 1 again). Canon read: CANON.md,
CONTESTS.md, MONSTER-WAVES.md (+ PRESERVATION.md from the prior run).
Reused `scripts/test-journey-establishment-20261011.js`, competent policy,
seeds 20261011 / 777 / 424242. Focus: verify the prior run's documented
blanks against today's contest/viewership commits (5d5a4315, f051c402,
ad721cee — all landed AFTER the morning establishment run).

## What changed in-game since the morning run

- **Pilot episode: IMPLEMENTED** (prior blank #1, now filled by a later run).
  fireContest (contests.js:1796) says it OUT LOUD — "What follows is our PILOT
  EPISODE — a test broadcast. Pardon the jank." — with real roster names via
  _cxNameList ("Our first-ever contestants: X, Y and Z... We practiced the
  names."), stakes and countdown dread untouched. Canon-honest.
- **Contest scheduling: FIXED** (prior blank #2). Morning run: 1 event/seed
  over 120 days. This run: seed 777 → 5 contests fired + 1 show; 424242 → 2
  contests + 1 show; 20261011 → 1 contest before the scattering. The
  ratings-driven scheduling (base 0.25/day, dip-gated, 2/week budget) now
  fires inside budget — 4–6 events per leg, not 1.
- **Prize lanes** (5d5a4315: ability offers, synergy hints, knowledge dumps)
  exist but are rare in-leg: 0 fired across 40 days / 6 contests on 424242
  (probe). Expected rate ~0.5/leg — not a bug, longsim-loop territory.

## Village assessment (plain words)

**Seed 20261011 — the scattered village.** Famine, day 20, 9 alive. The pantry
hit zero on day 18; three hungry days later the village walked in different
directions: "Haven couldn't hold. On the third hungry day, people started
walking — in different directions. The scattering, again." The Hunger Winter
crisis beat fires first (same day — the crisis IS the scattering), then the
resolution. 7 dead before it (combat + monsters). An honest, narrated loss —
not a bug. The scholar survived with full HP and 1500 kcal while the village
starved: the competent policy feeds the player, not the pantry.

**Seed 777 — the grieving village.** 12 → 5 alive. Wave 2 unlocked (ledger 6
points, per-type caps holding: hummice 2, nightcourt 2, mirrormoth 1,
lockpick 1). 5 contests fired (wrongmap, whoate, starve, lies, honey) + a
complaint_box show. Pantry 37k → 3k kcal, 3 starvation deaths — food pressure
is the thesis, working as designed. Survivors: Lena (ER nurse), Sofia
(community gardener), James (carpenter), David (plumber), Emma (vet) — all
grieving, trust 1–52, 14–17 plants known each. The village fights its own
fights: 6 wave-1 kills by villagers.

**Seed 424242 — the fed village.** 12 → 5 alive. Wave 2 (ledger 7 + 1
wave-2 point: an understudy kill by villagers). Pantry 19.3k kcal, 10k
preserved — the smoke technique works when staffed. 2 contests (witness,
calorie_run) + mouth_race show. 13 deaths, mostly combat. Specialists:
bush pilot, ER nurse, veterinarian, plumber, carpenter — trust 1–67, all
lonely/steady.

## People check (SENSE-TESTING — transcripts read)

- **Sofia (777, day 25, sick): a person.** "achy and wrung out, barely keeping
  food down. I need someone who knows what they're doing." Player commits;
  resolution='promised' → favor.state='promised', promisedDay, memory, journal
  entry, 'repay' follow-up seeded. The favor system closes the loop.
- **Lena (777, day 35, starving ER nurse): coherent.** "My hands shake when I
  try to work." Commit → 'promised'. In a starving village, the nurse can't
  nurse. Nothing about it is filler.
- **James (424242, day 25, share_news): the fixed pipeline holds.**
  Hook promise answered ("something happened this morning" → the treeline
  sighting), three distinct news types (tension, Ursula's occupation gossip,
  the treeline), grammar fixed ("weren't what they said", "social worker"),
  honest exhaustion ("That's everything I've got... That's... pretty much all
  of it, honestly.") then a natural close. No repeats, no dropped hooks.
- **Tamika (20261011, day 20, grieving mortician):** organizes a creek water
  run the day after Sofia's combat death; betrayal case options reference the
  real open case ("the ambush of Sofia"); mourning option present. Commit →
  'promised'. Coherent grief, coherent ask.

Villagers ask for things they need, remember promises, and fight their own
fights. Prior fixes B–E verified holding on fresh seeds.

## Blanks filled (tooling, in-worktree, proof-tested)

**F. Harness contest log lost fires on busy seeds.** state.telemetry is capped
at 300 entries (game.js tele()); the harness's once-per-day contestEvents()
read missed contest_fired entries trimmed before the read — seed 777 logged
a 'honey' contest_end with no corresponding fire. Fix: unbounded Game.tele
side-channel (teleSide) wrapped in runSeed; contestLog now reads from it.
Re-run: all 5 fires + the complaint_box show now appear.

**G. buildCensus agencyXP read the global map.** Game.agencyOf(vid) returns the
village-wide agency state (xp keyed by villager id); the old reader put the
whole map on every villager — all 12 villagers "had identical XP" in every
census. Fix: (agencyOf(id).xp||{})[id], the same convention contestEngine.js
and fieldFights.js use. Villagers now differentiate (tracking 0/1/3...).

Proof: `scripts/test-journey-establishment-tooling-20261011.js` — 6/6 on
seed 777 (per-villager XP shape, no villager-id keys, differentiation;
trim reproduces the loss, side-channel survives it). Full harness re-run
3 seeds green (exit 0).

## Blanks documented (not fixed this run)

1. **Pilot-window coverage.** Canon wants the first challenge ~day 14–21.
   Base 0.25/day means ~(0.75)^7 ≈ 13% of seeds fire nothing by day 21
   (424242's pilot landed day 32 this run). A week-3 pilot guarantee would
   serve the design; scheduling levers belong to the longsim contest
   rotation — flagged, not changed.
2. **Starvation variance.** Seed 777 starved again (pantry 37k → 3k, 3
   starvation deaths) under identical competent policy. Same land-productivity
   story as the morning run. Food is the mid-game wall (Steve 2026-10-11);
   lever territory for the food rotation, not a bug.
3. **Prize-lane rarity in-leg.** 0 lane prizes across 6 contests / 40 days.
   Matches the 200d calibration (~0.5/leg); fine, but worth watching that
   establishment-leg players ever SEE an ability offer before day 40.

## Verdict: reachable / fun / winnable

- **Reachable:** yes — pilot episode, 2/week TV cadence, wave-2 unlock,
  specialist duties (garden/fish/cook staffed and rotating), favor promises
  with real obligation tracking, famine scattering. All fired in normal play.
- **Fun:** yes. The leg now has a heartbeat the morning run lacked: the show
  interrupts regularly, villagers beg for food and medicine, promises stick.
  The scattering ending is a real gut-punch with a name, not a wipe.
- **Winnable:** the leg is the on-ramp, not the win — but all three seeds
  show the engine working: food → preservation → knowledge → wave
  progression, with honest failure modes (famine scattering, combat wipe).

## Files

- Harness: `scripts/test-journey-establishment-20261011.js` (fixes F, G)
- Proof: `scripts/test-journey-establishment-tooling-20261011.js` (6/6)
- Fix commit: 8f52a5e (scripts only; no game code touched)
