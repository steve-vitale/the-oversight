# sim-titanfirst-a — titans + heralds first numbers (Loop A, fleshout-loop-20261111T1115Z)

**Verdict: NO-GO** — two GO rows miss: 133 unclassified titan say lines
and 3 unclassified dawn events, against the pre-registered bar of 0/0.
Every other row passes (0 unclassified startCombat / tbEnd /
fieldFight / outcome; 0 instrument errors; engagement 8/8; neutrality
8/8 exact). The miss is the classifier's enumerated classes, not the
data: the instrument captured all 133 lines and all 3 dawn events, and
the metric review below identifies the 19 missing say classes (with
sources) and the dawn rule, scratch-verified to cover 133/133 lines
on the pilot corpus. Per §14 the verdict stands NO-GO; the revision
is proposed for the NEXT run, not re-scored into this one. The census
numbers themselves are complete and stand.

**In plain words:** in eight lived villages, the Herald arrives on
every one and the scholar can never fight it — the gate refuses all
226 attempts because no coalition ever forms (0 allies, 0 muster
calls). What actually kills the Herald is the village itself: the
wall's stakes bleed it a quarter of its health every time it joins a
night raid, and villagers finish it off in wild fights — four
Heralds died that way, and the game never recorded any of them as
slain. While it lives, the Herald taxes the village twice: the
titan's own strike every five days, and a much bigger nightly gorge
at the treeline that eats the village's food stores — 59,100 kcal
across the band, against 17,625 from the strikes. The Herald's
refusal line repeats up to 16 times in a single day, word for word.

## Headline first numbers (band, 8 seeds, 983 village-days)

- Cast: Herald + Finale apocalypse on 8/8 seeds. The Nielsen appears
  only as the third-titan overtime omen on 3/8 seeds (placed d138/139/148).
- Omens: Herald reaches stage 2 (located + placed) on 8/8, days 56–87.
  Nielsen reaches stage 2 on 3/8; one more Nielsen omen sits at stage 0
  when its run ends.
- Spawns: 11 distinct titan instances (8 heralds, 3 nielsens).
- startCombat on a titan id: 226 calls, **all refused** (have 0 / need
  10 every time), 0 fought, 0 dissolved, 0 titan tbEnds. The scholar
  never fights a titan.
- Villager field fights vs titans: 17 (10 fled, 4 killed the Herald,
  2 villagers died, 1 monster fled). 4 of 8 Heralds are killed by
  villagers in the wild; the outcome log records 'slain' **0 times**.
- Strikes: 71 strike say lines (38 pantry, 33 trust) on an exact
  5-day cadence from each titan's placement day. Trust tax −150.
  Pantry raids took −17,625 kcal from the scholar's pack — most raids
  took 0 kcal (pack empty).
- Lingering gorge: the placed Herald gorges at the treeline on 54
  nights, taking **59,100 kcal from the village pantry** (8 more
  nights it circles empty stores). The gorge dwarfs the strikes.
- Muster: 0 calls, 0 commits, 0 standdowns, 0 councils. Competent
  never sounds the call.
- Refusal-line repeats: max 16 identical gate lines in one day
  (190328 d87); 12/day on two more seeds.
- Wall: national 0/8, table 0/8, wins 0/8, wave 4 on 8/8, wave 5 on
  1/8, median survival 137.5d, 671 deaths, 2/8 survived.

## Per-seed table

| seed | days | end | wave | standing | rank | endPantry | SC | FF | spawns | dawns | titanSays | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 190321 | 150 | survived | 4 | 199 | regional | 400 | 31 | 3 | 2 | 15 | 121 | 82 |
| 190322 | 84 | village-lost | 4 | 199 | regional | 0 | 10 | 0 | 1 | 6 | 37 | 76 |
| 190323 | 89 | village-lost | 4 | 100 | regional | 0 | 0 | 1 | 1 | 5 | 12 | 68 |
| 190324 | 150 | survived | 5 | 320 | regional | 6934 | 75 | 1 | 2 | 16 | 216 | 99 |
| 190325 | 141 | village-lost | 4 | 199 | regional | 0 | 3 | 4 | 2 | 13 | 53 | 97 |
| 190326 | 141 | village-lost | 4 | 199 | regional | 0 | 0 | 4 | 1 | 13 | 53 | 74 |
| 190327 | 134 | village-lost | 4 | 125 | regional | 0 | 78 | 0 | 1 | 8 | 218 | 92 |
| 190328 | 94 | village-lost | 4 | 199 | regional | 0 | 29 | 4 | 1 | 6 | 87 | 83 |

SC = startCombat calls on a titan id (all refused). FF = villager
field fights vs a titan. Dawn events with any titan diff. TitanSays
= captured titan-regex lines (uncapped instrument list).

## Wall numbers

- National: 0/8. Table offered: 0/8. Wins: 0/8.
- Wave 4 unlocked: 8/8. Wave 5 unlocked: 1/8 (190324).
- Median survival: 137.5 days. Survived the 150-day horizon: 2/8.
- Deaths: 671 across 983 village-days (median 82.5/seed).
- Standing at end: 100–320; scale rank regional on 8/8 (national
  never reached, so the wave-5 apocalypse omen precondition
  (national+) never fired for the Finale — the Nielsen omens that
  did fire are the third-titan overtime route).

## GO table (pre-registered bar)

| row | bar | pilot | verdict |
|---|---|---|---|
| unclassified titan startCombat events | 0 | 0 | PASS |
| unclassified titan tbEnd events | 0 | 0 | PASS |
| unclassified titan fieldFight events | 0 | 0 | PASS |
| unclassified titan dawn events | 0 | **3** | **FAIL** |
| unclassified titan say lines | 0 | **133** | **FAIL** |
| unclassified outcome-log records | 0 | 0 | PASS |
| instrument errors | 0 | 0 | PASS |
| engagement floor (≥1 seed wave ≥4 + regional+) | ≥1 | 8 | PASS |
| neutrality (days + end pantry kcal + deaths, 8/8 exact) | 8/8 | 8/8 | PASS |
| **overall** | | | **NO-GO** |

## Cast + omens: who is cast, when the sky gets bigger

- Cast on all 8 seeds: Herald + Finale (showmanship < 20 everywhere,
  so the Nielsen is never the cast apocalypse). The 3 Nielsen spawns
  are third-titan overtime omens (p=0.25 route): 190321 d139, 190324
  d148, 190325 d138.
- Herald omens reach stage 2 (located) on 8/8: d61, d68, d73, d70,
  d76, d87, d62, d56. Omen stage 2 day == spawn day on every seed.
  The named omen lands a few days before placement, e.g. 190321 d56:
  "📻 The old ones point at the horizon and don't speak. The System,
  for once, is quiet too. Then: the Herald. It heralds the
  apocalypse the way dawn heralds the day." The located line the
  placement day: "🗺️ Scouts found its lair — tile 7,4. THE HERALD
  — the sky, getting bigger. It is WAITING. You cannot face it
  alone. Sound the call."
- Nielsen omens: stage 2 on 3/8 (d139, d148, d138); stage 0 on
  190327 d134 when that run ended. No Finale omen ever fires (needs
  wave ≥5 + national+; only 190324 reaches wave 5 and no seed
  reaches national).
- The Herald strikes the very night it is located: on 190321 the
  located line and the first trust strike ("🌪️ THE HERALD struck
  Thornfield in the night… trust −5") share day 61.

## Placement: where the titans stand

- 11 distinct instances (key = id + spawn day): 8 heralds
  (700 HP each) + 3 nielsens (1100 HP each).
- The placed titan follows and paces the scholar: herald-stirs
  lines 0–27/seed, herald-here 0–37/seed, herald-treeline 0–28/seed
  (band: 92 stirs, 88 here, 91 treeline). E.g. "You turn to leave
  — behind you, The Herald stirs." / "It followed you. The Herald
  is here." / "The Herald stops at the treeline — pacing,
  unwilling."
- Presence days (placed → removed / run end): heralds live on the
  map 17–86 days. 4 removed by villager field-kill (d121, d125,
  d134, d146); 4 still standing when their village is lost
  (190322 d84, 190323 d89, 190327 d134, 190328 d94). Nielsens are
  never met: 0 startCombat, 0 field fights, still standing at run
  end (12, 3, and 4 presence days).
- The placed titan JOINS pantry raids as a raider: 18 raid-herald
  lines band-wide (e.g. "🐗 RAID — 5 raiders (Big Loud, The Herald,
  The Reunion, The Reunion, The Eater) hit Haven in the night…").

## Escalation: the five-day tax

- Strike cadence is EXACT: every strike say line in the band falls
  on (day − placementDay) % 5 == 0 for its own titan. Herald slots
  fire on a perfect 5-day rhythm on every seed (e.g. 190324:
  70,75,80,85,90,95,100,105,110,115,120,125; 190326:
  87,92,…,132). The Nielsen's strikes run on its own placement day
  (190321: 139,144,149; 190325: 138).
- Missing slots are not missing strikes — they are trust rolls with
  nowhere to land. titanEscalate (titans.js:316–317) silently
  returns, no line and no effect, when the 55% trust roll fires but
  the village has no allied links. That swallows 7 of 15 slots on
  190327 (0 trust strikes all run) and 4 of 8 on 190328. Strike
  counts therefore vary with link availability, not just with titan
  spawns — a second mechanism behind the sim-answermail-drive-a
  "strikes jump" item.
- Occurrence vs effect reconciles exactly: 71 strike say lines =
  46 dawn events with a measurable effect (16 pantry, 30 trust) +
  22 pantry raids that took 0 kcal (pack empty, no dawn diff) +
  3 trust strikes on links already at trust 0 (delta 0, no dawn
  diff — these are the 3 unclassified dawn events; see metric
  review).
- Trust tax: −150 total (−55, −10, −10, −25, −10, −35, 0, −5 by
  seed). Every trust strike is −5 except the clamp cases (a link
  at trust 3 loses 3) and the three delta-0 strikes (link already
  at 0: the strike fires, the note is booked, nothing is left to
  take).
- Pantry raids: 38 strikes, −17,625 kcal total from the scholar's
  pack (per seed: 0, −900, 0, −2600, −8370, −1650, −2845, −2260).
  On 190321 all 10 pantry raids read "0 kcal gone from your
  stores" — the pack holds no finished food, so the raid takes
  nothing while the line still says the titan is eating the realm.
- The titan's own strike is the SMALLER food tax. See the gorge
  section below.

## The lingering gorge: the tax nobody named

- A placed Herald that survives a raid becomes a lingerer at the
  treeline (havenGrowth.js havenGrowthDaily) and gorges nightly
  from the VILLAGE pantry via raidPillage: 500–1,500 kcal/night,
  ~6 nights, then it drifts off. "🌙 Night. The lingering The
  Herald gorges at the treeline — 1,000 kcal gone from the stores.
  Endure it (they drift off within ~6 nights — the gorge is the
  price), or send a sortie: fighters, rations, real risk."
- Band: 54 gorge nights, **59,100 kcal** from the village pantry
  (190324 alone: 28 nights / 31,316 kcal; 190327: 14 / 13,672;
  190321: 8 / 8,482; 190325: 3 / 4,630; 190322: 1 / 1,000), plus 8
  nights circling empty stores (190322: 4, 190327: 4). Seeds with
  no gorge nights (190323, 190326, 190328) are the seeds whose
  herald never lingered — it was met in the field instead, or the
  village had no stores left to gorge on.
- The gorge is 3.4× the titan strikes' food take (59,100 vs 17,625
  kcal) and it comes out of the village pantry, not the scholar's
  pack. The named titan strike is the smaller bite.

## Muster / call / commit / standdown: the coalition that never forms

- 0 muster actions of every kind on all 8 seeds: no soundTitanCall,
  no titanCommitOwn, no titanStandDown, no titanWarCouncil, no
  titanCallReadiness. Competent carries zero 'titan' references —
  the policy never sounds the call, and nothing in the game prompts
  it to.
- Every one of the 226 refusals reads have 0 / need 10. No partial
  muster ever exists: no allied blades are ever committed, no
  allied village ever answers, no Haven blade is ever committed.
- Trust ledger by mechanism: strike −5 (×30 effective, −150
  total); muster-hunger 0; standdown 0; turn 0; fight-death 0
  (no titan fights, so no allied deaths in one). The ONLY titan
  trust cost in the band is the strike.

## Scholar encounters: the re-fight spam question

- **Answered: the spam is refusals, not re-fights.** All 226
  startCombat calls on a titan id are gate refusals; 0 fights ever
  open, 0 tbEnds ever fire, 0 calls dissolve. The 158-fight figure
  from seed 170202 (sim-spawncensus-a) was the same shape: the
  scholar re-faces the gate and is refused again. One instance is
  refused up to 16 times in a day.
- Per-instance calls: 190321: 31 (1 herald), 190322: 10, 190323: 0,
  190324: 75, 190325: 3, 190326: 0, 190327: 78, 190328: 29. The
  calls cluster on days the scholar stands on or beside the
  titan's tile — the engine re-offers the fight every monster turn
  while the scholar stays there (cf. the 2026-10-30 steve-call
  REFUSED-FACE ROUTING item).
- Max refusals in a day: 16 (190328 d87), 12 (190324 d89, 190327
  d111), 9 (190321 d88, 190322 d84). The line is byte-identical
  every time: "⛔ THE HERALD does not notice you the way prey
  notices a hunter. It notices you the way weather notices a
  field. You cannot face this alone — sound the call, muster 10
  allied blades (you have 0). This is not courage. This is
  arithmetic."
- The gate fires on the kill day too: on 190321 d146 the scholar
  is refused 6 times while Deivis's party kills the Herald in the
  field the same day. The refusal has no memory that the titan is
  about to die.

## Villager field fights vs titans: the wild kill

- 17 field fights, all vs the Herald (the Nielsen is never met):
  10 vFlee, 4 vKill, 2 vDie, 1 mFlee. 0 unclassified; every fight
  has rounds observed and pre-fight instance HP recorded.
- The 4 kills: 190321 d146 Deivis (party, herald at 14 HP, 0
  rounds, 0 taken); 190324 d125 Nasimiyu (herald at 1 HP);
  190325 d121 Caleb (party, 6 rounds, 56 taken, herald at 158 HP);
  190326 d134 Kōwhai (alone, 1 round, herald at 55 HP). Each kill
  is announced three ways the same day: the Codex death notice
  ("📖 The Codex turns a page on its own. The Herald is dead. You
  didn't ask. It knew."), the party-kill report ("⚔️ Deivis killed
  the Herald with their party — 0 rounds, 0 taken. Word travels
  fast. The village cheers."), and the fireside confession ("🔥 The
  fire settles. Deivis has been quiet all evening, and now everyone
  knows why. 'The Herald — I put it down today.'").
- The 2 villager deaths: 190325 d118 Diana (8 rounds) and 190326
  d119 Kevin (4 rounds), both narrated as "💀 The Herald killed X
  in N rounds. The village mourns." Maulings (villager survives,
  hurt): 10 lines, e.g. "🩸 The Herald mauled Benoit (-71 health)
  over 7 rounds."
- **The herald's HP falls in exact −175 steps per raid night.**
  The placed Herald takes exactly 175 HP — a quarter of its 700
  max — every time it joins a pantry raid against a WALLED
  village ("The palisade's stakes take their toll as they come
  over the wall"), floored at 1 HP. Field fights account for the
  rest, and the arithmetic closes exactly on every seed:
  - 190321: 700 → 525 (d76 raid) → 350 (d87 raid) → 279 (field
    fight −71) → 104 (d143 raid) → 14 (field fight −90) →
    killed (15 dealt, 1 overkill). Palisade 525, field 176.
  - 190324: 700 → 525 (d74) → 350 (d85) → 175 (d93) → 1
    (d112 + d119 raids, floored) → killed (13 dealt, 12
    overkill). Palisade 699, field 13.
  - 190325: 700 → 600 → 451 (field fights) → 276 (d117 raid)
    → 158 (field fight, villager died) → killed (165 dealt, 7
    overkill). Palisade 175, field 532.
  - 190326: 700 → 604 → 429 (d113 raid) → 329 → 154 (d119 raid)
    → 55 (field fight, villager died) → killed (57 dealt, 2
    overkill). Palisade 350, field 352.
  - 190327: 700 → 525 (d82) → 350 (d106) → 175 (d114); village
    lost with the herald at 175. Palisade 525, field 0.
  - 190322: 700 → 525 (d78 raid); village lost d84.
  - 190323: 700 → 614 (one field fight); no raids.
  - 190328: 700 → 583 → 497 → 285 (field fights only) — its
    raids read "No walls. No warning but the noise," so the
    stakes take nothing.
  This closes the sim-mustercall-b open item (herald HP 525 → 105
  with only 70 explained by field fights): the missing 350 was
  two palisade nights at 175 each.

## Titan outcomes: the log that never says slain

- Outcome log: 226 records, all 'refused', 0 unclassified. No
  'slain', no 'fought', no 'stood-down' on any seed.
- The 4 villager field-kills never enter the outcome log at all:
  the log is written only by the muster-fight path
  (titanVictory), so a Herald killed in the wild leaves the omen
  unresolved and the log silent. This independently confirms the
  relayfirst-a backlog item (field-killed Herald doesn't count as
  slain; the Network key's Herald leg can't be satisfied by a
  field kill) on 4/8 seeds this band (days 121, 125, 134, 146).
- No relics (25% drop only on muster-fight victory — no muster
  fights happened), no campaign progress, no viewership gains.

## Say-line coherence: what the village actually hears

- 797 titan-regex lines captured; 664 classified, 133
  unclassified (see metric review for the 19 missing classes).
- Classified shape (judged summary): refusal-gate 226, herald-stirs
  92, herald-treeline 91, herald-here 88, strike-pantry 38,
  strike-trust 33, herald-pack 14, raid-herald 18,
  raid-herald-unmet 12, located 11, omen1 11, omen0 12,
  muster-scout 10, pellet-radio 8. The 19 proposed classes and
  their scratch counts: gorge 54, gorge-empty 8, aid-door 17,
  gossip-herald 11, field-maul 10, pads-in 4, counter-learned 4,
  codex-herald-dead 4, party-kill-herald 4,
  fireside-kill-confession 4, gavel-strike-cite 3, raid-bedroll 2,
  field-kill 2, moved-cue 1, hunt-herald 1,
  veteran-kill-broadcast 1, loot-titan-belt 1, nielsen-stirs 1,
  stare-down-herald 1 (these counts come from the scratch check,
  not the judged summary).
- The Herald is talked about constantly — by the System, by the
  Codex, by villagers at the fire ("It eats while we deliberate.
  The Herald feeds on our stores and we're supposed to just...
  wait?"), by the Gavel citing its strikes as the scholar's crime
  ("Day 86: THE HERALD struck unanswered"), and by a villager
  setting out to hunt it ("Caleb sets out to hunt The Herald. 'It
  was there. Going back for it.'"). The titan is the most narrated
  thing in the late game — and the one thing the scholar can never
  touch.
- Incoherences worth naming: (1) the refusal line repeats
  byte-identical up to 16×/day with no cooldown or variation;
  (2) a titan kill is narrated as "0 rounds, 0 taken" twice — the
  finishing blow lands before a round is counted, so the village
  cheers a fight the narration says never happened; (3) the
  "Titan Belt" loot line is an item name, not a titan — the regex
  over-captures it; (4) the 📻 prefix that catches omen lines also
  catches the generic movement cue ("📻 It moves.") because the
  Herald's emoji IS 📻.

## Trust ledger: what the titans cost

- Total titan trust tax: −150 across the band, all from strikes.
  Per seed: −55, −10, −10, −25, −10, −35, 0, −5.
- By mechanism: strike −5 ×30 effective strikes (−150);
  muster-hunger 0; standdown 0; turn 0; fight-death 0. No muster
  ever forms, so the muster-side ledger is empty by construction.
- The trust cost is capped by link availability twice over: a
  strike aimed at trust silently aborts with no allied links, and
  a strike that lands on a trust-0 link takes 0. Seed 190327 pays
  no trust at all across 134 days with a Herald standing the whole
  time — it has no links to strike.

## Sense-test (read the transcripts, not just the counts)

- **The kill day (190321 d146).** The day reads as a village
  finally solving a problem the scholar can't touch. The Herald
  feeds in the night for 0 kcal; the scholar walks up to it and is
  refused six times in identical words; the Herald "stops at the
  boundary — pacing, unwilling"; then the Codex turns a page on
  its own and announces the Herald dead; Deivis's party killed it
  in "0 rounds, 0 taken"; by the fire that night Deivis confesses
  — "The Herald — I put it down today" — and quotes the beast's
  own warning back at the village. It is the best scene in the
  band and it happens entirely without the scholar: the player is
  a spectator at their own titan's death. Coherent, but the
  "0 rounds" line undercuts it — the fight the village cheers is
  narrated as no fight at all.
- **The refusal day (190328 d87).** Sixteen identical refusals in
  one day. The scholar stands on the Herald's tile and the game
  says the same sentence sixteen times, once per monster turn.
  The line itself is good ("This is not courage. This is
  arithmetic.") — the sixteenth copy is not. A player would read
  this as the game being stuck.
- **The gorge week (190324 d75–80).** Six straight nights of
  "The lingering The Herald gorges at the treeline — 1,071 /
  1,340 / 1,597 / 1,494 / 1,500 / 1,485 kcal gone from the
  stores," while the titan's own strikes take 0 from the
  scholar's pack. The village is being eaten in plain sight and
  the only answer offered is "Endure it… or send a sortie" —
  and competent never sends the sortie. The narration is honest
  about the price; the game never gives the scholar a way to pay
  a different one.
- **The omen (190321 d56–61).** The dread lands well: the quiet
  System, the named omen, the located lair — and then the Herald
  strikes the very night it is located. The omen-to-first-blow
  gap is zero days, which reads as the titan arriving already
  angry rather than arriving and then menacing.

## Instrument validity

- Proof: scripts/test-titanfirst-a.js — **113/113 green** (fixture
  leg + analyzer leg + 5-day neutrality miniature).
- Instrument: scripts/titanfirst-instrument-20261111.js;
  driver: scripts/titanfirst-driver-20261111.js;
  analyzer: scripts/titanfirst-analyze-20261111.js.
- Every wrap's call path: startCombat, tbEnd, fieldFight,
  spawnWorldMonster, removeWorldMonster, titanDawnTick, Game.say
  all live in the pilot (non-titan fights fire tbEnd; titan tbEnd
  closes only occur if a titan fight is fought — 0 in this band,
  so the tbEnd row passes vacuously on titan fights and
  substantively on the non-titan control). titanSelfDo /
  soundTitanCall / titanWarCouncil / titanCommitOwn / titanStandDown
  / titanCallReadiness are proven live in the fixture and dead
  under competent (competent.js carries zero 'titan' references —
  the policy never sounds the call).
- No direct titanEscalate wrap exists, by construction: it is
  closure-internal. Strikes are detected by dawn-diff (link-trust
  map + scholar pack kcal + village pantry kcal + titan
  link-history entries, before/after each titanDawnTick) joined to
  the strike say lines; the proof forces a strike in a fixture
  and verifies that path (3000 kcal raid seen via dawn-diff + say
  capture).
- A 0-kcal raid takes nothing, so it leaves no dawn-diff: strikes
  are counted from say lines for occurrence and from dawn diffs
  for effect; the analyzer records both, cross-checked (71 say
  strikes = 46 dawn effects + 22 zero-kcal raids + 3 zero-trust
  strikes — reconciles exactly).
- Neutrality: **8/8 exact** — control vs neutral legs match on
  days, end pantry kcal, and deaths on every seed. The instrument
  does not move the game.

## Metric review

- **The miss, plainly:** the pre-registered say classifier was
  enumerated from titans.js and the cited other-system classes.
  The pilot's Herald lives in far more systems than titans.js:
  the lingering gorge (havenGrowth.js), raid alarms (comms.js),
  field-fight aftermath (fieldFights.js), party-kill reports and
  the Codex death notice (game.js), fireside confessions
  (game.js), villager hunt objectives (villager-objectives.js),
  table-talk gossip (havenGrowth.js), the Gavel's strike citation
  (titans.js), the veteran-kill broadcast (game.js), and the
  generic movement/arrival cues (game.js). The instrument caught
  all 133 lines; the classifier knew none of these 19 shapes.
  That is an enumeration gap in the instrument, discovered BY the
  judged run — so per §14 the verdict is NO-GO and the fix
  belongs to the NEXT run, not to a re-score of this one.
- **The proposed revision (for the next run's prereg):** add 19
  say classes, each with its source:
  gorge + gorge-empty (havenGrowth.js:266,268), moved-cue
  (game.js:24301), pads-in (game.js:20679), aid-door
  (comms.js:181), veteran-kill-broadcast (game.js:34706),
  loot-titan-belt (src/data/items.json:2870 — item name, regex
  over-capture; class it as loot, not titan), hunt-herald
  (villager-objectives.js:1067), field-maul + field-kill
  (fieldFights.js:2841,2844), raid-bedroll (havenGrowth.js:761),
  gossip-herald (havenGrowth.js:469), gavel-strike-cite
  (titans.js — Gavel verdict citing the strike), counter-learned
  (game.js), codex-herald-dead + party-kill-herald +
  fireside-kill-confession (game.js — the kill-day triad),
  nielsen-stirs (generalize herald-stirs to any titan title —
  "You turn to leave — behind you, The Nielsen stirs."),
  stare-down-herald (game.js — "X stared down the Herald and it
  backed off").
  Scratch check (read-only, /tmp, NOT a re-score): these 19
  patterns cover 133/133 unclassified lines in the pilot corpus
  (gorge 54, gorge-empty 8, aid-door 17, gossip-herald 11,
  field-maul 10, pads-in 4, counter-learned 4, codex-herald-dead
  4, party-kill-herald 4, fireside-kill-confession 4,
  gavel-strike-cite 3, raid-bedroll 2, field-kill 2, moved-cue 1,
  hunt-herald 1, veteran-kill-broadcast 1, loot-titan-belt 1,
  nielsen-stirs 1, stare-down-herald 1). The verdict stands
  NO-GO because the bar binds the pre-registered classifier; the
  next run starts from a classifier verified against this corpus.
- **The dawn miss:** the 3 unclassified dawn events are all
  strike-trust with delta 0 — the struck link was already at
  trust 0 (verified: trustBefore 0, titan history entry present,
  e.g. 190324 d125 "THE HERALD struck Emberhold in the night —
  trust −5"). The classifier's clamp tolerance [-5,-1] excludes
  the already-zero case. Proposed rule for the next run: accept
  delta 0 when trustBefore === 0 and a 'titan' history entry
  exists.
- **What the miss does NOT touch:** the census numbers for
  metrics 1–7, 9, 10 do not depend on say classes; the
  startCombat / fieldFight / dawn-effect / outcome counts are
  complete and reconciled (71 strikes, 226 refusals, 17 field
  fights, HP arithmetic closing exactly on every seed).
- **Metric that proved wrong:** the say-line GO row assumed the
  titan's narration lives in the titan system. It doesn't — the
  Herald is narrated by a dozen systems. Any future titan census
  must enumerate from the corpus, not from one file.

## Next blanks

- Finale + Network: never seen in this band (no national, no
  table). The apocalypse side of the census is still blank — it
  needs a band that reaches national+, or a policy that drives
  standing harder than competent.
- The Nielsen: placed on 3 seeds but never met, never fought, 4
  strikes observed. Its fight shape is unmeasured.
- A muster fight has never been observed in any arm's pilot under
  competent play (0 titan tbEnds across titangate-a, titanroute-a,
  and this band). The muster path is proven only in fixtures.
- The classifier revision above needs a fresh band to confirm
  (the scratch check is not a verdict).

## Findings

- Speaks to (already open, not re-appended): "HERALD RE-FIGHT
  SPAM" (sim-spawncensus-a) — answered: 226/226 refusals, 0
  fights; "TITAN STRIKES JUMP WHEN THE DRIVE ANSWERS"
  (sim-answermail-drive-a) — second mechanism found (trust
  strikes silently abort with no allied links); "HERALD REFUSAL
  LINE REPEATS ~15 TIMES IN TWO DAYS" (sim-binddiag-b, 2026-11-08)
  — measured: max 16 in ONE day, byte-identical, no cooldown.
- Speaks to (already open): the relayfirst-a field-kill-no-slain
  item — independently confirmed on 4/8 seeds this band.
- Appended to sim-findings.md (4 lines): palisade stakes explain
  the herald HP drop (closes the sim-mustercall-b open item);
  the lingering gorge eats more than the titan's strikes;
  trust strikes silently abort with no allied links; pantry raids
  mostly take 0 kcal.

## Run record

- Run: fleshout-loop-20261111T1115Z, Loop A. Arm sim-titanfirst-a.
  Coverage Program Tier 2 (Steve order 2026-11-10 "Measure all").
- Base commit b09cf584e. Prereg:
  evidence/2026-11-11/sim-titanfirst-a-prereg.md (commit eabfca1cf),
  Amendment 1 (commit f01293638, smoke-driven, before any judged
  sim — see below).
- Instrument + driver + analyzer + proof: commit 12e10d1f8 (proof
  96/96); Amendment 1 fixes: commit f01293638 (proof 113/113).
- Pilot: 16 runs (8 control + 8 neutral), 150-day death-aware
  horizon, seeds 190321–190328, ~61 min wall, exit 0, 0 errors
  everywhere. Corpus:
  evidence/2026-11-11/perseed-titanfirst-a/ (16 files). Summary:
  evidence/2026-11-11/titanfirst-summary-titanfirst-pilot.json.
- Policies: competent verbatim, two legs (control instrument ON,
  neutral instrument OFF). No src/js change.
- Canon: NO dedicated titan/herald canon doc exists (CANON.md has
  no titan row); the in-code sources are src/data/titans.json
  (Steve 2026-10-11/12 header) and src/js/titans.js, plus the prior
  arms (titangate-a Nov 1, titanroute-a + titanghost-a Nov 2).

### Amendment 1 (smoke-driven, before any judged sim)

One single-seed smoke run (190321, control, RUN=smoke, never judged)
confirmed the instrument end to end and surfaced four refinements,
fixed before any judged data existed (the titangate-a Amendment 1
pattern). The smoke file was DELETED before the judged pilot; the
pilot re-ran all 8 seeds fresh, including 190321.

- Say-regex leaks: bare 'omen' matched 'moment' in a dozen
  unrelated lines; bare 'finale' matched 'SEASON FINALE'
  announcements. Fixed: \bomen\b, \bthe finale\b. The smoke's 116
  unclassified say lines were ALL such leaks, 0 of them titan lines.
- Omen lines carry no keyword: the data-driven omen0 texts contain
  no titan/herald/nielsen/finale/omen/muster word. Fixed: the regex
  also matches the 🔭/📻 prefixes (pulling in exactly two
  other-system say lines — the 🔭 scouting line, game.js:7593; the
  📻 pellet line, game.js:25117 — both classified with cited
  classes). The omen1 classifier matches on the 📻 prefix plus a
  titan title.
- New say classes from the smoke: herald-stirs / herald-here /
  herald-treeline (the placed titan follows and paces the scholar),
  herald-pack / raid-herald / raid-herald-unmet (the placed titan
  JOINS pantry raids as a raider), muster-scout (the SHELTER muster,
  a different muster from the titan coalition).
- Strike-trust clamp: a link at trust 3 loses 3, not 5 (trust clamps
  at 0). The dawn classifier accepts strike-trust deltas in [-5,-1]
  and muster-hunger deltas in [-2,-1] with a titan history entry.
- fieldFight instance captured pre-call (was post-call).
- Smoke finding (not a fix): 9 of the smoke's 10 pantry-raid lines
  read '0 kcal gone from your stores' — the scholar's pack held no
  finished food, so the raid took nothing.

### Smoke-seed observations (190321, NOT judged data — for context only)

The smoke seed survived 150 days, reached wave 4 + regional, and
produced live titan activity: herald placed day 61, nielsen placed
day 139; 31 startCombat calls, ALL refused (one herald instance,
31 refusals, max 9 in a day); 0 titan tbEnds; 3 villager field
fights vs the herald (2 vFlee, 1 vKill — a villager killed the
herald on day 146, and the outcome log never recorded 'slain');
the herald's HP fell 700 → 14 across the run, with raid nights
accounting for the three big drops (-175 per raid night, days 76 /
87 / 143) and field fights for the rest; 21 strike lines (10
pantry, 11 trust) on the every-5-days cadence from the placed day.
These numbers are NOT the pilot's numbers — the pilot re-ran the
seed fresh — but they shaped Amendment 1 and the questions the
pilot answers. The judged pilot reproduces the smoke's game
numbers exactly on 190321 (150d, 31 refusals, 3 field fights, 2
spawns, 82 deaths), confirming the smoke was a true preview.
