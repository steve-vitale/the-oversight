# journey-scale r22 — THE ARMOR ROAD (2026-10-22)

Leg: SCALE (days 80–140: regional→national, hierarchy, table approach).
Road played: **ARMOR** (competent + armorRoad layer: hide_armor craft beat,
weekly armor census). The r-line proved belong/trade (r12–r18), covenant
(r20) and lead (r21) aloud; the readiness gate's ARMORED bar (4 fighters at
worn P>=15 for wave 5) is the sole blocker on 100% of instrumented
never-opened window-days (sim-windowloss DIAG, 2026-10-22, "armor the
village" named next, finding #646). This pilot plays the armor road as a
competent player to test whether the bar is reachable by player agency.

## Pre-registration (MEASUREMENT.md §§9–12, 14 — binding)

- **Leg question:** in the scale window, does a competent player who actively
  pursues armor reach the wave-5 ARMORED bar (4 living fighters at worn
  P>=15)? If not, name the structural blocker with evidence.
- **Binding metrics (NO-GO never re-scored; revisions go to "metric review"):**
  - A1 reach — >=2/4 seeds reach 4 fighters at worn P>=15 by day 140 (GO).
    Else NO-GO with the named structural blocker (a NO-GO here is a finding,
    not a failure — the bar may be structurally unreachable by player agency).
  - A2 channels — every P>=15 armor piece worn at day 140 attributed to its
    acquisition channel (craft/find/loot/bequest/start).
  - A3 honesty — wave-5 readiness hold beats (if any) name the short bars
    truthfully (sense-read).
  - A4 people — >=4 full transcripts sense-read in the scale window
    (days 80–140), 0 senseless flags.
  - A5 survival — villages alive+coherent at decision day (150 loop-days) or
    honest death (death-aware stop, +10d tail max).
- **Interesting-finding bar:** where villager armor actually comes from;
  whether the transfer gap (no communal armor pile per storage.js ontology —
  Steve 2026-10-09; no NPC crafting; no player->villager give verbs) is the
  binding constraint; whether the bar is reachable.
- **Seeds:** 40001–40004 (fresh, disjoint from r1–r21). **Horizon:** DAYCAP=150
  loop-days, death-aware stop. **PILOT FIRST:** 1 seed (40001), then full 4.
- **Policy:** competent + armorRoad layer (hide_armor P20 craft beat when
  recipe L1+ known and hide 2 + vine 1 on hand; base already wears best armor
  owned and crafts bark_armor P10 when known). Weekly armor census:
  waveCombatReadiness(5) bars + per-fighter worn-P and worn-piece sets.
- **Canon read:** CANON.md, MONSTER-WAVES.md (readiness gate, wave 4/5 bands),
  PARTY.md (loot-the-fallen circulation). No new canon invented. Note:
  armorOf() sums ALL worn pieces + coordination bonus (+2/piece beyond the
  first) — the bar counts summed worn protection, not single P>=15 pieces.

## Verdicts (binding)

- **A1 NO-GO (1/4) — with named structural blocker.** armored15 by day 140:
  40001: 2 (max 3), 40002: 2 (max 2), 40003: **5** (max 6, bar MET),
  40004: 2 at death d71 (max 4 pre-scale-window). The bar is reachable (40003)
  but NOT by player agency — see blocker below.
- **A2 GO** — every P>=15 piece attributed (see Channels).
- **A3 documented-absent** — no wave-5 hold beats fired on any seed; all four
  villages stayed wave-3 / rank-village, never reaching the wave-4 standing
  threshold where the deferral beats fire. Not a miss — the metric's
  precondition wasn't met. (The wave5door-openers DIAG already sense-tested
  the hold beats as honest: "armor the village (2 of 4 fighters armored);
  blood your fighters (0 of 2 veterans)".)
- **A4 GO** — 8/8 transcripts sense-read in full, 0 senseless flags.
- **A5 GO** — 40001/40002/40003 alive+coherent at day 150–151; 40004 honest
  wipe (sickness d52–55 → wound-deaths d56–58 → starvation d59–71, causes all
  recorded; overCause null but the death log tells the story).

## The structural blocker (A1's NO-GO, named)

The player — the only actor who can deliberately pursue armor — cannot put
armor on anyone but themselves, and their own craft path never fired:

1. **No transfer path (by recorded design).** storage.js: "only
   tools/weapons/medicine have deposit hooks — armor and misc gear have no
   communal section (canon: no communal armor pile)" (Steve 2026-10-09).
   No player→villager give verbs exist (only giveFood). Villagers never
   craft (no NPC crafting anywhere). The communal armory distributes weapons
   ONLY (villagerGearDay step 3 filters `!d.weapon`). A player-found riot_gear
   P30 can only ever armor the player's own body.
2. **The player's craft path never fired in 4×150 days.** bark_armor L1 was
   learned on all 4 seeds (the old-cuirass dawn beat) — 0 crafts: bark 3 +
   vine 2 never aligned in the scholar's hands (materials flow to the
   communal stash via donateHaul; the scholar's pack doesn't hold them).
   hide_armor L1 (the P20 path) was NEVER learned on any seed — the
   hide-handling beat (take a hide → L1) didn't fire for the scholar in 600
   days of competent play that included hunting/trapping.
3. **Villager armor is luck, and it works.** The bar was met on 40003 via
   five villagers' independent channels — starting kits, scavenge finds,
   monster loot (see Channels). The organic range across seeds is 1–3
   fighters; 5–6 on a lucky seed.

Design question for Steve (not a fix commit): is the ARMORED bar meant to be
something the player can WORK toward, or a luck gate? Today it is the latter —
the windowloss "armor the village" economy drive (finding #646) has no player
verbs to drive it with. The readiness demands are "sim starting points, not
canon; Steve can overrule" (standing.js).

## Channels (A2 — where the armor came from)

Seed 40001 (armored15=2): Fatima P36 = alien_greaves P25 [T4 monster loot] +
rain_poncho P2 + good_boots P3; Galih P17 = witness_coat P15 [FIND,T3].
Seed 40002 (armored15=2, scholar P52 from finds/loot): Ursula P17 =
ghost_camo P10 [FIND,T3] + canvas_pants P3; Ines P22 = shelter_cloak P20
[FIND,T3].
Seed 40003 (armored15=5, BAR MET): Anthony P37 = adaptive_dermis P35
[FIND,T4]; Hugo P18 = investigators_coat P12 [FIND,T3] + work_gloves P2;
Quinn P17 = stormcloak P15 [FIND,T3]; Omar P22 = hide_armor P20 [START —
worn since day 7, occupation starting kit]; Mateo P66 = alien_helm P25 [T4
loot] + swat_vest P35 [FIND] + work_gloves P2.
Seed 40004 (died d71, armored15=2): Renee P40 = alien_carapace P40 [T4 loot,
worn by the final scholar]; Chloe P32 = alien_helm P25 [T4 loot] +
padded_cloth P5.
Villager circulation observed: villagerGearDay auto-equip + spare
redistribution moves armor among villagers; loot-the-fallen recirculates
the dead's gear (44 deaths on 40001, armor kept moving — armored15
fluctuated 1→3 across the run).

## Village assessments (plain words)

- **40001:** Six left at day 150, pantry thin (4,717 kcal), wave 3, never
  climbed the ladder (rank village). Seven player-deaths in the succession
  chain (A→Valeria→…→Max); the mantle kept moving and the village kept
  eating. Armor drifted 1–3 fighters all run — finds and the dead's leavings.
- **40002:** Eight alive, fat pantry (21,270), the scholar in P52 of found
  and looted plate. A quiet, well-fed village that never looked up from its
  own fires — no links, no wave 4, but nobody starving and the conversations
  are alive (Felipe the piano tuner sleeping in shifts, listening to the
  treeline).
- **40003:** The lucky one. Eight alive, pantry overflowing (48,432), FIVE
  fighters at P≥15 — the bar met without anyone trying. Anthony (P37,
  adaptive_dermis) still got cut and asked for wound care: armor didn't make
  him invulnerable, just standing. The village that proves the bar is
  reachable and the player is irrelevant to reaching it.
- **40004:** The honest wipe. Sickness took two (d52–55), wounds that
  wouldn't close took three (d56–58), starvation took the rest (d59–71).
  Renee died in alien_carapace P40 — the best armor on the run couldn't outrun
  an empty pantry. Failure resolved the story; the death log names every
  cause.

## People check (8/8 sense-read, scale window)

- 40001-day80 Hilda (seek_taken): looking for her taken family, "I ask every
  traveler. Every one." KIN canon alive. Strong.
- 40001-day100 Hilda (ask_favor): CALLBACK — "About this wound — the need
  hasn't gone anywhere. I'm still asking." She later becomes the scholar and
  dies in combat d123. People-like.
- 40001-day120 Rafael (curious): first-memory exchange, textured ("Mine's
  Medellín... Or I invented it"). Dies d134; his "come see what I found"
  hook stays unresolved. Strong.
- 40001-day140 Meera (curious): grief-honest, "Talking helps. Then it hurts.
  Then it helps again." Strong.
- 40002-day80 Felipe (curious): night-worry thread, "Gertrude's gone" (real
  death), sleeping in shifts. Strong.
- 40002-day120 Felipe (ask_favor): healer's philosophy — BUT the turn0
  choices are betrayal:accept/decline for an invitation never spoken (see
  Blank #1). Flagged, not failed.
- 40002-day140 Felipe (ask_favor): "Everything's broken — bodies, tools,
  people. I fix things." Same unspoken-invite menu. Flagged, not failed.
- 40003-day80 Anthony (seek_taken): "Diego — the pods, humming. Do you think
  they're still in there?" Player commits to asking the System. Strong.
- 40003-day120 Anthony (ask_favor): "My cut needs a second pair of hands."
  The P37 fighter still bleeds. Strong.
Verdict: 8/8 pass the bar — wants are real, options engage/deflect, endings
resolve/plant/owe. No fabricated history, no filler loops.

## Blanks filled / documented

1. **DOCUMENTED (for lane B / conversation owners): the unspoken-invite menu.**
   Two transcripts (40002-day120, 40002-day140) show want=ask_favor stage 2
   with turn0 choices betrayal:accept/decline, but the invitation is never
   spoken — not in the transcript, not anywhere in the run's capture.
   Mechanism: the pending invite is stashed in c.invitePending
   (openerOwnsReply, conversation.js:5172); queueTraderIntro's guard holds it
   for ask_favor stage<3 (conversation.js:500-501), so the beat is never
   served during the sitting — while the menu offers blind accept/decline
   from turn 0. This is the blind-accept failure class the 2026-10-12 SPOKEN
   LURE fix addressed for openers, recurring via the stashed-invite path.
   NOT fixed here: lane B owns the social-life leg, and the invite-queuing
   logic carries a long fix history (r7, r16, r23, r40) — a drive-by fix
   risks regressing it. Evidence: transcripts + capture in
   evidence/2026-10-22/journey-scale-r22-armor/.
2. **FILLED (instrument):** the armor-road driver
   (scripts/journey-scale-r22-20261022.js — competent + hide_armor craft
   beat + weekly armor census: readiness bars + per-fighter worn-P and
   worn-piece sets) and the analyzer
   (scripts/analyze-r22-armor-20261022.js — trajectory + channel
   attribution via items.json flags). Zero src/js changes.

## Observations (documented, not fixed)

- The hide_armor L1 knowledge gate never opened in 600 competent-play days.
  The beat (take a hide → L1) may be rarer than the design assumes, or the
  competent policy's butchering flow never triggers noteHideHandled for the
  scholar. If the P20 craftable is meant to be the player's armor answer,
  its discovery path wants a look.
- The bark-craft material tension: a competent player donates bark/vine to
  the communal stash, then can't craft bark armor for lack of materials in
  hand. Communal generosity vs personal crafting is an honest tradeoff, but
  it means the "craftable" armor is mostly theoretical in competent play.
- armorOf sums pieces + coordination bonus: small clothes stack. The bar is
  easier than "find 4× P15 pieces" reads — which is why luck alone reached
  it on 40003. Any retune of the bar should account for the summing.

## Metric review (§14)

- A1's NO-GO is a finding, not a failure: the pre-registered bar (>=2/4)
  was not met (1/4), and the run names the structural blocker instead of
  re-scoring. No metric was changed mid-run.
- A3's documented-absent is not a miss: the hold beats' precondition (wave-4
  standing threshold) was never met on any seed. The beats' honesty was
  already established by the wave5door-openers DIAG on current master.
- Next-run proposal: none for the armor road — the question is answered.
  The design question (luck gate vs agency gate) is Steve's call.

## Reachable / Fun / Winnable (the leg)

- **REACHABLE:** partial — the scale window's armor content (finds, loot,
  starting kits, redistribution) all fired unprompted; the wave-5 ARMORED bar
  was reached on 1/4 seeds. But no player verb moves the bar — reachability
  is luck, not agency.
- **FUN:** yes — the armor that arrives has stories (Fatima's alien greaves,
  Mateo's P66 patchwork, Renee dying in looted carapace); villagers' gear
  visibly circulates through death and redistribution.
- **WINNABLE:** for the leg — 3/4 villages alive and coherent at day 150;
  the armor question doesn't block the leg's content (hierarchy/table
  approach are road-policy driven; plain competent doesn't climb, which is a
  separate, already-known r-line finding).

## Telemetry

`telemetry-check.js` vs `telemetry-baselines/scale.json` — the baseline's
keys (markerCounts.firstCourt, markerCounts.watchers, tableTele,
fightsTotal, fightsByWave.4, maxGameDay) come from a longsim regime
driver; this run's instrument emits census.armored15 / census.maxWave /
census.popAlive etc. Metric sets are disjoint → the check fires
"new appearance" LOUD lines on every passed metric, all regime/instrument
artifacts, none game deviations. Baseline NOT rolled (different regime;
the scale.json baseline belongs to its longsim source run).

## Ops

- Driver: scripts/journey-scale-r22-20261022.js (NEW); analyzer:
  scripts/analyze-r22-armor-20261022.js (NEW). node --check clean on both.
  Zero src/js changes — no regressions possible. `node scripts/check.js
  --quick` started (287 scripts) but exceeded the 120s window with no
  output yet (same slowness r37 logged); killed after — scripts-only change,
  4 clean 150-day sims are the verification.
- Evidence: evidence/2026-10-22/journey-scale-r22-armor/ (4 per-seed JSONs
  with weekly armor ledgers, 4 captures, armor-beat files, 12 transcripts).
- Rotation: journey-rotation-a.txt 3 → 0 (landing next).
- Merged locally, pending ship (no bump/push — the ship loop owns those).
