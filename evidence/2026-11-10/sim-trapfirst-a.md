# Trapping — first numbers: pilot evidence (arm sim-trapfirst-a)

Run fleshout-20261111T0315Z (adopted by fleshout-20261111T0421Z), Loop A.
Coverage Program Tier 2 (Steve 2026-11-10 "Measure all"). Prereg:
evidence/2026-11-10/sim-trapfirst-a-prereg.md (committed 67919bea5, base
ad6a04b27). **Measurement arm, no lever, no src/js change.** Judge ONLY
against the prereg (§14); a GO makes NO landing claim and spends NO confirm
band.

## Verdict: GO (instrument validity + complete capture)

| GO check (prereg) | Bar | Observed | Verdict |
|---|---|---|---|
| Every trap event classified by method + caller + kind, none 'other' | 0 unclassified events | 0 unclassified deposits, 0 unclassified carcasses, 0 unclassified sets (see pit-flag note below — the event is classified three ways; only the analyzer's `caught` boolean disagrees) | GO |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent | All 14 wraps fired live on ≥1 pilot seed (craft only on 180247/180248; eatOne only on 180245). gwTrapTick caller never fired (0 trap spawns) — proven live in the proof miniature (B15/B15b) and marked dead-in-pilot | GO |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds | 8/8 exact (see table) | GO |
| Instrument errors | 0 on all seeds, all legs | 0 control, 0 neutral | GO |
| Complete first-numbers capture | per-seed tables for metrics 1–8; sense-test scenes quoted | Tables below for all 8 metrics; sense scenes quoted; two sub-items explicitly marked unmeasured (metric 7 rot loss; metric 4 trap-spawn HP in the pilot) | GO |

## Pre-registration header (binding)

- **Primary metric:** complete first-numbers capture of trapping — every trap
  event classified by method + caller + kind, every yield kcal attributed,
  every metric counted or explicitly marked unmeasurable.
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail max).
- **Seeds:** 180241–180248 (8, fresh band per prereg freshness search).
- **Policies:** control = competent verbatim, instrument ON (judged leg);
  neutral = same policy, instrument OFF (days + end pantry kcal + deaths
  only). No other policy change. No src/js change.
- **Proof:** scripts/test-trapfirst-a.js — **62 passed, 0 failed** (re-run
  after adoption; matches coordinator spot-run).
- **Corpus:** evidence/2026-11-10/perseed-trapfirst-a/trapfirst-s18024{1..8}-
  trapfirst-pilot-{control,neutral}.json; analyzer
  scripts/trapfirst-analyze-20261110.js;
  summary evidence/2026-11-10/trapfirst-a-summary.json.
- **No panel (§15):** measurement arm with no lever and no before/after
  arms, so there is no panel comparison to fabricate (same position as
  sim-fishstaff-b / fishfirst-a). The control/neutral legs are the
  neutrality proof, not a panel.

## Neutrality (control vs neutral, per seed — days / end pantry kcal / deaths)

| seed | control | neutral | match |
|---|---|---|---|
| 180241 | 149d / 4,040 / 124 | 149d / 4,040 / 124 | exact |
| 180242 | 91d / 0 / 85 | 91d / 0 / 85 | exact |
| 180243 | 146d / 0 / 89 | 146d / 0 / 89 | exact |
| 180244 | 130d / 0 / 51 | 130d / 0 / 51 | exact |
| 180245 | 131d / 0 / 99 | 131d / 0 / 99 | exact |
| 180246 | 140d / 0 / 75 | 140d / 0 / 75 | exact |
| 180247 | 84d / 0 / 48 | 84d / 0 / 48 | exact |
| 180248 | 146d / 0 / 108 | 146d / 0 / 108 | exact |

**8/8 exact.** The instrument does not move trajectories.

## Headline numbers (pooled, 8 seeds, 1,017 run-days)

- **Trap deposits 9,405 kcal = 1.09% of all pantry inflow (860,953 kcal).**
  Snared meat 8,804 + Pit meat (Raccoon) 601. Game meat 0.
- **Trap share of meat deposits: 9,405 / 50,290 = 18.7%.** The rest of the
  meat is Expedition meat (40,885).
- **Scholar trapped carcasses: 37 / 22,500 kcal** — Gray Squirrel 22
  (7,700), Cottontail Rabbit 8 (6,400), Virginia Opossum 7 (8,400). Only
  snare-table species; no deer/boar/turkey, because the scholar only ever
  sets snares.
- **Scholar trap sets: 15, all snare, 14 wire-improvised, 1 crafted trap in
  1,017 days.** Max 1 trap set at a time on every active seed. All 15 sets
  on tiles where the eligible species is NOT in village.animals (0/15
  known-game sets); 14/15 sets had eligible game present.
- **Villager trapline is the working trap economy:** 96 snare returns (37
  caught, 8,804 kcal) + 1 pit return (raccoon, 601 kcal) vs the scholar's
  15 sets. Villager returns and scholar dawn-check catches both land at
  exactly 37 hits — a coincidence, not a shared counter (different luck
  streams: 'snare' 96 rolls/37 hits vs 'trap' 79 rolls/37 hits).
- **Hunt duty: 0 calls of any kind** (assignTask, offerDeal, appealToGoal),
  0 ok, 0 refused — Game meat 0 kcal. Backlog #2130 confirmed a third
  time (see below).
- **'Deadfall' duty (stick-gathering, NOT the deadfall trap): 549 calls,
  157 ok, 392 refused (71.4%)** — every refusal trust-gated ("Trust too
  low" / reluctant). The scholar asks villagers to gather sticks and is
  turned down 7 times in 10.
- **Trap meat eaten/drawn:** drawn 6,039 kcal of 3,178,365 (0.19%); eaten
  via eat() 1,900 of 560,204 (0.34%). Most trap meat is drawn into meals
  (6,039) faster than the eat wrap sees it eaten (1,900) — the 4,139 gap
  is meal-draw accounting (draws include feast/dried routing), not loss.
- **Trapping deeds: 37, all player.** No villager ever earns a trapping
  deed (their returns are abstracted deposits, not deeds).
- **Trap share vs other channels:** Foraged food 365,645 (42.5%),
  Expedition haul 253,773, Fish catch 106,419 (12.4%), Expedition meat
  40,885, aid from linked villages ~87,900, Garden harvest 706. Trapping
  (9,405) sits just above the garden and far below fish and forage.

## Per-seed tables (metrics 1–8)

### Metric 1 — trap events by method / caller / kind

| seed | sets (recipe) | wire | crafts | dawn checks | luck trap r/h | luck snare r/h | luck pit r/h | npc_trap n/caught | npc_pit n/caught* | hunt calls | deadfall ok/ref |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 180241 | 3 snare | 3 | 0 | 148 | 17/6 | 19/8 | 9/0 | 19/8 | 0/0 | 0 | 9/55 |
| 180242 | 0 | 0 | 0 | 91 | — | — | — | 0/0 | 0/0 | 0 | 43/54 |
| 180243 | 2 snare | 2 | 0 | 145 | 11/4 | 2/0 | 1/1 | 2/0 | 1/0* | 0 | 14/33 |
| 180244 | 0 | 0 | 0 | 130 | — | — | — | 0/0 | 0/0 | 0 | 19/39 |
| 180245 | 1 snare | 1 | 0 | 131 | 8/2 | — | — | 0/0 | 0/0 | 0 | 32/68 |
| 180246 | 4 snare | 4 | 0 | 139 | 10/8 | 42/18 | — | 42/18 | 0/0 | 0 | 17/58 |
| 180247 | 2 snare | 2 | 0 | 84 | 8/3 | 30/10 | — | 30/10 | 0/0 | 0 | 13/45 |
| 180248 | 3 snare | 2 | 1 snare | 145 | 25/14 | 3/1 | — | 3/1 | 0/0 | 0 | 10/40 |
| **pool** | **15 snare** | **14** | **1** | **1,013** | **79/37** | **96/37** | **10/1** | **96/37** | **1/0\*** | **0** | **157/392** |

\* **Pit-flag discrepancy (recorded, not hidden):** the single npc_pit return
(180243 d43, Ethan, raccoon) carries `caught: false` in the tele payload
while `kcal: 601`, `species: "raccoon"`, the pit luck roll (p 0.18, HIT),
the same-day 'Pit meat (Raccoon)' deposit (601 kcal), and the say line
("Ethan is back from the pit line: Raccoon in the pit — +601 kcal to the
pantry.") all agree a raccoon WAS caught. The analyzer counts tele catches
by the `caught` flag, so it prints npc_pit caught 0; the corrected count is
**1 pit catch**. The event is classified three ways (deposit + luck + tele);
only the analyzer's aggregation undercounts it. Metric-review item (a).

No other trap recipe was ever set or crafted by the scholar on this band:
deadfall / box_trap / spring_snare / minnow_trap / fish_weir / fish_basket /
trotline / noose_pole / squirrel_pole — 0 sets, 0 crafts, all 8 seeds. The
one craft (180248) was a known (non-blind) snare. Two seeds (180242,
180244) have ZERO trap activity of any kind — no sets, no crafts, no
returns, no carcasses — while dawn checkTraps still runs daily over an
empty line (91 + 130 checks with nothing to check).

### Metric 2 — yield kcal by source

| seed | Snared meat | Pit meat | Game meat | trap deposits | total deposits | trap share | trapped carcasses n/kcal | trap-meat drawn | trap-meat eaten |
|---|---|---|---|---|---|---|---|---|---|
| 180241 | 1,723 | 0 | 0 | 1,723 | 196,190 | 0.88% | 6 / 2,100 | 1,120 | 363 |
| 180242 | 0 | 0 | 0 | 0 | 105,572 | 0% | 0 / 0 | 0 | 0 |
| 180243 | 0 | 601 | 0 | 601 | 108,017 | 0.56% | 4 / 3,200 | 601 | 0 |
| 180244 | 0 | 0 | 0 | 0 | 67,431 | 0% | 0 / 0 | 0 | 0 |
| 180245 | 0 | 0 | 0 | 0 | 108,692 | 0% | 2 / 1,600 | 0 | 0 |
| 180246 | 4,807 | 0 | 0 | 4,807 | 84,928 | 5.66% | 8 / 7,050 | 2,412 | 1,180 |
| 180247 | 2,024 | 0 | 0 | 2,024 | 70,187 | 2.88% | 3 / 2,750 | 1,656 | 357 |
| 180248 | 250 | 0 | 0 | 250 | 119,936 | 0.21% | 14 / 5,800 | 250 | 0 |
| **pool** | **8,804** | **601** | **0** | **9,405** | **860,953** | **1.09%** | **37 / 22,500** | **6,039** | **1,900** |

Trap-kill share of carcasses: 37/37 recorded carcasses are 'trapped' origin
(no 'hunted' / 'fished' / 'netted' / 'charred' carcass ever reached
foodCarcass on this band — expedition meat arrives as pantry deposits, not
carcasses). Trap deposits are 18.7% of all meat deposits (9,405/50,290).
Scholar carcasses average ~608 kcal each vs villager snare returns ~238
kcal each: the scholar brings home whole animals; the villager return is an
abstracted pantry deposit.

### Metric 3 — who traps

| seed | scholar recipe L (end) snare / pit_trap | snare_wire L (end) | knowsSnare max | knowsPit max | trapping deeds (player) | TRAPS holders* |
|---|---|---|---|---|---|---|
| 180241 | 1 / 1 | 1 | 3 | 2 | 6 | returns on 19 days |
| 180242 | 0 / 0 | 0 | 0 | 0 | 0 | none |
| 180243 | 1 / 1 | 1 | 2 | 1 | 4 | returns on 3 days |
| 180244 | 0 / 0 | 0 | 1 | 0 | 0 | none |
| 180245 | 1 / 0 | 2 | 1 | 0 | 2 | none (scholar only) |
| 180246 | 1 / 0 | 1 | 5 | 1 | 8 | returns on 42 days |
| 180247 | 3 / 0 | 2 | 5 | 0 | 3 | returns on 30 days |
| 180248 | 3 / 0 | 2 | 3 | 1 | 14 | returns on 3 days |

\* TRAPS-objective holder headcount per day was NOT captured (snapshots
count knowsSnare/knowsPit, not objective holders) — metric-review item (d).
Holder-days are evidenced by returns: npc_trap/npc_pit tele rows prove a
villager held the objective that day. 180244's single knower never returns
anything; 180245's trapping is scholar-only (2 carcasses, 0 villager
returns). Knowledge is seed-fragile: knowsSnare starts 0–3 and falls to 0
as knowers die (180241: 3 → 0 by village end). The scholar's snare recipe
reaches L3 on 180247/180248 (witnessed catches level it); pit_trap L1 on
180241/180243 comes from the day-1 pit teaching scene, not from setting a
pit — no pit was ever set.

**Hunt-duty staffing (backlog #2130): 0 assignTask 'hunt' calls, 0
offerDeal 'hunt', 0 appealToGoal 'hunt', on all 8 seeds.** 'Game meat'
deposits 0 across 860,953 kcal. The village's meat comes from the scholar's
traps and expeditions, exactly as fishfirst-a found (0 across 838,459
kcal). Measurement verdict recorded on #2130 (see Backlog below).

### Metric 4 — trap spawn path (#1826 verification)

| seed | spawns total | trap spawns (gwTrapTick) | trap-spawn HP ok/bad | wanderer (checkEncounter) spawns | wanderer HP bad |
|---|---|---|---|---|---|
| 180241 | 82 | 0 | — | 67 | 0 |
| 180242 | 71 | 0 | — | 45 | 0 |
| 180243 | 72 | 0 | — | 38 | 0 |
| 180244 | 61 | 0 | — | 40 | 0 |
| 180245 | 59 | 0 | — | 33 | 0 |
| 180246 | 69 | 0 | — | 39 | 0 |
| 180247 | 51 | 0 | — | 35 | 0 |
| 180248 | 66 | 0 | — | 45 | 0 |
| **pool** | **531** | **0** | **—** | **342** | **0** |

**#1826 is NOT verified live in this pilot: no glasswing trap ever fired
on the band (0 trap spawns), so no trap-spawned darter exists to check.**
This is the outcome the prereg anticipated ("the pilot records whether it
fires at all") — it did not fire. What the pilot DOES verify live: the
wanderspawn fix holds on the control row — 342 checkEncounter spawns, 0
with bad HP, including glasswing darters at hp 18 = def hp [18, 26], not
the old bare-{id} fallback of 20 (e.g. 180241 d18 glasswing hp 18/maxHp
18/wave 1). And the proof miniature verified the trap-spawn path itself
live (test-trapfirst-a.js B15/B15b: a gwTrapTick-spawned glasswing carries
def hp 18). So: trap-spawn HP = fixture-verified, pilot-unobserved;
wanderer-spawn HP = pilot-verified clean on 342 spawns. A future arm that
wants the live trap-spawn check needs a band/seed where a glasswing trap
actually gets set — the scholar never sets glasswing traps under competent
on this band (and never sets any trap but snare).

### Metric 5 — upkeep / bait / placement / knowledge

- Trap uses at set: wire snares are 2-use improvised; the 15 sets produced
  37 scholar catches, so a set trap keeps catching across days until its
  uses run out or it breaks. "The Snare broke. You'll need another."
  appears 6× in the say corpus.
- Sets on tiles with eligible game: 14/15; without: 1/15. Sets where the
  caught species is known in village.animals: 0/15 — every set is on
  unknown game. (The scholar sets where the animals are, not where the
  village's knowledge is.)
- Bait consumed at craft: unmeasured in the pilot — the single craft was a
  snare (no bait pseudo-material in the snare recipe path the instrument
  records); no deadfall/box/spring-snare craft ever fired to observe bait
  spend. Recorded as unmeasured, not zero.
- Quiet-trap days: dawn checkTraps runs 1,013 times; only 79 'trap' luck
  rolls fire — the other ~934 checks find no game on the line that day.
  Max 1 trap set at a time means the line is one snare, checked daily.
- Trap-line length over time: 0–1, never more. The scholar's trapline is a
  single snare.
- Shyness levels at set: recorded by the instrument but not aggregated by
  the analyzer (snapshot field exists per set; no pooled table). The sets
  all caught, so shyness never visibly blocked a catch on this band.
  Metric-review item (f).
- Home-board trap-species wildlife: snapshot totals range 464 (start) to
  6,562 (late) per seed — the pool is large; the constraint is the
  single-snare line and the knowledge gate, not wildlife scarcity.

### Metric 6 — trap kcal share vs forage / hunt / garden / fish

Pooled deposits by name (kcal): Foraged food 365,645; Expedition haul
253,773; Fish catch 106,419; Expedition meat 40,885; Aid (Emberhold
23,043 + Stonebridge 23,483 + Thornfield 13,477 + Ashford 17,524 + Hungry
Road 3,893) 81,420; Snared meat 8,804; Pit meat (Raccoon) 601; Garden
harvest 706; System-replicated meals/stew 2,100; Trial feast 600.
Trap (9,405) is 1.09% of inflow — above garden (706) alone, below fish by
11×, below forage by 39×. Per-seed trap share ranges 0% (180242, 180244,
180245 — the last has scholar carcasses but zero pantry deposits: its 2
trapped carcasses were cleaned/eaten from the pack, never deposited) to
5.66% (180246, the villager-trapline seed). Meal draws by name: Snared
meat 5,438 + Pit meat 601 = 6,039 of 3,178,365 drawn (0.19%); Foraged
food dominates draws at 1,703,543. Trapped-carcass cleaning: 28 trapped
cleans (of 37 carcasses; the rest eaten uncleaned, rotted, or still in
pack at village end), 7 other-origin cleans, 29 unknown (name-null —
metric-review item (e)).

### Metric 7 — trap spoilage

**Marked inferred/unmeasured, per the prereg's own instruction.** Observed
zeros: spoiled-present trap-meat kcal at the daily snapshot = 0 on all 8
seeds, all days; spoiled kcal purged via eat() = 0 (0 purge rows). But the
instrument does not wrap sweepSpoiled (food.js:2686, called from endDay),
which throws rotten food out overnight — any trap meat that rotted between
snapshots would be purged by the dawn/endDay sweep before the snapshot
could see it, exactly the cookfirst-a limitation the prereg names. With
only 9,405 kcal of trap meat deposited over 1,017 days and fast draw
(6,039 drawn), genuine rot is plausibly near zero — but this instrument
cannot prove it. A next run that wants the number must wrap sweepSpoiled
and attribute its purges by name.

### Metric 8 — wall numbers

| seed | days | maxWave | standing | scaleRank | won | deaths |
|---|---|---|---|---|---|---|
| 180241 | 149 | 5 | 350 | regional | no | 124 |
| 180242 | 91 | 4 | 199 | regional | no | 85 |
| 180243 | 146 | 5 | 555 | regional | no | 89 |
| 180244 | 130 | 4 | 175 | regional | no | 51 |
| 180245 | 131 | 4 | 199 | regional | no | 99 |
| 180246 | 140 | 4 | 199 | regional | no | 75 |
| 180247 | 84 | 4 | 199 | regional | no | 48 |
| 180248 | 146 | 4 | 199 | regional | no | 108 |

**Wall: national 0/8, table 0/8, wins 0/8; wave 4 reached 8/8, wave 5
reached 2/8; regional 8/8; median survival 135.5d (range 84–149); 679
deaths; 8/8 village-lost.** The scale wall stands on this band, in line
with the sibling first-numbers pilots (median survival 122.5–140d, 6–7/8
village-lost). Guard check: no numeric field moved vs the recorder-free
baseline — neutrality is 8/8 exact, so the instrument is not the cause of
anything here.

## Village assessment (plain words)

Eight villages, all lost, none past regional. The village eats mostly what
it forages and what the scholar hauls back from expeditions; fish is the
second food pillar. Trapping is a garnish: one snare, checked at dawn,
bringing home a squirrel or a rabbit most days it fires — and on two of
the eight seeds the garnish never appears at all, because nobody in the
village knows how to snare and the scholar never sets a wire. The
villagers who DO know snares run a quiet trapline of their own and feed
the pantry in small anonymous deposits ("Snared meat", no name, no species)
— the one time a pit fires, Ethan hauls a raccoon home and the village
hears about it by name. Nobody hunts: the hunt duty is never offered,
never asked for, never refused — it simply does not exist in the village's
day, and the meat that would have come from it never arrives. The scholar
asks villagers to gather deadfall sticks and is refused seven times in ten,
always for lack of trust — the village will follow the scholar into the
woods to check a snare, but will not take orders from someone it does not
trust. The trap itself is honest work with honest voice when it fires; the
blank is that the line is one snare wide, the knowledge is two or three
people deep and dies with them, and the pit — the only trap that catches
anything bigger than a rabbit — is taught once on day one and then never
built.

## Sense test (SENSE-TESTING LAW — read transcripts, judge meaning)

Say corpus: 1,309 trap-matched lines across 8 seeds (capped at 200/seed;
the five noisiest seeds hit the cap, so late-game trap voice is unobserved
there — 180246's last captured line is day 38 of a 140-day run). 982
distinct lines. Two regex artifacts, not game defects: the Haven-grounds
line ("You push through the doors into open air… fire pit…", 24×) matches
on "fire pit", and a monster-ambush line ("It waits for YOU to come close
— the stillness is the trap.", 7×) matches on "trap".

**Scenes that work (quoted):**

- Teaching, day 1 (180241): "A man, maybe 20s catches you watching the
  snares come off the line. '...Want to actually SEE one?' They show you —
  the loop, the trigger stick, where the run narrows between the roots.
  'Opossum trails. Check at dawn. Always.' Your hands don't know it yet.
  Your eyes do." The same scene plays for the pit line: "'...Want to
  actually SEE one?' They walk you out to it — the depth, the sharpened
  stakes at the bottom, where the game trail runs." Knowledge is taught by
  a person, in place, with a reason — and it grants recipe L1 on the spot.
- Pantry-aware teaching (Rosa / LaToya / Caleb / Elena / Nadia, 4×):
  "Rosa peeks into the pantry, then turns the foraging party back. 'Plenty
  for days. Teaching the kids snares instead — they'll need to know.'" A
  villager reads the pantry, declines a forage trip, and chooses teaching
  instead. That is a person making a judgment, not a routine firing.
- A catch with consequences (11×): "🪤 TRAP: Your Snare 1 tile east caught
  a Gray Squirrel! — head-high on the trail, anchored solid, wire
  near-invisible. About 350 kcal on the bone — clean it quickly (knife).
  It rots fast." Specific, placed, urgent — and honest about the next
  step. The uncleaned state is honest too: "Nothing edible. (Gray
  Squirrel (trapped) — not food yet: Gut it quickly — clean with a knife.
  Spoils in ~2 days..)"
- The one pit catch (180243 d43): "🪤 Ethan is back from the pit line:
  Raccoon in the pit — +601 kcal to the pantry." Named person, named
  animal, named number. The village's only pit catch in 1,017 days gets a
  line that says so.
- Upkeep voice: "The Snare broke. You'll need another." (6×) and "(The
  snare wire becomes the snare — improvised, 2 uses.)" (7×) — the
  wire-improvised path is narrated honestly.

**What is robotic (the blank to name):** the empty-check return is a
single template spoken by everyone, every day — "Nora heads out to check
the snares. 'Wire doesn't lie.'" / "🪤 Nora is back. 'Snares were empty.
They'll keep.'" / "🪤 LaToya is back from the pit line. 'Pit was quiet.
They'll keep.'" — 10 + 9 + 9 + 7 + 7 + 6 occurrences of the same few
lines, one per villager per day, for ~100 villager returns. The check
itself is a real routine with real people; the voice has exactly one thing
to say about an empty snare, and it says it a hundred times. The deadfall
assignment line is the same shape ("📋 Nolan — 🪾 Gather deadfall. Nolan
nods eagerly. They'll report back by next part.", 10× for Nolan alone) —
assignment narration, expected to repeat, but the trap-check line is
supposed to be a person coming home, and it reads as a stamp. No
teaching-overhear tele ever fired (0 snare_overhear / pit_overhear rows):
teaching happens in say scenes, not in the overhear channel the instrument
watches — either the channel is quiet under competent or it fires through
a path this instrument does not see; recorded, not assumed.

## Backlog

- **#2130 (hunt-duty staffing) — MEASUREMENT verdict recorded on the line
  (stays [claimed], NOT [fixed]):** on band 180241–180248, competent
  staffs the hunt duty 0 times (assignTask / offerDeal / appealToGoal all
  zero), 'Game meat' deposits 0 across 860,953 kcal — the third
  confirmation after fishfirst-a (0 across 838,459 kcal). A measurement
  that only counts does not fix a staffing gap; the staffing fix itself
  remains open (huntstaff-b4 landed default-OFF; the dawnstaff kill chain
  stands). The trap side of the item — trap-kill share of meat — is now
  measured: trap deposits 18.7% of meat deposits, trapped carcasses 100%
  of recorded carcasses (37/37, no other origin fired).
- No new backlog items appended from this arm. The sense-test blank (one
  empty-check template, ~100 repetitions) is a narration-variety note for
  a future arm, not a steve-call: it needs no ruling, only a writer.

## Metric review (§14 — the metric set held, with these revisions for the NEXT run)

- The metric set held: all 8 metrics produced per-seed tables; no
  re-scoring was needed or done. These revisions are proposed for the NEXT
  run's prereg, not applied here:
  - (a) **Pit `caught` flag:** the analyzer should count pit (and snare)
    catches by kcal > 0 / species present / deposit reconciliation, not by
    the tele payload's `caught` boolean — the engine leaves it false on
    the pit path while every other signal says caught. Corrected pooled
    pit count is 1, not 0.
  - (b) **Snare species:** tele('npc_trap') never carries a species
    (null on all 96 returns); pit returns do ("raccoon"). Villager snare
    yield by species is unmeasurable from tele — a next run should either
    read the species from the deposit path or mark it unmeasured up front.
  - (c) **Metric 7 (spoilage):** wrap sweepSpoiled and attribute its
    purges by name, or pre-mark the sub-metric unmeasured. Snapshot +
    eat-purge zeros alone cannot prove zero rot.
  - (d) **TRAPS-objective holders:** snapshot the holder headcount per
    day (objective kind TRAPS among living villagers), not just
    knowsSnare/knowsPit and return rows.
  - (e) **cleansUnknown (29):** resolve what the 29 name-null cleanCarcass
    calls are (failed cleans? non-carcass items?) before judging the
    clean sub-metric closed.
  - (f) **Shyness at set:** the instrument records shyness per set but
    the analyzer never aggregates it — either aggregate it or drop it
    from the instrument's claim list.
  - (g) **Say-corpus cap:** the 200-line/seed cap truncates the noisiest
    seeds mid-run (180246 stops at day 38). A next run should raise the
    cap or sample across the run, not just the first 200 trap lines.
  - (h) **#1826 live check:** needs a band/seed where a glasswing trap
    actually gets set under competent — or a rigged fixture as the live
    proof (already exists as B15/B15b). Do not spend a fresh band hoping
    for a trap spawn; screen for it first.

## Instrument / files

- Instrument: scripts/trapfirst-instrument-20261110.js (record-only wraps;
  0 errors across 16 runs).
- Driver: scripts/trapfirst-driver-20261110.js (control + neutral legs,
  identical seeds).
- Analyzer: scripts/trapfirst-analyze-20261110.js (+ summary
  evidence/2026-11-10/trapfirst-a-summary.json).
- Proof: scripts/test-trapfirst-a.js (62 passed, 0 failed).
- Prereg: evidence/2026-11-10/sim-trapfirst-a-prereg.md (67919bea5).
- Per-seed corpus: evidence/2026-11-10/perseed-trapfirst-a/ (16 files).
- Base: ad6a04b27. No src/js change. No lever. Nothing to land, nothing
  to ship — a measurement arm; its numbers are the deliverable.
