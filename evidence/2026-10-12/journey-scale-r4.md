# Journey leg: SCALE (days 80–140) — 2026-10-12 r4

Run 4 of the refocused village-journey sim loop. Worktree `journey-scale-r4`
(oversight-playtest-loop play-pass). Main tree untouched; no commits by this
agent (harness tooling edit left uncommitted for the coordinator to review).

## Method

Harness `scripts/test-journey-scale-20261012.js` (competent policy + LEAD-road
courtship, exile-aware logging, seeded RNG before eval). Canon read first:
CANON.md, SCALE.md. Nine seeds, sequential (never parallel):

- `ROAD=lead SEEDS=10101,20202,30303,40404,50505,60606 DAYCAP=140 CONVODAYS=85,95,105,115,125,135`
- `ROAD=covenant SEEDS=11111 DAYCAP=140`
- `ROAD=trade SEEDS=22222 DAYCAP=140`
- `ROAD=lead REFUSE=1 SEEDS=33333 DAYCAP=140` (refuse-the-scale probe)

Harness change this run (worktree only, UNCOMMITTED): `PANTRYTRACE=1` env flag
— prints daily pantry/pop/hungryDays/scholarKcal to diagnose early deaths.
Used for the seed-11111 autopsy.

## Runs at a glance

| seed | road | died day | cause | max scale | max wave | notes |
|------|------|----------|-------|-----------|----------|-------|
| 10101 | lead | 71 | combat | regional (day 46) | 2 | 3 links; Ashford foreign 4-realm day 47 |
| 20202 | lead | 119 | combat | regional (day 47) | 3 | longest; links broke day 71, re-courted via counters + 2 new; opinions −24…−27 |
| 30303 | lead | 114 | combat | regional (day 47) | 3 | Stonebridge foreign 6-realm day 49; 2 declines, 1 counter |
| 40404 | lead | 32 | starvation | village | 2 | — |
| 50505 | lead | 20 | combat | village | 1 | — |
| 60606 | lead | 34 | starvation | village | 2 | 2 links formed |
| 11111 | covenant | 16 | scattering/starvation | village | 1 | 0 fights; pantry 40,036→0 by day 11 |
| 22222 | trade | 21 | combat | village | 2 | — |
| 33333 | lead+REFUSE | 52 | combat | regional (day 47) | 3 | Haven subordinate link (trust 40); REFUSE never staged |

**Zero of 9 seeds reached day 140. Zero reached national. Zero staged a
national beat. Zero staged a global beat.**

## Village assessment (plain words)

**Seed 20202 (lead — the fullest journey, died day 119, combat).** The scholar
courted three fires by day 27 (Emberhold, Stonebridge, Thornfield; gestures
played, trusts 14–24), the Regional Dawn came day 47, and the pantry climbed
past 39k kcal with ~13k preserved by day 61. Wave 3 arrived day 64. Then the
seams tore: all three links snapped on day 71 (trust under 20 + 14-day
neglect, no tribute kept — the mourning haircuts from leader deaths kept
landing). The scholar re-courted all three through played counters (days
72–75, counters accepted, tribute paid) and bonded two more fires (The Hungry
Road, II — days 76/79). But the food engine was failing: from day 80 the
pantry flatlined near zero, preserved stores were gone, population slid 5→4→3
→2→1 as people died in wave-3 fights and hunger, and on day 92 three demands
were refused aloud (nothing to pay with). Opinions of Haven sat at −24 to −27.
The last bearer died in combat on day 119 with one link left, broken and
unrepaired. Nobody leads anything; the network outlived the people in it.

**Seed 30303 (lead — died day 114, combat).** Three links by day 27, Dawn day
47, pantry ~34k with ~10k preserved at the wave-3 turn (day 55). The courtship
never stabilized: Thornfield declined day 81, Emberhold declined day 97; the
village re-linked the same fires under NEW link ids (seasoning clock reset).
Off-screen, Stonebridge built a 6-fire foreign realm by day 49 — the BELONG
precondition existed in the region, and Haven's opinions with them sat at
−11/−12, unpursued by the LEAD-road driver. Population 8→5→4→3→2→0 as wave-3
fights (22 fights, 45 strikes) ground them down. Knowledge was the widest of
the run: 31 plants, 15 skills, 17 monsters, 18 counters.

**Seed 10101 (lead — died day 71, combat).** Three links (Stonebridge,
Ashford, Emberhold), Dawn day 46. Ashford quietly bound a 4-fire realm of its
own on day 47 while linked to Haven as a peer (opinion 17) — a foreign 4-realm
Haven could have belonged to; the driver didn't. The pantry went 23k→0
between days 57–69; the village starved out the same week the links frayed.
Died fighting on day 71.

**Seed 33333 (lead + REFUSE probe — died day 52, combat).** Reached regional
day 47. Held two courtship links plus a subordinate link to a foreign fire
(trust 40). Wave 3 arrived day 50; the village was down to 1 person by day
50 and died fighting on day 52. `pendingNational` never staged, so the REFUSE
probe never fired — the refusal beat is still unplayed in-run.

**Seeds 40404/50505/60606/22222 (died days 20–34).** Two starvation, two
combat. None courted anything. Their scholar died before the region even
formed — scale content is entirely gated on surviving the first month.

**Seed 11111 (covenant road — died day 16).** The autopsy seed. PANTRYTRACE:
day 1 pantry 40,036 kcal → day 10: 200 → day 11: 0, hungryDays=1 → day 13:
pop 11 → day 15: pop 7, hungryDays=2 → day 16: GAME OVER (scattering), 0
fights, 6 villagers still alive. The competent policy burned the starting
pantry in 10 days with ~zero forage inflow. This is the act-0 food
production floor, not a scale mechanic — but it killed the covenant probe
before day 25 courtship and all four early-death seeds before day 35.

## People check — 7 full transcripts read, sense-tested

**Verdict: villagers act like people. Grief, memory, and obligation are real.**

- **20202-day85 (Lena, ask_favor pantry run, trust 90):** opens "About the
  pantry run — still need hands. Are you in?" Player commits ("Count me in"
  → resolution=promised), then pivots to grief about James ("I keep
  expecting to see James at the fire. Stupid."). Six exchanges of real
  listening; she resolves herself ("Anyway — I should get back to it"),
  closing "Alright. Back to work." The pantry-run promise stays open and
  owed — the want didn't evaporate.
- **20202-day95 (Lena, debt with Sofia):** betrayal hook plants in the opening
  menu ("Walk with me? I want another pair of eyes on something") and is left
  unpulled — planted thread, fine. She names the food crisis honestly:
  "Another day like today and we're choosing who eats." Memory continuity
  works: on the same grief question she answers "Huh. I answered that once —
  back when the answer was simpler," then mourns Sofia (dead since day 85's
  James). resolution=stated (favor stated, not promised). Closing "Good.
  We've got a plan forming. I can feel it." Fits.
- **20202-day105 (Emma, wound favor):** "About this wound — I still haven't
  found anyone. Any chance? Thank you. Really." Player commits; she teaches
  Mayapple in return. Real exchange economy.
- **20202-day115 (Emma, same wound, 10 days later):** "I hate to ask twice,
  but it's still open. Will you?" — the engine remembered the unkept favor
  and has her ask again, honestly, without melodrama. Player commits again,
  teaches Sugar Maple. This is a person keeping a ledger, not a quest giver.
- **30303-day85 (Lena, curiosity):** "What's the kindest thing someone's done
  for you out here?" Player answers; she affirms ("Quiet generosity. It's
  holding this whole thing together"), gossip surfaces ("People are talking
  about Sofia. Take it for what it's worth."). resolution=engaged. Human,
  if unhurried.
- **30303-day95 (Lena, gossip):** "Did you hear? James just walked away from
  Haven. Didn't look back. Simple as that." — CHECKED, NOT A BUG: James
  later (day 105) says "Yeah, that was me. I walked away from Haven once.
  Didn't look back." Past tense, at the fire — he left and came back
  ('departure' + 'return' gossip actions; the self-gossip first-person fix
  from journey-deepening is working). "Simple as that" is gossip distortion,
  per canon.
- **30303-day105 (James, wound favor, grieving):** "I asked David about this
  wound — David's gone. Still need hands. Are you in?" The dead are carried
  into the present tense. Player commits, teaches three plants, he eases:
  "Talking helps. A little. Thank you." resolution=promised.

Minor smell (not a bug): identical driver inputs produce identical
mood-beat lines across NPCs — "Something eases in their shoulders. They're
really talking to you now." (convo-mood.js:155, 'up:warm' pool, 2 lines)
appeared for both Emma (20202-day115) and James (30303-day105); "The ease
drains out of it, a little." (convo-mood.js:174, 'down:friendly' pool, 1
line) for both 30303-day85 and day95. Pools are per-person cycled but shared
across NPCs with 1–2 entries — a real player reading many transcripts will
feel the template. Proposed: widen the smallest pools to 4+ variants
(no code change applied — coordinator's call).

**r3 blank #5 (endConvo "glad we talked" after an empty conversation):
VERIFIED FIXED on master.** The string is gone from src/js entirely; all 7
transcripts end on contextual exit-pool lines ("Alright. Back to work.",
"Don't be a stranger.", "Good talk.", "Talking helps. A little. Thank you.")
and the want-closing beat.

## Blanks

1. **National never stages in-run — 0 national beats across r3+r4 (13 runs).**
   Mechanics: (a) the rung gate needs regional ≥30 days (earliest national
   ~day 76–78); (b) LEAD needs 3 seasoned links (30+ days old, trust 40+).
   Observed: links snap at day 70–90 (trust<20 + 14-day neglect, succession
   haircuts −8, tribute shortfalls when the pantry is empty); re-linking
   creates a NEW link id, RESETTING the 30-day clock; opinions crater to
   −24…−27 on decline/refusal spirals, making re-courtship harder each time.
   The design gates are sound (Steve's "don't weaken the definitions"), but
   the combination of link fragility + clock reset + opinion spirals means a
   competent run can hold 3 links for 46 days (20202) and still never season
   one. DOCUMENTED, not fixed — lever/tuning territory for the longsim loop.
2. **BELONG precondition exists but the road is unwalked.** Foreign 4+-fire
   realms formed off-screen in 10101 (Ashford, 4 fires, day 47) and 30303
   (Stonebridge, 6 fires, day 49) — engagement-driven foreign-polity growth
   WORKS. Haven wasn't a valued subordinate in either (peer/no link). The
   Belong beat has never been played in-run by any loop run on record.
3. **Covenant/trade content unplayed.** The road probes died pre-courtship
   (day 16/21). Defense calls (15%/wk on covenant links), trade help
   requests (12%/wk), covenant crises, the Founding Council, the Charter,
   league pool draws, tariff income — zero in-run plays across r3+r4.
4. **REFUSE-the-scale beat unplayed.** pendingNational never staged, so the
   REFUSE=1 probe never answered anything. The whole refused-scale economy
   (no ×1.25 logistics, no table, wave 5 locked at regional) has never been
   played.
5. **Early-death seeds can't test the leg** (4/9 died before day 35; 11111's
   autopsy shows the competent policy starving a 40k-kcal pantry in 10
   days). Act-0/establishment-leg territory, but it contaminates scale-leg
   reachability measurement: the scale sample is really 5 seeds, not 9.

## Verdict: reachable / fun / winnable

- **Reachable: PARTIAL.** Courtship → links → Regional Dawn is reachable
  (4 of 5 seeds that survived to day 40 reached regional on days 46–48, with
  played gestures and accords). National is reachable in principle but
  UNREACHED in 13 runs across r3+r4 — the rung gate + seasoning bar + link
  fragility + re-link clock reset combine into a wall. Global/table: no
  evidence either way. The covenant/trade/belong/conquest/refuse roads are
  code-complete but play-untested.
- **Fun: YES, where it plays.** The conversation system remains the bar
  (Emma's wound ledger across 10 days; Lena's grief memory). Courtship is
  played and legible (counters with real terms, declines that name the climb
  verb). The scale machinery (foreign polities growing, opinions moving,
  demands arriving, links snapping aloud) reads as a living region, not a
  spreadsheet.
- **Winnable: the leg resolves honestly but the arc doesn't close.**
  Deaths are legible (starvation cascades, combat attrition, the scattering
  itself). But no run has ever walked a national beat, so the scale leg's
  win condition is untested — the competent player dies at the regional
  rung, usually around day 70–120, usually to wave-3 attrition plus an empty
  pantry. The food wall (r3's binding constraint) still binds: it just moved
  from day 39–57 to day 70–119 as the exile blocker got fixed.

## Files

- This note: `evidence/2026-10-12/journey-scale-r4.md`
- Censuses: `evidence/2026-10-12/journey-scale-r4-{10101,20202,30303,40404,50505,60606,11111,22222,33333}.json`
- Transcripts: `/tmp/journey-scale-transcript-{20202-day85,20202-day95,20202-day105,20202-day115,30303-day85,30303-day95,30303-day105}.txt`
- Harness (uncommitted worktree edit): `scripts/test-journey-scale-20261012.js`
  — added `PANTRYTRACE=1` env flag (daily pantry/pop/hungryDays/scholar trace
  for early-death autopsy). Coordinator: keep or drop.
